import { existsSync, statSync, createReadStream } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import packageJson from './package.json'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

function desktopInstallerDevPlugin() {
  return {
    name: 'desktop-installer-dev-server',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const parsedUrl = new URL(req.url, 'http://localhost')
        if (parsedUrl.pathname === '/Jenga-Setup-Latest.exe') {
          const publicPath = fileURLToPath(new URL('./public/Jenga-Setup-Latest.exe', import.meta.url))
          const releasePath = fileURLToPath(new URL(`./release/${packageJson.version}/Jenga Setup ${packageJson.version}.exe`, import.meta.url))
          const rootPath = fileURLToPath(new URL('./Jenga-Setup-Latest.exe', import.meta.url))
          
          const filePath = existsSync(publicPath) ? publicPath : (existsSync(releasePath) ? releasePath : (existsSync(rootPath) ? rootPath : null))
          if (filePath) {
            const stat = statSync(filePath)
            res.writeHead(200, {
              'Content-Type': 'application/vnd.microsoft.portable-executable',
              'Content-Disposition': 'attachment; filename="Jenga-Setup-Latest.exe"',
              'Content-Length': stat.size,
              'Cache-Control': 'no-cache',
            })
            createReadStream(filePath).pipe(res)
            return
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || (mode === 'development' || mode === 'local' ? 'http://localhost:9090' : '')

  return {
    server: {
      watch: {
        ignored: ['**/*.exe', '**/release/**', '**/dist-electron/**']
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      ...(apiUrl ? { 'process.env.VITE_API_URL': JSON.stringify(apiUrl) } : {}),
    },
    plugins: [
      vue(),
      tailwindcss(),
      desktopInstallerDevPlugin(),
      process.env.ELECTRON === 'true' && electron({
        main: {
          entry: 'electron/main.ts',
          vite: {
            define: {
              ...(apiUrl ? { 'process.env.VITE_API_URL': JSON.stringify(apiUrl) } : {}),
            },
            build: {
              rollupOptions: {
                external: ['better-sqlite3']
              }
            }
          }
        },
        preload: {
          input: 'electron/preload.ts',
        },
        renderer: process.env.NODE_ENV === 'test' ? undefined : {},
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
