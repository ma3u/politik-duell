// Selbstprüfung des Agenten haltung-erfassung: je Haltung des Laufs genau ein Fund, Felder und Form, und ob
// jedes Zitat wörtlich auf der genannten PDF-Seite steht. Bei Erfolg wird jeder Fund als
// .cache/haltung/<ID>/funde/<Name>.json gespeichert.
// Aufruf: npm run haltung:programm-pruefen -- <.cache/haltung/lauf/protokoll/fund-<Name>.json> [--lokal <ordner>]
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fundName, pruefeFund, type HaltungFund } from '../haltung-erfassung.ts'
import { erfassungsSeiten, lokalePdfs } from '../programme.ts'
import { findeZitat } from '../zitate.ts'
import { erstesJsonObjekt } from '../entwurf/json-text.ts'
import { abbruch, fundeOrdner, katalogUndHaltungen, laufOrdner, oderAbbruch, ordnerAnlegen } from './gemeinsam.ts'

const args = process.argv.slice(2)
const l = args.indexOf('--lokal')
const lokal = l >= 0 ? lokalePdfs(args.splice(l, 2)[1]) : undefined
const pfad = args[0]
if (!pfad) abbruch('Aufruf: npm run haltung:programm-pruefen -- <.cache/haltung/lauf/protokoll/fund-<Name>.json>')
if (resolve(dirname(pfad)) !== resolve(laufOrdner(), 'protokoll')) abbruch(`Der Fund gehört nach ${join(laufOrdner(), 'protokoll')}/`)
const lauf = JSON.parse(readFileSync(join(laufOrdner(), 'lauf.json'), 'utf8')) as { haltungen: number[] }
let roh: unknown
try {
  roh = erstesJsonObjekt(readFileSync(pfad, 'utf8'), true).objekt
} catch (e) {
  abbruch(`Kein gültiges JSON in ${pfad}: ${e instanceof Error ? e.message : e}`)
}
const funde = (Array.isArray(roh) ? roh : [roh]) as HaltungFund[]
const { katalog, haltungen } = oderAbbruch(() => katalogUndHaltungen(lauf.haltungen))
const fehler: string[] = []
const parteien = new Set(funde.map((f) => f?.partei_id))
if (parteien.size !== 1) fehler.push('alle Einträge brauchen dieselbe partei_id (die aus dem Auftrag)')
for (const { haltung } of haltungen) {
  const n = funde.filter((f) => f?.haltung_id === haltung.id).length
  if (n !== 1) fehler.push(`Haltung ${haltung.id}: ${n} Einträge, erwartet genau einer`)
}
for (const f of funde) if (!lauf.haltungen.includes(f?.haltung_id)) fehler.push(`Haltung ${f?.haltung_id} gehört nicht zu diesem Lauf`)
const partei = katalog.parteien.find((p) => p.id === funde[0]?.partei_id)
let seiten: string[] | null = null
if (partei && funde.some((f) => f?.zitat))
  try {
    ;({ seiten } = await erfassungsSeiten(partei.programm_url, partei.programm_sha256, lokal))
  } catch (e) {
    abbruch(`Programm nicht geladen, Zitate nicht prüfbar: ${e instanceof Error ? e.message : e} – mit --lokal <ordner> erneut prüfen`)
  }
for (const f of funde) {
  const h = haltungen.find((x) => x.haltung.id === f?.haltung_id)
  if (!h) continue
  for (const x of pruefeFund(katalog, h.haltung, f)) fehler.push(`Haltung ${f.haltung_id}: ${x}`)
  if (seiten && f.zitat && Number.isInteger(f.seite)) {
    const b = findeZitat(f.zitat, seiten, f.seite!)
    if (b.status === 'andere_seite') fehler.push(`Haltung ${f.haltung_id}: Zitat steht nicht auf S. ${f.seite}, sondern auf S. ${b.seiten.join(', ')}`)
    if (b.status === 'nicht_gefunden') fehler.push(`Haltung ${f.haltung_id}: Zitat nicht im Programm gefunden – wörtlich zitieren, eine Auslassung höchstens als „[…]“`)
  }
}
for (const f of fehler) console.error(`Fehler:  ${f}`)
if (fehler.length) process.exit(1)
for (const f of funde) {
  const { arbeit } = haltungen.find((x) => x.haltung.id === f.haltung_id)!
  ordnerAnlegen(fundeOrdner(arbeit))
  writeFileSync(join(fundeOrdner(arbeit), `${fundName(katalog, f.partei_id)}.json`), JSON.stringify(f, null, 2) + '\n', 'utf8')
}
console.log(`In Ordnung: ${funde.map((f) => `${f.haltung_id} ${f.zitat ? `S. ${f.seite}` : 'keine Aussage'}`).join(' · ')}`)
