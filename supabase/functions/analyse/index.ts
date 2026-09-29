// Edge Function `analyse`: ordnet eine Äußerung per KI (Mistral) ein und
// speichert abgeschlossene Runden anonym. Die KI vergibt keine Punkte und
// nennt keine Links – Punkte kommen deterministisch aus der Datenbank.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   MISTRAL_API_KEY            – Pflicht
//   MISTRAL_MODEL              – optional, Standard: mistral-small-latest
//   ERLAUBTE_URSPRUENGE        – optional, z. B. „https://politik-duell.de, https://politik-duell-*.vercel.app“;
//                                leer: Aufrufe von überall erlaubt
//   RATE_LIMIT_GLOBAL          – optional, Anfragen pro Stunde über alle Sitzungen (Standard: 600)
// Automatisch vorhanden: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'npm:@supabase/supabase-js@2'
import { bewertePartei, werteRunde } from '../_shared/bewertung.ts'
import { bereinigeAntwort, EingabeFehler, nutzerNachrichten, pruefeAnfrage, systemPrompt } from '../_shared/ki.ts'
import { pruefeText } from '../_shared/moderation.ts'
import { tokenHash } from '../_shared/pruefung.ts'
import type { AbdeckungEintrag, AnalyseAntwort, Landesprogramm, Massnahme, Partei, Rolle, Thema, Ursache } from '../_shared/typen.ts'
import {
  corsKoepfe,
  erlaubteUrspruenge,
  GLOBALE_SITZUNG,
  globalesLimit,
  RATE_LIMIT_GLOBAL,
  RATE_LIMIT_SITZUNG,
  ursprungErlaubt,
} from '../_shared/zugriff.ts'

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'
const MAX_ANFRAGE_BYTES = 8_000

const ERLAUBT = erlaubteUrspruenge(Deno.env.get('ERLAUBTE_URSPRUENGE'))
const GLOBAL_MAX = globalesLimit(Deno.env.get('RATE_LIMIT_GLOBAL'))

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

