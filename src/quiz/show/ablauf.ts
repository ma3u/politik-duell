import type { QuizFrage, QuizPartei } from '../typen'
import {
  ANLEITUNG,
  ANSAGE,
  frageClip,
  INTRO,
  loesungClip,
  LOS,
  ohneTags,
  optionenClip,
  REAKTION,
  SPANNUNG,
  type Clip,
  type Reaktion,
} from './texte'
import { clipMs } from './ton'

// Ablauf der Show als Liste von Schritten. Spielleitung und Gäste berechnen daraus dieselbe Dauer: Die Zeit zum
// Antworten beginnt erst nach dem Vorspann (Ansage, Frage, Anleitung, Antworten, „Los!“).

/** Was gerade auf der Bühne passiert – die Ansicht zeigt danach die passenden Elemente. */
export type Marke = 'intro' | 'ansage' | 'frage' | 'anleitung' | 'optionen' | 'los' | 'spannung' | 'loesung' | 'reaktion'

export interface Schritt {
  marke: Marke
  clip?: Clip
  /** Geräusch beim Beginn des Schritts. */
  klang?: string
  /** Ohne Sprache: so viele Takte zu POP_MS (z. B. Antwortzeilen aufpoppen lassen). */
  takte?: number
  /** Wartezeit nach dem Schritt (ms). */
  pause?: number
}

/** Zeit, in der die Antwortzeilen ohne Sprache nacheinander aufpoppen (ab Frage 2). */
export const POP_MS = 110

export function vorspann(
  frage: QuizFrage,
  index: number,
  anzahl: number,
  parteien: QuizPartei[],
  mitIntro: boolean,
): Schritt[] {
  const letzte = index === anzahl - 1
  const ansage = letzte ? ANSAGE.find((c) => c.id === 'ansage-letzte')! : ANSAGE[Math.min(index, 3)]
  return [
    ...(mitIntro && index === 0
      ? INTRO.map((clip, i): Schritt => ({ marke: 'intro', clip, klang: i === 0 ? 'jingle' : undefined, pause: 120 }))
      : []),
    { marke: 'ansage', clip: ansage, klang: 'schlag', pause: 150 },
    { marke: 'frage', clip: frageClip(frage), klang: 'wusch', pause: 200 },
    { marke: 'anleitung', clip: ANLEITUNG[`${frage.art}-${frage.gesucht}`], pause: 150 },
    // Beim ersten Mal werden die Antworten vorgelesen, danach poppen sie nur auf.
    index === 0
      ? { marke: 'optionen', clip: optionenClip(parteien), pause: 150 }
      : { marke: 'optionen', takte: parteien.length, pause: 250 },
    { marke: 'los', clip: LOS[index % LOS.length], klang: 'start' },
  ]
}

export const dauerMs = (schritte: Schritt[]) =>
  schritte.reduce((summe, s) => summe + (s.clip ? clipMs(s.clip) + 120 : 0) + (s.takte ?? 0) * POP_MS + (s.pause ?? 0), 0)

export function reaktionFuer(anteil: number, beantwortet: boolean): Reaktion {
  if (!beantwortet) return 'keine'
  return anteil >= 1 ? 'richtig' : anteil > 0 ? 'teils' : 'falsch'
}

export function aufloesung(frage: QuizFrage, index: number, parteien: QuizPartei[], reaktion: Reaktion | null): Schritt[] {
  return [
    { marke: 'spannung', clip: SPANNUNG[index % SPANNUNG.length], klang: 'trommel', pause: 250 },
    { marke: 'loesung', clip: loesungClip(frage, parteien), pause: 300 },
    ...(reaktion
      ? [
          {
            marke: 'reaktion' as const,
            clip: REAKTION[reaktion][index % 3],
            klang: reaktion === 'richtig' || reaktion === 'teils' ? 'richtig' : 'falsch',
          },
        ]
      : []),
  ]
}

/** Index des Worts im Untertitel eines Clips, das eine Partei nennt (für Pop-in und Stempel im Takt). */
export function parteiWoerter(clip: Clip, parteien: QuizPartei[]): Map<number, number> {
  const woerter = ohneTags(clip.text)
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
  const karte = new Map<number, number>()
  for (const p of parteien) {
    const i = woerter.indexOf(p.kurzname.replace(/[^\p{L}\p{N}]/gu, ''))
    if (i >= 0) karte.set(i, p.id)
  }
  return karte
}
