import { pruefEinheiten } from '../data/katalog'
import { KATALOG } from '../pruefung/katalog'

// Kleine Helfer für den Admin-Bereich „Prüfung“ (echter Datenkatalog aus daten/).

export const themaName = (id: number) => KATALOG.themen.find((t) => t.id === id)?.name ?? `Thema ${id}`

/** Was Prüfende je Thema bewerten: Instrumente und Maßnahmen ohne Instrument. */
export const einheiten = (themaId: number) => pruefEinheiten(KATALOG, themaId)

export const massnahmenIds = (themaId: number) => einheiten(themaId).map((e) => e.id)
