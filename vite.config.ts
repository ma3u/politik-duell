import { rmSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Quizfragen mit KI-Entwürfen (npm run quiz:erzeugen -- --entwuerfe) sind nur für `npm run dev` gedacht –
// nie im Build, auch wenn die Datei lokal in public/ liegt.
const ohneQuizEntwurf = (): Plugin => ({
  name: 'ohne-quiz-entwurf',
  apply: 'build',
  writeBundle(optionen) {
    rmSync(`${optionen.dir ?? 'dist'}/quiz/fragen-entwurf.json`, { force: true })
  },
})

// https://vite.dev/config/
export default defineConfig({
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
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}', 'quiz/fragen.json'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [],
      },
    }),
  ],
})
