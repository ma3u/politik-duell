// Erfassen mit KI-Agenten (.claude/skills/thema-erfassen): reine Funktionen für die
// drei Kommandos in scripts/entwurf/ (ursachen-freigegeben, blind, eintragen).
//
// Ablauf: Je Programm liefert ein Agent die gefundenen Maßnahmen ohne Bewertung
// (Erfassung). Daraus entsteht eine Liste ohne Parteinamen in gemischter Reihenfolge
// (blindListe), die ein anderer Agent bewertet (Bewertung). Erst `eintragen` bringt
// beides zusammen und schreibt es mit neuen IDs in die Themendatei.
import type { Katalog } from '../src/data/katalog.ts'
import type { Evidenz, Rolle, RollenModifikator } from '../src/data/types.ts'
import { naechsteId } from './ids.ts'
import { createHash } from 'node:crypto'

// ---------------------------------------------------------------------------
// Formate
// ---------------------------------------------------------------------------

/** Was ein Erfassungs-Agent in einem Programm gefunden hat – ohne Bewertung. */
export interface ErfassteMassnahme {
  beschreibung: string
  ursachen_ids: number[]
  /** Wörtlich, wie auf der Seite. */
  zitat: string
  /** PDF-Seite (#page=N), nicht die gedruckte Seitenzahl. */
  seite: number
}

export interface ErfasstesProgramm {
  partei_id: number
  /** null = Bundesprogramm */
  land: string | null
  massnahmen: ErfassteMassnahme[]
  /** Nur wenn `massnahmen` leer ist: was durchsucht wurde und warum nichts passt. */
  keine_massnahme?: string
}

export interface Erfassung {
  thema_id: number
  /** Für alle Programme dieselben – steht später in docs/perspektiven-ursachen.md. */
  suchbegriffe: string[]
  programme: ErfasstesProgramm[]
}

export interface Einzelbewertung {
  wirksamkeit: 0 | 1 | 2 | 3
  umsetzbarkeit: 0 | 1 | 2 | 3
  begruendung: string
  evidenz: Evidenz
  beleg_studie_url?: string
  rollen_modifikator?: Partial<Record<Rolle, RollenModifikator>>
}

/** Antwort des Bewertungs-Agenten – kennt nur Kennungen, keine Parteien. */
export interface Bewertung {
  neue_instrumente: ({ kennung: string; name: string } & Einzelbewertung)[]
  zuordnung: ({ kennung: string; instrument: number | string } | { kennung: string; einzeln: Einzelbewertung })[]
}

// ---------------------------------------------------------------------------
// Freigabe der Ursachen
// ---------------------------------------------------------------------------

/**
 * Maßnahmen dürfen erst erfasst werden, wenn die Ursachen im Zielzweig stehen
 * (von der Betreiberin freigegeben). Danach dürfen sie sich nicht mehr ändern.
 */
export function ursachenFreigegeben(freigegeben: Katalog, arbeitsstand: Katalog, themaId: number): string[] {
  const vorher = freigegeben.ursachen.filter((u) => u.thema_id === themaId)
  const jetzt = arbeitsstand.ursachen.filter((u) => u.thema_id === themaId)
  if (!freigegeben.themen.some((t) => t.id === themaId))
    return [`Thema ${themaId} steht noch nicht im Zielzweig – erst Ursachen festlegen und freigeben lassen (/thema-anlegen)`]
  if (!vorher.length) return [`Thema ${themaId} hat im Zielzweig keine Ursachen`]
  const fehler: string[] = []
  for (const u of jetzt) {
    const alt = vorher.find((v) => v.id === u.id)
    if (!alt) fehler.push(`Ursache ${u.id} ist nicht freigegeben (fehlt im Zielzweig) – Ursachen nicht beim Erfassen ergänzen`)
    else if (alt.beschreibung !== u.beschreibung || alt.quelle_url !== u.quelle_url || (alt.ebene ?? 'bund') !== (u.ebene ?? 'bund'))
      fehler.push(`Ursache ${u.id} weicht vom freigegebenen Stand ab – Ursachen nicht beim Erfassen ändern`)
  }
  for (const v of vorher) if (!jetzt.some((u) => u.id === v.id)) fehler.push(`Ursache ${v.id} fehlt im Arbeitsstand`)
  return fehler
}

// ---------------------------------------------------------------------------
// Liste ohne Parteinamen
// ---------------------------------------------------------------------------

