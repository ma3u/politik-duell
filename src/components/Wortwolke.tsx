import cloud from 'd3-cloud'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import type { Wort } from '../data/wortwolke'

// Hintergrund-Wortwolke: die Themen, die das Spiel kennt, Größe nach Zahl der
// Ursachen. Auf der Startseite über die ganze Fläche, im Spiel nur in den Rändern
// neben der Spielspalte. Layout per d3-cloud; die Wörter tauchen aus dem Nebel
// auf und schweben langsam (CSS).

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

/** Breite der Spielspalte (`.app`), Abstand der Wörter zu ihr und zum Fensterrand (Platz fürs Schweben). */
const SPALTE = 720
const ABSTAND = 24
const AUSSEN = 32
/** Schmalere Ränder bleiben leer – dort passt kaum ein Thema hinein. */
const MIN_RAND = 180
const KEINE: Wort[] = []
const KEINE_PLAETZE: Platziert[] = []
/** Zusätzlicher Zeilenabstand in den Rändern, damit sich Wörter beim Schweben nicht berühren. */
const RAND_ABSTAND = 14

const textBreite = (text: string, size: number) => {
  const b = breiteBei100(text)
  return b ? (b * size) / 100 : 0.62 * size * text.length
}

/**
 * Ränder im Spiel: Wörter untereinander, je Zeile zufällig nach links oder rechts
 * versetzt, als Ganzes senkrecht zentriert. d3-cloud eignet sich für die schmalen,
 * hohen Streifen nicht – es verwirft dort viele Wörter und setzt die Gruppe mal
 * oben, mal unten ab. Zu breite Wörter werden verkleinert; reicht die Höhe nicht,
 * werden alle gleichmäßig kleiner.
 */
function stapel(
  woerter: Wort[],
  [breite, hoehe]: [number, number],
  schrift: (w: Wort) => number,
  zufall: () => number,
) {
  // Gemischt (fest je Thema), damit große und kleine Wörter abwechseln.
  const reihe = [...woerter].sort((a, b) => hash(a.text) - hash(b.text))
  const wunsch = reihe.map((w) =>
    Math.min(schrift(w), (100 * breite) / (breiteBei100(w.text) ?? 0.62 * 100 * w.text.length)),
  )
  const summe = wunsch.reduce((a, s) => a + 1.25 * s, 0)
  const faktor = Math.min(1, (hoehe - 80 - reihe.length * RAND_ABSTAND) / summe)
  const groessen = wunsch.map((s) => s * faktor)
  const zeile = (s: number) => 1.25 * s + RAND_ABSTAND
  let oben = -groessen.reduce((a, s) => a + zeile(s), 0) / 2
  return reihe.map((w, i): Platziert => {
    const size = groessen[i]
    const spiel = Math.max(0, (breite - textBreite(w.text, size)) / 2)
    // Grundlinie so, dass die Großbuchstaben mittig in der Zeile stehen.
    const y = oben + zeile(size) / 2 + 0.35 * size
    oben += zeile(size)
    return { text: w.text, anzahl: w.anzahl, size, x: (zufall() * 2 - 1) * spiel, y }
  })
}

/** Von d3-cloud gesetzt: Ausdehnung eines Worts um seinen Mittelpunkt. */
type Gesetzt = Platziert & { x0?: number; x1?: number; y0?: number; y1?: number }

/**
 * d3-cloud beginnt jedes Wort an einer zufälligen Stelle im mittleren Bereich – in
 * schmalen Rändern landet die ganze Gruppe dann mal oben, mal unten. Deshalb wird
 * die fertige Gruppe in der Fläche zentriert.
 */
function mittig(woerter: Gesetzt[]): Platziert[] {
  if (!woerter.length) return []
  const xs = woerter.flatMap((w) => [w.x + (w.x0 ?? 0), w.x + (w.x1 ?? 0)])
  const ys = woerter.flatMap((w) => [w.y + (w.y0 ?? 0), w.y + (w.y1 ?? 0)])
  const dx = (Math.min(...xs) + Math.max(...xs)) / 2
  const dy = (Math.min(...ys) + Math.max(...ys)) / 2
  return woerter.map(({ text, anzahl, size, x, y }) => ({ text, anzahl, size, x: x - dx, y: y - dy }))
}

