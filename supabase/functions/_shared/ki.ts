import { EingabeFehler } from './fehler.ts'
import { bereinigeStichwort } from './moderation.ts'
import {
  ROLLEN_IDS,
  type AnalyseAnfrage,
  type AnalyseAntwort,
  type Nachricht,
  type Partei,
  type Rolle,
  type Thema,
  type Ursache,
} from './typen.ts'

// Prompt-Aufbau und strenge Prüfung der KI-Antwort. Reines TypeScript,
// damit es in der App getestet und in der Edge Function genutzt werden kann.

export const MAX_NACHFRAGEN = 2
export const MAX_NACHRICHTEN = 2 * MAX_NACHFRAGEN + 1
export const MAX_TEXTLAENGE = 500

const ROLLEN_TEXT: Record<Rolle, string> = {
  mieter: 'Mieter:in',
  eigentuemer: 'Eigentümer:in',
  angestellt: 'Angestellt',
  selbststaendig: 'Selbstständig',
  rentner: 'Rentner:in',
  arbeitslos: 'Arbeitslos',
  studierend: 'Studierend',
  vermoegend: 'Vermögend',
}

export function systemPrompt(themen: Thema[], ursachen: Ursache[]): string {
  const katalog = themen
    .map((t) => {
      const u = ursachen
        .filter((x) => x.thema_id === t.id)
        .map((x) => `    - Ursache ${x.id}: ${x.beschreibung}`)
        .join('\n')
      return `- Thema ${t.id}: ${t.name} – ${t.beschreibung}\n${u}`
    })
    .join('\n')

  return `Du moderierst das Spiel „Politik-Duell“. Spieler:innen nennen Alltagsprobleme.
Deine einzige Aufgabe: die Äußerung einordnen und einem Thema und Ursachen aus dem Katalog zuordnen.

Regeln:
- Neutral, respektvoll, freundlich. Keine Belehrung. Deutsch, kurze Sätze.
- Bewerte NIEMALS Parteien, Politiker:innen oder Maßnahmen. Nenne keine Parteien.
- Nenne NIEMALS Links, Quellen oder Zahlen aus Studien.
- Vergib keine Punkte.

Einordnung ("typ"):
- "problem": ein konkretes Alltagsproblem (z. B. „Ich finde keine bezahlbare Wohnung“).
- "forderung": eine politische Forderung ohne konkretes Alltagsproblem (z. B. „Weniger Steuern!“).
  Dann stelle in "nachfrage" genau eine kurze, freundliche Frage nach dem konkreten Alltagsproblem dahinter,
  z. B. „Was läuft in deinem Alltag konkret schief?“.
- "wert": eine persönliche Haltung oder ein Wert (z. B. „Mir ist Gerechtigkeit wichtig“), kein Problem.

Zuordnung (nur bei "problem"):
- "thema_id": die ID aus dem Katalog, die am besten passt, sonst null.
- "ursachen_ids": IDs der Ursachen dieses Themas, die zum geschilderten Problem passen. Wenn unklar: alle Ursachen des Themas.
- Passt kein Thema: "thema_id": null, "ursachen_ids": [] und in "einschaetzung" 1–2 neutrale Sätze zu möglichen
  Ursachen des Problems – ohne Parteien, ohne Lösungsbewertung, ohne Links.

"zusammenfassung": ein kurzer, neutraler Satz zum Problem, ohne Namen oder persönliche Details.
"stichwort": 1–3 Wörter, die das Problem neutral benennen (z. B. „Facharzttermin“, „Nebenkosten-Nachzahlung“),
  ohne Namen, Orte, Beleidigungen oder Wertungen.

Katalog:
${katalog}

Antworte ausschließlich mit einem JSON-Objekt:
{"typ": "problem" | "forderung" | "wert", "nachfrage": string | null, "thema_id": number | null,
 "ursachen_ids": number[], "zusammenfassung": string, "stichwort": string, "einschaetzung": string | null}`
}

