import { BrowserWindow } from 'electron'
import { getPendingOutboxItems, updateOutboxItemStatus, getOutboxStats, OutboxItem } from './db'

let isOnline = false
let isSyncing = false
let syncTimer: NodeJS.Timeout | null = null
let healthCheckTimer: NodeJS.Timeout | null = null
let apiBaseUrl = 'http://localhost:9090'
// let apiBaseUrl = 'https://jenga-api.sintax.tz';

export function setApiBaseUrl(url: string) {
  if (url && url.trim() !== '') {
    apiBaseUrl = url.trim().replace(/\/$/, '')
  }
}

export function startSyncEngine(windowsGetter: () => BrowserWindow[]) {
  console.log('[Sync Engine] Starting background sync engine...')

  // Check health immediately and every 10 seconds
  checkHealth(windowsGetter)
  healthCheckTimer = setInterval(() => checkHealth(windowsGetter), 10000)

  // Run sync queue check every 5 seconds
  syncTimer = setInterval(() => processSyncQueue(windowsGetter), 5000)
}

export function stopSyncEngine() {
  if (syncTimer) clearInterval(syncTimer)
  if (healthCheckTimer) clearInterval(healthCheckTimer)
  syncTimer = null
  healthCheckTimer = null
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



    const previousOnline = isOnline
    isOnline = reachable

    if (previousOnline !== isOnline && windowsGetter) {
      broadcastSyncStatus(windowsGetter())
    }

    if (isOnline && !isSyncing && windowsGetter) {
      processSyncQueue(windowsGetter)
    }
  } catch {
    isOnline = false
    if (windowsGetter) broadcastSyncStatus(windowsGetter())
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

      // Add storeBranchId parameter to URL if required
      let targetUrl = item.endpoint.startsWith('http') ? item.endpoint : `${apiBaseUrl}${item.endpoint}`
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
      } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        // Non-retryable client validation error - mark as failed and do not retry
        const errText = await res.text().catch(() => 'Client Error')
        console.error(`[Sync Engine] Non-retryable Client Error ${res.status} for item ${item.id}:`, errText)
        updateOutboxItemStatus(item.id, 'FAILED', `Client Error ${res.status}: ${errText}`)
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

  isSyncing = false
  broadcastSyncStatus(windowsGetter())
}

let localStorageLikeToken = ''
export function setSyncAuthToken(token: string) {
  localStorageLikeToken = token
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
