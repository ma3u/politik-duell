// Blindliste je Haltung für die Einordnung: alle Funde mit Zitat, ohne Parteinamen, gemischte Reihenfolge.
// Schreibt .cache/haltung/<ID>/blind.json und kennungen.json (Kennung → Partei, nur für das Eintragen).
// Aufruf: npm run haltung:blind -- <Haltungs-ID> [<Haltungs-ID> …] [--nachtrag <Partei-ID>]
// Mit --nachtrag nur der Fund dieser Partei (die übrigen Positionen stehen schon und bleiben unverändert).
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { haltungBlind, HALTUNG_ORDNER } from '../haltung-erfassung.ts'
import { verdaechtigeReste } from '../entwurf.ts'
import { abbruch, ids, katalogUndHaltungen, leseFunde, nachtrag, oderAbbruch } from './gemeinsam.ts'

const args = process.argv.slice(2)
const nur = oderAbbruch(() => nachtrag(args))
const { katalog, haltungen } = oderAbbruch(() => katalogUndHaltungen(ids(args)))
const listen: string[] = []
for (const { haltung, arbeit } of haltungen) {
  const funde = leseFunde(arbeit).filter((f) => f.haltung_id === haltung.id && (nur === null || f.partei_id === nur))
  const fehlend = katalog.parteien.filter((p) => (nur === null || p.id === nur) && !funde.some((f) => f.partei_id === p.id))
  if (fehlend.length) abbruch(`Haltung ${haltung.id}: Funde fehlen für ${fehlend.map((p) => p.kurzname).join(', ')} – „Alle oder keine“ (bei einer neu aufgenommenen Partei: --nachtrag <Partei-ID>)`)
  const { liste, kennungen } = haltungBlind(katalog, haltung, funde)
  writeFileSync(join(arbeit, 'blind.json'), JSON.stringify(liste, null, 2) + '\n', 'utf8')
  writeFileSync(join(arbeit, 'kennungen.json'), JSON.stringify(kennungen, null, 2) + '\n', 'utf8')
  for (const e of liste.eintraege) {
    const reste = verdaechtigeReste(e.zitat)
    if (reste.length) console.error(`Rest: Haltung ${haltung.id} ${e.kennung}: ${reste.join(', ')}`)
  }
  console.log(`Haltung ${haltung.id}: ${liste.eintraege.length} Zitate, ${funde.length - liste.eintraege.length} ohne Aussage, Prüfsumme ${liste.pruefsumme}`)
  listen.push(`${HALTUNG_ORDNER(haltung.id)}/blind.json`)
}
console.log(
  `\nAuftrag an einen Agenten haltung-einordnung: „Ordne die Listen ${listen.join(', ')} ein. ` +
    `Antwort je Liste in protokoll/einordnung-antwort.txt im selben Ordner, Prüfung mit npm run -s haltung:antwort-pruefen -- <ID>.“`,
)
