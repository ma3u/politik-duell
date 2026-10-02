// Liste zum Bewerten ohne Parteinamen: Maßnahmen aus einer Erfassung in gemischter
// Reihenfolge mit Kennungen (M01, M02 …), dazu Thema, Ursachen und vorhandene Instrumente.
// Nur diese Ausgabe bekommt der Bewertungs-Agent (.claude/agents/blind-bewertung.md).
// Die Kennungen werden als kennungen.json neben der Erfassung gespeichert und danach wiederverwendet.
// Parteinamen, Personen und Länder werden ersetzt; Wörter, die trotzdem auf eine Partei hindeuten
// („liberal“, „Fraktion“ …), gibt das Skript aus und bricht ab, wenn es mehr als resteSchwelle sind.
// Aufruf: npm run entwurf:blind -- <erfassung.json> [--ausgabe <blind.json>] [--schwelle N]   (ohne --ausgabe: Standardausgabe)
import { writeFileSync } from 'node:fs'
import { blindListe, blindReste, erfassungsHinweise, kennungen, pruefeErfassung, resteSchwelle } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { leseErfassung } from './erfassung-datei.ts'
import { leseKennungen, schreibeKennungen } from './kennungen-datei.ts'

const args = process.argv.slice(2)
const wert = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args.splice(i, 2)[1] ?? '' : undefined
}
const ausgabe = wert('--ausgabe')
const schwelleArg = wert('--schwelle')
const [pfad, ...rest] = args
if (!pfad || rest.length || ausgabe === '' || (schwelleArg !== undefined && !/^\d+$/.test(schwelleArg))) {
  console.error('Aufruf: npm run entwurf:blind -- <erfassung.json> [--ausgabe <blind.json>] [--schwelle N]')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = leseErfassung(pfad)
const probleme = pruefeErfassung(katalog, erfassung)
for (const p of probleme) console.error(`Fehler:  ${p}`)
if (probleme.length) process.exit(1)
for (const h of erfassungsHinweise(katalog, erfassung)) console.error(`Hinweis: ${h}`)

const gespeichert = leseKennungen(pfad, erfassung)
let fest = gespeichert.fest
if (!fest) {
  fest = kennungen(erfassung)
  schreibeKennungen(pfad, fest)
  if (gespeichert.probleme.length)
    console.error(`Warnung: Gespeicherte Kennungen passten nicht mehr zur Erfassung und wurden neu erzeugt – eine frühere Bewertung ist damit ungültig:\n  ${gespeichert.probleme.join('\n  ')}`)
}
const liste = blindListe(katalog, erfassung, fest)

// Verdächtige Reste: jeder einzeln im Pull Request begründen oder die Beschreibung umformulieren.
const reste = blindReste(liste)
for (const r of reste) console.error(`Rest:    ${r.kennung}: ${r.reste.join(', ')}`)
const schwelle = schwelleArg !== undefined ? Number(schwelleArg) : resteSchwelle(liste.massnahmen.length)
if (reste.length > schwelle) {
  console.error(
    `Fehler:  ${reste.length} Maßnahmen mit Wörtern, die auf eine Partei hindeuten können (Schwelle ${schwelle}). ` +
      'Beschreibungen ohne Parteisprache formulieren; bleibt es dabei, mit --schwelle N bestätigen und jeden Rest im Pull Request begründen.',
  )
  process.exit(1)
}
const text = JSON.stringify(liste, null, 2)
if (ausgabe) writeFileSync(ausgabe, text + '\n', 'utf8')
else console.log(text)
