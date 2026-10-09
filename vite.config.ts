import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Pfad, unter dem die App liegt: „/“ (Vercel) oder z. B. „/politik-duell/“ (GitHub Pages, siehe
// .github/workflows/pages.yml).
const base = process.env.BASIS_PFAD ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    // Service Worker: speichert nur die App selbst (HTML, JS, CSS, Icons), damit sie installiert und ohne Netz startet. Anfragen an Supabase und die KI laufen
    // immer live – Spielstände oder Eingaben landen nie im Cache.
    VitePWA({
      registerType: 'autoUpdate',
      // Externe registerSW.js statt Inline-Skript (Content-Security-Policy: script-src 'self')
      injectRegister: 'script',
      // Das Manifest liegt schon in public/manifest.webmanifest.
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        // Der echte Katalog (VITE_DATENQUELLE=katalog) ist ein einzelner Chunk über 2 MiB (Workbox-Standard),
        // soll aber offline verfügbar bleiben.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        runtimeCaching: [],
      },
    }),
  ],
})
