import { useEffect, useRef, useSyncExternalStore } from 'react'

// Hilfen für Barrierefreiheit (WCAG 2.2 AA), für Spiel und Unterseiten gemeinsam.

// Erst nach der ersten Eingabe (Tippen, Klicken, Taste) verschiebt die App den Fokus – beim Laden der Seite
// bleibt er, wo der Browser ihn hat.
let benutzt = false
if (typeof addEventListener === 'function')
  for (const art of ['pointerdown', 'keydown'] as const) addEventListener(art, () => (benutzt = true), { capture: true, once: true })

/**
 * Wechsel der Ansicht in der Einseiten-App: Seitentitel setzen (2.4.2) und den Fokus auf die Überschrift der neuen
 * Ansicht legen (2.4.3), damit Tastatur und Screenreader nicht im Nichts landen. `schluessel` ändert sich, wenn
 * innerhalb einer Ansicht etwas Neues
 * erscheint (etwa die nächste Frage).
 */
export function useAnsicht<T extends HTMLElement = HTMLHeadingElement>(titel: string, schluessel: unknown = titel) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const vorher = document.title
    document.title = titel ? `${titel} – Politik-Duell` : 'Politik-Duell'
    // Unterseiten liegen über dem Spiel: Beim Schließen gilt wieder der Titel darunter.
    return () => {
      document.title = vorher
    }
  }, [titel])
  useEffect(() => {
    if (!benutzt) return
    const el = ref.current
    if (!el) return
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
    scrollTo({ top: 0 })
  }, [schluessel])
  return ref
}

// „Bewegung anhalten“ (2.2.2): nur für diesen Besuch im Arbeitsspeicher, nichts wird im Browser gespeichert.
const hoerer = new Set<() => void>()
let bewegungAus = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

function setzeBewegung(aus: boolean) {
  bewegungAus = aus
  if (aus) document.documentElement.dataset.bewegung = 'aus'
  else delete document.documentElement.dataset.bewegung
  hoerer.forEach((h) => h())
}

export function useBewegung(): [aus: boolean, umschalten: () => void] {
  const aus = useSyncExternalStore(
    (h) => (hoerer.add(h), () => hoerer.delete(h)),
    () => bewegungAus,
  )
  return [aus, () => setzeBewegung(!bewegungAus)]
}

/** Unterseite über dem Spiel: Beim Schließen bekommt das Element den Fokus zurück, das vorher ihn hatte. */
export function useFokusZurueck() {
  useEffect(() => {
    const vorher = document.activeElement
    return () => {
      if (vorher instanceof HTMLElement && vorher.isConnected) requestAnimationFrame(() => vorher.focus({ preventScroll: true }))
    }
  }, [])
}
