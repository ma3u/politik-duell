// Sammelauftrag: mehrere Erfassungsaufträge (je Thema aus entwurf:auftrag) für dasselbe Programm in einem
// Auftrag, damit ein Agent das Programm einmal liest statt einmal je Thema. Jeder Teil bleibt unverändert
// mit eigener Ergebnisdatei und Selbstprüfung; alles danach (zusammenführen, blind bewerten, eintragen)
// läuft weiter je Thema.

export interface Teilauftrag {
  /** Pfad des Auftrags aus entwurf:auftrag (…/<ID>/auftraege/<Name>.md). */
  pfad: string
  text: string
}

const TEXTDATEI = /^\| Textdatei \| `([^`]+)`/m
const VORGEHEN = /^Vorgehen und Regeln: .*\n\n?/m

/** Pfad der Textdatei, den ein Auftrag nennt. */
export const textdateiPfad = (text: string) => TEXTDATEI.exec(text)?.[1]

/**
 * Teilt die Aufträge eines Programms in Gruppen von höchstens `maxZeichen` (ein einzelner Auftrag, der
 * allein darüber liegt, bildet eine eigene Gruppe). Reihenfolge bleibt erhalten.
 */
export function gruppiere(teile: Teilauftrag[], maxZeichen: number): Teilauftrag[][] {
  const gruppen: Teilauftrag[][] = []
  let laenge = 0
  for (const t of teile) {
    const letzte = gruppen.at(-1)
    if (letzte && laenge + t.text.length <= maxZeichen) {
      letzte.push(t)
      laenge += t.text.length
    } else {
      gruppen.push([t])
      laenge = t.text.length
    }
  }
  return gruppen
}

export function sammelAuftragText(name: string, teile: Teilauftrag[], textPfad: string): string {
  const z: string[] = []
  z.push(`# Sammelauftrag: ${name} – ${teile.length} Teilaufträge`, '')
  z.push(
    'Vorgehen und Regeln: `.claude/agents/programm-erfassung.md`. Die Teilaufträge betreffen dasselbe Programm, aber verschiedene Themen. ' +
      `Lies die Textdatei einmal (\`${textPfad}\`; die Textdateien der Teilaufträge sind gleich) und bearbeite die Teilaufträge **nacheinander**, jeden für sich: ` +
      'nur seine Ursachen, sein Leitfaden, seine Ergebnisdatei und seine Selbstprüfung. Eine Stelle kann in mehreren Themen vorkommen, wenn sie dort an einer Ursache ansetzt.',
    '',
  )
  z.push('Zurückgeben: je Teilauftrag genau den Kurzbericht seiner letzten erfolgreichen Selbstprüfung, in der Reihenfolge unten, sonst nichts.', '')
  for (const [i, t] of teile.entries()) {
    z.push('---', '', `## Teilauftrag ${i + 1} von ${teile.length} (\`${t.pfad}\`)`, '')
    // Überschriften eine Ebene tiefer; die allgemeine Zeile „Vorgehen und Regeln“ steht schon oben.
    z.push(t.text.replace(VORGEHEN, '').replace(/^(#+) /gm, '#$1 ').trimEnd(), '')
  }
  return z.join('\n')
}
