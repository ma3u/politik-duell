// Datenstand für die Übersicht „Was das Spiel schon kennt“ (#/themen) und den
// Themenhinweis in der Runde. Neutral: Je Partei gibt es nur den Erfassungsstand
// eines Themas, keine Zählungen von Maßnahmen – sonst läse sich die Übersicht
// wie eine Rangliste, obwohl sie nur zeigt, wie weit die Auswertung ist.
import type { Daten } from '../data/quelle'
import { findeAbdeckung } from './bewertung'

/** Wie weit das Bundesprogramm einer Partei zu einem Thema ausgewertet ist (wie in der Auflösung). */
export type Erfassung = 'massnahmen' | 'keine' | 'offen'

export interface ErfassungJePartei {
  partei_id: number
  stand: Erfassung
  /** Nur in der geschlossenen Testphase: Die Erfassung liegt erst als KI-Entwurf vor. */
  ki_entwurf: boolean
}

export interface ThemaStand {
  id: number
  name: string
  ursachen: number
  /** Maßnahmen aus Bundes- und Landesprogrammen, ohne KI-Entwürfe. */
  massnahmen: number
  /** Nur in der Testphase größer 0. */
  massnahmenEntwurf: number
  parteien: ErfassungJePartei[]
  /** Anzahl Parteien je Erfassungsstand. */
  zaehlung: Record<Erfassung, number>
}

export interface Statistik {
  parteien: number
  themen: number
  ursachen: number
  massnahmen: number
  massnahmenEntwurf: number
  /** Ausgewertete Paare aus Partei und Thema (Bundesprogramme) und wie viele es insgesamt gibt. */
  erfasst: number
  paare: number
  /** Ausgewertete Landtagswahlprogramme und Länder mit mindestens einem davon. */
  landesprogramme: number
  laender: number
  /** Jüngstes Datum eines Eintrags (ISO) oder null. */
  stand: string | null
}

export function themenStand(daten: Daten): ThemaStand[] {
  return daten.themen.map((t) => {
    const massnahmen = daten.massnahmen.filter((m) => m.thema_id === t.id)
    const parteien = daten.parteien.map((p): ErfassungJePartei => {
      const a = findeAbdeckung(daten.abdeckung, p.id, t.id)
      return { partei_id: p.id, stand: a?.art ?? 'offen', ki_entwurf: !!a?.ki_entwurf }
    })
    const zaehlung: Record<Erfassung, number> = { massnahmen: 0, keine: 0, offen: 0 }
    for (const p of parteien) zaehlung[p.stand]++
    return {
      id: t.id,
      name: t.name,
      ursachen: daten.ursachen.filter((u) => u.thema_id === t.id).length,
      massnahmen: massnahmen.filter((m) => !m.ki_entwurf).length,
      massnahmenEntwurf: massnahmen.filter((m) => m.ki_entwurf).length,
      parteien,
      zaehlung,
    }
  })
}

export function statistik(daten: Daten): Statistik {
  const themenIds = new Set(daten.themen.map((t) => t.id))
  const parteiIds = new Set(daten.parteien.map((p) => p.id))
  const bund = daten.abdeckung.filter((a) => (a.land ?? null) === null && themenIds.has(a.thema_id) && parteiIds.has(a.partei_id))
  const erfassteLaender = new Set(daten.abdeckung.filter((a) => a.land).map((a) => a.land))
  const programme = daten.landesprogramme.filter((lp) => lp.url && erfassteLaender.has(lp.land))
  const staende = [...daten.massnahmen.map((m) => m.stand), ...daten.abdeckung.map((a) => a.stand)].filter(Boolean)
  return {
    parteien: daten.parteien.length,
    themen: daten.themen.length,
    ursachen: daten.ursachen.length,
    massnahmen: daten.massnahmen.filter((m) => !m.ki_entwurf).length,
    massnahmenEntwurf: daten.massnahmen.filter((m) => m.ki_entwurf).length,
    erfasst: new Set(bund.map((a) => `${a.partei_id}/${a.thema_id}`)).size,
    paare: daten.parteien.length * daten.themen.length,
    landesprogramme: programme.length,
    laender: new Set(programme.map((lp) => lp.land)).size,
    stand: staende.length ? staende.reduce((a, b) => (a > b ? a : b)) : null,
  }
}

/** Ist ein Thema für beide Parteien eines Duells ausgewertet (Bundesprogramme)? */
export const fuerBeideErfasst = (daten: Daten, themaId: number, parteiIds: [number, number]) =>
  parteiIds.every((id) => findeAbdeckung(daten.abdeckung, id, themaId) !== null)
