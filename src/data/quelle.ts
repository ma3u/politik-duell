import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { antwortAusAuswahl } from '../../supabase/functions/_shared/ki.ts'
import { analysiereAsync } from '../logic/analyse'
import type { Ebenen } from '../logic/bewertung'
import { vollstaendigeHaltungen } from '../../supabase/functions/_shared/haltung.ts'
import {
  ABDECKUNG,
  HALTUNG_POSITIONEN,
  HALTUNGEN,
  INSTRUMENTE,
  LAENDER,
  LANDESPROGRAMME,
  MASSNAHMEN,
  PARTEIEN,
  THEMEN,
  URSACHEN,
  ZIELKONFLIKTE,
} from './mock'
import type {
  AbdeckungEintrag,
  AnalyseAnfrage,
  AnalyseAntwort,
  HaltungEintrag,
  HaltungPosition,
  InstrumentEintrag,
  Land,
  Landesprogramm,
  Massnahme,
  Partei,
  Thema,
  Ursache,
  Zielkonflikt,
} from './types'

// Datenquelle der App: Supabase (Standard, wenn konfiguriert), die eingebauten
// Beispieldaten (VITE_DATENQUELLE=mock, z. B. für Offline-Demos) oder der echte
// Katalog aus `daten/` ohne Datenbank (VITE_DATENQUELLE=katalog, src/data/echt.ts).

