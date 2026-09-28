import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { analysiereAsync } from '../logic/analyse'
import type { Ebenen } from '../logic/bewertung'
import { ABDECKUNG, LAENDER, LANDESPROGRAMME, MASSNAHMEN, PARTEIEN, THEMEN, URSACHEN } from './mock'
import type {
  AbdeckungEintrag,
  AnalyseAnfrage,
  AnalyseAntwort,
  Land,
  Landesprogramm,
  Massnahme,
  Partei,
  Thema,
  Ursache,
} from './types'

// Datenquelle der App: Supabase (Standard, wenn konfiguriert) oder die
// eingebauten Beispieldaten (VITE_DATENQUELLE=mock, z. B. für Offline-Demos).

export interface Daten {
  quelle: 'supabase' | 'mock'
  parteien: Partei[]
  themen: Thema[]
  ursachen: Ursache[]
  massnahmen: Massnahme[]
  /** Welche Themen je Partei erfasst sind – fehlt ein Eintrag, wird nicht gewertet. */
  abdeckung: AbdeckungEintrag[]
  /** Länder mit erfassten Landesprogrammen und die Programme der laufenden Wahlperiode. */
  laender: Land[]
  landesprogramme: Landesprogramm[]
  /** Geschlossene Testphase: KI-Entwürfe sind geladen und zählen (mit Hinweis am Ergebnis). */
  testphase?: boolean
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const NUR_MOCK = import.meta.env.VITE_DATENQUELLE === 'mock'

export const supabase: SupabaseClient | null =
  !NUR_MOCK && URL && KEY ? createClient(URL, KEY, { auth: { persistSession: false } }) : null

export const MOCK_DATEN: Daten = {
  quelle: 'mock',
  parteien: PARTEIEN,
  themen: THEMEN,
  ursachen: URSACHEN,
  massnahmen: MASSNAHMEN,
  abdeckung: ABDECKUNG,
  laender: LAENDER,
  landesprogramme: LANDESPROGRAMME,
}

/**
 * Fiktive Beispieldaten? Eingebaute Daten immer; aus Supabase, solange dort noch
 * die fiktiven Parteien (Platzhalter-Links) stehen – etwa bevor der echte Seed läuft.
 */
export const sindBeispieldaten = (d: Daten) =>
  d.quelle === 'mock' || d.parteien.some((p) => /^https:\/\/example\.(org|com|net)\//.test(p.programm_url))

export async function ladeDaten(): Promise<Daten> {
  if (!supabase) return MOCK_DATEN
  const [p, t, u, m, a, l, lp] = await Promise.all([
    supabase.from('parteien').select('*').order('id'),
    supabase.from('themen').select('*').order('id'),
    supabase.from('ursachen').select('*').order('id'),
    supabase.from('massnahmen').select('*').order('id'),
    supabase.from('abdeckung').select('*'),
    supabase.from('laender').select('*').order('name'),
    supabase.from('landesprogramme').select('*'),
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
  const { massnahmen, abdeckung } = data as { massnahmen: Massnahme[]; abdeckung: AbdeckungEintrag[] }
  return {
    ...daten,
    massnahmen: [...daten.massnahmen, ...massnahmen].sort((a, b) => a.id - b.id),
    abdeckung: [...daten.abdeckung, ...abdeckung],
    testphase: true,
  }
}

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
  if (daten.quelle === 'mock' || !supabase) {
    return analysiereAsync(anfrage.verlauf, daten.themen, daten.ursachen)
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
