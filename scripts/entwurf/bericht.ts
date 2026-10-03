// Schreibt den Datenteil der Pull-Request-Beschreibung nach <Arbeitsordner>/pr-daten.md – wörtlich aus
// Erfassung, Bewertung, Kennungen, Ständen und Protokoll (scripts/entwurf/bericht-text.ts). Nach
// entwurf:eintragen aufrufen, dann stehen auch die Punkte darin. Die Koordination übernimmt die Datei in
// pr.md und ergänzt nur Einordnung, Begründungen und offene Fragen.
// Aufruf: npm run entwurf:bericht -- <erfassung.json> [<bewertung.json>]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { type BlindListe, type Bewertung, type Erfassung, type ErfasstesProgramm } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { berichtText } from './bericht-text.ts'
import { leseErfassung, mitLeitfaden, programmOrdner } from './erfassung-datei.ts'
import { leseKennungen, leseKennungenDatei } from './kennungen-datei.ts'
import { leseProtokoll } from './protokoll-lesen.ts'
import { punkteTabelle } from './punkte-tabelle.ts'

const [pfad, bewertungPfad, ...rest] = process.argv.slice(2)
if (!pfad || rest.length) {
  console.error('Aufruf: npm run entwurf:bericht -- <erfassung.json> [<bewertung.json>]')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const ordner = join(pfad, '..')
const erfassung = leseErfassung(pfad)
const bewertung = bewertungPfad ? (JSON.parse(readFileSync(bewertungPfad, 'utf8')) as Bewertung) : undefined
const { fest, probleme } = leseKennungen(pfad, erfassung)
for (const p of probleme) console.error(`Hinweis: kennungen.json: ${p}`)
const staendeOrdner = join(ordner, 'staende')
const staende = existsSync(staendeOrdner)
  ? readdirSync(staendeOrdner)
      .filter((d) => /^erfassung-\d+\.json$/.test(d))
      .sort((a, c) => Number(a.match(/\d+/)![0]) - Number(c.match(/\d+/)![0]))
      .map((d) => mitLeitfaden(JSON.parse(readFileSync(join(staendeOrdner, d), 'utf8')) as Erfassung, erfassung.leitfaden))
  : []
const nichtDurchsucht: [string, string][] = existsSync(programmOrdner(ordner))
  ? readdirSync(programmOrdner(ordner))
      .filter((d) => d.endsWith('.json'))
      .map((d) => [d.replace(/\.json$/, ''), JSON.parse(readFileSync(join(programmOrdner(ordner), d), 'utf8')) as ErfasstesProgramm] as const)
      .filter(([, p]) => p.nicht_durchsucht !== undefined)
      .map(([n, p]) => [n, p.nicht_durchsucht!])
  : []
const eingetragen = katalog.abdeckung.some((a) => a.thema_id === erfassung.thema_id)
const text = berichtText({
  katalog,
  erfassung,
  bewertung,
  fest: fest && !probleme.length ? fest : undefined,
  // Die bewertete Liste aus der Datei: Nach entwurf:eintragen stehen die neuen Instrumente im Katalog, eine neu gebaute Liste hätte eine andere Prüfsumme.
  liste: existsSync(join(ordner, 'blind.json')) ? (JSON.parse(readFileSync(join(ordner, 'blind.json'), 'utf8')) as BlindListe) : undefined,
  protokoll: leseProtokoll(pfad),
  staende,
  nichtDurchsucht,
  entfallen: leseKennungenDatei(pfad)?.entfallen ?? [],
  punkte: eingetragen ? punkteTabelle(katalog, erfassung.thema_id) : undefined,
})
const ziel = join(ordner, 'pr-daten.md')
writeFileSync(ziel, text + '\n', 'utf8')
console.log(`${ziel} geschrieben (${text.split('\n').length} Zeilen). In pr.md übernehmen; nicht abschreiben.`)
