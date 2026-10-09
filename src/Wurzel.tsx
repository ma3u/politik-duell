import { lazy, Suspense } from 'react'
import App from './App.tsx'
import { useHash, zurueck } from './navigation.ts'
import { Rechtliches, type RechtsSeite } from './rechtliches/Rechtliches.tsx'

// Admin-Ansicht unter #/admin – eigenes Bundle, wird nur dort geladen.
const Admin = lazy(() => import('./admin/Admin.tsx').then((m) => ({ default: m.Admin })))
// Prüfseite für Eingeladene unter #/pruefen/<token> – ebenfalls eigenes Bundle
// (enthält den ganzen Datenkatalog mit Entwürfen).
const Pruefseite = lazy(() => import('./pruefung/Pruefseite.tsx').then((m) => ({ default: m.Pruefseite })))

function rechtsSeite(hash: string): RechtsSeite | null {
  if (hash.startsWith('#/impressum')) return 'impressum'
  if (hash.startsWith('#/datenschutz')) return 'datenschutz'
  if (hash.startsWith('#/methode')) return 'methode'
  return null
}

export function Wurzel() {
  const hash = useHash()
  const seite = rechtsSeite(hash)

  if (hash.startsWith('#/admin'))
    return (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    )
  // Der Token steht im Hash: Er geht so nie an den Webserver (keine Server-Logs).
  if (hash.startsWith('#/pruefen/'))
    return (
      <Suspense fallback={null}>
        <Pruefseite token={hash.slice('#/pruefen/'.length)} />
      </Suspense>
    )
  // Die App bleibt unter der Rechtsseite geladen, damit ein laufendes Spiel erhalten bleibt.
  // Die Themenübersicht (#/themen) zeigt die App selbst, weil sie deren Daten braucht.
  return (
    <>
      {seite && <Rechtliches seite={seite} onZurueck={zurueck} />}
      <div hidden={seite !== null}>
        <App />
      </div>
    </>
  )
}
