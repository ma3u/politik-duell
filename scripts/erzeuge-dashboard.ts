// Erzeugt die Dateien zum Einfügen im Supabase-Dashboard (ohne Kommandozeile) in supabase/dashboard/,
// Inhalt siehe scripts/dashboard.ts.
// Aufruf: npm run dashboard
import { mkdirSync, writeFileSync } from 'node:fs'
import { dashboardDateien } from './dashboard.ts'

const ziel = new URL('../supabase/dashboard/', import.meta.url)
mkdirSync(ziel, { recursive: true })
for (const [datei, inhalt] of Object.entries(dashboardDateien())) writeFileSync(new URL(datei, ziel), inhalt)
console.log('supabase/dashboard/ geschrieben.')
