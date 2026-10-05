import type { AbdeckungEintrag, Ebene, Landesprogramm, Massnahme, Partei, Rolle, Ursache } from './typen.ts'

// Deterministische Punktevergabe aus der kuratierten Datenbank.
// Die KI ist hier nicht beteiligt.

/**
 * Höchstpunktzahl je Ursache: so viel wie eine Maßnahme mit Wirksamkeit 3 × Umsetzbarkeit 3.
 * Mehrere Lösungswege können sie gemeinsam erreichen, aber nicht überschreiten (docs/methode.md).
 */
export const MAX_JE_URSACHE = 9

/** Gewicht eines Lösungswegs nach Rang innerhalb einer Ursache (0 = bester): 1, ½, ¼, … */
export const gewichtNachRang = (rang: number) => 1 / 2 ** rang

/** Auf eine Nachkommastelle, ohne Rundungsreste der Gleitkommazahlen. */
const zehntel = (x: number) => Math.round(x * 10)

export interface Treffer {
  massnahme: Massnahme
  /** Ursachen, für die diese Maßnahme gezählt wurde. */
  ursachen_ids: number[]
  /** Punkte der Maßnahme selbst: Wirksamkeit (± Rolle, 0–3) × Umsetzbarkeit, also 0 bis 9 (vor dem Gewicht). */
  punkteJeUrsache: number
  rollenBonus: number
  /** Wirksamkeit nach Rollen-Modifikator (0–3). */
  wirksamkeit: number
  rollenBegruendung?: string
}

/** Ein Programm, aus dem in dieser Runde gewertet wurde. */
export interface GenutztesProgramm {
  /** null = Bundesprogramm, sonst Kürzel des Landes. */
  land: string | null
  url: string
  stand: string
  abdeckung: AbdeckungEintrag
}

/** Ein gezählter Lösungsweg zu einer Ursache. */
export interface Beitrag {
  massnahme_id: number
  /** Punkte der Maßnahme (0–9). */
  punkte: number
  /** 1 für den besten Lösungsweg, ½ für den zweiten, ¼ für den dritten … */
  gewicht: number
}

/** Wertung einer Partei für eine Ursache. */
export interface UrsachenWertung {
  ursache_id: number
  /** Summe der gewichteten Beiträge, höchstens MAX_JE_URSACHE, auf eine Nachkommastelle. */
  punkte: number
  /** Gezählte Lösungswege, bester zuerst (je Instrument nur die beste Maßnahme). */
  beitraege: Beitrag[]
  /** true, wenn die Summe über MAX_JE_URSACHE lag und gekappt wurde. */
  gedeckelt: boolean
}

export interface ParteiErgebnis {
  partei: Partei
  /** Summe über die Ursachen (auf eine Nachkommastelle). */
  punkte: number
  treffer: Treffer[]
  /** Wertung je zugeordneter Ursache mit Maßnahme (Ursachen ohne Maßnahme fehlen). */
  ursachen: UrsachenWertung[]
  /**
   * Erfassung des Themas für diese Partei; null = keine Wertung möglich (siehe `fehlt`).
   * Werden Bundes- und Landesprogramm genutzt: `keine` nur, wenn beide nichts zum Thema enthalten.
   */
  abdeckung: AbdeckungEintrag | null
  /** Warum nicht gewertet wird: Programm noch nicht ausgewertet oder kein aktuelles Landesprogramm. */
  fehlt?: { grund: 'nicht_erfasst' | 'kein_landesprogramm'; land: string | null; begruendung?: string }
  /** Programme, aus denen gewertet wurde (leer, wenn nicht gewertet wird). */
  programme: GenutztesProgramm[]
  /** true, wenn die Wertung (auch) auf KI-Entwürfen beruht – nur in der geschlossenen Testphase. */
  ki_entwurf?: boolean
  /** true, wenn eine gewertete Maßnahme ein KI-Entwurf ist, dessen Werte nicht blind entstanden sind. */
  nicht_blind?: boolean
}

/**
 * Bundesland und Zuständigkeiten für die Wertung. Ohne Angabe (oder ohne Land)
 * zählt für alle Ursachen das Bundesprogramm.
 */
export interface Ebenen {
  /** Gewähltes Bundesland (Kürzel) oder null. */
  land: string | null
  ursachen: Pick<Ursache, 'id' | 'ebene'>[]
  /** Nur Programme der laufenden Wahlperiode. */
  landesprogramme: Landesprogramm[]
}

export const findeAbdeckung = (abdeckung: AbdeckungEintrag[], parteiId: number, themaId: number, land: string | null = null) =>
  abdeckung.find((a) => a.partei_id === parteiId && a.thema_id === themaId && (a.land ?? null) === land) ?? null

/**
 * Aus welchem Programm eine Ursache gewertet wird: Landesprogramm, wenn die Ursache
 * in Länderzuständigkeit liegt und ein Bundesland gewählt ist, sonst Bundesprogramm.
 * Je Partei und Ursache zählt immer genau ein Programm.
 */
