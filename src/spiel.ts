import type { Partei, Rolle, Thema } from './data/types'
import type { ParteiErgebnis } from './logic/bewertung'

export const RUNDEN_GESAMT = 5

export interface Spieler {
  name: string
  partei: Partei
  rolle: Rolle | null
  /** Bundesland (Kürzel) – bei Ursachen in Länderzuständigkeit zählt dann das Landesprogramm. */
  land: string | null
}

export interface RundenErgebnis {
  nr: number
  /** Index des Spielers, der das Problem genannt hat (0 = A, 1 = B). */
  sprecher: 0 | 1
  rolle: Rolle | null
  /** Bundesland der Person, die das Problem genannt hat. */
  land: string | null
  zusammenfassung: string
  /** Vorläufige Einschätzung bei ungeprüften Themen (ohne Punkte und Links). */
  einschaetzung: string | null
  thema: Thema | null
  /** Zugeordnete Ursachen (Reihenfolge der Analyse); leer bei ungeprüften Themen. */
  ursachen_ids?: number[]
  /**
   * gewertet: beide Parteien für das Thema erfasst · unvollstaendig: Thema bekannt, aber für
   * mindestens eine der beiden noch nicht erfasst oder ohne aktuelles Landesprogramm (keine Punkte)
   * · ungeprueft: Thema unbekannt.
   */
  status: 'gewertet' | 'unvollstaendig' | 'ungeprueft'
  /**
   * Die Runde begann mit einer Forderung, die einem Lösungsweg entspricht: Die Auflösung zeigt dazu die
   * Forderungskarte („Deine Forderung: …“) – ohne Punkte, zusätzlich zur Wertung des Problems.
   */
  forderung?: { instrument_id: number; thema_id: number }
  /** Haltungs- und Forderungskarten, die in dieser Runde erschienen sind (Endbildschirm „Worüber ihr gesprochen habt“). */
  karten?: Karte[]
  /** Ergebnisse der beiden gewählten Parteien (bei „gewertet“ und „unvollstaendig“). */
  ergebnisse: [ParteiErgebnis, ParteiErgebnis] | null
  /** Spielpunkte dieser Runde für A und B. */
  punkte: [number, number]
  /** Parteien mit der insgesamt besten Lösung (alle Parteien der DB, für die das Thema erfasst ist). */
  beste: ParteiErgebnis[]
  /** Parteien ohne Wertung (noch nicht erfasst oder kein aktuelles Landesprogramm). */
  nichtErfasst: Partei[]
}

/**
 * Karte ohne Punkte, die in einer Runde erschien: Haltungskarte (Wertfrage) oder Forderungskarte (Lösungsweg,
 * mit dem Bundesland der Person für den Block der Landesprogramme).
 */
export type Karte = { art: 'haltung'; haltung_id: number } | { art: 'forderung'; instrument_id: number; land: string | null }

const kartenSchluessel = (k: Karte) => (k.art === 'haltung' ? `h${k.haltung_id}` : `f${k.instrument_id}/${k.land ?? ''}`)

/** Alle Karten der Partie in der Reihenfolge, in der sie erschienen – jede nur einmal. */
export function gespraechsKarten(runden: RundenErgebnis[]): Karte[] {
  const gesehen = new Map<string, Karte>()
  for (const k of runden.flatMap((r) => r.karten ?? [])) if (!gesehen.has(kartenSchluessel(k))) gesehen.set(kartenSchluessel(k), k)
  return [...gesehen.values()]
}

/** Fügt eine Karte hinzu, wenn sie noch nicht in der Liste steht. */
export const mitKarte = (karten: Karte[], k: Karte): Karte[] =>
  karten.some((x) => kartenSchluessel(x) === kartenSchluessel(k)) ? karten : [...karten, k]

export function gesamtpunkte(runden: RundenErgebnis[]): [number, number] {
  return runden.reduce<[number, number]>((s, r) => [s[0] + r.punkte[0], s[1] + r.punkte[1]], [0, 0])
}

