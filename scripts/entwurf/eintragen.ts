// Schreibt eine Erfassung (je Programm: Maßnahmen mit Zitat und Seite) und die Bewertung
// ohne Parteinamen (Kennungen aus npm run entwurf:blind) in die Themendatei – mit neuen
// IDs, als ungeprüfter KI-Entwurf. Danach: npm run daten:pruefen, zitate:pruefen, punkte.
// Aufruf: npm run entwurf:eintragen -- <erfassung.json> <bewertung.json> [--stand JJJJ-MM-TT]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { eintragen, pruefeBewertung, pruefeErfassung, type Bewertung, type Erfassung } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { formatiere } from '../pruefung-export.ts'

const args = process.argv.slice(2)
const i = args.indexOf('--stand')
const stand = i >= 0 ? args.splice(i, 2)[1] : new Date().toISOString().slice(0, 10)
const [erfassungPfad, bewertungPfad] = args
if (!erfassungPfad || !bewertungPfad) {
  console.error('Aufruf: npm run entwurf:eintragen -- <erfassung.json> <bewertung.json> [--stand JJJJ-MM-TT]')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = JSON.parse(readFileSync(erfassungPfad, 'utf8')) as Erfassung
const bewertung = JSON.parse(readFileSync(bewertungPfad, 'utf8')) as Bewertung
const probleme = [...pruefeErfassung(katalog, erfassung), ...pruefeBewertung(katalog, erfassung, bewertung)]
for (const p of probleme) console.error(`Fehler:  ${p}`)
if (probleme.length) process.exit(1)

const ordner = new URL('../../daten/themen/', import.meta.url)
const name = readdirSync(ordner).find((d) => d.endsWith('.json') && JSON.parse(readFileSync(new URL(d, ordner), 'utf8')).id === erfassung.thema_id)
if (!name) {
  console.error(`Keine Themendatei mit id ${erfassung.thema_id}`)
  process.exit(1)
}
const datei = new URL(name, ordner)
const original = readFileSync(datei, 'utf8')
writeFileSync(datei, formatiere(eintragen(katalog, JSON.parse(original), erfassung, bewertung, stand)) + '\n')

// Ergebnis muss die Katalogprüfung bestehen, sonst zurück zum alten Stand.
const nachher = pruefeDatenordner()
if (nachher.fehler.length) {
  writeFileSync(datei, original)
  console.error(`Eintragen verworfen, Katalog wäre fehlerhaft:\n  ${nachher.fehler.join('\n  ')}`)
  process.exit(1)
}
const n = erfassung.programme.reduce((s, p) => s + p.massnahmen.length, 0)
console.log(`daten/themen/${name}: ${n} Maßnahmen, ${bewertung.neue_instrumente.length} neue Instrumente, ${erfassung.programme.length} Programme eingetragen.`)
console.log('Weiter: npm run daten:pruefen && npm run zitate:pruefen -- --thema ' + erfassung.thema_id + ' && npm run punkte -- ' + erfassung.thema_id)
