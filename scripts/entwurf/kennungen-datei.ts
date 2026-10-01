// Gespeicherte Kennungen (M01 …) neben der Erfassung: `entwurf:blind` legt sie an, `entwurf:eintragen`
// und `entwurf:bewertung-pruefen` lesen sie. So bleibt die Zuordnung der Bewertung stabil, auch wenn
// danach Beschreibung, Zitat oder Seite einer Maßnahme geändert werden.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pruefeKennungen, type Erfassung, type Kennung } from '../entwurf.ts'

export const kennungenPfad = (erfassungPfad: string) => join(dirname(erfassungPfad), 'kennungen.json')

/** `fest` fehlt, wenn es keine Datei gibt oder sie nicht mehr passt (dann steht der Grund in `probleme`). */
export function leseKennungen(erfassungPfad: string, e: Erfassung): { fest?: Kennung[]; probleme: string[] } {
  const pfad = kennungenPfad(erfassungPfad)
  if (!existsSync(pfad)) return { probleme: [] }
  const fest = JSON.parse(readFileSync(pfad, 'utf8')) as Kennung[]
  const probleme = pruefeKennungen(e, fest)
  return probleme.length ? { probleme } : { fest, probleme }
}

export function schreibeKennungen(erfassungPfad: string, fest: Kennung[]): void {
  writeFileSync(kennungenPfad(erfassungPfad), JSON.stringify(fest, null, 2) + '\n', 'utf8')
}
