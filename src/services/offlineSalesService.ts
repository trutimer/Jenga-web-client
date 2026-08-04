import type { Transaction, CashierShift, CashMovement, Product, Customer } from '@/models/types'

export function isElectron(): boolean {
  return typeof window !== 'undefined' && (window as any).ipcRenderer !== undefined
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ------------ Product & Customer Offline Persistence ------------ //

export async function cacheBranchProducts(branchId: string, products: Product[]) {
  if (!isElectron() || !branchId) return
  try {
    await (window as any).ipcRenderer.invoke('db:save-products', { branchId, products })
  } catch (err) {
    console.error('[Offline Service] Failed to cache products in SQLite:', err)
  }
}

export async function getCachedBranchProducts(branchId: string): Promise<Product[]> {
  if (!isElectron() || !branchId) return []
  try {
    return await (window as any).ipcRenderer.invoke('db:get-products', { branchId })
  } catch (err) {
    console.error('[Offline Service] Failed to get products from SQLite:', err)
    return []
  }
}

export async function getCachedPaginatedProducts(branchId: string, page: number = 0, size: number = 50, search?: string) {
  if (!isElectron() || !branchId) return { content: [], totalElements: 0, totalPages: 0, number: 0, size, first: true, last: true, empty: true }
  try {
    return await (window as any).ipcRenderer.invoke('db:get-paginated-products', { branchId, page, size, search })
  } catch (err) {
    console.error('[Offline Service] Failed to get paginated products from SQLite:', err)
    return { content: [], totalElements: 0, totalPages: 0, number: 0, size, first: true, last: true, empty: true }
  }
}

export async function updateCachedStock(branchId: string, productId: string, qtyDelta: number) {
  if (!isElectron() || !branchId) return
  try {
    await (window as any).ipcRenderer.invoke('db:update-stock', { branchId, productId, qtyDelta })
  } catch (err) {
    console.error('[Offline Service] Failed to update product stock:', err)
  }
}

export async function cacheBranchCustomers(branchId: string, customers: Customer[]) {
  if (!isElectron() || !branchId) return
  try {
    await (window as any).ipcRenderer.invoke('db:save-customers', { branchId, customers })
  } catch (err) {
    console.error('[Offline Service] Failed to cache customers in SQLite:', err)
  }
}

export async function getCachedBranchCustomers(branchId: string): Promise<Customer[]> {
  if (!isElectron() || !branchId) return []
  try {
    return await (window as any).ipcRenderer.invoke('db:get-customers', { branchId })
  } catch (err) {
    console.error('[Offline Service] Failed to get customers from SQLite:', err)
    return []
  }
}

// ------------ Auth Persistence ------------ //

export async function cacheAuthCredentials(user: any, token: string, branchId: string) {
  if (!isElectron() || !branchId) return
  try {
    await (window as any).ipcRenderer.invoke('db:cache-auth', { user, token, branchId })
  } catch (err) {
    console.error('[Offline Service] Failed to cache auth credentials:', err)
  }
}

export async function getCachedAuth(identifier: string, branchId: string) {
  if (!isElectron() || !branchId) return null
  try {
    return await (window as any).ipcRenderer.invoke('db:get-cached-auth', { identifier, branchId })
  } catch (err) {
    console.error('[Offline Service] Failed to fetch cached auth:', err)
    return null
  }
}

// ------------ POS Checkout & Sales Outbox (1ms Local-First) ------------ //

export async function processOfflineSale(salePayload: any, branchId: string, token: string) {
  const saleId = salePayload.id || generateUUID()
  const idempotencyKey = `sale-${saleId}`
  const now = new Date().toISOString()

  let totalAmount = Number(salePayload.totalAmount || salePayload.total || 0)
  if (!totalAmount && salePayload.items && Array.isArray(salePayload.items)) {
    totalAmount = salePayload.items.reduce((sum: number, item: any) => {
      const price = item.unitPrice || item.product?.price || 0
      const qty = item.quantity || 1
      const discPct = item.discountPercent || 0
      return sum + (price * qty * (1 - discPct / 100))
    }, 0)
  }

  // 1. Decrement local product stock in SQLite in 0ms
  if (salePayload.items && Array.isArray(salePayload.items)) {
    for (const item of salePayload.items) {
      const pId = item.productId || item.product?.id
      if (pId) {
        try {
          await updateCachedStock(branchId, pId, item.quantity || 1)
        } catch (e) {}
      }
    }
  }

  // 2. Enqueue sale to Outbox in 0ms
  const outboxItem = {
    id: saleId,
    branch_id: branchId,
    action_type: 'SALE',
    endpoint: '/api/sales',
    method: 'POST',
    payload: JSON.stringify({ ...salePayload, id: saleId, totalAmount, _authToken: token }),
    idempotency_key: idempotencyKey
  }

  if (isElectron()) {
    try {
      await (window as any).ipcRenderer.invoke('db:enqueue-outbox', { item: outboxItem })
      await (window as any).ipcRenderer.invoke('sync:trigger-now')
    } catch (e) {
      console.warn('IPC invoke error during outbox enqueue:', e)
    }
  }

  return {
    ...salePayload,
    id: saleId,
    totalAmount,
    createdAt: now,
    offlineSaved: true,
    message: 'Sale completed in 0ms and queued for background sync'
  }
}

// ------------ Register Shifts Offline ------------ //

export async function processOfflineOpenShift(shiftPayload: Partial<CashierShift>, branchId: string, token: string) {
  const shiftId = shiftPayload.id || generateUUID()
  const shiftObj: CashierShift = {
    id: shiftId,
    storeId: shiftPayload.storeId || '',
    branchId: branchId,
    cashierId: shiftPayload.cashierId || localStorage.getItem('userId') || '',
    status: 'OPEN',
    openedAt: new Date().toISOString(),
    openingCash: shiftPayload.openingCash || 0,
    expectedCash: shiftPayload.openingCash || 0,
    totalSales: 0,
    notes: shiftPayload.notes || ''
  }

  if (isElectron()) {
    try {
      await (window as any).ipcRenderer.invoke('db:save-shift', { shift: shiftObj })
      await (window as any).ipcRenderer.invoke('db:enqueue-outbox', {
        item: {
          id: generateUUID(),
          branch_id: branchId,
          action_type: 'SHIFT_OPEN',
          endpoint: '/api/shifts/open',
          method: 'POST',
          payload: JSON.stringify({ ...shiftObj, _authToken: token }),
          idempotency_key: `shift-open-${shiftId}`
        }
      })
      await (window as any).ipcRenderer.invoke('sync:trigger-now')
    } catch (e) {}
  }

  return shiftObj
}

export async function processOfflineCloseShift(shiftId: string, actualCash: number, notes: string, branchId: string, cashierId: string, token: string) {
  let activeShift: CashierShift | null = null

  if (isElectron()) {
    try {
      activeShift = await (window as any).ipcRenderer.invoke('db:get-active-shift', { branchId, cashierId })
    } catch (e) {}
  }

  const closedAt = new Date().toISOString()
  const updatedShift: CashierShift = activeShift ? {
    ...activeShift,
    status: 'CLOSED',
    closedAt,
    actualCash,
    discrepancy: actualCash - (activeShift.expectedCash || 0),
    notes
  } : {
    id: shiftId,
    storeId: '',
    branchId,
    cashierId,
    status: 'CLOSED',
    openedAt: closedAt,
    closedAt,
    openingCash: 0,
    expectedCash: 0,
    actualCash,
    discrepancy: 0,
    totalSales: 0,
    notes
  }

  if (isElectron()) {
    try {
      await (window as any).ipcRenderer.invoke('db:save-shift', { shift: updatedShift })
      await (window as any).ipcRenderer.invoke('db:enqueue-outbox', {
        item: {
          id: generateUUID(),
          branch_id: branchId,
          action_type: 'SHIFT_CLOSE',
          endpoint: '/api/shifts/close',
          method: 'POST',
          payload: JSON.stringify({ ...updatedShift, actualCash, notes, _authToken: token }),
          idempotency_key: `shift-close-${shiftId}-${Date.now()}`
        }
      })
      await (window as any).ipcRenderer.invoke('sync:trigger-now')
    } catch (e) {}
  }

  return updatedShift
}

// ------------ Money Movements Offline ------------ //

export async function processOfflineMoneyMovement(movement: Partial<CashMovement>, branchId: string, token: string) {
  const movementId = movement.id || generateUUID()
  const movementObj: CashMovement = {
    id: movementId,
    branchId,
    shiftId: movement.shiftId,
    type: movement.type || 'CASH_IN',
    amount: movement.amount || 0,
    reason: movement.reason || '',
    performedById: movement.performedById || '',
    createdAt: new Date().toISOString()
  }

  if (isElectron()) {
    try {
      await (window as any).ipcRenderer.invoke('db:record-money-movement', { movement: movementObj })
      await (window as any).ipcRenderer.invoke('db:enqueue-outbox', {
        item: {
          id: generateUUID(),
          branch_id: branchId,
          action_type: 'MONEY_MOVEMENT',
          endpoint: '/api/cash-movements',
          method: 'POST',
          payload: JSON.stringify({ ...movementObj, _authToken: token }),
          idempotency_key: `money-movement-${movementId}`
        }
      })
      await (window as any).ipcRenderer.invoke('sync:trigger-now')
    } catch (e) {}
  }

  return movementObj
}
