import { EingabeFehler } from './fehler.ts'
import { bereinigeStichwort, pruefeText } from './moderation.ts'
import {
  MAX_AUSWAHL,
  ROLLEN_IDS,
  type AnalyseAnfrage,
  type AnalyseAntwort,
  type Nachricht,
  type Partei,
  type Rolle,
  type Thema,
  type Ursache,
  type UrsachenAuswahl,
} from './typen.ts'

// Prompt-Aufbau und strenge Prüfung der KI-Antwort. Reines TypeScript,
// damit es in der App getestet und in der Edge Function genutzt werden kann.

export const MAX_NACHFRAGEN = 2
export const MAX_NACHRICHTEN = 2 * MAX_NACHFRAGEN + 1
export const MAX_TEXTLAENGE = 500
/** Ergänzte Frage, wenn die KI eine Forderung nur wiedergibt, ohne nachzufragen. */
export const NACHFRAGE_FORDERUNG = 'Was soll sich dadurch in deinem Alltag ändern?'
/** Nachfrage, wenn das Thema klar ist, aber keine Ursache erkennbar. */
export const NACHFRAGE_URSACHE = 'Was genau macht dir dabei Sorgen? Beschreib kurz, woran es in deinem Alltag hakt.'

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
  Dann gib die Forderung in "nachfrage" in einem neutralen Halbsatz wieder und stelle danach immer genau eine
  kurze, freundliche Frage nach dem Alltag dahinter, z. B. „Du möchtest weniger Steuern zahlen. Was soll sich
  dadurch in deinem Alltag ändern?“. Die Wiedergabe allein reicht nie – "nachfrage" endet immer mit der Frage.
  Gib die Forderung nur wieder, wenn das ohne Wertung geht, sonst nur die Frage.
  Setze "thema_id" auf das Thema aus dem Katalog, zu dem die Forderung gehört, sonst null; "ursachen_ids": [].
- "wert": eine persönliche Haltung oder ein Wert (z. B. „Mir ist Gerechtigkeit wichtig“), kein Problem.
  Dann "thema_id": null und "ursachen_ids": [], und in "rueckmeldung" 1–2 kurze Sätze: die Haltung in eigenen
  Worten neutral aufgreifen, sagen, dass man darüber verschieden denken kann, und fragen, wo sie der Person im
  Alltag begegnet – z. B. „Heimat ist dir wichtig – darüber kann man verschieden denken. Wo begegnet dir das im
  Alltag?“. Stimme nicht zu und widersprich nicht. Wertet die Haltung eine Gruppe von Menschen ab, gib sie nicht
  wieder und frag nur nach dem Alltag.
- Ein pauschales Urteil über eine Gruppe von Menschen (z. B. „Die Ausländer sind alle kriminell“, „Rentner sind …“)
  ist weder Problem noch Wert: Ordne es als "forderung" mit "pauschal": true und "thema_id": null ein und frage
  nach dem Alltag dahinter, z. B. „Was hast du selbst erlebt, oder wo fühlst du dich unsicher?“.
  Widersprich nicht, belehre nicht, wiederhole das Urteil nicht und übernimm es nicht in "nachfrage",
  "zusammenfassung" oder "stichwort".
  Sonst ist "pauschal" immer false.

Sonst ist "rueckmeldung" null (Ausnahme: abschließende Forderung, siehe Hinweis im Gespräch).

Zuordnung (nur bei "problem"):
- "thema_id": die ID aus dem Katalog, die am besten passt, sonst null.
- "ursachen_ids": nur die IDs der Ursachen dieses Themas, die sich aus der Schilderung erkennen lassen.
  Nimm keine Ursache dazu, nur weil sie zum Thema gehört – jede zugeordnete Ursache zählt in der Wertung.
- Unterscheide Erlebnis und Gefühl: Schildert jemand vor allem ein Gefühl oder eine Sorge (z. B. „Ich fühle mich
  unsicher, seit …“), passen Ursachen, die beschreiben, wie Wahrnehmung und Wirklichkeit auseinanderfallen oder wo
  sich Unsicherheit ballt. Ursachen zu Taten oder Tätergruppen nur, wenn die Schilderung sie erkennen lässt.
- Lässt sich keine Ursache erkennen: "thema_id" wie erkannt, "ursachen_ids": [] und in "nachfrage" genau eine
  kurze, freundliche Frage, woran es im Alltag konkret hakt, z. B. „Was genau macht dir dabei Sorgen?“.
  Gib keine Antworten vor.
- Passt kein Thema: "thema_id": null, "ursachen_ids": [] und in "einschaetzung" 1–2 neutrale Sätze zu möglichen
  Ursachen des Problems – ohne Parteien, ohne Lösungsbewertung, ohne Links.

