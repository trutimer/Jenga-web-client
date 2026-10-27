import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

export interface OutboxItem {
  id: string
  branch_id: string
  action_type: 'SHIFT_OPEN' | 'SHIFT_CLOSE' | 'MONEY_MOVEMENT' | 'SALE' | 'CUSTOMER_PAYMENT'
  endpoint: string
  method: string
  payload: string
  idempotency_key: string
  sequence_num?: number
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'COMPLETED'
  attempts: number
  last_error?: string | null
  created_at: number
  updated_at: number
}

let dbInstance: Database.Database | null = null

export function getDB(): Database.Database {
  if (dbInstance) return dbInstance

  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }

  const dbPath = join(userDataPath, 'dukapro_offline.db')
  console.log('[SQLite DB] Initializing offline database at:', dbPath)

  dbInstance = new Database(dbPath)
  dbInstance.pragma('journal_mode = WAL')
  dbInstance.pragma('foreign_keys = ON')

  initTables(dbInstance)
  return dbInstance
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS branch_products (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      name TEXT NOT NULL,
      barcode TEXT,
      category TEXT,
      cost REAL,
      price REAL,
      stock REAL,
      min_stock REAL,
      raw_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_branch ON branch_products(branch_id);
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON branch_products(barcode);

    CREATE TABLE IF NOT EXISTS branch_customers (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      phone TEXT,
      raw_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_customers_branch ON branch_customers(branch_id);

    CREATE TABLE IF NOT EXISTS cached_auth (
      user_id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      token TEXT NOT NULL,
      user_json TEXT NOT NULL,
      password_hash TEXT,
      password_salt TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS active_shifts (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      cashier_id TEXT NOT NULL,
      opening_cash REAL NOT NULL,
      expected_cash REAL NOT NULL,
      actual_cash REAL,
      total_sales REAL DEFAULT 0,
      status TEXT NOT NULL,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      raw_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_shifts_branch_cashier ON active_shifts(branch_id, cashier_id);

    CREATE TABLE IF NOT EXISTS money_movements (
      id TEXT PRIMARY KEY,
      shift_id TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      reason TEXT,
      raw_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      payload TEXT NOT NULL,
      idempotency_key TEXT UNIQUE NOT NULL,
      sequence_num INTEGER,
      status TEXT NOT NULL DEFAULT 'PENDING',
      attempts INTEGER DEFAULT 0,
      last_error TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outbox_branch_status ON sync_outbox(branch_id, status);
  `)

  try {
    db.exec(`ALTER TABLE cached_auth ADD COLUMN password_hash TEXT;`)
  } catch (_) {}
  try {
    db.exec(`ALTER TABLE cached_auth ADD COLUMN password_salt TEXT;`)
  } catch (_) {}

  try {
    // Self-healing outbox reconciliation on database initialization
    const now = Date.now()
    // 1. Resolve duplicates to COMPLETED
    db.prepare(`
      UPDATE sync_outbox
      SET status = 'COMPLETED', last_error = 'Resolved: Record already exists on server', updated_at = ?
      WHERE status != 'COMPLETED' AND (
        last_error LIKE '%duplicate%' 
        OR last_error LIKE '%already exists%' 
        OR last_error LIKE '%already recorded%'
        OR last_error LIKE '%unique constraint%'
        OR last_error LIKE '%already processed%'
      )
    `).run(now)

    // 2. Reset zombie SYNCING items left over from crashes or shutdowns
    db.prepare(`
      UPDATE sync_outbox
      SET status = 'PENDING', updated_at = ?
      WHERE status = 'SYNCING'
    `).run(now)

    // 3. Prune unrecoverable dead client errors
    db.prepare(`
      DELETE FROM sync_outbox
      WHERE status = 'FAILED' AND (
        attempts >= 10 
        OR last_error LIKE 'Client Error 4%'
        OR last_error LIKE 'Security Violation%'
      )
    `).run()

    // 4. Prune completed outbox records older than 7 days
    db.prepare(`
      DELETE FROM sync_outbox
      WHERE status = 'COMPLETED' AND updated_at < ?
    `).run(now - 7 * 24 * 60 * 60 * 1000)
  } catch (_) {}
}

// ----------------- Product Caching & Querying ----------------- //

export function saveBranchProducts(branchId: string, products: any[], clearExisting: boolean = false) {
  const db = getDB()
  const deleteStmt = db.prepare('DELETE FROM branch_products WHERE branch_id = ?')
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO branch_products (id, branch_id, name, barcode, category, cost, price, stock, min_stock, raw_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const now = Date.now()
  const transaction = db.transaction((prods: any[]) => {
    if (clearExisting) {
      deleteStmt.run(branchId)
    }
    for (const p of prods) {
      insertStmt.run(
        p.id,
        branchId,
        p.name || '',
        p.barcode || '',
        p.category || '',
        p.cost || 0,
        p.price || 0,
        p.stock || 0,
        p.minStock || 0,
        JSON.stringify(p),
        now
      )
    }
  })

  transaction(products)
}

export function getBranchProducts(branchId: string): any[] {
  const db = getDB()
  const rows = db.prepare('SELECT raw_json FROM branch_products WHERE branch_id = ? ORDER BY name ASC').all(branchId) as { raw_json: string }[]
  return rows.map(r => JSON.parse(r.raw_json))
}

export function getPaginatedBranchProducts(branchId: string, page: number = 0, size: number = 50, search?: string) {
  const db = getDB()
  const offset = page * size
  let query = 'SELECT raw_json FROM branch_products WHERE branch_id = ?'
  let countQuery = 'SELECT COUNT(*) as count FROM branch_products WHERE branch_id = ?'
  const params: any[] = [branchId]

  if (search && search.trim() !== '') {
    query += ' AND (name LIKE ? OR barcode LIKE ? OR category LIKE ?)'
    countQuery += ' AND (name LIKE ? OR barcode LIKE ? OR category LIKE ?)'
    const s = `%${search.trim()}%`
    params.push(s, s, s)
  }

  const countRow = db.prepare(countQuery).get(...params) as { count: number }
  const totalElements = countRow ? countRow.count : 0

  query += ' ORDER BY name ASC LIMIT ? OFFSET ?'
  const rows = db.prepare(query).all(...params, size, offset) as { raw_json: string }[]
  const content = rows.map(r => JSON.parse(r.raw_json))
  const totalPages = Math.ceil(totalElements / size) || 1

  return {
    content,
    totalElements,
    totalPages,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0
  }
}


export function updateLocalProductStock(branchId: string, productId: string, qtyDelta: number) {
  const db = getDB()
  const row = db.prepare('SELECT raw_json FROM branch_products WHERE id = ? AND branch_id = ?').get(productId, branchId) as { raw_json: string } | undefined
  if (row) {
    const prod = JSON.parse(row.raw_json)
    prod.stock = Math.max(0, (prod.stock || 0) - qtyDelta)
    db.prepare('UPDATE branch_products SET stock = ?, raw_json = ? WHERE id = ? AND branch_id = ?').run(
      prod.stock,
      JSON.stringify(prod),
      productId,
      branchId
    )
  }
}

// ----------------- Customer Caching & Querying ----------------- //

export function saveBranchCustomers(branchId: string, customers: any[]) {
  const db = getDB()
  const deleteStmt = db.prepare('DELETE FROM branch_customers WHERE branch_id = ?')
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO branch_customers (id, branch_id, display_name, phone, raw_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const now = Date.now()
  const transaction = db.transaction((custs: any[]) => {
    deleteStmt.run(branchId)
    for (const c of custs) {
      insertStmt.run(
        c.id,
        branchId,
        c.displayName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.companyName || 'Customer',
        c.phone || '',
        JSON.stringify(c),
        now
      )
    }
  })

  transaction(customers)
}

export function getBranchCustomers(branchId: string): any[] {
  const db = getDB()
  const rows = db.prepare('SELECT raw_json FROM branch_customers WHERE branch_id = ?').all(branchId) as { raw_json: string }[]
  return rows.map(r => JSON.parse(r.raw_json))
}

// ----------------- Auth Caching & Verification ----------------- //

function getIdentifierVariants(identifier: string): string[] {
  const clean = (identifier || '').trim()
  if (!clean) return []
  const variants = new Set<string>([clean, clean.toLowerCase()])
  const digits = clean.replace(/\D/g, '')
  if (digits) {
    variants.add(digits)
    if (digits.startsWith('255') && digits.length === 12) {
      variants.add('0' + digits.slice(3))
      variants.add('+' + digits)
      variants.add(digits.slice(3))
    } else if (digits.startsWith('0') && digits.length === 10) {
      variants.add(digits.slice(1))
      variants.add('255' + digits.slice(1))
      variants.add('+255' + digits.slice(1))
    } else if (digits.length === 9) {
      variants.add('0' + digits)
      variants.add('255' + digits)
      variants.add('+255' + digits)
    }
  }
  return Array.from(variants)
}

export function cacheUserAuth(user: any, token: string, branchId: string, passwordHash?: string | null, passwordSalt?: string | null) {
  const db = getDB()
  const effectiveBranchId = branchId || user.branchId || user.storeBranchId || ''
  db.prepare(`
    INSERT OR REPLACE INTO cached_auth (user_id, branch_id, email, phone, token, user_json, password_hash, password_salt, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    effectiveBranchId,
    user.email || '',
    user.phone || '',
    token,
    JSON.stringify(user),
    passwordHash || null,
    passwordSalt || null,
    Date.now()
  )
}

export function getCachedUserAuth(identifier: string, branchId?: string | null): { user: any; token: string; branchId: string; passwordHash: string | null; passwordSalt: string | null } | null {
  const db = getDB()
  const variants = getIdentifierVariants(identifier)
  if (variants.length === 0) return null

  const placeholders = variants.map(() => '?').join(', ')
  let row: { token: string; user_json: string; branch_id: string; password_hash: string | null; password_salt: string | null } | undefined

  if (branchId) {
    row = db.prepare(`
      SELECT token, user_json, branch_id, password_hash, password_salt FROM cached_auth
      WHERE branch_id = ? AND (email IN (${placeholders}) OR phone IN (${placeholders}) OR user_id IN (${placeholders}))
      ORDER BY updated_at DESC LIMIT 1
    `).get(branchId, ...variants, ...variants, ...variants) as any
  }

  if (!row) {
    row = db.prepare(`
      SELECT token, user_json, branch_id, password_hash, password_salt FROM cached_auth
      WHERE email IN (${placeholders}) OR phone IN (${placeholders}) OR user_id IN (${placeholders})
      ORDER BY updated_at DESC LIMIT 1
    `).get(...variants, ...variants, ...variants) as any
  }

  if (!row) return null
  return {
    user: JSON.parse(row.user_json),
    token: row.token,
    branchId: row.branch_id,
    passwordHash: row.password_hash || null,
    passwordSalt: row.password_salt || null
  }
}

// ----------------- Active Shifts & Movements ----------------- //

export function saveActiveShift(shift: any) {
  const db = getDB()
  const branchId = shift.branchId || shift.branch_id || shift.storeBranchId || ''
  const cashierId = shift.cashierId || shift.cashier_id || shift.userId || shift.user?.id || ''
  const shiftId = shift.id || `shift-${cashierId}-${Date.now()}`

  db.prepare(`
    INSERT OR REPLACE INTO active_shifts (id, branch_id, cashier_id, opening_cash, expected_cash, actual_cash, total_sales, status, opened_at, closed_at, raw_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    shiftId,
    branchId,
    cashierId,
    shift.openingCash || shift.opening_cash || 0,
    shift.expectedCash || shift.expected_cash || 0,
    shift.actualCash || shift.actual_cash || null,
    shift.totalSales || shift.total_sales || 0,
    shift.status || 'OPEN',
    shift.openedAt || shift.opened_at || new Date().toISOString(),
    shift.closedAt || shift.closed_at || null,
    JSON.stringify(shift),
    Date.now()
  )

  // Ensure cached_auth has the updated branch_id for this cashier
  if (branchId && cashierId) {
    try {
      db.prepare(`
        UPDATE cached_auth SET branch_id = ? WHERE user_id = ? AND (branch_id = '' OR branch_id IS NULL OR branch_id != ?)
      `).run(branchId, cashierId, branchId)
    } catch (e) {
      console.warn('[SQLite DB] Failed to sync branch_id to cached_auth:', e)
    }
  }
}

export function clearActiveShifts(branchId?: string | null, cashierId?: string | null) {
  const db = getDB()
  if (branchId && cashierId) {
    db.prepare(`
      DELETE FROM active_shifts
      WHERE (branch_id = ? OR branch_id = '') AND cashier_id = ?
    `).run(branchId, cashierId)
  } else if (cashierId) {
    db.prepare(`
      DELETE FROM active_shifts
      WHERE cashier_id = ?
    `).run(cashierId)
  }
}

export function getActiveShift(branchId?: string | null, cashierId?: string | null): any | null {
  const db = getDB()
  let row: { raw_json: string } | undefined

  if (branchId && cashierId) {
    row = db.prepare(`
      SELECT raw_json FROM active_shifts
      WHERE (branch_id = ? OR branch_id = '') AND cashier_id = ? AND status = 'OPEN'
      ORDER BY opened_at DESC LIMIT 1
    `).get(branchId, cashierId) as { raw_json: string } | undefined

    if (!row) {
      // Fallback: search by cashierId alone if branchId does not match exactly
      row = db.prepare(`
        SELECT raw_json FROM active_shifts
        WHERE cashier_id = ? AND status = 'OPEN'
        ORDER BY opened_at DESC LIMIT 1
      `).get(cashierId) as { raw_json: string } | undefined
    }
  } else if (cashierId) {
    row = db.prepare(`
      SELECT raw_json FROM active_shifts
      WHERE cashier_id = ? AND status = 'OPEN'
      ORDER BY opened_at DESC LIMIT 1
    `).get(cashierId) as { raw_json: string } | undefined
  } else if (branchId) {
    row = db.prepare(`
      SELECT raw_json FROM active_shifts
      WHERE branch_id = ? AND status = 'OPEN'
      ORDER BY opened_at DESC LIMIT 1
    `).get(branchId) as { raw_json: string } | undefined
  }

  return row ? JSON.parse(row.raw_json) : null
}

export function recordMoneyMovement(movement: any) {
  const db = getDB()
  db.prepare(`
    INSERT INTO money_movements (id, shift_id, branch_id, type, amount, reason, raw_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    movement.id,
    movement.shiftId || '',
    movement.branchId || '',
    movement.type,
    movement.amount,
    movement.reason || '',
    JSON.stringify(movement),
    Date.now()
  )

  // Update expected cash on local shift
  if (movement.shiftId) {
    const shift = getActiveShift(movement.branchId, movement.performedById || '')
    if (shift) {
      if (movement.type === 'CASH_IN') {
        shift.expectedCash = (shift.expectedCash || 0) + movement.amount
      } else if (movement.type === 'CASH_OUT') {
        shift.expectedCash = (shift.expectedCash || 0) - movement.amount
      }
      saveActiveShift(shift)
    }
  }
}

// ----------------- Outbox Sync Queue ----------------- //

export function enqueueOutboxItem(item: Omit<OutboxItem, 'attempts' | 'status' | 'created_at' | 'updated_at'>): OutboxItem {
  const db = getDB()
  const now = Date.now()

  db.prepare(`
    INSERT INTO sync_outbox (id, branch_id, action_type, endpoint, method, payload, idempotency_key, status, attempts, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 0, ?, ?)
  `).run(
    item.id,
    item.branch_id,
    item.action_type,
    item.endpoint,
    item.method,
    item.payload,
    item.idempotency_key,
    now,
    now
  )

  return getOutboxItemById(item.id)!
}

export function getOutboxItemById(id: string): OutboxItem | null {
  const db = getDB()
  return (db.prepare('SELECT * FROM sync_outbox WHERE id = ?').get(id) as OutboxItem) || null
}

export function getPendingOutboxItems(branchId?: string, limit: number = 20): OutboxItem[] {
  const db = getDB()
  const now = Date.now()

  // Auto-recover zombie SYNCING items older than 60 seconds
  try {
    db.prepare(`UPDATE sync_outbox SET status = 'PENDING', updated_at = ? WHERE status = 'SYNCING' AND updated_at < ?`).run(now, now - 60000)
  } catch (_) {}

  // Select truly retryable items (attempts < 5, excluding permanent client validation/security errors)
  if (branchId) {
    return db.prepare(`
      SELECT * FROM sync_outbox
      WHERE branch_id = ? 
        AND status IN ('PENDING', 'FAILED') 
        AND attempts < 5
        AND (last_error IS NULL OR NOT (last_error LIKE 'Client Error 4%' OR last_error LIKE 'Security Violation%'))
      ORDER BY rowid ASC LIMIT ?
    `).all(branchId, limit) as OutboxItem[]
  } else {
    return db.prepare(`
      SELECT * FROM sync_outbox
      WHERE status IN ('PENDING', 'FAILED') 
        AND attempts < 5
        AND (last_error IS NULL OR NOT (last_error LIKE 'Client Error 4%' OR last_error LIKE 'Security Violation%'))
      ORDER BY rowid ASC LIMIT ?
    `).all(limit) as OutboxItem[]
  }
}

export function updateOutboxItemStatus(id: string, status: 'PENDING' | 'SYNCING' | 'FAILED' | 'COMPLETED', errorMsg?: string) {
  const db = getDB()
  const now = Date.now()
  if (status === 'FAILED') {
    const isClientError = errorMsg && (errorMsg.startsWith('Client Error') || errorMsg.startsWith('Security Violation'))
    const currentAttempts = (db.prepare('SELECT attempts FROM sync_outbox WHERE id = ?').get(id) as { attempts?: number } | undefined)?.attempts || 0
    db.prepare(`
      UPDATE sync_outbox
      SET status = ?, attempts = ?, last_error = ?, updated_at = ?
      WHERE id = ?
    `).run(status, isClientError ? 10 : currentAttempts + 1, errorMsg || 'Unknown sync error', now, id)
  } else {
    db.prepare(`
      UPDATE sync_outbox
      SET status = ?, last_error = ?, updated_at = ?
      WHERE id = ?
    `).run(status, errorMsg || null, now, id)
  }
}

export function getOutboxStats(branchId?: string) {
  const db = getDB()
  const now = Date.now()
  const staleCutoff = now - 60000

  // Auto-recover zombie SYNCING items older than 60s
  try {
    db.prepare(`UPDATE sync_outbox SET status = 'PENDING', updated_at = ? WHERE status = 'SYNCING' AND updated_at < ?`).run(now, staleCutoff)
  } catch (_) {}

  // A pending item is strictly an item actively waiting to be pushed:
  // 1. status = 'PENDING'
  // 2. active 'SYNCING' in-flight (updated within last 60s)
  // 3. transient 'FAILED' retryable item (attempts < 3, NOT a permanent client validation/security error)
  const pendingFilter = `
    (status = 'PENDING')
    OR (status = 'SYNCING' AND updated_at >= ?)
    OR (status = 'FAILED' AND attempts < 3 AND (last_error IS NULL OR NOT (last_error LIKE 'Client Error 4%' OR last_error LIKE 'Security Violation%')))
  `

  if (branchId) {
    const pending = db.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE branch_id = ? AND (${pendingFilter})`).get(branchId, staleCutoff) as { count: number } | undefined
    const total = db.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE branch_id = ? AND status = 'COMPLETED'`).get(branchId) as { count: number } | undefined
    return { pendingCount: pending?.count || 0, totalCount: total?.count || 0 }
  } else {
    const pending = db.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE ${pendingFilter}`).get(staleCutoff) as { count: number } | undefined
    const total = db.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE status = 'COMPLETED'`).get() as { count: number } | undefined
    return { pendingCount: pending?.count || 0, totalCount: total?.count || 0 }
  }
}

export function reconcileAndCleanOutbox(branchId?: string): { resolvedDuplicates: number; resetZombies: number; prunedDead: number; prunedCompleted: number } {
  const db = getDB()
  const now = Date.now()

  // 1. Auto-resolve duplicate records (server returned "duplicate record already exists")
  // Since the record already exists on the server, mark as COMPLETED
  const resolveDuplicatesStmt = db.prepare(`
    UPDATE sync_outbox
    SET status = 'COMPLETED', last_error = 'Resolved: Record already exists on server', updated_at = ?
    WHERE status != 'COMPLETED' AND (
      last_error LIKE '%duplicate%' 
      OR last_error LIKE '%already exists%' 
      OR last_error LIKE '%already recorded%'
      OR last_error LIKE '%unique constraint%'
      OR last_error LIKE '%already processed%'
    )
  `)
  const dupResult = resolveDuplicatesStmt.run(now)

  // 2. Reset zombie SYNCING items
  const resetZombiesStmt = db.prepare(`
    UPDATE sync_outbox
    SET status = 'PENDING', updated_at = ?
    WHERE status = 'SYNCING'
  `)
  const zombieResult = resetZombiesStmt.run(now)

  // 3. Prune unrecoverable dead client validation errors
  const pruneDeadStmt = db.prepare(`
    DELETE FROM sync_outbox
    WHERE status = 'FAILED' AND (
      attempts >= 10 
      OR last_error LIKE 'Client Error 4%'
      OR last_error LIKE 'Security Violation%'
    )
  `)
  const deadResult = pruneDeadStmt.run()

  // 4. Prune completed outbox records older than 7 days
  const pruneCompletedStmt = db.prepare(`
    DELETE FROM sync_outbox
    WHERE status = 'COMPLETED' AND updated_at < ?
  `)
  const completedResult = pruneCompletedStmt.run(now - 7 * 24 * 60 * 60 * 1000)

  console.log(`[DB Outbox Reconcile] Duplicates resolved: ${dupResult.changes}, Zombies reset: ${zombieResult.changes}, Dead pruned: ${deadResult.changes}, Old completed pruned: ${completedResult.changes}`)

  return {
    resolvedDuplicates: dupResult.changes,
    resetZombies: zombieResult.changes,
    prunedDead: deadResult.changes,
    prunedCompleted: completedResult.changes
  }
}
