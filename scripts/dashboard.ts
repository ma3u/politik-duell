// Baut den Inhalt der Dateien in supabase/dashboard/ (ohne zu schreiben):
//   1-datenbank.sql   – Schema (alle Migrationen) für den SQL Editor; die Daten kommen aus supabase/seed-teile/
//   2-analyse.ts      – Edge Function `analyse` als eine Datei für den Function-Editor
//   3-pruefung.ts     – Edge Function `pruefung` (Bewertung durch Eingeladene)
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Feste Deno-Version: Eine andere Version bündelt womöglich anders, dann meldet der Test
// in scripts/dashboard.test.ts ein veraltetes Dashboard, obwohl sich nichts geändert hat.
export const DENO = 'deno@2.9.6'

const wurzel = new URL('../supabase/', import.meta.url)

export const FUNKTIONEN = [
  ['2-analyse.ts', 'analyse'],
  ['3-pruefung.ts', 'pruefung'],
] as const

export function datenbankSql(): string {
  const migrationen = readdirSync(new URL('migrations/', wurzel))
    .filter((d) => d.endsWith('.sql'))
    .sort()
    .map((d) => `-- ===== migrations/${d} =====\n` + readFileSync(new URL(`migrations/${d}`, wurzel), 'utf8'))
  return `-- AUTOMATISCH ERZEUGT (npm run dashboard) – nicht von Hand bearbeiten.
-- Im Supabase-Dashboard: SQL Editor → New query → alles einfügen → Run.
-- Nur beim ersten Mal ausführen, danach je Datei aus supabase/seed-teile/ (zuerst 0-gemeinsam.sql).
-- Später: neue Migrationen einzeln aus supabase/migrations/, geänderte Daten aus supabase/seed-teile/.

begin;

${migrationen.join('\n')}
commit;
`
}

export function funktionBuendeln(name: string): string {
  const ordner = mkdtempSync(join(tmpdir(), 'dashboard-'))
  try {
    const bundle = join(ordner, `${name}.ts`)
    // --no-lock: keine deno.lock in supabase/functions/
    execFileSync('npx', ['-y', DENO, 'bundle', '--quiet', '--no-lock', '--external', 'npm:*', '-o', bundle, `${name}/index.ts`], {
      cwd: fileURLToPath(new URL('functions/', wurzel)),
      stdio: ['ignore', 'ignore', 'inherit'],
    })
    return `// @ts-nocheck
// AUTOMATISCH ERZEUGT aus supabase/functions/${name} (npm run dashboard) – nicht von Hand bearbeiten.
// Im Supabase-Dashboard: Edge Functions → Deploy a new function → Via Editor,
// Name „${name}“, diesen Inhalt komplett einfügen → Deploy.
` + readFileSync(bundle, 'utf8')
  } finally {
    rmSync(ordner, { recursive: true, force: true })
  }
}

// Dateiname in supabase/dashboard/ → Inhalt
export function dashboardDateien(): Record<string, string> {
  const dateien: Record<string, string> = { '1-datenbank.sql': datenbankSql() }
  for (const [datei, name] of FUNKTIONEN) dateien[datei] = funktionBuendeln(name)
  return dateien
}
