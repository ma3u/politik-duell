// Gemeinsames für die Befehle der Haltungs-Erfassung (scripts/haltung/*.ts).
// Ein Lauf erfasst eine oder mehrere Haltungen: je Programm ein Auftrag für alle (Arbeitsordner .cache/haltung/lauf/),
// Funde, Blindliste und Einordnung je Haltung in .cache/haltung/<ID>/.
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Katalog, KatalogHaltung } from '../../src/data/katalog.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { HALTUNG_ORDNER, LAUF_ORDNER, type HaltungFund } from '../haltung-erfassung.ts'

export const WURZEL = new URL('../../', import.meta.url)
const wurzelPfad = fileURLToPath(WURZEL)

export interface HaltungKontext {
  haltung: KatalogHaltung
  datei: URL
  arbeit: string
}

/** IDs aus den Argumenten (Zahlen), mindestens eine. */
export function ids(args: string[]): number[] {
  const liste = args.filter((a) => /^\d+$/.test(a)).map(Number)
  if (!liste.length) throw new Error('Haltungs-IDs fehlen')
  return [...new Set(liste)]
}

export function katalogUndHaltungen(liste: number[]): { katalog: Katalog; haltungen: HaltungKontext[] } {
  const { katalog, fehler } = pruefeDatenordner()
  if (fehler.length) throw new Error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  const ordner = new URL('daten/haltungen/', WURZEL)
  const dateien = readdirSync(ordner).filter((d) => d.endsWith('.json'))
  const haltungen = liste.map((id) => {
    const haltung = katalog.haltungen.find((h) => h.id === id) as KatalogHaltung | undefined
    if (!haltung) throw new Error(`Haltung ${id} gibt es nicht`)
    const datei = dateien.find((d) => JSON.parse(readFileSync(new URL(d, ordner), 'utf8')).id === id)!
    return { haltung, datei: new URL(datei, ordner), arbeit: join(wurzelPfad, HALTUNG_ORDNER(id)) }
  })
  return { katalog, haltungen }
}

export const laufOrdner = () => join(wurzelPfad, LAUF_ORDNER)
export const fundeOrdner = (arbeit: string) => join(arbeit, 'funde')

export function leseFunde(arbeit: string): HaltungFund[] {
  const o = fundeOrdner(arbeit)
  if (!existsSync(o)) return []
  return readdirSync(o).filter((d) => d.endsWith('.json')).map((d) => JSON.parse(readFileSync(join(o, d), 'utf8')) as HaltungFund)
}

export const ordnerAnlegen = (...o: string[]) => o.forEach((x) => mkdirSync(x, { recursive: true }))

export function abbruch(e: unknown): never {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
}

/** Führt `f` aus und bricht mit der Meldung ab, statt mit einem Stacktrace. */
export function oderAbbruch<T>(f: () => T): T {
  try {
    return f()
  } catch (e) {
    abbruch(e)
  }
}
