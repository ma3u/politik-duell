// Selbstprüfung des Agenten haltung-einordnung: liest nur blind.json und die eigene Antwort.
// Aufruf: npm run haltung:antwort-pruefen -- <Haltungs-ID>
import { existsSync, readFileSync } from 'node:fs'
import { pruefeHaltungAntwort, HALTUNG_ORDNER, type HaltungAntwort, type HaltungBlindliste } from '../haltung-erfassung.ts'
import { erstesJsonObjekt } from '../entwurf/json-text.ts'

const id = Number(process.argv[2])
const ordner = new URL(`../../${HALTUNG_ORDNER(id)}/`, import.meta.url)
const antwortPfad = new URL('protokoll/einordnung-antwort.txt', ordner)
if (!Number.isInteger(id) || !existsSync(antwortPfad)) {
  console.error(`Aufruf: npm run -s haltung:antwort-pruefen -- <ID> (erwartet ${HALTUNG_ORDNER(id)}/protokoll/einordnung-antwort.txt)`)
  process.exit(1)
}
const liste = JSON.parse(readFileSync(new URL('blind.json', ordner), 'utf8')) as HaltungBlindliste
let antwort: HaltungAntwort
try {
  antwort = erstesJsonObjekt(readFileSync(antwortPfad, 'utf8')).objekt as HaltungAntwort
} catch (e) {
  console.error(`Kein gültiges JSON: ${e instanceof Error ? e.message : e}`)
  process.exit(1)
}
const fehler = pruefeHaltungAntwort(liste, antwort)
for (const f of fehler) console.error(`Fehler:  ${f}`)
if (fehler.length) process.exit(1)
const zahl = (w: string) => antwort.einordnungen.filter((e) => e.position === w).length
console.log(`In Ordnung: ${antwort.einordnungen.length} Einordnungen (ja ${zahl('ja')}, teils ${zahl('teils')}, nein ${zahl('nein')}, keine Aussage ${zahl('keine_aussage')}).`)
