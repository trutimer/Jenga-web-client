import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
// @ts-ignore
if (typeof globalThis.require === 'undefined') {
  // @ts-ignore
  globalThis.require = require
}

import * as db from './db'
import { startSyncEngine, setApiBaseUrl, processSyncQueue, broadcastSyncStatus, setSyncAuthToken } from './syncEngine'


const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    icon: join(process.env.VITE_PUBLIC || '', 'logo.png'),
    width: 1280,
    height: 850,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    },
  })

  // Intercept child window creation and route external URLs to the default system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // Prevent top-level navigation away from the bundled application
  win.webContents.on('will-navigate', (event, navigationUrl) => {
    if (VITE_DEV_SERVER_URL && navigationUrl.startsWith(VITE_DEV_SERVER_URL)) {
      return
    }
    const currentUrl = win?.webContents.getURL() || ''
    if (navigationUrl !== currentUrl && !navigationUrl.startsWith('file://')) {
      event.preventDefault()
      if (navigationUrl.startsWith('https:') || navigationUrl.startsWith('http:')) {
        shell.openExternal(navigationUrl)
      }
    }
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date()).toLocaleString())
    if (win) broadcastSyncStatus([win])
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  // Initialize Database
  try {
    db.getDB()
  } catch (err) {
    console.error('Failed to initialize SQLite database:', err)
  }

  // Start Sync Engine Worker
  startSyncEngine(() => (win ? [win] : []))

  // Fingerprint Handler
  ipcMain.handle('get-fingerprint', async () => {
    try {
      let fingerprint = ''
      if (process.platform === 'win32') {
        const [uuid, bios, tpm] = await Promise.all([
          execAsync('wmic csproduct get uuid').catch(() => ({ stdout: '' })),
          execAsync('wmic bios get serialnumber').catch(() => ({ stdout: '' })),
          execAsync('powershell -Command "Get-TpmEndorsementKeyInfo -ErrorAction SilentlyContinue | Select-Object -ExpandProperty PublicKeyHash"').catch(() => ({ stdout: '' }))
        ])
        
        fingerprint = [
          uuid.stdout.split('\n')[1]?.trim(),
          bios.stdout.split('\n')[1]?.trim(),
          tpm.stdout.trim()
        ].filter(Boolean).join('-')
      }
      return fingerprint || 'UNKNOWN-DEVICE'
    } catch (e) {
      console.error('Failed to get fingerprint', e)
      return 'UNKNOWN-DEVICE'
    }
  })

  // ------------ Offline DB & Sync IPC Handlers ------------ //

  ipcMain.handle('db:save-products', (_, { branchId, products }) => {
    if (!branchId) return
    db.saveBranchProducts(branchId, products)
    return { success: true }
  })

  ipcMain.handle('db:get-products', (_, { branchId }) => {
    if (!branchId) return []
    return db.getBranchProducts(branchId)
  })

  ipcMain.handle('db:get-paginated-products', (_, { branchId, page, size, search }) => {
    if (!branchId) return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 50, first: true, last: true, empty: true }
    return db.getPaginatedBranchProducts(branchId, page, size, search)
  })


  ipcMain.handle('db:update-stock', (_, { branchId, productId, qtyDelta }) => {
    if (!branchId || !productId) return
    db.updateLocalProductStock(branchId, productId, qtyDelta)
    return { success: true }
  })

  ipcMain.handle('db:save-customers', (_, { branchId, customers }) => {
    if (!branchId) return
    db.saveBranchCustomers(branchId, customers)
    return { success: true }
  })

  ipcMain.handle('db:get-customers', (_, { branchId }) => {
    if (!branchId) return []
    return db.getBranchCustomers(branchId)
  })

  ipcMain.handle('db:cache-auth', (_, { user, token, branchId, passwordHash, passwordSalt }) => {
    if (!user || !branchId) return
    db.cacheUserAuth(user, token, branchId, passwordHash, passwordSalt)
    setSyncAuthToken(token)
    return { success: true }
  })

  ipcMain.handle('db:get-cached-auth', (_, { identifier, branchId }) => {
    if (!branchId || !identifier) return null
    return db.getCachedUserAuth(identifier, branchId)
  })

  ipcMain.handle('db:save-shift', (_, { shift }) => {
    if (!shift || !shift.branchId) return
    db.saveActiveShift(shift)
    return { success: true }
  })

  ipcMain.handle('db:clear-active-shifts', (_, { branchId, cashierId }) => {
    if (!branchId || !cashierId) return
    db.clearActiveShifts(branchId, cashierId)
    return { success: true }
  })

  ipcMain.handle('db:get-active-shift', (_, { branchId, cashierId }) => {
    if (!branchId || !cashierId) return null
    return db.getActiveShift(branchId, cashierId)
  })


  ipcMain.handle('db:record-money-movement', (_, { movement }) => {
    if (!movement) return
    db.recordMoneyMovement(movement)
    return { success: true }
  })

  ipcMain.handle('db:enqueue-outbox', (_, { item }) => {
    if (!item || !item.branch_id) return null
    const result = db.enqueueOutboxItem(item)
    if (win) broadcastSyncStatus([win], item.branch_id)
    return result
  })

  ipcMain.handle('sync:get-status', (_, { branchId } = {}) => {
    const stats = db.getOutboxStats(branchId)
    return {
      pendingCount: stats.pendingCount,
      totalCount: stats.totalCount
    }
  })

  ipcMain.handle('sync:trigger-now', () => {
    if (win) processSyncQueue(() => (win ? [win] : []))
    return { success: true }
  })

  ipcMain.handle('sync:set-config', (_, { apiBaseUrl, token }) => {
    if (apiBaseUrl) setApiBaseUrl(apiBaseUrl)
    if (token) setSyncAuthToken(token)
    return { success: true }
  })

  createWindow()
})
