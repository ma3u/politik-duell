import type { Antwortart, QuizFrage } from './typen.ts'

// Punkte im Quiz (docs/plan-quiz.md → „Punkte“): Anteil richtig × Tempo. Höchstens 1000 je Frage.

export const MAX_PUNKTE = 1000

/** Antwortzeit je Frage in Millisekunden. */
export const ZEIT_MS: Record<Antwortart, number> = { einzeln: 20_000, mehrfach: 30_000 }

export interface Bewertung {
  /** 0 bis 1. */
  anteil: number
  treffer: number
  fehler: number
  punkte: number
}

/**
 * Bewertet eine Auswahl. Einzelauswahl: richtig oder nicht. Mehrfachauswahl: (Treffer − Fehlgriffe) / Zahl der
 * richtigen, nicht unter 0 – wer nichts oder alles ankreuzt, bekommt nichts. `neutral` zählt weder noch.
 * `ms` = Antwortzeit; null = keine Antwort.
 */
export function bewerte(frage: Pick<QuizFrage, 'art' | 'richtig' | 'neutral'>, auswahl: number[], ms: number | null): Bewertung {
  const gewaehlt = [...new Set(auswahl)]
  const treffer = gewaehlt.filter((id) => frage.richtig.includes(id)).length
  const fehler = gewaehlt.filter((id) => !frage.richtig.includes(id) && !frage.neutral.includes(id)).length
  if (ms === null || !gewaehlt.length) return { anteil: 0, treffer, fehler, punkte: 0 }
  const anteil =
    frage.art === 'einzeln'
      ? gewaehlt.length === 1 && treffer === 1
        ? 1
        : 0
      : Math.max(0, (treffer - fehler) / frage.richtig.length)
  const zeit = ZEIT_MS[frage.art]
  const tempo = 0.5 + 0.5 * (1 - Math.min(Math.max(ms, 0), zeit) / zeit)
  return { anteil, treffer, fehler, punkte: Math.round(MAX_PUNKTE * anteil * tempo) }
}