/** Bezeichnungen, unter denen Parteien sich in ihren Programmen selbst nennen. */
const PARTEI_NAMEN = [
  'Alternative für Deutschland',
  'Bündnis Sahra Wagenknecht',
  'Bündnis Soziale Gerechtigkeit und Wirtschaftliche Vernunft',
  'Sahra Wagenknecht',
  'Bündnis 90/Die Grünen',
  'Bündnis 90',
  'Freie Demokraten',
  'Freien Demokraten',
  'Sozialdemokratinnen und Sozialdemokraten',
  'Sozialdemokraten',
  'Sozialdemokratie',
  'Christdemokraten',
  'CDU/CSU',
  'CDU',
  'CSU',
  'Union',
  'SPD',
  'Grünen',
  'Grüne',
  'FDP',
  'Liberale',
  'AfD',
  'Linken',
  'Linke',
  'LINKE',
  'BSW',
]

/**
 * Ersetzt Parteinamen durch „[Partei]“, damit die Bewertung nicht am Namen hängt.
 * Groß- und Kleinschreibung zählt: „die linke Spur“ oder „grüner Wasserstoff“ bleiben
 * stehen, ebenso „Europäische Union“.
 */
export function ohneParteinamen(text: string, weitere: string[] = []): string {
  const namen = [...new Set([...PARTEI_NAMEN, ...weitere])].sort((a, b) => b.length - a.length)
  const muster = new RegExp(`(?<![\\p{L}])(?:${namen.map((n) => n.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|')})(?![\\p{L}])`, 'gu')
  return text.replace(muster, (name, stelle: number) => (name === 'Union' && /Europäischen?\s+$/.test(text.slice(0, stelle)) ? name : '[Partei]'))
}

export interface Kennung {
  kennung: string
  programm: number
  massnahme: number
}

/**
 * Feste Kennungen M01, M02 … in gemischter Reihenfolge: sortiert nach einer Prüfsumme
 * des Inhalts, nicht nach Partei. Dieselbe Erfassung ergibt immer dieselben Kennungen –
 * so passt die Bewertung beim Eintragen ohne gespeicherte Zuordnung.
 */
export function kennungen(e: Erfassung): Kennung[] {
  const liste = e.programme.flatMap((p, i) =>
    p.massnahmen.map((m, j) => ({
      programm: i,
      massnahme: j,
      schluessel: createHash('sha256').update(`${m.beschreibung}\n${m.zitat}\n${m.seite}`).digest('hex'),
    })),
  )
  liste.sort((a, b) => (a.schluessel < b.schluessel ? -1 : a.schluessel > b.schluessel ? 1 : a.programm - b.programm || a.massnahme - b.massnahme))
  const stellen = String(liste.length).length < 2 ? 2 : String(liste.length).length
  return liste.map((x, n) => ({ kennung: `M${String(n + 1).padStart(stellen, '0')}`, programm: x.programm, massnahme: x.massnahme }))
}

/** Ebene eines Instruments aus den Maßnahmen, die darauf verweisen. */
function instrumentEbene(k: Katalog, id: number): 'bund' | 'land' | null {
  const m = k.massnahmen.find((x) => x.instrument_id === id)
  return m ? (m.land ? 'land' : 'bund') : null
}

export interface BlindListe {
  thema: { id: number; name: string; ziel?: string }
  ursachen: { id: number; beschreibung: string; ebene: string }[]
  instrumente: { id: number; name: string; ebene: string | null; wirksamkeit: number; umsetzbarkeit: number; evidenz?: string | null; begruendung: string }[]
  massnahmen: { kennung: string; ebene: 'bund' | 'land'; beschreibung: string; zitat: string; ursachen_ids: number[] }[]
}

/** Was der Bewertungs-Agent sieht: Thema, Ursachen, vorhandene Instrumente und Maßnahmen ohne Partei. */
export function blindListe(k: Katalog, e: Erfassung): BlindListe {
  const thema = k.themen.find((t) => t.id === e.thema_id)
  if (!thema) throw new Error(`Thema ${e.thema_id} nicht im Katalog`)
  const weitere = k.parteien.flatMap((p) => [p.name, p.kurzname])
  const massnahmen = kennungen(e).map(({ kennung, programm, massnahme }) => {
    const p = e.programme[programm]
    const m = p.massnahmen[massnahme]
    return {
      kennung,
      ebene: p.land ? ('land' as const) : ('bund' as const),
      beschreibung: ohneParteinamen(m.beschreibung, weitere),
      zitat: ohneParteinamen(m.zitat, weitere),
      ursachen_ids: m.ursachen_ids,
    }
  })
  return {
    thema: { id: thema.id, name: thema.name, ziel: thema.ziel },
    ursachen: k.ursachen.filter((u) => u.thema_id === thema.id).map((u) => ({ id: u.id, beschreibung: u.beschreibung, ebene: u.ebene ?? 'bund' })),
    instrumente: k.instrumente
      .filter((i) => i.thema_id === thema.id)
      .map((i) => ({
        id: i.id,
        name: i.name,
        ebene: instrumentEbene(k, i.id),
        wirksamkeit: i.wirksamkeit,
        umsetzbarkeit: i.umsetzbarkeit,
        evidenz: i.evidenz,
        begruendung: i.begruendung,
      })),
    massnahmen,
  }
}

