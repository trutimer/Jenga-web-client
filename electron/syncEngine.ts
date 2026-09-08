import { BrowserWindow } from 'electron'
import { getPendingOutboxItems, updateOutboxItemStatus, getOutboxStats, reconcileAndCleanOutbox, OutboxItem } from './db'
import { handleHealthPingResponse } from './updateManager'

let isOnline = false
let isSyncing = false
let syncTimer: NodeJS.Timeout | null = null
let healthCheckTimer: NodeJS.Timeout | null = null
let apiBaseUrl = process.env.VITE_API_URL || (process.env.NODE_ENV === 'production' ? 'https://jenga-api.sintax.tz' : 'http://localhost:9090')

export function setApiBaseUrl(url: string) {
  if (url && url.trim() !== '') {
    apiBaseUrl = url.trim().replace(/\/$/, '')
  }
}

let consecutiveFailures = 0

export function getApiBaseUrl(): string {
  return apiBaseUrl
}

export function startSyncEngine(windowsGetter: () => BrowserWindow[]) {
  console.log('[Sync Engine] Starting background sync engine with adaptive intervals...')

  // Self-heal and clean any stuck outbox items on startup
  try {
    reconcileAndCleanOutbox()
  } catch (e) {
    console.warn('[Sync Engine] Initial reconcile error:', e)
  }

  // Check health immediately on startup, then adapt based on queue state
  checkHealth(windowsGetter)

  // Run local sync queue check every 5 seconds (fast local SQLite check, no network if outbox is empty)
  syncTimer = setInterval(() => processSyncQueue(windowsGetter), 5000)
}

export function stopSyncEngine() {
  if (syncTimer) clearInterval(syncTimer)
  if (healthCheckTimer) clearTimeout(healthCheckTimer)
  syncTimer = null
  healthCheckTimer = null
}

export function scheduleNextHealthCheck(windowsGetter?: () => BrowserWindow[]) {
  if (healthCheckTimer) {
    clearTimeout(healthCheckTimer)
    healthCheckTimer = null
  }

  const stats = getOutboxStats()
  let delayMs = 60000 // Default 60s when idle

  if (!isOnline) {
    // Offline backoff: 15s -> 30s -> 60s max
    delayMs = Math.min(15000 * Math.pow(2, Math.min(consecutiveFailures, 2)), 60000)
  } else if (stats.pendingCount > 0) {
    // Items waiting in outbox: check every 10s to sync quickly
    delayMs = 10000
  } else {
    // Idle with 0 pending items: relax to 60s to protect backend server
    delayMs = 60000
  }

  healthCheckTimer = setTimeout(async () => {
    if (windowsGetter) {
      await checkHealth(windowsGetter)
    }
  }, delayMs)
}

export async function checkHealth(windowsGetter?: () => BrowserWindow[]) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`${apiBaseUrl}/api/auth/health`, {
      method: 'GET',
      signal: controller.signal
    }).catch(() => null)

    clearTimeout(timeout)

    // Consider online if server responds (200, 401 Unauthorized, or 403 Forbidden means server is online)
    const reachable = Boolean(res && (res.ok || res.status === 401 || res.status === 403))

    // If server responds 200, check if version metadata is included for auto-update
    if (res && res.ok) {
      try {
        const data = await res.json()
        if (data && typeof data === 'object') {
          handleHealthPingResponse(data, windowsGetter)
        }
      } catch (_) {}
    }

    const previousOnline = isOnline
    isOnline = reachable

    if (reachable) {
      consecutiveFailures = 0
    } else {
      consecutiveFailures++
    }

    if (previousOnline !== isOnline && windowsGetter) {
      broadcastSyncStatus(windowsGetter())
    }

    if (isOnline && !isSyncing && windowsGetter) {
      processSyncQueue(windowsGetter)
    }
  } catch {
    isOnline = false
    consecutiveFailures++
    if (windowsGetter) broadcastSyncStatus(windowsGetter())
  } finally {
    // Schedule next health check using adaptive interval
    scheduleNextHealthCheck(windowsGetter)
  }
}

