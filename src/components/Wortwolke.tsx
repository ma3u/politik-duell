import cloud from 'd3-cloud'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import type { Wort } from '../data/wortwolke'

// Hintergrund-Wortwolke: die Themen, die das Spiel kennt, Größe nach Zahl der
// Ursachen. Auf der Startseite über die ganze Fläche, im Spiel nur in den Rändern
// neben der Spielspalte. Layout per d3-cloud; die Wörter schweben langsam (CSS).

interface Platziert {
  text: string
  anzahl: number
  size: number
  x: number
  y: number
}

const SCHRIFT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

/** Fester Zufall, damit dieselben Wörter immer dasselbe Bild ergeben. */
function zufall(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (s: string) => [...s].reduce((h, z) => (h * 31 + z.charCodeAt(0)) >>> 0, 7)

function useGroesse(ref: RefObject<HTMLElement | null>) {
  const [groesse, setGroesse] = useState<[number, number] | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const messen = () => {
      const w = Math.round(el.clientWidth)
      const h = Math.round(el.clientHeight)
      setGroesse((alt) => (alt && Math.abs(alt[0] - w) < 40 && Math.abs(alt[1] - h) < 40 ? alt : [w, h]))
    }
    messen()
    const beobachter = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(messen, 200)
    })
    beobachter.observe(el)
    return () => {
      clearTimeout(timer)
      beobachter.disconnect()
    }
  }, [ref])
  return groesse
}

/** Breite der Spielspalte (`.app`) und Abstand der Wörter zu ihr. */
const SPALTE = 720
const ABSTAND = 24
/** Schmalere Ränder bleiben leer – dort passt kaum ein Thema hinein. */
const MIN_RAND = 180
const KEINE: Wort[] = []
/** Abstand zwischen Wörtern in den Rändern: Dort stehen sie übereinander und dürfen sich beim Schweben nicht berühren. */
const RAND_ABSTAND = 14

/**
 * Ordnet Wörter in einer Fläche an. Die Schriftgröße richtet sich nach der Breite
 * des Fensters, damit die Wörter in der ganzen Wolke und in den Rändern gleich groß sind.
 */
function useLayout(woerter: Wort[], flaeche: [number, number] | null, fenster: number, abstand: number): Platziert[] {
  const [stand, setStand] = useState<{ fuer: Wort[]; platziert: Platziert[] }>({ fuer: KEINE, platziert: [] })

  useEffect(() => {
    if (!flaeche || flaeche[0] < 50 || woerter.length === 0) return
    const [breite, hoehe] = flaeche
    const max = Math.max(...woerter.map((w) => w.anzahl))
    const groesste = Math.min(44, Math.max(24, fenster / 14))
    const kleinste = fenster < 500 ? 13 : 16
    // Themen mit mehr Ursachen größer; bei gleicher Zahl leichte Abwechslung.
    const schrift = (w: Wort) =>
      kleinste + (groesste - kleinste) * Math.sqrt(max > 1 ? (w.anzahl - 1) / (max - 1) : 0) + (hash(w.text) % 3) * 2
    const layout = cloud<Platziert & cloud.Word>()
      .size([breite, hoehe])
      .words(woerter.map((w) => ({ ...w, size: 0, x: 0, y: 0 })))
      .text((w) => w.text)
      .font(SCHRIFT)
      .fontWeight(800)
      .fontSize(schrift)
      .rotate(0)
      .padding(abstand)
      .random(zufall(woerter.length * 7919 + breite))
      .on('end', (w) =>
        setStand({ fuer: woerter, platziert: w.map(({ text, anzahl, size, x, y }) => ({ text, anzahl, size, x, y })) }),
      )
    layout.start()
    return () => void layout.stop()
  }, [woerter, flaeche, fenster, abstand])

  // Ein altes Layout für andere Wörter (etwa nach dem Wechsel zwischen ganzer Fläche und Rändern) nicht zeigen.
  return stand.fuer === woerter ? stand.platziert : []
}

/**
 * Wortwolke im Hintergrund. `nurRaender`: im Spiel nur links und rechts neben der
 * Spielspalte, damit kein Wort hinter Text liegt; bei schmalem Fenster gar nicht.
 */
export function Wortwolke({ woerter, nurRaender = false }: { woerter: Wort[]; nurRaender?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const groesse = useGroesse(ref)
  const fenster = groesse?.[0] ?? 0
  const rand = (fenster - SPALTE) / 2 - ABSTAND
  const raender = nurRaender && rand >= MIN_RAND
  const randFlaeche = useMemo<[number, number] | null>(
    () => (groesse && raender ? [Math.round(rand), groesse[1]] : null),
    [groesse, raender, rand],
  )

  // Ganze Fläche: alle Wörter. Ränder: abwechselnd links und rechts.
  const [links, rechts] = useMemo(
    () =>
      !nurRaender
        ? [woerter, KEINE]
        : raender
          ? [woerter.filter((_, i) => i % 2 === 0), woerter.filter((_, i) => i % 2 === 1)]
          : [KEINE, KEINE],
    [woerter, nurRaender, raender],
  )
  const versatz = SPALTE / 2 + ABSTAND + rand / 2
  const platziert = [
    ...useLayout(links, nurRaender ? randFlaeche : groesse, fenster, nurRaender ? RAND_ABSTAND : 4).map((w) => ({
      ...w,
      x: w.x - (nurRaender ? versatz : 0),
    })),
    ...useLayout(rechts, randFlaeche, fenster, RAND_ABSTAND).map((w) => ({ ...w, x: w.x + versatz })),
  ]
  const max = Math.max(1, ...platziert.map((w) => w.anzahl))

  return (
    <div className="wortwolke" ref={ref} aria-hidden="true">
      {groesse && (
        <svg
          width={groesse[0]}
          height={groesse[1]}
          viewBox={`${-groesse[0] / 2} ${-groesse[1] / 2} ${groesse[0]} ${groesse[1]}`}
        >
          {platziert.map((w, i) => (
            <g key={w.text} className="wolke-platz" style={{ transform: `translate(${w.x}px, ${w.y}px)` }}>
              <text
                className="wolke-wort"
                textAnchor="middle"
                style={{
                  fontSize: w.size,
                  fontFamily: SCHRIFT,
                  opacity: 0.08 + 0.07 * (w.anzahl / max),
                  animationDelay: `${-i * 2.3}s`,
                  animationDuration: `${20 + (i % 5) * 4}s`,
                }}
              >
                {w.text}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}
