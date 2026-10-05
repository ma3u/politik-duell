// Gemeinsame Punktelogik: dieselbe Datei nutzt die Edge Function `analyse`.
export * from '../../supabase/functions/_shared/bewertung.ts'

/** Punkte zum Anzeigen: deutsches Komma, höchstens eine Nachkommastelle (8,5). */
export const punkteText = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 })
