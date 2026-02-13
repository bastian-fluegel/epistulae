import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Statischer Export: keine Server-Routes, alles in Dateien
    rollupOptions: {
      input: 'index.html',
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate', // Service Worker aktualisiert sich bei neuem Build
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Epistulae',
        short_name: 'Epistulae',
        description: 'Briefe von Sokrates – Selbstreflexion und Dialog',
        theme_color: '#6b5344',
        background_color: '#f5f0e8',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
})
