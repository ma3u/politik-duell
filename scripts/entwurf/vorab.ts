// Vorabprüfung der Suchbegriffe (npm run entwurf:treffer -- <erfassung.json> --vorab): Welche Begriffe
// sind so allgemein, dass sie in allen Programmen viele Fehltreffer bringen? Jeder Treffer landet als
// Fundstelle im Auftrag, und ab TREFFER_OHNE_MASSNAHME Treffern muss jeder Erfassungs-Agent eine Ursache
// ohne Maßnahme begründen. Ein zu allgemeiner Begriff kostet also in jedem Programm Lesezeit und
// erzeugt Begründungen ohne Erkenntnis (Thema 9: „prävention“, „sucht“, „haftung“ …). Die Koordination
// macht solche Begriffe genauer – für alle Programme gleich und bevor ein Agent startet.
import { TREFFER_OHNE_MASSNAHME } from '../entwurf.ts'

export interface BegriffZaehlung {
  ursache: string
  richtung: string
  begriff: string
  /** Treffer je Programm (gleiche Reihenfolge für alle Begriffe). */
  treffer: number[]
  /** Wortformen über alle Programme. */
  formen: Map<string, number>
}

/**
 * Ein Begriff gilt als breit, wenn
 * - er im Median je Programm mindestens TREFFER_OHNE_MASSNAHME Treffer hat – dann löst er allein schon in
 *   jedem Programm die Begründungspflicht für eine Ursache ohne Maßnahme aus, oder
 * - mindestens VORAB_INNEN seiner Treffer mitten in einem anderen Wort stehen („sucht“ in „versucht“,
 *   „haftung“ in „Bewirtschaftung“, „richter“ in „Berichterstattung“). Ein Viertel heißt: Jede vierte
 *   Fundstelle ist vermutlich ein Fehltreffer; Beugungen („Islamismus“, „islamistische“) zählen nicht,
 *   weil sie mit dem Begriff beginnen. Erst ab TREFFER_OHNE_MASSNAHME Treffern über alle Programme: Darunter
 *   kostet ein Begriff kaum Lesezeit, und zusammengesetzte Fachwörter („Binnengrenzkontrollen“) fallen sonst auf.
 */
export const VORAB_INNEN = 0.25

const median = (z: number[]) => {
  const s = [...z].sort((a, b) => a - b)
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0
}

export function breiteBegriffe(zaehlungen: BegriffZaehlung[]): string[] {
  const zeilen: string[] = []
  for (const z of zaehlungen) {
    const summe = z.treffer.reduce((a, c) => a + c, 0)
    const med = median(z.treffer)
    const formen = [...z.formen].sort((a, b) => b[1] - a[1])
    const kern = z.begriff.toLowerCase().replace(/\s+/g, '')
    const innen = formen.filter(([w]) => !w.startsWith(kern)).reduce((a, [, n]) => a + n, 0)
    const anteil = summe ? innen / summe : 0
    const gruende = [
      ...(med >= TREFFER_OHNE_MASSNAHME ? [`Median ${med} Treffer je Programm`] : []),
      ...(summe >= TREFFER_OHNE_MASSNAHME && anteil >= VORAB_INNEN ? [`${Math.round(anteil * 100)} % mitten in anderen Wörtern`] : []),
    ]
    if (!gruende.length) continue
    zeilen.push(
      `„${z.begriff}“ (${z.ursache} ${z.richtung}): ${summe} Treffer, ${gruende.join(', ')}, ${formen.length} Wortformen – häufigste: ${formen
        .slice(0, 6)
        .map(([w, n]) => `${w} ${n}`)
        .join(', ')}`,
    )
  }
  return zeilen
}
