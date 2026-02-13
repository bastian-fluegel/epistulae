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
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
})
