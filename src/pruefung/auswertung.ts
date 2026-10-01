// Auswertung der Bewertungen durch eingeladene Prüfende (docs/plan-pruefung.md).
// Genutzt von Admin-Ansicht, Übernahme-Skript und Tests – reines TypeScript.
//
// Je Maßnahme und Kriterium zählt der Median der Einzelwerte. Punkte gibt es
// erst am Ende: Median Wirksamkeit × Median Umsetzbarkeit.

/** Median; bei gerader Anzahl der Mittelwert der beiden mittleren Werte (z. B. 2,5). */
export function median(werte: readonly number[]): number | null {
  if (werte.length === 0) return null
  const s = [...werte].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export function spannweite(werte: readonly number[]): number | null {
  return werte.length ? Math.max(...werte) - Math.min(...werte) : null
}

export interface Einzelwert {
  wirksamkeit: number
  umsetzbarkeit: number
}

export interface Auswertung {
  massnahme_id: number
  anzahl: number
  median_w: number | null
  median_u: number | null
  /** Größere der beiden Spannweiten (Wirksamkeit, Umsetzbarkeit). */
  spannweite: number | null
  /** Median W × Median U; null ohne Bewertungen. */
  punkte: number | null
  /** Unter 2 Bewertungen oder Spannweite ≥ 2: vor der Übernahme klären. */
  klaeren: boolean
  /** Einzelwerte [Wirksamkeit, Umsetzbarkeit], sortiert – ohne Zuordnung zu Personen. */
  werte: [number, number][]
}

/** Ab dieser Zahl unabhängiger Bewertungen darf eine Maßnahme als geprüft gelten. */
export const MINDEST_BEWERTUNGEN = 2
/** Ab dieser Spannweite liegen die Prüfenden zu weit auseinander. */
export const KRITISCHE_SPANNWEITE = 2

export function werteAus(massnahme_id: number, werte: readonly Einzelwert[]): Auswertung {
  const w = werte.map((x) => x.wirksamkeit)
  const u = werte.map((x) => x.umsetzbarkeit)
  const median_w = median(w)
  const median_u = median(u)
  const sw = spannweite(w)
  const su = spannweite(u)
  const sp = sw === null || su === null ? null : Math.max(sw, su)
  return {
    massnahme_id,
    anzahl: werte.length,
    median_w,
    median_u,
    spannweite: sp,
    punkte: median_w === null || median_u === null ? null : median_w * median_u,
    klaeren: werte.length < MINDEST_BEWERTUNGEN || (sp !== null && sp >= KRITISCHE_SPANNWEITE),
    werte: werte.map((x): [number, number] => [x.wirksamkeit, x.umsetzbarkeit]).sort((a, b) => a[0] - b[0] || a[1] - b[1]),
  }
}

/**
 * Export für `npm run pruefung:uebernehmen` – ohne Namen. Er kommt nach `daten/pruefungen/` ins
 * Repository: Daran prüft `npm run daten:pruefen` jede `bewertung` im Katalog. Die Einzelwerte sind
 * sortiert, damit sich keine Bewertung einer Person zuordnen lässt.
 */
export interface PruefExport {
  thema_id: number
  /** Datum des Exports (JJJJ-MM-TT). */
  datum: string
  bewertungen: {
    massnahme_id: number
    anzahl: number
    median_w: number
    median_u: number
    spannweite: number
    /** Einzelwerte [W, U], sortiert; fehlt bei Exporten vor dem 2. 10. 2026. */
    werte?: [number, number][]
  }[]
}

export function exportiere(thema_id: number, datum: string, auswertungen: readonly Auswertung[]): PruefExport {
  return {
    thema_id,
    datum,
    bewertungen: auswertungen
      .filter((a) => a.anzahl > 0)
      .map((a) => ({
        massnahme_id: a.massnahme_id,
        anzahl: a.anzahl,
        median_w: a.median_w!,
        median_u: a.median_u!,
        spannweite: a.spannweite!,
        werte: a.werte,
      })),
  }
}

/**
 * Passen Anzahl, Mediane und Spannweite zu den Einzelwerten? Bei halbem Median (gerade Anzahl) muss
 * der eingetragene Wert einer der beiden mittleren sein – die Betreiberin hat entschieden.
 */
export function werteStimmen(
  name: string,
  b: { anzahl: unknown; median_w: unknown; median_u: unknown; spannweite: unknown; werte: [number, number][] },
): string[] {
  const f: string[] = []
  if (b.werte.length !== b.anzahl) f.push(`${name}: „anzahl“ ${String(b.anzahl)}, aber ${b.werte.length} Einzelwerte`)
  for (const [i, feld] of (['median_w', 'median_u'] as const).entries()) {
    const m = median(b.werte.map((x) => x[i]))
    const v = b[feld]
    if (m !== null && v !== m && !(Number.isInteger(v) && !Number.isInteger(m) && (v === Math.floor(m) || v === Math.ceil(m))))
      f.push(`${name}: „${feld}“ ${String(v)} passt nicht zu den Einzelwerten (Median ${String(m).replace('.', ',')})`)
  }
  const sp = Math.max(spannweite(b.werte.map((x) => x[0])) ?? 0, spannweite(b.werte.map((x) => x[1])) ?? 0)
  if (b.werte.length && b.spannweite !== sp) f.push(`${name}: „spannweite“ ${String(b.spannweite)} passt nicht zu den Einzelwerten (${sp})`)
  return f
}

// Feste, aber parteiunabhängige Reihenfolge (wie in der Prüfliste), damit
// Maßnahmen einer Partei nicht beieinanderstehen.
const mische = (n: number) => ((n * 2654435761) >>> 0) % 1000003

export function blindeReihenfolge<T extends { id: number }>(liste: readonly T[]): T[] {
  return [...liste].sort((a, b) => mische(a.id) - mische(b.id))
}
