import cloud from 'd3-cloud'
import { type RefObject, useEffect, useRef, useState } from 'react'
import type { Wort } from '../data/wortwolke'

// Hintergrund-Wortwolke des Startbildschirms: die Themen, die das Spiel kennt, Größe nach
// Zahl der Ursachen. Layout per d3-cloud; die Wörter schweben langsam (CSS).

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

function useLayout(woerter: Wort[], groesse: [number, number] | null): Platziert[] {
  const [platziert, setPlatziert] = useState<Platziert[]>([])

  useEffect(() => {
    if (!groesse || groesse[0] < 50 || woerter.length === 0) return
    const [breite, hoehe] = groesse
    const max = Math.max(...woerter.map((w) => w.anzahl))
    const groesste = Math.min(52, Math.max(28, breite / 12))
    const kleinste = breite < 500 ? 15 : 18
    // Themen mit mehr Ursachen größer; bei gleicher Häufigkeit leichte Abwechslung.
    const schrift = (w: Wort) =>
      kleinste +
      (groesste - kleinste) * Math.sqrt(max > 1 ? (w.anzahl - 1) / (max - 1) : 0) +
      (hash(w.text) % 4) * 2
    const layout = cloud<Platziert & cloud.Word>()
      .size([breite, hoehe])
      .words(woerter.map((w) => ({ ...w, size: 0, x: 0, y: 0 })))
      .text((w) => w.text)
      .font(SCHRIFT)
      .fontWeight(800)
      .fontSize(schrift)
      .rotate(0)
      .padding(4)
      .random(zufall(woerter.length * 7919 + breite))
      .on('end', (w) => setPlatziert(w.map(({ text, anzahl, size, x, y }) => ({ text, anzahl, size, x, y }))))
    layout.start()
    return () => void layout.stop()
  }, [woerter, groesse])

  return platziert
}

export function Wortwolke({ woerter }: { woerter: Wort[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const groesse = useGroesse(ref)
  const platziert = useLayout(woerter, groesse)
  const max = Math.max(1, ...platziert.map((w) => w.anzahl))

  return (
    <div className="wortwolke" ref={ref} aria-hidden="true">
      {groesse && (
        <svg width={groesse[0]} height={groesse[1]} viewBox={`${-groesse[0] / 2} ${-groesse[1] / 2} ${groesse[0]} ${groesse[1]}`}>
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
