// Haltungen erfassen (Phase B, /haltung-erfassen): je Bundesprogramm sucht ein Agent die Stelle, die die Haltung
// des Programms zur Frage am klarsten zeigt (nur Zitat und Seite, keine Einordnung). Danach ordnet ein zweiter
// Agent ohne Parteinamen ein (ja/nein/teils/keine_aussage) und schreibt die Kurzfassung. Reine Funktionen;
// die Befehle stehen in scripts/haltung/. Arbeitsordner: .cache/haltung/<ID>/.
import { createHash } from 'node:crypto'
import type { Katalog, KatalogHaltung } from '../src/data/katalog.ts'
import { MAX_KURZFASSUNG_WOERTER } from '../src/data/katalog.ts'
import { enthaeltParteinamen, neutralisiere, programmName } from './entwurf.ts'

/** Ergebnis eines Erfassungs-Agenten für ein Programm. */
export interface HaltungFund {
  haltung_id: number
  partei_id: number
  /** Eine zusammenhängende Passage, wörtlich, ohne lange Auslassungen. */
  zitat?: string
  /** PDF-Seite (#page=N). */
  seite?: number
  /** Nur ohne Zitat: was gelesen und gesucht wurde und warum es keine Aussage zur Frage gibt. */
  keine_aussage?: string
}

/** Liste für die Einordnung ohne Parteinamen. */
export interface HaltungBlindliste {
  haltung_id: number
  frage: string
  beschreibung: string
  einordnung?: { ja: string; teils: string; nein: string }
  eintraege: { kennung: string; zitat: string }[]
  pruefsumme: string
}

export type Einordnungswert = 'ja' | 'nein' | 'teils' | 'keine_aussage'

/** Antwort des Einordnungs-Agenten – kennt nur Kennungen. */
export interface HaltungAntwort {
  pruefsumme: string
  einordnungen: { kennung: string; position: Einordnungswert; kurzfassung?: string; begruendung: string }[]
}

export const HALTUNG_ORDNER = (id: number) => `.cache/haltung/${id}`
/** Gemeinsamer Arbeitsordner eines Laufs (Texte, Aufträge, Rohantworten der Erfassungs-Agenten). */
export const LAUF_ORDNER = '.cache/haltung/lauf'
export const fundName = (k: Katalog, parteiId: number) => programmName(k.parteien.find((p) => p.id === parteiId)?.kurzname ?? String(parteiId), null)

const sha = (t: string) => createHash('sha256').update(t).digest('hex').slice(0, 16)

/** Felder und Form eines Funds; ob das Zitat auf der Seite steht, prüft der Befehl mit dem Programmtext. */
export function pruefeFund(k: Katalog, h: KatalogHaltung, f: HaltungFund): string[] {
  const fehler: string[] = []
  if (f.haltung_id !== h.id) fehler.push(`haltung_id ist ${f.haltung_id}, erwartet ${h.id}`)
  if (!k.parteien.some((p) => p.id === f.partei_id)) fehler.push(`unbekannte partei_id ${f.partei_id}`)
  const mitZitat = typeof f.zitat === 'string' && f.zitat.trim() !== ''
  if (mitZitat && f.keine_aussage) fehler.push('zitat und keine_aussage zugleich – entweder eine Stelle oder eine Begründung')
  if (!mitZitat && !f.keine_aussage?.trim()) fehler.push('weder zitat noch keine_aussage')
  if (mitZitat) {
    if (f.zitat!.length > 800) fehler.push('zitat ist länger als 800 Zeichen – nur die Sätze, die die Haltung zeigen')
    if (!Number.isInteger(f.seite) || f.seite! < 1) fehler.push('seite muss die PDF-Seite sein (ganze Zahl ≥ 1)')
    if ((f.zitat!.match(/\[…\]/g) ?? []).length > 1) fehler.push('höchstens eine Auslassung „[…]“ – eine zusammenhängende Passage zitieren')
  }
  if (f.keine_aussage && f.keine_aussage.length < 30) fehler.push('keine_aussage: kurz nennen, welche Begriffe gesucht und welche Kapitel gelesen wurden')
  return fehler
}

/** Gemischte Reihenfolge, fest über den Inhalt (nicht über die Partei-ID). */
const reihenfolge = (funde: HaltungFund[]) => [...funde].sort((a, b) => sha(a.zitat ?? '').localeCompare(sha(b.zitat ?? '')))

/**
 * Blindliste: nur Funde mit Zitat, Parteinamen, Personen und Länder ersetzt, Kennungen H1, H2 … in gemischter
 * Reihenfolge. `kennungen` (Kennung → Partei) bleibt beim Koordinator.
 */
export function haltungBlind(k: Katalog, h: KatalogHaltung, funde: HaltungFund[]) {
  const namen = k.parteien.flatMap((p) => [p.name, p.kurzname])
  const mit = reihenfolge(funde.filter((f) => f.zitat))
  const eintraege = mit.map((f, i) => ({ kennung: `H${i + 1}`, zitat: neutralisiere(f.zitat!, namen) }))
  const kopf = { haltung_id: h.id, frage: h.frage, beschreibung: h.beschreibung, ...(h.einordnung ? { einordnung: h.einordnung } : {}) }
  const pruefsumme = sha(JSON.stringify([kopf, eintraege]))
  const liste: HaltungBlindliste = { ...kopf, eintraege, pruefsumme }
  const kennungen = mit.map((f, i) => ({ kennung: `H${i + 1}`, partei_id: f.partei_id }))
  return { liste, kennungen }
}

const WERTE = new Set(['ja', 'nein', 'teils', 'keine_aussage'])

