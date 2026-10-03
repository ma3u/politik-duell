// Selbstprüfung eines Erfassungs-Agenten vor der Abgabe: liest seine Antwort (JSON und Protokoll)
// aus protokoll/, prüft Felder, Längen, Ebenen, Zahlen, Bündel und ob jedes Zitat auf der
// angegebenen PDF-Seite steht, und speichert das Ergebnis bei Erfolg als programme/<Name>.json.
// So behebt der Agent Fehler, solange er das Programm noch kennt – statt in einer Rückfrage.
// Aufruf: npm run entwurf:programm-pruefen -- <protokoll/erfassung-<Name>[-rueckfrage-N].txt> [--lokal <ordner>]
// Erwartet die Erfassung (thema_id) als erfassung.json im Arbeitsordner (eine Ebene über protokoll/).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { kurzbericht, programmName, pruefeProgramm, TREFFER_OHNE_MASSNAHME, vorgeschlageneUrsachen, zitatHinweise, type ErfasstesProgramm } from '../entwurf.ts'
import { fundstellen, zulaessigeUrsachen } from './auftrag-text.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { erfassungsSeiten, lokalePdfs } from '../programme.ts'
import { findeZitat } from '../zitate.ts'
import { arbeitsordnerVon, erfassungIn, leseErfassung, programmOrdner } from './erfassung-datei.ts'
import { erstesJsonObjekt } from './json-text.ts'

