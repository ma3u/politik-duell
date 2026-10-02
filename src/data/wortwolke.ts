import type { Daten } from './quelle'

// Einträge der Wortwolke: die Themen, die das Spiel schon kennt (wie in der
// Übersicht „Was das Spiel schon kennt“). Es erscheinen keine Eingaben von
// Spielenden. Die Größe folgt der Zahl der belegten Ursachen eines Themas – nicht
// den Maßnahmen oder Parteien, damit keine Partei bevorzugt wird.
//
// Nicht verwechseln mit „erfasst“ aus der Wertungsregel (Tabelle `abdeckung`, siehe
// logic/stand.ts): Die Wolke zeigt auch Themen, die noch für keine Partei erfasst sind.

export interface Wort {
  text: string
  anzahl: number
}

/** Themen, die das Spiel kennt: angelegt und mit belegten Ursachen – unabhängig davon, ob sie schon erfasst sind. */
export function themenWoerter(daten: Daten): Wort[] {
  return daten.themen
    .map((t) => ({ text: t.name, anzahl: daten.ursachen.filter((u) => u.thema_id === t.id).length }))
    .filter((w) => w.anzahl > 0)
    .sort((a, b) => b.anzahl - a.anzahl || a.text.localeCompare(b.text, 'de'))
}