export function nutzerNachrichten(verlauf: Nachricht[], rolle: Rolle | null) {
  const nachfragen = verlauf.filter((n) => n.von === 'ki').length
  const hinweis =
    `Rolle der Person: ${rolle ? ROLLEN_TEXT[rolle] : 'keine Angabe'}.` +
    (nachfragen >= MAX_NACHFRAGEN
      ? ' Es wurde bereits zweimal nachgefragt: Ordne jetzt als "problem" oder "wert" ein, nicht als "forderung".'
      : '')
  return [
    { role: 'system' as const, content: hinweis },
    ...verlauf.map((n) => ({
      role: n.von === 'spieler' ? ('user' as const) : ('assistant' as const),
      content: n.text,
    })),
  ]
}

// Hier weiter exportiert, damit bestehende Importe aus ki.ts gültig bleiben.
export { EingabeFehler }

const SITZUNG_MUSTER = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Prüft die Anfrage der App. Wirft EingabeFehler bei ungültigen Daten. */
export function pruefeAnfrage(roh: unknown): AnalyseAnfrage {
  const a = roh as Partial<AnalyseAnfrage> | null
  if (!a || typeof a !== 'object') throw new EingabeFehler('Anfrage fehlt.')
  // Nur zufällige UUIDs (Version 4, wie crypto.randomUUID). Damit kann die App
  // nicht die feste ID des globalen Rate-Limits (siehe zugriff.ts) verwenden.
  if (typeof a.sitzung !== 'string' || !SITZUNG_MUSTER.test(a.sitzung)) throw new EingabeFehler('Ungültige Sitzung.')
  if (!Array.isArray(a.verlauf) || a.verlauf.length === 0 || a.verlauf.length > MAX_NACHRICHTEN)
    throw new EingabeFehler('Ungültiger Verlauf.')
  for (const n of a.verlauf) {
    if (!n || (n.von !== 'spieler' && n.von !== 'ki') || typeof n.text !== 'string')
      throw new EingabeFehler('Ungültige Nachricht.')
    if (n.text.trim().length === 0 || n.text.length > MAX_TEXTLAENGE) throw new EingabeFehler('Text zu lang oder leer.')
  }
  if (a.verlauf[a.verlauf.length - 1].von !== 'spieler') throw new EingabeFehler('Letzte Nachricht muss vom Spieler sein.')
  if (a.rolle !== null && a.rolle !== undefined && !ROLLEN_IDS.includes(a.rolle)) throw new EingabeFehler('Ungültige Rolle.')
  if (
    !Array.isArray(a.parteien) ||
    a.parteien.length !== 2 ||
    !a.parteien.every((p) => Number.isInteger(p)) ||
    a.parteien[0] === a.parteien[1]
  )
    throw new EingabeFehler('Ungültige Parteien.')
  // Bundesland nur als Kürzel; es zählt nur für die Wertung und wird nicht gespeichert.
  if (a.land !== null && a.land !== undefined && (typeof a.land !== 'string' || !/^[A-Z]{2}$/.test(a.land)))
    throw new EingabeFehler('Ungültiges Bundesland.')
  // Zugang zur Testphase: nur das Format prüfen; ob er gültig ist, entscheidet die Datenbank.
  if (a.zugang !== null && a.zugang !== undefined && (typeof a.zugang !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(a.zugang)))
    throw new EingabeFehler('Ungültiger Zugang zur Testphase.')
  return {
    sitzung: a.sitzung, verlauf: a.verlauf, rolle: a.rolle ?? null, land: a.land ?? null, zugang: a.zugang ?? null, parteien: a.parteien,
  }
}

const regexText = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Ersetzt Parteinamen durch „[Partei]“. Gespeicherte Kurzfassungen, Stichwörter
 * und Einschätzungen sollen keiner Partei etwas zuschreiben – Aussagen über
 * Parteien kommen nur belegt aus der Datenbank.
 * Groß-/Kleinschreibung zählt, damit z. B. „die linke Hand“ unberührt bleibt;
 * erkannt werden auch GROSS geschriebene Namen, Endungen wie „Grünen“ und ein
 * vorangestellter Artikel („die Grünen“ → „[Partei]“).
 */