/** Prüft die Antwort gegen die Blindliste: jede Kennung genau einmal, gültige Werte, Kurzfassung ohne Parteinamen. */
export function pruefeHaltungAntwort(liste: HaltungBlindliste, a: HaltungAntwort): string[] {
  const f: string[] = []
  if (!a || typeof a !== 'object' || !Array.isArray(a.einordnungen)) return ['erwartet { "pruefsumme": "…", "einordnungen": [ … ] }']
  if (a.pruefsumme !== liste.pruefsumme) f.push(`pruefsumme ist „${a.pruefsumme}“, die Liste hat „${liste.pruefsumme}“`)
  const gesehen = new Set<string>()
  for (const e of a.einordnungen) {
    const was = e?.kennung ?? '?'
    if (!liste.eintraege.some((x) => x.kennung === e?.kennung)) f.push(`${was}: Kennung nicht in der Liste`)
    if (gesehen.has(was)) f.push(`${was}: doppelt`)
    gesehen.add(was)
    if (!WERTE.has(e?.position)) f.push(`${was}: position muss ja, nein, teils oder keine_aussage sein`)
    if (typeof e?.begruendung !== 'string' || e.begruendung.trim().length < 10) f.push(`${was}: begruendung fehlt (ein Satz: woran im Zitat die Einordnung hängt)`)
    if (e?.position !== 'keine_aussage') {
      const kf = e?.kurzfassung?.trim() ?? ''
      if (!kf) f.push(`${was}: kurzfassung fehlt`)
      else {
        const woerter = kf.split(/\s+/).length
        if (woerter > MAX_KURZFASSUNG_WOERTER) f.push(`${was}: kurzfassung hat ${woerter} Wörter, höchstens ${MAX_KURZFASSUNG_WOERTER}`)
        if (enthaeltParteinamen(kf) || /\[(Partei|Person|Land)\]/.test(kf)) f.push(`${was}: kurzfassung nennt eine Partei, Person oder ein Land – neutral ohne Subjekt formulieren („Will …“, „Lehnt … ab“)`)
      }
    }
  }
  for (const e of liste.eintraege) if (!gesehen.has(e.kennung)) f.push(`${e.kennung}: fehlt in der Antwort`)
  return f
}

type Json = Record<string, unknown>

/**
 * Schreibt die Positionen in die Haltungsdatei: Funde mit Einordnung als Position mit Zitat und Beleg-Link,
 * Funde ohne Zitat (und Einordnung `keine_aussage`) als „Keine Aussage“. Alles als ungeprüfter KI-Entwurf.
 */
export function positionenEintragen(k: Katalog, datei: Json, funde: HaltungFund[], kennungen: { kennung: string; partei_id: number }[], a: HaltungAntwort, heute: string): Json {
  return { ...datei, positionen: k.parteien.map((p) => positionAus(p, funde, kennungen, a, heute)) }
}

/**
 * Nachtrag einer neu aufgenommenen Partei: nur deren Position ergänzen (oder ersetzen), alle übrigen Positionen
 * bleiben unverändert – auch geprüfte. Reihenfolge nach Partei-ID.
 */
export function positionNachtragen(k: Katalog, datei: Json, parteiId: number, funde: HaltungFund[], kennungen: { kennung: string; partei_id: number }[], a: HaltungAntwort, heute: string): Json {
  const p = k.parteien.find((x) => x.id === parteiId)
  if (!p) throw new Error(`Partei ${parteiId} gibt es nicht`)
  const alt = ((datei.positionen as Json[] | undefined) ?? []).filter((x) => x.partei_id !== parteiId || x.land)
  const positionen = [...alt, positionAus(p, funde, kennungen, a, heute)].sort(
    (x, y) => (x.partei_id as number) - (y.partei_id as number) || String(x.land ?? '').localeCompare(String(y.land ?? '')),
  )
  return { ...datei, positionen }
}

function positionAus(p: Katalog['parteien'][number], funde: HaltungFund[], kennungen: { kennung: string; partei_id: number }[], a: HaltungAntwort, heute: string): Json {
  const nach = new Map(a.einordnungen.map((e) => [e.kennung, e]))
  {
    const fund = funde.find((f) => f.partei_id === p.id)
    if (!fund) throw new Error(`Kein Fund für ${p.kurzname}`)
    const kennung = kennungen.find((x) => x.partei_id === p.id)?.kennung
    const e = kennung ? nach.get(kennung) : undefined
    if (fund.zitat && !e) throw new Error(`Keine Einordnung für ${p.kurzname} (${kennung})`)
    if (!fund.zitat || e!.position === 'keine_aussage') {
      const begruendung = fund.zitat
        ? `Fundstelle S. ${fund.seite} äußert laut Einordnung ohne Parteinamen keine erkennbare Haltung zur Frage: ${e!.begruendung}`
        : fund.keine_aussage!
      return { partei_id: p.id, position: 'keine_aussage', begruendung, stand: heute, geprueft: false, ki_entwurf: true }
    }
    return {
      partei_id: p.id,
      position: e!.position,
      kurzfassung: e!.kurzfassung!.trim(),
      zitat: fund.zitat,
      beleg_programm_url: `${p.programm_url}#page=${fund.seite}`,
      stand: heute,
      geprueft: false,
      ki_entwurf: true,
    }
  }
}

/** Programme mit erkennbarer Position (Aufnahmekriterium: mindestens drei). */
export const erkennbar = (d: Json) => ((d.positionen as Json[] | undefined) ?? []).filter((p) => p.position !== 'keine_aussage').length
