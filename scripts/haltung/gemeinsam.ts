// Gemeinsames für die Befehle der Haltungs-Erfassung (scripts/haltung/*.ts).
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { KatalogHaltung } from '../../src/data/katalog.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { HALTUNG_ORDNER, type HaltungFund } from '../haltung-erfassung.ts'

export const WURZEL = new URL('../../', import.meta.url)

export function katalogUndHaltung(idArg: string | undefined) {
  const id = Number(idArg)
  if (!Number.isInteger(id)) throw new Error('Haltungs-ID fehlt')
  const { katalog, fehler } = pruefeDatenordner()
  if (fehler.length) throw new Error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  const haltung = katalog.haltungen.find((h) => h.id === id) as KatalogHaltung | undefined
  if (!haltung) throw new Error(`Haltung ${id} gibt es nicht`)
  const ordner = new URL('daten/haltungen/', WURZEL)
  const datei = readdirSync(ordner).find((d) => d.endsWith('.json') && JSON.parse(readFileSync(new URL(d, ordner), 'utf8')).id === id)!
  return { katalog, haltung, datei: new URL(datei, ordner), arbeit: join(new URL('.', WURZEL).pathname, HALTUNG_ORDNER(id)) }
}

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
