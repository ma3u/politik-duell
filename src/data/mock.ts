import { alsDateien, ladeKatalog, spielbareAbdeckung, spielbareLandesprogramme, spielbareMassnahmen } from './katalog.ts'

// ---------------------------------------------------------------------------
// Eingebaute Beispieldaten der App („Mit Beispieldaten spielen“, Tests) –
// geladen aus `daten/beispiel/`.
//
// Parteien, Maßnahmen, Punktzahlen und Links dort sind ERFUNDEN. Sie zeigen nur
// Spielablauf und Punktelogik und bleiben als feste Testgrundlage unverändert.
// Die echten Daten liegen in `daten/` und kommen über Supabase ins Spiel.
// ---------------------------------------------------------------------------

const [parteienDatei] = alsDateien(import.meta.glob('../../daten/beispiel/parteien.json', { eager: true, import: 'default' }))
const themenDateien = alsDateien(import.meta.glob('../../daten/beispiel/themen/*.json', { eager: true, import: 'default' }))

export const KATALOG = ladeKatalog(parteienDatei, themenDateien)

export const PARTEIEN = KATALOG.parteien
export const THEMEN = KATALOG.themen
export const URSACHEN = KATALOG.ursachen
/** Nur Maßnahmen, die im Spiel zählen (bei echten Daten: geprüft). */
export const MASSNAHMEN = spielbareMassnahmen(KATALOG)
/** Welche Themen je Partei erfasst sind (fehlt ein Eintrag: noch nicht erfasst). */
export const ABDECKUNG = spielbareAbdeckung(KATALOG)
export const LAENDER = KATALOG.laender
export const LANDESPROGRAMME = spielbareLandesprogramme(KATALOG)
