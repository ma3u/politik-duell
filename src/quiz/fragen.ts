import type { HaltungEintrag, HaltungPosition, Partei, Zielkonflikt } from '../data/types.ts'
import type { QuizFrage, QuizPartei } from './typen.ts'

// Quizfragen aus den Haltungen (docs/plan-quiz.md → „Fragen aus dem Katalog“). Mechanisch, ohne redaktionelle
// Auswahl: je Haltung höchstens eine Frage, nur wenn alle sieben Bundesprogramme eine Position haben.

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
  const mit = (w: string) => alle.filter((p) => p.position === w).map((p) => p.partei_id)
  const ja = mit('ja')
  const nein = mit('nein')
  const teils = mit('teils')

  const gesucht = ja.length ? 'ja' : nein.length ? 'nein' : null
  if (!gesucht) return null
  const richtig = gesucht === 'ja' ? ja : nein
  const art = richtig.length === 1 ? 'einzeln' : 'mehrfach'

  return {
    id: `h${haltung.id}`,
    haltung_id: haltung.id,
    frage: haltung.frage,
    beschreibung: haltung.beschreibung,
    art,
    gesucht,
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

/** Anleitung unter der Frage – sagt, was gesucht ist und wie „teils“ zählt. */
export function anleitung(f: Pick<QuizFrage, 'art' | 'gesucht'>): string {
  const wort = f.gesucht === 'ja' ? 'Ja' : 'Nein'
  if (f.art === 'einzeln') return `Nur eine Partei sagt in ihrem Wahlprogramm klar ${wort}. Welche?`
  return `Welche Parteien sagen in ihrem Wahlprogramm ${wort}? Mehrere sind richtig. Wer nur „teils“ sagt, zählt weder als richtig noch als falsch.`
}
