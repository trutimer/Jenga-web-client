import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { createWriteStream, existsSync, unlinkSync, renameSync, statSync, readFileSync, copyFileSync } from 'node:fs'
import { get as httpGet } from 'node:http'
import { get as httpsGet } from 'node:https'
import { spawn } from 'node:child_process'
import { URL } from 'node:url'

export interface UpdateStatus {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'
  currentVersion: string
  latestVersion?: string
  downloadProgress?: number // 0 to 100
  downloadSpeed?: number // bytes per second
  downloadedBytes?: number
  totalBytes?: number
  releaseNotes?: string
  error?: string
  installerPath?: string
}

let currentState: UpdateStatus = {
  status: 'idle',
  currentVersion: '2.6.0',
}

let activeDownloadReq: any = null
let lastErrorCooldown = 0
let windowsGetterRef: (() => BrowserWindow[]) | null = null
let apiBaseUrlGetterRef: (() => string) | null = null
let updateCheckTimer: NodeJS.Timeout | null = null

// Check for updates every 30 minutes (standard production cadence)
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

// Default download URL pointing to the web app's existing installer download button
const DEFAULT_DOWNLOAD_URL = process.env.VITE_UPDATE_URL || 'https://jenga.sintax.tz/Jenga-Setup-Latest.exe'

export function initUpdateManager(windowsGetter: () => BrowserWindow[], apiBaseUrlGetter?: () => string) {
  windowsGetterRef = windowsGetter
  if (apiBaseUrlGetter) {
    apiBaseUrlGetterRef = apiBaseUrlGetter
  }
  try {
    currentState.currentVersion = app.getVersion() || '2.6.0'
  } catch (_) {
    currentState.currentVersion = '2.6.0'
  }
  console.log(`[UpdateManager] Initialized. Current version: ${currentState.currentVersion} (Check interval: 30m)`)

  // Initial check after 5s delay so app startup is instant and non-blocking
  setTimeout(() => {
    checkForUpdates()
  }, 5000)

  // Periodic background check every 30 minutes
  if (updateCheckTimer) clearInterval(updateCheckTimer)
  updateCheckTimer = setInterval(() => {
    checkForUpdates()
  }, UPDATE_CHECK_INTERVAL_MS)
}

