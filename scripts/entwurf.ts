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
import { fehlendeZahlen } from './zitate.ts'
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

export interface Erfassung {
  thema_id: number
  /** Für alle Programme dieselben – steht später in docs/perspektiven-ursachen.md. */
  suchbegriffe: Suchbegriffe
  /** Alle Begriffe in allen erfassten Programmen gezählt (`npm run entwurf:treffer`). */
  treffer?: Treffermatrix
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
}

/**
 * Eine Maßnahme der Blindliste: Instrument oder Einzelbewertung, dazu die Ursachen, an denen sie aus
 * Sicht des Bewertungs-Agenten ansetzt. Jede Ursache aus der Erfassung muss darin bestätigt sein –
 * sonst entscheidet allein der Erfassungs-Agent (der die Partei kennt), wo eine Maßnahme Punkte holt.
 */
export type Zuordnung = ({ kennung: string; instrument: number | string } | { kennung: string; einzeln: Einzelbewertung }) & { ursachen?: number[] }

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
  const freigabe = freigegeben.themen.find((t) => t.id === themaId)?.freigabe
  if (!freigabe) fehler.push(`Thema ${themaId} hat im Zielzweig keine „freigabe“ – die Betreiberin trägt Datum und bestätigte Quellen ein (daten/README.md → „Dateiformat“)`)
  else {
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

export interface Kennung {
  kennung: string
  programm: number
  massnahme: number
  /** Herkunft und Anfang der Texte beim Vergeben – damit `pruefeKennungen` vertauschte Programme und ausgetauschte Maßnahmen erkennt. */
  partei_id?: number
  land?: string | null
  beschreibung?: string
  zitat?: string
}

/** Anfang eines Texts für den Abgleich: klein, ohne Leerraum-Unterschiede, 40 Zeichen. */
const anfang = (t: string | undefined) => (t ?? '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 40)

/**
 * Feste Kennungen M01, M02 … in gemischter Reihenfolge: sortiert nach einer Prüfsumme
 * des Inhalts, nicht nach Partei. Dieselbe Erfassung ergibt immer dieselben Kennungen –
 * so passt die Bewertung beim Eintragen ohne gespeicherte Zuordnung. Ändert man danach
 * Beschreibung, Zitat oder Seite, ändern sich die Kennungen; `fest` (gespeichert von
 * `entwurf:blind`) hält sie dann stabil.
 */
export function kennungen(e: Erfassung, fest?: Kennung[]): Kennung[] {
  if (fest) return fest
  const liste = e.programme.flatMap((p, i) =>
    p.massnahmen.map((m, j) => ({
      programm: i,
      massnahme: j,
      schluessel: createHash('sha256').update(`${m.beschreibung}\n${m.zitat}\n${m.seite}`).digest('hex'),
    })),
  )
  liste.sort((a, b) => (a.schluessel < b.schluessel ? -1 : a.schluessel > b.schluessel ? 1 : a.programm - b.programm || a.massnahme - b.massnahme))
  const stellen = String(liste.length).length < 2 ? 2 : String(liste.length).length
  return liste.map((x, n) => {
    const p = e.programme[x.programm]
    const m = p.massnahmen[x.massnahme]
    return {
      kennung: `M${String(n + 1).padStart(stellen, '0')}`,
      programm: x.programm,
      massnahme: x.massnahme,
      partei_id: p.partei_id,
      land: p.land,
      beschreibung: anfang(m.beschreibung),
      zitat: anfang(m.zitat),
    }
  })
}

/**
 * Passt eine gespeicherte Zuordnung noch zur Erfassung? Jede Maßnahme genau einmal, keine fremde,
 * dasselbe Programm an derselben Stelle – und keine ausgetauschte Maßnahme: Eine Textkorrektur
 * ändert Beschreibung oder Zitat, sind beide anders, ist es eine andere Maßnahme.
 */
export function pruefeKennungen(e: Erfassung, fest: Kennung[]): string[] {
  const f: string[] = []
  const erwartet = new Set(e.programme.flatMap((p, i) => p.massnahmen.map((_, j) => `${i}/${j}`)))
  const gesehen = new Set<string>()
  const namen = new Set<string>()
  for (const x of fest) {
    const pos = `${x.programm}/${x.massnahme}`
    if (!erwartet.has(pos)) f.push(`${x.kennung}: Maßnahme ${pos} gibt es in der Erfassung nicht mehr`)
    else {
      const p = e.programme[x.programm]
      const m = p.massnahmen[x.massnahme]
      if ((x.partei_id !== undefined && x.partei_id !== p.partei_id) || (x.land !== undefined && x.land !== p.land))
        f.push(`${x.kennung}: Programm ${x.programm} ist jetzt ein anderes (Partei ${p.partei_id}, ${p.land ?? 'Bund'}) – Programme umsortiert?`)
      else if (x.beschreibung !== undefined && x.zitat !== undefined && x.beschreibung !== anfang(m.beschreibung) && x.zitat !== anfang(m.zitat))
        f.push(`${x.kennung}: Maßnahme ${pos} hat neue Beschreibung und neues Zitat – ausgetauscht?`)
    }
    if (gesehen.has(pos)) f.push(`Maßnahme ${pos}: mehrfach in der Zuordnung`)
    if (namen.has(x.kennung)) f.push(`${x.kennung}: doppelt vergeben`)
    gesehen.add(pos)
    namen.add(x.kennung)
  }
  for (const pos of erwartet) if (!gesehen.has(pos)) f.push(`Maßnahme ${pos}: fehlt in der gespeicherten Zuordnung`)
  return f
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
  instrumente: { id: number; name: string; ebene: string | null; wirksamkeit: number; umsetzbarkeit: number; evidenz?: string | null; begruendung: string }[]
  massnahmen: { kennung: string; ebene: 'bund' | 'land'; beschreibung: string; zitat: string; ursachen_ids: number[] }[]
}

/** Was der Bewertungs-Agent sieht: Thema, Ursachen, vorhandene Instrumente und Maßnahmen ohne Partei. */
export function blindListe(k: Katalog, e: Erfassung, fest?: Kennung[]): BlindListe {
  const thema = k.themen.find((t) => t.id === e.thema_id)
  if (!thema) throw new Error(`Thema ${e.thema_id} nicht im Katalog`)
  const weitere = k.parteien.flatMap((p) => [p.name, p.kurzname])
  const massnahmen = kennungen(e, fest).map(({ kennung, programm, massnahme }) => {
    const p = e.programme[programm]
    const m = p.massnahmen[massnahme]
    return {
      kennung,
      ebene: p.land ? ('land' as const) : ('bund' as const),
      beschreibung: neutralisiere(m.beschreibung, weitere),
      zitat: neutralisiere(m.zitat, weitere),
      ursachen_ids: m.ursachen_ids,
    }
  })
  const liste: Omit<BlindListe, 'pruefsumme'> = {
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
  return { pruefsumme: createHash('sha256').update(JSON.stringify(liste)).digest('hex'), ...liste }
}

/** Maßnahmen der Blindliste, in denen nach dem Neutralisieren noch verdächtige Wörter stehen. */
export function blindReste(liste: Pick<BlindListe, 'massnahmen'>): { kennung: string; reste: string[] }[] {
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
  auftrag: 'bewertung-auftrag.txt',
  antwort: 'bewertung-antwort.txt',
  rueckfragen: 'rueckfragen.md',
}

/**
 * Liegt alles vor, was ein Eingriff des Koordinators sichtbar macht? Die Rohantwort jedes
 * Erfassungs-Agenten, der Auftrag an den Bewertungs-Agenten (mit der Prüfsumme der Blindliste,
 * ohne Parteinamen), dessen Antwort und die Liste der Rückfragen (auch „keine“).
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
  if (!auftrag) f.push(`protokoll/${PROTOKOLL.auftrag} fehlt – den vollständigen Auftrag an den Bewertungs-Agenten speichern`)
  else {
    if (pruefsumme && !auftrag.includes(pruefsumme)) f.push(`protokoll/${PROTOKOLL.auftrag} enthält nicht die Blindliste mit Prüfsumme ${pruefsumme.slice(0, 12)}…`)
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
const ursachenDerErfassung = (k: Katalog, e: Erfassung) =>
  k.ursachen.filter((u) => u.thema_id === e.thema_id && e.programme.some((p) => !p.land || (u.ebene ?? 'bund') === 'land'))

/** Ursachen, für die ein Programm durchsucht wird. */
const ursachenFuer = (k: Katalog, e: Erfassung, p: ErfasstesProgramm) =>
  k.ursachen.filter((u) => u.thema_id === e.thema_id && (!p.land || (u.ebene ?? 'bund') === 'land'))

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
      if (p.massnahmen.some((m) => m.ursachen_ids.includes(u.id))) continue
      const richtungen = Object.entries(t.ursachen[String(u.id)] ?? {}).map(([r, b]) => [r, Object.values(b).reduce((a, c) => a + c, 0)] as const)
      const summe = richtungen.reduce((a, [, n]) => a + n, 0)
      if (summe >= TREFFER_OHNE_MASSNAHME)
        h.push(`${name(p)}: ${summe} Treffer zu Ursache ${u.id} (${richtungen.filter(([, n]) => n).map(([r, n]) => `${r} ${n}`).join(', ')}), aber keine Maßnahme – Fundstellen prüfen lassen oder Grund im Protokoll`)
    }
  }
  return h
}

