// Datenstand für die Übersicht „Was das Spiel schon kennt“ (#/themen) und den
// Themenhinweis in der Runde. Neutral: Je Partei gibt es nur den Erfassungsstand
// eines Themas, keine Zählungen von Maßnahmen – sonst läse sich die Übersicht
// wie eine Rangliste, obwohl sie nur zeigt, wie weit die Auswertung ist.
import type { Daten } from '../data/quelle'
import type { Ebene, Evidenz } from '../data/types'
import { vollstaendigeHaltungen } from '../../supabase/functions/_shared/haltung.ts'
import { findeAbdeckung } from './bewertung'

/** Wie weit das Bundesprogramm einer Partei zu einem Thema ausgewertet ist (wie in der Auflösung). */
export type Erfassung = 'massnahmen' | 'keine' | 'offen'

export interface ErfassungJePartei {
  partei_id: number
  stand: Erfassung
  /** Nur in der geschlossenen Testphase: Die Erfassung liegt erst als KI-Entwurf vor. */
  ki_entwurf: boolean
}

/** Eine Ursache mit der Zahl der Maßnahmen aller Parteien zusammen, die an ihr ansetzen. */
export interface UrsacheStand {
  id: number
  beschreibung: string
  ebene: Ebene
  /** Ohne KI-Entwürfe. Eine Maßnahme kann an mehreren Ursachen ansetzen und zählt dann bei jeder. */
  massnahmen: number
  /** Nur in der Testphase größer 0. */
  massnahmenEntwurf: number
}

export interface ThemaStand {
  id: number
  name: string
  ursachen: number
  /** Ursachen des Themas in Datenbank-Reihenfolge. */
  ursachenStand: UrsacheStand[]
  /** Ursachen, an denen noch keine erfasste Maßnahme ansetzt. */
  ursachenOhneMassnahme: number
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
  /** Forderungen: Lösungswege (Instrumente) und wie viele Maßnahmen einem davon zugeordnet sind. */
  instrumente: number
  instrumenteEntwurf: number
  /** Maßnahmen (wie `massnahmen`, ohne KI-Entwürfe) mit Lösungsweg – nur sie erscheinen auf einer Forderungskarte. */
  massnahmenMitInstrument: number
  massnahmenMitInstrumentEntwurf: number
  /** Haltungen: alle Wertfragen und die mit Position aller Parteien (nur sie haben eine Karte im Spiel). */
  haltungen: number
  haltungenVollstaendig: number
  /** Positionen aus Bundesprogrammen und wie viele es bei allen Haltungen zusammen gäbe (Haltungen × Parteien). */
  positionen: number
  positionenEntwurf: number
  positionenMoeglich: number
  zielkonflikte: number
}

/** Lösungswege eines Themas für die Übersicht – ohne Parteinamen, nur wie viele Programme einen Weg enthalten. */
export interface InstrumentStand {
  id: number
  name: string
  ebene: Ebene
  evidenz: Evidenz | null
  ki_entwurf: boolean
  /** Maßnahmen mit diesem Lösungsweg (alle Parteien und Programme zusammen). */
  massnahmen: number
  /** Anzahl Parteien, in deren Programmen (Bund oder Land) der Weg steht. */
  parteien: number
}

export interface ThemaInstrumente {
  id: number
  name: string
  instrumente: InstrumentStand[]
  /** Lösungswege, die in den Programmen mehrerer Parteien stehen. */
  mehrere: number
}

/**
 * Stand einer Haltung. Bewusst ohne Verteilung der Positionen (wie viele `ja`, wie viele `nein`):
 * Die Übersicht zeigt, wie weit die Erfassung ist, nicht wo die Parteien stehen.
 */