// ---------------------------------------------------------------------------
// Prüfen und Eintragen
// ---------------------------------------------------------------------------

const WERT = new Set([0, 1, 2, 3])
const EVIDENZ = new Set(['belegt', 'gemischt', 'offen'])

function pruefeEinzel(was: string, b: Einzelbewertung): string[] {
  const f: string[] = []
  if (!WERT.has(b.wirksamkeit)) f.push(`${was}: wirksamkeit muss 0–3 sein`)
  if (!WERT.has(b.umsetzbarkeit)) f.push(`${was}: umsetzbarkeit muss 0–3 sein`)
  if (!b.begruendung?.trim()) f.push(`${was}: begruendung fehlt`)
  if (!EVIDENZ.has(b.evidenz)) f.push(`${was}: evidenz muss belegt, gemischt oder offen sein`)
  if (b.wirksamkeit === 3 && b.evidenz !== 'belegt') f.push(`${was}: Wirksamkeit 3 nur mit evidenz „belegt“`)
  return f
}

/** Prüft die Erfassung gegen den Katalog, bevor irgendetwas geschrieben wird. */
export function pruefeErfassung(k: Katalog, e: Erfassung): string[] {
  const f: string[] = []
  const ursachen = new Map(k.ursachen.filter((u) => u.thema_id === e.thema_id).map((u) => [u.id, u]))
  if (!ursachen.size) f.push(`Thema ${e.thema_id} hat keine Ursachen`)
  if (!e.suchbegriffe?.length) f.push('suchbegriffe fehlen')
  const gesehen = new Set<string>()
  for (const p of e.programme) {
    const name = `Partei ${p.partei_id} ${p.land ?? 'Bund'}`
    if (gesehen.has(name)) f.push(`${name}: doppelt in der Erfassung`)
    gesehen.add(name)
    if (!k.parteien.some((x) => x.id === p.partei_id)) f.push(`${name}: unbekannte Partei`)
    if (p.land && !k.landesprogramme.some((l) => l.partei_id === p.partei_id && l.land === p.land && l.aktuell && l.url))
      f.push(`${name}: kein aktuelles Landesprogramm in parteien.json`)
    if (k.abdeckung.some((a) => a.thema_id === e.thema_id && a.partei_id === p.partei_id && (a.land ?? null) === p.land && a.aktuell))
      f.push(`${name}: hat zu diesem Thema schon einen Eintrag – bestehende Einträge von Hand ergänzen`)
    if (!p.massnahmen.length && !p.keine_massnahme?.trim()) f.push(`${name}: weder Maßnahmen noch keine_massnahme`)
    if (p.massnahmen.length && p.keine_massnahme) f.push(`${name}: Maßnahmen und keine_massnahme zugleich`)
    for (const [j, m] of p.massnahmen.entries()) {
      const was = `${name}, Maßnahme ${j + 1}`
      if (!m.beschreibung?.trim()) f.push(`${was}: beschreibung fehlt`)
      if (!m.zitat?.trim()) f.push(`${was}: zitat fehlt`)
      if (!Number.isInteger(m.seite) || m.seite < 1) f.push(`${was}: seite muss die PDF-Seite sein (ganze Zahl ≥ 1)`)
      if (!m.ursachen_ids?.length) f.push(`${was}: ursachen_ids fehlen`)
      for (const id of m.ursachen_ids ?? []) {
        const u = ursachen.get(id)
        if (!u) f.push(`${was}: Ursache ${id} gehört nicht zum Thema`)
        else if (p.land && (u.ebene ?? 'bund') !== 'land') f.push(`${was}: Landesprogramme nur für Ursachen mit ebene „land“ (${id} ist Bund)`)
      }
    }
  }
  return f
}

