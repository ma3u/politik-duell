import { bewerte } from './punkte.ts'
import type { QuizFrage } from './typen.ts'

// Spielzustand des Quiz als reine Funktionen. Die Spielleitung (der Browser, der den Raum eröffnet) hält den
// Zustand und schickt nach jeder Änderung einen Schnappschuss an alle. Antworten der anderen stehen darin erst
// nach der Auflösung – vorher nur, wer schon geantwortet hat.

export const MAX_SPIELER = 8
export const FRAGEN_JE_SPIEL = 5
export const MAX_NAME = 20

export type Phase = 'lobby' | 'frage' | 'aufloesung' | 'ende'
/** Wie ein Gerät mit der Spielleitung verbunden ist. */
export type Weg = 'selbst' | 'direkt' | 'server' | 'lokal'

export interface QuizSpieler {
  id: string
  name: string
  punkte: number
  verbunden: boolean
  weg: Weg
}

export interface Antwort {
  auswahl: number[]
  /** Antwortzeit, gemessen auf dem eigenen Gerät ab Anzeige der Frage. */
  ms: number
}

export interface Ergebnis {
  /** Leer und `ms: null` = keine Antwort. */
  auswahl: number[]
  ms: number | null
  punkte: number
  treffer: number
  fehler: number
  anteil: number
}

export interface QuizZustand {
  version: string
  phase: Phase
  spieler: QuizSpieler[]
  /** Fragen dieses Spiels (IDs aus fragen.json). */
  fragen: string[]
  index: number
  /** Restzeit der laufenden Frage beim Versand; sonst null. */
  restMs: number | null
  /** Wer die laufende Frage schon beantwortet hat. */
  beantwortet: string[]
  /** Je gestellter Frage: Spieler-ID → Ergebnis. */
  verlauf: Record<string, Ergebnis>[]
}

/** Nachrichten vom Gast an die Spielleitung. */
export type GastNachricht =
  | { t: 'hallo'; name: string; version: string }
  | { t: 'antwort'; index: number; auswahl: number[]; ms: number }

/** Nachrichten der Spielleitung an einen Gast. */
export type LeitungNachricht =
  | { t: 'zustand'; z: QuizZustand; du: string }
  | { t: 'abgelehnt'; grund: 'voll' | 'laeuft' | 'version' }

export function bereinigeName(roh: unknown, ersatz: string): string {
  const name = typeof roh === 'string' ? roh.replace(/[\p{Cc}\p{Cf}]/gu, '').replace(/\s+/g, ' ').trim() : ''
  return [...name].slice(0, MAX_NAME).join('') || ersatz
}

export const neuerZustand = (version: string, leitung: { id: string; name: string }): QuizZustand => ({
  version,
  phase: 'lobby',
  spieler: [{ ...leitung, punkte: 0, verbunden: true, weg: 'selbst' }],
  fragen: [],
  index: 0,
  restMs: null,
  beantwortet: [],
  verlauf: [],
})

/** Neue Person im Raum – nur vor dem Start und bis MAX_SPIELER. Sonst der Grund der Ablehnung. */
export function mitSpieler(
  z: QuizZustand,
  s: { id: string; name: string; weg: Weg },
): QuizZustand | 'voll' | 'laeuft' {
  if (z.spieler.some((x) => x.id === s.id)) return z
  if (z.phase !== 'lobby') return 'laeuft'
  if (z.spieler.length >= MAX_SPIELER) return 'voll'
  return { ...z, spieler: [...z.spieler, { ...s, punkte: 0, verbunden: true }] }
}

/** Verbindung weg: vor dem Start aus der Liste, danach nur als getrennt markiert (Punkte bleiben sichtbar). */
export function ohneSpieler(z: QuizZustand, id: string): QuizZustand {
  if (z.phase === 'lobby') return { ...z, spieler: z.spieler.filter((s) => s.id !== id) }
  return { ...z, spieler: z.spieler.map((s) => (s.id === id ? { ...s, verbunden: false } : s)) }
}

/**
 * Zieht `anzahl` Fragen in zufälliger Reihenfolge (Fisher-Yates, `zufall` liefert [0, 1)). Ausgleich: Keine
 * Partei ist in einem Spiel mehr als einmal die einzige richtige Antwort – sonst stünde sie öfter allein da als
 * andere (Gleichbehandlung, docs/plan-quiz.md). Erst wenn sonst Fragen fehlen, wird die Regel gelockert.
 */
export function waehleFragen(
  fragen: Pick<QuizFrage, 'id' | 'art' | 'richtig'>[],
  anzahl = FRAGEN_JE_SPIEL,
  zufall = Math.random,
): string[] {
  const a = [...fragen]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  const allein = new Set<number>()
  const gewaehlt: typeof a = []
  const zurueck: typeof a = []
  for (const f of a) {
    if (gewaehlt.length >= anzahl) break
    if (f.art === 'einzeln' && allein.has(f.richtig[0])) zurueck.push(f)
    else {
      if (f.art === 'einzeln') allein.add(f.richtig[0])
      gewaehlt.push(f)
    }
  }
  return [...gewaehlt, ...zurueck].slice(0, anzahl).map((f) => f.id)
}

