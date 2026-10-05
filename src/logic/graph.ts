// Knoten und Kanten für den aufklappbaren Zusammenhangsgraphen unter #/themen, in drei
// Strängen, wie die Datengrundlage aufgebaut ist:
//   Probleme:    Themen → Ursachen → Maßnahmen        (gewertet, mit Punkten)
//   Forderungen: Themen → Lösungswege → Maßnahmen     (Forderungskarte, ohne Punkte)
//   Haltungen:   Haltungen → Positionen, Zielkonflikte, verwandte Themen (Haltungskarte, ohne Punkte)
// Neutralität wie in `stand.ts`: Maßnahmen tragen keine Partei und keine Punkte, Positionen
// zeigen nur, ob sie erfasst sind – nicht, wie die Partei zur Frage steht.
import type { Daten } from '../data/quelle'
import type { Ebene, Evidenz } from '../data/types'

export type Strang = 'problem' | 'forderung' | 'haltung'

export type KnotenArt = 'thema' | 'ursache' | 'massnahme' | 'instrument' | 'haltung' | 'position' | 'zielkonflikt'

export interface Knoten {
  /** Eindeutig über alle Arten, z. B. `t1`, `u101`, `m5`, `p2_3` (Position: Haltung_Partei). */
  schluessel: string
  art: KnotenArt
  id: number
  text: string
  /**
   * Zahl im bzw. zum Knoten: Thema – Ursachen (Probleme) bzw. Lösungswege (Forderungen);
   * Ursache und Lösungsweg – Maßnahmen, die an ihr ansetzen bzw. ihn enthalten; Maßnahme – Ursachen,
   * an denen sie ansetzt; Haltung – Parteien mit erfasster Position.
   */
  anzahl: number
  /** Thema: Maßnahmen im jeweiligen Strang; Lösungsweg: Parteien, in deren Programmen er steht. */
  massnahmen: number
  ebene?: Ebene
  /** Maßnahme aus einem Landesprogramm (Kürzel) oder null für Bundesprogramme. */
  land?: string | null
  ki_entwurf?: boolean
  evidenz?: Evidenz | null
  /** Position: erfasst (auch `keine_aussage`) oder noch offen. Haltung: alle Parteien erfasst. */
  erfasst?: boolean
  /** Zielkonflikt: Seite der Frage. */
  seite?: 'ja' | 'nein'
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

/** Schlüssel der Knoten, die „Alle aufklappen“ öffnet: die oberste Ebene des Strangs. */
export function obersteKnoten(daten: Daten, strang: Strang): string[] {
  if (strang === 'haltung') return daten.haltungen.map((h) => schluessel('haltung', h.id))
  return daten.themen.map((t) => schluessel('thema', t.id))
}

/**
 * Baut den sichtbaren Teil des Graphen eines Strangs. `offen` enthält die Schlüssel der
 * aufgeklappten Knoten. Hängt ein Knoten an mehreren sichtbaren Eltern (Maßnahme an mehreren
 * Ursachen, Thema an mehreren Haltungen), gibt es ihn einmal – mit einer Kante zu jedem.
 */
export function baueGraph(daten: Daten, strang: Strang, offen: ReadonlySet<string>): Graph {
  if (strang === 'forderung') return forderungen(daten, offen)
  if (strang === 'haltung') return haltungen(daten, offen)
  return probleme(daten, offen)
}

function massnahmeKnoten(m: Daten['massnahmen'][number]): Knoten {
  return {
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
  }
}

function probleme(daten: Daten, offen: ReadonlySet<string>): Graph {
  const knoten: Knoten[] = []
  const kanten: Kante[] = []
  const sichtbareUrsachen = new Set<number>()

  for (const t of daten.themen) {
    const ursachen = daten.ursachen.filter((u) => u.thema_id === t.id)
    const st = schluessel('thema', t.id)
    const auf = offen.has(st) && ursachen.length > 0
    knoten.push({
      schluessel: st,
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
      const su = schluessel('ursache', u.id)
      const uAuf = offen.has(su) && anzahl > 0
      if (uAuf) sichtbareUrsachen.add(u.id)
      knoten.push({
        schluessel: su,
        art: 'ursache',
        id: u.id,
        text: u.beschreibung,
        anzahl,
        massnahmen: anzahl,
        ebene: u.ebene ?? 'bund',
        aufgeklappt: uAuf,
        klappbar: anzahl > 0,
      })
      kanten.push({ von: st, zu: su })
    }
  }

  for (const m of daten.massnahmen) {
    const an = m.ursachen_ids.filter((id) => sichtbareUrsachen.has(id))
    if (!an.length) continue
    knoten.push(massnahmeKnoten(m))
    for (const id of an) kanten.push({ von: schluessel('ursache', id), zu: schluessel('massnahme', m.id) })
  }
  return { knoten, kanten }
}

function forderungen(daten: Daten, offen: ReadonlySet<string>): Graph {
  const knoten: Knoten[] = []
  const kanten: Kante[] = []
  const instrumentIds = new Set(daten.instrumente.map((i) => i.id))
  const mitWeg = daten.massnahmen.filter((m) => m.instrument_id != null && instrumentIds.has(m.instrument_id))

  for (const t of daten.themen) {
    const instrumente = daten.instrumente.filter((i) => i.thema_id === t.id)
    const st = schluessel('thema', t.id)
    const auf = offen.has(st) && instrumente.length > 0
    knoten.push({
      schluessel: st,
      art: 'thema',
      id: t.id,
      text: t.name,
      anzahl: instrumente.length,
      massnahmen: mitWeg.filter((m) => m.thema_id === t.id).length,
      aufgeklappt: auf,
      klappbar: instrumente.length > 0,
    })
    if (!auf) continue
    for (const i of instrumente) {
      const dazu = mitWeg.filter((m) => m.instrument_id === i.id)
      const si = schluessel('instrument', i.id)
      const iAuf = offen.has(si) && dazu.length > 0
      knoten.push({
        schluessel: si,
        art: 'instrument',
        id: i.id,
        text: i.name,
        anzahl: dazu.length,
        massnahmen: new Set(dazu.map((m) => m.partei_id)).size,
        ebene: i.ebene,
        evidenz: i.evidenz ?? null,
        ki_entwurf: !!i.ki_entwurf,
        aufgeklappt: iAuf,
        klappbar: dazu.length > 0,
      })
      kanten.push({ von: st, zu: si })
      if (!iAuf) continue
      for (const m of dazu) {
        knoten.push(massnahmeKnoten(m))
        kanten.push({ von: si, zu: schluessel('massnahme', m.id) })
      }
    }
  }
  return { knoten, kanten }
}

function haltungen(daten: Daten, offen: ReadonlySet<string>): Graph {
  const knoten: Knoten[] = []
  const kanten: Kante[] = []
  const themen = new Map(daten.themen.map((t) => [t.id, t]))
  const verwandt = new Map<number, string[]>()

  for (const h of daten.haltungen) {
    const sh = schluessel('haltung', h.id)
    const positionen = daten.parteien.map((p) =>
      daten.haltungPositionen.find((x) => x.haltung_id === h.id && x.partei_id === p.id && (x.land ?? null) === null),
    )
    const erfasst = positionen.filter(Boolean).length
    const auf = offen.has(sh)
    knoten.push({
      schluessel: sh,
      art: 'haltung',
      id: h.id,
      text: h.frage,
      anzahl: erfasst,
      massnahmen: 0,
      erfasst: daten.parteien.length > 0 && erfasst === daten.parteien.length,
      aufgeklappt: auf,
      klappbar: true,
    })
    if (!auf) continue
    daten.parteien.forEach((p, i) => {
      const pos = positionen[i]
      const sp = `p${h.id}_${p.id}`
      knoten.push({
        schluessel: sp,
        art: 'position',
        id: p.id,
        text: p.kurzname,
        anzahl: 0,
        massnahmen: 0,
        erfasst: !!pos,
        ki_entwurf: !!pos?.ki_entwurf,
        aufgeklappt: false,
        klappbar: false,
      })
      kanten.push({ von: sh, zu: sp })
    })
    daten.zielkonflikte
      .filter((z) => z.haltung_id === h.id)
      .forEach((z, i) => {
        const sz = `z${h.id}_${i}`
        knoten.push({
          schluessel: sz,
          art: 'zielkonflikt',
          id: i,
          text: z.text,
          anzahl: 0,
          massnahmen: 0,
          seite: z.seite,
          aufgeklappt: false,
          klappbar: false,
        })
        kanten.push({ von: sh, zu: sz })
      })
    for (const id of h.verwandte_themen) if (themen.has(id)) verwandt.set(id, [...(verwandt.get(id) ?? []), sh])
  }

  for (const [id, eltern] of verwandt) {
    const t = themen.get(id)!
    const st = schluessel('thema', id)
    knoten.push({
      schluessel: st,
      art: 'thema',
      id,
      text: t.name,
      anzahl: daten.ursachen.filter((u) => u.thema_id === id).length,
      massnahmen: 0,
      aufgeklappt: false,
      klappbar: false,
    })
    for (const sh of eltern) kanten.push({ von: sh, zu: st })
  }
  return { knoten, kanten }
}