export async function checkForUpdates(
  apiBaseUrl?: string, 
  windowsGetter?: () => BrowserWindow[],
  manifestOverride?: any
) {
  const wins = windowsGetter ? windowsGetter() : (windowsGetterRef ? windowsGetterRef() : [])

  // If a manual manifest payload was passed (e.g. from console: invoke('updater:check-for-updates', { version: '2.7.0' }))
  if (manifestOverride && typeof manifestOverride === 'object' && manifestOverride.version) {
    console.log('[UpdateManager] Manual manifest override received:', manifestOverride)
    handleHealthPingResponse(manifestOverride, () => wins)
    return currentState
  }

  // Don't interrupt active downloads or already downloaded state
  if (currentState.status === 'downloading' || currentState.status === 'downloaded') {
    return currentState
  }

  currentState.status = 'checking'
  broadcastStatus(wins)

  try {
    let updateFound = false

    // 1. In local dev mode (!app.isPackaged), directly read public/version.json if it exists on disk
    if (!app.isPackaged) {
      try {
        const localManifestPath = join(process.env.APP_ROOT || process.cwd(), 'public', 'version.json')
        if (existsSync(localManifestPath)) {
          const raw = readFileSync(localManifestPath, 'utf-8')
          const localData = JSON.parse(raw)
          if (localData && localData.version) {
            console.log('[UpdateManager] Read local dev version.json directly from disk:', localData)
            handleHealthPingResponse(localData, () => wins)
            if (currentState.status === 'downloading' || currentState.status === 'downloaded') {
              updateFound = true
            }
          }
        }
      } catch (devErr) {
        console.warn('[UpdateManager] Dev local manifest read error:', devErr)
      }
    }

    // 2. Check version.json manifest on web origin (reliable static manifest)
    if (!updateFound) {
      const devOrigin = process.env.VITE_DEV_SERVER_URL 
        ? new URL(process.env.VITE_DEV_SERVER_URL).origin 
        : 'http://127.0.0.1:5173'
      const webOrigin = process.env.VITE_UPDATE_URL 
        ? new URL(process.env.VITE_UPDATE_URL).origin 
        : (process.env.NODE_ENV === 'production' ? 'https://jenga.sintax.tz' : devOrigin)

      try {
        const manifestController = new AbortController()
        const manifestTimeout = setTimeout(() => manifestController.abort(), 4000)
        const manifestRes = await fetch(`${webOrigin}/version.json`, {
          method: 'GET',
          signal: manifestController.signal,
        }).catch(() => null)
        clearTimeout(manifestTimeout)

        if (manifestRes && manifestRes.ok) {
          const manifestData = await manifestRes.json().catch(() => null)
          if (manifestData && typeof manifestData === 'object' && manifestData.version) {
            handleHealthPingResponse(manifestData, () => wins)
            if (currentState.status === 'downloading' || currentState.status === 'downloaded') {
              updateFound = true
            }
          }
        }
      } catch (manifestErr) {
        console.warn('[UpdateManager] Manifest version check error:', manifestErr)
      }
    }

    // 3. If not triggered from manifest, query API health ping
    if (!updateFound) {
      const url = apiBaseUrl || (apiBaseUrlGetterRef ? apiBaseUrlGetterRef() : (process.env.VITE_API_URL || 'https://jenga-api.sintax.tz'))
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(`${url.replace(/\/$/, '')}/api/auth/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null)

      clearTimeout(timeout)

      if (res && res.ok) {
        const data = await res.json().catch(() => null)
        if (data && typeof data === 'object') {
          handleHealthPingResponse(data, () => wins)
        }
      }
    }
  } catch (err: any) {
    console.warn('[UpdateManager] Check for updates failed:', err?.message || err)
  } finally {
    if (currentState.status === 'checking') {
      currentState.status = 'idle'
      broadcastStatus(wins)
    }
  }

  return currentState
}

export function getUpdateStatus(): UpdateStatus {
  return { ...currentState }
}

export function broadcastStatus(windows?: BrowserWindow[]) {
  const wins = windows || (windowsGetterRef ? windowsGetterRef() : [])
  for (const win of wins) {
    if (!win.isDestroyed()) {
      win.webContents.send('updater:status-changed', getUpdateStatus())
    }
  }
}

/**
 * Robust SemVer comparison. Returns true if remoteVersion is strictly greater than localVersion.
 */
export function isNewerVersion(remoteVersion: string, localVersion: string): boolean {
  if (!remoteVersion || !localVersion) return false

  const clean = (v: string) => v.trim().replace(/^v/i, '')
  const rParts = clean(remoteVersion).split('.').map(n => parseInt(n, 10) || 0)
  const lParts = clean(localVersion).split('.').map(n => parseInt(n, 10) || 0)

  const len = Math.max(rParts.length, lParts.length)
  for (let i = 0; i < len; i++) {
    const r = rParts[i] || 0
    const l = lParts[i] || 0
    if (r > l) return true
    if (r < l) return false
  }

  return false
}

/**
 * Called by the health check ping when receiving a response.
 */
export function handleHealthPingResponse(payload: any, windowsGetter?: () => BrowserWindow[]) {
  if (!payload || typeof payload !== 'object') return

  const remoteVersion = (
    payload.latestVersion ||
    payload.latestDesktopVersion ||
    payload.desktopVersion ||
    payload.version ||
    ''
  ).toString().trim()

  let downloadUrl = (payload.downloadUrl || payload.url || DEFAULT_DOWNLOAD_URL).toString().trim()
  if (downloadUrl.startsWith('/')) {
    const webOrigin = process.env.VITE_UPDATE_URL 
      ? new URL(process.env.VITE_UPDATE_URL).origin 
      : (process.env.NODE_ENV === 'production' ? 'https://jenga.sintax.tz' : 'http://localhost:5173')
    downloadUrl = `${webOrigin}${downloadUrl}`
  }
  const releaseNotes = payload.releaseNotes || payload.notes || ''

  if (!isNewerVersion(remoteVersion, currentState.currentVersion)) {
    // Current version is equal or ahead
    if (currentState.status === 'checking') {
      currentState.status = 'idle'
      broadcastStatus()
    }
    return
  }

  // A newer version is detected!
  console.log(`[UpdateManager] Newer version detected: ${remoteVersion} (current: ${currentState.currentVersion})`)

  // Cooldown check in case of consecutive failures
  const now = Date.now()
  if (currentState.status === 'error' && now - lastErrorCooldown < 5 * 60 * 1000) {
    return
  }

  const tempDir = app.getPath('temp')
  const finalInstallerPath = join(tempDir, `jenga-update-${remoteVersion}.exe`)

  // Check if this installer was already downloaded and valid
  if (existsSync(finalInstallerPath)) {
    try {
      const stats = statSync(finalInstallerPath)
      if (stats.size > 5 * 1024 * 1024) { // At least 5MB for valid installer
        currentState = {
          status: 'downloaded',
          currentVersion: currentState.currentVersion,
          latestVersion: remoteVersion,
          downloadProgress: 100,
          releaseNotes,
          installerPath: finalInstallerPath,
        }
        broadcastStatus()
        return
      }
    } catch (_) {}
  }

  // If already downloading the same version, don't restart
  if (currentState.status === 'downloading' && currentState.latestVersion === remoteVersion) {
    return
  }

  // Begin background download
  triggerDownload(downloadUrl, remoteVersion, releaseNotes)
}

/**
 * Downloads the update binary in the background with progress reporting.
 */
export function triggerDownload(downloadUrl: string, targetVersion: string, releaseNotes: string = '') {
  if (currentState.status === 'downloading' && activeDownloadReq) {
    return
  }

  console.log(`[UpdateManager] Initiating background download for v${targetVersion} from: ${downloadUrl}`)

  currentState = {
    status: 'downloading',
    currentVersion: currentState.currentVersion,
    latestVersion: targetVersion,
    downloadProgress: 0,
    downloadSpeed: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    releaseNotes,
  }
  broadcastStatus()

  const tempDir = app.getPath('temp')
  const finalInstallerPath = join(tempDir, `jenga-update-${targetVersion}.exe`)
  const partialPath = `${finalInstallerPath}.downloading`

  // Remove existing partial file if present
  if (existsSync(partialPath)) {
    try { unlinkSync(partialPath) } catch (_) {}
  }

  downloadFileWithRedirects(downloadUrl, partialPath, (err) => {
    if (err) {
      console.error('[UpdateManager] Download failed:', err)
      lastErrorCooldown = Date.now()
      if (existsSync(partialPath)) {
        try { unlinkSync(partialPath) } catch (_) {}
      }

      // If in dev mode (!app.isPackaged), fall back directly to local public/Jenga-Setup-Latest.exe
      const localExe = join(process.env.APP_ROOT || process.cwd(), 'public', 'Jenga-Setup-Latest.exe')
      if (!app.isPackaged && existsSync(localExe)) {
        console.log('[UpdateManager] Falling back to local public installer binary for dev testing...')
        try {
          copyFileSync(localExe, finalInstallerPath)
          currentState = {
            ...currentState,
            status: 'downloaded',
            downloadProgress: 100,
            installerPath: finalInstallerPath,
          }
          broadcastStatus()
          return
        } catch (_) {}
      }

      currentState = {
        ...currentState,
        status: 'error',
        error: err.message || 'Failed to download update installer',
      }
      broadcastStatus()
      return
    }

    // Atomic rename on completion
    try {
      if (!existsSync(partialPath)) {
        throw new Error('Downloaded installer file was not found on disk.')
      }

      const stats = statSync(partialPath)
      if (stats.size < 5 * 1024 * 1024) {
        throw new Error(`Downloaded installer file is invalid or too small (${stats.size} bytes). Expected complete Windows executable.`)
      }

      if (existsSync(finalInstallerPath)) {
        unlinkSync(finalInstallerPath)
      }
      renameSync(partialPath, finalInstallerPath)

      currentState = {
        status: 'downloaded',
        currentVersion: currentState.currentVersion,
        latestVersion: targetVersion,
        downloadProgress: 100,
        releaseNotes,
        installerPath: finalInstallerPath,
      }
      console.log(`[UpdateManager] Download complete: ${finalInstallerPath}`)
      broadcastStatus()
    } catch (renameErr: any) {
      console.error('[UpdateManager] Failed to finalize update file:', renameErr)
      if (existsSync(partialPath)) {
        try { unlinkSync(partialPath) } catch (_) {}
      }
      currentState = {
        ...currentState,
        status: 'error',
        error: renameErr.message || 'Failed to finalize update file',
      }
      broadcastStatus()
    }
  })
}

/**
 * Streams download with redirect resolution and progress tracking.
 */
function downloadFileWithRedirects(
  fileUrl: string,
  destinationPath: string,
  callback: (err: Error | null) => void,
  redirectCount = 0
) {
  if (redirectCount > 5) {
    return callback(new Error('Too many redirects while downloading update'))
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(fileUrl)
  } catch (e: any) {
    return callback(new Error(`Invalid download URL: ${fileUrl}`))
  }

  const getter = parsedUrl.protocol === 'https:' ? httpsGet : httpGet
  const hostname = parsedUrl.hostname === 'localhost' ? '127.0.0.1' : parsedUrl.hostname
  const requestOptions = {
    hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    headers: {
      'User-Agent': `Jenga-Desktop/${currentState.currentVersion} (Electron; Windows NT)`,
      'Accept': '*/*',
    },
  }

  const req = getter(requestOptions, (res) => {
    // Handle HTTP Redirects (301, 302, 303, 307, 308)
    if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      const redirectUrl = new URL(res.headers.location, fileUrl).toString()
      res.resume() // Drain stream
      return downloadFileWithRedirects(redirectUrl, destinationPath, callback, redirectCount + 1)
    }

    if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
      res.resume()
      return callback(new Error(`HTTP error ${res.statusCode} while downloading update`))
    }

    const totalBytes = parseInt(res.headers['content-length'] || '0', 10)
    let downloadedBytes = 0
    let lastBroadcastTime = 0
    let bytesSinceLastCalc = 0
    let lastSpeedCalcTime = Date.now()
    let currentSpeed = 0

    currentState.totalBytes = totalBytes
    currentState.downloadedBytes = 0

    const fileStream = createWriteStream(destinationPath)

    res.on('data', (chunk) => {
      downloadedBytes += chunk.length
      bytesSinceLastCalc += chunk.length

      const now = Date.now()
      // Calculate speed every 1 second
      if (now - lastSpeedCalcTime >= 1000) {
        currentSpeed = Math.round((bytesSinceLastCalc * 1000) / (now - lastSpeedCalcTime))
        bytesSinceLastCalc = 0
        lastSpeedCalcTime = now
      }

      // Throttle IPC broadcast to once per 500ms
      if (now - lastBroadcastTime > 500 || downloadedBytes === totalBytes) {
        lastBroadcastTime = now
        const percent = totalBytes > 0 ? Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)) : 0

        currentState.downloadProgress = percent
        currentState.downloadedBytes = downloadedBytes
        currentState.downloadSpeed = currentSpeed
        broadcastStatus()
      }
    })

    res.pipe(fileStream)

    fileStream.on('finish', () => {
      callback(null)
    })

    fileStream.on('error', (err) => {
      try { fileStream.destroy() } catch (_) {}
      callback(err)
    })
  })

  req.on('error', (err) => {
    callback(err)
  })

  activeDownloadReq = req
}

/**
 * Applies the downloaded update by launching the installer and closing the current app.
 */
export function restartAndInstall(): { success: boolean; message?: string } {
  const { installerPath, latestVersion } = currentState

  if (!installerPath || !existsSync(installerPath)) {
    return { success: false, message: 'No downloaded update found.' }
  }

  console.log(`[UpdateManager] Applying update to v${latestVersion} with installer: ${installerPath}`)

  // In development mode (not packaged), simulate restart without closing dev server
  if (!app.isPackaged) {
    console.log('[UpdateManager] App is running in development mode. Simulated restart for update.')
    return { success: true, message: 'Dev Mode: Update restart simulated successfully.' }
  }

  try {
    if (process.platform === 'win32') {
      // For NSIS on Windows, /S performs a silent upgrade, or running without /S opens installer
      // Running the installer detached allows it to proceed after app.quit()
      const child = spawn(installerPath, ['/S'], {
        detached: true,
        stdio: 'ignore',
      })
      child.unref()
    } else {
      // Fallback for macOS / Linux
      shell.openPath(installerPath)
    }

    // Terminate current Electron application cleanly so installer can replace binaries
    setTimeout(() => {
      app.quit()
    }, 500)

    return { success: true }
  } catch (err: any) {
    console.error('[UpdateManager] Failed to launch installer:', err)
    return { success: false, message: err.message || 'Failed to launch installer' }
  }
}