export interface HaltungStand {
  id: number
  frage: string
  /** Parteien mit erfasster Position im Bundesprogramm (geprüft bzw. nur als KI-Entwurf). */
  positionen: number
  positionenEntwurf: number
  /** Parteien insgesamt – erst wenn alle erfasst sind, gibt es die Karte im Spiel. */
  parteien: number
  vollstaendig: boolean
  zielkonflikte: { ja: number; nein: number }
  verwandteThemen: number
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
    const ursachenStand = daten.ursachen
      .filter((u) => u.thema_id === t.id)
      .map((u): UrsacheStand => {
        const dazu = massnahmen.filter((m) => m.ursachen_ids.includes(u.id))
        return {
          id: u.id,
          beschreibung: u.beschreibung,
          ebene: u.ebene ?? 'bund',
          massnahmen: dazu.filter((m) => !m.ki_entwurf).length,
          massnahmenEntwurf: dazu.filter((m) => m.ki_entwurf).length,
        }
      })
    return {
      id: t.id,
      name: t.name,
      ursachen: ursachenStand.length,
      ursachenStand,
      ursachenOhneMassnahme: ursachenStand.filter((u) => u.massnahmen + u.massnahmenEntwurf === 0).length,
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
  const instrumentIds = new Set(daten.instrumente.map((i) => i.id))
  const mitInstrument = daten.massnahmen.filter((m) => m.instrument_id != null && instrumentIds.has(m.instrument_id))
  const haltungIds = new Set(daten.haltungen.map((h) => h.id))
  const positionen = bundesPositionen(daten)
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
    instrumente: daten.instrumente.filter((i) => !i.ki_entwurf).length,
    instrumenteEntwurf: daten.instrumente.filter((i) => i.ki_entwurf).length,
    massnahmenMitInstrument: mitInstrument.filter((m) => !m.ki_entwurf).length,
    massnahmenMitInstrumentEntwurf: mitInstrument.filter((m) => m.ki_entwurf).length,
    haltungen: daten.haltungen.length,
    haltungenVollstaendig: vollstaendigeHaltungen(daten.haltungen, positionen, daten.parteien).length,
    positionen: positionen.filter((p) => !p.ki_entwurf).length,
    positionenEntwurf: positionen.filter((p) => p.ki_entwurf).length,
    positionenMoeglich: daten.haltungen.length * daten.parteien.length,
    zielkonflikte: daten.zielkonflikte.filter((z) => haltungIds.has(z.haltung_id)).length,
  }
}

/** Bundesprogramm-Positionen zu bekannten Haltungen und Parteien, je Paar höchstens eine. */
function bundesPositionen(daten: Daten) {
  const haltungIds = new Set(daten.haltungen.map((h) => h.id))
  const parteiIds = new Set(daten.parteien.map((p) => p.id))
  const je = new Map<string, Daten['haltungPositionen'][number]>()
  for (const p of daten.haltungPositionen) {
    if ((p.land ?? null) !== null || !haltungIds.has(p.haltung_id) || !parteiIds.has(p.partei_id)) continue
    const s = `${p.haltung_id}/${p.partei_id}`
    // Gibt es (Testphase) Prüfung und Entwurf, zählt die geprüfte Fassung.
    if (!je.has(s) || je.get(s)?.ki_entwurf) je.set(s, p)
  }
  return [...je.values()]
}

/** Lösungswege je Thema, in Datenbank-Reihenfolge. */
export function instrumentStand(daten: Daten): ThemaInstrumente[] {
  return daten.themen.map((t) => {
    const instrumente = daten.instrumente
      .filter((i) => i.thema_id === t.id)
      .map((i): InstrumentStand => {
        const dazu = daten.massnahmen.filter((m) => m.instrument_id === i.id)
        return {
          id: i.id,
          name: i.name,
          ebene: i.ebene,
          evidenz: i.evidenz ?? null,
          ki_entwurf: !!i.ki_entwurf,
          massnahmen: dazu.length,
          parteien: new Set(dazu.map((m) => m.partei_id)).size,
        }
      })
    return { id: t.id, name: t.name, instrumente, mehrere: instrumente.filter((i) => i.parteien > 1).length }
  })
}

/** Erfassungsstand je Haltung, in Datenbank-Reihenfolge. */
export function haltungStand(daten: Daten): HaltungStand[] {
  const positionen = bundesPositionen(daten)
  const vollstaendig = new Set(vollstaendigeHaltungen(daten.haltungen, positionen, daten.parteien).map((h) => h.id))
  return daten.haltungen.map((h) => {
    const eigene = positionen.filter((p) => p.haltung_id === h.id)
    const zk = daten.zielkonflikte.filter((z) => z.haltung_id === h.id)
    return {
      id: h.id,
      frage: h.frage,
      positionen: eigene.filter((p) => !p.ki_entwurf).length,
      positionenEntwurf: eigene.filter((p) => p.ki_entwurf).length,
      parteien: daten.parteien.length,
      vollstaendig: vollstaendig.has(h.id),
      zielkonflikte: { ja: zk.filter((z) => z.seite === 'ja').length, nein: zk.filter((z) => z.seite === 'nein').length },
      verwandteThemen: h.verwandte_themen.length,
    }
  })
}

/** Ist ein Thema für beide Parteien eines Duells ausgewertet (Bundesprogramme)? */
export const fuerBeideErfasst = (daten: Daten, themaId: number, parteiIds: [number, number]) =>
  parteiIds.every((id) => findeAbdeckung(daten.abdeckung, id, themaId) !== null)