export async function processSyncQueue(windowsGetter: () => BrowserWindow[]) {
  if (isSyncing || !isOnline) return

  const pendingItems = getPendingOutboxItems(undefined, 20)
  if (pendingItems.length === 0) {
    broadcastSyncStatus(windowsGetter())
    return
  }

  isSyncing = true
  broadcastSyncStatus(windowsGetter())
  console.log(`[Sync Engine] Processing ${pendingItems.length} pending outbox items...`)

  try {
    for (const item of pendingItems) {
      if (!isOnline) break

      try {
        updateOutboxItemStatus(item.id, 'SYNCING')
        broadcastSyncStatus(windowsGetter())

        const payloadObj = JSON.parse(item.payload)
        const token = payloadObj._authToken || localStorageLikeToken
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Idempotency-Key': item.idempotency_key
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // Security check: strictly validate outbox endpoint to prevent SSRF and token exfiltration
        if (typeof item.endpoint !== 'string' || item.endpoint.startsWith('http://') || item.endpoint.startsWith('https://') || item.endpoint.startsWith('//')) {
          console.error(`[Sync Engine] Security Violation: Outbox item ${item.id} specified an absolute URL (${item.endpoint}). Rejected.`)
          updateOutboxItemStatus(item.id, 'FAILED', 'Security Violation: Absolute URLs are not permitted')
          continue
        }

        const sanitizedEndpoint = item.endpoint.startsWith('/') ? item.endpoint : `/${item.endpoint}`
        if (!sanitizedEndpoint.startsWith('/api/')) {
          console.error(`[Sync Engine] Security Violation: Outbox item ${item.id} specified a non-API path (${sanitizedEndpoint}). Rejected.`)
          updateOutboxItemStatus(item.id, 'FAILED', 'Security Violation: Endpoint must begin with /api/')
          continue
        }

        // Add storeBranchId parameter to URL if required
        let targetUrl = `${apiBaseUrl}${sanitizedEndpoint}`
        if (item.branch_id && !targetUrl.includes('storeBranchId=')) {
          const sep = targetUrl.includes('?') ? '&' : '?'
          targetUrl += `${sep}storeBranchId=${encodeURIComponent(item.branch_id)}`
        }

        // Remove internal helper fields from payload before pushing
        delete payloadObj._authToken

        const res = await fetch(targetUrl, {
          method: item.method || 'POST',
          headers,
          body: JSON.stringify(payloadObj)
        })

        if (res.ok || res.status === 200 || res.status === 201 || res.status === 204) {
          console.log(`[Sync Engine] Successfully synced outbox item ${item.id} (${item.action_type})`)
          updateOutboxItemStatus(item.id, 'COMPLETED')
        } else if (res.status === 409) {
          // 409 Conflict: Record already exists on server - treat as successfully completed
          console.log(`[Sync Engine] Outbox item ${item.id} already exists on server (HTTP 409 Conflict). Marking as COMPLETED.`)
          updateOutboxItemStatus(item.id, 'COMPLETED')
        } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          const errText = await res.text().catch(() => 'Client Error')
          const lowerErr = errText.toLowerCase()

          // Check if server rejected because record/sale already exists
          if (
            lowerErr.includes('duplicate') ||
            lowerErr.includes('already exists') ||
            lowerErr.includes('already recorded') ||
            lowerErr.includes('unique constraint') ||
            lowerErr.includes('already processed')
          ) {
            console.log(`[Sync Engine] Outbox item ${item.id} already recorded on server (${errText}). Marking as COMPLETED.`)
            updateOutboxItemStatus(item.id, 'COMPLETED')
          } else {
            // Genuine non-retryable client validation error - mark as failed and do not retry
            console.error(`[Sync Engine] Non-retryable Client Error ${res.status} for item ${item.id}:`, errText)
            updateOutboxItemStatus(item.id, 'FAILED', `Client Error ${res.status}: ${errText}`)
          }
        } else {
          // 5xx Server Error or Rate Limit
          const errText = await res.text().catch(() => 'Server Error')
          console.warn(`[Sync Engine] Server Error ${res.status} for item ${item.id}:`, errText)
          updateOutboxItemStatus(item.id, 'FAILED', `Server Error ${res.status}: ${errText}`)
          break // pause batch loop on server error
        }
      } catch (e: any) {
        console.error(`[Sync Engine] Network error during sync of item ${item.id}:`, e?.message || e)
        updateOutboxItemStatus(item.id, 'FAILED', e?.message || 'Network fetch failure')
        isOnline = false
        break
      }
    }
  } finally {
    isSyncing = false
    broadcastSyncStatus(windowsGetter())
  }
}

let localStorageLikeToken = ''
export function setSyncAuthToken(token: string) {
  localStorageLikeToken = token
}

export function getIsOnline(): boolean {
  return isOnline
}

export function getIsSyncing(): boolean {
  return isSyncing
}

export function broadcastSyncStatus(windows: BrowserWindow[], branchId?: string) {
  const stats = getOutboxStats(branchId)
  const statusPayload = {
    isOnline,
    isSyncing,
    pendingCount: stats.pendingCount,
    totalCount: stats.totalCount,
    lastSyncTime: Date.now()
  }

  for (const win of windows) {
    if (!win.isDestroyed()) {
      win.webContents.send('sync:status-changed', statusPayload)
    }
  }
}
