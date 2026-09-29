// Erzeugt supabase/seed.sql aus dem Datenkatalog in daten/.
// Aufruf: npm run seed
import { writeFileSync } from 'node:fs'
import { pruefeDatenordner } from './katalog-laden.ts'
import { seedSql } from './seed-sql.ts'

const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error(`Datenkatalog fehlerhaft – seed.sql nicht geschrieben:\n  ${fehler.join('\n  ')}`)
  process.exit(1)
}
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), seedSql(katalog))
console.log('supabase/seed.sql geschrieben.')
