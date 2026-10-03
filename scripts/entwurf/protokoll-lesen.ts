// Liest den Ordner protokoll/ neben der Erfassung (siehe PROTOKOLL in scripts/entwurf.ts).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const protokollOrdner = (erfassungPfad: string) => join(dirname(erfassungPfad), 'protokoll')

export function leseProtokoll(erfassungPfad: string): Map<string, string> {
  const ordner = protokollOrdner(erfassungPfad)
  const dateien = new Map<string, string>()
  if (!existsSync(ordner)) return dateien
  for (const d of readdirSync(ordner)) dateien.set(d, readFileSync(join(ordner, d), 'utf8'))
  return dateien
}

/** Archivierte Blindliste, wie sie dem Bewertungs-Agenten vorlag (von entwurf:bewertung-auftrag abgelegt). */
export const archivPfad = (erfassungPfad: string, pruefsumme: string) => join(protokollOrdner(erfassungPfad), `blind-${pruefsumme.slice(0, 16)}.json`)
