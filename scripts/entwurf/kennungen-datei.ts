// Gespeicherte Kennungen (M01 …) neben der Erfassung: `entwurf:blind` legt sie an und schreibt sie
// nach jedem Abgleich fort, `entwurf:eintragen` und `entwurf:bewertung-pruefen` lesen sie. Die
// Zuordnung läuft über den Inhalt (Partei, Land, Zitat – siehe ordneKennungen in scripts/entwurf.ts),
// nicht über die Stelle in der Erfassung. Format: { vergeben_bis, kennungen, entfallen }; eine ältere
// Datei (nur die Liste) wird weiter gelesen.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { ordneKennungen, type Erfassung, type Kennung, type KennungAbgleich } from '../entwurf.ts'

export const kennungenPfad = (erfassungPfad: string) => join(dirname(erfassungPfad), 'kennungen.json')

export interface KennungenDatei {
  /** Höchste je vergebene Nummer – entfallene Kennungen werden nie neu vergeben. */
  vergeben_bis: number
  kennungen: Kennung[]
  /** Kennungen, deren Maßnahme entfallen ist (zur Nachvollziehbarkeit). */
  entfallen?: Kennung[]
}

export function leseKennungenDatei(erfassungPfad: string): KennungenDatei | undefined {
  const pfad = kennungenPfad(erfassungPfad)
  if (!existsSync(pfad)) return undefined
  const roh = JSON.parse(readFileSync(pfad, 'utf8')) as Kennung[] | KennungenDatei
  return Array.isArray(roh) ? { vergeben_bis: 0, kennungen: roh } : roh
}

/**
 * Für bewertung-pruefen und eintragen: die gespeicherten Kennungen, an die Stellen der aktuellen
 * Erfassung angepasst. `probleme`, wenn Maßnahmen ohne Kennung oder Kennungen ohne Maßnahme da sind
 * (dann muss `entwurf:blind` erneut laufen). Ohne Datei: `fest` fehlt.
 */
export function leseKennungen(erfassungPfad: string, e: Erfassung): { fest?: Kennung[]; abgleich?: KennungAbgleich; probleme: string[] } {
  const datei = leseKennungenDatei(erfassungPfad)
  if (!datei) return { probleme: [] }
  const abgleich = ordneKennungen(e, datei.kennungen, datei.vergeben_bis)
  const probleme = [
    ...abgleich.probleme,
    ...abgleich.neu.map((x) => `Maßnahme auf S. ${x.seite} (${x.beschreibung}…) hat noch keine Kennung – npm run entwurf:blind erneut ausführen`),
    ...abgleich.entfallen.map((x) => `${x.kennung}: Maßnahme gibt es in der Erfassung nicht mehr – npm run entwurf:blind erneut ausführen`),
  ]
  return { fest: abgleich.kennungen, abgleich, probleme }
}

export function schreibeKennungen(erfassungPfad: string, a: Pick<KennungAbgleich, 'kennungen' | 'vergeben_bis'> & { entfallen?: Kennung[] }, vorher?: KennungenDatei): void {
  const entfallen = [...(vorher?.entfallen ?? []), ...(a.entfallen ?? [])]
  const datei: KennungenDatei = { vergeben_bis: a.vergeben_bis, kennungen: a.kennungen, ...(entfallen.length ? { entfallen } : {}) }
  writeFileSync(kennungenPfad(erfassungPfad), JSON.stringify(datei, null, 2) + '\n', 'utf8')
}
