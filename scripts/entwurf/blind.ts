// Liste zum Bewerten ohne Parteinamen: Maßnahmen aus einer Erfassung in gemischter
// Reihenfolge mit Kennungen (M01, M02 …), dazu Thema, Ursachen und vorhandene Instrumente.
// Nur diese Ausgabe bekommt der Bewertungs-Agent (.claude/agents/blind-bewertung.md).
// Die Kennungen werden als kennungen.json neben der Erfassung gespeichert und danach wiederverwendet.
// Aufruf: npm run entwurf:blind -- <erfassung.json> [--ausgabe <blind.json>]   (ohne --ausgabe: Standardausgabe)
import { readFileSync, writeFileSync } from 'node:fs'
import { blindListe, kennungen, pruefeErfassung, type Erfassung } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { leseKennungen, schreibeKennungen } from './kennungen-datei.ts'

const args = process.argv.slice(2)
const a = args.indexOf('--ausgabe')
const ausgabe = a >= 0 ? args.splice(a, 2)[1] : undefined
const [pfad, ...rest] = args
if (!pfad || rest.length || (a >= 0 && !ausgabe)) {
  console.error('Aufruf: npm run entwurf:blind -- <erfassung.json> [--ausgabe <blind.json>]')
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

const gespeichert = leseKennungen(pfad, erfassung)
let fest = gespeichert.fest
if (!fest) {
  fest = kennungen(erfassung)
  schreibeKennungen(pfad, fest)
  if (gespeichert.probleme.length)
    console.error(`Warnung: Gespeicherte Kennungen passten nicht mehr zur Erfassung und wurden neu erzeugt – eine frühere Bewertung ist damit ungültig:\n  ${gespeichert.probleme.join('\n  ')}`)
}
const text = JSON.stringify(blindListe(katalog, erfassung, fest), null, 2)
if (ausgabe) writeFileSync(ausgabe, text + '\n', 'utf8')
else console.log(text)
