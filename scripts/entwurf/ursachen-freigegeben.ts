// Prüft vor dem Erfassen von Maßnahmen, dass die Ursachen eines Themas freigegeben sind:
// Sie stehen im Zielzweig (gemergt) und sind im Arbeitsstand unverändert.
// Aufruf: npm run ursachen:freigegeben -- <Themen-ID> [--gegen origin/main]
// Vorher `git fetch origin main`, damit der Zielzweig aktuell ist.
import { ursachenFreigegeben } from '../entwurf.ts'
import { gitStand, pruefeDatenordner } from '../katalog-laden.ts'

const args = process.argv.slice(2)
const i = args.indexOf('--gegen')
const ref = i >= 0 ? args.splice(i, 2)[1] : 'origin/main'
const themaId = Number(args[0])
if (!Number.isInteger(themaId)) {
  console.error('Aufruf: npm run ursachen:freigegeben -- <Themen-ID> [--gegen origin/main]')
  process.exit(1)
}

const jetzt = pruefeDatenordner()
if (jetzt.fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const fehler = ursachenFreigegeben(pruefeDatenordner(gitStand(ref)).katalog, jetzt.katalog, themaId)
for (const f of fehler) console.error(`Fehler:  ${f}`)
if (fehler.length) process.exit(1)
const n = jetzt.katalog.ursachen.filter((u) => u.thema_id === themaId).length
console.log(`Ursachen von Thema ${themaId} sind freigegeben (${n} Ursachen, unverändert gegenüber ${ref}).`)
