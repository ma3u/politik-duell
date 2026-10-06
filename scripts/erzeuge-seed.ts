// Erzeugt supabase/seed.sql und die Teile je Thema in supabase/seed-teile/ aus dem Datenkatalog in daten/.
// Aufruf: npm run seed
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { pruefeDatenordner } from './katalog-laden.ts'
import { seedSql, seedTeile } from './seed-sql.ts'

const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error(`Datenkatalog fehlerhaft – seed.sql nicht geschrieben:\n  ${fehler.join('\n  ')}`)
  process.exit(1)
}
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), seedSql(katalog))

const ordner = new URL('../supabase/seed-teile/', import.meta.url)
mkdirSync(ordner, { recursive: true })
const teile = seedTeile(katalog)
for (const datei of readdirSync(ordner)) if (datei.endsWith('.sql') && !(datei in teile)) rmSync(new URL(datei, ordner))
for (const [datei, inhalt] of Object.entries(teile)) writeFileSync(new URL(datei, ordner), inhalt)
console.log('supabase/seed.sql und supabase/seed-teile/ geschrieben.')
