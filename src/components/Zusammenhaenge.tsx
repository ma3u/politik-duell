import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from 'd3-force'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Daten } from '../data/quelle'
import {
  type Ausschnitt,
  graphPunkt,
  halteImGraph,
  MAX_ZOOM,
  verschiebe,
  vergroesserung,
  zoomeUm,
} from '../logic/ansicht'
import { EVIDENZ_TEXT } from '../logic/forderung'
import { baueGraph, obersteKnoten, type Knoten, type KnotenArt, type Strang } from '../logic/graph'

// Aufklappbarer Graph unter #/themen in drei Strängen (siehe logic/graph.ts):
// Probleme (Themen → Ursachen → Maßnahmen), Forderungen (Themen → Lösungswege →
// Maßnahmen) und Haltungen (Haltungen → Positionen, Zielkonflikte, verwandte Themen).
// Knotengröße nach Menge. Tippen klappt auf und zu, Ziehen verschiebt Knoten. Zoomen
// per Knöpfen, Strg + Mausrad oder Pinch, Ziehen am Hintergrund verschiebt den
// Ausschnitt (siehe logic/ansicht.ts). Maßnahmen sind bewusst ohne Partei und
// Punkte dargestellt, Positionen ohne ihren Inhalt.

interface SimKnoten extends SimulationNodeDatum, Knoten {
  r: number
}
interface SimKante {
  source: SimKnoten | string
  target: SimKnoten | string
}

const MIN_HOEHE = 220
/** Vergrößerung je Knopfdruck. */
const ZOOM_SCHRITT = 1.6
/** Knoten ohne eigene Kinder: kurze Kanten, schwache Abstoßung. */
const BLATT: ReadonlySet<KnotenArt> = new Set(['massnahme', 'position', 'zielkonflikt'])

function radius(k: Knoten, strang: Strang): number {
  if (k.art === 'thema') return strang === 'haltung' ? 9 : 10 + 1.6 * Math.sqrt(k.massnahmen)
  if (k.art === 'ursache' || k.art === 'instrument') return 5 + 1.4 * Math.sqrt(k.anzahl)
  if (k.art === 'haltung') return 16
  if (k.art === 'position') return 6
  return 4
}
const kurz = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)
const zahl = (n: number) => n.toLocaleString('de-DE')
const mz = (n: number, eins: string, viele: string) => `${zahl(n)} ${n === 1 ? eins : viele}`

const STRAENGE: { strang: Strang; label: string; titel: string; erklaerung: string }[] = [
  {
    strang: 'problem',
    label: 'Probleme',
    titel: 'Themen, Ursachen und Maßnahmen',
    erklaerung:
      'Ein Alltagsproblem wird einem Thema und seinen Ursachen zugeordnet; gewertet werden die Maßnahmen, die an diesen Ursachen ansetzen. Tippe auf ein Thema für seine Ursachen und auf eine Ursache für die Maßnahmen. Kreisgröße: Zahl der Maßnahmen (alle Parteien zusammen).',
  },
  {
    strang: 'forderung',
    label: 'Forderungen',
    titel: 'Themen, Lösungswege und Maßnahmen',
    erklaerung:
      'Eine Forderung wird einem Lösungsweg zugeordnet; die Forderungskarte zeigt, in welchen Programmen er steht – ohne Punkte. Tippe auf ein Thema für seine Lösungswege und auf einen Lösungsweg für die Maßnahmen, die ihn enthalten. Kreisgröße: Zahl der Maßnahmen.',
  },
  {
    strang: 'haltung',
    label: 'Haltungen',
    titel: 'Haltungen, Positionen und Zielkonflikte',
    erklaerung:
      'Eine Wertfrage, über die man verschieden denken kann. Die Haltungskarte zeigt die Position jeder Partei und die Zielkonflikte beider Seiten – ohne Punkte, und nur, wenn alle Positionen erfasst sind. Tippe auf eine Haltung; der Graph zeigt nur, ob eine Position erfasst ist, nicht welche.',
  },
]

