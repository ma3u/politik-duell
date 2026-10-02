// Vorhandene Themen nur mit Name, Beschreibung, Ziel und Ursachen – ohne Maßnahmen, Instrumente
// und Abdeckung. Für Phase A (/thema-anlegen): Überschneidungen prüfen, ohne zu sehen, was in
// den Programmen steht.
// Aufruf: npm run themen:ueberblick [-- --json]
import { pruefeDatenordner } from './katalog-laden.ts'

const { katalog } = pruefeDatenordner()
const themen = katalog.themen.map((t) => ({
  id: t.id,
  name: t.name,
  beschreibung: t.beschreibung,
  ziel: t.ziel,
  ursachen: katalog.ursachen.filter((u) => u.thema_id === t.id).map((u) => ({ id: u.id, beschreibung: u.beschreibung, ebene: u.ebene ?? 'bund' })),
}))
if (process.argv.includes('--json')) console.log(JSON.stringify(themen, null, 2))
else
  for (const t of themen) {
    console.log(`\n## ${t.name} (${t.id})\n${t.beschreibung}\nZiel: ${t.ziel ?? '–'}`)
    for (const u of t.ursachen) console.log(`- ${u.id} [${u.ebene}] ${u.beschreibung}`)
  }
