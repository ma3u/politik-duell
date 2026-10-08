import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/atkinson-hyperlegible-next'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import './index.css'
import { Wurzel } from './Wurzel.tsx'
import { speichereZugang } from './data/quelle.ts'

// Zugangslink zur geschlossenen Testphase (#/testphase/<token>): Token merken und aus
// der Adresszeile entfernen – so landet er nicht in Lesezeichen, Verlauf oder beim Teilen.
// Der Token steht im Hash und geht deshalb nie an den Webserver.
addEventListener('hashchange', () => location.hash.startsWith('#/testphase/') && location.reload())
if (location.hash.startsWith('#/testphase/')) {
  speichereZugang(location.hash.slice('#/testphase/'.length))
  history.replaceState(null, '', `${location.pathname}${location.search}#/`)
}

// Startseite der Fassung (VITE_STARTSEITE=quiz, so auf GitHub Pages): Wer die Adresse ohne Unterseite öffnet,
// landet im Programm-Quiz. Nur beim Laden – „Politik-Duell“ im Kopf (#/) führt danach weiter zum Duell.
if (import.meta.env.VITE_STARTSEITE === 'quiz' && ['', '#', '#/'].includes(location.hash)) {
  history.replaceState(null, '', `${location.pathname}${location.search}#/quiz`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Wurzel />
  </StrictMode>,
)
