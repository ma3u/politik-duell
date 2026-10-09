import type { HaltungEintrag, HaltungPosition, Partei, Positionswert, Zielkonflikt } from '../src/data/types.ts'

// Fragen für das Quiz „Wer sagt Ja?“ (eigenes Repository: https://github.com/ma3u/wer-sagt-ja) – mechanisch aus den
// Haltungen, ohne redaktionelle Auswahl: je Haltung höchstens eine Frage, nur wenn alle Bundesprogramme eine
// Position haben. Die Typen müssen zu src/typen.ts im Quiz passen.

export interface QuizPartei {
  id: number
  name: string
  kurzname: string
  farbe: string
  programm_url: string
}

export interface QuizPosition {
  partei_id: number
  position: Positionswert
  kurzfassung: string | null
  /** Wörtliches Zitat – nur als Beleg in der Auflösung (§ 51 UrhG), nie als Rätseltext. */
  zitat: string | null
  beleg_url: string | null
  /** Nur bei `keine_aussage`: was im Programm durchsucht wurde. */
  begruendung: string | null
}

export interface QuizZielkonflikt {
  seite: 'ja' | 'nein'
  text: string
  quelle_url: string
}

export type Antwortart = 'einzeln' | 'mehrfach'

export interface QuizFrage {
  /** `h` + ID der Haltung. */
  id: string
  haltung_id: number
  frage: string
  beschreibung: string
  art: Antwortart
  /** Nach welcher Position gefragt wird. */
  gesucht: 'ja' | 'nein'
  /** Antwort, die der heutigen Lage entspricht – `keine_aussage` zählt wie sie (null: nicht festgelegt). */
  status_quo: 'ja' | 'nein' | null
  /** Parteien mit der gesuchten Position. */
  richtig: number[]
  /** Parteien mit `teils` bei Mehrfachauswahl – zählen weder als richtig noch als falsch. */
  neutral: number[]
  /** Alle Bundesprogramme, nach Partei-ID. */
  positionen: QuizPosition[]
  zielkonflikte: QuizZielkonflikt[]
  /** Mindestens eine Position ist nur KI-Entwurf (nie in der öffentlichen Datei). */
  ki_entwurf: boolean
}

export interface QuizDaten {
  /** Kurzer Hash über Parteien und Fragen: Alle Geräte im Raum müssen dieselbe Fassung haben. */
  version: string
  /** true = enthält ungeprüfte KI-Entwürfe (nur lokal). */
  entwurf: boolean
  parteien: QuizPartei[]
  fragen: QuizFrage[]
}

const nachId = <T extends { partei_id: number }>(a: T, b: T) => a.partei_id - b.partei_id

/**
 * Die Frage zu einer Haltung – oder null, wenn eine Partei ohne Position ist oder keine Seite klar vertreten wird.
 * `positionen` darf auch Landesprogramme und andere Haltungen enthalten; es zählen nur die Bundesprogramme.
 */
export function quizFrage(
  haltung: HaltungEintrag,
  positionen: HaltungPosition[],
  zielkonflikte: Zielkonflikt[],
  parteien: Pick<Partei, 'id'>[],
): QuizFrage | null {
  const bund = positionen.filter((p) => p.haltung_id === haltung.id && (p.land ?? null) === null)
  const je = parteien.map((partei) => bund.find((p) => p.partei_id === partei.id))
  if (!je.length || je.some((p) => !p)) return null
  const alle = (je as HaltungPosition[]).sort(nachId)
  // Keine Aussage heißt: Das Programm will daran nichts ändern – es zählt wie die heutige Lage (`status_quo`).
  const status_quo = haltung.status_quo === 'ja' || haltung.status_quo === 'nein' ? haltung.status_quo : null
  const gilt = (p: HaltungPosition) => (p.position === 'keine_aussage' && status_quo ? status_quo : p.position)
  const mit = (w: string) => alle.filter((p) => gilt(p) === w).map((p) => p.partei_id)
  const ja = mit('ja')
  const nein = mit('nein')
  const teils = mit('teils')

  const gesucht = ja.length ? 'ja' : nein.length ? 'nein' : null
  if (!gesucht) return null
  const richtig = gesucht === 'ja' ? ja : nein
  // Stehen alle auf derselben Seite, gibt es nichts zu raten.
  if (richtig.length >= alle.length) return null
  const art = richtig.length === 1 ? 'einzeln' : 'mehrfach'

  return {
    id: `h${haltung.id}`,
    haltung_id: haltung.id,
    frage: haltung.frage,
    beschreibung: haltung.beschreibung,
    art,
    gesucht,
    status_quo,
    richtig,
    neutral: art === 'mehrfach' ? teils : [],
    positionen: alle.map((p) => ({
      partei_id: p.partei_id,
      position: p.position,
      kurzfassung: p.kurzfassung ?? null,
      zitat: p.zitat ?? null,
      beleg_url: p.beleg_programm_url ?? null,
      begruendung: p.begruendung ?? null,
    })),
    zielkonflikte: zielkonflikte
      .filter((z) => z.haltung_id === haltung.id)
      .sort((a, b) => (a.seite === b.seite ? 0 : a.seite === 'ja' ? -1 : 1))
      .map(({ seite, text, quelle_url }) => ({ seite, text, quelle_url })),
    ki_entwurf: alle.some((p) => p.ki_entwurf),
  }
}

/** Alle Fragen, nach Haltungs-ID. */
export function quizFragen(
  haltungen: HaltungEintrag[],
  positionen: HaltungPosition[],
  zielkonflikte: Zielkonflikt[],
  parteien: Pick<Partei, 'id'>[],
): QuizFrage[] {
  return [...haltungen]
    .sort((a, b) => a.id - b.id)
    .map((h) => quizFrage(h, positionen, zielkonflikte, parteien))
    .filter((f): f is QuizFrage => f !== null)
}

export const quizParteien = (parteien: Partei[]): QuizPartei[] =>
  [...parteien]
    .sort((a, b) => a.id - b.id)
    .map(({ id, name, kurzname, farbe, programm_url }) => ({ id, name, kurzname, farbe, programm_url }))