export function programmFuer(ursacheId: number, ebenen?: Ebenen): string | null {
  if (!ebenen?.land) return null
  const ebene: Ebene = ebenen.ursachen.find((u) => u.id === ursacheId)?.ebene ?? 'bund'
  return ebene === 'land' ? ebenen.land : null
}

export function massnahmenPunkte(m: Massnahme, rolle: Rolle | null) {
  const mod = rolle ? m.rollen_modifikator?.[rolle] : undefined
  const rollenBonus = mod?.wert ?? 0
  // Produkt statt Summe: Eine unwirksame Maßnahme bringt keine Punkte, egal wie leicht
  // sie umsetzbar ist, und eine nicht umsetzbare ebenso wenig. Die Rolle verschiebt nur
  // die Wirksamkeit (für diese Person wirkt die Maßnahme stärker oder schwächer).
  // Wirksamkeit 3 setzt belegte Wirkung voraus (docs/methode.md) – auch, wenn erst die Rolle sie dahin hebt.
  const hoechstens = m.evidenz === 'gemischt' || m.evidenz === 'offen' ? Math.max(2, m.wirksamkeit) : 3
  const wirksamkeit = Math.min(hoechstens, Math.max(0, m.wirksamkeit + rollenBonus))
  return {
    punkte: wirksamkeit * m.umsetzbarkeit,
    wirksamkeit,
    rollenBonus,
    rollenBegruendung: mod?.begruendung,
  }
}

/**
 * Rundenpunkte einer Partei = Summe über die zugeordneten Ursachen.
 * Pro Ursache zählen die verschiedenen Lösungswege der Partei mit abnehmendem Gewicht:
 * der beste voll, der zweite zur Hälfte, der dritte zu einem Viertel usw., zusammen
 * höchstens MAX_JE_URSACHE. Ein Lösungsweg ist ein Instrument (`instrument_id`); mehrere
 * Maßnahmen zum selben Instrument zählen nur einmal (die beste), eine Maßnahme ohne
 * Instrument gilt als eigener Weg. Begründung in docs/methode.md → „Mehrere Maßnahmen je Ursache“.
 * Keine Maßnahme zum Thema → 0 Punkte. Ob das „nichts im Programm“ oder
 * „noch nicht erfasst“ heißt, steht in `abdeckung`.
 */
