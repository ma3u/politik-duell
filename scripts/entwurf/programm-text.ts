// Text eines Programm-PDFs mit Seitenmarken – zum Lesen und Zitieren beim Erfassen.
// Aufruf: npm run programm:text -- <url oder datei.pdf> [ausgabe.txt]
//         npm run programm:text -- <url oder datei.pdf> --seiten 2-4,57   – nur diese Seiten (etwa Inhaltsverzeichnis, ein Kapitel)
//         npm run programm:text -- <url oder datei.pdf> --suche "Schulsozialarbeit"
// Eine URL wird über den Zwischenspeicher .cache/ geladen (npm run programme:laden).
// Über alle Programme auf einmal sucht npm run programme:suche.
// Die Seitenzahl in „===== Seite N =====“ ist die PDF-Seite für den Beleg (#page=N),
// nicht die gedruckte Seitenzahl.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { programmSeiten, sha256 } from '../programme.ts'
import { kompakt, seitenTexte } from '../zitate.ts'

const argumente = process.argv.slice(2)
const i = argumente.indexOf('--suche')
const suche = i >= 0 ? argumente.splice(i, 2)[1] : undefined
const j = argumente.indexOf('--seiten')
const bereich = j >= 0 ? argumente.splice(j, 2)[1] : undefined
const [quelle, ausgabe] = argumente
if (!quelle) {
  console.error('Aufruf: npm run programm:text -- <url oder datei.pdf> [ausgabe.txt] [--seiten 2-4,57] [--suche "Wort"]')
  process.exit(1)
}

let seiten: string[]
let summe: string
if (existsSync(quelle)) {
  const daten = new Uint8Array(readFileSync(quelle))
  // Prüfsumme vorher bilden: Das Auslesen übergibt die Daten an pdf.js.
  summe = sha256(daten)
  seiten = await seitenTexte(daten)
} else ({ seiten, sha256: summe } = await programmSeiten(quelle, undefined))
console.error(`${seiten.length} Seiten · sha256 ${summe}`)

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
} else {
  const text = seiten
    .map((t, n) => (!gewaehlt || gewaehlt.has(n + 1) ? `\n===== Seite ${n + 1} =====\n${t}` : ''))
    .join('')
  if (ausgabe) writeFileSync(ausgabe, text)
  else process.stdout.write(text)
}
