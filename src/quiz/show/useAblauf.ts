import { useEffect, useRef, useState } from 'react'
import { POP_MS, type Marke, type Schritt } from './ablauf'
import { clipMs, klang, pause, sprich, untertitelLeeren } from './ton'

export interface Ablaufstand {
  marke: Marke | null
  /** Gesprochenes Wort (bzw. Takt) im laufenden Schritt; −1 = noch keins. */
  wort: number
  /** Alle bisherigen Marken – so bleibt sichtbar, was schon dran war. */
  gewesen: Marke[]
  fertig: boolean
}

/**
 * Spielt die Schritte der Show nacheinander ab. `schritte` muss stabil sein (useMemo/useState) – ein neues Array
 * startet von vorn. `onWort` meldet jedes Wort/jeden Takt, `onEnde` das Ende (auch nach Überspringen).
 */
export function useAblauf(
  schritte: Schritt[] | null,
  { onWort, onEnde }: { onWort?: (marke: Marke, i: number) => void; onEnde?: () => void } = {},
) {
  const [stand, setStand] = useState<Ablaufstand>({ marke: null, wort: -1, gewesen: [], fertig: !schritte?.length })
  const abbruch = useRef<AbortController | null>(null)
  const rufe = useRef({ onWort, onEnde })
  rufe.current = { onWort, onEnde }
  const beendet = useRef(false)

  const ende = () => {
    if (beendet.current) return
    beendet.current = true
    setStand((s) => ({ ...s, fertig: true, gewesen: [...new Set([...s.gewesen, ...(schritte ?? []).map((x) => x.marke)])] }))
    rufe.current.onEnde?.()
  }

  useEffect(() => {
    if (!schritte?.length) return
    const ac = new AbortController()
    abbruch.current = ac
    beendet.current = false
    void (async () => {
      // Fester Zeitplan ab Start: Jeder Schritt endet zu seiner geplanten Zeit (wie dauerMs), egal wie pünktlich
      // der Browser Timer ausführt – alle Geräte bleiben im Takt.
      const start = performance.now()
      let plan = 0
      const bis = (ms: number) => Math.max(0, start + ms - performance.now())
      try {
        for (const s of schritte) {
          setStand((st) => ({ ...st, marke: s.marke, wort: -1, gewesen: [...new Set([...st.gewesen, s.marke])] }))
          if (s.klang) klang(s.klang)
          const melde = (i: number) => {
            setStand((st) => ({ ...st, wort: i }))
            rufe.current.onWort?.(s.marke, i)
          }
          if (s.clip) {
            plan += clipMs(s.clip) + 120
            await sprich(s.clip, { signal: ac.signal, onWort: melde, bis: start + plan })
          }
          for (let i = 0; i < (s.takte ?? 0); i++) {
            melde(i)
            plan += POP_MS
            await pause(bis(plan), ac.signal)
          }
          if (s.pause) {
            plan += s.pause
            await pause(bis(plan), ac.signal)
          }
        }
      } catch {
        // abgebrochen (Überspringen oder Ansicht verlassen)
      }
      untertitelLeeren()
      if (!ac.signal.aborted) ende()
    })()
    return () => {
      ac.abort()
      untertitelLeeren()
    }
    // Nur bei neuen Schritten neu starten.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [schritte])

  return {
    ...stand,
    ueberspringen: () => {
      abbruch.current?.abort()
      untertitelLeeren()
      ende()
    },
  }
}
