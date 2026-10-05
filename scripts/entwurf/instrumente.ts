// Listet die Instrumente (Lösungswege) eines Themas: ID, Ebene, Name, Ursachen der Maßnahmen und Zahl der
// Programme – ohne Parteinamen. Für /forderung-erfassen: Gibt es den Lösungsweg schon?
// Aufruf: npm run instrumente -- <Themen-ID>
import { pruefeDatenordner } from '../katalog-laden.ts'

const themaId = Number(process.argv[2])
if (!Number.isInteger(themaId)) {
  console.error('Aufruf: npm run instrumente -- <Themen-ID>')
  process.exit(1)
}
const { katalog } = pruefeDatenordner()
const thema = katalog.themen.find((t) => t.id === themaId)
if (!thema) {
  console.error(`Thema ${themaId} gibt es nicht`)
  process.exit(1)
}
console.log(`Thema ${thema.id} „${thema.name}“`)
for (const u of katalog.ursachen.filter((x) => x.thema_id === themaId)) console.log(`  Ursache ${u.id} (${u.ebene ?? 'bund'}): ${u.beschreibung}`)
console.log('')
for (const i of katalog.instrumente.filter((x) => x.thema_id === themaId)) {
  const ms = katalog.massnahmen.filter((m) => m.instrument_id === i.id)
  const programme = new Set(ms.map((m) => `${m.partei_id}/${m.land ?? ''}`)).size
  const ursachen = [...new Set(ms.flatMap((m) => m.ursachen_ids))].sort()
  console.log(`I${i.id} [${ms.some((m) => m.land) ? 'land' : 'bund'}] ${i.name} – Ursachen ${ursachen.join(', ') || '–'}, ${programme} Programme`)
}