const args = process.argv.slice(2)
const l = args.indexOf('--lokal')
const lokal = l >= 0 ? lokalePdfs(args.splice(l, 2)[1]) : undefined
const [datei, ...rest] = args
if (!datei || rest.length) {
  console.error('Aufruf: npm run entwurf:programm-pruefen -- <protokoll/erfassung-<Name>.txt> [--lokal <ordner>]')
  process.exit(1)
}
const ordner = arbeitsordnerVon(datei)
if (!existsSync(erfassungIn(ordner))) {
  console.error(`${erfassungIn(ordner)} fehlt – die Antwort gehört nach <Arbeitsordner>/protokoll/`)
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = leseErfassung(erfassungIn(ordner))
let p: ErfasstesProgramm
try {
  p = erstesJsonObjekt(readFileSync(datei, 'utf8')).objekt as ErfasstesProgramm
} catch (e) {
  console.error(`Fehler:  ${e instanceof Error ? e.message : e} – am Anfang der Datei steht das JSON (ErfasstesProgramm), danach das Protokoll`)
  process.exit(1)
}
const partei = katalog.parteien.find((x) => x.id === p.partei_id)
if (!partei) {
  console.error(`Fehler:  unbekannte partei_id ${p.partei_id}`)
  process.exit(1)
}
const name = programmName(partei.kurzname, p.land ?? null)
const fehlerliste: string[] = []
const hinweise: string[] = []
if (!basename(datei).startsWith(`erfassung-${name}`)) fehlerliste.push(`Datei ${basename(datei)} passt nicht zum Programm im JSON (${name}) – falsche Partei oder Ebene?`)

if (p.nicht_durchsucht !== undefined) {
  if (!fehlerliste.length) {
    mkdirSync(programmOrdner(ordner), { recursive: true })
    writeFileSync(join(programmOrdner(ordner), `${name}.json`), JSON.stringify({ partei_id: p.partei_id, land: p.land ?? null, nicht_durchsucht: p.nicht_durchsucht }, null, 2) + '\n', 'utf8')
  }
  for (const f of fehlerliste) console.error(`Fehler:  ${f}`)
  if (!fehlerliste.length) console.log(`--- Kurzbericht ---\n${kurzbericht(name, p, 0, join(programmOrdner(ordner), `${name}.json`))}`)
  process.exit(fehlerliste.length ? 1 : 0)
}

for (const f of pruefeProgramm(katalog, erfassung, p)) {
  // Ein Bündel, das noch nicht im Leitfaden steht, entscheidet der Koordinator für alle Programme.
  if (f.includes('„Neue Bündel“')) hinweise.push(f)
  else fehlerliste.push(f)
}
const massnahmen = Array.isArray(p.massnahmen) ? p.massnahmen : []
// Zitate gegen die ausgewertete Fassung des Programms.
const lp = p.land ? katalog.landesprogramme.find((x) => x.partei_id === p.partei_id && x.land === p.land && x.aktuell) : undefined
const url = lp ? lp.url : partei.programm_url
let seiten: string[] | null = null
try {
  if (url) ({ seiten } = await erfassungsSeiten(url, lp ? lp.sha256 : partei.programm_sha256, lokal))
} catch (e) {
  hinweise.push(`Zitate nicht geprüft – Programm nicht geladen: ${e instanceof Error ? e.message : e}`)
}
// Pflichtursachen (viele Treffer, keine Maßnahme): gelesene Seiten und Grund strukturiert in „nicht_erfasst“.
// So behebt der Agent eine fehlende Begründung selbst, statt dass die Koordination nachfragt.
if (seiten) {
  const ursachen = zulaessigeUrsachen(katalog, erfassung.thema_id, p.land ?? null).map((u) => u.id)
  const f = fundstellen(seiten, erfassung.suchbegriffe, ursachen)
  for (const u of ursachen) {
    const summe = Object.values(f.zahlen[u] ?? {}).reduce((a, r) => a + Object.values(r).reduce((x, y) => x + y, 0), 0)
    const n = (p.nicht_erfasst ?? []).find((x) => x.ursache === u)
    for (const s of Array.isArray(n?.seiten) ? n.seiten : []) if (Number.isInteger(s) && s > seiten.length) fehlerliste.push(`nicht_erfasst ${u}: Seite ${s} gibt es nicht (${seiten.length} Seiten)`)
    if (massnahmen.some((m) => vorgeschlageneUrsachen(m).includes(u))) continue
    if (summe >= TREFFER_OHNE_MASSNAHME && !n?.seiten?.length)
      fehlerliste.push(`Pflichtursache ${u} (${summe} Treffer) ohne Maßnahme: in „nicht_erfasst“ die gelesenen Fundstellen (Seiten) und den Grund nennen`)
    else if (n && Array.isArray(n.seiten) && !n.seiten.some((s) => f.seiten.some((x) => x.n === s && [...x.marken.keys()].some((k) => k.startsWith(`${u} `)))))
      hinweise.push(`nicht_erfasst ${u}: keine der genannten Seiten hat einen Treffer zu dieser Ursache – Fundstellen aus dem Auftrag gelesen?`)
  }
}
const gesehen = new Map<string, number>()
for (const [j, m] of massnahmen.entries()) {
  const was = `Maßnahme ${j + 1}`
  if (seiten && m.zitat && Number.isInteger(m.seite)) {
    const befund = findeZitat(m.zitat, seiten, m.seite)
    if (befund.status === 'andere_seite') fehlerliste.push(`${was}: Zitat steht nicht auf S. ${m.seite}, sondern auf S. ${befund.seiten.join(', ')}`)
    else if (befund.status === 'nicht_gefunden') fehlerliste.push(`${was}: Zitat nicht im Programm gefunden – wörtlich zitieren, Auslassungen als „[…]“, fremde Zeichen im Wort durch „[…]“ ersetzen`)
  }
  for (const h of zitatHinweise(m)) hinweise.push(`${was}: ${h}`)
  const schluessel = `${m.seite}|${(m.zitat ?? '').toLowerCase().replace(/\s+/g, ' ').slice(0, 60)}`
  const vorher = gesehen.get(schluessel)
  if (vorher !== undefined) hinweise.push(`${was}: gleiche Stelle wie Maßnahme ${vorher} – gleicher Vorschlag nur einmal erfassen`)
  else gesehen.set(schluessel, j + 1)
}

for (const f of fehlerliste) console.error(`Fehler:  ${f}`)
for (const h of hinweise) console.error(`Hinweis: ${h}`)
if (fehlerliste.length) {
  console.error(`\n${fehlerliste.length} Fehler – beheben, Datei neu schreiben und erneut prüfen.`)
  process.exit(1)
}
mkdirSync(programmOrdner(ordner), { recursive: true })
const ziel = join(programmOrdner(ordner), `${name}.json`)
writeFileSync(ziel, JSON.stringify(p, null, 2) + '\n', 'utf8')
// Kurzbericht in fester Form – genau diese Zeilen gibt der Agent an die Koordination zurück.
console.log(`\n--- Kurzbericht ---\n${kurzbericht(name, p, hinweise.length, ziel)}`)
