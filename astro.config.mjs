import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import pwa from '@vite-pwa/astro';

export default defineConfig({
  integrations: [
    tailwind(),
    pwa({
      registerType: 'prompt', // Changed from autoUpdate to prompt for better first-time offline support
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'File Hash Calculator',
        short_name: 'FileHash',
        description: 'Calculate SHA-256 hashes of your files directly in the browser',
        theme_color: '#4f46e5', // Primary color 
        background_color: '#f9fafb',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Force cache first strategy for all resources
        globDirectory: 'dist',
        globPatterns: [
          '**/*.{html,js,css,woff,woff2,ttf,eot,svg,png,jpg,jpeg,gif,webp,ico}'
        ],
        // Don't fallback to index.html for navigation to avoid caching issues
        // We'll define more specific routes below
        navigateFallback: null,
        // Important: precache specific assets
        additionalManifestEntries: [
          { url: '/', revision: null },
          { url: '/index.html', revision: null },
          { url: '/favicon.ico', revision: null },
          { url: '/favicon.svg', revision: null },
          { url: '/apple-touch-icon.png', revision: null },
          // Add any other specific files you need offline
        ],
        // Define specific caching strategies
        runtimeCaching: [
          {
            // Cache page navigations (HTML)
            urlPattern: /^\/$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          },
          {
            // Cache JavaScript and CSS
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-css-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          },
          {
            // Cache fonts
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          },
          {
            // Fallback cache strategy for other resources
            urlPattern: /.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'fallback-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            },
          }
        ],
        // Skip the waiting phase to make updates visible immediately
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/'
      }
    })
  ],
  build: {
    inlineStylesheets: 'always'
  }
});
