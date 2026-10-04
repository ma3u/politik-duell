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

/**
 * Lösungsweg, den mehrere Programme vorschlagen (daten/README.md → „Instrumente“). Die App zeigt daran in der
 * Forderungskarte, welche Parteien ihn haben und was die Forschung sagt – ohne Punkte. Wirksamkeit und
 * Umsetzbarkeit stehen nur im Datenkatalog und an den Maßnahmen.
 */
export interface InstrumentEintrag {
  id: number
  thema_id: number
  name: string
  begruendung: string | null
  /** Forschungsstand: wie gut die Wirkung belegt ist. */
  evidenz: Evidenz | null
  /** Studie zum Forschungsstand, falls vorhanden. */
  beleg_studie_url?: string | null
  /** Instrumente gelten für eine Ebene: Bundes- oder Landesprogramme. */
  ebene: Ebene
  /** Der gleiche Lösungsweg auf der anderen Ebene (Bund ↔ Land). */
  entspricht?: number | null
  /** Nur Entwurf, noch nicht von Menschen geprüft (nur in der geschlossenen Testphase). */
  ki_entwurf?: boolean
  /** Nur bei Entwürfen: Herkunft der Entwurfswerte, wie bei Maßnahmen. */
  entwurf_herkunft?: 'blind' | 'nicht_blind' | null
  /** Nur Mock: Schlagwörter, mit denen die Mock-Analyse Forderungen diesem Instrument zuordnet. */
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
  /** Gleicher Lösungsweg wie in anderen Programmen (siehe `Instrument`); null/fehlend = einzelne Maßnahme. */
  instrument_id?: number | null
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
  /** Gehört zu einem Eintrag, der nur als KI-Entwurf vorliegt (nur in der geschlossenen Testphase sichtbar). */
  ki_entwurf?: boolean
  /**
   * Nur bei KI-Entwürfen: Stammen die Entwurfswerte aus der Bewertung ohne Parteinamen (`blind`) oder
   * wurden sie mit Kenntnis der Partei vergeben oder geändert (`nicht_blind`)? null = vor dem 1. 10. 2026
   * entstanden, nicht blind.
   */
  entwurf_herkunft?: 'blind' | 'nicht_blind' | null
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
  /** Eintrag nur als KI-Entwurf, noch nicht von Menschen geprüft (nur in der geschlossenen Testphase). */
  ki_entwurf?: boolean
  /**
   * Ursachen, für die das Programm durchsucht wurde. Fehlt eine Ursache, gilt sie für die
   * Partei als „noch nicht erfasst“ (etwa nach einer nachträglich ergänzten Ursache).
   * null/fehlend = ältere Einträge: für alle Ursachen des Themas durchsucht.
   */
  durchsucht_fuer?: number[] | null
}

/** Antwortformat der Edge Function `analyse` (siehe CLAUDE.md). */
export interface AnalyseAntwort {
  /**
   * `grenze`: Abwertung einer Gruppe, Gewaltaufruf oder Beleidigung (docs/methode.md → „Grenze“). Keine Karte,
   * keine Nachfrage, kein gespeicherter Inhalt – die App lädt nur zu einem Alltagsproblem ein.
   */
  typ: 'problem' | 'forderung' | 'wert' | 'grenze'
  nachfrage: string | null
  /**
   * Bei `problem` mit Ursachen: das gewertete Thema. Bei einer Nachfrage (Forderung oder Problem ohne
   * erkennbare Ursache) und bei einer Forderung ohne Problem: das erkannte Thema, ohne Wertung – die App
   * bietet dann dessen Ursachen zum Antippen an bzw. nennt das Thema.
   */
  thema_id: number | null
  ursachen_ids: number[]
  /** Pauschales Urteil über eine Gruppe: nur nachfragen, keine Ursachenauswahl. */
  pauschal?: boolean
  /**
   * Bei einer Haltung und bei einer Forderung ohne weitere Nachfrage: kurze Antwort der KI, die die
   * Äußerung neutral aufgreift und zu einem Alltagsproblem einlädt. Fehlt sie, zeigt die App einen festen Satz.
   */
  rueckmeldung?: string | null
  /**
   * Nur bei einer Forderung mit erkanntem Thema: der Lösungsweg (Instrument), dem sie eindeutig entspricht.
   * Die App zeigt dann die Forderungskarte („Zeig mir, wer das fordert“) – ohne Punkte. Sonst null/fehlend.
   */
  instrument_id?: number | null
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
  /** Zugang zur geschlossenen Testphase (Token aus dem Einladungslink) – dann zählen auch KI-Entwürfe. */
  zugang?: string | null
  /** IDs der beiden gewählten Parteien (A, B) – zum Speichern der Runde. */
  parteien: [number, number]
  /**
   * Von der Person angetippte Ursachen eines Themas (statt einer Schilderung). Dann fragt die
   * Edge Function keine KI, sondern wertet und speichert die Runde mit diesen Ursachen.
   */
  auswahl?: UrsachenAuswahl | null
}

/** Höchstens so viele Ursachen dürfen angetippt werden (docs/plan-haltungen.md, A2). */
export const MAX_AUSWAHL = 3

export interface UrsachenAuswahl {
  thema_id: number
  ursachen_ids: number[]
}

export interface Nachricht {
  von: 'spieler' | 'ki'
  text: string
}
