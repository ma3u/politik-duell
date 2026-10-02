import { findeAbdeckung } from '../logic/bewertung'
import type { Daten } from './quelle'

// Einträge der Wortwolke: die Themen, die das Spiel schon kennt und werten kann.
// Es erscheinen keine Eingaben von Spielenden. Die Größe folgt der Zahl der
// belegten Ursachen eines Themas – nicht den Maßnahmen oder Parteien, damit keine
// Partei bevorzugt wird.
//
// „Erfasst“ ist hier dasselbe wie in der Wertungsregel (Tabelle `abdeckung`, siehe
// logic/stand.ts): Ein Thema erscheint erst, wenn es für alle Parteien im
// Bundesprogramm erfasst ist, also jedes Duell dazu gewertet werden kann.

export interface Wort {
  text: string
  anzahl: number
}

/** Themen, die das Spiel kennt: angelegt, mit belegten Ursachen und für alle Parteien erfasst. */
export function themenWoerter(daten: Daten): Wort[] {
  return daten.themen
    .filter((t) => daten.parteien.every((p) => findeAbdeckung(daten.abdeckung, p.id, t.id) !== null))
    .map((t) => ({ text: t.name, anzahl: daten.ursachen.filter((u) => u.thema_id === t.id).length }))
    .filter((w) => w.anzahl > 0)
    .sort((a, b) => b.anzahl - a.anzahl || a.text.localeCompare(b.text, 'de'))
}
