// Typen spiegeln das Datenmodell aus CLAUDE.md (supabase/migrations).
// Diese Datei wird von der App und von der Edge Function `analyse` genutzt,
// darf also nur reines TypeScript ohne Browser- oder Deno-APIs enthalten.

export const ROLLEN_IDS = [
  'mieter',
  'eigentuemer',
  'angestellt',
  'selbststaendig',
  'rentner',
  'arbeitslos',
  'studierend',
  'vermoegend',
] as const

export type Rolle = (typeof ROLLEN_IDS)[number]

export interface Partei {
  id: number
  name: string
  kurzname: string
  farbe: string
  programm_url: string
  programm_stand: string // ISO-Datum
}

/** Bundesland, für das Landtagswahlprogramme erfasst werden. */
export interface Land {
  /** Kürzel wie „ST“ (Sachsen-Anhalt). */
  id: string
  name: string
  /** Datum der letzten Landtagswahl: Aktuell sind nur Programme zu dieser Wahl (laufende Wahlperiode). */
  letzte_wahl: string
}

/**
 * Wahlprogramm einer Partei zur letzten Landtagswahl eines Landes. Ohne `url`
 * gibt es nachweislich keins (z. B. nicht angetreten) – dann steht in
 * `kein_programm`, warum.
 */
export interface Landesprogramm {
  partei_id: number
  land: string
  url: string | null
  /** Beschlussdatum des Programms. */
  stand: string | null
  kein_programm: string | null
}

/** Wer vor allem zuständig ist: Bei `land` zählt das Landesprogramm, wenn ein Bundesland gewählt ist. */
export type Ebene = 'bund' | 'land'

/** Wie gut die Wirkung einer Maßnahme in der Forschung belegt ist. */
export type Evidenz = 'belegt' | 'gemischt' | 'offen'

export interface Thema {
  id: number
  name: string
  beschreibung: string
  /** Ziel aus Sicht der Betroffenen – Maßstab für die Wirksamkeit (nur im Repo, nicht in der Datenbank). */
  ziel?: string
  /** Nur Mock: Schlagwörter, mit denen die Mock-Analyse Themen erkennt. */
  schlagwoerter?: string[]
}

export interface Ursache {
  id: number
  thema_id: number
  beschreibung: string
  quelle_url: string
  /** Fehlt sie (ältere Daten), gilt `bund`. */
  ebene?: Ebene
  /** Nur Mock: Schlagwörter, mit denen die Mock-Analyse Ursachen erkennt. */
  schlagwoerter?: string[]
}

export interface RollenModifikator {
  wert: number
  begruendung: string
}

export interface Massnahme {
  id: number
  thema_id: number
  partei_id: number
  /** Kürzel des Landes bei Maßnahmen aus einem Landesprogramm; null/fehlend = Bundesprogramm. */
  land?: string | null
  beschreibung: string
  ursachen_ids: number[]
  wirksamkeit: 0 | 1 | 2 | 3
  umsetzbarkeit: 0 | 1 | 2 | 3
  rollen_modifikator?: Partial<Record<Rolle, RollenModifikator>>
  begruendung: string
  /** Wörtliches Zitat aus dem Programm (nur im Repo, zur Prüfung; nicht in der Datenbank). */
  zitat?: string
  beleg_programm_url: string
  beleg_studie_url?: string
  evidenz?: Evidenz | null
  stand: string
  geprueft: boolean
}

/**
 * Ist ein Thema für eine Partei vollständig erfasst? Fehlt der Eintrag, ist das
 * Programm dazu noch nicht (fertig) ausgewertet – dann wird nicht gewertet.
 */
export interface AbdeckungEintrag {
  thema_id: number
  partei_id: number
  /** Kürzel des Landes bei Landesprogrammen; null/fehlend = Bundesprogramm. */
  land?: string | null
  /** `massnahmen`: alle Maßnahmen zum Thema erfasst; `keine`: Programm enthält nachweislich nichts dazu. */
  art: 'massnahmen' | 'keine'
  /** Nur bei `keine`: was durchsucht wurde. */
  begruendung: string | null
  stand: string
}

/** Antwortformat der Edge Function `analyse` (siehe CLAUDE.md). */
export interface AnalyseAntwort {
  typ: 'problem' | 'forderung' | 'wert'
  nachfrage: string | null
  thema_id: number | null
  ursachen_ids: number[]
  zusammenfassung: string
  /**
   * Nur bei Problemen ohne Thema in der Datenbank: vorläufige, neutrale
   * Einschätzung möglicher Ursachen – „ungeprüft – keine Wertung“, ohne Parteien und Links.
   */
  einschaetzung?: string | null
  /** 1–3 neutrale Wörter für die Wortwolke (erst nach Admin-Freigabe sichtbar). */
  stichwort?: string
}

/** Anfrage der App an die Edge Function `analyse`. */
export interface AnalyseAnfrage {
  /** Zufällige Sitzungs-ID (nur für das Rate-Limit, keine Zuordnung zu Personen). */
  sitzung: string
  verlauf: Nachricht[]
  rolle: Rolle | null
  /** Gewähltes Bundesland (Kürzel) – nur zur Wertung, wird nicht gespeichert. */
  land: string | null
  /** IDs der beiden gewählten Parteien (A, B) – zum Speichern der Runde. */
  parteien: [number, number]
}

export interface Nachricht {
  von: 'spieler' | 'ki'
  text: string
}
