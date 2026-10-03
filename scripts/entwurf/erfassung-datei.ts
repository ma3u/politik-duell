// Liest die Arbeitsdatei einer Erfassung (.cache/entwurf/<ID>/erfassung.json) zusammen mit dem
// Erfassungsleitfaden aus dem Repository (daten/leitfaeden/<ID>.json). Der Leitfaden gilt immer in
// der Fassung aus dem Repository – eine Kopie in der Arbeitsdatei wird überschrieben, damit
// Erfassung, Blindliste und Bewertung denselben Maßstab haben und er im Pull Request sichtbar ist.
// Dasselbe gilt für die Suchbegriffe, wenn der Leitfaden sie enthält.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Erfassung, Leitfaden } from '../entwurf.ts'

export const leitfadenPfad = (themaId: number) => new URL(`../../daten/leitfaeden/${themaId}.json`, import.meta.url)

export function leseLeitfaden(themaId: number): Leitfaden | undefined {
  const pfad = leitfadenPfad(themaId)
  return existsSync(pfad) ? (JSON.parse(readFileSync(pfad, 'utf8')) as Leitfaden) : undefined
}

export function leseErfassung(pfad: string): Erfassung {
  const e = JSON.parse(readFileSync(pfad, 'utf8')) as Erfassung
  return mitLeitfaden(e, leseLeitfaden(e.thema_id))
}

/**
 * Leitfaden aus dem Repository einsetzen. Stehen dort Suchbegriffe, gelten sie – nicht die der
 * Arbeitsdatei: eine Quelle für Bund und Länder, die den Container überlebt.
 */
export function mitLeitfaden(e: Erfassung, leitfaden: Leitfaden | undefined): Erfassung {
  const { leitfaden: _, ...rest } = e
  if (!leitfaden) return rest
  return { ...rest, ...(leitfaden.suchbegriffe ? { suchbegriffe: leitfaden.suchbegriffe } : {}), leitfaden }
}

/** Arbeitsordner eines Themas aus dem Pfad einer Datei in protokoll/ oder programme/. */
export const arbeitsordnerVon = (datei: string) => dirname(dirname(datei))

export const erfassungIn = (ordner: string) => join(ordner, 'erfassung.json')

/** Ergebnisse je Programm, von `entwurf:programm-pruefen` geschrieben, von `entwurf:zusammenfuehren` gelesen. */
export const programmOrdner = (ordner: string) => join(ordner, 'programme')