async function frageMistral(system: string, nachrichten: ReturnType<typeof nutzerNachrichten>): Promise<unknown> {
  const key = Deno.env.get('MISTRAL_API_KEY')
  if (!key) throw new Error('MISTRAL_API_KEY fehlt')
  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: Deno.env.get('MISTRAL_MODEL') ?? 'mistral-small-latest',
      temperature: 0.1,
      max_tokens: 400,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, ...nachrichten],
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`Mistral ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const daten = await res.json()
  return JSON.parse(daten.choices?.[0]?.message?.content ?? '{}')
}

async function lesJson(req: Request): Promise<unknown> {
  const text = await req.text()
  if (new TextEncoder().encode(text).length > MAX_ANFRAGE_BYTES) throw new EingabeFehler('Anfrage zu groß.')
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** Zählt eine Anfrage; false, wenn das Limit im Zeitfenster überschritten ist. */
async function imLimit(sitzung: string, max: number, fenster: string): Promise<boolean> {
  const { data, error } = await db.rpc('rate_limit_pruefen', { p_sitzung: sitzung, p_max: max, p_fenster: fenster })
  if (error) throw error
  return data === true
}

Deno.serve(async (req) => {
  const ursprung = req.headers.get('origin')
  const cors = corsKoepfe(ursprung, ERLAUBT)
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  if (!ursprungErlaubt(ursprung, ERLAUBT)) return json({ fehler: 'Aufruf von dieser Seite nicht erlaubt.' }, 403)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ fehler: 'Nur POST erlaubt.' }, 405)

  try {
    const anfrage = pruefeAnfrage(await lesJson(req))

    // Erst pro Sitzung, dann für alle zusammen (Kostendeckel für die KI).
    if (!(await imLimit(anfrage.sitzung, RATE_LIMIT_SITZUNG.max, RATE_LIMIT_SITZUNG.fenster)))
      return json({ fehler: 'Zu viele Anfragen. Bitte warte ein paar Minuten.' }, 429)
    if (!(await imLimit(GLOBALE_SITZUNG, GLOBAL_MAX, RATE_LIMIT_GLOBAL.fenster)))
      return json({ fehler: 'Gerade spielen sehr viele Leute. Bitte versuch es etwas später noch einmal.' }, 503)

    const [themenRes, ursachenRes, parteienRes] = await Promise.all([
      db.from('themen').select('id, name, beschreibung'),
      db.from('ursachen').select('*'),
      db.from('parteien').select('*'),
    ])
    if (themenRes.error) throw themenRes.error
    if (ursachenRes.error) throw ursachenRes.error
    if (parteienRes.error) throw parteienRes.error
    const themen = themenRes.data as Thema[]
    const ursachen = ursachenRes.data as Ursache[]
    const parteien = parteienRes.data as Partei[]

    const roh = await frageMistral(systemPrompt(themen, ursachen), nutzerNachrichten(anfrage.verlauf, anfrage.rolle))
    const antwort = bereinigeAntwort(roh, anfrage.verlauf, themen, ursachen, parteien)

    // Abgeschlossene Runde anonym speichern (nur die neutrale Zusammenfassung).
    if (antwort.typ !== 'forderung') {
      // Der Originaltext wird nur geprüft, nicht gespeichert.
      const original = anfrage.verlauf.filter((n) => n.von === 'spieler').map((n) => n.text)
      const testphase = anfrage.zugang ? await zugangGueltig(anfrage.zugang) : false
      await speichereRunde(antwort, anfrage.parteien, anfrage.rolle, anfrage.land, testphase, original, parteien, ursachen)
    }

    return json(antwort)
  } catch (e) {
    if (e instanceof EingabeFehler) return json({ fehler: e.message }, 400)
    console.error('analyse:', e instanceof Error ? e.message : e)
    return json({ fehler: 'Die Einordnung hat gerade nicht geklappt. Bitte versuch es noch einmal.' }, 502)
  }
})

/** Gültiger, nicht gesperrter Zugang zur Testphase? Dann zählen auch KI-Entwürfe. */
async function zugangGueltig(token: string): Promise<boolean> {
  const { data, error } = await db
    .from('testphase_zugaenge')
    .select('id')
    .eq('token_hash', await tokenHash(token))
    .eq('gesperrt', false)
    .maybeSingle()
  if (error) throw error
  return data !== null
}

async function speichereRunde(
  antwort: AnalyseAntwort,
  [parteiA, parteiB]: [number, number],
  rolle: Rolle | null,
  land: string | null,
  testphase: boolean,
  original: string[],
  parteien: Partei[],
  ursachen: Ursache[],
) {
  const stichwort = antwort.stichwort ?? null
  const basis = {
    problem_text: antwort.zusammenfassung,
    stichwort,
    // Automatischer Filter: Treffer landen in der Admin-Ansicht unter „Vom Filter gestoppt“.
    filter_grund: pruefeText(stichwort, antwort.zusammenfassung, ...original),
    partei_a: parteiA,
    partei_b: parteiB,
    testphase,
  }

  if (antwort.typ === 'wert') {
    await db.from('runden').insert({ ...basis, status: 'wert' })
    return
  }

  if (antwort.thema_id === null) {
    await Promise.all([
      db.from('runden').insert({ ...basis, status: 'ungeprueft' }),
      db.from('review_warteschlange').insert({
        problem_text: antwort.zusammenfassung,
        einschaetzung: antwort.einschaetzung ?? null,
      }),
    ])
    return
  }

  // Der Service-Key umgeht Row Level Security: KI-Entwürfe deshalb ausdrücklich nur in der Testphase.
  let mAbfrage = db.from('massnahmen').select('*').eq('thema_id', antwort.thema_id).in('partei_id', [parteiA, parteiB])
  let aAbfrage = db.from('abdeckung').select('*').eq('thema_id', antwort.thema_id).in('partei_id', [parteiA, parteiB])
  if (!testphase) {
    mAbfrage = mAbfrage.eq('ki_entwurf', false)
    aAbfrage = aAbfrage.eq('ki_entwurf', false)
  }
  const [mRes, aRes, lpRes] = await Promise.all([
    mAbfrage,
    aAbfrage,
    land
      ? db.from('landesprogramme').select('*').eq('land', land).in('partei_id', [parteiA, parteiB])
      : Promise.resolve({ data: [], error: null }),
  ])
  // Speichern ist Nebensache: Ein Fehler hier soll die Antwort an die App nicht verhindern.
  const fehler = mRes.error ?? aRes.error ?? lpRes.error
  if (fehler) {
    console.error('speichereRunde:', fehler.message)
    return
  }
  const massnahmen = mRes.data as Massnahme[]
  const abdeckung = aRes.data as AbdeckungEintrag[]
  const a = parteien.find((p) => p.id === parteiA)
  const b = parteien.find((p) => p.id === parteiB)
  if (!a || !b) return

  // Das Bundesland zählt nur für die Wertung; gespeichert wird es nicht.
  const ebenen = { land, ursachen, landesprogramme: lpRes.data as Landesprogramm[] }
  const ea = bewertePartei(a, antwort.thema_id, antwort.ursachen_ids, rolle, massnahmen, abdeckung, ebenen)
  const eb = bewertePartei(b, antwort.thema_id, antwort.ursachen_ids, rolle, massnahmen, abdeckung, ebenen)
  const { status } = werteRunde(ea, eb)
  // Gespeichert werden die Rundenpunkte (Summe über die Ursachen), nicht der Spielpunkt.
  // Ist das Thema für eine Partei noch nicht erfasst, gibt es keine Punkte.
  const punkte = status === 'gewertet' ? { punkte_a: ea.punkte, punkte_b: eb.punkte } : {}
  await db.from('runden').insert({ ...basis, thema_id: antwort.thema_id, status, ...punkte })
}