export interface Daten {
  quelle: 'supabase' | 'mock' | 'katalog'
  parteien: Partei[]
  themen: Thema[]
  ursachen: Ursache[]
  massnahmen: Massnahme[]
  /** Welche Themen je Partei erfasst sind – fehlt ein Eintrag, wird nicht gewertet. */
  abdeckung: AbdeckungEintrag[]
  /** Länder mit erfassten Landesprogrammen und die Programme der laufenden Wahlperiode. */
  laender: Land[]
  landesprogramme: Landesprogramm[]
  /** Lösungswege, die mehrere Programme vorschlagen – Grundlage der Forderungskarte (ohne Punkte). */
  instrumente: InstrumentEintrag[]
  /**
   * Wertfragen für die Haltungskarte mit den Positionen der Parteien (Zitat, Beleg) und den Zielkonflikten –
   * ohne Punkte. Eine Karte gibt es nur, wenn alle Parteien eine Position haben (`vollstaendigeHaltungen`).
   */
  haltungen: HaltungEintrag[]
  haltungPositionen: HaltungPosition[]
  zielkonflikte: Zielkonflikt[]
  /** Geschlossene Testphase: KI-Entwürfe sind geladen und zählen (mit Hinweis am Ergebnis). */
  testphase?: boolean
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const DATENQUELLE = import.meta.env.VITE_DATENQUELLE as string | undefined
const OHNE_DATENBANK = DATENQUELLE === 'mock' || DATENQUELLE === 'katalog'

export const supabase: SupabaseClient | null =
  !OHNE_DATENBANK && URL && KEY ? createClient(URL, KEY, { auth: { persistSession: false } }) : null

export const MOCK_DATEN: Daten = {
  quelle: 'mock',
  parteien: PARTEIEN,
  themen: THEMEN,
  ursachen: URSACHEN,
  massnahmen: MASSNAHMEN,
  abdeckung: ABDECKUNG,
  laender: LAENDER,
  landesprogramme: LANDESPROGRAMME,
  instrumente: INSTRUMENTE,
  haltungen: HALTUNGEN,
  haltungPositionen: HALTUNG_POSITIONEN,
  zielkonflikte: ZIELKONFLIKTE,
}

/**
 * Fiktive Beispieldaten? Eingebaute Daten immer; aus Supabase, solange dort noch
 * die fiktiven Parteien (Platzhalter-Links) stehen – etwa bevor der echte Seed läuft.
 */
export const sindBeispieldaten = (d: Daten) =>
  d.quelle === 'mock' || d.parteien.some((p) => /^https:\/\/example\.(org|com|net)\//.test(p.programm_url))

export async function ladeDaten(): Promise<Daten> {
  // Eigener Chunk: Der ganze Katalog lädt nur in dieser Fassung mit.
  if (DATENQUELLE === 'katalog') return (await import('./echt.ts')).ECHTE_DATEN
  if (!supabase) return MOCK_DATEN
  const [p, t, u, m, a, l, lp, ins, h, hp, zk] = await Promise.all([
    supabase.from('parteien').select('*').order('id'),
    supabase.from('themen').select('*').order('id'),
    supabase.from('ursachen').select('*').order('id'),
    supabase.from('massnahmen').select('*').order('id'),
    supabase.from('abdeckung').select('*'),
    supabase.from('laender').select('*').order('name'),
    supabase.from('landesprogramme').select('*'),
    supabase.from('instrumente').select('*').order('id'),
    supabase.from('haltungen').select('*').order('id'),
    supabase.from('haltung_positionen').select('*').order('partei_id'),
    supabase.from('haltung_zielkonflikte').select('haltung_id, seite, text, quelle_url').order('id'),
  ])
  const fehler = p.error ?? t.error ?? u.error ?? m.error
  if (fehler) throw new Error(fehler.message)
  // Ohne Abdeckung ließe sich „nichts im Programm“ nicht von „noch nicht erfasst“ unterscheiden.
  if (a.error) throw new Error(`Tabelle „abdeckung“ fehlt – Migration 20260928000000_abdeckung.sql ausführen (${a.error.message})`)
  if (!p.data?.length) throw new Error('Die Datenbank enthält noch keine Parteien.')
  return {
    quelle: 'supabase',
    parteien: p.data as Partei[],
    themen: t.data as Thema[],
    ursachen: u.data as Ursache[],
    massnahmen: m.data as Massnahme[],
    abdeckung: a.data as AbdeckungEintrag[],
    // Fehlen die Tabellen (Migration 20261001000000_laender.sql noch nicht ausgeführt),
    // gibt es keine Bundesland-Auswahl – gewertet wird dann nur mit Bundesprogrammen.
    laender: l.error ? [] : (l.data as Land[]),
    landesprogramme: lp.error ? [] : (lp.data as Landesprogramm[]),
    // Fehlt die Tabelle (Migration 20261007000000_instrumente.sql noch nicht ausgeführt), gibt es keine Forderungskarte.
    instrumente: ins.error ? [] : (ins.data as InstrumentEintrag[]),
    // Fehlen die Tabellen (Migration 20261009000000_haltungen.sql noch nicht ausgeführt), gibt es keine Haltungskarte.
    haltungen: h.error || hp.error || zk.error ? [] : (h.data as HaltungEintrag[]),
    haltungPositionen: h.error || hp.error || zk.error ? [] : (hp.data as HaltungPosition[]),
    zielkonflikte: h.error || hp.error || zk.error ? [] : (zk.data as Zielkonflikt[]),
  }
}

// ---------------------------------------------------------------------------
// Geschlossene Testphase: Wer einen Zugangslink (#/testphase/<token>) hat, sieht
// zusätzlich KI-Entwürfe. Der Token bleibt in diesem Browser gespeichert, bis
// „Testphase verlassen“ gewählt wird; die Datenbank kennt nur seinen Hash.
// ---------------------------------------------------------------------------

const ZUGANG_SCHLUESSEL = 'pd-testphase'
const TOKEN_MUSTER = /^[A-Za-z0-9_-]{43}$/

export function gespeicherterZugang(): string | null {
  try {
    const t = localStorage.getItem(ZUGANG_SCHLUESSEL)
    return t && TOKEN_MUSTER.test(t) ? t : null
  } catch {
    return null
  }
}

export function speichereZugang(token: string | null) {
  try {
    if (token && TOKEN_MUSTER.test(token)) localStorage.setItem(ZUGANG_SCHLUESSEL, token)
    else localStorage.removeItem(ZUGANG_SCHLUESSEL)
  } catch {
    // Ohne Speicher gilt der Zugang nur bis zum Neuladen – nichts zu tun.
  }
}

export class ZugangUngueltig extends Error {}

/** Lädt die KI-Entwürfe dazu. Wirft ZugangUngueltig bei unbekanntem oder gesperrtem Zugang. */
export async function mitTestphase(daten: Daten, token: string): Promise<Daten> {
  if (!supabase || daten.quelle !== 'supabase') return daten
  const { data, error } = await supabase.rpc('testphase_daten', { p_token: token })
  if (error) throw new Error(error.message)
  if (!data) throw new ZugangUngueltig('Dieser Zugang zur Testphase ist nicht (mehr) gültig.')
  const { massnahmen, abdeckung, instrumente, haltung_positionen } = data as {
    massnahmen: Massnahme[]
    abdeckung: AbdeckungEintrag[]
    /** Fehlt bei einer Datenbank ohne Migration 20261007000000_instrumente.sql. */
    instrumente?: InstrumentEintrag[]
    /** Fehlt bei einer Datenbank ohne Migration 20261009000000_haltungen.sql. */
    haltung_positionen?: HaltungPosition[]
  }
  return {
    ...daten,
    massnahmen: [...daten.massnahmen, ...massnahmen].sort((a, b) => a.id - b.id),
    abdeckung: [...daten.abdeckung, ...abdeckung],
    instrumente: [...daten.instrumente, ...(instrumente ?? [])].sort((a, b) => a.id - b.id),
    haltungPositionen: [...daten.haltungPositionen, ...(haltung_positionen ?? [])],
    testphase: true,
  }
}

/** Haltungen mit vollständiger Karte (alle Parteien erfasst) – nur sie zeigt die App, nur ihnen ordnet die KI zu. */
export const kartenHaltungen = (d: Daten): HaltungEintrag[] => vollstaendigeHaltungen(d.haltungen, d.haltungPositionen, d.parteien)

/** Länder, für die schon Landesprogramme ausgewertet sind – nur sie stehen zur Wahl. */
export const waehlbareLaender = (d: Daten): Land[] =>
  d.laender.filter((l) => d.abdeckung.some((a) => a.land === l.id))

/** Zuständigkeiten für die Wertung (siehe bewertePartei). */
export const ebenenFuer = (d: Daten, land: string | null): Ebenen => ({
  land,
  ursachen: d.ursachen,
  landesprogramme: d.landesprogramme,
})

/** Zufällige Sitzungs-ID nur für das Rate-Limit – ohne Bezug zu einer Person. */
let sitzungImSpeicher: string | null = null
function sitzung(): string {
  try {
    const vorhanden = sessionStorage.getItem('wl-sitzung')
    if (vorhanden) return vorhanden
    const neu = crypto.randomUUID()
    sessionStorage.setItem('wl-sitzung', neu)
    return neu
  } catch {
    sitzungImSpeicher ??= crypto.randomUUID()
    return sitzungImSpeicher
  }
}

export class AnalyseFehler extends Error {}

export async function analysiere(
  daten: Daten,
  anfrage: Omit<AnalyseAnfrage, 'sitzung'>,
): Promise<AnalyseAntwort> {
  if (daten.quelle !== 'supabase' || !supabase) {
    if (anfrage.auswahl) return antwortAusAuswahl(anfrage.auswahl, daten.themen, daten.ursachen)
    return analysiereAsync(anfrage.verlauf, daten.themen, daten.ursachen, {
      instrumente: daten.instrumente,
      massnahmen: daten.massnahmen,
      land: anfrage.land,
      haltungen: kartenHaltungen(daten),
    })
  }
  const zugang = daten.testphase ? gespeicherterZugang() : null
  const { data, error } = await supabase.functions.invoke<AnalyseAntwort>('analyse', {
    body: { ...anfrage, sitzung: sitzung(), ...(zugang ? { zugang } : {}) },
  })
  if (error) {
    // Fehlertext der Funktion anzeigen, wenn vorhanden.
    let text = 'Die Einordnung hat gerade nicht geklappt. Bitte versuch es noch einmal.'
    const antwort = (error as { context?: Response }).context
    try {
      const body = await antwort?.json()
      if (body?.fehler) text = body.fehler
    } catch {
      // Antwort ohne JSON – Standardtext behalten.
    }
    // Fehlercode anhängen, damit sich die Ursache ohne Browser-Konsole eingrenzen lässt.
    const code = antwort instanceof Response ? antwort.status : 'Netzwerk'
    throw new AnalyseFehler(`${text} (Fehlercode ${code})`)
  }
  if (!data) throw new AnalyseFehler('Leere Antwort von der Einordnung.')
  return data
}
