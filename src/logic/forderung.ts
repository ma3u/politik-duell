import type { Daten } from '../data/quelle'
import type { Ebene, Evidenz, InstrumentEintrag, Massnahme, Partei } from '../data/types'
import { findeAbdeckung } from './bewertung'

// Forderungskarte (docs/plan-haltungen.md, A3): Für einen Lösungsweg (Instrument) zeigt sie, welche der
// Parteien ihn im Programm haben – ohne Punkte, ohne Sieger. Alles stammt aus der Datenbank.

/** Wie die Forschung die Wirkung eines Lösungswegs einordnet (Anzeigetext je Stand der Evidenz). */
export const EVIDENZ_TEXT: Record<Evidenz, string> = {
  belegt: 'Wirkung in der Forschung belegt',
  gemischt: 'Wirkung in der Forschung umstritten',
  offen: 'Wirkung bisher kaum untersucht',
}

/**
 * Was zu einer Partei und einem Lösungsweg in ihrem Programm steht:
 * `steht` – eine Maßnahme verweist auf das Instrument · `nicht_gefunden` – das Programm ist zum Thema
 * ausgewertet und enthält ihn nicht (gesucht wurde nach Maßnahmen zu den Ursachen, nicht nach jeder
 * Erwähnung) · `offen` – noch nicht erfasst · `kein_programm` – kein aktuelles Landeswahlprogramm.
 */
export type Fund = 'steht' | 'nicht_gefunden' | 'offen' | 'kein_programm'

export interface ParteiFund {
  partei: Partei
  fund: Fund
  /** Bei `steht`: die Maßnahmen der Partei mit diesem Lösungsweg (Beschreibung und Belege). */
  massnahmen: Massnahme[]
}

/** Die Parteien eines Programmtyps: Bundesprogramme oder die Landesprogramme eines Landes. */
export interface Fundblock {
  ebene: Ebene
  /** Kürzel des Landes bei Landesprogrammen, sonst null. */
  land: string | null
  /** Das Instrument dieser Ebene (bei Bund und Land je eins, verbunden über `entspricht`). */
  instrument: InstrumentEintrag
  /** In fester Reihenfolge wie im übrigen Spiel (nach ID), ohne Hervorhebung. */
  parteien: ParteiFund[]
}

export interface Forderungskarte {
  /** Der erkannte Lösungsweg – Name, Forschungsstand und Begründung kommen von hier. */
  instrument: InstrumentEintrag
  bloecke: Fundblock[]
  /** true, wenn Instrument oder gezeigte Maßnahmen nur als KI-Entwurf vorliegen (Testphase). */
  ki_entwurf: boolean
  /** true, wenn ein gezeigter Entwurf nicht aus der Bewertung ohne Parteinamen stammt. */
  nicht_blind: boolean
}

/**
 * Baut die Karte. Bundesprogramme immer; ist ein Bundesland gewählt und gibt es das Gegenstück auf
 * Landesebene (`entspricht`), kommt dessen Landesprogramm-Block dazu. Null, wenn die ID unbekannt ist
 * oder weder Bund noch gewähltes Land einen Block ergeben.
 */
export function forderungskarte(daten: Daten, instrumentId: number, land: string | null): Forderungskarte | null {
  const instrument = daten.instrumente.find((i) => i.id === instrumentId)
  if (!instrument) return null
  const gegenstueck = instrument.entspricht ? daten.instrumente.find((i) => i.id === instrument.entspricht) : undefined
  const nachEbene = (e: Ebene) => [instrument, gegenstueck].find((i) => i?.ebene === e)

  const bloecke: Fundblock[] = []
  const bund = nachEbene('bund')
  if (bund) bloecke.push(block(daten, bund, null))
  const lands = nachEbene('land')
  if (lands && land) bloecke.push(block(daten, lands, land))
  if (!bloecke.length) return null

  const gezeigt = bloecke.flatMap((b) => b.parteien.flatMap((p) => p.massnahmen))
  return {
    instrument,
    bloecke,
    ki_entwurf: !!instrument.ki_entwurf || gezeigt.some((m) => m.ki_entwurf),
    nicht_blind:
      (!!instrument.ki_entwurf && instrument.entwurf_herkunft !== 'blind') ||
      gezeigt.some((m) => m.ki_entwurf && m.entwurf_herkunft !== 'blind'),
  }
}

function block(daten: Daten, instrument: InstrumentEintrag, land: string | null): Fundblock {
  // Ursachen, an denen der Lösungsweg ansetzt: Ein Programm, das dafür noch nicht durchsucht ist, gilt als „offen“.
  const ursachenIds = [
    ...new Set(daten.massnahmen.filter((m) => m.instrument_id === instrument.id).flatMap((m) => m.ursachen_ids)),
  ].filter((id) => land === null || (daten.ursachen.find((u) => u.id === id)?.ebene ?? 'bund') === 'land')

  const parteien = [...daten.parteien]
    .sort((a, b) => a.id - b.id)
    .map((partei): ParteiFund => {
      const massnahmen = daten.massnahmen.filter(
        (m) => m.partei_id === partei.id && m.instrument_id === instrument.id && (m.land ?? null) === land,
      )
      if (massnahmen.length) return { partei, fund: 'steht', massnahmen }
      if (land !== null) {
        const lp = daten.landesprogramme.find((p) => p.partei_id === partei.id && p.land === land)
        if (lp && !lp.url) return { partei, fund: 'kein_programm', massnahmen: [] }
      }
      const a = findeAbdeckung(daten.abdeckung, partei.id, instrument.thema_id, land)
      const durchsucht = !a?.durchsucht_fuer || ursachenIds.every((id) => a.durchsucht_fuer!.includes(id))
      return { partei, fund: a && durchsucht ? 'nicht_gefunden' : 'offen', massnahmen: [] }
    })
  return { ebene: land === null ? 'bund' : 'land', land, instrument, parteien }
}
