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
  /**
   * gewertet: beide Parteien für das Thema erfasst · unvollstaendig: Thema bekannt, aber für
   * mindestens eine der beiden noch nicht erfasst oder ohne aktuelles Landesprogramm (keine Punkte)
   * · ungeprueft: Thema unbekannt.
   */
  status: 'gewertet' | 'unvollstaendig' | 'ungeprueft'
  /** Ergebnisse der beiden gewählten Parteien (bei „gewertet“ und „unvollstaendig“). */
  ergebnisse: [ParteiErgebnis, ParteiErgebnis] | null
  /** Spielpunkte dieser Runde für A und B. */
  punkte: [number, number]
  /** Parteien mit der insgesamt besten Lösung (alle Parteien der DB, für die das Thema erfasst ist). */
  beste: ParteiErgebnis[]
  /** Parteien ohne Wertung (noch nicht erfasst oder kein aktuelles Landesprogramm). */
  nichtErfasst: Partei[]
}

export function gesamtpunkte(runden: RundenErgebnis[]): [number, number] {
  return runden.reduce<[number, number]>((s, r) => [s[0] + r.punkte[0], s[1] + r.punkte[1]], [0, 0])
}

