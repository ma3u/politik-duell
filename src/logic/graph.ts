// Knoten und Kanten für den aufklappbaren Zusammenhangsgraphen unter #/themen:
// Themen → Ursachen → Maßnahmen. Neutralität wie in `stand.ts`: Maßnahmen tragen
// keine Partei und keine Punkte – der Graph zeigt, wo schon Lösungsvorschläge
// erfasst sind, nicht wer die besseren hat.
import type { Daten } from '../data/quelle'
import type { Ebene } from '../data/types'

export type KnotenArt = 'thema' | 'ursache' | 'massnahme'

export interface Knoten {
  /** Eindeutig über alle Arten, z. B. `t1`, `u101`, `m5`. */
  schluessel: string
  art: KnotenArt
  id: number
  text: string
  /** Thema: Ursachen; Ursache: Maßnahmen, die an ihr ansetzen; Maßnahme: Ursachen, an denen sie ansetzt. */
  anzahl: number
  /** Thema: Maßnahmen zum Thema insgesamt. */
  massnahmen: number
  ebene?: Ebene
  /** Maßnahme aus einem Landesprogramm (Kürzel) oder null für Bundesprogramme. */
  land?: string | null
  ki_entwurf?: boolean
  aufgeklappt: boolean
  /** Hat der Knoten etwas zum Aufklappen? */
  klappbar: boolean
}

export interface Kante {
  von: string
  zu: string
}

export interface Graph {
  knoten: Knoten[]
  kanten: Kante[]
}

export const schluessel = (art: KnotenArt, id: number) => `${art[0]}${id}`

/**
 * Baut den sichtbaren Teil des Graphen: alle Themen, die Ursachen aufgeklappter
 * Themen und die Maßnahmen aufgeklappter Ursachen. Setzt eine Maßnahme an mehreren
 * sichtbaren Ursachen an, gibt es sie einmal – mit einer Kante zu jeder.
 */
export function baueGraph(daten: Daten, themenAuf: ReadonlySet<number>, ursachenAuf: ReadonlySet<number>): Graph {
  const knoten: Knoten[] = []
  const kanten: Kante[] = []
  const sichtbareUrsachen = new Set<number>()

  for (const t of daten.themen) {
    const ursachen = daten.ursachen.filter((u) => u.thema_id === t.id)
    const auf = themenAuf.has(t.id) && ursachen.length > 0
    knoten.push({
      schluessel: schluessel('thema', t.id),
      art: 'thema',
      id: t.id,
      text: t.name,
      anzahl: ursachen.length,
      massnahmen: daten.massnahmen.filter((m) => m.thema_id === t.id).length,
      aufgeklappt: auf,
      klappbar: ursachen.length > 0,
    })
    if (!auf) continue
    for (const u of ursachen) {
      const anzahl = daten.massnahmen.filter((m) => m.ursachen_ids.includes(u.id)).length
      const uAuf = ursachenAuf.has(u.id) && anzahl > 0
      if (uAuf) sichtbareUrsachen.add(u.id)
      knoten.push({
        schluessel: schluessel('ursache', u.id),
        art: 'ursache',
        id: u.id,
        text: u.beschreibung,
        anzahl,
        massnahmen: anzahl,
        ebene: u.ebene ?? 'bund',
        aufgeklappt: uAuf,
        klappbar: anzahl > 0,
      })
      kanten.push({ von: schluessel('thema', t.id), zu: schluessel('ursache', u.id) })
    }
  }

  for (const m of daten.massnahmen) {
    const an = m.ursachen_ids.filter((id) => sichtbareUrsachen.has(id))
    if (!an.length) continue
    knoten.push({
      schluessel: schluessel('massnahme', m.id),
      art: 'massnahme',
      id: m.id,
      text: m.beschreibung,
      anzahl: m.ursachen_ids.length,
      massnahmen: 1,
      land: m.land ?? null,
      ki_entwurf: !!m.ki_entwurf,
      aufgeklappt: false,
      klappbar: false,
    })
    for (const id of an) kanten.push({ von: schluessel('ursache', id), zu: schluessel('massnahme', m.id) })
  }
  return { knoten, kanten }
}
