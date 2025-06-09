import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Get or increment version number
function getVersionInfo() {
  const versionPath = path.resolve('public/version.json')
  let currentVersion = '1.0.0'
  let buildNumber = 1
  
  // Read existing version if it exists
  try {
    if (fs.existsSync(versionPath)) {
      const existing = JSON.parse(fs.readFileSync(versionPath, 'utf-8'))
      if (existing.version && existing.buildNumber) {
        currentVersion = existing.version
        buildNumber = existing.buildNumber + 1
      }
    }
  } catch (e) {
    console.log('Creating new version.json')
  }
  
  return {
    version: currentVersion,
    buildNumber,
    buildTime: new Date().toISOString()
  }
}

// Plugin to inject version info into the build
function injectVersionInfo() {
  return {
    name: 'inject-version-info',
    buildStart() {
      const versionInfo = getVersionInfo()
      
      // Write version.json
      const versionPath = path.resolve('public/version.json')
      fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2))
      
      console.log(`Build version: ${versionInfo.version} (build #${versionInfo.buildNumber})`)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    injectVersionInfo(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'version.json'],
      manifest: {
        name: 'QuickTax - Estimated Tax Calculator',
        short_name: 'QuickTax',
        description: 'Calculate your estimated federal and California state tax payments throughout the tax year',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/?source=pwa',
        id: 'quicktax-estimator',
        categories: ['finance', 'productivity', 'utilities'],
        icons: [
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icon-167.png',
            sizes: '167x167',
            type: 'image/png'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        // Force service worker update on every build
        additionalManifestEntries: [
          {
            url: '/version.json',
            revision: Date.now().toString()
          }
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Don't cache version.json to ensure we can detect updates
            urlPattern: /\/version\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'version-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 // 1 minute
              }
            }
          }
        ],
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'state': ['zustand']
        }
      }
    }
  }
})