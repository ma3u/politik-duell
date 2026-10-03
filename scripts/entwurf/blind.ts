// Liste zum Bewerten ohne Parteinamen: Maßnahmen aus einer Erfassung in gemischter Reihenfolge mit
// Kennungen (M01, M02 …), dazu Thema, Ursachen, Regeln des Leitfadens und vorhandene Instrumente.
// Nur diese Datei liest der Bewertungs-Agent (.claude/agents/blind-bewertung.md).
//
// Kennungen: Beim ersten Lauf vergeben und als kennungen.json neben der Erfassung gespeichert. Bei jedem
// weiteren Lauf werden sie über den Inhalt zugeordnet (Partei, Land, Zitat – nicht die Stelle): Unveränderte
// Maßnahmen behalten ihre Kennung, neue bekommen fortlaufende, entfallene werden nicht neu vergeben. Das
// Skript meldet „neu / entfallen / geändert“ – nie ein stilles Neuverteilen.
//
// Parteinamen, Personen und Länder werden ersetzt; Wörter, die trotzdem auf eine Partei hindeuten
// („liberal“, „Fraktion“ …), gibt das Skript aus und bricht ab, wenn es mehr als resteSchwelle sind.
//
// --teil <bewertung.json>: Teil-Neubewertung. Die Liste bekommt einen Block „teilbewertung“ mit den neuen
// oder geänderten Kennungen und der bisherigen Bewertung der übrigen (verlangt die archivierte Blindliste
// protokoll/blind-<Prüfsumme>.json aus entwurf:bewertung-auftrag).
// Aufruf: npm run entwurf:blind -- <erfassung.json> [--ausgabe <blind.json> | -] [--schwelle N] [--teil <bewertung.json>] [--neue-kennungen]
// Ohne --ausgabe: blind.json neben der Erfassung; „--ausgabe -“: Standardausgabe.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { blindListe, blindReste, erfassungsHinweise, kennungen, ordneKennungen, pruefeErfassung, resteSchwelle, teilbewertung, type BlindListe, type Bewertung, type Kennung } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { leseErfassung } from './erfassung-datei.ts'
import { kennungenPfad, leseKennungenDatei, schreibeKennungen } from './kennungen-datei.ts'
import { archivPfad } from './protokoll-lesen.ts'

const args = process.argv.slice(2)
const wert = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args.splice(i, 2)[1] ?? '' : undefined
}
const schalter = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? (args.splice(i, 1), true) : false
}
const ausgabe = wert('--ausgabe')
const schwelleArg = wert('--schwelle')
const teilPfad = wert('--teil')
const neueKennungen = schalter('--neue-kennungen')
const [pfad, ...rest] = args
if (!pfad || rest.length || ausgabe === '' || teilPfad === '' || (schwelleArg !== undefined && !/^\d+$/.test(schwelleArg))) {
  console.error('Aufruf: npm run entwurf:blind -- <erfassung.json> [--ausgabe <blind.json>] [--schwelle N] [--teil <bewertung.json>] [--neue-kennungen]')
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

// Kennungen: gespeicherte über den Inhalt zuordnen, sonst (erster Lauf) neu vergeben.
const name = (x: Kennung) => `${katalog.parteien.find((p) => p.id === x.partei_id)?.kurzname ?? x.partei_id} (${x.land ?? 'Bund'}), S. ${x.seite ?? '?'}: ${x.beschreibung ?? ''}…`
let datei: ReturnType<typeof leseKennungenDatei>
try {
  datei = leseKennungenDatei(pfad)
} catch (e) {
  console.error(`Fehler:  ${kennungenPfad(pfad)} nicht lesbar (${e instanceof Error ? e.message : e}). Reparieren oder mit --neue-kennungen alle Kennungen neu vergeben (eine frühere Bewertung ist dann ungültig).`)
  process.exit(1)
}
let fest: Kennung[]
if (!datei || neueKennungen) {
  fest = kennungen(erfassung)
  schreibeKennungen(pfad, { kennungen: fest, vergeben_bis: fest.length })
  console.error(`Kennungen: ${fest.length} ${datei ? 'neu vergeben (--neue-kennungen) – eine frühere Bewertung ist damit ungültig' : 'vergeben'} (${kennungenPfad(pfad)})`)
} else {
  const a = ordneKennungen(erfassung, datei.kennungen, datei.vergeben_bis)
  for (const p of a.probleme) console.error(`Fehler:  kennungen.json: ${p}`)
  if (a.probleme.length) process.exit(1)
  fest = a.kennungen
  const behalten = fest.length - a.neu.length
  console.error(`Kennungen: ${behalten} behalten, ${a.neu.length} neu, ${a.entfallen.length} entfallen, ${a.geaendert.length} geändert`)
  for (const x of a.neu) console.error(`  neu:       ${x.kennung} ${name(x)}`)
  for (const x of a.entfallen) console.error(`  entfallen: ${x.kennung} ${name(x)}`)
  for (const g of a.geaendert) console.error(`  geändert:  ${g.kennung.kennung} (${g.was.join(', ')}) ${name(g.kennung)}`)
  schreibeKennungen(pfad, a, datei)
}
const liste: BlindListe = blindListe(katalog, erfassung, fest)

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

if (teilPfad !== undefined) {
  const vorher = JSON.parse(readFileSync(teilPfad, 'utf8')) as Bewertung
  const archiv = vorher.blind_pruefsumme ? archivPfad(pfad, vorher.blind_pruefsumme) : ''
  if (!archiv || !existsSync(archiv)) {
    console.error(`Fehler:  archivierte Blindliste ${archiv || 'protokoll/blind-<Prüfsumme>.json'} fehlt – ohne sie ist nicht prüfbar, was unverändert ist. Ganz neu bewerten.`)
    process.exit(1)
  }
  const { block, fehler: teilFehler } = teilbewertung(JSON.parse(readFileSync(archiv, 'utf8')) as BlindListe, liste, vorher)
  for (const f of teilFehler) console.error(`Fehler:  ${f}`)
  if (!block) process.exit(1)
  if (!block.zu_bewerten.length) console.error('Hinweis: Keine Kennung neu oder geändert – die bisherige Bewertung gilt unverändert (Prüfsumme der Liste trotzdem neu?).')
  console.error(`Teilbewertung: ${block.zu_bewerten.length} von ${liste.massnahmen.length} Kennungen zu bewerten (${block.zu_bewerten.join(', ')})`)
  liste.teilbewertung = block
}
const text = JSON.stringify(liste, null, 2)
if (ausgabe !== '-') {
  const ziel = ausgabe ?? join(pfad, '..', 'blind.json')
  writeFileSync(ziel, text + '\n', 'utf8')
  console.error(`${ziel} geschrieben (Prüfsumme ${liste.pruefsumme}). Weiter: npm run entwurf:bewertung-auftrag -- ${pfad}`)
} else console.log(text)