"zusammenfassung": ein kurzer, neutraler Satz zum Problem, ohne Namen oder persönliche Details.
"stichwort": 1–3 Wörter, die das Problem neutral benennen (z. B. „Facharzttermin“, „Nebenkosten-Nachzahlung“),
  ohne Namen, Orte, Beleidigungen oder Wertungen.

Katalog:
${katalog}

Antworte ausschließlich mit einem JSON-Objekt:
{"typ": "problem" | "forderung" | "wert", "nachfrage": string | null, "thema_id": number | null,
 "ursachen_ids": number[], "pauschal": boolean, "zusammenfassung": string, "stichwort": string,
 "einschaetzung": string | null, "rueckmeldung": string | null}`
}

export function nutzerNachrichten(verlauf: Nachricht[], rolle: Rolle | null) {
  const nachfragen = verlauf.filter((n) => n.von === 'ki').length
  const hinweis =
    `Rolle der Person: ${rolle ? ROLLEN_TEXT[rolle] : 'keine Angabe'}.` +
    (nachfragen >= MAX_NACHFRAGEN
      ? ' Es wurde bereits zweimal nachgefragt: Ordne jetzt abschließend ein und stelle keine Nachfrage mehr.' +
        ' Bleibt es bei einer Forderung ohne Alltagsproblem, ordne sie als "forderung" ein und schreib in' +
        ' "rueckmeldung" 1–2 kurze Sätze: die Forderung neutral aufgreifen, sagen, dass hier Lösungen für' +
        ' konkrete Alltagsprobleme gewertet werden, und zu einem solchen Problem einladen.' +
        ' Wähle nur Ursachen, die sich aus dem Gesagten erkennen lassen.'
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
  const auswahl = pruefeAuswahl(a.auswahl)
  // Mit Auswahl fragt die Funktion keine KI; ein Verlauf ist dann nicht nötig.
  if (!Array.isArray(a.verlauf) || (a.verlauf.length === 0 && !auswahl) || a.verlauf.length > MAX_NACHRICHTEN)
    throw new EingabeFehler('Ungültiger Verlauf.')
  for (const n of a.verlauf) {
    if (!n || (n.von !== 'spieler' && n.von !== 'ki') || typeof n.text !== 'string')
      throw new EingabeFehler('Ungültige Nachricht.')
    if (n.text.trim().length === 0 || n.text.length > MAX_TEXTLAENGE) throw new EingabeFehler('Text zu lang oder leer.')
  }
  if (!auswahl && a.verlauf[a.verlauf.length - 1].von !== 'spieler')
    throw new EingabeFehler('Letzte Nachricht muss vom Spieler sein.')
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
    auswahl,
  }
}

/** Form der angetippten Ursachen prüfen; ob sie zum Katalog passen, prüft antwortAusAuswahl. */
function pruefeAuswahl(roh: unknown): UrsachenAuswahl | null {
  if (roh === null || roh === undefined) return null
  const w = roh as Partial<UrsachenAuswahl>
  const ids = w.ursachen_ids
  if (
    typeof w !== 'object' ||
    !Number.isInteger(w.thema_id) ||
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.length > MAX_AUSWAHL ||
    !ids.every((id) => Number.isInteger(id)) ||
    new Set(ids).size !== ids.length
  )
    throw new EingabeFehler(`Ungültige Auswahl (1 bis ${MAX_AUSWAHL} Ursachen eines Themas).`)
  return { thema_id: w.thema_id as number, ursachen_ids: ids }
}

/**
 * Antwort für angetippte Ursachen – ohne KI. Gewertet wird wie bei einer Zuordnung durch die KI.
 * Die Zusammenfassung nennt nur Thema und Anzahl (die Ursachen zeigt die Auflösung):
 * Der Text der Person wird nicht gespeichert.
 */
export function antwortAusAuswahl(auswahl: UrsachenAuswahl, themen: Thema[], ursachen: Ursache[]): AnalyseAntwort {
  const thema = themen.find((t) => t.id === auswahl.thema_id)
  const passt = auswahl.ursachen_ids.every((id) => ursachen.some((u) => u.id === id && u.thema_id === auswahl.thema_id))
  if (!thema || !passt) throw new EingabeFehler('Diese Ursachen gehören nicht zu diesem Thema.')
  const n = auswahl.ursachen_ids.length
  return {
    typ: 'problem',
    nachfrage: null,
    thema_id: thema.id,
    ursachen_ids: [...auswahl.ursachen_ids],
    zusammenfassung: kurz(`${thema.name}: ${n === 1 ? 'eine Ursache' : `${n} Ursachen`} angetippt`, 200),
    stichwort: bereinigeStichwort(thema.name, thema.name),
    einschaetzung: null,
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

/**
 * Rückmeldung der KI auf eine Haltung oder abschließende Forderung. Im Zweifel null – dann zeigt die
 * App einen festen Satz: bei einem Parteinamen (die KI soll keine Partei nennen), bei einem Treffer des
 * Moderationsfilters (etwa wenn eine abwertende Äußerung wiedergegeben wird) und wenn der Text zu kurz
 * oder so lang ist, dass er mitten im Satz abgeschnitten würde.
 */
export const MAX_RUECKMELDUNG = 240
function bereinigeRueckmeldung(roh: unknown, ohneLinks: (s: string) => string): string | null {
  const text = ohneLinks(kurz(roh, MAX_RUECKMELDUNG + 1))
  if (text.length < 10 || text.length > MAX_RUECKMELDUNG || text.includes('[Partei]') || pruefeText(text)) return null
  return text
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

  const typ: AnalyseAntwort['typ'] = r.typ === 'forderung' || r.typ === 'wert' ? r.typ : 'problem'
  const pauschal = typ === 'forderung' && r.pauschal === true
  let nachfrage = ohneLinks(kurz(r.nachfrage, 200))
  // Nach zwei Nachfragen bleibt eine Forderung eine Forderung (ohne Wertung) – sie wird nicht
  // zum Problem umgedeutet, sonst bekäme sie eine Einschätzung, die für unbekannte Probleme gedacht ist.
  if (typ === 'forderung') {
    if (nachfragen >= MAX_NACHFRAGEN) nachfrage = ''
    else if (!nachfrage) nachfrage = 'Was läuft in deinem Alltag konkret schief?'
    // Gibt die KI die Forderung nur wieder („Du möchtest, dass die Mieten sinken.“), fehlt die Frage – ergänzen.
    else if (!nachfrage.includes('?')) nachfrage = `${nachfrage.replace(/[.!…]*$/, '')}. ${NACHFRAGE_FORDERUNG}`
  }
  const erkanntesThema = themen.find((t) => t.id === Number(r.thema_id)) ?? null

  const zusammenfassung = ohneLinks(kurz(r.zusammenfassung, 200)) || ohneLinks(kurz(letzterText, 120))
  // Im Stichwort wird ein Parteiname ganz entfernt; bleibt nichts übrig, greift die Zusammenfassung.
  const stichwortRoh = typeof r.stichwort === 'string' ? ohneLinks(r.stichwort).replace(/\[Partei\]/g, '').trim() : ''
  const stichwort = bereinigeStichwort(stichwortRoh, zusammenfassung.replace(/\[Partei\]/g, ''))

  if (typ !== 'problem') {
    const offen = typ === 'forderung' ? nachfrage || null : null
    return {
      typ,
      nachfrage: offen,
      // Bei einer Forderung: erkanntes Thema für die Ursachenauswahl (nicht bei Pauschalurteilen).
      thema_id: typ === 'forderung' && !pauschal ? erkanntesThema?.id ?? null : null,
      ursachen_ids: [],
      ...(pauschal ? { pauschal: true } : {}),
      zusammenfassung,
      stichwort,
      einschaetzung: null,
      rueckmeldung: offen || pauschal ? null : bereinigeRueckmeldung(r.rueckmeldung, ohneLinks),
    }
  }

  const thema = erkanntesThema
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
  if (genannt.length === 0) {
    // Keine Ursache erkennbar: nicht einfach alle Ursachen werten – sonst gewänne, wer zum
    // Thema die meisten Maßnahmen hat, nicht wer das geschilderte Problem am besten löst.
    // Also nachfragen (mit dem Thema, damit die App dessen Ursachen zum Antippen anbietet);
    // ist das nicht mehr möglich, bleibt die Runde ohne Wertung.
    const fragen = nachfragen < MAX_NACHFRAGEN
    return {
      typ,
      // Ohne Frage (nur eine Feststellung) die Standardfrage nehmen.
      nachfrage: fragen ? (nachfrage.includes('?') ? nachfrage : NACHFRAGE_URSACHE) : null,
      thema_id: fragen ? thema.id : null,
      ursachen_ids: [],
      zusammenfassung,
      stichwort,
      einschaetzung: null,
    }
  }
  return {
    typ,
    nachfrage: null,
    thema_id: thema.id,
    ursachen_ids: [...new Set(genannt)],
    zusammenfassung,
    stichwort,
    einschaetzung: null,
  }
}
