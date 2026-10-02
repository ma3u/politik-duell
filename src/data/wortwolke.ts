import type { Daten } from './quelle'

// Einträge der Wortwolke: die Themen, die das Spiel schon kennt (wie in der
// Übersicht „Was das Spiel schon kennt“). Es erscheinen keine Eingaben von
// Spielenden. Die Größe folgt der Zahl der belegten Ursachen eines Themas – nicht
// den Maßnahmen oder Parteien, damit die Wolke zeigt, wie breit ein Thema erfasst
// ist, und keine Partei bevorzugt.

export interface Wort {
  text: string
  anzahl: number
}

/** Erfasst: Das Thema ist angelegt und hat belegte Ursachen. Ob schon Programme ausgewertet sind, zeigt die Themenübersicht. */
export function themenWoerter(daten: Daten): Wort[] {
  return daten.themen
    .map((t) => ({ text: t.name, anzahl: daten.ursachen.filter((u) => u.thema_id === t.id).length }))
    .filter((w) => w.anzahl > 0)
    .sort((a, b) => b.anzahl - a.anzahl || a.text.localeCompare(b.text, 'de'))
}
