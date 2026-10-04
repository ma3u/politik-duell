import { kartenHaltungen, type Daten } from '../data/quelle'
import type { HaltungEintrag, HaltungPosition, Partei, Positionswert, Thema, Zielkonflikt } from '../data/types'

// Haltungskarte (docs/plan-haltungen.md, B4): Wo stehen die Parteien zu einer Wertfrage? Verortung statt
// Wertung – ohne Punkte, ohne Sieger, ohne Hervorhebung einer Partei. Alles stammt aus der Datenbank.

/** Anzeige der Positionswerte – bewusst schlicht, ohne Ampelfarben (docs/plan-haltungen.md, Grundsatz 4). */
export const POSITION_TEXT: Record<Positionswert, string> = {
  ja: 'Ja',
  nein: 'Nein',
  teils: 'Teils',
  keine_aussage: 'Keine Aussage im Programm',
}

export interface ParteiPosition {
  partei: Partei
  position: HaltungPosition
}

export interface Haltungskarte {
  haltung: HaltungEintrag
  /** Alle Parteien in fester Reihenfolge wie im übrigen Spiel (nach ID), je mit Position im Bundesprogramm. */
  positionen: ParteiPosition[]
  /** Erst die Ziele der Ja-Seite, dann die der Nein-Seite. */
  zielkonflikte: Zielkonflikt[]
  /** Verwandte Themen zum Antippen (nur die, die es gibt). */
  themen: Thema[]
  /** true, wenn eine Position nur als KI-Entwurf vorliegt (Testphase). */
  ki_entwurf: boolean
}

/**
 * Baut die Karte – nur, wenn jede Partei eine Position hat („Alle sieben oder keine“). Sonst null: Eine
 * unvollständige Karte machte einzelne Parteien sichtbarer als andere.
 */
export function haltungskarte(daten: Daten, haltungId: number): Haltungskarte | null {
  const haltung = kartenHaltungen(daten).find((h) => h.id === haltungId)
  if (!haltung) return null
  const positionen = [...daten.parteien]
    .sort((a, b) => a.id - b.id)
    .map((partei) => ({
      partei,
      position: daten.haltungPositionen.find((p) => p.haltung_id === haltungId && p.partei_id === partei.id && (p.land ?? null) === null)!,
    }))
  const seite = (z: Zielkonflikt) => (z.seite === 'ja' ? 0 : 1)
  return {
    haltung,
    positionen,
    zielkonflikte: daten.zielkonflikte.filter((z) => z.haltung_id === haltungId).sort((a, b) => seite(a) - seite(b)),
    themen: haltung.verwandte_themen.map((id) => daten.themen.find((t) => t.id === id)).filter((t): t is Thema => !!t),
    ki_entwurf: positionen.some((p) => p.position.ki_entwurf),
  }
}