function beschreibe(k: Knoten, strang: Strang): string {
  if (k.art === 'thema') {
    if (strang === 'forderung')
      return `Thema ${k.text}: ${mz(k.anzahl, 'Lösungsweg', 'Lösungswege')}, ${mz(k.massnahmen, 'Maßnahme', 'Maßnahmen')} mit Lösungsweg.`
    if (strang === 'haltung') return `Verwandtes Thema ${k.text}: ${mz(k.anzahl, 'Ursache', 'Ursachen')}.`
    return `Thema ${k.text}: ${mz(k.anzahl, 'Ursache', 'Ursachen')}, ${mz(k.massnahmen, 'Maßnahme', 'Maßnahmen')}.`
  }
  if (k.art === 'instrument')
    return (
      `Lösungsweg (${k.ebene === 'land' ? 'Landesprogramme' : 'Bundesprogramme'}${k.ki_entwurf ? ', KI-Entwurf' : ''}): ${k.text} – ` +
      (k.anzahl ? `${mz(k.anzahl, 'Maßnahme', 'Maßnahmen')} aus den Programmen von ${mz(k.massnahmen, 'Partei', 'Parteien')}` : 'noch keine Maßnahme zugeordnet') +
      (k.evidenz ? `. ${EVIDENZ_TEXT[k.evidenz]}.` : '.')
    )
  if (k.art === 'haltung')
    return `Haltung: ${k.text} – ${k.erfasst ? 'alle Positionen erfasst, im Spiel.' : `${zahl(k.anzahl)} Positionen erfasst, noch nicht im Spiel.`}`
  if (k.art === 'position')
    return `Position ${k.text}: ${k.erfasst ? `erfasst${k.ki_entwurf ? ' (KI-Entwurf)' : ''}` : 'noch nicht erfasst'}.`
  if (k.art === 'zielkonflikt') return `Zielkonflikt (Seite „${k.seite}“): ${k.text}`
  if (k.art === 'ursache')
    return (
      `Ursache (${k.ebene === 'land' ? 'Länderzuständigkeit' : 'Bund'}): ${k.text} – ` +
      (k.anzahl
        ? `${zahl(k.anzahl)} ${k.anzahl === 1 ? 'Maßnahme setzt' : 'Maßnahmen setzen'} hier an.`
        : 'noch keine Maßnahme erfasst.')
    )
  return (
    `Maßnahme (${k.land ? `Landesprogramm ${k.land}` : 'Bundesprogramm'}${k.ki_entwurf ? ', KI-Entwurf' : ''}): ${k.text}` +
    (strang === 'problem' && k.anzahl > 1 ? ` – setzt an ${k.anzahl} Ursachen an.` : '')
  )
}

