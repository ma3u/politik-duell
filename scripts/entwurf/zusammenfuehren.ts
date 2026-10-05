// Führt die geprüften Ergebnisse je Programm (programme/<Name>.json aus entwurf:programm-pruefen)
// in die Erfassung zusammen. Nicht durchsuchte Programme bleiben draußen („noch nicht erfasst“).
// Vergleicht mit dem vorherigen Stand (plan–validate–execute): je Programm entfallene, vermutlich
// zusammengefasste, neue und geänderte Maßnahmen und Ursachen, die keine Maßnahme mehr haben. Maßnahmen
// ohne Bündel an Ursachen mit Bündeln stehen nur zur Information in ohne-buendel.txt.
// Der vorherige Stand bleibt als staende/erfassung-N.json.
// Danach: npm run entwurf:treffer -- <erfassung.json>
// Aufruf: npm run entwurf:zusammenfuehren -- <erfassung.json>
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ohneBuendel, pruefeProgramm, vergleicheErfassung, type Erfassung, type ErfasstesProgramm } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { leseLeitfaden, programmOrdner } from './erfassung-datei.ts'

const [pfad, ...rest] = process.argv.slice(2)
if (!pfad || rest.length) {
  console.error('Aufruf: npm run entwurf:zusammenfuehren -- <erfassung.json>')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = JSON.parse(readFileSync(pfad, 'utf8')) as Erfassung
const leitfaden = leseLeitfaden(erfassung.thema_id)
const ordner = programmOrdner(join(pfad, '..'))
if (!existsSync(ordner)) {
  console.error(`${ordner} fehlt – erst die Erfassungs-Agenten ihre Antworten mit entwurf:programm-pruefen speichern lassen`)
  process.exit(1)
}
const programme = new Map(erfassung.programme.map((p) => [`${p.partei_id}/${p.land}`, p]))
const fehlerliste: string[] = []
const nichtDurchsucht: string[] = []
for (const d of readdirSync(ordner).filter((x) => x.endsWith('.json')).sort()) {
  const p = JSON.parse(readFileSync(join(ordner, d), 'utf8')) as ErfasstesProgramm
  const schluessel = `${p.partei_id}/${p.land ?? null}`
  if (p.nicht_durchsucht !== undefined) {
    programme.delete(schluessel)
    nichtDurchsucht.push(`${d.replace(/\.json$/, '')}: ${p.nicht_durchsucht}`)
    continue
  }
  // Ein Bündel, das erst nach der Abgabe in den Leitfaden kam, ist jetzt bekannt – deshalb hier erneut prüfen.
  fehlerliste.push(...pruefeProgramm(katalog, { thema_id: erfassung.thema_id, leitfaden, nachtrag: erfassung.nachtrag }, p).map((f) => `${d}: ${f}`))
  programme.set(schluessel, { ...p, land: p.land ?? null })
}
for (const f of fehlerliste) console.error(`Fehler:  ${f}`)
if (fehlerliste.length) process.exit(1)
// Feste Reihenfolge: Partei, dann Bund vor den Ländern.
const liste = [...programme.values()].sort((a, b) => a.partei_id - b.partei_id || (a.land ?? '').localeCompare(b.land ?? ''))
const { treffer: _, leitfaden: __, ...ohne } = erfassung
const vorher = erfassung.programme ?? []
if (vorher.length) {
  // Vorherigen Stand aufheben, damit der Vergleich auch später nachvollziehbar bleibt.
  const staende = join(pfad, '..', 'staende')
  mkdirSync(staende, { recursive: true })
  let n = 1
  while (existsSync(join(staende, `erfassung-${n}.json`))) n++
  writeFileSync(join(staende, `erfassung-${n}.json`), readFileSync(pfad, 'utf8'), 'utf8')
}
writeFileSync(pfad, JSON.stringify({ ...ohne, programme: liste }, null, 2) + '\n', 'utf8')
const n = liste.reduce((s, p) => s + p.massnahmen.length, 0)
console.log(`${pfad}: ${liste.length} Programme, ${n} Maßnahmen.`)
for (const x of nichtDurchsucht) console.log(`nicht durchsucht (bleibt „noch nicht erfasst“, im Pull Request nennen): ${x}`)
if (vorher.length) {
  const vergleich = vergleicheErfassung(katalog, vorher, liste)
  console.log(`\nVergleich mit dem vorherigen Stand: ${vergleich.length ? '' : 'keine Änderung'}`)
  for (const z of vergleich) console.log(`  ${z}`)
  if (vergleich.length) console.log('Jede Zeile prüfen, bevor entwurf:blind läuft: Ist der Wegfall gewollt (Rückfrage, Regel)? Sonst Korrektur nach SKILL.md, Fall „Korrektur einer fehlerhaften Rückfrage“.')
}
const ungebuendelt = ohneBuendel(katalog, { programme: liste, leitfaden })
// Nur zur Information (kommt über entwurf:bericht in den Pull Request): Je Instrument zählt eine
// Maßnahme, eine zusätzliche gleichartige bringt keinen Punkt. Keine Prüfung durch die Koordination.
const buendelDatei = join(pfad, '..', 'ohne-buendel.txt')
writeFileSync(buendelDatei, ungebuendelt.join('\n') + (ungebuendelt.length ? '\n' : ''), 'utf8')
if (ungebuendelt.length) console.log(`\n${ungebuendelt.length} Maßnahmen ohne Bündel an Ursachen mit Bündeln – zur Information in ${buendelDatei} (keine Rückfrage nötig)`)
console.log(`Weiter: npm run entwurf:treffer -- ${pfad}`)
