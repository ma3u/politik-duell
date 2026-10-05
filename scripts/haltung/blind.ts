// Blindliste für die Einordnung: alle Funde mit Zitat, ohne Parteinamen, in gemischter Reihenfolge.
// Schreibt .cache/haltung/<ID>/blind.json und kennungen.json (Kennung → Partei, nur für das Eintragen).
// Aufruf: npm run haltung:blind -- <Haltungs-ID>
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { haltungBlind } from '../haltung-erfassung.ts'
import { verdaechtigeReste } from '../entwurf.ts'
import { abbruch, katalogUndHaltung, leseFunde } from './gemeinsam.ts'

let ctx
try {
  ctx = katalogUndHaltung(process.argv[2])
} catch (e) {
  abbruch(e)
}
const { katalog, haltung, arbeit } = ctx
const funde = leseFunde(arbeit).filter((f) => f.haltung_id === haltung.id)
const fehlend = katalog.parteien.filter((p) => !funde.some((f) => f.partei_id === p.id))
if (fehlend.length) abbruch(`Funde fehlen für ${fehlend.map((p) => p.kurzname).join(', ')} – „Alle sieben oder keine“`)
const { liste, kennungen } = haltungBlind(katalog, haltung, funde)
writeFileSync(join(arbeit, 'blind.json'), JSON.stringify(liste, null, 2) + '\n', 'utf8')
writeFileSync(join(arbeit, 'kennungen.json'), JSON.stringify(kennungen, null, 2) + '\n', 'utf8')
for (const e of liste.eintraege) {
  const reste = verdaechtigeReste(e.zitat)
  if (reste.length) console.error(`Rest: ${e.kennung}: ${reste.join(', ')}`)
}
console.log(`${join(arbeit, 'blind.json')}: ${liste.eintraege.length} Zitate, ${funde.length - liste.eintraege.length} ohne Aussage, Prüfsumme ${liste.pruefsumme}`)
console.log(`Auftrag an den Agenten haltung-einordnung: „Ordne die Liste .cache/haltung/${haltung.id}/blind.json ein, Antwort nach .cache/haltung/${haltung.id}/protokoll/einordnung-antwort.txt.“`)
