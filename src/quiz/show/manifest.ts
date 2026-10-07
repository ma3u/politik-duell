import type { Sprecher } from './texte.ts'

/** public/quiz/audio/manifest.json – erzeugt von `npm run quiz:stimmen`. */
export interface ShowManifest {
  /** ElevenLabs-Stimmen-IDs (nicht geheim). */
  stimmen: Record<Sprecher, string>
  clips: Record<
    string,
    {
      datei: string
      sprecher: Sprecher
      /** Untertitel (ohne Betonungs-Tags). */
      text: string
      /** Sekunden. */
      dauer: number
      /** Startzeit jedes Worts des Untertitels in Sekunden – für die synchrone Animation. */
      woerter: number[]
      hash: string
    }
  >
  geraeusche: Record<string, { datei: string; dauer: number; hash: string }>
}
