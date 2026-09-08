import { ipcRenderer, contextBridge } from 'electron'

const ALLOWED_INVOKE_CHANNELS = new Set([
  'get-fingerprint',
  'db:save-products',
  'db:get-products',
  'db:get-paginated-products',
  'db:update-stock',
  'db:save-customers',
  'db:get-customers',
  'db:cache-auth',
  'db:get-cached-auth',
  'db:save-shift',
  'db:clear-active-shifts',
  'db:get-active-shift',
  'db:record-money-movement',
  'db:enqueue-outbox',
  'sync:get-status',
  'sync:trigger-now',
  'sync:clean-stuck-items',
  'sync:set-config',
  'updater:check-for-updates',
  'updater:get-status',
  'updater:restart-and-install',
])

const ALLOWED_LISTEN_CHANNELS = new Set([
  'main-process-message',
  'sync:status-changed',
  'updater:status-changed',
])

// --------- Expose secure, allowlisted API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel: string, listener: (...args: any[]) => void) {
    if (!ALLOWED_LISTEN_CHANNELS.has(channel)) {
      console.warn(`[Security Warning] Blocked listener on unauthorized IPC channel: ${channel}`)
      return
    }
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(channel: string, ...omit: any[]) {
    if (!ALLOWED_LISTEN_CHANNELS.has(channel)) {
      return
    }
    return ipcRenderer.off(channel, ...(omit as [any]))
  },
  send(channel: string, ...omit: any[]) {
    console.warn(`[Security Warning] Blocked send on unauthorized IPC channel: ${channel}`)
  },
  invoke(channel: string, ...omit: any[]) {
    if (!ALLOWED_INVOKE_CHANNELS.has(channel)) {
      console.warn(`[Security Warning] Blocked invocation of unauthorized IPC channel: ${channel}`)
      return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`))
    }
    return ipcRenderer.invoke(channel, ...omit)
  },
})
