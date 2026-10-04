import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { dashboardDateien } from './dashboard'

describe('supabase/dashboard', () => {
  // Bündelt die Edge Functions mit Deno (beim ersten Lauf lädt npx Deno herunter).
  it('ist aktuell (sonst: npm run dashboard)', () => {
    for (const [datei, inhalt] of Object.entries(dashboardDateien())) {
      const eingecheckt = readFileSync(new URL(`../supabase/dashboard/${datei}`, import.meta.url), 'utf8')
      expect(eingecheckt, `supabase/dashboard ist veraltet – npm run dashboard ausführen (${datei})`).toBe(inhalt)
    }
  }, 180_000)
})
