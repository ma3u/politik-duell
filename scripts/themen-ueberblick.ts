// Vorhandene Themen nur mit Name, Beschreibung, Ziel und Ursachen – ohne Maßnahmen, Instrumente
// und Abdeckung. Für Phase A (/thema-anlegen): Überschneidungen prüfen, ohne zu sehen, was in
// den Programmen steht.
// Aufruf: npm run themen:ueberblick [-- --json] [--ohne <ID>]   (--ohne: ein Thema weglassen, etwa bei dessen Neuanlage)
//         npm run themen:ueberblick -- --kurz                   – je Thema eine Zeile: ID, Name, Beschreibung (ohne Ursachen)
//         npm run themen:ueberblick -- --nur <ID>[,<ID> …]       – nur diese Themen, mit Ursachen
//         npm run themen:ueberblick -- --haltungen              – je Haltung eine Zeile: ID und Frage (ohne Positionen)
import { pruefeDatenordner } from './katalog-laden.ts'

const i = process.argv.indexOf('--ohne')
const ohne = i >= 0 ? Number(process.argv[i + 1]) : null
const n = process.argv.indexOf('--nur')
const nur = n >= 0 ? new Set((process.argv[n + 1] ?? '').split(',').map(Number)) : null
const { katalog } = pruefeDatenordner()
const themen = katalog.themen.filter((t) => t.id !== ohne && (!nur || nur.has(t.id))).map((t) => ({
  id: t.id,
  name: t.name,
  beschreibung: t.beschreibung,
  ziel: t.ziel,
  ursachen: katalog.ursachen.filter((u) => u.thema_id === t.id).map((u) => ({ id: u.id, beschreibung: u.beschreibung, ebene: u.ebene ?? 'bund' })),
}))
if (process.argv.includes('--haltungen')) for (const h of katalog.haltungen) console.log(`H${h.id} ${h.frage}`)
else if (process.argv.includes('--kurz')) for (const t of themen) console.log(`T${t.id} ${t.name}: ${t.beschreibung}`)
else if (process.argv.includes('--json')) console.log(JSON.stringify(themen, null, 2))
else
  for (const t of themen) {
    console.log(`\n## ${t.name} (${t.id})\n${t.beschreibung}\nZiel: ${t.ziel ?? '–'}`)
    for (const u of t.ursachen) console.log(`- ${u.id} [${u.ebene}] ${u.beschreibung}`)
  }
