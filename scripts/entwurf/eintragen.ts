// Schreibt eine Erfassung (je Programm: Maßnahmen mit Zitat und Seite) und die Bewertung
// ohne Parteinamen (Kennungen aus npm run entwurf:blind) in die Themendatei – mit neuen
// IDs, als ungeprüfter KI-Entwurf. Danach: npm run daten:pruefen, zitate:pruefen, punkte.
// Aufruf: npm run entwurf:eintragen -- <erfassung.json> <bewertung.json> [--stand JJJJ-MM-TT]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { eintragen, pruefeBewertung, pruefeErfassung, pruefeProtokoll, zuordnungsBilanz, type Bewertung } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { formatiere } from '../pruefung-export.ts'
import { leseErfassung } from './erfassung-datei.ts'
import { leseKennungen } from './kennungen-datei.ts'
import { leseProtokoll } from './protokoll-lesen.ts'

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
const erfassung = leseErfassung(erfassungPfad)
const bewertung = JSON.parse(readFileSync(bewertungPfad, 'utf8')) as Bewertung
const { fest, probleme: kennungProbleme } = leseKennungen(erfassungPfad, erfassung)
for (const p of kennungProbleme) console.error(`Fehler:  kennungen.json passt nicht zur Erfassung: ${p}`)
if (kennungProbleme.length) process.exit(1)
// Ohne Protokoll kein Eintrag: Rohantworten, Aufträge und Rückfragen machen Eingriffe sichtbar.
const probleme = [
  ...pruefeErfassung(katalog, erfassung),
  ...pruefeBewertung(katalog, erfassung, bewertung, fest),
  ...pruefeProtokoll(katalog, erfassung, leseProtokoll(erfassungPfad), bewertung.blind_pruefsumme),
]
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
writeFileSync(datei, formatiere(eintragen(katalog, JSON.parse(original), erfassung, bewertung, stand, fest)) + '\n')

// Ergebnis muss die Katalogprüfung bestehen, sonst zurück zum alten Stand.
const nachher = pruefeDatenordner()
if (nachher.fehler.length) {
  writeFileSync(datei, original)
  console.error(`Eintragen verworfen, Katalog wäre fehlerhaft:\n  ${nachher.fehler.join('\n  ')}`)
  process.exit(1)
}
const n = nachher.katalog.massnahmen.filter((m) => m.thema_id === erfassung.thema_id).length - katalog.massnahmen.filter((m) => m.thema_id === erfassung.thema_id).length
const neueInstrumente = nachher.katalog.instrumente.length - katalog.instrumente.length
console.log(`daten/themen/${name}: ${n} Maßnahmen, ${neueInstrumente} neue Instrumente, ${erfassung.programme.length} Programme eingetragen.`)
for (const z of zuordnungsBilanz(katalog, erfassung, bewertung, fest)) console.log(`Zuordnung: ${z}`)
console.log('Weiter: npm run daten:pruefen && npm run zitate:pruefen -- --thema ' + erfassung.thema_id + ' && npm run punkte -- ' + erfassung.thema_id)
