// Erfassen mit KI-Agenten (.claude/skills/thema-erfassen): reine Funktionen für die
// drei Kommandos in scripts/entwurf/ (ursachen-freigegeben, blind, eintragen).
//
// Ablauf: Je Programm liefert ein Agent die gefundenen Maßnahmen ohne Bewertung
// (Erfassung). Daraus entsteht eine Liste ohne Parteinamen in gemischter Reihenfolge
// (blindListe), die ein anderer Agent bewertet (Bewertung). Erst `eintragen` bringt
// beides zusammen und schreibt es mit neuen IDs in die Themendatei.
import { suchbegriffInParteinamen, type Katalog } from '../src/data/katalog.ts'
import type { Evidenz, Rolle, RollenModifikator } from '../src/data/types.ts'
import { naechsteId } from './ids.ts'
import { fehlendeZahlen } from './zitate.ts'
import { createHash } from 'node:crypto'

// ---------------------------------------------------------------------------
// Formate
// ---------------------------------------------------------------------------

/** Was ein Erfassungs-Agent in einem Programm gefunden hat – ohne Bewertung. */
export interface ErfassteMassnahme {
  beschreibung: string
  /** Ursachen, an denen die Maßnahme nach dem Leitfaden ansetzt. */
  ursachen_ids: number[]
  /**
   * Grenzfälle: Ursachen, bei denen der Leitfaden keine klare Antwort gibt. Ob die Maßnahme dort
   * ansetzt, entscheidet die Bewertung ohne Parteinamen – für alle Programme mit demselben Blick.
   */
  ursachen_offen?: number[]
  /** Bei Ursachen mit Bündelregel: das Instrument aus dem Leitfaden (je Programm höchstens eine Maßnahme). */
  buendel?: string
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
  /** Programm konnte nicht (vollständig) gelesen werden – bleibt „noch nicht erfasst“, kommt nie in die Erfassung. */
  nicht_durchsucht?: string
  /** Für den Kurzbericht an die Koordination (feste Form, siehe `kurzbericht`) – fließen nicht in die Bewertung. */
  neue_buendel?: { ursache: number; name: string; seite?: number }[]
  eigene_synonyme?: { begriff: string; ursache: number; richtung: string }[]
  /** Nur wenn das PDF einen anderen Stand nennt als der Auftrag. */
  stand_im_pdf?: string
  /**
   * Ursachen ohne Maßnahme, deren Fundstellen gelesen wurden: welche Seiten und warum nichts passt.
   * Pflicht für Ursachen mit vielen Treffern (Pflichtursachen); `entwurf:treffer` sieht den Hinweis damit
   * als erledigt an – für alle Programme nach derselben Regel, ohne dass jemand Protokolle liest.
   */
  nicht_erfasst?: { ursache: number; seiten: number[]; grund: string }[]
  /**
   * Hebel der Checkliste (Leitfaden `hebel`) ohne Maßnahme: gelesene Seiten und warum nichts passt.
   * Jeder Hebel einer Ursache des Programms ist beantwortet – mit einer Maßnahme (`buendel` = Hebel) oder hier.
   */
  hebel_nicht_gefunden?: { ursache: number; hebel: string; seiten: number[]; grund: string }[]
}

/**
 * Erfassungsleitfaden je Thema (`daten/leitfaeden/<ID>.json`), festgelegt bevor ein Agent startet:
 * Regeln zur Abgrenzung und Zuordnung, die für alle Programme gleich gelten und ohne Parteinamen
 * auch an die Bewertung gehen. So wird ein Maßstab einmal entschieden statt in Rückfragen je
 * Programm ausgehandelt.
 */
export interface Leitfaden {
  thema_id: number
  stand: string
  /** Woher die Regeln stammen (Perspektivenprüfung, frühere Erfassung …). */
  herkunft?: string
  regeln: { nr: number; ursachen?: number[]; text: string }[]
  /**
   * Bündelregel für breite Lösungsrichtungen: je Ursache eine Liste von Instrumenten. Ein Programm
   * erfasst je Instrument höchstens eine Maßnahme (die konkreteste Stelle), statt jede Einzelzusage.
   * Die Liste ist offen: Neue Instrumente meldet ein Agent, der Koordinator ergänzt sie für alle.
   */
  buendel?: Record<string, string[]>
  /**
   * Hebel-Checkliste je Ursache, in Phase A ohne Blick in die Programme festgelegt: Jeder Hebel ist ein
   * Bündel (höchstens eine Maßnahme je Programm), und jedes Programm beantwortet jeden Hebel – mit einer
   * Maßnahme oder unter `hebel_nicht_gefunden`. So hängt die Zahl der erfassten Lösungswege nicht an der
   * Gründlichkeit des einzelnen Agenten.
   */
  hebel?: Record<string, string[]>
  /**
   * Ursachen, die immer zusammen gelten (etwa [[1801, 1802]]): Nennt eine Maßnahme eine davon, nennt sie
   * alle, die für das Programm zulässig sind – in der Erfassung und in der Bewertung.
   */
  gekoppelt?: number[][]
  /**
   * Suchbegriffe je Ursache und Lösungsrichtung, für alle Programme gleich und vor dem ersten Agenten
   * festgelegt. Stehen sie hier, gelten sie für jeden Durchgang des Themas (Bund und Länder) –
   * `leseErfassung` übernimmt sie in die Arbeitsdatei, damit sie nicht mit dem Container verloren gehen.
   */
  suchbegriffe?: Suchbegriffe
  /** Begriffe, die `entwurf:treffer --vorab` meldet, die aber begründet bleiben: { "bahnhof": "Grund" }. */
  suchbegriffe_geprueft?: Record<string, string>
}

/**
 * Suchbegriffe je Ursache und Lösungsrichtung, z. B. `{ "1705": { "Beitragsfreiheit": ["beitragsfrei", …],
 * "Beiträge nach Einkommen": ["einkommensabhängig", …] } }`. Die Richtungen kommen aus der Spalte
 * „Diagnose aus der Debatte“ der Perspektivenprüfung; jede bekommt eigene Begriffe, damit keine
 * Richtung nur deshalb leer ausgeht, weil niemand nach ihr gesucht hat. Für alle Programme dieselben.
 */
export type Suchbegriffe = Record<string, Record<string, string[]>>

/** Treffer je Programm, Ursache, Richtung und Begriff – von `npm run entwurf:treffer` geschrieben. */
export interface Treffermatrix {
  /** Prüfsumme der Suchbegriffe, mit denen gezählt wurde: Kommen Begriffe dazu, muss neu gezählt werden. */
  begriffe_pruefsumme: string
  programme: { partei_id: number; land: string | null; ursachen: Record<string, Record<string, Record<string, number>>> }[]
}

/**
 * Nachtrag eines Lösungswegs (/forderung-erfassen): Die Programme sind schon erfasst; durchsucht werden sie
 * nur noch nach den genannten Lösungsrichtungen (aus den Suchbegriffen des Leitfadens) dieser Ursachen.
 * Neue Fundstellen ergänzen die vorhandenen Einträge, nichts wird ersetzt.
 */
export interface Nachtrag {
  /** Die Forderung in neutralen Worten, z. B. „Mietendeckel“. */
  forderung: string
  /** Ursache → Lösungsrichtungen (Schlüssel in `suchbegriffe`). */
  richtungen: Record<string, string[]>
}

/** Ursachen eines Nachtrags (undefined = normale Erfassung, alle Ursachen). */
export const nachtragUrsachen = (e: { nachtrag?: Nachtrag }) => (e.nachtrag ? Object.keys(e.nachtrag.richtungen).map(Number) : undefined)

/** Prüft einen Nachtrag gegen Thema und Leitfaden: bekannte Ursachen, Richtungen mit Suchbegriffen. */
export function pruefeNachtrag(k: Katalog, e: Erfassung, leitfaden: Leitfaden | undefined): string[] {
  const n = e.nachtrag
  if (!n) return []
  const f: string[] = []
  if (typeof n.forderung !== 'string' || !n.forderung.trim()) f.push('nachtrag.forderung fehlt')
  if (!n.richtungen || typeof n.richtungen !== 'object' || !Object.keys(n.richtungen).length) return [...f, 'nachtrag.richtungen: erwartet { "<Ursachen-ID>": ["<Lösungsrichtung>", …] }']
  for (const [u, rs] of Object.entries(n.richtungen)) {
    if (!k.ursachen.some((x) => x.thema_id === e.thema_id && String(x.id) === u)) f.push(`nachtrag: Ursache ${u} gehört nicht zum Thema`)
    if (!Array.isArray(rs) || !rs.length) f.push(`nachtrag: Ursache ${u} ohne Lösungsrichtung`)
    for (const r of Array.isArray(rs) ? rs : [])
      if (!(leitfaden?.suchbegriffe ?? e.suchbegriffe)?.[u]?.[r]?.length) f.push(`nachtrag: Richtung „${r}“ hat im Leitfaden bei Ursache ${u} keine Suchbegriffe – erst dort eintragen (gilt dann für alle Programme)`)
  }
  return f
}

export interface Erfassung {
  thema_id: number
  /** Nur beim Nachtrag eines Lösungswegs (siehe `Nachtrag`). */
  nachtrag?: Nachtrag
  /** Für alle Programme dieselben – steht später in docs/perspektiven-ursachen.md. */
  suchbegriffe: Suchbegriffe
  /** Alle Begriffe in allen erfassten Programmen gezählt (`npm run entwurf:treffer`). */
  treffer?: Treffermatrix
  /** Aus `daten/leitfaeden/<ID>.json` – die Skripte lesen ihn von dort, nicht aus der Arbeitsdatei. */
  leitfaden?: Leitfaden
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
  /** Prüfsumme der Blindliste, die bewertet wurde (`pruefsumme` aus blind.json). */
  blind_pruefsumme?: string
  neue_instrumente: ({ kennung: string; name: string } & Einzelbewertung)[]
  zuordnung: Zuordnung[]
  /** Nur nach `entwurf:bewertung-zusammenfuehren`: aus welcher Bewertung übernommen und welche Kennungen neu bewertet wurden. */
  teilbewertung?: { vorherige_pruefsumme: string; neu_bewertet: string[] }
}

/**
 * Eine Maßnahme der Blindliste: Instrument oder Einzelbewertung, dazu die Ursachen, an denen sie aus
 * Sicht des Bewertungs-Agenten ansetzt. Die Bewertung entscheidet die Zuordnung: Was sie aus
 * `ursachen_ids` und `ursachen_offen` nicht bestätigt, fällt beim Eintragen weg – so bestimmt nicht
 * der Erfassungs-Agent (der die Partei kennt), wo eine Maßnahme Punkte holt. Bestätigt sie keine
 * Ursache (`ursachen: []`), braucht die Maßnahme keine Bewertung und wird nicht eingetragen.
 */
export type Zuordnung =
  | (({ kennung: string; instrument: number | string } | { kennung: string; einzeln: Einzelbewertung }) & { ursachen?: number[] })
  | { kennung: string; ursachen: [] }

/** Alle Ursachen, die die Erfassung einer Maßnahme vorschlägt (sichere und offene). */
export const vorgeschlageneUrsachen = (m: ErfassteMassnahme) => [...(m.ursachen_ids ?? []), ...(m.ursachen_offen ?? [])]

/** Was nach der Bewertung bleibt: vorgeschlagene Ursachen, die die Bewertung bestätigt (Reihenfolge der Erfassung). */
export const bestaetigteUrsachen = (m: ErfassteMassnahme, z: Zuordnung | undefined) =>
  vorgeschlageneUrsachen(m).filter((u) => (z?.ursachen ?? []).includes(u))

/** Hat die Bewertung die Maßnahme verworfen (keine Ursache bestätigt)? */
const verworfen = (m: ErfassteMassnahme, z: Zuordnung | undefined) => !bestaetigteUrsachen(m, z).length

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
  // Freigegeben heißt: Die Betreiberin hat Datum und bestätigte Quellen eingetragen – ein Merge allein genügt nicht.
  // Für die Testphase genügt eine KI-Freigabe (`art: "ki"`, gesetzt am Ende von /thema-anlegen); Quellen prüft dann niemand.
  const freigabe = freigegeben.themen.find((t) => t.id === themaId)?.freigabe
  if (!freigabe)
    fehler.push(`Thema ${themaId} hat im Vergleichsstand keine „freigabe“ – Datum und bestätigte Quellen (Betreiberin) oder „art“: „ki“ (Testphase, /thema-anlegen) eintragen und committen (daten/README.md → „Dateiformat“)`)
  else if (freigabe.art !== 'ki') {
    const offen = vorher.filter((u) => !freigabe.quellen_bestaetigt.includes(u.id)).map((u) => u.id)
    if (offen.length) fehler.push(`Quellen von Ursache ${offen.join(', ')} sind nicht bestätigt („freigabe.quellen_bestaetigt“)`)
  }
  // Das Ziel ist der Maßstab für die Wirksamkeit – es gehört zur Freigabe wie die Ursachen.
  const zielVorher = freigegeben.themen.find((t) => t.id === themaId)?.ziel ?? ''
  const zielJetzt = arbeitsstand.themen.find((t) => t.id === themaId)?.ziel ?? ''
  if (zielVorher !== zielJetzt) fehler.push(`Ziel von Thema ${themaId} weicht vom freigegebenen Stand ab – das Ziel nicht beim Erfassen ändern`)
  for (const u of jetzt) {
    const alt = vorher.find((v) => v.id === u.id)
    if (!alt) fehler.push(`Ursache ${u.id} ist nicht freigegeben (fehlt im Zielzweig) – Ursachen nicht beim Erfassen ergänzen`)
    else if (alt.beschreibung !== u.beschreibung || alt.quelle_url !== u.quelle_url || (alt.ebene ?? 'bund') !== (u.ebene ?? 'bund'))
      fehler.push(`Ursache ${u.id} weicht vom freigegebenen Stand ab – Ursachen nicht beim Erfassen ändern`)
  }
  for (const v of vorher) if (!jetzt.some((u) => u.id === v.id)) fehler.push(`Ursache ${v.id} fehlt im Arbeitsstand`)
  return fehler
}