let messflaeche: CanvasRenderingContext2D | null | undefined
/** Textbreite in Pixeln bei Schriftgröße 100 (null, wenn der Browser nicht messen kann). */
function breiteBei100(text: string): number | null {
  messflaeche ??= document.createElement('canvas').getContext('2d')
  if (!messflaeche) return null
  messflaeche.font = `800 100px ${SCHRIFT}`
  return messflaeche.measureText(text).width
}

/** Schriftgröße je Wort: Themen mit mehr Ursachen größer, bei gleicher Zahl leichte Abwechslung. */
function schriftFuer(woerter: Wort[], fenster: number) {
  const max = Math.max(...woerter.map((w) => w.anzahl))
  const groesste = Math.min(44, Math.max(24, fenster / 14))
  const kleinste = fenster < 500 ? 13 : 16
  return (w: Wort) =>
    kleinste + (groesste - kleinste) * Math.sqrt(max > 1 ? (w.anzahl - 1) / (max - 1) : 0) + (hash(w.text) % 3) * 2
}

const zufallFuer = (woerter: Wort[], breite: number) => zufall(woerter.length * 7919 + breite)

/**
 * Ordnet Wörter in einer Fläche an: als Wolke (d3-cloud, asynchron) oder in den
 * Rändern als Stapel (sofort). Die Schriftgröße richtet sich nach der Breite des
 * Fensters, damit die Wörter auf der Startseite und im Spiel gleich groß sind.
 */
function useLayout(woerter: Wort[], flaeche: [number, number] | null, fenster: number, stapeln: boolean): Platziert[] {
  const [stand, setStand] = useState<{ fuer: Wort[]; platziert: Platziert[] }>({ fuer: KEINE, platziert: [] })
  const bereit = !!flaeche && flaeche[0] >= 50 && woerter.length > 0

  const gestapelt = useMemo(
    () =>
      stapeln && bereit && flaeche
        ? stapel(woerter, flaeche, schriftFuer(woerter, fenster), zufallFuer(woerter, flaeche[0]))
        : KEINE_PLAETZE,
    [stapeln, bereit, woerter, flaeche, fenster],
  )

  useEffect(() => {
    if (stapeln || !bereit || !flaeche) return
    const layout = cloud<Platziert & cloud.Word>()
      .size(flaeche)
      .words(woerter.map((w) => ({ ...w, size: 0, x: 0, y: 0 })))
      .text((w) => w.text)
      .font(SCHRIFT)
      .fontWeight(800)
      .fontSize(schriftFuer(woerter, fenster))
      .rotate(0)
      .padding(4)
      .random(zufallFuer(woerter, flaeche[0]))
      .on('end', (w) => setStand({ fuer: woerter, platziert: mittig(w) }))
    layout.start()
    return () => void layout.stop()
  }, [stapeln, bereit, woerter, flaeche, fenster])

  if (stapeln) return gestapelt
  // Ein altes Layout für andere Wörter (etwa nach dem Wechsel zwischen ganzer Fläche und Rändern) nicht zeigen.
  return stand.fuer === woerter ? stand.platziert : KEINE_PLAETZE
}

/**
 * Wortwolke im Hintergrund. `nurRaender`: im Spiel nur links und rechts neben der
 * Spielspalte, damit kein Wort hinter Text liegt; bei schmalem Fenster gar nicht.
 */
export function Wortwolke({ woerter, nurRaender = false }: { woerter: Wort[]; nurRaender?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const groesse = useGroesse(ref)
  const fenster = groesse?.[0] ?? 0
  const rand = (fenster - SPALTE) / 2 - ABSTAND - AUSSEN
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
    ...useLayout(links, nurRaender ? randFlaeche : groesse, fenster, nurRaender).map((w, nr) => ({
      ...w,
      x: w.x - (nurRaender ? versatz : 0),
      nr,
    })),
    ...useLayout(rechts, randFlaeche, fenster, true).map((w, nr) => ({ ...w, x: w.x + versatz, nr })),
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
            // Neuer Schlüssel beim Wechsel Startseite ↔ Spiel: Die Wörter tauchen neu auf, statt quer über die Seite zu gleiten.
            <g
              key={`${nurRaender ? 'rand' : 'wolke'}-${w.text}`}
              className="wolke-platz"
              style={{ transform: `translate(${w.x}px, ${w.y}px)` }}
            >
              {/* Taucht nacheinander aus dem Nebel auf (beide Ränder gleichzeitig): wird sichtbar, scharf und größer. */}
              <g className="wolke-nebel" style={{ animationDelay: `${w.nr * 0.18}s` }}>
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
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}
