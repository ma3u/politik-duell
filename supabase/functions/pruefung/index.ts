// Edge Function `pruefung`: Eingeladene Prüfende laden und speichern ihre
// Bewertungen über einen persönlichen Link (#/pruefen/<token>). Zugang nur
// mit gültigem, nicht gesperrtem Token; geprüft über den SHA-256-Hash.
// Ablauf und Regeln: docs/plan-pruefung.md, daten/README.md → „Prüfung“.
//
// Secrets: ERLAUBTE_URSPRUENGE wie bei `analyse` (optional).
// Automatisch vorhanden: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'npm:@supabase/supabase-js@2'
import { EingabeFehler } from '../_shared/fehler.ts'
import { bearbeitePruefung, pruefePruefAnfrage, type GespeicherteBewertung, type MassnahmenJeThema, type PruefSpeicher } from '../_shared/pruefung.ts'
import { corsKoepfe, erlaubteUrspruenge, ursprungErlaubt } from '../_shared/zugriff.ts'

const MAX_ANFRAGE_BYTES = 64_000

const ERLAUBT = erlaubteUrspruenge(Deno.env.get('ERLAUBTE_URSPRUENGE'))

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

const pruefe = <T>({ data, error }: { data: T; error: { message: string } | null }): T => {
  if (error) throw new Error(error.message)
  return data
}

const speicher: PruefSpeicher = {
  async imLimit(schluessel, max, fenster) {
    return pruefe(await db.rpc('rate_limit_pruefen', { p_sitzung: schluessel, p_max: max, p_fenster: fenster })) === true
  },
  async einladung(hash) {
    return pruefe(
      await db
        .from('pruef_einladungen')
        .select('id, name, themen, gesperrt, einwilligung_am, name_oeffentlich')
        .eq('token_hash', hash)
        .maybeSingle(),
    )
  },
  async bewertungen(id) {
    return pruefe(
      await db
        .from('pruef_bewertungen')
        .select('massnahme_id, thema_id, wirksamkeit, umsetzbarkeit, notiz, empfehlung_gesehen, nach_empfehlung_geaendert, abgesendet')
        .eq('einladung_id', id),
    ) as GespeicherteBewertung[]
  },
  async einwilligen(id, nameOeffentlich) {
    pruefe(
      await db
        .from('pruef_einladungen')
        .update({ einwilligung_am: new Date().toISOString(), name_oeffentlich: nameOeffentlich })
        .eq('id', id),
    )
  },
  async speichern(id, zeilen) {
    const jetzt = new Date().toISOString()
    pruefe(
      await db
        .from('pruef_bewertungen')
        .upsert(zeilen.map((z) => ({ ...z, einladung_id: id, aktualisiert: jetzt })), { onConflict: 'einladung_id,massnahme_id' }),
    )
  },
  async absenden(id, themaId) {
    pruefe(
      await db
        .from('pruef_bewertungen')
        .update({ abgesendet: true, aktualisiert: new Date().toISOString() })
        .eq('einladung_id', id)
        .eq('thema_id', themaId),
    )
  },
  async widerrufen(id) {
    pruefe(await db.from('pruef_bewertungen').delete().eq('einladung_id', id))
    pruefe(await db.from('pruef_einladungen').update({ einwilligung_am: null, name_oeffentlich: false }).eq('id', id))
  },
}

// Prüfeinheiten je Thema (Tabelle `pruef_einheiten`, geschrieben vom Seed) – eine Minute
// zwischengespeichert. So gelten neue Daten ohne neues Deploy der Function.
let einheiten: { stand: number; jeThema: MassnahmenJeThema } | null = null
async function pruefEinheiten(): Promise<MassnahmenJeThema> {
  if (einheiten && Date.now() - einheiten.stand < 60_000) return einheiten.jeThema
  const zeilen = pruefe(await db.from('pruef_einheiten').select('id, thema_id').limit(100_000)) as { id: number; thema_id: number }[]
  const jeThema: Record<number, number[]> = {}
  for (const z of zeilen) (jeThema[z.thema_id] ??= []).push(z.id)
  einheiten = { stand: Date.now(), jeThema }
  return jeThema
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

Deno.serve(async (req) => {
  const ursprung = req.headers.get('origin')
  const cors = corsKoepfe(ursprung, ERLAUBT)
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  if (!ursprungErlaubt(ursprung, ERLAUBT)) return json({ fehler: 'Aufruf von dieser Seite nicht erlaubt.' }, 403)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ fehler: 'Nur POST erlaubt.' }, 405)

  try {
    const anfrage = pruefePruefAnfrage(await lesJson(req))
    const { status, body } = await bearbeitePruefung(anfrage, speicher, await pruefEinheiten())
    return json(body, status)
  } catch (e) {
    if (e instanceof EingabeFehler) return json({ fehler: e.message }, 400)
    // Keine Tokens oder Namen ins Log.
    console.error('pruefung:', e instanceof Error ? e.message : 'unbekannter Fehler')
    return json({ fehler: 'Speichern hat gerade nicht geklappt. Bitte gleich noch einmal versuchen.' }, 502)
  }
})
