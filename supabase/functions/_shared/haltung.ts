import type { HaltungEintrag, HaltungPosition, Partei } from './typen.ts'

// Haltungskarte (docs/plan-haltungen.md, Teil B): Regel „Alle sieben oder keine“. Reines TypeScript für
// App, Mock und Tests; die Datenbank nutzt dieselbe Regel in der View `haltungen_vollstaendig`.

/**
 * Haltungen, für die jede Partei eine Position im Bundesprogramm hat. Nur zu ihnen gibt es eine Karte und
 * eine Zuordnung durch die KI – eine unvollständige Karte machte einzelne Parteien sichtbarer als andere.
 */
export function vollstaendigeHaltungen<H extends Pick<HaltungEintrag, 'id'>>(
  haltungen: H[],
  positionen: Pick<HaltungPosition, 'haltung_id' | 'partei_id' | 'land'>[],
  parteien: Pick<Partei, 'id'>[],
): H[] {
  if (!parteien.length) return []
  return haltungen.filter((h) =>
    parteien.every((p) => positionen.some((x) => x.haltung_id === h.id && x.partei_id === p.id && (x.land ?? null) === null)),
  )
}