export function starte(z: QuizZustand, fragen: string[]): QuizZustand {
  return {
    ...z,
    phase: 'frage',
    fragen,
    index: 0,
    beantwortet: [],
    verlauf: [],
    spieler: z.spieler.filter((s) => s.verbunden).map((s) => ({ ...s, punkte: 0 })),
  }
}

export function mitAntwort(z: QuizZustand, id: string): QuizZustand {
  if (z.phase !== 'frage' || z.beantwortet.includes(id) || !z.spieler.some((s) => s.id === id)) return z
  return { ...z, beantwortet: [...z.beantwortet, id] }
}

/** Alle, die noch verbunden sind, haben geantwortet. */
export const alleFertig = (z: QuizZustand) =>
  z.phase === 'frage' && z.spieler.filter((s) => s.verbunden).every((s) => z.beantwortet.includes(s.id))

/** Löst die laufende Frage auf: Punkte je Spieler aus den gesammelten Antworten. */
export function aufloesen(z: QuizZustand, frage: QuizFrage, antworten: Record<string, Antwort>): QuizZustand {
  if (z.phase !== 'frage') return z
  const ergebnisse: Record<string, Ergebnis> = {}
  for (const s of z.spieler) {
    const a = antworten[s.id]
    const b = bewerte(frage, a?.auswahl ?? [], a ? a.ms : null)
    ergebnisse[s.id] = { auswahl: a?.auswahl ?? [], ms: a ? a.ms : null, ...b }
  }
  return {
    ...z,
    phase: 'aufloesung',
    restMs: null,
    verlauf: [...z.verlauf, ergebnisse],
    spieler: z.spieler.map((s) => ({ ...s, punkte: s.punkte + ergebnisse[s.id].punkte })),
  }
}

export function weiter(z: QuizZustand): QuizZustand {
  if (z.phase !== 'aufloesung') return z
  if (z.index + 1 >= z.fragen.length) return { ...z, phase: 'ende' }
  return { ...z, phase: 'frage', index: z.index + 1, beantwortet: [] }
}

/** Nochmal: zurück in den Raum, mit allen, die noch verbunden sind. */
export function zurLobby(z: QuizZustand): QuizZustand {
  return {
    ...z,
    phase: 'lobby',
    fragen: [],
    index: 0,
    restMs: null,
    beantwortet: [],
    verlauf: [],
    spieler: z.spieler.filter((s) => s.verbunden).map((s) => ({ ...s, punkte: 0 })),
  }
}

/** Rangliste: absteigend nach Punkten; Gleichstand teilt den Rang. */
export function rangliste(spieler: QuizSpieler[]): { spieler: QuizSpieler; rang: number }[] {
  const sortiert = [...spieler].sort((a, b) => b.punkte - a.punkte)
  return sortiert.map((s) => ({ spieler: s, rang: sortiert.findIndex((x) => x.punkte === s.punkte) + 1 }))
}

const istZahlenliste = (x: unknown, max: number): x is number[] =>
  Array.isArray(x) && x.length <= max && x.every((n) => Number.isInteger(n))

/** Prüft eine Nachricht eines Gasts – alles andere wird verworfen. */
export function alsGastNachricht(n: unknown): GastNachricht | null {
  if (!n || typeof n !== 'object') return null
  const m = n as Record<string, unknown>
  if (m.t === 'hallo' && typeof m.version === 'string' && m.version.length <= 64)
    return { t: 'hallo', name: bereinigeName(m.name, ''), version: m.version }
  if (m.t === 'antwort' && Number.isInteger(m.index) && istZahlenliste(m.auswahl, 7) && typeof m.ms === 'number' && Number.isFinite(m.ms))
    return { t: 'antwort', index: m.index as number, auswahl: m.auswahl, ms: Math.max(0, m.ms) }
  return null
}

/** Prüft eine Nachricht der Spielleitung (grob – sie kommt von einem Gerät, dem man den Raum anvertraut hat). */
export function alsLeitungNachricht(n: unknown): LeitungNachricht | null {
  if (!n || typeof n !== 'object') return null
  const m = n as Record<string, unknown>
  if (m.t === 'abgelehnt' && (m.grund === 'voll' || m.grund === 'laeuft' || m.grund === 'version'))
    return { t: 'abgelehnt', grund: m.grund }
  if (m.t !== 'zustand' || typeof m.du !== 'string' || !m.z || typeof m.z !== 'object') return null
  const z = m.z as Record<string, unknown>
  const ok =
    typeof z.version === 'string' &&
    ['lobby', 'frage', 'aufloesung', 'ende'].includes(z.phase as string) &&
    Array.isArray(z.spieler) &&
    z.spieler.length <= MAX_SPIELER &&
    Array.isArray(z.fragen) &&
    Number.isInteger(z.index) &&
    Array.isArray(z.beantwortet) &&
    Array.isArray(z.verlauf)
  if (!ok) return null
  const spieler = (z.spieler as Record<string, unknown>[]).map((s) => ({
    ...(s as unknown as QuizSpieler),
    name: bereinigeName(s.name, 'Gast'),
  }))
  return { t: 'zustand', du: m.du, z: { ...(z as unknown as QuizZustand), spieler } }
}
