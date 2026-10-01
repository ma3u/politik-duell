// Text eines Programm-PDFs mit Seitenmarken – zum Lesen und Zitieren beim Erfassen.
// Aufruf: npm run programm:text -- <url oder datei.pdf> [ausgabe.txt]
//         npm run programm:text -- <url oder datei.pdf> --seiten 2-4,57   – nur diese Seiten (etwa Inhaltsverzeichnis, ein Kapitel)
//         npm run programm:text -- <url oder datei.pdf> --suche "Schulsozialarbeit"
// Eine URL wird über den Zwischenspeicher .cache/ geladen (npm run programme:laden).
// Unter PowerShell 7 verschluckt npm Optionen mit Wert, wenn "--" nicht in Anführungszeichen steht:
//   npm run programm:text '--' <url> '--seiten' 2-4      oder direkt: node --experimental-strip-types scripts/entwurf/programm-text.ts <url> --seiten 2-4
// Über alle Programme auf einmal sucht npm run programme:suche.
// Die Seitenzahl in „===== Seite N =====“ ist die PDF-Seite für den Beleg (#page=N),
// nicht die gedruckte Seitenzahl.
import { existsSync, readFileSync } from 'node:fs'
import { programmSeiten, sha256 } from '../programme.ts'
import { seitenTexte } from '../zitate.ts'
import { gibSeitenAus, optionenAus } from './seiten-ausgabe.ts'

const argumente = process.argv.slice(2)
const optionen = optionenAus(argumente)
const [quelle, ausgabe] = argumente
if (!quelle) {
  console.error('Aufruf: npm run programm:text -- <url oder datei.pdf> [ausgabe.txt] [--seiten 2-4,57] [--suche "Wort"]')
  process.exit(1)
}
// Ein Seitenbereich oder Suchwort als Ausgabedatei heißt: npm hat die Option davor verschluckt (PowerShell, siehe oben).
if (ausgabe && (/^[\d,\s-]+$/.test(ausgabe) || !/\.\w+$/.test(ausgabe))) {
  console.error(`"${ausgabe}" sieht nicht wie eine Ausgabedatei aus (Endung fehlt). Fehlt "--seiten" oder "--suche"? Unter PowerShell: npm run programm:text '--' <url> '--seiten' 2-4`)
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

gibSeitenAus(seiten, { ...optionen, ausgabe })
