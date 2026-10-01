// Prüft eine Bewertung (Antwort des Agenten blind-bewertung), ohne etwas zu schreiben:
// jede Kennung genau einmal, Instrumente bekannt, eine Ebene je Instrument, keine unbenutzten
// Instrumente, Wirksamkeit 3 nur mit Beleg – und Hinweise (zu viel „offen“, zu viele Instrumente).
// Aufruf: npm run entwurf:bewertung-pruefen -- <erfassung.json> <bewertung.json>
import { readFileSync } from 'node:fs'
import { bewertungsHinweise, pruefeBewertung, pruefeErfassung, type Bewertung, type Erfassung } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { leseKennungen } from './kennungen-datei.ts'

const [erfassungPfad, bewertungPfad, ...rest] = process.argv.slice(2)
if (!erfassungPfad || !bewertungPfad || rest.length) {
  console.error('Aufruf: npm run entwurf:bewertung-pruefen -- <erfassung.json> <bewertung.json>')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = JSON.parse(readFileSync(erfassungPfad, 'utf8')) as Erfassung
const bewertung = JSON.parse(readFileSync(bewertungPfad, 'utf8')) as Bewertung
const { fest, probleme: kennungProbleme } = leseKennungen(erfassungPfad, erfassung)
const fehlerliste = [
  ...kennungProbleme.map((p) => `kennungen.json passt nicht zur Erfassung: ${p}`),
  ...pruefeErfassung(katalog, erfassung),
  ...pruefeBewertung(katalog, erfassung, bewertung, fest),
]
for (const p of fehlerliste) console.error(`Fehler:  ${p}`)
for (const h of bewertungsHinweise(bewertung)) console.error(`Hinweis: ${h}`)
if (fehlerliste.length) process.exit(1)
console.log(`Bewertung in Ordnung: ${bewertung.zuordnung.length} Maßnahmen, ${bewertung.neue_instrumente?.length ?? 0} neue Instrumente.`)