/**
 * Beim Festlegen der Ursachen schaut niemand in Wahlprogramme. Liegt eine Adresse
 * auf dem Server eines Programms im Katalog (auch als Kopie im Internet Archive),
 * nennt das den Grund; sonst null.
 */
export function programmServer(k: Katalog, url: string): string | null {
  const host = (u: string) => {
    try {
      return new URL(u).hostname.toLowerCase().replace(/^www\./, '')
    } catch {
      return null
    }
  }
  const server = new Set([...k.parteien.map((p) => p.programm_url), ...k.landesprogramme.map((l) => l.url)].map((u) => (u ? host(u) : null)).filter((h): h is string => !!h))
  let adresse = url.toLowerCase()
  try {
    adresse = decodeURIComponent(adresse)
  } catch {
    // ungültige Prozentkodierung: Adresse so prüfen, wie sie ist
  }
  for (const h of server) {
    const muster = new RegExp(`(^|[/.@])${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([/:?#]|$)`)
    if (muster.test(adresse)) return `${url} liegt auf ${h}, dem Server eines Wahlprogramms – beim Festlegen der Ursachen gesperrt`
  }
  return null
}

// ---------------------------------------------------------------------------
// Liste ohne Parteinamen
// ---------------------------------------------------------------------------

/** Bezeichnungen, unter denen Parteien sich in ihren Programmen selbst nennen. */
const PARTEI_NAMEN = [
  'Alternative für Deutschland',
  'Bündnis Sahra Wagenknecht',
  'Bündnis Soziale Gerechtigkeit und Wirtschaftliche Vernunft',
  'Bündnis 90/Die Grünen',
  'Bündnis 90',
  'Christlich Demokratische Union',
  'Christlich-Soziale Union',
  'Sozialdemokratische Partei Deutschlands',
  'Freie Demokratische Partei',
  'Freie Demokraten',
  'Freien Demokraten',
  'Sozialdemokratinnen und Sozialdemokraten',
  'Junge Union',
  'Junge Liberale',
  'Grüne Jugend',
  'Sozialdemokraten',
  'Sozialdemokratie',
  'Christdemokraten',
  'Bündnisgrüne',
  'Bündnisgrünen',
  'Linkspartei',
  'Linksjugend',
  'Jusos',
  'JuLis',
  'CDU/CSU',
  'CDU',
  'CSU',
  'Union',
  'SPD',
  'Grünen',
  'Grüne',
  'GRÜNEN',
  'GRÜNE',
  'FDP',
  'Liberale',
  'Liberalen',
  'AfD',
  'Linken',
  'Linke',
  'LINKEN',
  'LINKE',
  'BSW',
]

/** Bekannte Personen der Parteien (Vorsitz, Spitzenkandidaturen, Regierungschefs der erfassten Länder). */
const PERSONEN = [
  'Sahra Wagenknecht', 'Wagenknecht', 'Friedrich Merz', 'Merz', 'Markus Söder', 'Söder', 'Olaf Scholz', 'Scholz',
  'Lars Klingbeil', 'Klingbeil', 'Saskia Esken', 'Esken', 'Robert Habeck', 'Habeck', 'Annalena Baerbock', 'Baerbock',
  'Christian Lindner', 'Lindner', 'Christian Dürr', 'Alice Weidel', 'Weidel', 'Tino Chrupalla', 'Chrupalla', 'Björn Höcke', 'Höcke',
  'Heidi Reichinnek', 'Reichinnek', 'Jan van Aken', 'van Aken', 'Ines Schwerdtner', 'Schwerdtner', 'Gregor Gysi', 'Gysi',
  'Kai Wegner', 'Wegner', 'Manuela Schwesig', 'Schwesig', 'Reiner Haseloff', 'Haseloff', 'Sven Schulze',
]

/** Länder, Hauptstädte und Landesorgane: verraten mit der Ebene oft schon die Partei. */
const LAENDER = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern',
  'Mecklenburg', 'Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen-Anhalt',
  'Sachsen', 'Anhalt', 'Schleswig-Holstein', 'Thüringen', 'Altmark', 'Stuttgart', 'München', 'Potsdam', 'Wiesbaden',
  'Schwerin', 'Rostock', 'Greifswald', 'Neubrandenburg', 'Stralsund', 'Hannover', 'Düsseldorf', 'Mainz', 'Saarbrücken',
  'Magdeburg', 'Dessau-Roßlau', 'Dessau', 'Dresden', 'Leipzig', 'Kiel', 'Erfurt',
  // Berliner Bezirke und Organe
  'Charlottenburg-Wilmersdorf', 'Friedrichshain-Kreuzberg', 'Kreuzberg', 'Lichtenberg', 'Marzahn-Hellersdorf', 'Neukölln',
  'Pankow', 'Reinickendorf', 'Spandau', 'Steglitz-Zehlendorf', 'Tempelhof-Schöneberg', 'Treptow-Köpenick',
  'Abgeordnetenhaus', 'Senatsverwaltungen', 'Senatsverwaltung', 'Senat', 'Senats', 'Bürgerschaft',
  'MV', 'M-V', 'LSA',
]

