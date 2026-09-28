import type { AbdeckungEintrag, Ebene, Landesprogramm, Massnahme, Partei, Rolle, Ursache } from './typen.ts'

// Deterministische Punktevergabe aus der kuratierten Datenbank.
// Die KI ist hier nicht beteiligt.

export interface Treffer {
  massnahme: Massnahme
  /** Ursachen, für die diese Maßnahme gezählt wurde. */
  ursachen_ids: number[]
  /** Punkte pro Ursache: Wirksamkeit (± Rolle, 0–3) × Umsetzbarkeit, also 0 bis 9. */
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

export interface ParteiErgebnis {
  partei: Partei
  punkte: number
  treffer: Treffer[]
  /**
   * Erfassung des Themas für diese Partei; null = keine Wertung möglich (siehe `fehlt`).
   * Werden Bundes- und Landesprogramm genutzt: `keine` nur, wenn beide nichts zum Thema enthalten.
   */
  abdeckung: AbdeckungEintrag | null
  /** Warum nicht gewertet wird: Programm noch nicht ausgewertet oder kein aktuelles Landesprogramm. */
  fehlt?: { grund: 'nicht_erfasst' | 'kein_landesprogramm'; land: string | null; begruendung?: string }
  /** Programme, aus denen gewertet wurde (leer, wenn nicht gewertet wird). */
  programme: GenutztesProgramm[]
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
  const wirksamkeit = Math.min(3, Math.max(0, m.wirksamkeit + rollenBonus))
  return {
    punkte: wirksamkeit * m.umsetzbarkeit,
    wirksamkeit,
    rollenBonus,
    rollenBegruendung: mod?.begruendung,
  }
}

/**
 * Rundenpunkte einer Partei = Summe über die zugeordneten Ursachen.
 * Pro Ursache zählt die beste Maßnahme der Partei, die diese Ursache adressiert.
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
    partei, punkte: 0, treffer: [], abdeckung: null, fehlt, programme: [],
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
    programme.push({ land, url, stand, abdeckung: a })
  }
  const erfasst = programme.every((p) => p.abdeckung.art === 'keine')
    ? programme[0].abdeckung
    : programme.find((p) => p.abdeckung.art === 'massnahmen')!.abdeckung

  const eigene = massnahmen.filter((m) => m.partei_id === partei.id && m.thema_id === themaId)
  const trefferJeMassnahme = new Map<number, Treffer>()
  let punkte = 0

  for (const ursacheId of ursachenIds) {
    const land = programmFuer(ursacheId, ebenen)
    let beste: { m: Massnahme; p: ReturnType<typeof massnahmenPunkte> } | null = null
    for (const m of eigene) {
      if (!m.ursachen_ids.includes(ursacheId) || (m.land ?? null) !== land) continue
      const p = massnahmenPunkte(m, rolle)
      if (!beste || p.punkte > beste.p.punkte) beste = { m, p }
    }
    if (!beste) continue
    punkte += beste.p.punkte
    const vorhanden = trefferJeMassnahme.get(beste.m.id)
    if (vorhanden) {
      vorhanden.ursachen_ids.push(ursacheId)
    } else {
      trefferJeMassnahme.set(beste.m.id, {
        massnahme: beste.m,
        ursachen_ids: [ursacheId],
        punkteJeUrsache: beste.p.punkte,
        rollenBonus: beste.p.rollenBonus,
        wirksamkeit: beste.p.wirksamkeit,
        rollenBegruendung: beste.p.rollenBegruendung,
      })
    }
  }

  return { partei, punkte, treffer: [...trefferJeMassnahme.values()], abdeckung: erfasst, programme }
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
