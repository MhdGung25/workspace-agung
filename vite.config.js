import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Memastikan semua aset ini ikut dibawa saat offline
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'logo-iwu.png'],
      manifest: {
        name: 'Informatics Student Tools IWU',
        short_name: 'IWUTools',
        description: 'Platform Catatan dan Tugas Mahasiswa Informatika IWU',
        theme_color: '#7b2cbf',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo-iwu.png',
            sizes: '192x192 512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Strategi cache: Ambil semua file di folder dist untuk disimpan offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Menangani navigasi agar refresh saat offline tidak error
        navigateFallback: '/index.html'
      },
      devOptions: {
        enabled: true // Supaya fitur PWA bisa ngetes pas 'npm run dev'
      }
    })
  ]
})