// Liste zum Bewerten ohne Parteinamen: Maßnahmen aus einer Erfassung in gemischter
// Reihenfolge mit Kennungen (M01, M02 …), dazu Thema, Ursachen und vorhandene Instrumente.
// Nur diese Ausgabe bekommt der Bewertungs-Agent (.claude/agents/blind-bewertung.md).
// Aufruf: npm run entwurf:blind -- <erfassung.json>
import { readFileSync } from 'node:fs'
import { blindListe, pruefeErfassung, type Erfassung } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'

const pfad = process.argv[2]
if (!pfad) {
  console.error('Aufruf: npm run entwurf:blind -- <erfassung.json>')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = JSON.parse(readFileSync(pfad, 'utf8')) as Erfassung
const probleme = pruefeErfassung(katalog, erfassung)
for (const p of probleme) console.error(`Fehler:  ${p}`)
if (probleme.length) process.exit(1)
console.log(JSON.stringify(blindListe(katalog, erfassung), null, 2))
