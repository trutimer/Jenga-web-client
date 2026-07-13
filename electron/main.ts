import { app, BrowserWindow, ipcMain } from 'electron'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

const __dirname = dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: join(process.env.VITE_PUBLIC || '', 'logo.png'),
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
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
  createWindow()
})