/** Prüft die Erfassung gegen den Katalog, bevor irgendetwas geschrieben wird. */
export function pruefeErfassung(k: Katalog, e: Erfassung): string[] {
  const f: string[] = []
  const ursachen = new Map(k.ursachen.filter((u) => u.thema_id === e.thema_id).map((u) => [u.id, u]))
  if (!ursachen.size) f.push(`Thema ${e.thema_id} hat keine Ursachen`)
  f.push(...pruefeSuchbegriffe(k, e))
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
      else if (m.beschreibung.length > 200) f.push(`${was}: beschreibung ist länger als 200 Zeichen (${m.beschreibung.length})`)
      if (!m.zitat?.trim()) f.push(`${was}: zitat fehlt`)
      else if (m.zitat.length > 800) f.push(`${was}: zitat ist länger als 800 Zeichen`)
      else if (m.beschreibung) {
        const zahlen = fehlendeZahlen(m.beschreibung, m.zitat)
        if (zahlen.length) f.push(`${was}: Zahl ${zahlen.join(', ')} steht in der Beschreibung, aber nicht im Zitat – nichts dazuerfinden oder das Zitat erweitern`)
      }
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
export function pruefeBewertung(k: Katalog, e: Erfassung, b: Bewertung, fest?: Kennung[]): string[] {
  const f: string[] = []
  // Gehört die Bewertung zu genau dieser Liste? Sonst wurden Texte, Maßnahmen oder vorhandene
  // Instrumente nach dem Bewerten geändert – und die Werte gälten für etwas anderes als bewertet.
  let pruefsumme: string | null = null
  try {
    pruefsumme = blindListe(k, e, fest).pruefsumme
  } catch {
    // Thema fehlt – meldet pruefeErfassung
  }
  if (!b.blind_pruefsumme) f.push('blind_pruefsumme fehlt – der Bewertungs-Agent gibt die „pruefsumme“ aus blind.json zurück')
  else if (pruefsumme && b.blind_pruefsumme !== pruefsumme)
    f.push('blind_pruefsumme passt nicht zur aktuellen Blindliste – seit npm run entwurf:blind wurde etwas geändert (Beschreibung, Zitat, Seite, Ursachen oder Instrumente). entwurf:blind neu ausführen und neu bewerten lassen')
  const alle = new Map(kennungen(e, fest).map((x) => [x.kennung, x]))
  const vorhandene = new Set(k.instrumente.filter((i) => i.thema_id === e.thema_id).map((i) => i.id))
  const neue = new Map((b.neue_instrumente ?? []).map((i) => [i.kennung, i]))
  for (const i of b.neue_instrumente ?? []) {
    if (!i.name?.trim()) f.push(`Instrument ${i.kennung}: name fehlt`)
    else if (i.name.length > 120) f.push(`Instrument ${i.kennung}: name ist länger als 120 Zeichen`)
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
    const erfasst = e.programme[x.programm].massnahmen[x.massnahme].ursachen_ids
    if (!Array.isArray(z.ursachen)) f.push(`${z.kennung}: „ursachen“ fehlt – der Bewertungs-Agent bestätigt jede Zuordnung zu einer Ursache`)
    else
      for (const u of erfasst)
        if (!z.ursachen.includes(u))
          f.push(`${z.kennung}: Zuordnung zu Ursache ${u} nicht bestätigt – Erfassungs-Agent die Stelle prüfen lassen, Zuordnung korrigieren und entwurf:blind neu ausführen`)
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
  const jeInstrument = new Map<string, { kennung: string; ursachen: string }[]>()
  for (const z of b.zuordnung ?? []) {
    const x = alle.get(z.kennung)
    if (!x) continue
    const erfasst = e.programme[x.programm].massnahmen[x.massnahme].ursachen_ids
    const mehr = (z.ursachen ?? []).filter((u) => !erfasst.includes(u))
    if (mehr.length) h.push(`${z.kennung}: Bewertung sieht zusätzlich Ursache ${mehr.join(', ')} – Erfassung prüfen (gleich für alle Programme)`)
    if ('instrument' in z) {
      const liste = jeInstrument.get(String(z.instrument)) ?? []
      liste.push({ kennung: z.kennung, ursachen: [...erfasst].sort((a, c) => a - c).join('+') })
      jeInstrument.set(String(z.instrument), liste)
    }
  }
  for (const [i, liste] of jeInstrument) {
    const arten = new Set(liste.map((x) => x.ursachen))
    if (arten.size > 1)
      h.push(`Instrument ${i}: Maßnahmen mit unterschiedlichen Ursachen (${liste.map((x) => `${x.kennung} ${x.ursachen}`).join(', ')}) – gleicher Lösungsweg, gleiche Zuordnung?`)
  }
  // Ordnet ein Programm deutlich öfter mehreren Ursachen zu als die übrigen, holt es leichter Punkte.
  const mehrfach = e.programme.map((p) => ({ p, n: p.massnahmen.length, m: p.massnahmen.filter((m) => m.ursachen_ids.length > 1).length }))
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
  const neueIds = new Map<string, number>()
  const instrumente = [...((datei.instrumente as Json[] | undefined) ?? [])]
  for (const i of b.neue_instrumente ?? []) {
    neueIds.set(i.kennung, id)
    const { kennung: _, ...rest } = i
    instrumente.push({ id: id++, ...rest, entwurf_herkunft: 'blind' })
  }
  const zuordnung = new Map((b.zuordnung ?? []).map((z) => [z.kennung, z]))
  const kennungNach = new Map(kennungen(e, fest).map((x) => [`${x.programm}/${x.massnahme}`, x.kennung]))
  const abdeckung = [...((datei.abdeckung as Json[] | undefined) ?? [])]
  for (const [i, p] of e.programme.entries()) {
    const partei = k.parteien.find((x) => x.id === p.partei_id)!
    const lp = p.land ? k.landesprogramme.find((l) => l.partei_id === p.partei_id && l.land === p.land && l.aktuell) : undefined
    const url = lp ? lp.url! : partei.programm_url
    // Durchsucht wurde nach allen freigegebenen Ursachen, die für dieses Programm zählen.
    const durchsucht = k.ursachen.filter((u) => u.thema_id === e.thema_id && (!lp || (u.ebene ?? 'bund') === 'land')).map((u) => u.id)
    const kopf: Json = { partei_id: p.partei_id, ...(lp ? { land: lp.land, landtagswahl: lp.landtagswahl } : {}), durchsucht_fuer: durchsucht }
    if (!p.massnahmen.length) {
      // Treffer aller Suchbegriffe im Programm: Anhaltspunkt für die zweite Suche vor „geprueft“.
      const t = e.treffer?.programme.find((x) => x.partei_id === p.partei_id && x.land === p.land)
      const treffer = t ? Object.values(t.ursachen).flatMap((r) => Object.values(r).flatMap((b) => Object.values(b))).reduce((a, c) => a + c, 0) : undefined
      abdeckung.push({ ...kopf, keine_massnahme: { begruendung: p.keine_massnahme, stand: heute, ...(treffer !== undefined ? { treffer } : {}), geprueft: false, ki_entwurf: true } })
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
    abdeckung.push({ ...kopf, massnahmen })
  }
  return { ...datei, ...(instrumente.length ? { instrumente } : {}), abdeckung }
}