const bewegungArm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function Zusammenhaenge({ daten }: { daten: Daten }) {
  const [strang, setStrang] = useState<Strang>('problem')
  const [offen, setOffen] = useState<ReadonlySet<string>>(new Set())
  const [aktiv, setAktiv] = useState<string | null>(null)
  const [, setTakt] = useState(0)
  const svg = useRef<SVGSVGElement>(null)
  // Letzte Positionen je Knoten, damit Aufklappen den Graphen nicht neu würfelt.
  const [positionen] = useState(() => new Map<string, SimKnoten>())
  const ziehen = useRef<{ k: SimKnoten; x: number; y: number; bewegt: boolean } | null>(null)
  // Eigener Ausschnitt nach Zoomen oder Verschieben; null = der ganze Graph, passend eingepasst.
  const [ansicht, setAnsicht] = useState<Ausschnitt | null>(null)
  // Aktive Zeiger (Finger, Maus) für Verschieben und Pinch; Pixel im Fenster.
  const zeiger = useRef(new Map<number, { x: number; y: number }>())
  const geste = useRef<{ art: 'schieben' } | { art: 'pinch'; abstand: number; x: number; y: number } | null>(null)

  const graph = useMemo(() => baueGraph(daten, strang, offen), [daten, strang, offen])
  // Breite der Zeichenfläche in Pixeln: 1 Einheit im Graphen = 1 Pixel, solange er passt.
  const [breite, setBreite] = useState(600)
  const schmal = breite < 480
  useEffect(() => {
    const el = svg.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const beobachter = new ResizeObserver(([e]) => setBreite(Math.max(260, Math.round(e.contentRect.width))))
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [])

  // Knoten übernehmen ihre alte Position; neue starten bei ihrem Elternknoten.
  const knoten = useMemo(() => {
    const alt = new Map(positionen)
    const eltern = new Map(graph.kanten.map((k) => [k.zu, k.von]))
    const neu = new Map<string, SimKnoten>()
    graph.knoten.forEach((k, i) => {
      const vorher = alt.get(k.schluessel)
      const e = alt.get(eltern.get(k.schluessel) ?? '')
      const winkel = (i / graph.knoten.length) * 2 * Math.PI
      neu.set(k.schluessel, {
        ...k,
        r: radius(k, strang),
        x: vorher?.x ?? (e?.x ?? 0) + Math.cos(winkel) * 20,
        y: vorher?.y ?? (e?.y ?? 0) + Math.sin(winkel) * 20,
        vx: vorher?.vx,
        vy: vorher?.vy,
        fx: vorher?.fx,
        fy: vorher?.fy,
      })
    })
    positionen.clear()
    for (const [s, k] of neu) positionen.set(s, k)
    return [...neu.values()]
  }, [graph, positionen, strang])
  const kanten = useMemo<SimKante[]>(() => graph.kanten.map((k) => ({ source: k.von, target: k.zu })), [graph])
  const simulation = useMemo(() => {
    const s = forceSimulation<SimKnoten, SimKante>(knoten)
      .force(
        'link',
        forceLink<SimKnoten, SimKante>(kanten)
          .id((k) => k.schluessel)
          .distance((l) => {
            const [a, b] = [l.source as SimKnoten, l.target as SimKnoten]
            return a.r + b.r + (BLATT.has(b.art) ? 10 : 34)
          })
          .strength(0.7),
      )
      .force(
        'abstossung',
        forceManyBody<SimKnoten>().strength((k) => (BLATT.has(k.art) ? -18 : -160)),
      )
      .force(
        'kollision',
        forceCollide<SimKnoten>((k) => k.r + 2),
      )
      // Auf schmalen Bildschirmen stärker zur Mitte, damit der Graph hochkant wächst.
      .force('x', forceX(0).strength(schmal ? 0.14 : 0.05))
      .force('y', forceY(0).strength(schmal ? 0.03 : 0.07))
      .stop()
    // Ohne Animation: gleich fertig rechnen und ruhig anzeigen.
    if (bewegungArm()) s.tick(300)
    else s.alpha(Math.max(s.alpha(), 0.6))
    return s
  }, [knoten, kanten, schmal])

  useEffect(() => {
    if (bewegungArm()) return
    simulation.on('tick', () => setTakt((t) => t + 1)).restart()
    return () => {
      simulation.stop()
    }
  }, [simulation])

  const umschalten = (k: Knoten) => {
    if (!k.klappbar) return
    setOffen((set) => {
      const n = new Set(set)
      if (n.has(k.schluessel)) n.delete(k.schluessel)
      else n.add(k.schluessel)
      return n
    })
  }
  const waehle = (s: Strang) => {
    if (s === strang) return
    // Positionen gelten je Strang (Thema-Knoten gibt es in mehreren), daher frisch beginnen.
    positionen.clear()
    setStrang(s)
    setOffen(new Set())
    setAnsicht(null)
    setAktiv(null)
  }
  const info = STRAENGE.find((x) => x.strang === strang)!

  const loslassen = (e: React.PointerEvent) => {
    zeiger.current.delete(e.pointerId)
    // Nach dem Pinch bleibt ein Finger übrig: nicht mit ihm weiterschieben.
    geste.current = null
  }

  const punkt = (e: React.PointerEvent) => {
    const m = svg.current?.getScreenCTM()
    if (!m) return { x: 0, y: 0 }
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }

  // Sichtbereich: so breit wie die Fläche (Schrift in Originalgröße), so hoch wie
  // der Graph; wird der Graph breiter, verkleinert sich alles.
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const k of knoten) {
    const rand = k.r + (k.art === 'thema' || k.art === 'haltung' ? 60 : 12)
    x0 = Math.min(x0, (k.x ?? 0) - rand)
    x1 = Math.max(x1, (k.x ?? 0) + rand)
    y0 = Math.min(y0, (k.y ?? 0) - k.r - 8)
    y1 = Math.max(y1, (k.y ?? 0) + k.r + 22)
  }
  const mitte = (x0 + x1) / 2
  const w = Math.max(breite, x1 - x0)
  const h = Math.max(MIN_HOEHE, y1 - y0)
  const ganz: Ausschnitt = { x: mitte - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }
  const sicht = ansicht ?? ganz
  const viewBox = `${sicht.x} ${sicht.y} ${sicht.w} ${sicht.h}`
  const zoom = vergroesserung(sicht, ganz)

  // Zoom-Handler brauchen den jeweils aktuellen Graphen, auch wenn sie nur einmal angemeldet sind.
  const ganzRef = useRef(ganz)
  useEffect(() => {
    ganzRef.current = ganz
  })

  /** Wendet eine Änderung auf den aktuellen Ausschnitt an; `rect` ist die Zeichenfläche in Pixeln. */
  const aendereAnsicht = (f: (a: Ausschnitt, flaeche: { breite: number; hoehe: number }) => Ausschnitt) => {
    const r = svg.current?.getBoundingClientRect()
    if (!r || r.width === 0 || r.height === 0) return
    const flaeche = { breite: r.width, hoehe: r.height }
    setAnsicht((alt) => halteImGraph(f(alt ?? ganzRef.current, flaeche), ganzRef.current))
  }
  const zoomeMitte = (faktor: number) =>
    aendereAnsicht((a) => zoomeUm(a, { x: a.x + a.w / 2, y: a.y + a.h / 2 }, faktor, ganzRef.current))

  // Strg/Cmd + Mausrad (auch Pinch auf dem Trackpad) zoomt zum Mauszeiger; ohne Taste
  // scrollt weiter die Seite. Als eigener Listener, weil React Wheel-Ereignisse passiv anmeldet.
  useEffect(() => {
    const el = svg.current
    if (!el) return
    const beiRad = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const faktor = Math.exp(-Math.max(-50, Math.min(50, e.deltaY)) * 0.006)
      aendereAnsicht((a, f) =>
        zoomeUm(a, graphPunkt(a, f, e.clientX - r.left, e.clientY - r.top), faktor, ganzRef.current),
      )
    }
    el.addEventListener('wheel', beiRad, { passive: false })
    return () => el.removeEventListener('wheel', beiRad)
  }, [])

  const pinch = () => {
    const [a, b] = [...zeiger.current.values()]
    return { abstand: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }

  const aktivKnoten = aktiv ? knoten.find((k) => k.schluessel === aktiv) : undefined
  const nachbarn = new Set<string>()
  if (aktiv)
    for (const k of graph.kanten) {
      if (k.von === aktiv) nachbarn.add(k.zu)
      if (k.zu === aktiv) nachbarn.add(k.von)
    }
  const mitEntwurf = knoten.some((k) => k.ki_entwurf)
  const leer = strang === 'haltung' ? !daten.haltungen.length : !daten.themen.length

  return (
    <figure className="diagramm graph">
      <figcaption>
        <strong>{info.titel}</strong>
        <span>
          {info.erklaerung} Knoten lassen sich verschieben. Zum Vergrößern: Knöpfe am Diagramm, zwei Finger oder Strg
          + Mausrad; am Hintergrund ziehen verschiebt den Ausschnitt.
        </span>
      </figcaption>
      <div className="strang-wahl" role="radiogroup" aria-label="Was der Graph zeigt">
        {STRAENGE.map((x) => (
          <button
            key={x.strang}
            type="button"
            role="radio"
            aria-checked={strang === x.strang}
            className={strang === x.strang ? 'aktiv' : undefined}
            onClick={() => waehle(x.strang)}
          >
            {x.label}
          </button>
        ))}
      </div>
      <GraphLegende strang={strang} mitEntwurf={mitEntwurf} />
      <p className="diagramm-steuerung">
        <button
          type="button"
          className="knopf-link"
          onClick={() => {
            setOffen(new Set(obersteKnoten(daten, strang)))
            setAnsicht(null)
          }}
        >
          {strang === 'haltung' ? 'Alle Haltungen aufklappen' : 'Alle Themen aufklappen'}
        </button>
        <button
          type="button"
          className="knopf-link"
          onClick={() => {
            setOffen(new Set())
            setAnsicht(null)
          }}
        >
          Alles zuklappen
        </button>
      </p>
      <div className="graph-rahmen">
        <svg
          ref={svg}
          className="graph-flaeche"
          viewBox={viewBox}
          role="group"
          aria-label={`Graph: ${info.titel}`}
          onPointerDown={(e) => {
            zeiger.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
            e.currentTarget.setPointerCapture(e.pointerId)
            if (zeiger.current.size === 2) {
              // Zweiter Finger: Knoten loslassen, ab jetzt wird gezoomt.
              ziehen.current = null
              simulation.alphaTarget(0)
              geste.current = { art: 'pinch', ...pinch() }
            } else if (!ziehen.current) {
              geste.current = { art: 'schieben' }
            }
          }}
          onPointerMove={(e) => {
            const vorher = zeiger.current.get(e.pointerId)
            if (vorher) zeiger.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
            const g = geste.current
            if (g?.art === 'pinch' && zeiger.current.size >= 2) {
              const jetzt = pinch()
              const r = svg.current?.getBoundingClientRect()
              if (!r) return
              aendereAnsicht((a, f) =>
                verschiebe(
                  zoomeUm(a, graphPunkt(a, f, g.x - r.left, g.y - r.top), jetzt.abstand / g.abstand, ganzRef.current),
                  jetzt.x - g.x,
                  jetzt.y - g.y,
                  f,
                ),
              )
              geste.current = { art: 'pinch', ...jetzt }
              return
            }
            const z = ziehen.current
            if (z) {
              const p = punkt(e)
              if (!z.bewegt && Math.hypot(p.x - z.x, p.y - z.y) < 4) return
              z.bewegt = true
              z.k.fx = p.x
              z.k.fy = p.y
              simulation.alphaTarget(0.3).restart()
            } else if (g?.art === 'schieben' && vorher) {
              const [dx, dy] = [e.clientX - vorher.x, e.clientY - vorher.y]
              aendereAnsicht((a, f) => verschiebe(a, dx, dy, f))
            }
          }}
          onPointerUp={(e) => {
            const z = ziehen.current
            ziehen.current = null
            loslassen(e)
            simulation.alphaTarget(0)
            if (z && !z.bewegt) umschalten(z.k)
          }}
          onPointerCancel={(e) => {
            ziehen.current = null
            loslassen(e)
            simulation.alphaTarget(0)
          }}
          onPointerLeave={() => setAktiv(null)}
        >
          <g className="graph-kanten" aria-hidden="true">
            {kanten.map((l) => {
              const [a, b] = [l.source as SimKnoten, l.target as SimKnoten]
              if (typeof a === 'string' || typeof b === 'string') return null
              const hell = aktiv && (a.schluessel === aktiv || b.schluessel === aktiv)
              return (
                <line
                  key={`${a.schluessel}-${b.schluessel}`}
                  className={hell ? 'aktiv' : undefined}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                />
              )
            })}
          </g>
          <g>
            {knoten.map((k) => {
              const gedimmt = aktiv && aktiv !== k.schluessel && !nachbarn.has(k.schluessel)
              const klassen = [
                'graph-knoten',
                `g-${k.art}`,
                k.ebene === 'land' ? 'g-land' : '',
                k.ki_entwurf ? 'g-entwurf' : '',
                k.erfasst === false ? 'g-offen' : '',
                k.seite ? `g-seite-${k.seite}` : '',
                k.aufgeklappt ? 'g-auf' : '',
                gedimmt ? 'gedimmt' : '',
                aktiv === k.schluessel ? 'aktiv' : '',
              ]
              const label =
                k.art === 'thema' || k.art === 'position'
                  ? k.text
                  : k.art === 'haltung'
                    ? kurz(k.text, 40)
                    : (k.art === 'ursache' || k.art === 'instrument') && (k.aufgeklappt || aktiv === k.schluessel)
                      ? kurz(k.text, 34)
                      : null
              return (
                <g
                  key={k.schluessel}
                  className={klassen.filter(Boolean).join(' ')}
                  transform={`translate(${k.x ?? 0},${k.y ?? 0})`}
                  role={k.klappbar ? 'button' : 'img'}
                  tabIndex={0}
                  aria-label={beschreibe(k, strang)}
                  aria-expanded={k.klappbar ? k.aufgeklappt : undefined}
                  onPointerDown={(e) => {
                    const p = punkt(e)
                    ziehen.current = { k, x: p.x, y: p.y, bewegt: false }
                    ;(e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId)
                  }}
                  onPointerEnter={() => setAktiv(k.schluessel)}
                  onFocus={() => setAktiv(k.schluessel)}
                  onBlur={() => setAktiv(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      umschalten(k)
                    }
                  }}
                >
                  <circle r={k.r} />
                  {(k.art === 'thema' && strang !== 'haltung') || k.art === 'haltung' ? (
                    <text className="graph-zahl" dy="0.35em" aria-hidden="true">
                      {k.art === 'haltung' ? `${k.anzahl}/${daten.parteien.length}` : k.anzahl}
                    </text>
                  ) : null}
                  {label && (
                    <text className="graph-label" y={k.r + 12} aria-hidden="true">
                      {label}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
        <div className="graph-zoom" role="group" aria-label="Zoom">
          <button
            type="button"
            onClick={() => zoomeMitte(ZOOM_SCHRITT)}
            disabled={zoom >= MAX_ZOOM - 0.01}
            aria-label="Hineinzoomen"
            title="Hineinzoomen"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h12M10 4v12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => zoomeMitte(1 / ZOOM_SCHRITT)}
            disabled={zoom <= 1.01}
            aria-label="Herauszoomen"
            title="Herauszoomen"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setAnsicht(null)}
            disabled={ansicht === null}
            aria-label="Ganzen Graphen einpassen"
            title="Ganzen Graphen einpassen"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" />
            </svg>
          </button>
        </div>
      </div>
      <p className="diagramm-detail" aria-hidden="true">
        {aktivKnoten
          ? beschreibe(aktivKnoten, strang)
          : leer
            ? strang === 'haltung'
              ? 'Noch keine Haltungen erfasst.'
              : 'Noch keine Themen erfasst.'
            : {
                problem: 'Zahl im Themenkreis: Ursachen. Tippen klappt auf und zu.',
                forderung: 'Zahl im Themenkreis: Lösungswege. Tippen klappt auf und zu.',
                haltung: 'Zahl im Haltungskreis: erfasste Positionen. Tippen klappt auf und zu.',
              }[strang]}
      </p>
    </figure>
  )
}

function LegendenEintrag({ klassen, label }: { klassen: string; label: string }) {
  return (
    <li>
      <span className={`graph-legende ${klassen}`} aria-hidden="true" />
      {label}
    </li>
  )
}

function GraphLegende({ strang, mitEntwurf }: { strang: Strang; mitEntwurf: boolean }) {
  return (
    <ul className="diagramm-legende">
      {strang === 'haltung' ? (
        <>
          <LegendenEintrag klassen="g-haltung" label="Haltung (Wertfrage)" />
          <LegendenEintrag klassen="g-position" label="Position erfasst" />
          <LegendenEintrag klassen="g-position g-offen" label="Position noch offen" />
          <LegendenEintrag klassen="g-zielkonflikt" label="Zielkonflikt" />
          <LegendenEintrag klassen="g-thema g-verwandt" label="verwandtes Thema" />
          {mitEntwurf && <LegendenEintrag klassen="g-position g-entwurf" label="Position, KI-Entwurf" />}
        </>
      ) : (
        <>
          <LegendenEintrag klassen="g-thema" label="Thema" />
          {strang === 'problem' ? (
            <>
              <LegendenEintrag klassen="g-ursache" label="Ursache (Bund)" />
              <LegendenEintrag klassen="g-ursache g-land" label="Ursache (Länder)" />
            </>
          ) : (
            <>
              <LegendenEintrag klassen="g-instrument" label="Lösungsweg (Bund)" />
              <LegendenEintrag klassen="g-instrument g-land" label="Lösungsweg (Länder)" />
            </>
          )}
          <LegendenEintrag klassen="g-massnahme" label="Maßnahme" />
          {mitEntwurf && <LegendenEintrag klassen="g-massnahme g-entwurf" label="KI-Entwurf" />}
        </>
      )}
    </ul>
  )
}
