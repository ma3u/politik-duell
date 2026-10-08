// Bereitet den Auftrag an den Bewertungs-Agenten vor (.claude/agents/blind-bewertung.md). Der Agent liest
// die Blindliste selbst und schreibt seine Antwort selbst – niemand schreibt Liste oder Antwort ab.
//
// 1. Prüft, dass blind.json zur aktuellen Erfassung passt (Prüfsumme) und die Kennungen stimmen.
// 2. Legt frühere Fassungen von protokoll/bewertung-auftrag.txt und bewertung-antwort.txt als
//    bewertung-auftrag-N.txt / bewertung-antwort-N.txt ab (N = 1, 2 …: frühere Fassungen; ohne Nummer:
//    die laufende). So ist die Antwortdatei leer, und der Agent schreibt sie neu.
// 3. Archiviert die Blindliste als protokoll/blind-<Prüfsumme>.json (Grundlage einer Teil-Neubewertung).
// 4. Schreibt den Auftrag (zwei Pfade, Prüfsumme, Datum, ggf. die Rückfrage) nach
//    protokoll/bewertung-auftrag.txt und gibt ihn aus – genau dieser Text geht an den Agenten.
// Eine Rückfrage (--rueckfrage <datei>) darf keine Parteinamen, Personen oder Länder enthalten.
// Aufruf: npm run entwurf:bewertung-auftrag -- <erfassung.json> [--rueckfrage <datei>] [--datum JJJJ-MM-TT]
import { copyFileSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { blindListe, enthaeltParteinamen, ohneLaender, PROTOKOLL, type BlindListe } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { leseErfassung } from './erfassung-datei.ts'
import { leseKennungen } from './kennungen-datei.ts'
import { archivPfad, protokollOrdner } from './protokoll-lesen.ts'

const args = process.argv.slice(2)
const wert = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args.splice(i, 2)[1] ?? '' : undefined
}
const rueckfragePfad = wert('--rueckfrage')
const datum = wert('--datum') ?? new Date().toISOString().slice(0, 10)
const [pfad, ...rest] = args
if (!pfad || rest.length || rueckfragePfad === '' || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
  console.error('Aufruf: npm run entwurf:bewertung-auftrag -- <erfassung.json> [--rueckfrage <datei>] [--datum JJJJ-MM-TT]')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const fehlerliste: string[] = []
const erfassung = leseErfassung(pfad)
const { fest, probleme } = leseKennungen(pfad, erfassung)
if (!fest) fehlerliste.push('kennungen.json fehlt – erst npm run entwurf:blind')
fehlerliste.push(...probleme)
const blindDatei = join(pfad, '..', 'blind.json')
let blind: BlindListe | undefined
if (!existsSync(blindDatei)) fehlerliste.push(`${blindDatei} fehlt – erst npm run entwurf:blind`)
else blind = JSON.parse(readFileSync(blindDatei, 'utf8')) as BlindListe
if (blind && fest && !probleme.length && blindListe(katalog, erfassung, fest).pruefsumme !== blind.pruefsumme)
  fehlerliste.push('blind.json passt nicht zur aktuellen Erfassung (Prüfsumme) – seit entwurf:blind wurde etwas geändert. entwurf:blind erneut ausführen')

let rueckfrage = ''
if (rueckfragePfad !== undefined) {
  rueckfrage = readFileSync(rueckfragePfad, 'utf8').trim()
  const weitere = katalog.parteien.flatMap((p) => [p.name, p.kurzname])
  if (!rueckfrage) fehlerliste.push('Rückfrage ist leer')
  if (enthaeltParteinamen(rueckfrage, weitere)) fehlerliste.push('Rückfrage nennt eine Partei oder Person – der Bewertungs-Agent darf keine Herkunft erfahren')
  if (ohneLaender(rueckfrage) !== rueckfrage) fehlerliste.push('Rückfrage nennt ein Land, eine Stadt oder ein Landesorgan – neutral formulieren')
}
for (const f of fehlerliste) console.error(`Fehler:  ${f}`)
if (fehlerliste.length || !blind) process.exit(1)

// Frühere Fassungen ablegen: Die Antwortdatei muss leer sein, damit der Agent sie neu schreibt.
const ordner = protokollOrdner(pfad)
const auftragDatei = join(ordner, PROTOKOLL.auftrag)
const antwortDatei = join(ordner, PROTOKOLL.antwort)
if (existsSync(auftragDatei) || existsSync(antwortDatei)) {
  let n = 1
  while (existsSync(join(ordner, `bewertung-auftrag-${n}.txt`)) || existsSync(join(ordner, `bewertung-antwort-${n}.txt`))) n++
  if (existsSync(auftragDatei)) renameSync(auftragDatei, join(ordner, `bewertung-auftrag-${n}.txt`))
  if (existsSync(antwortDatei)) renameSync(antwortDatei, join(ordner, `bewertung-antwort-${n}.txt`))
  console.error(`Frühere Fassung abgelegt als bewertung-auftrag-${n}.txt / bewertung-antwort-${n}.txt – in protokoll/rueckfragen.md eintragen.`)
}
copyFileSync(blindDatei, archivPfad(pfad, blind.pruefsumme))

// Steht nur hier, nicht in der Agentenbeschreibung: Der Agent liest die Regeln nur, wenn sie gelten.
const teilNeubewertung = (n: number) => [
  `Teil-Neubewertung: Bewerte nur die ${n} Kennungen unter „teilbewertung.zu_bewerten“ (neu oder geändert). Lies trotzdem die ganze Liste und „teilbewertung.bisher“ (die bisherige Bewertung der übrigen Kennungen, ohne Herkunft): Gleiche Lösungswege bekommen dasselbe Instrument – verweise auf ein bisheriges („"instrument": "I3"“) oder ein vorhandenes (Zahl).`,
  'Bisherige Instrumente und Zuordnungen änderst du nicht; neue Instrumente bekommen Kennungen, die in „bisher“ nicht vorkommen. In „zuordnung“ stehen nur die Kennungen aus „zu_bewerten“, in „neue_instrumente“ nur neue Instrumente. Ein Skript führt deine Antwort mit der bisherigen zusammen und lehnt ab, wenn sich Unverändertes unterscheidet.',
  'Hältst du eine bisherige Bewertung für falsch, schreibe das unter das JSON – die Koordination entscheidet dann über eine vollständige Neubewertung.',
]

const posix = (p: string) => resolve(p).replace(/\\/g, '/')
const teil = blind.teilbewertung
const text = [
  'Bewerte die Blindliste nach .claude/agents/blind-bewertung.md.',
  `Liste (nur lesen): ${posix(blindDatei)}`,
  `Prüfsumme der Liste: ${blind.pruefsumme}`,
  `Antwort (nur schreiben): ${posix(antwortDatei)}`,
  `Heute ist der ${datum}.`,
  ...(teil ? ['', ...teilNeubewertung(teil.zu_bewerten.length)] : []),
  ...(rueckfrage ? ['', 'Rückfrage der Koordination:', rueckfrage] : []),
].join('\n')
writeFileSync(auftragDatei, text + '\n', 'utf8')
console.log(text)
console.error(`\n${auftragDatei} geschrieben. Genau diesen Text als Auftrag an den Agenten blind-bewertung geben.`)
