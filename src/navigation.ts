import { useSyncExternalStore } from 'react'

// Unterseiten (#/impressum, #/datenschutz, #/methode, #/themen) liegen über dem
// Spiel, damit eine laufende Partie erhalten bleibt.
const UNTERSEITEN = ['#/impressum', '#/datenschutz', '#/methode', '#/themen']

export const istUnterseite = (hash: string) => UNTERSEITEN.some((s) => hash.startsWith(s))

// Wurde die Unterseite aus der App heraus geöffnet? Dann führt „Zurück“ per
// history.back() ins laufende Spiel, sonst zur Startseite.
let ausDerApp = false
addEventListener('hashchange', (e) => {
  ausDerApp = !istUnterseite(new URL(e.oldURL).hash)
})

export function zurueck() {
  if (ausDerApp) history.back()
  else location.hash = '#/'
}

export const useHash = () =>
  useSyncExternalStore(
    (f) => (addEventListener('hashchange', f), () => removeEventListener('hashchange', f)),
    () => location.hash,
  )