/** Prüft die Bewertung: jede Kennung genau einmal, Instrumente bekannt und auf einer Ebene. */
export function pruefeBewertung(k: Katalog, e: Erfassung, b: Bewertung): string[] {
  const f: string[] = []
  const alle = new Map(kennungen(e).map((x) => [x.kennung, x]))
  const vorhandene = new Set(k.instrumente.filter((i) => i.thema_id === e.thema_id).map((i) => i.id))
  const neue = new Map((b.neue_instrumente ?? []).map((i) => [i.kennung, i]))
  for (const i of b.neue_instrumente ?? []) {
    if (!i.name?.trim()) f.push(`Instrument ${i.kennung}: name fehlt`)
    f.push(...pruefeEinzel(`Instrument ${i.kennung}`, i))
  }
  const ebenen = new Map<number | string, Set<string>>()
  const zugeordnet = new Set<string>()
  for (const z of b.zuordnung ?? []) {
    const x = alle.get(z.kennung)
    if (!x) {
      f.push(`${z.kennung}: unbekannte Kennung`)
      continue
    }
    if (zugeordnet.has(z.kennung)) f.push(`${z.kennung}: mehrfach zugeordnet`)
    zugeordnet.add(z.kennung)
    const ebene = e.programme[x.programm].land ? 'land' : 'bund'
    if ('instrument' in z) {
      if (typeof z.instrument === 'number' ? !vorhandene.has(z.instrument) : !neue.has(z.instrument))
        f.push(`${z.kennung}: Instrument ${z.instrument} gibt es nicht`)
      const vorher = typeof z.instrument === 'number' ? instrumentEbene(k, z.instrument) : null
      const s = ebenen.get(z.instrument) ?? new Set(vorher ? [vorher] : [])
      s.add(ebene)
      ebenen.set(z.instrument, s)
    } else f.push(...pruefeEinzel(z.kennung, z.einzeln))
  }
  for (const [id, s] of ebenen) if (s.size > 1) f.push(`Instrument ${id}: Maßnahmen aus Bund und Land – je Ebene ein eigenes Instrument`)
  for (const kennung of alle.keys()) if (!zugeordnet.has(kennung)) f.push(`${kennung}: nicht bewertet`)
  for (const kennung of neue.keys())
    if (!(b.zuordnung ?? []).some((z) => 'instrument' in z && z.instrument === kennung)) f.push(`Instrument ${kennung}: keine Maßnahme verweist darauf`)
  return f
}

type Json = Record<string, unknown>

/**
 * Schreibt Erfassung und Bewertung in die Themendatei (als Objekt): neue Instrumente,
 * je Programm ein Abdeckungseintrag, alles als ungeprüfter KI-Entwurf mit neuen IDs.
 */
export function eintragen(k: Katalog, datei: Json, e: Erfassung, b: Bewertung, heute: string): Json {
  let id = naechsteId(k)
  const neueIds = new Map<string, number>()
  const instrumente = [...((datei.instrumente as Json[] | undefined) ?? [])]
  for (const i of b.neue_instrumente ?? []) {
    neueIds.set(i.kennung, id)
    const { kennung: _, ...rest } = i
    instrumente.push({ id: id++, ...rest })
  }
  const zuordnung = new Map((b.zuordnung ?? []).map((z) => [z.kennung, z]))
  const kennungNach = new Map(kennungen(e).map((x) => [`${x.programm}/${x.massnahme}`, x.kennung]))
  const abdeckung = [...((datei.abdeckung as Json[] | undefined) ?? [])]
  for (const [i, p] of e.programme.entries()) {
    const partei = k.parteien.find((x) => x.id === p.partei_id)!
    const lp = p.land ? k.landesprogramme.find((l) => l.partei_id === p.partei_id && l.land === p.land && l.aktuell) : undefined
    const url = lp ? lp.url! : partei.programm_url
    const kopf: Json = { partei_id: p.partei_id, ...(lp ? { land: lp.land, landtagswahl: lp.landtagswahl } : {}) }
    if (!p.massnahmen.length) {
      abdeckung.push({ ...kopf, keine_massnahme: { begruendung: p.keine_massnahme, stand: heute, geprueft: false, ki_entwurf: true } })
      continue
    }
    const massnahmen = p.massnahmen.map((m, j) => {
      const z = zuordnung.get(kennungNach.get(`${i}/${j}`)!)!
      const bewertung: Json =
        'instrument' in z
          ? { instrument: typeof z.instrument === 'number' ? z.instrument : neueIds.get(z.instrument) }
          : { ...z.einzeln }
      const { begruendung, evidenz, beleg_studie_url, rollen_modifikator, ...werte } = bewertung
      return {
        id: id++,
        ...('instrument' in bewertung ? { instrument: bewertung.instrument } : {}),
        beschreibung: m.beschreibung,
        ursachen_ids: m.ursachen_ids,
        ...('instrument' in bewertung ? {} : werte),
        ...(rollen_modifikator ? { rollen_modifikator } : {}),
        ...(begruendung ? { begruendung } : {}),
        zitat: m.zitat,
        beleg_programm_url: `${url}#page=${m.seite}`,
        ...(beleg_studie_url ? { beleg_studie_url } : {}),
        ...(evidenz ? { evidenz } : {}),
        stand: heute,
        geprueft: false,
        ki_entwurf: true,
      }
    })
    abdeckung.push({ ...kopf, massnahmen })
  }
  return { ...datei, ...(instrumente.length ? { instrumente } : {}), abdeckung }
}
