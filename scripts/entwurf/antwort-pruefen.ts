// Selbstprüfung des Bewertungs-Agenten (.claude/agents/blind-bewertung.md): prüft seine Antwort nur gegen
// die Blindliste – dieselben Regeln wie entwurf:bewertung-pruefen (pruefeAntwort in scripts/entwurf.ts),
// aber ohne Erfassung, Kennungen oder Katalog. Liest genau .cache/entwurf/<ID>/blind.json und
// .cache/entwurf/<ID>/protokoll/bewertung-antwort.txt und gibt nur Kennungen und Fehler aus, nie eine
// Herkunft. Der Hook (.claude/hooks/sperre.mjs) erlaubt dem Agenten genau diesen Befehl.
// Aufruf: npm run -s entwurf:antwort-pruefen -- <Themen-ID>
import { existsSync, readFileSync } from 'node:fs'
import { pruefeAntwort, type Bewertung, type BlindListe } from '../entwurf.ts'
import { erstesJsonObjekt } from './json-text.ts'

const [id, ...rest] = process.argv.slice(2)
if (!id || !/^\d+$/.test(id) || rest.length) {
  console.error('Aufruf: npm run -s entwurf:antwort-pruefen -- <Themen-ID>')
  process.exit(1)
}
const ordner = new URL(`../../.cache/entwurf/${id}/`, import.meta.url)
const listeDatei = new URL('blind.json', ordner)
const antwortDatei = new URL('protokoll/bewertung-antwort.txt', ordner)
for (const d of [listeDatei, antwortDatei])
  if (!existsSync(d)) {
    console.error(`Fehler:  ${d.pathname} fehlt`)
    process.exit(1)
  }
const liste = JSON.parse(readFileSync(listeDatei, 'utf8')) as BlindListe
let antwort: Bewertung
try {
  antwort = erstesJsonObjekt(readFileSync(antwortDatei, 'utf8')).objekt as Bewertung
} catch (e) {
  console.error(`Fehler:  ${e instanceof Error ? e.message : e}`)
  process.exit(1)
}
const fehler = pruefeAntwort(liste, antwort, { teil: !!liste.teilbewertung })
for (const f of fehler) console.error(`Fehler:  ${f}`)
if (fehler.length) {
  console.error(`\n${fehler.length} Fehler – Antwortdatei korrigieren (vollständig neu schreiben) und erneut prüfen.`)
  process.exit(1)
}
console.log(`Antwort in Ordnung: ${antwort.zuordnung.length} Kennungen, ${antwort.neue_instrumente?.length ?? 0} neue Instrumente.`)
