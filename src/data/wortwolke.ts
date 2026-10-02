import type { Daten } from "./quelle";

// Einträge der Wortwolke: die Themen, die das Spiel schon kennt und werten kann.
// Es erscheinen keine Eingaben von Spielenden. Die Größe folgt der Zahl der
// belegten Ursachen eines Themas – nicht den Maßnahmen oder Parteien, damit keine
// Partei bevorzugt wird.
//
// „Erfasst“ ist hier dasselbe wie in der Wertungsregel (Tabelle `abdeckung`, siehe
// logic/stand.ts): Ein Thema erscheint, sobald es für mindestens eine Partei im
// Bundesprogramm erfasst ist. Themen ohne jeden Eintrag fehlen, solange sie nicht gewertet werden.

export interface Wort {
  text: string;
  anzahl: number;
}

/** Themen, die das Spiel kennt: angelegt, mit belegten Ursachen und für mindestens eine Partei erfasst. */
export function themenWoerter(daten: Daten): Wort[] {
  const erfasst = new Set(
    daten.abdeckung
      .filter((a) => (a.land ?? null) === null)
      .map((a) => a.thema_id),
  );
  return daten.themen
    .filter((t) => erfasst.has(t.id))
    .map((t) => ({
      text: t.name,
      anzahl: daten.ursachen.filter((u) => u.thema_id === t.id).length,
    }))
    .filter((w) => w.anzahl > 0)
    .sort((a, b) => b.anzahl - a.anzahl || a.text.localeCompare(b.text, "de"));
}
