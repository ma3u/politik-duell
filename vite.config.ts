import { rmSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Quizfragen mit KI-Entwürfen (npm run quiz:erzeugen -- --entwuerfe) kommen nur ins Build, wenn
// VITE_QUIZ_ENTWUERFE=true gesetzt ist (Testversion auf GitHub Pages, mit Hinweis im Quiz) – sonst nie, auch
// wenn die Datei lokal in public/ liegt.
const MIT_QUIZ_ENTWUERFEN = process.env.VITE_QUIZ_ENTWUERFE === 'true'
const ohneQuizEntwurf = (): Plugin => ({
  name: 'ohne-quiz-entwurf',
  apply: 'build',
  writeBundle(optionen) {
    if (MIT_QUIZ_ENTWUERFEN) return
    rmSync(`${optionen.dir ?? 'dist'}/quiz/fragen-entwurf.json`, { force: true })
  },
})

// Pfad, unter dem die App liegt: „/“ (Vercel) oder z. B. „/politik-duell/“ (GitHub Pages, siehe
// .github/workflows/pages.yml).
const base = process.env.BASIS_PFAD ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    ohneQuizEntwurf(),
    // Service Worker: speichert nur die App selbst (HTML, JS, CSS, Icons) und die Quizfragen
    // (public/quiz/fragen.json), damit sie installiert und ohne Netz startet. Anfragen an Supabase und die KI laufen
    // immer live – Spielstände oder Eingaben landen nie im Cache.
    VitePWA({
      registerType: 'autoUpdate',
      // Externe registerSW.js statt Inline-Skript (Content-Security-Policy: script-src 'self')
      injectRegister: 'script',
      // Das Manifest liegt schon in public/manifest.webmanifest.
      manifest: false,
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,webmanifest}',
          MIT_QUIZ_ENTWUERFEN ? 'quiz/*.json' : 'quiz/fragen.json',
          // Stimmen und Geräusche der Quiz-Show (ca. 3 MB), damit sie auch offline spielt.
          'quiz/audio/*.{mp3,json}',
        ],
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
