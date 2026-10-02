// Übernimmt die Ergebnisse der Prüfung durch Eingeladene in den Datenkatalog.
// Aufruf: npm run pruefung:uebernehmen -- <export.json> [--geklaert]
//   <export.json>  Datei aus Admin → Prüfung → „Export (ohne Namen)“
//   --geklaert     Maßnahmen mit Spannweite ≥ 2 sind geklärt und dürfen übernommen werden
// Regeln: daten/README.md → „Prüfung“.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pruefeDatenordner } from './katalog-laden.ts'
import { exportPfad, formatiere, pruefeExport, uebernehme } from './pruefung-export.ts'

const argumente = process.argv.slice(2)
const pfad = argumente.find((a) => !a.startsWith('--'))
if (!pfad) {
  console.error('Aufruf: npm run pruefung:uebernehmen -- <export.json> [--geklaert]')
  process.exit(1)
}

const vorher = pruefeDatenordner()
if (vorher.fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}

let roh: unknown
try {
  roh = JSON.parse(readFileSync(pfad, 'utf8'))
} catch (e) {
  console.error(`${pfad}: nicht lesbar – ${e instanceof Error ? e.message : e}`)
  process.exit(1)
}

const { export: daten, fehler, warnungen } = pruefeExport(roh, vorher.katalog, { geklaert: argumente.includes('--geklaert') })
for (const w of warnungen) console.warn(`Warnung: ${w}`)
for (const f of fehler) console.error(`Fehler:  ${f}`)
if (!daten) process.exit(1)

const ordner = new URL('../daten/themen/', import.meta.url)
const datei = readdirSync(ordner)
  .filter((d) => d.endsWith('.json'))
  .map((d) => new URL(d, ordner))
  .find((u) => (JSON.parse(readFileSync(u, 'utf8')) as { id?: number }).id === daten.thema_id)!
const original = readFileSync(datei, 'utf8')
const { inhalt, aenderungen } = uebernehme(JSON.parse(original), daten)
writeFileSync(datei, formatiere(inhalt) + '\n')
// Der Export (nur Zahlen, keine Namen) kommt ins Repository: Daran prüft daten:pruefen jede `bewertung`.
const ablage = new URL(`../${exportPfad(daten)}`, import.meta.url)
const ablageVorher = existsSync(ablage) ? readFileSync(ablage, 'utf8') : null
mkdirSync(new URL('.', ablage), { recursive: true })
writeFileSync(ablage, formatiere(daten) + '\n')

// Ergebnis muss die Katalogprüfung bestehen, sonst zurück zum alten Stand.
const nachher = pruefeDatenordner()
if (nachher.fehler.length) {
  writeFileSync(datei, original)
  if (ablageVorher === null) rmSync(ablage)
  else writeFileSync(ablage, ablageVorher)
  console.error(`Übernahme verworfen, Katalog wäre fehlerhaft:\n  ${nachher.fehler.join('\n  ')}`)
  process.exit(1)
}

const name = datei.pathname.split('/').pop()
console.log(`\ndaten/themen/${name}: ${aenderungen.length} Maßnahmen übernommen, Export in ${exportPfad(daten)}`)
for (const a of aenderungen) {
  const geaendert = a.vorher[0] !== a.nachher[0] || a.vorher[1] !== a.nachher[1]
  console.log(`  ${a.massnahme_id}: ${a.vorher.join('×')} → ${a.nachher.join('×')}${geaendert ? '  (geändert)' : ''}`)
}
console.log(
  '\nNächste Schritte: Belege prüfen (Durchgang B der Prüfliste), dann `geprueft: true` setzen,\n' +
    '`npm run seed` ausführen und Pull Request mit Begründungen (gerade Anzahl, Spannweite) öffnen.',
)
