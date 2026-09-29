// Text eines Programm-PDFs mit Seitenmarken – zum Lesen und Zitieren beim Erfassen.
// Aufruf: npm run programm:text -- <url oder datei.pdf> [ausgabe.txt]
//         npm run programm:text -- <url oder datei.pdf> --suche "Schulsozialarbeit"
// Die Seitenzahl in „===== Seite N =====“ ist die PDF-Seite für den Beleg (#page=N),
// nicht die gedruckte Seitenzahl.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { herunterladen, sha256 } from '../programme.ts'
import { kompakt, seitenTexte } from '../zitate.ts'

const argumente = process.argv.slice(2)
const i = argumente.indexOf('--suche')
const suche = i >= 0 ? argumente.splice(i, 2)[1] : undefined
const [quelle, ausgabe] = argumente
if (!quelle) {
  console.error('Aufruf: npm run programm:text -- <url oder datei.pdf> [ausgabe.txt] [--suche "Wort"]')
  process.exit(1)
}

const daten = existsSync(quelle) ? new Uint8Array(readFileSync(quelle)) : await herunterladen(quelle)
// Prüfsumme vorher bilden: Das Auslesen übergibt die Daten an pdf.js.
const summe = sha256(daten)
const seiten = await seitenTexte(daten)
console.error(`${seiten.length} Seiten · sha256 ${summe}`)

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
  const text = seiten.map((t, n) => `\n===== Seite ${n + 1} =====\n${t}`).join('')
  if (ausgabe) writeFileSync(ausgabe, text)
  else process.stdout.write(text)
}
