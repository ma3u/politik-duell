// Prüfung der Haltungen (docs/plan-haltungen.md, „Erfassen und Prüfen“; Ablauf: daten/README.md → „Haltungen prüfen“).
// Reine Funktionen: Blindliste der Zitate (ohne Parteinamen, gemischt), Stand-Prüfsumme und Auswertung der
// Antworten der Prüfenden. Die HTML-Seiten erzeugt scripts/erzeuge-haltung-pruefliste.ts, die Auswertung
// scripts/haltung-auswerten.ts.
import { createHash } from 'node:crypto'
import type { Katalog } from '../src/data/katalog.ts'
import type { Positionswert } from '../src/data/types.ts'
import { neutralisiere, verdaechtigeReste } from './entwurf.ts'

/** Antworten der Prüfenden: wie die Positionswerte, dazu „unklar“, wenn das Zitat keine Zuordnung erlaubt. */
export const ANTWORTEN = ['ja', 'nein', 'teils', 'unklar'] as const
export type Antwort = (typeof ANTWORTEN)[number]

export interface BlindesZitat {
  /** Name im Blindblatt, z. B. „H1-3“: verrät die Haltung, nie die Partei. */
  kennung: string
  haltung_id: number
  partei_id: number
  /** Einordnung des Entwurfs – bleibt bei der Betreiberin. */
  entwurf: Exclude<Positionswert, 'keine_aussage'>
  /** Zitat mit „[Partei]“ statt Parteinamen. */
  zitat: string
  /** Wörter, die trotzdem auf eine Partei hindeuten können („liberal“, „Fraktion“ …) – Hinweis an die Betreiberin. */
  reste: string[]
}

// Feste, aber parteiunabhängige Reihenfolge (wie bei den Maßnahmen): Zitate einer Partei stehen nicht beieinander.
const mische = (n: number) => ((n * 2654435761) >>> 0) % 1000003

const parteiNamen = (k: Katalog) => k.parteien.flatMap((p) => [p.name, p.kurzname])

/**
 * Alle Positionen mit Zitat (nicht „keine Aussage“), je Haltung gemischt. Die Kennung zählt nur innerhalb der
 * Haltung; sie ändert sich, sobald sich die Menge der Zitate ändert – dann stimmt auch `standVon` nicht mehr.
 */
export function blindeZitate(k: Katalog): BlindesZitat[] {
  const namen = parteiNamen(k)
  return k.haltungen.flatMap((h) =>
    h.positionen
      .filter((p) => p.position !== 'keine_aussage' && p.zitat)
      .sort((a, b) => mische(h.id * 1000 + a.partei_id) - mische(h.id * 1000 + b.partei_id))
      .map((p, i) => {
        const zitat = neutralisiere(p.zitat!, namen)
        return {
          kennung: `H${h.id}-${i + 1}`,
          haltung_id: h.id,
          partei_id: p.partei_id,
          entwurf: p.position as BlindesZitat['entwurf'],
          zitat,
          reste: verdaechtigeReste(zitat),
        }
      }),
  )
}

/**
 * Prüfsumme über das, was die Prüfenden sehen (Fragen, Beschreibungen, neutralisierte Zitate in Reihenfolge).
 * Steht in jeder Antwort: Ändert sich der Katalog nach dem Versand, passt die Auswertung nicht mehr.
 */
export function standVon(k: Katalog): string {
  const inhalt = JSON.stringify([
    k.haltungen.map((h) => [h.id, h.frage, h.beschreibung]),
    blindeZitate(k).map((z) => [z.kennung, z.zitat]),
  ])
  return createHash('sha256').update(inhalt).digest('hex').slice(0, 10)
}

/** Eine Abgabe: was das Blindblatt zum Kopieren erzeugt. Ohne Namen. */
export interface Abgabe {
  stand: string
  antworten: Record<string, string>
  anmerkungen?: Record<string, string>
}

export interface Zeile {
  kennung: string
  haltung_id: number
  partei_id: number
  entwurf: BlindesZitat['entwurf']
  /** Antwort je Abgabe in der Reihenfolge der Abgaben; null = nicht beantwortet. */
  antworten: (Antwort | null)[]
  /** Wie viele Abgaben die Einordnung des Entwurfs bestätigen. */
  bestaetigt: number
}

export interface Auswertung {
  fehler: string[]
  zeilen: Zeile[]
}

const istAntwort = (a: unknown): a is Antwort => (ANTWORTEN as readonly unknown[]).includes(a)

/**
 * Vergleicht die Antworten der Prüfenden mit der Einordnung des Entwurfs. `bestaetigt` ≥ 2 heißt: Mindestens
 * zwei Prüfende, die die Partei nicht sahen, ordnen das Zitat wie der Entwurf ein (`einordnung_bestaetigt`).
 * Abweichungen werden nicht gemittelt: Sie stehen in `zeilen` und werden geklärt (Wortlaut oder Maßstab ändern).
 */
export function auswerten(k: Katalog, abgaben: Abgabe[]): Auswertung {
  const fehler: string[] = []
  const stand = standVon(k)
  const zitate = blindeZitate(k)
  abgaben.forEach((a, i) => {
    const name = `Abgabe ${i + 1}`
    if (!a || typeof a !== 'object' || typeof a.stand !== 'string' || !a.antworten || typeof a.antworten !== 'object') {
      fehler.push(`${name}: erwartet { "stand", "antworten" } aus dem Blindblatt („Antworten kopieren“)`)
      return
    }
    if (a.stand !== stand)
      fehler.push(`${name}: Stand ${a.stand} passt nicht zum Katalog (${stand}) – Fragen oder Zitate haben sich seit dem Versand geändert; Blindblatt neu erzeugen und neu beantworten lassen`)
    for (const [kennung, wert] of Object.entries(a.antworten)) {
      if (!zitate.some((z) => z.kennung === kennung)) fehler.push(`${name}: unbekannte Kennung „${kennung}“`)
      else if (!istAntwort(wert)) fehler.push(`${name}: „${kennung}“: Antwort „${String(wert)}“ gibt es nicht (erlaubt: ${ANTWORTEN.join(', ')})`)
    }
  })
  if (abgaben.length < 2) fehler.push(`Mindestens zwei Abgaben nötig (hier ${abgaben.length}) – sonst gibt es keine Bestätigung`)
  const zeilen = zitate.map((z) => {
    const antworten = abgaben.map((a) => (istAntwort(a?.antworten?.[z.kennung]) ? (a.antworten[z.kennung] as Antwort) : null))
    return {
      kennung: z.kennung, haltung_id: z.haltung_id, partei_id: z.partei_id, entwurf: z.entwurf, antworten,
      bestaetigt: antworten.filter((x) => x === z.entwurf).length,
    }
  })
  for (const z of zeilen) if (z.antworten.some((x) => x === null)) fehler.push(`${z.kennung}: nicht von allen beantwortet`)
  return { fehler, zeilen }
}