export function bewertePartei(
  partei: Partei,
  themaId: number,
  ursachenIds: number[],
  rolle: Rolle | null,
  massnahmen: Massnahme[],
  abdeckung: AbdeckungEintrag[],
  ebenen?: Ebenen,
): ParteiErgebnis {
  // Welche Programme gebraucht werden: jedes muss erfasst sein, sonst wird nicht gewertet –
  // auch nicht teilweise, damit fehlende Daten keiner Partei einen Punkt kosten.
  const benoetigt = ursachenIds.length ? [...new Set(ursachenIds.map((id) => programmFuer(id, ebenen)))] : [null]
  const programme: GenutztesProgramm[] = []
  const ohneWertung = (fehlt: NonNullable<ParteiErgebnis['fehlt']>): ParteiErgebnis => ({
    partei, punkte: 0, treffer: [], ursachen: [], abdeckung: null, fehlt, programme: [],
  })
  for (const land of benoetigt) {
    let url = partei.programm_url
    let stand = partei.programm_stand
    if (land !== null) {
      const lp = ebenen?.landesprogramme.find((p) => p.partei_id === partei.id && p.land === land)
      if (!lp) return ohneWertung({ grund: 'nicht_erfasst', land })
      if (!lp.url || !lp.stand) return ohneWertung({ grund: 'kein_landesprogramm', land, begruendung: lp.kein_programm ?? undefined })
      url = lp.url
      stand = lp.stand
    }
    // Nicht erfasst → keine Maßnahmen verwenden, auch wenn (inkonsistent) welche vorliegen.
    const a = findeAbdeckung(abdeckung, partei.id, themaId, land)
    if (!a) return ohneWertung({ grund: 'nicht_erfasst', land })
    // Für eine Ursache, nach der dieses Programm (noch) nicht durchsucht wurde, gibt es keine
    // Aussage – also keine Wertung, statt 0 Punkte (etwa nach einer nachträglich ergänzten Ursache).
    if (a.durchsucht_fuer && ursachenIds.some((id) => programmFuer(id, ebenen) === land && !a.durchsucht_fuer!.includes(id)))
      return ohneWertung({ grund: 'nicht_erfasst', land })
    programme.push({ land, url, stand, abdeckung: a })
  }
  const erfasst = programme.every((p) => p.abdeckung.art === 'keine')
    ? programme[0].abdeckung
    : programme.find((p) => p.abdeckung.art === 'massnahmen')!.abdeckung

  const eigene = massnahmen.filter((m) => m.partei_id === partei.id && m.thema_id === themaId)
  const trefferJeMassnahme = new Map<number, Treffer>()
  const ursachen: UrsachenWertung[] = []
  let zehntelSumme = 0

  for (const ursacheId of ursachenIds) {
    const land = programmFuer(ursacheId, ebenen)
    // Je Lösungsweg die beste Maßnahme; eine Maßnahme ohne Instrument ist ein eigener Weg.
    const jeWeg = new Map<string, { m: Massnahme; p: ReturnType<typeof massnahmenPunkte> }>()
    for (const m of eigene) {
      if (!m.ursachen_ids.includes(ursacheId) || (m.land ?? null) !== land) continue
      const p = massnahmenPunkte(m, rolle)
      const weg = m.instrument_id != null ? `i${m.instrument_id}` : `m${m.id}`
      const bisher = jeWeg.get(weg)
      if (!bisher || p.punkte > bisher.p.punkte) jeWeg.set(weg, { m, p })
    }
    if (!jeWeg.size) continue
    // Bester Weg zuerst; bei gleichen Punkten entscheidet die ID, damit die Reihenfolge feststeht.
    const wege = [...jeWeg.values()].sort((x, y) => y.p.punkte - x.p.punkte || x.m.id - y.m.id)
    // Wege ohne Punkte tragen nichts bei; gezeigt wird höchstens einer (wenn es sonst keinen gibt).
    const gezaehlt = wege.filter((w, i) => i === 0 || w.p.punkte > 0)
    const beitraege = gezaehlt.map((w, rang) => ({ massnahme_id: w.m.id, punkte: w.p.punkte, gewicht: gewichtNachRang(rang) }))
    const roh = beitraege.reduce((s, b) => s + b.punkte * b.gewicht, 0)
    const punkteUrsache = Math.min(zehntel(MAX_JE_URSACHE), zehntel(roh))
    zehntelSumme += punkteUrsache
    ursachen.push({ ursache_id: ursacheId, punkte: punkteUrsache / 10, beitraege, gedeckelt: roh > MAX_JE_URSACHE })

    for (const { m, p } of gezaehlt) {
      const vorhanden = trefferJeMassnahme.get(m.id)
      if (vorhanden) {
        vorhanden.ursachen_ids.push(ursacheId)
      } else {
        trefferJeMassnahme.set(m.id, {
          massnahme: m,
          ursachen_ids: [ursacheId],
          punkteJeUrsache: p.punkte,
          rollenBonus: p.rollenBonus,
          wirksamkeit: p.wirksamkeit,
          rollenBegruendung: p.rollenBegruendung,
        })
      }
    }
  }
  const punkte = zehntelSumme / 10

  const kiEntwurf = programme.some((p) => p.abdeckung.ki_entwurf)
  const treffer = [...trefferJeMassnahme.values()]
  // Entwurfswerte mit Kenntnis der Partei (oder vor der Blindbewertung entstanden): eigens gekennzeichnet.
  const nichtBlind = treffer.some((t) => t.massnahme.ki_entwurf && t.massnahme.entwurf_herkunft !== 'blind')
  return {
    partei, punkte, treffer, ursachen, abdeckung: erfasst, programme, ...(kiEntwurf ? { ki_entwurf: true } : {}), ...(nichtBlind ? { nicht_blind: true } : {}),
  }
}

/**
 * Rundensieger: Höhere Summe bekommt 1 Punkt, Gleichstand je 1 Punkt.
 * Haben beide Parteien 0 Punkte (keine Maßnahme), gibt es keinen Punkt.
 */
export function rundenpunkte(a: number, b: number): [number, number] {
  if (a === 0 && b === 0) return [0, 0]
  if (a === b) return [1, 1]
  return a > b ? [1, 0] : [0, 1]
}

/**
 * Wertung einer Runde zwischen zwei Parteien. Ist das Thema für eine der
 * beiden noch nicht erfasst (oder fehlt ein aktuelles Landesprogramm), wird nicht gewertet: Fehlende Daten dürfen
 * keiner Partei einen Punkt kosten.
 */
export function werteRunde(a: ParteiErgebnis, b: ParteiErgebnis): { status: 'gewertet' | 'unvollstaendig'; punkte: [number, number] } {
  if (!a.abdeckung || !b.abdeckung) return { status: 'unvollstaendig', punkte: [0, 0] }
  return { status: 'gewertet', punkte: rundenpunkte(a.punkte, b.punkte) }
}

/**
 * Alle Parteien mit der höchsten Punktzahl zu diesem Problem (leer, wenn niemand liefert).
 * Berücksichtigt nur Parteien, für die das Thema erfasst ist.
 */
export function besteParteien(
  parteien: Partei[],
  themaId: number,
  ursachenIds: number[],
  rolle: Rolle | null,
  massnahmen: Massnahme[],
  abdeckung: AbdeckungEintrag[],
  ebenen?: Ebenen,
): ParteiErgebnis[] {
  const alle = parteien
    .map((p) => bewertePartei(p, themaId, ursachenIds, rolle, massnahmen, abdeckung, ebenen))
    .filter((e) => e.abdeckung)
  if (!alle.length) return []
  const max = Math.max(...alle.map((e) => e.punkte))
  if (max <= 0) return []
  return alle.filter((e) => e.punkte === max)
}