export function ohneParteinamen(text: string, parteien: Pick<Partei, 'name' | 'kurzname'>[]): string {
  const namen = new Set<string>()
  for (const p of parteien) {
    for (const n of [p.name, p.kurzname, ...p.kurzname.split('/')]) {
      const t = n.trim()
      if (t.length >= 2) namen.add(t).add(t.toUpperCase())
    }
  }
  if (namen.size === 0) return text
  // Längere Namen zuerst, damit „Partei Alpha“ vor „Alpha“ greift.
  const alternativen = [...namen].sort((a, b) => b.length - a.length).map(regexText).join('|')
  const muster = new RegExp(`(?:(?<!\\p{L})[Dd](?:ie|er|en|em|es)\\s+)?(?<![\\p{L}\\d])(?:${alternativen})(?:n|en|s)?(?![\\p{L}\\d])`, 'gu')
  return text.replace(muster, '[Partei]')
}

const kurz = (s: unknown, max: number) => (typeof s === 'string' ? s.trim().replace(/\s+/g, ' ').slice(0, max) : '')

/**
 * Macht aus der (nicht vertrauenswürdigen) KI-Antwort eine gültige AnalyseAntwort:
 * nur IDs aus dem Katalog, höchstens zwei Nachfragen, keine Links, keine Parteinamen.
 */
export function bereinigeAntwort(
  roh: unknown,
  verlauf: Nachricht[],
  themen: Thema[],
  ursachen: Ursache[],
  parteien: Pick<Partei, 'name' | 'kurzname'>[] = [],
): AnalyseAntwort {
  const r = (roh && typeof roh === 'object' ? roh : {}) as Record<string, unknown>
  const nachfragen = verlauf.filter((n) => n.von === 'ki').length
  const letzterText = verlauf.filter((n) => n.von === 'spieler').at(-1)?.text ?? ''
  const ohneLinks = (s: string) => ohneParteinamen(s.replace(/(https?:\/\/|www\.)\S+/gi, ''), parteien).trim()

  let typ: AnalyseAntwort['typ'] = r.typ === 'forderung' || r.typ === 'wert' ? r.typ : 'problem'
  let nachfrage = ohneLinks(kurz(r.nachfrage, 200))
  if (typ === 'forderung' && (nachfragen >= MAX_NACHFRAGEN || !nachfrage)) {
    if (nachfragen >= MAX_NACHFRAGEN) typ = 'problem'
    else nachfrage = 'Was läuft in deinem Alltag konkret schief?'
  }

  const zusammenfassung = ohneLinks(kurz(r.zusammenfassung, 200)) || ohneLinks(kurz(letzterText, 120))
  // Im Stichwort wird ein Parteiname ganz entfernt; bleibt nichts übrig, greift die Zusammenfassung.
  const stichwortRoh = typeof r.stichwort === 'string' ? ohneLinks(r.stichwort).replace(/\[Partei\]/g, '').trim() : ''
  const stichwort = bereinigeStichwort(stichwortRoh, zusammenfassung.replace(/\[Partei\]/g, ''))

  if (typ !== 'problem') {
    return {
      typ,
      nachfrage: typ === 'forderung' ? nachfrage : null,
      thema_id: null,
      ursachen_ids: [],
      zusammenfassung,
      stichwort,
      einschaetzung: null,
    }
  }

  const thema = themen.find((t) => t.id === Number(r.thema_id)) ?? null
  if (!thema) {
    return {
      typ,
      nachfrage: null,
      thema_id: null,
      ursachen_ids: [],
      zusammenfassung,
      stichwort,
      einschaetzung: ohneLinks(kurz(r.einschaetzung, 400)) || null,
    }
  }

  const erlaubt = ursachen.filter((u) => u.thema_id === thema.id).map((u) => u.id)
  const genannt = Array.isArray(r.ursachen_ids) ? r.ursachen_ids.map(Number).filter((id) => erlaubt.includes(id)) : []
  return {
    typ,
    nachfrage: null,
    thema_id: thema.id,
    ursachen_ids: genannt.length > 0 ? [...new Set(genannt)] : erlaubt,
    zusammenfassung,
    stichwort,
    einschaetzung: null,
  }
}
