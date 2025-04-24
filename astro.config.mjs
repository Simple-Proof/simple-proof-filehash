import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import pwa from '@vite-pwa/astro';

export default defineConfig({
  integrations: [
    tailwind(),
    pwa({
      registerType: 'autoUpdate',
      manifest: {
        name: 'File Hash Calculator',
        short_name: 'FileHash',
        description: 'Calculate SHA-256 hashes of your files directly in the browser',
        theme_color: '#4f46e5',
        background_color: '#f9fafb',
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
        navigateFallback: '/index.html', // Asegúrate de usar el archivo correcto
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff,woff2,ttf,eot}'], // Más extensiones
        globIgnores: [], // No ignorar nada
        runtimeCaching: [
          {
            urlPattern: /.*/, // Capturar absolutamente todo
            handler: 'StaleWhileRevalidate', // Usar caché primero, actualizar en segundo plano
            options: {
              cacheName: 'all-content-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/$/]
      }
    })
  ],
  build: {
    inlineStylesheets: 'always'
  }
});
