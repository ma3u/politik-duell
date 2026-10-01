// Ausgabe von PDF-Text mit Seitenmarken – gemeinsam für programm:text und quelle:text.
import { writeFileSync } from 'node:fs'
import { kompakt } from '../zitate.ts'

export interface Optionen {
  /** „2-4,57“ – nur diese Seiten */
  seiten?: string
  /** Fundstellen eines Worts mit etwas Umgebung */
  suche?: string
  /** in diese Datei statt auf die Konsole */
  ausgabe?: string
}

/** Liest --seiten und --suche aus den Argumenten und entfernt sie. */
export function optionenAus(argumente: string[]): Optionen {
  const i = argumente.indexOf('--suche')
  const suche = i >= 0 ? argumente.splice(i, 2)[1] : undefined
  const j = argumente.indexOf('--seiten')
  const seiten = j >= 0 ? argumente.splice(j, 2)[1] : undefined
  return { suche, seiten }
}

export function gibSeitenAus(seiten: string[], { seiten: bereich, suche, ausgabe }: Optionen): void {
  /** „2-4,57“ → [2, 3, 4, 57] */
  const gewaehlt = bereich
    ? new Set(
        bereich.split(',').flatMap((teil) => {
          const [von, bis = von] = teil.split('-').map(Number)
          return Array.from({ length: Math.max(0, bis - von + 1) }, (_, k) => von + k)
        }),
      )
    : null

  if (suche) {
    // Fundstellen mit etwas Umgebung; verglichen wie in der Zitatprüfung (ohne Umbrüche und Silbentrennung).
    const ziel = kompakt(suche)
    for (const [n, text] of seiten.entries()) {
      const flach = text.replace(/\s+/g, ' ')
      if (!kompakt(flach).includes(ziel)) continue
      const stelle = flach.toLowerCase().indexOf(suche.toLowerCase())
      const auszug = stelle >= 0 ? flach.slice(Math.max(0, stelle - 150), stelle + suche.length + 250) : flach.slice(0, 400)
      console.log(`\n— Seite ${n + 1} (#page=${n + 1}):\n…${auszug}…`)
    }
    return
  }
  const text = seiten
    .map((t, n) => (!gewaehlt || gewaehlt.has(n + 1) ? `\n===== Seite ${n + 1} =====\n${t}` : ''))
    .join('')
  if (ausgabe) writeFileSync(ausgabe, text)
  else process.stdout.write(text)
}
