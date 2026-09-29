// Baut supabase/functions/_shared/pruef-massnahmen.ts: welche Prüfeinheiten
// (Instrumente und Maßnahmen ohne Instrument) zu welchem Thema gehören, auch
// ungeprüfte. Die Edge Function `pruefung` prüft damit, dass Prüfende nur
// Einheiten ihrer Themen bewerten – die ungeprüften stehen nicht in der Datenbank.
import { pruefEinheiten, type Katalog } from '../src/data/katalog.ts'

export function pruefMassnahmenTs(k: Katalog): string {
  const jeThema = k.themen
    .map((t) => [t.id, pruefEinheiten(k, t.id).map((e) => e.id)] as const)
    .filter(([, ids]) => ids.length > 0)
  return `// AUTOMATISCH ERZEUGT aus daten/ (npm run seed) – nicht von Hand bearbeiten.
// IDs der Prüfeinheiten (Instrumente und Maßnahmen ohne Instrument) je Thema für die Edge Function \`pruefung\`.
import type { MassnahmenJeThema } from './pruefung.ts'

export const MASSNAHMEN_JE_THEMA: MassnahmenJeThema = {
${jeThema.map(([id, ids]) => `  ${id}: [${ids.join(', ')}],`).join('\n')}
}
`
}