const quote = (n: string) => n.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
const wortMuster = (namen: string[], flags: string, endung = '') =>
  namen.length
    ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${[...new Set(namen)].sort((a, b) => b.length - a.length).map(quote).join('|')})${endung}(?![\\p{L}\\p{N}])`, flags)
    : null

/**
 * Ersetzt Parteinamen durch „[Partei]“, damit die Bewertung nicht am Namen hängt.
 * Einzelne Wörter nur in der Schreibweise der Liste: „die linke Spur“ oder „grüner Wasserstoff“
 * bleiben stehen, ebenso „Europäische Union“. Namen aus mehreren Wörtern („DIE LINKE“,
 * „freie Demokraten“) ohne Rücksicht auf Groß- und Kleinschreibung. Artikel und „Wir“ davor
 * fallen weg („Die [Partei]“, „Wir Freie Demokraten“): Sie verraten Genus und Selbstbezeichnung.
 */
export function ohneParteinamen(text: string, weitere: string[] = []): string {
  return ersetzeNamen(text, weitere)
    .replace(/(?<![\p{L}])(wir)(?:\s+als|\s+von\s+de[rn])?\s+\[Partei\]/giu, '$1')
    .replace(/(?<![\p{L}])(?:die|das|der|den|dem|des)\s+\[Partei\]/giu, '[Partei]')
    .replace(/\[Partei\](?:\s*[-/]?\s*\[Partei\])+/g, '[Partei]')
}

function ersetzeNamen(text: string, weitere: string[]): string {
  // „Die Linke“ → „Linke“: Der Artikel fällt danach ohnehin weg, und „die linke Spur“ bleibt stehen.
  const alle = [...PARTEI_NAMEN, ...weitere].map((n) => n.trim().replace(/^(?:die|der|das)\s+(?=\S+$)/i, '')).flatMap((n) => [n, n.toUpperCase()])
  const mehrwort = wortMuster(alle.filter((n) => /[\s/]/.test(n)), 'giu')
  const einzeln = wortMuster(alle.filter((n) => !/[\s/]/.test(n)), 'gu')
  let t = mehrwort ? text.replace(mehrwort, '[Partei]') : text
  if (einzeln) t = t.replace(einzeln, (name, stelle: number, ganz: string) => (name === 'Union' && /Europäischen?\s+$/.test(ganz.slice(0, stelle)) ? name : '[Partei]'))
  return t.replace(wortMuster(PERSONEN, 'gu')!, '[Person]')
}

/** Steht im Text ein Parteiname oder eine bekannte Person? (Für Aufträge an den Bewertungs-Agenten.) */
export const enthaeltParteinamen = (text: string, weitere: string[] = []) => ersetzeNamen(text, weitere) !== text

/** Ersetzt Länder, Städte und Landesorgane durch „[Land]“ (auch „Berliner“, „Sachsen-Anhalts“). */
export function ohneLaender(text: string): string {
  return text.replace(wortMuster(LAENDER, 'gu', '(?:s|er|ern|ische[nmrs]?|isch)?')!, '[Land]')
}

/** Was der Bewertungs-Agent von einem Text sieht: ohne Parteien, Personen und Länder. */
export const neutralisiere = (text: string, weitere: string[] = []) => ohneLaender(ohneParteinamen(text, weitere))

/**
 * Wörter, die nach dem Neutralisieren noch auf eine Partei hindeuten können („liberal“, „Fraktion“,
 * „Altparteien“ …). `entwurf:blind` gibt sie aus und bricht über einer Schwelle ab; jeder Rest
 * wird im Pull Request begründet oder vorher in der Erfassung umformuliert (nur die Beschreibung –
 * Zitate bleiben wörtlich).
 */
const VERDAECHTIG = [
  'liberal\\p{L}*', 'sozialdemokrat\\p{L}*', 'christdemokrat\\p{L}*', 'christlich\\p{L}*', 'bündnisgrün\\p{L}*', 'genoss(?:in|innen|en)',
  'fraktion\\p{L}*', '\\p{L}*fraktion', 'parteitag\\p{L}*', 'landesverband\\p{L}*', 'volkspartei\\p{L}*', 'altpartei\\p{L}*', 'kartellpartei\\p{L}*',
  'ampel', 'ampel-?(?:koalition|regierung)\\p{L}*', 'groko', 'große koalition', '(?:rot|schwarz|grün)-(?:rot|grün|gelb|schwarz)\\p{L}*', 'linksgrün\\p{L}*',
  'wahlprogramm\\p{L}*', 'regierungsprogramm\\p{L}*', 'unsere partei', 'wir als partei', 'patriot\\p{L}*', 'sozialist\\p{L}*', 'kommunist\\p{L}*',
  'konservativ\\p{L}*', 'ökosozial\\p{L}*',
]
const VERDAECHTIG_MUSTER = new RegExp(`(?<![\\p{L}])(?:${VERDAECHTIG.join('|')})(?![\\p{L}])`, 'giu')

export function verdaechtigeReste(text: string): string[] {
  return [...new Set([...text.matchAll(VERDAECHTIG_MUSTER)].map((m) => m[0]))]
}

/**
 * Kennung einer Maßnahme in der Blindliste (M01 …). `programm` und `massnahme` sind die Stelle in der
 * aktuellen Erfassung – sie werden bei jedem Lesen aus dem Inhalt neu bestimmt, nie aus der Datei
 * übernommen. Die übrigen Felder halten fest, welche Maßnahme die Kennung trägt.
 */
export interface Kennung {
  kennung: string
  programm: number
  massnahme: number
  partei_id?: number
  land?: string | null
  /** Anfang von Beschreibung und Zitat (40 Zeichen, klein) – für korrigierte Zitate und ältere Dateien. */
  beschreibung?: string
  zitat?: string
  /** Prüfsumme des ganzen Zitats (klein, Leerraum vereinheitlicht): Schlüssel der Zuordnung über den Inhalt. */
  zitat_sha?: string
  /** Prüfsumme des Inhalts, den die Bewertung sieht (Beschreibung, Zitat, Ursachen) – „geändert“, wenn sie abweicht. */
  inhalt_sha?: string
  seite?: number
}

/** Anfang eines Texts für den Abgleich: klein, ohne Leerraum-Unterschiede, 40 Zeichen. */
const anfang = (t: string | undefined) => (t ?? '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 40)
const sha = (t: string) => createHash('sha256').update(t).digest('hex').slice(0, 16)
const zitatSha = (z: string | undefined) => sha((z ?? '').toLowerCase().replace(/\s+/g, ' ').trim())
const inhaltSha = (m: ErfassteMassnahme) => sha(JSON.stringify([m.beschreibung, m.zitat, m.ursachen_ids ?? [], m.ursachen_offen ?? []]))
const nummer = (kennung: string) => Number(kennung.replace(/^\D+/, ''))

/** Was eine Kennung über ihre Maßnahme festhält. */
function beschreibe(e: Erfassung, programm: number, massnahme: number, kennung: string): Kennung {
  const p = e.programme[programm]
  const m = p.massnahmen[massnahme]
  return {
    kennung,
    programm,
    massnahme,
    partei_id: p.partei_id,
    land: p.land,
    beschreibung: anfang(m.beschreibung),
    zitat: anfang(m.zitat),
    zitat_sha: zitatSha(m.zitat),
    inhalt_sha: inhaltSha(m),
    seite: m.seite,
  }
}

/** Alle Maßnahmen der Erfassung, sortiert nach einer Prüfsumme des Inhalts (gemischt, nicht nach Partei). */
function gemischt(e: Erfassung, nur?: Set<string>) {
  const liste = e.programme.flatMap((p, i) =>
    p.massnahmen.flatMap((m, j) =>
      nur && !nur.has(`${i}/${j}`) ? [] : [{ programm: i, massnahme: j, schluessel: createHash('sha256').update(`${m.beschreibung}\n${m.zitat}\n${m.seite}`).digest('hex') }],
    ),
  )
  return liste.sort((a, b) => (a.schluessel < b.schluessel ? -1 : a.schluessel > b.schluessel ? 1 : a.programm - b.programm || a.massnahme - b.massnahme))
}

/**
 * Kennungen M01, M02 … in gemischter Reihenfolge: sortiert nach einer Prüfsumme des Inhalts, nicht nach
 * Partei. Ohne `fest` werden sie neu vergeben (erster Lauf von `entwurf:blind`); mit `fest` (aus
 * `ordneKennungen`, an die aktuelle Erfassung angepasst) gelten die gespeicherten.
 */
export function kennungen(e: Erfassung, fest?: Kennung[]): Kennung[] {
  if (fest) return fest
  const liste = gemischt(e)
  const stellen = Math.max(2, String(liste.length).length)
  return liste.map((x, n) => beschreibe(e, x.programm, x.massnahme, `M${String(n + 1).padStart(stellen, '0')}`))
}

/** Ergebnis des Abgleichs gespeicherter Kennungen mit der aktuellen Erfassung. */
export interface KennungAbgleich {
  /** Alle Kennungen der aktuellen Erfassung, nach Nummer sortiert, mit aktueller Stelle. */
  kennungen: Kennung[]
  /** Neue oder ausgetauschte Maßnahmen – fortlaufend nach der höchsten je vergebenen Nummer. */
  neu: Kennung[]
  /** Maßnahmen, die es nicht mehr gibt. Ihre Nummern werden nie neu vergeben. */
  entfallen: Kennung[]
  /** Dieselbe Maßnahme mit geändertem Inhalt (Beschreibung, Zitat, Seite oder Ursachen). */
  geaendert: { kennung: Kennung; was: string[] }[]
  /** Höchste je vergebene Nummer (auch entfallene). */
  vergeben_bis: number
  /** Formfehler der gespeicherten Datei (doppelte Kennungen …). */
  probleme: string[]
}

/**
 * Ordnet gespeicherte Kennungen über den Inhalt zu, nicht über die Stelle: dasselbe Programm (Partei,
 * Land) und dasselbe Zitat. Die Beschreibung darf sich ändern. Bleibt eine Maßnahme übrig, zählt im
 * selben Programm auch derselbe Zitat- oder Beschreibungsanfang (korrigiertes Zitat). Was dann noch
 * fehlt, ist neu und bekommt eine neue, fortlaufende Kennung; entfallene Nummern werden nicht neu
 * vergeben. So bleibt eine Bewertung für unveränderte Maßnahmen gültig, und jede Verschiebung wird
 * gemeldet statt still neu verteilt.
 */
export function ordneKennungen(e: Erfassung, gespeichert: Kennung[], vergebenBis = 0): KennungAbgleich {
  const probleme: string[] = []
  const namen = new Set<string>()
  for (const x of gespeichert) {
    if (namen.has(x.kennung)) probleme.push(`${x.kennung}: doppelt vergeben`)
    namen.add(x.kennung)
  }
  // Ältere Dateien ohne Partei: die Herkunft aus der damaligen Stelle übernehmen.
  const alt = gespeichert.map((x) => {
    const p = e.programme[x.programm]
    return x.partei_id === undefined && p ? { ...x, partei_id: p.partei_id, land: p.land } : x
  })
  const offen = new Set(e.programme.flatMap((p, i) => p.massnahmen.map((_, j) => `${i}/${j}`)))
  const treffer = new Map<string, string>() // kennung → Stelle
  const stellen = (x: Kennung) =>
    [...offen].filter((pos) => {
      const p = e.programme[Number(pos.split('/')[0])]
      return p.partei_id === x.partei_id && (x.land === undefined || (p.land ?? null) === (x.land ?? null))
    })
  const massnahmeAn = (pos: string) => {
    const [i, j] = pos.split('/').map(Number)
    return e.programme[i].massnahmen[j]
  }
  const runde = (passt: (x: Kennung, m: ErfassteMassnahme) => boolean) => {
    for (const x of alt) {
      if (treffer.has(x.kennung) || x.partei_id === undefined) continue
      const pos = stellen(x).find((s) => passt(x, massnahmeAn(s)))
      if (pos) {
        treffer.set(x.kennung, pos)
        offen.delete(pos)
      }
    }
  }
  runde((x, m) => x.zitat_sha !== undefined && x.zitat_sha === zitatSha(m.zitat))
  runde((x, m) => x.zitat_sha === undefined && x.zitat === anfang(m.zitat) && x.beschreibung === anfang(m.beschreibung))
  runde((x, m) => !!x.zitat && x.zitat === anfang(m.zitat))
  runde((x, m) => !!x.beschreibung && x.beschreibung === anfang(m.beschreibung))

  const hoechste = Math.max(vergebenBis, 0, ...gespeichert.map((x) => nummer(x.kennung)).filter(Number.isFinite))
  const breite = Math.max(2, ...gespeichert.map((x) => x.kennung.length - 1))
  const behalten: Kennung[] = []
  const geaendert: KennungAbgleich['geaendert'] = []
  const entfallen: Kennung[] = []
  for (const x of alt) {
    const pos = treffer.get(x.kennung)
    if (!pos) {
      entfallen.push(x)
      continue
    }
    const [i, j] = pos.split('/').map(Number)
    const jetzt = beschreibe(e, i, j, x.kennung)
    const was: string[] = []
    if (x.zitat_sha !== undefined ? x.zitat_sha !== jetzt.zitat_sha : x.zitat !== jetzt.zitat) was.push('Zitat')
    if (x.seite !== undefined && x.seite !== jetzt.seite) was.push('Seite')
    if (x.inhalt_sha !== undefined && x.inhalt_sha !== jetzt.inhalt_sha && !was.includes('Zitat')) was.push('Beschreibung oder Ursachen')
    else if (x.inhalt_sha === undefined && x.beschreibung !== jetzt.beschreibung) was.push('Beschreibung')
    if (was.length) geaendert.push({ kennung: jetzt, was })
    behalten.push(jetzt)
  }
  let n = hoechste
  const neu = gemischt(e, offen).map((x) => beschreibe(e, x.programm, x.massnahme, `M${String(++n).padStart(breite, '0')}`))
  const alle = [...behalten, ...neu].sort((a, b) => nummer(a.kennung) - nummer(b.kennung))
  return { kennungen: alle, neu, entfallen, geaendert, vergeben_bis: n, probleme }
}

/**
 * Passt eine gespeicherte Zuordnung noch zur Erfassung, ohne neue Kennungen? Für `entwurf:bewertung-pruefen`
 * und `entwurf:eintragen`: Neue oder entfallene Maßnahmen heißen, dass `entwurf:blind` erneut laufen muss.
 * Geänderter Inhalt ist hier kein Fehler – das meldet die Prüfsumme der Blindliste.
 */
export function pruefeKennungen(e: Erfassung, fest: Kennung[]): string[] {
  const a = ordneKennungen(e, fest)
  return [
    ...a.probleme,
    ...a.neu.map((x) => `Maßnahme ${x.programm}/${x.massnahme} (S. ${x.seite}) hat noch keine Kennung – npm run entwurf:blind erneut ausführen`),
    ...a.entfallen.map((x) => `${x.kennung}: Maßnahme gibt es in der Erfassung nicht mehr – npm run entwurf:blind erneut ausführen`),
  ]
}

/** Ebene eines Instruments aus den Maßnahmen, die darauf verweisen. */
function instrumentEbene(k: Katalog, id: number): 'bund' | 'land' | null {
  const m = k.massnahmen.find((x) => x.instrument_id === id)
  return m ? (m.land ? 'land' : 'bund') : null
}

export interface BlindListe {
  /** SHA-256 über den übrigen Inhalt: Die Bewertung gibt sie zurück, damit spätere Textänderungen auffallen. */
  pruefsumme: string
  thema: { id: number; name: string; ziel?: string }
  ursachen: { id: number; beschreibung: string; ebene: string }[]
  /** Regeln zur Zuordnung aus dem Leitfaden – dieselben, die die Erfassung hatte. */
  regeln?: { nr: number; ursachen?: number[]; text: string }[]
  /** Ursachen, die immer zusammen gelten (Leitfaden `gekoppelt`). */
  gekoppelt?: number[][]
  /** Vorhandene Instrumente mit ihrer Quelle: Bewertet die Bewertung denselben Lösungsweg auf der anderen Ebene, prüft sie diese Quelle zuerst, statt neu zu suchen. */
  instrumente: { id: number; name: string; ebene: string | null; wirksamkeit: number; umsetzbarkeit: number; evidenz?: string | null; begruendung: string; beleg_studie_url?: string }[]
  massnahmen: BlindMassnahme[]
  /**
   * Nur bei einer Teil-Neubewertung (`entwurf:blind --teil`): welche Kennungen neu zu bewerten sind und
   * die bisherige Bewertung der übrigen (ohne Parteinamen – sie kennt nur Kennungen). Steht außerhalb der
   * `pruefsumme`; `entwurf:bewertung-zusammenfuehren` baut den Block aus den Dateien neu und vergleicht.
   */
  teilbewertung?: Teilbewertung
}

export interface BlindMassnahme {
  kennung: string
  ebene: 'bund' | 'land'
  beschreibung: string
  zitat: string
  ursachen_ids: number[]
  ursachen_offen?: number[]
  /** Prüfsumme dieses Eintrags (ohne sie selbst): Bei einer Teil-Neubewertung gilt ein Eintrag als unverändert, wenn sie gleich bleibt. */
  pruefsumme: string
}

export interface Teilbewertung {
  /** Prüfsumme der Blindliste, zu der `bisher` gehört. */
  vorherige_pruefsumme: string
  /** Neue oder geänderte Kennungen – nur sie bewertet der Agent. */
  zu_bewerten: string[]
  /** Bisherige Bewertung der unveränderten Kennungen und alle bisherigen neuen Instrumente. */
  bisher: Pick<Bewertung, 'neue_instrumente' | 'zuordnung'>
}

/** Was der Bewertungs-Agent sieht: Thema, Ursachen, vorhandene Instrumente und Maßnahmen ohne Partei. */
export function blindListe(k: Katalog, e: Erfassung, fest?: Kennung[]): BlindListe {
  const thema = k.themen.find((t) => t.id === e.thema_id)
  if (!thema) throw new Error(`Thema ${e.thema_id} nicht im Katalog`)
  const weitere = k.parteien.flatMap((p) => [p.name, p.kurzname])
  const massnahmen = kennungen(e, fest).map(({ kennung, programm, massnahme }): BlindMassnahme => {
    const p = e.programme[programm]
    const m = p.massnahmen[massnahme]
    const eintrag = {
      kennung,
      ebene: p.land ? ('land' as const) : ('bund' as const),
      beschreibung: neutralisiere(m.beschreibung, weitere),
      zitat: neutralisiere(m.zitat, weitere),
      ursachen_ids: m.ursachen_ids,
      ...(m.ursachen_offen?.length ? { ursachen_offen: m.ursachen_offen } : {}),
    }
    return { ...eintrag, pruefsumme: createHash('sha256').update(JSON.stringify(eintrag)).digest('hex').slice(0, 16) }
  })
  const regeln = e.leitfaden?.regeln.map((r) => ({ ...r, text: neutralisiere(r.text, weitere) }))
  const liste: Omit<BlindListe, 'pruefsumme'> = {
    thema: { id: thema.id, name: thema.name, ziel: thema.ziel },
    ursachen: k.ursachen.filter((u) => u.thema_id === thema.id).map((u) => ({ id: u.id, beschreibung: u.beschreibung, ebene: u.ebene ?? 'bund' })),
    ...(regeln?.length ? { regeln } : {}),
    ...(e.leitfaden?.gekoppelt?.length ? { gekoppelt: e.leitfaden.gekoppelt } : {}),
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
        ...(i.beleg_studie_url ? { beleg_studie_url: i.beleg_studie_url } : {}),
      })),
    massnahmen,
  }
  return { pruefsumme: createHash('sha256').update(JSON.stringify(liste)).digest('hex'), ...liste }
}

/**
 * Prüfsumme über alles außer den Maßnahmen (Thema, Ursachen, Regeln, vorhandene Instrumente). Ändert sich
 * davon etwas, ist eine Teil-Neubewertung nicht zulässig – dann gilt der Maßstab für alle neu.
 */
export const kontextPruefsumme = (l: Omit<BlindListe, 'pruefsumme' | 'massnahmen' | 'teilbewertung'> & Partial<BlindListe>) => {
  const { pruefsumme: _p, massnahmen: _m, teilbewertung: _t, ...kontext } = l
  return createHash('sha256').update(JSON.stringify(kontext)).digest('hex')
}

// ---------------------------------------------------------------------------
// Teil-Neubewertung
// ---------------------------------------------------------------------------

/** JSON mit sortierten Schlüsseln – für den Vergleich, ob zwei Einträge gleich sind. */
const stabil = (x: unknown): string =>
  Array.isArray(x)
    ? `[${x.map(stabil).join(',')}]`
    : x && typeof x === 'object'
      ? `{${Object.keys(x).sort().map((k) => `${JSON.stringify(k)}:${stabil((x as Record<string, unknown>)[k])}`).join(',')}}`
      : JSON.stringify(x)
export const gleich = (a: unknown, b: unknown) => stabil(a) === stabil(b)

/**
 * Block für eine Teil-Neubewertung: Unverändert ist eine Kennung, deren Eintrag in beiden Listen dieselbe
 * Prüfsumme hat. Nur die übrigen bewertet der Agent; er liest trotzdem die ganze Liste und kann vorhandene
 * Instrumente wiederverwenden. Nicht zulässig, wenn sich Thema, Ursachen, Regeln oder vorhandene
 * Instrumente geändert haben – dann gilt der Maßstab für alle neu.
 */
export function teilbewertung(vorherListe: BlindListe, jetzt: BlindListe, vorher: Bewertung): { block?: Teilbewertung; fehler: string[] } {
  const fehler: string[] = []
  if (vorher.blind_pruefsumme !== vorherListe.pruefsumme) fehler.push('Die bisherige Bewertung gehört nicht zur archivierten Blindliste (blind_pruefsumme)')
  if (kontextPruefsumme(vorherListe) !== kontextPruefsumme(jetzt))
    fehler.push('Thema, Ursachen, Regeln des Leitfadens oder vorhandene Instrumente haben sich geändert – Teil-Neubewertung nicht zulässig, ganz neu bewerten')
  if (vorherListe.massnahmen.some((m) => !m.pruefsumme)) fehler.push('Die archivierte Blindliste hat keine Prüfsumme je Maßnahme – ganz neu bewerten')
  if (fehler.length) return { fehler }
  const alt = new Map(vorherListe.massnahmen.map((m) => [m.kennung, m.pruefsumme]))
  const unveraendert = new Set(jetzt.massnahmen.filter((m) => alt.get(m.kennung) === m.pruefsumme).map((m) => m.kennung))
  return {
    fehler,
    block: {
      vorherige_pruefsumme: vorherListe.pruefsumme,
      zu_bewerten: jetzt.massnahmen.filter((m) => !unveraendert.has(m.kennung)).map((m) => m.kennung),
      bisher: { neue_instrumente: vorher.neue_instrumente ?? [], zuordnung: (vorher.zuordnung ?? []).filter((z) => unveraendert.has(z.kennung)) },
    },
  }
}

/**
 * Führt eine Teilbewertung mit der bisherigen zusammen. Lehnt ab, wenn die Teilbewertung eine
 * unveränderte Kennung oder ein bisheriges Instrument anders bewertet, eine zu bewertende Kennung
 * auslässt oder zu einer anderen Liste gehört. Das Ergebnis prüft danach `pruefeBewertung` wie jede
 * vollständige Bewertung.
 */
export function fuehreTeilbewertungZusammen(jetzt: BlindListe, block: Teilbewertung, teil: Bewertung): { bewertung?: Bewertung; fehler: string[] } {
  const fehler: string[] = []
  if (teil.blind_pruefsumme !== jetzt.pruefsumme) fehler.push('Die Teilbewertung gehört nicht zur aktuellen Blindliste (blind_pruefsumme)')
  const neu = new Set(block.zu_bewerten)
  const bisher = new Map(block.bisher.zuordnung.map((z) => [z.kennung, z]))
  const bisherInstr = new Map(block.bisher.neue_instrumente.map((i) => [i.kennung, i]))
  const zuordnung = new Map<string, Zuordnung>(bisher)
  const gesehen = new Set<string>()
  for (const z of teil.zuordnung ?? []) {
    if (gesehen.has(z.kennung)) fehler.push(`${z.kennung}: mehrfach in der Teilbewertung`)
    gesehen.add(z.kennung)
    if (neu.has(z.kennung)) zuordnung.set(z.kennung, z)
    else if (bisher.has(z.kennung)) {
      if (!gleich(bisher.get(z.kennung), z)) fehler.push(`${z.kennung}: unverändert, aber anders bewertet als bisher – unveränderte Einträge bleiben, wie sie sind`)
    } else fehler.push(`${z.kennung}: unbekannte Kennung`)
  }
  for (const k of block.zu_bewerten) if (!gesehen.has(k)) fehler.push(`${k}: neu oder geändert, aber nicht bewertet`)
  const instrumente = new Map(bisherInstr)
  for (const i of teil.neue_instrumente ?? []) {
    const vorher = bisherInstr.get(i.kennung)
    if (vorher && !gleich(vorher, i)) fehler.push(`Instrument ${i.kennung}: gibt es schon mit anderen Werten – bisherige Instrumente nicht ändern, für Abweichendes eine neue Kennung`)
    else instrumente.set(i.kennung, i)
  }
  if (fehler.length) return { fehler }
  const reihenfolge = jetzt.massnahmen.map((m) => m.kennung).filter((k) => zuordnung.has(k))
  const liste = reihenfolge.map((k) => zuordnung.get(k)!)
  // Instrumente, auf die keine Maßnahme mehr verweist (ihre Maßnahmen sind entfallen), fallen weg.
  const benutzt = new Set(liste.flatMap((z) => ('instrument' in z ? [z.instrument] : [])))
  return {
    fehler,
    bewertung: {
      blind_pruefsumme: jetzt.pruefsumme,
      neue_instrumente: [...instrumente.values()].filter((i) => benutzt.has(i.kennung)),
      zuordnung: liste,
      teilbewertung: { vorherige_pruefsumme: block.vorherige_pruefsumme, neu_bewertet: block.zu_bewerten },
    },
  }
}

/** Maßnahmen der Blindliste, in denen nach dem Neutralisieren noch verdächtige Wörter stehen. */
export function blindReste(liste: { massnahmen: Pick<BlindMassnahme, 'kennung' | 'beschreibung' | 'zitat'>[] }): { kennung: string; reste: string[] }[] {
  return liste.massnahmen
    .map((m) => ({ kennung: m.kennung, reste: verdaechtigeReste(`${m.beschreibung}\n${m.zitat}`) }))
    .filter((r) => r.reste.length)
}

/** Ab so vielen Maßnahmen mit Resten bricht `entwurf:blind` ab: höchstens 3 oder 5 % der Liste. */
export const resteSchwelle = (anzahl: number) => Math.max(3, Math.floor(anzahl * 0.05))

// ---------------------------------------------------------------------------
// Protokoll: Spuren, die der Koordinator hinterlassen muss
// ---------------------------------------------------------------------------

/** Dateiname je Programm, z. B. „Gruene-Bund“ (ASCII, wie in programme:texte). */
export const programmName = (kurzname: string, land: string | null) =>
  `${kurzname.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${land ?? 'Bund'}`

/** Feste Namen im Ordner `protokoll/` neben der Erfassung. */
export const PROTOKOLL = {
  erfassung: (kurzname: string, land: string | null) => `erfassung-${programmName(kurzname, land)}.txt`,
  /** Antwort auf die n-te Rückfrage – die frühere Fassung bleibt stehen. */
  rueckfrage: (kurzname: string, land: string | null, n: number) => `erfassung-${programmName(kurzname, land)}-rueckfrage-${n}.txt`,
  auftrag: 'bewertung-auftrag.txt',
  antwort: 'bewertung-antwort.txt',
  rueckfragen: 'rueckfragen.md',
}

/**
 * Liegt alles vor, was ein Eingriff des Koordinators sichtbar macht? Die Rohantwort jedes
 * Erfassungs-Agenten, der Auftrag an den Bewertungs-Agenten (mit der Prüfsumme der Blindliste, die er
 * selbst liest, ohne Parteinamen), dessen Antwort (von ihm selbst geschrieben) und die Liste der
 * Rückfragen (auch „keine“).
 */
export function pruefeProtokoll(k: Katalog, e: Erfassung, dateien: Map<string, string>, pruefsumme: string | undefined): string[] {
  const f: string[] = []
  const da = (name: string) => (dateien.get(name) ?? '').trim()
  for (const p of e.programme) {
    const kurz = k.parteien.find((x) => x.id === p.partei_id)?.kurzname ?? String(p.partei_id)
    const name = PROTOKOLL.erfassung(kurz, p.land)
    if (!da(name)) f.push(`protokoll/${name} fehlt oder ist leer – Rohantwort des Erfassungs-Agenten samt Protokoll speichern`)
  }
  const auftrag = da(PROTOKOLL.auftrag)
  if (!auftrag) f.push(`protokoll/${PROTOKOLL.auftrag} fehlt – den Auftrag an den Bewertungs-Agenten mit npm run entwurf:bewertung-auftrag schreiben`)
  else {
    if (pruefsumme && !auftrag.includes(pruefsumme)) f.push(`protokoll/${PROTOKOLL.auftrag} nennt nicht die Prüfsumme ${pruefsumme.slice(0, 12)}… der bewerteten Blindliste – Auftrag mit npm run entwurf:bewertung-auftrag schreiben`)
    const weitere = k.parteien.flatMap((p) => [p.name, p.kurzname])
    if (enthaeltParteinamen(auftrag, weitere)) f.push(`protokoll/${PROTOKOLL.auftrag} enthält einen Parteinamen oder eine Person – der Bewertungs-Agent darf keine Herkunft erfahren`)
  }
  if (!da(PROTOKOLL.antwort)) f.push(`protokoll/${PROTOKOLL.antwort} fehlt – die Antwort des Bewertungs-Agenten speichern`)
  if (!dateien.has(PROTOKOLL.rueckfragen))
    f.push(`protokoll/${PROTOKOLL.rueckfragen} fehlt – jede Rückfrage an einen Agenten mit Programm bzw. Kennung, Anlass und Ergebnis (oder „keine“)`)
  return f
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
  if (b.wirksamkeit === 3 && !b.beleg_studie_url) f.push(`${was}: Wirksamkeit 3 nur mit beleg_studie_url (geöffnete Studie, die die Wirkung belegt)`)
  if (b.begruendung && b.begruendung.length > 300) f.push(`${was}: begruendung ist länger als 300 Zeichen`)
  return f
}

/** Ursachen, die für mindestens ein Programm der Erfassung zählen (Landesprogramme nur für Landesursachen). */
const imNachtrag = (e: Pick<Erfassung, 'nachtrag'>, id: number) => !e.nachtrag || String(id) in e.nachtrag.richtungen
const ursachenDerErfassung = (k: Katalog, e: Erfassung) =>
  k.ursachen.filter((u) => u.thema_id === e.thema_id && imNachtrag(e, u.id) && e.programme.some((p) => !p.land || (u.ebene ?? 'bund') === 'land'))

/** Ursachen, für die ein Programm durchsucht wird. */
const ursachenFuer = (k: Katalog, e: Erfassung, p: ErfasstesProgramm) =>
  k.ursachen.filter((u) => u.thema_id === e.thema_id && imNachtrag(e, u.id) && (!p.land || (u.ebene ?? 'bund') === 'land'))

export const begriffePruefsumme = (s: Suchbegriffe) =>
  createHash('sha256')
    .update(JSON.stringify(Object.keys(s).sort().map((u) => [u, Object.keys(s[u]).sort().map((r) => [r, [...s[u][r]].sort()])])))
    .digest('hex')

/** Je Ursache mindestens eine Lösungsrichtung, je Richtung mindestens ein Begriff; die Treffermatrix passt dazu. */
export function pruefeSuchbegriffe(k: Katalog, e: Erfassung): string[] {
  const f: string[] = []
  const s = e.suchbegriffe as unknown
  if (!s || typeof s !== 'object' || Array.isArray(s)) {
    return ['suchbegriffe: erwartet { "<Ursachen-ID>": { "<Lösungsrichtung>": ["Begriff", …] } } – je Richtung aus der Perspektivenprüfung eigene Begriffe']
  }
  const ursachen = new Set(k.ursachen.filter((u) => u.thema_id === e.thema_id).map((u) => String(u.id)))
  for (const id of Object.keys(e.suchbegriffe)) if (!ursachen.has(id)) f.push(`suchbegriffe: Ursache ${id} gehört nicht zum Thema`)
  for (const u of ursachenDerErfassung(k, e)) {
    const richtungen = e.suchbegriffe[String(u.id)]
    if (!richtungen || typeof richtungen !== 'object' || Array.isArray(richtungen) || !Object.keys(richtungen).length) {
      f.push(`suchbegriffe: Ursache ${u.id} ohne Lösungsrichtung – Richtungen aus „Diagnose aus der Debatte“ übernehmen`)
      continue
    }
    for (const [r, begriffe] of Object.entries(richtungen))
      if (!r.trim() || !Array.isArray(begriffe) || !begriffe.some((b) => typeof b === 'string' && b.trim()))
        f.push(`suchbegriffe: Ursache ${u.id}, Richtung „${r}“ ohne Begriffe`)
  }
  if (f.length) return f
  if (!e.treffer) f.push('treffer fehlen – npm run entwurf:treffer zählt alle Begriffe in allen Programmen')
  else if (e.treffer.begriffe_pruefsumme !== begriffePruefsumme(e.suchbegriffe))
    f.push('treffer passen nicht zu den Suchbegriffen (Begriffe ergänzt?) – npm run entwurf:treffer erneut ausführen')
  else
    for (const p of e.programme)
      if (!e.treffer.programme.some((t) => t.partei_id === p.partei_id && t.land === p.land))
        f.push(`treffer: Partei ${p.partei_id} ${p.land ?? 'Bund'} fehlt – npm run entwurf:treffer erneut ausführen`)
  return f
}

/** Ab so vielen Treffern zu einer Ursache ohne Maßnahme fragt der Hinweis nach. */
export const TREFFER_OHNE_MASSNAHME = 10

/**
 * Hinweise (keine Fehler): Ein Programm hat zu einer Ursache viele Treffer, aber keine Maßnahme –
 * dann den Agenten die Fundstellen lesen lassen oder im Protokoll begründen, warum nichts passt.
 */
export function erfassungsHinweise(k: Katalog, e: Erfassung): string[] {
  const h: string[] = []
  const name = (p: { partei_id: number; land: string | null }) =>
    `${k.parteien.find((x) => x.id === p.partei_id)?.kurzname ?? p.partei_id} (${p.land ?? 'Bund'})`
  for (const p of e.programme) {
    const t = e.treffer?.programme.find((x) => x.partei_id === p.partei_id && x.land === p.land)
    if (!t) continue
    for (const u of ursachenFuer(k, e, p)) {
      if (p.massnahmen.some((m) => vorgeschlageneUrsachen(m).includes(u.id))) continue
      // Erledigt: Der Agent hat gelesene Seiten und einen Grund angegeben (geprüft in entwurf:programm-pruefen).
      if ((p.nicht_erfasst ?? []).some((n) => n.ursache === u.id && n.seiten?.length)) continue
      const richtungen = Object.entries(t.ursachen[String(u.id)] ?? {}).map(([r, b]) => [r, Object.values(b).reduce((a, c) => a + c, 0)] as const)
      const summe = richtungen.reduce((a, [, n]) => a + n, 0)
      if (summe >= TREFFER_OHNE_MASSNAHME)
        h.push(`${name(p)}: ${summe} Treffer zu Ursache ${u.id} (${richtungen.filter(([, n]) => n).map(([r, n]) => `${r} ${n}`).join(', ')}), aber keine Maßnahme – Fundstellen prüfen lassen oder Grund im Protokoll`)
    }
    // Bündelregel: Viele Maßnahmen ohne Bündel an einer Ursache mit Bündelliste heißt meist, dass Einzelzusagen nicht zusammengefasst wurden.
    for (const [u, liste] of Object.entries(e.leitfaden?.buendel ?? {})) {
      if (!liste.length) continue
      const ohne = p.massnahmen.filter((m) => vorgeschlageneUrsachen(m).includes(Number(u)) && !m.buendel).length
      if (ohne > BUENDEL_OHNE)
        h.push(`${name(p)}: ${ohne} Maßnahmen zu Ursache ${u} ohne Bündel – Einzelzusagen je Instrument zusammenfassen (Leitfaden, Bündelregel)?`)
    }
  }
  return h
}

/**
 * Paart die Maßnahmen eines Programms in zwei Ständen über den Inhalt – wie die Kennungen: gleiches
 * Zitat, sonst gleicher Zitat- oder Beschreibungsanfang. Rest links: entfallen, Rest rechts: neu.
 */
function paareMassnahmen(alt: ErfassteMassnahme[], neu: ErfassteMassnahme[]) {
  const frei = new Set(neu.map((_, j) => j))
  const paare: [number, number][] = []
  const offenAlt = new Set(alt.map((_, i) => i))
  for (const passt of [
    (a: ErfassteMassnahme, b: ErfassteMassnahme) => zitatSha(a.zitat) === zitatSha(b.zitat),
    (a: ErfassteMassnahme, b: ErfassteMassnahme) => anfang(a.zitat) === anfang(b.zitat),
    (a: ErfassteMassnahme, b: ErfassteMassnahme) => anfang(a.beschreibung) === anfang(b.beschreibung),
  ])
    for (const i of offenAlt) {
      const j = [...frei].find((x) => passt(alt[i], neu[x]))
      if (j !== undefined) {
        paare.push([i, j])
        frei.delete(j)
        offenAlt.delete(i)
      }
    }
  return { paare, entfallen: [...offenAlt], neu: [...frei] }
}

const kurz = (m: ErfassteMassnahme) => `S. ${m.seite} „${m.beschreibung.length > 80 ? `${m.beschreibung.slice(0, 80)}…` : m.beschreibung}“`

/**
 * Was eine Rückfrage an der Erfassung verändert hat, je Programm (plan–validate–execute): entfallene
 * Maßnahmen (mit Verdacht auf Zusammenfassen, wenn eine geänderte oder neue Maßnahme dasselbe Bündel oder
 * dieselbe Seite hat), neue Maßnahmen, Ursachen, die keine Maßnahme mehr haben, und Programme, die
 * herausgefallen sind. Die Koordination prüft das, bevor `entwurf:blind` läuft – so fällt ein Verlust auf,
 * bevor er bewertet wird (Thema 9: eine Zusage fiel weg, weil sie in ein belegtes Bündel gefasst wurde).
 */
export function vergleicheErfassung(k: Katalog, vorher: ErfasstesProgramm[], jetzt: ErfasstesProgramm[]): string[] {
  const zeilen: string[] = []
  const name = (p: { partei_id: number; land: string | null }) => `${k.parteien.find((x) => x.id === p.partei_id)?.kurzname ?? p.partei_id} (${p.land ?? 'Bund'})`
  const schluessel = (p: ErfasstesProgramm) => `${p.partei_id}/${p.land ?? null}`
  const neuNach = new Map(jetzt.map((p) => [schluessel(p), p]))
  for (const a of vorher) {
    const b = neuNach.get(schluessel(a))
    if (!b) {
      zeilen.push(`${name(a)}: ganz entfallen (${a.massnahmen.length} Maßnahmen) – nicht durchsucht oder Datei fehlt?`)
      continue
    }
    const { paare, entfallen, neu } = paareMassnahmen(a.massnahmen, b.massnahmen)
    const geaendert = paare.filter(([i, j]) => !gleich(a.massnahmen[i], b.massnahmen[j])).map(([, j]) => j)
    const kandidaten = [...new Set([...geaendert, ...neu])].map((j) => b.massnahmen[j])
    for (const i of entfallen) {
      const m = a.massnahmen[i]
      const mit = kandidaten.find((x) => (m.buendel && x.buendel === m.buendel) || Math.abs(x.seite - m.seite) <= 1)
      zeilen.push(
        mit
          ? `${name(a)}: zusammengefasst? ${kurz(m)}${m.buendel ? ` [${m.buendel}]` : ''} fehlt, ${kurz(mit)}${mit.buendel ? ` [${mit.buendel}]` : ''} ist neu oder geändert – zwei verschiedene Zusagen nie zusammenfassen, nur weil das Bündel belegt ist`
          : `${name(a)}: entfallen ${kurz(m)}${m.buendel ? ` [${m.buendel}]` : ''}`,
      )
    }
    for (const j of neu) zeilen.push(`${name(a)}: neu ${kurz(b.massnahmen[j])}`)
    for (const j of geaendert) zeilen.push(`${name(a)}: geändert ${kurz(b.massnahmen[j])}`)
    // Ursache verliert ihre letzte Maßnahme: genau so fiel bei Thema 9 eine Zusage aus der Bewertung.
    const zahl = (p: ErfasstesProgramm, u: number) => p.massnahmen.filter((m) => vorgeschlageneUrsachen(m).includes(u)).length
    const ursachen = [...new Set(a.massnahmen.flatMap(vorgeschlageneUrsachen))].sort((x, y) => x - y)
    for (const u of ursachen) if (zahl(b, u) === 0) zeilen.push(`${name(a)}: Ursache ${u} hatte ${zahl(a, u)} Maßnahme(n), jetzt keine`)
  }
  for (const b of jetzt) if (!vorher.some((a) => schluessel(a) === schluessel(b))) zeilen.push(`${name(b)}: neu in der Erfassung (${b.massnahmen.length} Maßnahmen)`)
  return zeilen
}

/**
 * Maßnahmen ohne Bündel an Ursachen, für die der Leitfaden Bündel nennt – je Programm mit Seite. Das ist
 * erlaubt (eine zweite, verschiedene Zusage bleibt ohne Bündel), aber jede soll die Koordination einmal
 * ansehen: gleiches Instrument (dann Rückfrage) oder eigenes (dann bleibt sie, oder ein neues Bündel).
 */
export function ohneBuendel(k: Katalog, e: Pick<Erfassung, 'programme' | 'leitfaden'>): string[] {
  const zeilen: string[] = []
  const mitBuendel = new Set([...Object.entries(e.leitfaden?.buendel ?? {}), ...Object.entries(e.leitfaden?.hebel ?? {})].filter(([, l]) => l.length).map(([u]) => Number(u)))
  for (const p of e.programme) {
    const name = `${k.parteien.find((x) => x.id === p.partei_id)?.kurzname ?? p.partei_id} (${p.land ?? 'Bund'})`
    for (const m of p.massnahmen) {
      const u = vorgeschlageneUrsachen(m).filter((x) => mitBuendel.has(x))
      if (u.length && !m.buendel) zeilen.push(`${name}: ${kurz(m)} ohne Bündel (Ursache ${u.join(', ')} hat Bündel)`)
    }
  }
  return zeilen
}

/** Bündel und Hebel einer Ursache: Ein Hebel der Checkliste ist zugleich ein Bündel. */
export const buendelVon = (l: Pick<Leitfaden, 'buendel' | 'hebel'> | undefined, u: number) => [...(l?.buendel?.[String(u)] ?? []), ...(l?.hebel?.[String(u)] ?? [])]

/**
 * Gekoppelte Ursachen: Nennt eine Zuordnung (`ursachen`) eine Ursache einer Gruppe, muss sie alle nennen,
 * die in `moeglich` stehen (für das Programm zulässig bzw. vorgeschlagen). Rückgabe: fehlende je Gruppe.
 */
export function fehlendeGekoppelte(gekoppelt: number[][] | undefined, ursachen: number[], moeglich: number[]): number[] {
  const fehlt = new Set<number>()
  for (const g of gekoppelt ?? []) {
    const teil = g.filter((u) => moeglich.includes(u))
    if (teil.some((u) => ursachen.includes(u))) for (const u of teil) if (!ursachen.includes(u)) fehlt.add(u)
  }
  return [...fehlt]
}

/** Ab so vielen Maßnahmen ohne Bündel an einer Ursache mit Bündelliste gibt es einen Hinweis. */
export const BUENDEL_OHNE = 3

/** Regeln und Bündel des Leitfadens: Ursachen des Themas, eindeutige Nummern, keine Parteinamen (er geht an die Bewertung). */
export function pruefeLeitfaden(k: Katalog, l: Leitfaden): string[] {
  const f: string[] = []
  const ursachen = new Set(k.ursachen.filter((u) => u.thema_id === l.thema_id).map((u) => u.id))
  if (!k.themen.some((t) => t.id === l.thema_id)) f.push(`Leitfaden: Thema ${l.thema_id} gibt es nicht`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(l.stand ?? '')) f.push('Leitfaden: stand muss ein Datum JJJJ-MM-TT sein')
  if (!Array.isArray(l.regeln)) return [...f, 'Leitfaden: regeln fehlen (Liste, auch leer)']
  const weitere = k.parteien.flatMap((p) => [p.name, p.kurzname])
  const nummern = new Set<number>()
  for (const r of l.regeln) {
    if (!Number.isInteger(r.nr) || nummern.has(r.nr)) f.push(`Leitfaden: Regel ${r.nr} – Nummer fehlt oder doppelt`)
    nummern.add(r.nr)
    if (!r.text?.trim()) f.push(`Leitfaden: Regel ${r.nr} ohne Text`)
    else if (r.text.length > 500) f.push(`Leitfaden: Regel ${r.nr} ist länger als 500 Zeichen`)
    else if (enthaeltParteinamen(r.text, weitere)) f.push(`Leitfaden: Regel ${r.nr} nennt eine Partei oder Person – die Regeln gehen an die Bewertung ohne Parteinamen`)
    for (const u of r.ursachen ?? []) if (!ursachen.has(u)) f.push(`Leitfaden: Regel ${r.nr} nennt Ursache ${u}, die nicht zum Thema gehört`)
  }
  if (l.suchbegriffe !== undefined) {
    const sb = l.suchbegriffe as unknown
    if (!sb || typeof sb !== 'object' || Array.isArray(sb)) f.push('Leitfaden: suchbegriffe muss { "<Ursache>": { "<Richtung>": ["Begriff", …] } } sein')
    else
      for (const [u, richtungen] of Object.entries(l.suchbegriffe)) {
        if (!ursachen.has(Number(u))) f.push(`Leitfaden: Suchbegriffe für Ursache ${u}, die nicht zum Thema gehört`)
        if (!richtungen || typeof richtungen !== 'object' || Array.isArray(richtungen) || !Object.keys(richtungen).length) f.push(`Leitfaden: Suchbegriffe zu Ursache ${u} ohne Lösungsrichtung`)
        else
          for (const [r, begriffe] of Object.entries(richtungen))
            if (!Array.isArray(begriffe) || !begriffe.length || begriffe.some((b) => typeof b !== 'string' || !b.trim()))
              f.push(`Leitfaden: Suchbegriffe zu Ursache ${u}, Richtung „${r}“ – Liste nicht leerer Begriffe`)
            else if (enthaeltParteinamen(`${r} ${begriffe.join(' ')}`, weitere)) f.push(`Leitfaden: Suchbegriffe zu Ursache ${u}, Richtung „${r}“ nennen eine Partei oder Person`)
            else
              for (const b of begriffe) {
                const n = suchbegriffInParteinamen(b, k.parteien)
                if (n) f.push(`Leitfaden: Suchbegriff „${b}“ (Ursache ${u}) steckt im Parteinamen „${n}“ – träfe dort fast jede Seite; genauer fassen`)
              }
      }
  }
  for (const [b, grund] of Object.entries(l.suchbegriffe_geprueft ?? {}))
    if (typeof grund !== 'string' || !grund.trim()) f.push(`Leitfaden: suchbegriffe_geprueft „${b}“ ohne Grund`)
    else if (l.suchbegriffe && !Object.values(l.suchbegriffe).some((r) => Object.values(r).some((x) => x.includes(b))))
      f.push(`Leitfaden: suchbegriffe_geprueft „${b}“ steht in keiner Richtung der Suchbegriffe`)
  for (const [u, liste] of Object.entries(l.buendel ?? {})) {
    if (!ursachen.has(Number(u))) f.push(`Leitfaden: Bündel für Ursache ${u}, die nicht zum Thema gehört`)
    if (!Array.isArray(liste)) {
      f.push(`Leitfaden: Bündel zu Ursache ${u} müssen eine Liste sein`)
      continue
    }
    const namen = new Set<string>()
    for (const b of liste) {
      if (typeof b !== 'string' || !b.trim() || b.length > 80) f.push(`Leitfaden: Bündel „${b}“ zu Ursache ${u} – leer oder länger als 80 Zeichen`)
      else if (namen.has(b)) f.push(`Leitfaden: Bündel „${b}“ zu Ursache ${u} doppelt`)
      else if (enthaeltParteinamen(b, weitere)) f.push(`Leitfaden: Bündel „${b}“ nennt eine Partei oder Person`)
      namen.add(b)
    }
  }
  for (const [u, liste] of Object.entries(l.hebel ?? {})) {
    if (!ursachen.has(Number(u))) f.push(`Leitfaden: Hebel für Ursache ${u}, die nicht zum Thema gehört`)
    if (!Array.isArray(liste)) {
      f.push(`Leitfaden: Hebel zu Ursache ${u} müssen eine Liste sein`)
      continue
    }
    const namen = new Set(l.buendel?.[u] ?? [])
    for (const h of liste) {
      if (typeof h !== 'string' || !h.trim() || h.length > 80) f.push(`Leitfaden: Hebel „${h}“ zu Ursache ${u} – leer oder länger als 80 Zeichen`)
      else if (namen.has(h)) f.push(`Leitfaden: Hebel „${h}“ zu Ursache ${u} doppelt (auch als Bündel?)`)
      else if (enthaeltParteinamen(h, weitere)) f.push(`Leitfaden: Hebel „${h}“ nennt eine Partei oder Person`)
      namen.add(h)
    }
  }
  if (l.gekoppelt !== undefined) {
    if (!Array.isArray(l.gekoppelt)) f.push('Leitfaden: gekoppelt muss eine Liste von Gruppen sein, etwa [[1801, 1802]]')
    else
      for (const g of l.gekoppelt)
        if (!Array.isArray(g) || g.length < 2 || new Set(g).size < g.length || g.some((u) => !ursachen.has(u)))
          f.push(`Leitfaden: gekoppelt ${JSON.stringify(g)} – je Gruppe mindestens zwei verschiedene Ursachen des Themas`)
  }
  return f
}

/** Hinweise zu Zitaten, die eine Rückfrage auslösen würden (keine Fehler – der Agent prüft die Stelle). */
export function zitatHinweise(m: ErfassteMassnahme): string[] {
  const h: string[] = []
  // Listenpunkt oder Satzrest ohne Einleitung: Wer was zusagt, steht dann nicht im Zitat.
  const anfang = m.zitat?.replace(/^\s*(?:\[\s*(?:…|\.\.\.)\s*\]|…|\.\.\.)\s*/, '').trimStart() ?? ''
  if (/^\p{Ll}/u.test(anfang))
    h.push('Zitat beginnt klein – Listenpunkt oder Satzrest? Die einleitende Zusage mitzitieren („Wir werden: […] …“)')
  return h
}

/**
 * Was für ein einzelnes Programm geprüft werden kann, ohne die übrigen zu kennen – vom Erfassungs-Agenten
 * selbst vor der Abgabe (`entwurf:programm-pruefen`) und für jedes Programm in `pruefeErfassung`.
 */
export function pruefeProgramm(k: Katalog, e: Pick<Erfassung, 'thema_id' | 'leitfaden' | 'nachtrag'>, p: ErfasstesProgramm): string[] {
  const f: string[] = []
  // Beim Nachtrag zählen nur die Ursachen des Lösungswegs.
  const ursachen = new Map(k.ursachen.filter((u) => u.thema_id === e.thema_id && imNachtrag(e, u.id)).map((u) => [u.id, u]))
  const name = `Partei ${p.partei_id} ${p.land ?? 'Bund'}`
  if (p.nicht_durchsucht !== undefined) return [`${name}: nicht durchsucht (${p.nicht_durchsucht}) – das Programm bleibt „noch nicht erfasst“ und gehört nicht in die Erfassung`]
  if (!k.parteien.some((x) => x.id === p.partei_id)) f.push(`${name}: unbekannte Partei`)
  if (p.land && !k.landesprogramme.some((l) => l.partei_id === p.partei_id && l.land === p.land && l.aktuell && l.url))
    f.push(`${name}: kein aktuelles Landesprogramm in parteien.json`)
  if (!Array.isArray(p.massnahmen)) return [...f, `${name}: massnahmen fehlen (Liste, auch leer)`]
  if (!p.massnahmen.length && !p.keine_massnahme?.trim()) f.push(`${name}: weder Maßnahmen noch keine_massnahme`)
  if (p.massnahmen.length && p.keine_massnahme) f.push(`${name}: Maßnahmen und keine_massnahme zugleich`)
  for (const b of p.neue_buendel ?? [])
    if (!b || typeof b.name !== 'string' || !b.name.trim() || !ursachen.has(b.ursache)) f.push(`${name}: neue_buendel – je Eintrag { "ursache": <ID des Themas>, "name": "…", "seite": N }`)
  for (const b of p.eigene_synonyme ?? [])
    if (!b || typeof b.begriff !== 'string' || !b.begriff.trim() || !ursachen.has(b.ursache) || typeof b.richtung !== 'string')
      f.push(`${name}: eigene_synonyme – je Eintrag { "begriff": "…", "ursache": <ID des Themas>, "richtung": "…" }`)
  if (p.stand_im_pdf !== undefined && typeof p.stand_im_pdf !== 'string') f.push(`${name}: stand_im_pdf muss Text sein`)
  if (p.nicht_erfasst !== undefined && !Array.isArray(p.nicht_erfasst)) f.push(`${name}: nicht_erfasst muss eine Liste sein`)
  for (const n of Array.isArray(p.nicht_erfasst) ? p.nicht_erfasst : [])
    if (!n || !ursachen.has(n.ursache) || !Array.isArray(n.seiten) || !n.seiten.length || !n.seiten.every((x) => Number.isInteger(x) && x > 0) || typeof n.grund !== 'string' || !n.grund.trim())
      f.push(`${name}: nicht_erfasst – je Eintrag { "ursache": <ID des Themas>, "seiten": [gelesene PDF-Seiten], "grund": "…" }`)
  if (p.hebel_nicht_gefunden !== undefined && !Array.isArray(p.hebel_nicht_gefunden)) f.push(`${name}: hebel_nicht_gefunden muss eine Liste sein`)
  for (const n of Array.isArray(p.hebel_nicht_gefunden) ? p.hebel_nicht_gefunden : [])
    if (!n || !ursachen.has(n.ursache) || !(e.leitfaden?.hebel?.[String(n.ursache)] ?? []).includes(n.hebel) || !Array.isArray(n.seiten) || !n.seiten.length || !n.seiten.every((x) => Number.isInteger(x) && x > 0) || typeof n.grund !== 'string' || !n.grund.trim())
      f.push(`${name}: hebel_nicht_gefunden – je Eintrag { "ursache": <ID>, "hebel": "<Name genau wie im Auftrag>", "seiten": [gelesene PDF-Seiten], "grund": "…" }`)
  // Für das Programm zulässige Ursachen: Landesprogramme nur Ebene Land.
  const zulaessig = [...ursachen.values()].filter((u) => !p.land || (u.ebene ?? 'bund') === 'land').map((u) => u.id)
  const buendelGesehen = new Map<string, number>()
  for (const [j, m] of p.massnahmen.entries()) {
    const was = `${name}, Maßnahme ${j + 1}`
    if (!m.beschreibung?.trim()) f.push(`${was}: beschreibung fehlt`)
    else if (m.beschreibung.length > 200) f.push(`${was}: beschreibung ist länger als 200 Zeichen (${m.beschreibung.length})`)
    if (!m.zitat?.trim()) f.push(`${was}: zitat fehlt`)
    else if (m.zitat.length > 800) f.push(`${was}: zitat ist länger als 800 Zeichen`)
    else if (m.beschreibung) {
      const zahlen = fehlendeZahlen(m.beschreibung, m.zitat)
      if (zahlen.length) f.push(`${was}: Zahl ${zahlen.join(', ')} steht in der Beschreibung, aber nicht im Zitat – nichts dazuerfinden oder das Zitat erweitern`)
    }
    if (!Number.isInteger(m.seite) || m.seite < 1) f.push(`${was}: seite muss die PDF-Seite sein (ganze Zahl ≥ 1)`)
    if (!Array.isArray(m.ursachen_ids)) f.push(`${was}: ursachen_ids fehlen (Liste, leer nur mit ursachen_offen)`)
    if (m.ursachen_offen !== undefined && !Array.isArray(m.ursachen_offen)) f.push(`${was}: ursachen_offen muss eine Liste sein`)
    const alle = vorgeschlageneUrsachen(m)
    if (!alle.length) f.push(`${was}: ursachen_ids fehlen`)
    if (new Set(alle).size < alle.length) f.push(`${was}: Ursache doppelt (in ursachen_ids und ursachen_offen?)`)
    for (const id of alle) {
      const u = ursachen.get(id)
      if (!u) f.push(`${was}: Ursache ${id} gehört nicht zum Thema`)
      else if (p.land && (u.ebene ?? 'bund') !== 'land') f.push(`${was}: Landesprogramme nur für Ursachen mit ebene „land“ (${id} ist Bund)`)
    }
    const fehlt = fehlendeGekoppelte(e.leitfaden?.gekoppelt, m.ursachen_ids ?? [], zulaessig)
    if (fehlt.length) f.push(`${was}: Ursachen gehören laut Leitfaden zusammen – auch ${fehlt.join(', ')} in ursachen_ids eintragen`)
    const fehltOffen = fehlendeGekoppelte(e.leitfaden?.gekoppelt, alle, zulaessig)
    if (!fehlt.length && fehltOffen.length) f.push(`${was}: Ursachen gehören laut Leitfaden zusammen – auch ${fehltOffen.join(', ')} eintragen (ursachen_ids oder ursachen_offen wie die übrigen)`)
    if (m.buendel !== undefined) {
      const erlaubt = alle.flatMap((u) => buendelVon(e.leitfaden, u))
      if (!erlaubt.includes(m.buendel))
        f.push(`${was}: Bündel „${m.buendel}“ steht im Leitfaden nicht bei ihren Ursachen – im Protokoll unter „Neue Bündel“ melden; der Koordinator ergänzt den Leitfaden für alle Programme`)
      const vorher = buendelGesehen.get(m.buendel)
      if (vorher !== undefined) f.push(
          `${was}: Bündel „${m.buendel}“ schon bei Maßnahme ${vorher} – gleichartige Zusage: nur die konkreteste Stelle behalten; andere Zusage: ohne „buendel“ erfassen oder unter „neue_buendel“ melden, nie zusammenfassen`,
        )
      else buendelGesehen.set(m.buendel, j + 1)
    }
  }
  // Hebel-Checkliste: jeder Hebel einer zulässigen Ursache beantwortet (nicht beim Nachtrag eines Lösungswegs).
  if (!e.nachtrag && p.massnahmen.length + (p.keine_massnahme ? 1 : 0))
    for (const u of zulaessig)
      for (const h of e.leitfaden?.hebel?.[String(u)] ?? [])
        if (!p.massnahmen.some((m) => m.buendel === h) && !(p.hebel_nicht_gefunden ?? []).some((n) => n.ursache === u && n.hebel === h))
          f.push(`${name}: Hebel „${h}“ (Ursache ${u}) nicht beantwortet – Maßnahme mit "buendel": "${h}" oder Eintrag in hebel_nicht_gefunden mit gelesenen Seiten und Grund`)
  return f
}

/**
 * Kurzbericht eines Erfassungs-Agenten in fester Form – nur aus den Daten, nie frei formuliert. So kann
 * kein Bericht etwas anderes sagen als die gespeicherte Datei (Thema 9: „906: 2“ und zugleich
 * „906 keine Maßnahme“). Der Agent gibt genau diese Zeilen zurück.
 */
export function kurzbericht(name: string, p: ErfasstesProgramm, hinweise: number, ziel: string): string {
  const m = Array.isArray(p.massnahmen) ? p.massnahmen : []
  if (p.nicht_durchsucht !== undefined) return [`${name}: nicht durchsucht – ${p.nicht_durchsucht}`, 'Bleibt „noch nicht erfasst“.'].join('\n')
  const jeUrsache = new Map<number, number>()
  for (const x of m) for (const u of vorgeschlageneUrsachen(x)) jeUrsache.set(u, (jeUrsache.get(u) ?? 0) + 1)
  const offen = m.flatMap((x, j) => (x.ursachen_offen?.length ? [`Maßnahme ${j + 1} (S. ${x.seite}) offen ${x.ursachen_offen.join(', ')}`] : []))
  const gebuendelt = m.filter((x) => x.buendel).length
  const ergebnis = m.length
    ? `${m.length} Maßnahmen (${[...jeUrsache].sort(([a], [b]) => a - b).map(([u, n]) => `${u}: ${n}`).join(', ')}${offen.length ? `; ${offen.length} mit offener Zuordnung` : ''}${gebuendelt ? `; ${gebuendelt} gebündelt` : ''})`
    : 'keine Maßnahme'
  const liste = (l: string[]) => (l.length ? l.join('; ') : 'keine')
  return [
    `${name}: ${ergebnis}${hinweise ? `, ${hinweise} Hinweise` : ''} – gespeichert in ${ziel}`,
    `Grenzfälle: ${liste(offen)}`,
    `Neue Bündel: ${liste((p.neue_buendel ?? []).map((b) => `${b.ursache} „${b.name}“${b.seite ? ` (S. ${b.seite})` : ''}`))}`,
    `Eigene Synonyme: ${liste((p.eigene_synonyme ?? []).map((b) => `„${b.begriff}“ → ${b.ursache} ${b.richtung}`))}`,
    `Nicht erfasst: ${liste((p.nicht_erfasst ?? []).map((n) => `${n.ursache} (S. ${n.seiten.join(', ')})`))}`,
    ...(p.hebel_nicht_gefunden?.length ? [`Hebel ohne Fund: ${liste(p.hebel_nicht_gefunden.map((n) => `${n.ursache} „${n.hebel}“`))}`] : []),
    `Stand im PDF: ${p.stand_im_pdf?.trim() || 'wie im Auftrag'}`,
  ].join('\n')
}

/** Prüft die Erfassung gegen den Katalog, bevor irgendetwas geschrieben wird. */
export function pruefeErfassung(k: Katalog, e: Erfassung): string[] {
  const f: string[] = []
  if (!k.ursachen.some((u) => u.thema_id === e.thema_id)) f.push(`Thema ${e.thema_id} hat keine Ursachen`)
  if (e.leitfaden && e.leitfaden.thema_id !== e.thema_id) f.push(`Leitfaden gehört zu Thema ${e.leitfaden.thema_id}, die Erfassung zu ${e.thema_id}`)
  else if (e.leitfaden) f.push(...pruefeLeitfaden(k, e.leitfaden))
  f.push(...pruefeSuchbegriffe(k, e))
  f.push(...pruefeNachtrag(k, e, e.leitfaden))
  const gesehen = new Set<string>()
  for (const p of e.programme) {
    const name = `Partei ${p.partei_id} ${p.land ?? 'Bund'}`
    if (gesehen.has(name)) f.push(`${name}: doppelt in der Erfassung`)
    gesehen.add(name)
    const hatEintrag = k.abdeckung.some((a) => a.thema_id === e.thema_id && a.partei_id === p.partei_id && (a.land ?? null) === p.land && a.aktuell)
    if (hatEintrag && !e.nachtrag) f.push(`${name}: hat zu diesem Thema schon einen Eintrag – einen Lösungsweg nachtragen mit /forderung-erfassen`)
    if (!hatEintrag && e.nachtrag) f.push(`${name}: Nachtrag, aber das Programm ist zu diesem Thema noch nicht erfasst – erst /thema-erfassen`)
    f.push(...pruefeProgramm(k, e, p))
  }
  return f
}

/** Prüft die Bewertung: jede Kennung genau einmal, Instrumente bekannt und auf einer Ebene. */
export function pruefeBewertung(k: Katalog, e: Erfassung, b: Bewertung, fest?: Kennung[]): string[] {
  // Dieselbe Prüfung wie die Selbstprüfung des Bewertungs-Agenten (pruefeAntwort), aber gegen die aus der
  // Erfassung neu gebaute Liste: Passt die Prüfsumme nicht, wurde nach dem Bewerten etwas geändert.
  let liste: BlindListe
  try {
    liste = blindListe(k, e, fest)
  } catch {
    return [] // Thema fehlt – meldet pruefeErfassung
  }
  return pruefeAntwort(liste, b, { teil: false })
}

/**
 * Prüft eine Bewertung nur gegen die Blindliste – ohne Erfassung, ohne Herkunft. So kann der
 * Bewertungs-Agent seine Antwort selbst prüfen (`npm run entwurf:antwort-pruefen`), und
 * `pruefeBewertung` prüft mit genau demselben Code. Jede Kennung genau einmal, Instrumente bekannt und
 * auf einer Ebene, keine unbenutzten Instrumente, Wirksamkeit 3 nur mit Beleg, Längen.
 * `teil`: Antwort einer Teil-Neubewertung (nur `teilbewertung.zu_bewerten`, bisherige Instrumente dürfen verwendet werden).
 */
export function pruefeAntwort(liste: BlindListe, b: Bewertung, o: { teil: boolean }): string[] {
  const f: string[] = []
  if (!b || typeof b !== 'object') return ['Antwort ist kein JSON-Objekt']
  if (!b.blind_pruefsumme) f.push('blind_pruefsumme fehlt – die „pruefsumme“ aus blind.json zurückgeben')
  else if (b.blind_pruefsumme !== liste.pruefsumme)
    f.push('blind_pruefsumme passt nicht zur aktuellen Blindliste – seit npm run entwurf:blind wurde etwas geändert (Beschreibung, Zitat, Seite, Ursachen oder Instrumente). entwurf:blind neu ausführen und neu bewerten lassen')
  if (!Array.isArray(b.zuordnung)) return [...f, 'zuordnung fehlt (Liste)']
  const teil = o.teil ? liste.teilbewertung : undefined
  if (o.teil && !teil) f.push('Teil-Neubewertung, aber die Liste hat keinen Block „teilbewertung“')
  const massnahmen = new Map(liste.massnahmen.map((m) => [m.kennung, m]))
  const erwartet = teil ? new Set(teil.zu_bewerten) : new Set(massnahmen.keys())
  const vorhandene = new Map(liste.instrumente.map((i) => [i.id, i.ebene]))
  const neue = new Map((b.neue_instrumente ?? []).map((i) => [i.kennung, i]))
  const bisher = new Map((teil?.bisher.neue_instrumente ?? []).map((i) => [i.kennung, i]))
  const bisherEbene = new Map<string, string>()
  for (const z of teil?.bisher.zuordnung ?? []) if ('instrument' in z && typeof z.instrument === 'string') bisherEbene.set(z.instrument, massnahmen.get(z.kennung)?.ebene ?? '')
  for (const i of b.neue_instrumente ?? []) {
    if (!i.name?.trim()) f.push(`Instrument ${i.kennung}: name fehlt`)
    else if (i.name.length > 120) f.push(`Instrument ${i.kennung}: name ist länger als 120 Zeichen (${i.name.length})`)
    f.push(...pruefeEinzel(`Instrument ${i.kennung}`, i))
  }
  const ebenen = new Map<number | string, Set<string>>()
  const zugeordnet = new Set<string>()
  for (const z of b.zuordnung) {
    const m = massnahmen.get(z.kennung)
    if (!m) {
      f.push(`${z.kennung}: unbekannte Kennung`)
      continue
    }
    if (!erwartet.has(z.kennung)) {
      f.push(`${z.kennung}: nicht neu zu bewerten (nur teilbewertung.zu_bewerten)`)
      continue
    }
    if (zugeordnet.has(z.kennung)) f.push(`${z.kennung}: mehrfach zugeordnet`)
    zugeordnet.add(z.kennung)
    if (!Array.isArray(z.ursachen)) {
      f.push(`${z.kennung}: „ursachen“ fehlt – je Maßnahme die Ursachen, an denen sie ansetzt (auch leer)`)
      continue
    }
    // Bestätigt die Bewertung keine vorgeschlagene Ursache, wird die Maßnahme nicht eingetragen und braucht keine Bewertung.
    const vorgeschlagen = [...m.ursachen_ids, ...(m.ursachen_offen ?? [])]
    if (!z.ursachen.some((u) => vorgeschlagen.includes(u))) continue
    const fehlt = fehlendeGekoppelte(liste.gekoppelt, z.ursachen, vorgeschlagen)
    if (fehlt.length) f.push(`${z.kennung}: Ursachen gehören laut Liste („gekoppelt“) zusammen – auch ${fehlt.join(', ')} nennen oder keine davon`)
    if (!('instrument' in z) && !('einzeln' in z)) f.push(`${z.kennung}: weder instrument noch einzeln, aber Ursachen bestätigt`)
    else if ('instrument' in z) {
      const bekannt = typeof z.instrument === 'number' ? vorhandene.has(z.instrument) : neue.has(z.instrument) || bisher.has(z.instrument)
      if (!bekannt) f.push(`${z.kennung}: Instrument ${z.instrument} gibt es nicht`)
      const vorher = typeof z.instrument === 'number' ? vorhandene.get(z.instrument) : bisherEbene.get(z.instrument)
      const s = ebenen.get(z.instrument) ?? new Set(vorher ? [vorher] : [])
      s.add(m.ebene)
      ebenen.set(z.instrument, s)
    } else f.push(...pruefeEinzel(z.kennung, z.einzeln))
  }
  for (const [id, s] of ebenen) if (s.size > 1) f.push(`Instrument ${id}: Maßnahmen aus Bund und Land – je Ebene ein eigenes Instrument`)
  for (const kennung of erwartet) if (!zugeordnet.has(kennung)) f.push(`${kennung}: nicht bewertet`)
  for (const kennung of neue.keys())
    if (!b.zuordnung.some((z) => 'instrument' in z && z.instrument === kennung)) f.push(`Instrument ${kennung}: keine Maßnahme verweist darauf`)
  return f
}

/**
 * Was die Bewertung an der Zuordnung geändert hat, je Programm: nicht bestätigte Ursachen und
 * verworfene Maßnahmen. Steht im Pull Request – so ist sichtbar, ob die Entscheidung alle Programme
 * ähnlich trifft.
 */
export function zuordnungsBilanz(k: Katalog, e: Erfassung, b: Bewertung, fest?: Kennung[]): string[] {
  const zuordnung = new Map((b.zuordnung ?? []).map((z) => [z.kennung, z]))
  const kennungNach = new Map(kennungen(e, fest).map((x) => [`${x.programm}/${x.massnahme}`, x.kennung]))
  return e.programme.map((p, i) => {
    let vorgeschlagen = 0
    let offen = 0
    const weg: string[] = []
    const dazu: string[] = []
    let raus = 0
    for (const [j, m] of p.massnahmen.entries()) {
      const kennung = kennungNach.get(`${i}/${j}`)!
      const z = zuordnung.get(kennung)
      vorgeschlagen += vorgeschlageneUrsachen(m).length
      offen += m.ursachen_offen?.length ?? 0
      const bleibt = bestaetigteUrsachen(m, z)
      if (!bleibt.length) raus++
      for (const u of vorgeschlageneUrsachen(m)) if (!bleibt.includes(u)) weg.push(`${kennung} ${u}`)
      for (const u of m.ursachen_offen ?? []) if (bleibt.includes(u)) dazu.push(`${kennung} ${u}`)
    }
    const name = `${k.parteien.find((x) => x.id === p.partei_id)?.kurzname ?? p.partei_id} (${p.land ?? 'Bund'})`
    return (
      `${name}: ${p.massnahmen.length} Maßnahmen, ${vorgeschlagen} Zuordnungen (davon ${offen} offen); ` +
      `nicht bestätigt ${weg.length}${weg.length ? ` (${weg.join(', ')})` : ''}; offene bestätigt ${dazu.length}; verworfen ${raus}`
    )
  })
}

/**
 * Hinweise (keine Fehler) zur Bewertung: Fast alles „offen“ heißt meist, dass der Forschungsstand
 * nicht recherchiert wurde; sehr viele Instrumente für wenige Maßnahmen heißt, dass gleiche
 * Lösungswege nicht zusammengefasst wurden.
 */
export function bewertungsHinweise(b: Bewertung): string[] {
  const h: string[] = []
  const werte = [...(b.neue_instrumente ?? []), ...(b.zuordnung ?? []).flatMap((z) => ('einzeln' in z ? [z.einzeln] : []))]
  const offen = werte.filter((w) => w.evidenz === 'offen').length
  if (werte.length >= 5 && offen / werte.length > 0.6) h.push(`${offen} von ${werte.length} Bewertungen mit evidenz „offen“ – Forschungsstand recherchieren lassen`)
  const belegt = werte.filter((w) => w.evidenz !== 'offen' && !w.beleg_studie_url)
  if (belegt.length) h.push(`${belegt.length} Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url`)
  const massnahmen = (b.zuordnung ?? []).length
  if (massnahmen >= 20 && (b.neue_instrumente ?? []).length / massnahmen > 0.5)
    h.push(`${(b.neue_instrumente ?? []).length} Instrumente für ${massnahmen} Maßnahmen – gleiche Lösungswege zusammenfassen?`)
  return h
}

/**
 * Hinweise zur Zuordnung zu Ursachen: Sieht der Bewertungs-Agent eine weitere Ursache, oder ordnen
 * Programme denselben Lösungsweg unterschiedlich vielen Ursachen zu, prüft der Koordinator das nach.
 * Mehrfachzuordnung bringt Punkte bei mehr Problemen – sie muss für alle Programme gleich gehandhabt werden.
 */
export function zuordnungsHinweise(k: Katalog, e: Erfassung, b: Bewertung, fest?: Kennung[]): string[] {
  const h: string[] = []
  const alle = new Map(kennungen(e, fest).map((x) => [x.kennung, x]))
  const zuordnung = new Map((b.zuordnung ?? []).map((z) => [z.kennung, z]))
  const jeInstrument = new Map<string, { kennung: string; ursachen: string }[]>()
  for (const z of b.zuordnung ?? []) {
    const x = alle.get(z.kennung)
    if (!x) continue
    const m = e.programme[x.programm].massnahmen[x.massnahme]
    const mehr = (z.ursachen ?? []).filter((u) => !vorgeschlageneUrsachen(m).includes(u))
    if (mehr.length) h.push(`${z.kennung}: Bewertung sieht zusätzlich Ursache ${mehr.join(', ')} – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen`)
    if ('instrument' in z) {
      const liste = jeInstrument.get(String(z.instrument)) ?? []
      liste.push({ kennung: z.kennung, ursachen: bestaetigteUrsachen(m, z).sort((a, c) => a - c).join('+') })
      jeInstrument.set(String(z.instrument), liste)
    }
  }
  for (const [i, liste] of jeInstrument) {
    const arten = new Set(liste.map((x) => x.ursachen))
    if (arten.size > 1)
      h.push(`Instrument ${i}: Maßnahmen mit unterschiedlichen Ursachen (${liste.map((x) => `${x.kennung} ${x.ursachen}`).join(', ')}) – gleicher Lösungsweg, gleiche Zuordnung?`)
  }
  // Ordnet ein Programm deutlich öfter mehreren Ursachen zu als die übrigen, holt es leichter Punkte.
  const kennungNach = new Map([...alle.values()].map((x) => [`${x.programm}/${x.massnahme}`, x.kennung]))
  const mehrfach = e.programme.map((p, i) => {
    const bleibt = p.massnahmen.map((m, j) => bestaetigteUrsachen(m, zuordnung.get(kennungNach.get(`${i}/${j}`)!))).filter((u) => u.length)
    return { p, n: bleibt.length, m: bleibt.filter((u) => u.length > 1).length }
  })
  const gesamt = mehrfach.reduce((a, x) => a + x.n, 0)
  const anteil = gesamt ? mehrfach.reduce((a, x) => a + x.m, 0) / gesamt : 0
  for (const x of mehrfach)
    if (x.n >= 3 && x.m / x.n > Math.max(0.3, 2 * anteil))
      h.push(
        `${k.parteien.find((p) => p.id === x.p.partei_id)?.kurzname ?? x.p.partei_id} (${x.p.land ?? 'Bund'}): ${x.m} von ${x.n} Maßnahmen mehreren Ursachen zugeordnet ` +
          `(alle Programme: ${Math.round(anteil * 100)} %) – Mehrfachzuordnung prüfen`,
      )
  return h
}

type Json = Record<string, unknown>

/**
 * Schreibt Erfassung und Bewertung in die Themendatei (als Objekt): neue Instrumente,
 * je Programm ein Abdeckungseintrag, alles als ungeprüfter KI-Entwurf mit neuen IDs.
 */
export function eintragen(k: Katalog, datei: Json, e: Erfassung, b: Bewertung, heute: string, fest?: Kennung[]): Json {
  let id = naechsteId(k)
  const zuordnung = new Map((b.zuordnung ?? []).map((z) => [z.kennung, z]))
  const kennungNach = new Map(kennungen(e, fest).map((x) => [`${x.programm}/${x.massnahme}`, x.kennung]))
  const zuordnungVon = (i: number, j: number) => zuordnung.get(kennungNach.get(`${i}/${j}`)!)!
  // Instrumente, auf die nur verworfene Maßnahmen verweisen, kommen nicht in den Katalog.
  const benutzt = new Set(
    e.programme.flatMap((p, i) => p.massnahmen.flatMap((m, j) => {
      const z = zuordnungVon(i, j)
      return !verworfen(m, z) && 'instrument' in z ? [z.instrument] : []
    })),
  )
  const neueIds = new Map<string, number>()
  const instrumente = [...((datei.instrumente as Json[] | undefined) ?? [])]
  for (const i of b.neue_instrumente ?? []) {
    if (!benutzt.has(i.kennung)) continue
    neueIds.set(i.kennung, id)
    const { kennung: _, ...rest } = i
    instrumente.push({ id: id++, ...rest, entwurf_herkunft: 'blind' })
  }
  const abdeckung = [...((datei.abdeckung as Json[] | undefined) ?? [])]
  // Nachtrag: neue Fundstellen ergänzen den vorhandenen Eintrag des Programms (Kopf und `durchsucht_fuer` bleiben).
  const vorhanden = (p: ErfasstesProgramm) =>
    abdeckung.findIndex((a) => a.partei_id === p.partei_id && ((a.land as string | undefined) ?? null) === p.land && !a.landtagswahl === !p.land &&
      (!p.land || a.landtagswahl === k.landesprogramme.find((l) => l.partei_id === p.partei_id && l.land === p.land && l.aktuell)?.landtagswahl))
  const zitatSchluessel = (z: unknown) => String(z ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
  for (const [i, p] of e.programme.entries()) {
    const partei = k.parteien.find((x) => x.id === p.partei_id)!
    const lp = p.land ? k.landesprogramme.find((l) => l.partei_id === p.partei_id && l.land === p.land && l.aktuell) : undefined
    const url = lp ? lp.url! : partei.programm_url
    // Durchsucht wurde nach allen freigegebenen Ursachen, die für dieses Programm zählen.
    const durchsucht = k.ursachen.filter((u) => u.thema_id === e.thema_id && (!lp || (u.ebene ?? 'bund') === 'land')).map((u) => u.id)
    const kopf: Json = { partei_id: p.partei_id, ...(lp ? { land: lp.land, landtagswahl: lp.landtagswahl } : {}), durchsucht_fuer: durchsucht }
    const bleiben = p.massnahmen.flatMap((m, j) => (verworfen(m, zuordnungVon(i, j)) ? [] : [j]))
    const alt = e.nachtrag ? vorhanden(p) : -1
    if (e.nachtrag && alt < 0) throw new Error(`Nachtrag: ${partei.kurzname} (${p.land ?? 'Bund'}) hat noch keinen Eintrag – erst das Thema erfassen`)
    if (e.nachtrag && !bleiben.length) continue
    if (!bleiben.length) {
      // Treffer aller Suchbegriffe im Programm: Anhaltspunkt für die zweite Suche vor „geprueft“.
      const t = e.treffer?.programme.find((x) => x.partei_id === p.partei_id && x.land === p.land)
      const treffer = t ? Object.values(t.ursachen).flatMap((r) => Object.values(r).flatMap((b) => Object.values(b))).reduce((a, c) => a + c, 0) : undefined
      // Alle erfassten Stellen verworfen: Das Programm enthält nach der Bewertung ohne Parteinamen nichts, was an einer Ursache ansetzt.
      const begruendung = p.massnahmen.length
        ? `Erfasste Stellen (S. ${[...new Set(p.massnahmen.map((m) => m.seite))].join(', ')}) setzen laut Bewertung ohne Parteinamen an keiner der Ursachen an.`
        : p.keine_massnahme
      abdeckung.push({ ...kopf, keine_massnahme: { begruendung, stand: heute, ...(treffer !== undefined ? { treffer } : {}), geprueft: false, ki_entwurf: true } })
      continue
    }
    const massnahmen = bleiben.map((j) => {
      const m = p.massnahmen[j]
      const z = zuordnungVon(i, j) as Exclude<Zuordnung, { ursachen: [] }>
      const bewertung: Json =
        'instrument' in z
          ? { instrument: typeof z.instrument === 'number' ? z.instrument : neueIds.get(z.instrument) }
          : { ...z.einzeln }
      const { begruendung, evidenz, beleg_studie_url, rollen_modifikator, ...werte } = bewertung
      return {
        id: id++,
        ...('instrument' in bewertung ? { instrument: bewertung.instrument } : {}),
        beschreibung: m.beschreibung,
        ursachen_ids: bestaetigteUrsachen(m, z),
        ...('instrument' in bewertung ? {} : { ...werte, entwurf_herkunft: 'blind' }),
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
    if (alt >= 0) {
      const eintrag = abdeckung[alt]
      const bisher = (eintrag.massnahmen as Json[] | undefined) ?? []
      const schon = new Set(bisher.map((m) => zitatSchluessel(m.zitat)))
      const neu = massnahmen.filter((m) => !schon.has(zitatSchluessel(m.zitat)))
      if (!neu.length) continue
      const { keine_massnahme: _k, massnahmen: _m, ...kopfAlt } = eintrag
      abdeckung[alt] = { ...kopfAlt, massnahmen: [...bisher, ...neu] }
      continue
    }
    abdeckung.push({ ...kopf, massnahmen })
  }
  return { ...datei, ...(instrumente.length ? { instrumente } : {}), abdeckung }
}
