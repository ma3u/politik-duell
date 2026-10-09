import {
  ROLLEN_IDS,
  type AbdeckungEintrag,
  type Ebene,
  type HaltungEintrag,
  type HaltungPosition,
  type InstrumentEintrag,
  type Land,
  type Landesprogramm,
  type Massnahme,
  type Partei,
  type Thema,
  type Ursache,
  type Zielkonflikt,
} from './types.ts'
import { werteStimmen } from '../pruefung/auswertung.ts'
import { ohneParteinamen } from '../../supabase/functions/_shared/ki.ts'

// ---------------------------------------------------------------------------
// Kuratierter Datenkatalog (Ordner `daten/`, Format siehe daten/README.md).
//
// Dieses Modul prüft die JSON-Dateien und baut daraus die flachen Listen,
// die App, Seed und Datenbank nutzen. Es ist reines TypeScript ohne Datei-
// oder Browser-Zugriff: Die App lädt die Dateien über Vite, die Skripte über
// node:fs – geprüft wird überall gleich.
// ---------------------------------------------------------------------------

/** Ausdrückliche Feststellung, dass ein Programm zu einem Thema nichts enthält. */
export interface KeineMassnahme {
  begruendung: string
  stand: string
  geprueft: boolean
  ki_entwurf?: boolean
}

/** Abdeckung im Repo: wie in der Datenbank, plus Prüfstatus des ganzen Eintrags. */
export interface Abdeckung extends AbdeckungEintrag {
  /** true, wenn `keine_massnahme` bzw. alle Maßnahmen der Partei zum Thema geprüft sind. */
  geprueft: boolean
  /**
   * true, wenn der Eintrag nicht ganz geprüft ist, aber jeder ungeprüfte Teil als
   * KI-Entwurf gekennzeichnet ist – dann zählt er in der geschlossenen Testphase.
   */
  ki_entwurf: boolean
  /** Nur bei Landesprogrammen: die Landtagswahl, zu der das Programm gehört. */
  landtagswahl?: string
  /** false bei Landesprogrammen früherer Wahlperioden: bleiben stehen, zählen aber nicht mehr. */
  aktuell: boolean
}

/**
 * Instrument: ein Lösungsweg, den mehrere Programme vorschlagen (etwa „Handyverbot an
 * Schulen“). Wirksamkeit, Umsetzbarkeit und Begründung stehen einmal hier und gelten
 * für jede Maßnahme, die darauf verweist – so bleibt die Bewertung über Parteien,
 * Länder und Wahlperioden gleich, und Prüfende bewerten es nur einmal.
 */
export interface Instrument {
  id: number
  thema_id: number
  name: string
  wirksamkeit: Massnahme['wirksamkeit']
  umsetzbarkeit: Massnahme['umsetzbarkeit']
  begruendung: string
  evidenz?: Massnahme['evidenz']
  beleg_studie_url?: string
  rollen_modifikator?: Massnahme['rollen_modifikator']
  /** Zahl der Bewertungen durch Prüfende (0 = noch Entwurf). */
  bewertungen: number
  /** Herkunft der Entwurfswerte: Blindbewertung oder mit Kenntnis der Partei; fehlt bei älteren Einträgen. */
  entwurf_herkunft?: EntwurfHerkunft
  /**
   * ID des gleichen Lösungswegs auf der anderen Ebene (Bund ↔ Land): Instrumente gelten je für eine Ebene,
   * die Forderungskarte führt beide zusammen. Das Gegenstück verweist zurück.
   */
  entspricht?: number
  /** Nur Mock: Schlagwörter, mit denen die Mock-Analyse Forderungen diesem Instrument zuordnet. */
  schlagwoerter?: string[]
}

export type EntwurfHerkunft = 'blind' | 'nicht_blind'

/** Ursache im Repo: mit Vermerk, wenn sie erst nach dem Blick in die Programme dazukam. */
export interface KatalogUrsache extends Ursache {
  nachtraeglich?: string
}

/**
 * Freigabe der Ursachen durch die Betreiberin: Datum und die Ursachen, deren Quellen sie im Original
 * bestätigt hat. Erst damit dürfen Maßnahmen erfasst werden (npm run ursachen:freigegeben).
 * `art: "ki"`: KI-Freigabe für die geschlossene Testphase – Phase A stand fest (Programmsperre), bevor
 * erfasst wurde, aber niemand hat die Quellen geprüft. Geprüfte Einträge verlangen eine Freigabe ohne `art`.
 */
export interface Freigabe {
  datum: string
  quellen_bestaetigt: number[]
  art?: 'ki'
}

/** Thema im Repo: mit Freigabe der Ursachen. */
export interface KatalogThema extends Thema {
  freigabe?: Freigabe
}

/** Partei im Repo: mit Prüfsumme der ausgewerteten Fassung des Bundesprogramms. */
export interface KatalogPartei extends Partei {
  programm_sha256?: string
}

/** Maßnahme im Repo: wie in der Datenbank, plus Herkunft der Bewertung und Wahlperiode. */
export interface KatalogMassnahme extends Massnahme {
  /** Instrument, aus dem Wirksamkeit, Umsetzbarkeit und Begründung stammen. */
  instrument_id?: number
  /** Nur bei Landesprogrammen: die Landtagswahl, zu der das Programm gehört. */
  landtagswahl?: string
  /** Nur bei Maßnahmen ohne Instrument: Herkunft der Entwurfswerte (siehe Instrument). */
  entwurf_herkunft?: EntwurfHerkunft
  /** Nur bei Maßnahmen ohne Instrument: Zahl der Bewertungen durch Prüfende. */
  bewertungen?: number
}

/** Landesprogramm im Repo: mit Wahl, zu der es gehört. */
export interface LandesprogrammEintrag extends Landesprogramm {
  landtagswahl: string
  /** SHA-256 der ausgewerteten PDF-Datei: belegt die Fassung, auch wenn die Partei sie austauscht. */
  sha256?: string
  /** true, wenn es zur letzten Landtagswahl des Landes gehört (laufende Wahlperiode). */
  aktuell: boolean
}

/** Position im Repo: wie in der Datenbank, plus Prüfstatus. */
export interface KatalogPosition extends HaltungPosition {
  geprueft: boolean
}

/**
 * Haltung im Repo (daten/haltungen/NN-name.json): Frage, Beschreibung und Zielkonflikte (Phase A, freigegeben
 * von der Betreiberin), danach die Positionen der Parteien (Phase B).
 */
export interface KatalogHaltung extends HaltungEintrag {
  zielkonflikte: Zielkonflikt[]
  positionen: KatalogPosition[]
  /** Freigabe von Frage, Beschreibung und Zielkonflikten – erst danach werden Positionen erfasst (`art: "ki"` wie bei Themen). */
  freigabe?: { datum: string; art?: 'ki' }
  /** Phase A: wann eine Position `ja`, `teils` oder `nein` ist – Maßstab der Einordnung ohne Parteinamen. */
  einordnung?: { ja: string; teils: string; nein: string }
  /** Suchbegriffe für die Erfassung der Positionen, für alle Programme gleich (nicht Teil von Phase A). */
  suchbegriffe?: string[]
}

/** Höchstens so viele Wörter hat die Kurzfassung einer Position (docs/plan-haltungen.md, B2). */
export const MAX_KURZFASSUNG_WOERTER = 25
const POSITIONSWERTE = ['ja', 'nein', 'teils', 'keine_aussage'] as const

export interface Katalog {
  /** true = erfundene Platzhalterdaten (Mock). Dann gelten gelockerte Regeln. */
  fiktiv: boolean
  laender: Land[]
  landesprogramme: LandesprogrammEintrag[]
  parteien: KatalogPartei[]
  themen: KatalogThema[]
  ursachen: KatalogUrsache[]
  instrumente: Instrument[]
  /** Alle erfassten Maßnahmen, auch ungeprüfte Entwürfe und frühere Wahlperioden. */
  massnahmen: KatalogMassnahme[]
  /** IDs entfernter Einträge (daten/ids.json) – werden nie wieder vergeben. */
  stillgelegt: number[]
  abdeckung: Abdeckung[]
  /** Wertfragen für die Haltungskarte (daten/haltungen/), eigener Nummernkreis. */
  haltungen: KatalogHaltung[]
  /** IDs entfernter Haltungen (daten/ids.json → „haltungen_stillgelegt“). */
  haltungenStillgelegt: number[]
}

export interface Datei {
  /** Pfad relativ zum Repo, nur für Fehlermeldungen. */
  pfad: string
  inhalt: unknown
}

export interface Pruefergebnis {
  katalog: Katalog
  fehler: string[]
  warnungen: string[]
}

/**
 * Was im Spiel zählt, entscheidet sich je Thema und Partei: Erst wenn der
 * ganze Eintrag geprüft ist (alle Maßnahmen bzw. „keine_massnahme“), kommt er
 * in die Datenbank. Sonst gilt das Thema für die Partei als „noch nicht
 * erfasst“ und die Runde wird nicht gewertet – eine halb geprüfte Liste
 * könnte eine Partei sonst schlechter dastehen lassen, als sie ist.
 * Bei fiktiven Daten zählt alles, weil es dort nichts zu prüfen gibt.
 */
/** Landesprogramme der laufenden Wahlperiode – nur sie zählen im Spiel. */
export function spielbareLandesprogramme(k: Katalog): Landesprogramm[] {
  return k.landesprogramme
    .filter((p) => p.aktuell)
    .map(({ partei_id, land, url, stand, kein_programm }) => ({ partei_id, land, url, stand, kein_programm }))
}

/**
 * Einträge, die im Spiel zählen. Öffentlich nur geprüfte; mit `mitKiEntwurf`
 * (Seed für die Datenbank) zusätzlich KI-Entwürfe, gekennzeichnet mit
 * `ki_entwurf: true` – die Datenbank gibt sie nur mit Zugang zur Testphase heraus.
 */
export function spielbareAbdeckung(k: Katalog, mitKiEntwurf = false): AbdeckungEintrag[] {
  return zaehlendeAbdeckung(k, mitKiEntwurf).map(({ thema_id, partei_id, land, art, begruendung, stand, geprueft, durchsucht_fuer }) => ({
    thema_id, partei_id, land: land ?? null, art, begruendung, stand, ...(durchsucht_fuer ? { durchsucht_fuer } : {}),
    ...(mitKiEntwurf ? { ki_entwurf: !k.fiktiv && !geprueft } : {}),
  }))
}

// Landesprogramme zählen nur in der laufenden Wahlperiode; ältere Einträge bleiben im Katalog.
const zaehlendeAbdeckung = (k: Katalog, mitKiEntwurf: boolean) =>
  k.abdeckung.filter((a) => a.aktuell && (k.fiktiv || a.geprueft || (mitKiEntwurf && a.ki_entwurf)))

const programmSchluessel = (x: { thema_id: number; partei_id: number; land?: string | null; landtagswahl?: string }) =>
  `${x.thema_id}/${x.partei_id}/${x.land ?? ''}/${x.landtagswahl ?? ''}`

export function spielbareMassnahmen(k: Katalog, mitKiEntwurf = false): Massnahme[] {
  const eintraege = new Map(zaehlendeAbdeckung(k, mitKiEntwurf).map((a) => [programmSchluessel(a), a]))
  return k.massnahmen
    .filter((m) => eintraege.has(programmSchluessel(m)))
    .map((eintrag) => {
      const { instrument_id, landtagswahl: _l, entwurf_herkunft: eigene, bewertungen: _b, ...m } = eintrag
      // Das Instrument bleibt an der Maßnahme: Die Forderungskarte zeigt darüber, wer es vorschlägt.
      if (instrument_id !== undefined) (m as Massnahme).instrument_id = instrument_id
      if (!mitKiEntwurf) return m
      const ki = !k.fiktiv && !eintraege.get(programmSchluessel(eintrag))!.geprueft
      // Herkunft der Entwurfswerte (Instrument oder Maßnahme) – im Spiel als „nicht blind“ gekennzeichnet.
      const herkunft = eintrag.instrument_id !== undefined ? k.instrumente.find((i) => i.id === eintrag.instrument_id)?.entwurf_herkunft : eigene
      return { ...m, ki_entwurf: ki, ...(ki ? { entwurf_herkunft: herkunft ?? null } : {}) }
    })
}

/**
 * Instrumente für die Forderungskarte: nur die, hinter denen mindestens eine spielbare Maßnahme steht
 * (sonst ließe sich nicht zeigen, wer sie vorschlägt). Öffentlich nur mit einer geprüften Maßnahme;
 * mit `mitKiEntwurf` (Seed) auch reine Entwürfe, gekennzeichnet mit `ki_entwurf: true` – die Datenbank
 * gibt sie nur mit Zugang zur Testphase heraus. Ohne Punkte: Wirksamkeit und Umsetzbarkeit gehören nicht dazu.
 */
export function spielbareInstrumente(k: Katalog, mitKiEntwurf = false): InstrumentEintrag[] {
  const massnahmen = spielbareMassnahmen(k, mitKiEntwurf)
  const ebene = (id: number) => (massnahmen.find((m) => m.instrument_id === id)?.land ? 'land' : 'bund') as Ebene
  const eintraege = k.instrumente.filter((i) => massnahmen.some((m) => m.instrument_id === i.id))
  const dabei = new Set(eintraege.map((i) => i.id))
  return eintraege.map((i) => {
    const dazu = massnahmen.filter((m) => m.instrument_id === i.id)
    // Entwurf, solange keine der Maßnahmen geprüft ist (bei fiktiven Daten zählt alles).
    const ki = !k.fiktiv && !dazu.some((m) => m.geprueft && !m.ki_entwurf)
    return {
      id: i.id,
      thema_id: i.thema_id,
      name: i.name,
      begruendung: i.begruendung || null,
      evidenz: i.evidenz ?? null,
      beleg_studie_url: i.beleg_studie_url ?? null,
      ebene: ebene(i.id),
      entspricht: i.entspricht !== undefined && dabei.has(i.entspricht) ? i.entspricht : null,
      ...(mitKiEntwurf ? { ki_entwurf: ki, ...(ki ? { entwurf_herkunft: i.entwurf_herkunft ?? null } : {}) } : {}),
      ...(i.schlagwoerter ? { schlagwoerter: i.schlagwoerter } : {}),
    }
  })
}

export interface SpielbareHaltungen {
  haltungen: HaltungEintrag[]
  positionen: HaltungPosition[]
  zielkonflikte: Zielkonflikt[]
}

/**
 * Haltungen für die Haltungskarte: nur freigegebene (Frage, Beschreibung und Zielkonflikte bestätigt). Positionen
 * öffentlich nur geprüfte; mit `mitKiEntwurf` (Seed) auch Entwürfe, gekennzeichnet mit `ki_entwurf: true` – die
 * Datenbank gibt sie nur mit Zugang zur Testphase heraus. Ob die Karte erscheint (alle Parteien erfasst),
 * entscheiden App und Datenbank (View `haltungen_vollstaendig`) mit `vollstaendigeHaltungen`.
 * Bei fiktiven Daten zählt alles.
 */
export function spielbareHaltungen(k: Katalog, mitKiEntwurf = false): SpielbareHaltungen {
  const frei = k.haltungen.filter((h) => k.fiktiv || h.freigabe)
  return {
    haltungen: frei.map(({ id, frage, beschreibung, status_quo, verwandte_themen, schlagwoerter }) => ({
      id, frage, beschreibung, ...(status_quo ? { status_quo } : {}), verwandte_themen, ...(schlagwoerter ? { schlagwoerter } : {}),
    })),
    positionen: frei.flatMap((h) =>
      h.positionen
        .filter((p) => k.fiktiv || p.geprueft || (mitKiEntwurf && p.ki_entwurf))
        .map(({ geprueft, ki_entwurf: _k, ...p }) => ({
          ...p,
          land: p.land ?? null,
          ...(mitKiEntwurf ? { ki_entwurf: !k.fiktiv && !geprueft } : {}),
        })),
    ),
    zielkonflikte: frei.flatMap((h) => h.zielkonflikte),
  }
}

/**
 * Was Prüfende bewerten: ein Instrument (gilt für alle Maßnahmen, die darauf
 * verweisen) oder eine einzelne Maßnahme ohne Instrument. Die ID ist die des
 * Instruments bzw. der Maßnahme – beide teilen sich einen Nummernkreis.
 * Nur laufende Wahlperioden; frühere Programme werden nicht mehr bewertet.
 */
export interface Pruefeinheit {
  id: number
  thema_id: number
  /** Name des Instruments bzw. Kurzbeschreibung der Maßnahme. */
  beschreibung: string
  /** Die Maßnahmen dahinter (bei Instrumenten alle, die darauf verweisen). */
  massnahmen: KatalogMassnahme[]
  instrument: boolean
  ursachen_ids: number[]
  wirksamkeit: Massnahme['wirksamkeit']
  umsetzbarkeit: Massnahme['umsetzbarkeit']
  begruendung: string
  evidenz?: Massnahme['evidenz']
  beleg_studie_url?: string
  rollen_modifikator?: Massnahme['rollen_modifikator']
}

export function pruefEinheiten(k: Katalog, themaId?: number): Pruefeinheit[] {
  const aktuell = new Set(k.abdeckung.filter((a) => a.aktuell).map(programmSchluessel))
  const massnahmen = k.massnahmen.filter((m) => (themaId === undefined || m.thema_id === themaId) && aktuell.has(programmSchluessel(m)))
  const einheiten: Pruefeinheit[] = []
  for (const i of k.instrumente) {
    const dazu = massnahmen.filter((m) => m.instrument_id === i.id)
    if (!dazu.length) continue
    einheiten.push({
      id: i.id, thema_id: i.thema_id, beschreibung: i.name, massnahmen: dazu, instrument: true,
      ursachen_ids: [...new Set(dazu.flatMap((m) => m.ursachen_ids))].sort((a, b) => a - b),
      wirksamkeit: i.wirksamkeit, umsetzbarkeit: i.umsetzbarkeit, begruendung: i.begruendung,
      evidenz: i.evidenz, beleg_studie_url: i.beleg_studie_url, rollen_modifikator: i.rollen_modifikator,
    })
  }
  for (const m of massnahmen) {
    if (m.instrument_id !== undefined) continue
    einheiten.push({
      id: m.id, thema_id: m.thema_id, beschreibung: m.beschreibung, massnahmen: [m], instrument: false,
      ursachen_ids: m.ursachen_ids, wirksamkeit: m.wirksamkeit, umsetzbarkeit: m.umsetzbarkeit, begruendung: m.begruendung,
      evidenz: m.evidenz, beleg_studie_url: m.beleg_studie_url, rollen_modifikator: m.rollen_modifikator,
    })
  }
  return einheiten.sort((a, b) => a.id - b.id)
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/
const FARBE = /^#[0-9a-fA-F]{6}$/
const SEITENANKER = /#page=\d+$/
const PLATZHALTER_HOSTS = ['example.org', 'example.com', 'example.net']
const LAND_KUERZEL = /^[A-Z]{2}$/
const SHA256 = /^[0-9a-f]{64}$/
const EBENEN = ['bund', 'land'] as const
const EVIDENZ = ['belegt', 'gemischt', 'offen'] as const

/** Felder, die bei einer Maßnahme mit Instrument vom Instrument kommen. */
const INSTRUMENT_FELDER = ['wirksamkeit', 'umsetzbarkeit', 'begruendung', 'evidenz', 'beleg_studie_url', 'rollen_modifikator', 'bewertung', 'entwurf_herkunft']

/** Bewertung samt Begründung – steht an einem Instrument oder an einer Maßnahme ohne Instrument. */
type Bewertungsteil = Pick<Instrument, 'wirksamkeit' | 'umsetzbarkeit' | 'begruendung' | 'evidenz' | 'beleg_studie_url' | 'rollen_modifikator' | 'bewertungen' | 'entwurf_herkunft'>

const istObjekt = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const istDatum = (v: unknown): v is string =>
  typeof v === 'string' && DATUM.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v)

const ohneAnker = (url: string) => url.split('#')[0]

/**
 * `pruefungDateien`: übernommene Exporte der Prüfenden (daten/pruefungen/). Werden sie übergeben,
 * muss jede `bewertung` im Katalog genau zu einem Export passen – so lässt sich kein Prüfergebnis
 * von Hand eintragen. Ohne (App) entfällt dieser Abgleich.
 */
export function pruefeKatalog(
  parteienDatei: Datei,
  themenDateien: Datei[],
  idsDatei?: Datei,
  pruefungDateien?: Datei[],
  haltungDateien: Datei[] = [],
): Pruefergebnis {
  const fehler: string[] = []
  const warnungen: string[] = []
  const katalog: Katalog = {
    fiktiv: false, laender: [], landesprogramme: [], parteien: [], themen: [], ursachen: [], instrumente: [], massnahmen: [],
    abdeckung: [], stillgelegt: [], haltungen: [], haltungenStillgelegt: [],
  }

  // Kleine Helfer, die jeweils eine Meldung mit Ort erzeugen.
  const f = (ort: string, text: string) => fehler.push(`${ort}: ${text}`)
  const text = (ort: string, o: Record<string, unknown>, feld: string, max = 400): string => {
    const v = o[feld]
    if (typeof v !== 'string' || !v.trim()) f(ort, `„${feld}“ fehlt oder ist leer`)
    else if (v.length > max) f(ort, `„${feld}“ ist länger als ${max} Zeichen`)
    return typeof v === 'string' ? v : ''
  }
  const ganzzahl = (ort: string, o: Record<string, unknown>, feld: string, min: number, max: number): number => {
    const v = o[feld]
    if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) f(ort, `„${feld}“ muss eine ganze Zahl von ${min} bis ${max} sein`)
    return typeof v === 'number' ? v : 0
  }
  const datum = (ort: string, o: Record<string, unknown>, feld: string): string => {
    if (!istDatum(o[feld])) f(ort, `„${feld}“ muss ein Datum im Format JJJJ-MM-TT sein`)
    return typeof o[feld] === 'string' ? (o[feld] as string) : ''
  }
  const wahrheitswert = (ort: string, o: Record<string, unknown>, feld: string): boolean => {
    if (typeof o[feld] !== 'boolean') f(ort, `„${feld}“ muss true oder false sein`)
    return o[feld] === true
  }
  const url = (ort: string, o: Record<string, unknown>, feld: string, pflicht = true): string | undefined => {
    const v = o[feld]
    if (v === undefined || v === null) {
      if (pflicht) f(ort, `„${feld}“ fehlt`)
      return undefined
    }
    let geparst: URL | null = null
    try {
      geparst = typeof v === 'string' ? new URL(v) : null
    } catch {
      // unten gemeldet
    }
    if (!geparst || geparst.protocol !== 'https:') {
      f(ort, `„${feld}“ muss eine vollständige https-Adresse sein`)
      return undefined
    }
    if (!katalog.fiktiv && PLATZHALTER_HOSTS.includes(geparst.hostname)) {
      f(ort, `„${feld}“ ist ein Platzhalter-Link (${geparst.hostname}) – bei echten Daten nicht erlaubt`)
    }
    return v as string
  }
  const unbekannteFelder = (ort: string, o: Record<string, unknown>, erlaubt: string[]) => {
    for (const k of Object.keys(o)) if (!erlaubt.includes(k)) f(ort, `unbekanntes Feld „${k}“ (Tippfehler?)`)
  }
  const pruefsumme = (ort: string, o: Record<string, unknown>, feld: string): string => {
    const v = o[feld]
    if (typeof v !== 'string' || !SHA256.test(v)) f(ort, `„${feld}“ muss eine SHA-256-Prüfsumme sein (64 Zeichen 0–9, a–f; npm run programm:sichern)`)
    return typeof v === 'string' ? v : ''
  }
  const schlagwoerter = (ort: string, o: Record<string, unknown>): string[] | undefined => {
    const v = o.schlagwoerter
    if (v === undefined) return undefined
    if (!Array.isArray(v) || v.some((s) => typeof s !== 'string' || !s.trim())) {
      f(ort, '„schlagwoerter“ muss eine Liste von Texten sein')
      return undefined
    }
    return v as string[]
  }

  // Nachweis der Belegprüfung: Wer `geprueft` setzt, trägt ein, wann die Belege geprüft wurden – bei
  // „keine Maßnahme“ zusätzlich, wie die zweite Suche lief (Begriffe, Kapitel, Abgleich mit der Treffermatrix).
  const nachweis = (ort: string, o: Record<string, unknown>, geprueft: boolean, keine: boolean) => {
    const p = o.pruefung
    if (p === undefined) {
      if (geprueft && !katalog.fiktiv)
        f(ort, `„geprueft“ nur mit „pruefung“: { „belege_geprueft“: Datum${keine ? ', „zweite_suche“: wie und wonach erneut gesucht wurde' : ''} }`)
      return
    }
    const pOrt = `${ort} › pruefung`
    if (!istObjekt(p)) return f(pOrt, 'erwartet ein Objekt')
    unbekannteFelder(pOrt, p, keine ? ['belege_geprueft', 'zweite_suche'] : ['belege_geprueft'])
    datum(pOrt, p, 'belege_geprueft')
    if (keine) {
      const z = text(pOrt, p, 'zweite_suche', 400)
      if (z && z.length < 30) f(pOrt, '„zweite_suche“ nennt Suchbegriffe, gelesene Kapitel und den Abgleich mit der Treffermatrix (mindestens 30 Zeichen)')
    }
  }

  // Übernommene Exporte der Prüfenden: je Thema, Datum und Prüfeinheit Anzahl, Mediane, Spannweite (und Einzelwerte).
  type ExportZeile = { anzahl: unknown; median_w: unknown; median_u: unknown; spannweite: unknown; werte?: [number, number][] }
  const exporte = new Map<string, ExportZeile & { pfad: string }>()
  for (const d of pruefungDateien ?? []) {
    const e = d.inhalt
    if (!istObjekt(e) || !Array.isArray(e.bewertungen)) {
      f(d.pfad, 'erwartet einen Export { thema_id, datum, bewertungen } aus npm run pruefung:uebernehmen')
      continue
    }
    unbekannteFelder(d.pfad, e, ['thema_id', 'datum', 'bewertungen'])
    for (const [i, b] of e.bewertungen.entries()) {
      const bOrt = `${d.pfad} › bewertungen[${i}]`
      if (!istObjekt(b)) {
        f(bOrt, 'erwartet ein Objekt')
        continue
      }
      // Nur Zahlen: So kann über diesen Weg kein Name ins Repository gelangen.
      unbekannteFelder(bOrt, b, ['massnahme_id', 'anzahl', 'median_w', 'median_u', 'spannweite', 'werte'])
      if (Array.isArray(b.werte)) for (const x of werteStimmen(bOrt, b as ExportZeile & { werte: [number, number][] })) f(bOrt, x.slice(bOrt.length + 2))
      exporte.set(`${String(e.thema_id)}/${String(e.datum)}/${String(b.massnahme_id)}`, { ...(b as ExportZeile), pfad: d.pfad })
    }
  }

  // Wirksamkeit, Umsetzbarkeit, Begründung, Forschungsstand, Rollen und Ergebnis der Prüfung.
  const bewertungsteil = (ort: string, roh: Record<string, unknown>, evidenzPflicht: boolean, themaId?: number): Bewertungsteil => {
    const b: Bewertungsteil = {
      wirksamkeit: ganzzahl(ort, roh, 'wirksamkeit', 0, 3) as Massnahme['wirksamkeit'],
      umsetzbarkeit: ganzzahl(ort, roh, 'umsetzbarkeit', 0, 3) as Massnahme['umsetzbarkeit'],
      begruendung: text(ort, roh, 'begruendung', 300),
      bewertungen: 0,
    }
    const studie = url(ort, roh, 'beleg_studie_url', false)
    if (studie) b.beleg_studie_url = studie

    // Stand der Forschung: Höchste Wirksamkeit nur mit belegter Wirkung (docs/methode.md).
    if (roh.evidenz !== undefined) {
      if (!(EVIDENZ as readonly unknown[]).includes(roh.evidenz)) f(ort, `„evidenz“ muss ${EVIDENZ.map((e) => `„${e}“`).join(', ')} sein`)
      else b.evidenz = roh.evidenz as Massnahme['evidenz']
    }
    if (!katalog.fiktiv) {
      if (b.wirksamkeit === 3 && b.evidenz !== 'belegt') f(ort, '„wirksamkeit“ 3 nur mit „evidenz“: „belegt“ – sonst höchstens 2')
      // Neue Blindbewertungen lehnt npm run entwurf:bewertung-pruefen ab; ältere Einträge nur als Warnung.
      if (b.wirksamkeit === 3 && !b.beleg_studie_url) warnungen.push(`${ort}: „wirksamkeit“ 3 ohne „beleg_studie_url“ – Studie nachtragen, die die Wirkung belegt`)
      // KI-Entwürfe sind in der geschlossenen Testphase sichtbar, deshalb schon vollständig.
      if (evidenzPflicht && !b.evidenz)
        f(ort, '„evidenz“ fehlt – vor „geprueft“, bei KI-Entwürfen und bei Instrumenten angeben, wie gut die Wirkung belegt ist')
    }

    // Rollen-Modifikatoren: nur bekannte Rollen, kleiner Wert, immer begründet.
    const rm = roh.rollen_modifikator
    if (rm !== undefined && rm !== null) {
      if (!istObjekt(rm)) f(ort, '„rollen_modifikator“ muss ein Objekt sein')
      else {
        for (const [rolle, mod] of Object.entries(rm)) {
          const rOrt = `${ort} › rollen_modifikator.${rolle}`
          if (!(ROLLEN_IDS as readonly string[]).includes(rolle)) f(rOrt, `unbekannte Rolle (erlaubt: ${ROLLEN_IDS.join(', ')})`)
          if (!istObjekt(mod)) {
            f(rOrt, 'erwartet { wert, begruendung }')
            continue
          }
          unbekannteFelder(rOrt, mod, ['wert', 'begruendung'])
          ganzzahl(rOrt, mod, 'wert', -2, 2)
          if (mod.wert === 0) f(rOrt, '„wert“ 0 hat keine Wirkung – Eintrag weglassen')
          text(rOrt, mod, 'begruendung', 200)
          // Die Punkte deckeln das bei 2 (bewertung.ts); hier nur der Hinweis, dass der Wert so nicht voll wirkt.
          if (!katalog.fiktiv && typeof mod.wert === 'number' && b.wirksamkeit + mod.wert > 2 && b.wirksamkeit < 3 && b.evidenz !== 'belegt')
            warnungen.push(`${rOrt}: hebt die Wirksamkeit auf 3, die Wirkung ist aber nicht „belegt“ – zählt nur bis 2`)
        }
        b.rollen_modifikator = rm as Massnahme['rollen_modifikator']
      }
    }

    // Ergebnis der Prüfung durch Eingeladene (npm run pruefung:uebernehmen): Anzahl und Mediane, nie Namen.
    const bw = roh.bewertung
    if (bw !== undefined) {
      const bOrt = `${ort} › bewertung`
      if (!istObjekt(bw)) f(bOrt, 'erwartet ein Objekt mit anzahl, median_w, median_u, spannweite, datum, entwurf')
      else {
        unbekannteFelder(bOrt, bw, ['anzahl', 'median_w', 'median_u', 'spannweite', 'datum', 'entwurf'])
        b.bewertungen = ganzzahl(bOrt, bw, 'anzahl', 1, 99)
        const mw = ganzzahl(bOrt, bw, 'median_w', 0, 3)
        const mu = ganzzahl(bOrt, bw, 'median_u', 0, 3)
        ganzzahl(bOrt, bw, 'spannweite', 0, 3)
        datum(bOrt, bw, 'datum')
        const e = bw.entwurf
        if (!Array.isArray(e) || e.length !== 2 || e.some((x) => !Number.isInteger(x) || x < 0 || x > 3))
          f(bOrt, '„entwurf“ muss [Wirksamkeit, Umsetzbarkeit] des Entwurfs sein, je 0 bis 3')
        if (mw !== b.wirksamkeit || mu !== b.umsetzbarkeit)
          f(bOrt, '„wirksamkeit“/„umsetzbarkeit“ weichen von den Medianen der Prüfung ab – neu prüfen lassen oder „bewertung“ anpassen')
        // Abgleich mit dem übernommenen Export (daten/pruefungen/): gleiche Zahlen, sonst von Hand geändert.
        if (pruefungDateien && !katalog.fiktiv && themaId !== undefined) {
          const ex = exporte.get(`${themaId}/${String(bw.datum)}/${String(roh.id)}`)
          if (!ex) f(bOrt, `kein Export vom ${String(bw.datum)} in daten/pruefungen/ mit dieser ID – Prüfergebnisse nur mit npm run pruefung:uebernehmen eintragen`)
          else if (['anzahl', 'median_w', 'median_u', 'spannweite'].some((k) => ex[k as keyof ExportZeile] !== bw[k]))
            f(bOrt, `weicht vom Export ${ex.pfad} ab (Anzahl, Mediane oder Spannweite)`)
        }
      }
    }
    // Herkunft der Entwurfswerte: aus der Blindbewertung (`blind`) oder mit Kenntnis der Partei (`nicht_blind`).
    if (roh.entwurf_herkunft !== undefined) {
      if (roh.entwurf_herkunft !== 'blind' && roh.entwurf_herkunft !== 'nicht_blind')
        f(ort, '„entwurf_herkunft“ muss „blind“ oder „nicht_blind“ sein')
      else b.entwurf_herkunft = roh.entwurf_herkunft
    }
    return b
  }

  // --- IDs: Maßnahmen und Instrumente teilen sich einen Nummernkreis ----------
  // Einmal vergeben, nie wieder: Entfernte IDs stehen in daten/ids.json.
  const idOrt = new Map<number, string>()
  if (idsDatei) {
    const d = idsDatei.inhalt
    if (!istObjekt(d) || !Array.isArray(d.stillgelegt)) f(idsDatei.pfad, 'erwartet { "stillgelegt": [{ "id", "grund" }] }')
    else {
      unbekannteFelder(idsDatei.pfad, d, ['hinweis', 'stillgelegt', 'haltungen_stillgelegt'])
      // Haltungen haben einen eigenen Nummernkreis (1, 2, …) und deshalb eine eigene Liste.
      const hs = d.haltungen_stillgelegt
      if (hs !== undefined && !Array.isArray(hs)) f(idsDatei.pfad, '„haltungen_stillgelegt“ muss eine Liste [{ "id", "grund" }] sein')
      for (const [i, roh] of (Array.isArray(hs) ? hs : []).entries()) {
        const sOrt = `${idsDatei.pfad} › haltungen_stillgelegt[${i}]`
        if (!istObjekt(roh)) {
          f(sOrt, 'erwartet ein Objekt')
          continue
        }
        unbekannteFelder(sOrt, roh, ['id', 'grund'])
        const id = ganzzahl(sOrt, roh, 'id', 1, 32767)
        text(sOrt, roh, 'grund', 300)
        if (katalog.haltungenStillgelegt.includes(id)) f(sOrt, `Haltungs-ID ${id} ist doppelt`)
        katalog.haltungenStillgelegt.push(id)
      }
      for (const [i, roh] of d.stillgelegt.entries()) {
        const sOrt = `${idsDatei.pfad} › stillgelegt[${i}]`
        if (!istObjekt(roh)) {
          f(sOrt, 'erwartet ein Objekt')
          continue
        }
        unbekannteFelder(sOrt, roh, ['id', 'grund'])
        const id = ganzzahl(sOrt, roh, 'id', 1, 2147483647)
        text(sOrt, roh, 'grund', 300)
        if (idOrt.has(id)) f(sOrt, `ID ${id} ist doppelt`)
        idOrt.set(id, 'stillgelegt')
        katalog.stillgelegt.push(id)
      }
    }
  }
  /** Ebene, für die ein Instrument genutzt wird (aus den Maßnahmen dahinter), über alle Themen. */
  const ebeneJeInstrument = new Map<number, string>()
  const neueId = (ort: string, id: number, art: string) => {
    const vorher = idOrt.get(id)
    if (vorher === 'stillgelegt') f(ort, `ID ${id} ist stillgelegt (daten/ids.json) und darf nicht wieder vergeben werden – npm run daten:id`)
    else if (vorher) f(ort, `${art}-ID ${id} ist schon vergeben (${vorher}) – Maßnahmen und Instrumente teilen sich die Nummern; npm run daten:id`)
    idOrt.set(id, ort)
  }

  // --- Parteien --------------------------------------------------------------
  const pd = parteienDatei.inhalt
  const pOrt = parteienDatei.pfad
  if (!istObjekt(pd) || !Array.isArray(pd.parteien)) {
    f(pOrt, 'erwartet ein Objekt mit „fiktiv“ und „parteien“ (Liste)')
    return { katalog, fehler, warnungen }
  }
  unbekannteFelder(pOrt, pd, ['fiktiv', 'hinweis', 'laender', 'parteien'])
  katalog.fiktiv = wahrheitswert(pOrt, pd, 'fiktiv')

  // --- Länder: nur die, für die Landesprogramme erfasst werden ---------------
  if (pd.laender !== undefined && !Array.isArray(pd.laender)) f(pOrt, '„laender“ muss eine Liste sein')
  for (const [i, roh] of (Array.isArray(pd.laender) ? pd.laender : []).entries()) {
    const ort = `${pOrt} › laender[${i}]`
    if (!istObjekt(roh)) {
      f(ort, 'erwartet ein Objekt')
      continue
    }
    unbekannteFelder(ort, roh, ['id', 'name', 'letzte_wahl'])
    const land: Land = { id: text(ort, roh, 'id', 2), name: text(ort, roh, 'name', 40), letzte_wahl: datum(ort, roh, 'letzte_wahl') }
    if (land.id && !LAND_KUERZEL.test(land.id)) f(ort, '„id“ muss ein Kürzel aus zwei Großbuchstaben sein (z. B. „ST“)')
    if (katalog.laender.some((l) => l.id === land.id)) f(ort, `Land „${land.id}“ ist doppelt`)
    katalog.laender.push(land)
  }
  const landNach = new Map(katalog.laender.map((l) => [l.id, l]))

  const parteiIds = new Set<number>()
  const parteiNamen = new Set<string>()
  pd.parteien.forEach((roh, i) => {
    const ort = `${pOrt} › parteien[${i}]`
    if (!istObjekt(roh)) return f(ort, 'erwartet ein Objekt')
    unbekannteFelder(ort, roh, ['id', 'name', 'kurzname', 'farbe', 'programm_url', 'programm_stand', 'programm_sha256', 'landesprogramme'])
    const p: KatalogPartei = {
      id: ganzzahl(ort, roh, 'id', 1, 32767),
      name: text(ort, roh, 'name', 80),
      kurzname: text(ort, roh, 'kurzname', 20),
      farbe: text(ort, roh, 'farbe', 7),
      programm_url: url(ort, roh, 'programm_url') ?? '',
      programm_stand: datum(ort, roh, 'programm_stand'),
    }
    if (roh.programm_sha256 !== undefined) p.programm_sha256 = pruefsumme(ort, roh, 'programm_sha256')
    else if (!katalog.fiktiv) warnungen.push(`${ort}: ohne „programm_sha256“ – ausgewertete Fassung nicht festgehalten (npm run programm:sichern)`)
    if (p.farbe && !FARBE.test(p.farbe)) f(ort, '„farbe“ muss ein Hex-Wert wie #1a2b3c sein')
    if (p.programm_url.includes('#')) f(ort, '„programm_url“ ist die Adresse des ganzen Programms – ohne #-Anker')
    if (parteiIds.has(p.id)) f(ort, `Partei-ID ${p.id} ist doppelt`)
    // Name und Kurzname dürfen gleich sein (z. B. „SPD“), aber nicht mit einer anderen Partei kollidieren.
    for (const n of new Set([p.name, p.kurzname])) {
      if (n && parteiNamen.has(n.toLowerCase())) f(ort, `Name „${n}“ ist doppelt`)
      parteiNamen.add(n.toLowerCase())
    }
    parteiIds.add(p.id)
    katalog.parteien.push(p)

    // Landesprogramme: je Land höchstens eins – das zur letzten Wahl, sonst ist es veraltet.
    if (roh.landesprogramme !== undefined && !Array.isArray(roh.landesprogramme)) f(ort, '„landesprogramme“ muss eine Liste sein')
    for (const [j, lRoh] of (Array.isArray(roh.landesprogramme) ? roh.landesprogramme : []).entries()) {
      const lOrt = `${ort} › landesprogramme[${j}]`
      if (!istObjekt(lRoh)) {
        f(lOrt, 'erwartet ein Objekt')
        continue
      }
      unbekannteFelder(lOrt, lRoh, ['land', 'landtagswahl', 'url', 'stand', 'sha256', 'kein_programm'])
      const landId = text(lOrt, lRoh, 'land', 2)
      const land = landNach.get(landId)
      if (landId && !land) f(lOrt, `unbekanntes Land „${landId}“ (erst unter „laender“ eintragen)`)
      const landtagswahl = datum(lOrt, lRoh, 'landtagswahl')
      const hatUrl = lRoh.url !== undefined
      const hatKein = lRoh.kein_programm !== undefined
      if (hatUrl === hatKein) f(lOrt, 'genau eines von „url“ (mit „stand“) oder „kein_programm“ (Begründung) angeben')
      const lp: LandesprogrammEintrag = {
        partei_id: p.id,
        land: landId,
        url: hatUrl ? (url(lOrt, lRoh, 'url') ?? null) : null,
        stand: hatUrl ? datum(lOrt, lRoh, 'stand') : null,
        kein_programm: hatKein ? text(lOrt, lRoh, 'kein_programm', 300) : null,
        landtagswahl,
        aktuell: !!land && landtagswahl === land.letzte_wahl,
      }
      if (!hatUrl && lRoh.stand !== undefined) f(lOrt, '„stand“ nur zusammen mit „url“')
      if (lRoh.sha256 !== undefined) {
        if (!hatUrl) f(lOrt, '„sha256“ nur zusammen mit „url“')
        else lp.sha256 = pruefsumme(lOrt, lRoh, 'sha256')
      } else if (hatUrl && !katalog.fiktiv) {
        warnungen.push(`${lOrt}: ohne „sha256“ – ausgewertete Fassung nicht festgehalten (npm run programm:sichern)`)
      }
      if (lp.url?.includes('#')) f(lOrt, '„url“ ist die Adresse des ganzen Programms – ohne #-Anker')
      if (land && landtagswahl > land.letzte_wahl) f(lOrt, `„landtagswahl“ liegt nach der letzten Wahl in ${land.name} (${land.letzte_wahl})`)
      if (katalog.landesprogramme.some((x) => x.partei_id === p.id && x.land === landId && x.landtagswahl === landtagswahl))
        f(lOrt, `„${landId}“ zur Wahl ${landtagswahl} ist für diese Partei doppelt`)
      katalog.landesprogramme.push(lp)
    }
    // Programme früherer Wahlperioden bleiben stehen (Belege gespielter Runden), zählen aber nicht mehr.
    // Fehlt das Programm zur letzten Wahl, ist das Land für die Partei noch nicht erfasst.
    for (const land of katalog.laender) {
      const eigene = katalog.landesprogramme.filter((x) => x.partei_id === p.id && x.land === land.id)
      if (eigene.length && !eigene.some((x) => x.aktuell)) {
        warnungen.push(`${ort}: kein Programm zur letzten Wahl in ${land.name} (${land.letzte_wahl}) – ältere zählen nicht mehr; neues Programm oder „kein_programm“ eintragen`)
      }
    }
  })
  if (katalog.parteien.length < 2) f(pOrt, 'mindestens zwei Parteien nötig')
  const parteiNach = new Map(katalog.parteien.map((p) => [p.id, p]))

  // --- Themen ----------------------------------------------------------------
  const themaIds = new Set<number>()
  const themaNamen = new Set<string>()
  const ursacheIds = new Set<number>()

  for (const datei of themenDateien) {
    const ort = datei.pfad
    const t = datei.inhalt
    if (!istObjekt(t)) {
      f(ort, 'erwartet ein Objekt')
      continue
    }
    unbekannteFelder(ort, t, ['id', 'name', 'beschreibung', 'ziel', 'schlagwoerter', 'freigabe', 'ursachen', 'instrumente', 'abdeckung'])
    // Ziel aus Sicht der Betroffenen: Daran wird die Wirksamkeit gemessen. Bei echten Daten Pflicht.
    const ziel = t.ziel !== undefined || !katalog.fiktiv ? text(ort, t, 'ziel', 200) : ''
    const thema: KatalogThema = {
      id: ganzzahl(ort, t, 'id', 1, 32767),
      name: text(ort, t, 'name', 60),
      beschreibung: text(ort, t, 'beschreibung', 300),
    }
    if (ziel) thema.ziel = ziel
    const tw = schlagwoerter(ort, t)
    if (tw) thema.schlagwoerter = tw
    if (themaIds.has(thema.id)) f(ort, `Themen-ID ${thema.id} ist doppelt`)
    if (thema.name && themaNamen.has(thema.name.toLowerCase())) f(ort, `Thema „${thema.name}“ gibt es schon`)
    themaIds.add(thema.id)
    themaNamen.add(thema.name.toLowerCase())
    katalog.themen.push(thema)

    // Ursachen: parteiunabhängig, jede mit Quelle.
    const eigeneUrsachen = new Set<number>()
    if (!Array.isArray(t.ursachen) || t.ursachen.length === 0) f(ort, 'mindestens eine Ursache nötig („ursachen“)')
    for (const [i, roh] of (Array.isArray(t.ursachen) ? t.ursachen : []).entries()) {
      const uOrt = `${ort} › ursachen[${i}]`
      if (!istObjekt(roh)) {
        f(uOrt, 'erwartet ein Objekt')
        continue
      }
      unbekannteFelder(uOrt, roh, ['id', 'beschreibung', 'quelle_url', 'ebene', 'alltag', 'schlagwoerter', 'nachtraeglich'])
      // Nach dem Blick in die Programme ergänzt? Dann offen vermerkt, mit Datum und Grund.
      const nachtraeglich = roh.nachtraeglich !== undefined ? text(uOrt, roh, 'nachtraeglich', 300) : undefined
      const u: KatalogUrsache = {
        id: ganzzahl(uOrt, roh, 'id', 1, 32767),
        thema_id: thema.id,
        beschreibung: text(uOrt, roh, 'beschreibung', 200),
        quelle_url: url(uOrt, roh, 'quelle_url') ?? '',
      }
      // Zuständigkeit: Bei echten Daten Pflicht, damit Landesprogramme richtig zählen.
      if (roh.ebene !== undefined || !katalog.fiktiv) {
        if (!(EBENEN as readonly unknown[]).includes(roh.ebene)) f(uOrt, '„ebene“ muss „bund“ oder „land“ sein')
        else u.ebene = roh.ebene as Ursache['ebene']
      }
      if (roh.alltag !== undefined) u.alltag = text(uOrt, roh, 'alltag', 160)
      const uw = schlagwoerter(uOrt, roh)
      if (uw) u.schlagwoerter = uw
      if (nachtraeglich) u.nachtraeglich = nachtraeglich
      if (ursacheIds.has(u.id)) f(uOrt, `Ursachen-ID ${u.id} ist doppelt`)
      ursacheIds.add(u.id)
      eigeneUrsachen.add(u.id)
      katalog.ursachen.push(u)
    }

    // Freigabe durch die Betreiberin: Datum und Ursachen, deren Quellen sie im Original bestätigt hat.
    if (t.freigabe !== undefined) {
      const fOrt = `${ort} › freigabe`
      const fr = t.freigabe
      if (!istObjekt(fr)) f(fOrt, 'erwartet { datum, quellen_bestaetigt } oder { datum, art: "ki" }')
      else {
        unbekannteFelder(fOrt, fr, ['datum', 'quellen_bestaetigt', 'art'])
        const ki = fr.art === 'ki'
        if (fr.art !== undefined && !ki) f(fOrt, '„art“ kann nur „ki“ sein (KI-Freigabe für die Testphase)')
        const q = fr.quellen_bestaetigt ?? (ki ? [] : undefined)
        if (!Array.isArray(q) || q.some((x) => !Number.isInteger(x))) f(fOrt, '„quellen_bestaetigt“ muss eine Liste von Ursachen-IDs sein')
        else for (const id of q as number[]) if (!eigeneUrsachen.has(id)) f(fOrt, `„quellen_bestaetigt“: Ursache ${id} gehört nicht zum Thema`)
        thema.freigabe = { datum: datum(fOrt, fr, 'datum'), quellen_bestaetigt: Array.isArray(q) ? (q as number[]) : [], ...(ki ? { art: 'ki' as const } : {}) }
      }
    }

    // Instrumente: gemeinsame Bewertung gleicher Lösungswege (daten/README.md → „Instrumente“).
    const eigeneInstrumente = new Map<number, Instrument>()
    const instrumentEbene = new Map<number, string>()
    const instrumentGenutzt = new Set<number>()
    if (t.instrumente !== undefined && !Array.isArray(t.instrumente)) f(ort, '„instrumente“ muss eine Liste sein')
    for (const [i, roh] of (Array.isArray(t.instrumente) ? t.instrumente : []).entries()) {
      const iOrt = `${ort} › instrumente[${i}]`
      if (!istObjekt(roh)) {
        f(iOrt, 'erwartet ein Objekt')
        continue
      }
      unbekannteFelder(iOrt, roh, ['id', 'name', 'entspricht', 'schlagwoerter', ...INSTRUMENT_FELDER])
      const ins: Instrument = {
        id: ganzzahl(iOrt, roh, 'id', 1, 2147483647),
        thema_id: thema.id,
        name: text(iOrt, roh, 'name', 120),
        ...bewertungsteil(iOrt, roh, true, thema.id),
      }
      if (roh.entspricht !== undefined) ins.entspricht = ganzzahl(iOrt, roh, 'entspricht', 1, 2147483647)
      const sw = schlagwoerter(iOrt, roh)
      if (sw) ins.schlagwoerter = sw
      neueId(iOrt, ins.id, 'Instrument')
      eigeneInstrumente.set(ins.id, ins)
      katalog.instrumente.push(ins)
    }

    // Abdeckung: Jede Partei höchstens einmal – mit Maßnahmen oder „keine_massnahme“.
    // Fehlt eine Partei, gilt das Thema für sie als „noch nicht erfasst“. So kann ein
    // Thema zuerst nur mit Ursachen angelegt werden (Ablauf in daten/README.md).
    const gesehen = new Set<string>()
    const bundErfasst = new Set<number>()
    const adressiert = new Set<number>()
    if (t.abdeckung !== undefined && !Array.isArray(t.abdeckung)) f(ort, '„abdeckung“ muss eine Liste sein (ein Eintrag pro Partei)')
    for (const [i, roh] of (Array.isArray(t.abdeckung) ? t.abdeckung : []).entries()) {
      const aOrt = `${ort} › abdeckung[${i}]`
      if (!istObjekt(roh)) {
        f(aOrt, 'erwartet ein Objekt')
        continue
      }
      unbekannteFelder(aOrt, roh, ['partei_id', 'land', 'landtagswahl', 'durchsucht_fuer', 'massnahmen', 'keine_massnahme'])
      const parteiId = ganzzahl(aOrt, roh, 'partei_id', 1, 32767)
      const partei = parteiNach.get(parteiId)
      if (!partei) f(aOrt, `unbekannte Partei-ID ${parteiId}`)

      // Ohne „land“: Bundesprogramm. Mit „land“: Landesprogramm der Partei in diesem Land.
      // Mit „land“ gehört „landtagswahl“ dazu: Programme früherer Wahlperioden bleiben so eindeutig.
      const land = roh.land === undefined ? null : text(aOrt, roh, 'land', 2)
      let landtagswahl: string | undefined
      let aktuell = true
      let programm = partei ? { url: partei.programm_url, stand: partei.programm_stand } : null
      if (land === null && roh.landtagswahl !== undefined) f(aOrt, '„landtagswahl“ nur zusammen mit „land“')
      if (land !== null) {
        landtagswahl = datum(aOrt, roh, 'landtagswahl')
        const lp = katalog.landesprogramme.find((x) => x.partei_id === parteiId && x.land === land && x.landtagswahl === landtagswahl)
        if (!lp && landtagswahl) f(aOrt, `kein Landesprogramm „${land}“ zur Wahl ${landtagswahl} für Partei ${parteiId} eingetragen (parteien.json → „landesprogramme“)`)
        else if (lp && !lp.url) f(aOrt, `Partei ${parteiId} hat in „${land}“ kein Programm (${lp.kein_programm}) – Eintrag entfernen`)
        aktuell = !!lp?.aktuell && !!lp.url
        programm = lp?.url && lp.stand ? { url: lp.url, stand: lp.stand } : null
      }
      // Für welche Ursachen das Programm durchsucht wurde. Ohne Angabe (ältere Einträge): für alle.
      // Eine Ursache, die fehlt, gilt für die Partei als „noch nicht erfasst“ – sonst bekäme sie
      // für eine nachträglich ergänzte Ursache 0 Punkte, ohne dass jemand gesucht hat.
      let durchsucht: number[] | null = null
      if (roh.durchsucht_fuer !== undefined) {
        const v = roh.durchsucht_fuer
        if (!Array.isArray(v) || v.length === 0 || v.some((x) => !Number.isInteger(x))) {
          f(aOrt, '„durchsucht_fuer“ muss eine nicht leere Liste von Ursachen-IDs sein')
        } else {
          durchsucht = v as number[]
          if (new Set(durchsucht).size !== durchsucht.length) f(aOrt, '„durchsucht_fuer“ enthält Doppelte')
          for (const id of durchsucht) {
            if (!eigeneUrsachen.has(id)) f(aOrt, `„durchsucht_fuer“: Ursache ${id} gehört nicht zum Thema „${thema.name}“`)
            else if (land !== null && (katalog.ursachen.find((u) => u.id === id)?.ebene ?? 'bund') !== 'land')
              f(aOrt, `„durchsucht_fuer“: Ursache ${id} liegt beim Bund – Landesprogramme nur für Ursachen mit „ebene“: „land“`)
          }
        }
      }

      const schluessel = `${parteiId}/${land ?? ''}/${landtagswahl ?? ''}`
      if (gesehen.has(schluessel)) f(aOrt, `Partei ${parteiId}${land ? ` (${land}, Wahl ${landtagswahl})` : ''} ist mehrfach eingetragen`)
      gesehen.add(schluessel)
      if (land === null) bundErfasst.add(parteiId)

      const hatListe = roh.massnahmen !== undefined
      const hatKeine = roh.keine_massnahme !== undefined
      if (hatListe === hatKeine) {
        f(aOrt, 'genau eines von „massnahmen“ oder „keine_massnahme“ angeben')
        continue
      }

      if (hatKeine) {
        const k = roh.keine_massnahme
        const kOrt = `${aOrt} › keine_massnahme`
        if (!istObjekt(k)) {
          f(kOrt, 'erwartet ein Objekt mit begruendung, stand, geprueft')
          continue
        }
        unbekannteFelder(kOrt, k, ['begruendung', 'stand', 'treffer', 'geprueft', 'pruefung', 'ki_entwurf'])
        const begruendung = text(kOrt, k, 'begruendung')
        const stand = datum(kOrt, k, 'stand')
        const geprueft = wahrheitswert(kOrt, k, 'geprueft')
        // Treffer aller Suchbegriffe im Programm (npm run entwurf:eintragen) – Anhaltspunkt für die zweite Suche.
        if (k.treffer !== undefined) ganzzahl(kOrt, k, 'treffer', 0, 1000000)
        nachweis(kOrt, k, geprueft, true)
        const kiEntwurf = k.ki_entwurf !== undefined && wahrheitswert(kOrt, k, 'ki_entwurf')
        if (programm && stand && programm.stand && stand < programm.stand) {
          f(kOrt, `„stand“ ${stand} liegt vor dem Programmstand ${programm.stand} – bitte im aktuellen Programm neu prüfen`)
        }
        if (!katalog.fiktiv && !geprueft && aktuell) {
          warnungen.push(`${kOrt}: noch nicht geprüft – Thema gilt für die Partei als „noch nicht erfasst“${kiEntwurf ? ' (Testphase: KI-Entwurf)' : ''}`)
        }
        katalog.abdeckung.push({
          thema_id: thema.id, partei_id: parteiId, land, art: 'keine', begruendung, stand, geprueft, ki_entwurf: !geprueft && kiEntwurf,
          ...(landtagswahl ? { landtagswahl } : {}), ...(durchsucht ? { durchsucht_fuer: durchsucht } : {}), aktuell,
        })
        continue
      }

      if (!Array.isArray(roh.massnahmen) || roh.massnahmen.length === 0) {
        f(aOrt, '„massnahmen“ muss mindestens eine Maßnahme enthalten – sonst „keine_massnahme“ verwenden')
        continue
      }
      let alleGeprueft = true
      let alleKiOderGeprueft = true
      let neuesterStand = ''
      for (const [j, mRoh] of roh.massnahmen.entries()) {
        const mOrt = `${aOrt} › massnahmen[${j}]`
        if (!istObjekt(mRoh)) {
          f(mOrt, 'erwartet ein Objekt')
          continue
        }
        unbekannteFelder(mOrt, mRoh, [
          'id', 'instrument', 'beschreibung', 'ursachen_ids', 'wirksamkeit', 'umsetzbarkeit', 'rollen_modifikator',
          'begruendung', 'zitat', 'beleg_programm_url', 'beleg_studie_url', 'evidenz', 'stand', 'geprueft', 'pruefung', 'bewertung', 'ki_entwurf',
          'entwurf_herkunft',
        ])
        const kiEntwurf = mRoh.ki_entwurf !== undefined && wahrheitswert(mOrt, mRoh, 'ki_entwurf')
        const geprueft = wahrheitswert(mOrt, mRoh, 'geprueft')
        nachweis(mOrt, mRoh, geprueft, false)
        // Mit Instrument kommt die Bewertung von dort, sonst steht sie an der Maßnahme.
        let instrument: Instrument | undefined
        let bewertung: Bewertungsteil
        if (mRoh.instrument !== undefined) {
          const iid = ganzzahl(mOrt, mRoh, 'instrument', 1, 2147483647)
          instrument = eigeneInstrumente.get(iid)
          if (!instrument) f(mOrt, `Instrument ${iid} steht nicht unter „instrumente“ dieses Themas`)
          for (const feld of INSTRUMENT_FELDER)
            if (mRoh[feld] !== undefined) f(mOrt, `„${feld}“ kommt aus dem Instrument – hier weglassen oder Instrument entfernen`)
          bewertung = instrument ?? { wirksamkeit: 0, umsetzbarkeit: 0, begruendung: '', bewertungen: 0 }
        } else {
          bewertung = bewertungsteil(mOrt, mRoh, geprueft || kiEntwurf, thema.id)
        }
        const m: KatalogMassnahme = {
          id: ganzzahl(mOrt, mRoh, 'id', 1, 2147483647),
          thema_id: thema.id,
          partei_id: parteiId,
          land,
          beschreibung: text(mOrt, mRoh, 'beschreibung', 200),
          ursachen_ids: [],
          wirksamkeit: bewertung.wirksamkeit,
          umsetzbarkeit: bewertung.umsetzbarkeit,
          begruendung: bewertung.begruendung,
          beleg_programm_url: url(mOrt, mRoh, 'beleg_programm_url') ?? '',
          stand: datum(mOrt, mRoh, 'stand'),
          geprueft,
        }
        if (bewertung.evidenz) m.evidenz = bewertung.evidenz
        if (bewertung.beleg_studie_url) m.beleg_studie_url = bewertung.beleg_studie_url
        if (bewertung.rollen_modifikator) m.rollen_modifikator = bewertung.rollen_modifikator
        if (!instrument && bewertung.entwurf_herkunft) m.entwurf_herkunft = bewertung.entwurf_herkunft
        if (!instrument && bewertung.bewertungen) m.bewertungen = bewertung.bewertungen
        if (instrument) {
          m.instrument_id = instrument.id
          instrumentGenutzt.add(instrument.id)
          // Umsetzbarkeit wird aus Sicht einer Ebene bewertet – ein Instrument gilt nur für eine.
          const ebene = land === null ? 'bund' : 'land'
          const bisher = instrumentEbene.get(instrument.id)
          if (bisher && bisher !== ebene)
            f(mOrt, `Instrument ${instrument.id} wird schon für Maßnahmen der ${bisher === 'bund' ? 'Bundes' : 'Landes'}ebene genutzt – für jede Ebene ein eigenes Instrument anlegen`)
          instrumentEbene.set(instrument.id, ebene)
        }
        if (landtagswahl) m.landtagswahl = landtagswahl

        // Wörtliches Zitat aus dem Programm: macht die Prüfung nachvollziehbar
        // (Suche im PDF). Bei echten Daten Pflicht.
        if (mRoh.zitat !== undefined || !katalog.fiktiv) {
          const zitat = text(mOrt, mRoh, 'zitat', 800)
          if (zitat) m.zitat = zitat
        }

        neueId(mOrt, m.id, 'Maßnahmen')

        // Ursachen müssen zum Thema gehören.
        const ids = mRoh.ursachen_ids
        if (!Array.isArray(ids) || ids.length === 0 || ids.some((x) => !Number.isInteger(x))) {
          f(mOrt, '„ursachen_ids“ muss eine nicht leere Liste von IDs sein')
        } else {
          for (const id of ids as number[]) {
            if (!eigeneUrsachen.has(id)) f(mOrt, `Ursache ${id} gehört nicht zum Thema „${thema.name}“`)
            else adressiert.add(id)
            if (durchsucht && eigeneUrsachen.has(id) && !durchsucht.includes(id))
              f(mOrt, `Ursache ${id} fehlt in „durchsucht_fuer“ des Eintrags – Maßnahme zu einer Ursache, nach der nicht gesucht wurde?`)
            // Landesprogramme zählen nur für Ursachen in Länderzuständigkeit.
            const ebene = katalog.ursachen.find((u) => u.id === id)?.ebene ?? 'bund'
            if (land !== null && eigeneUrsachen.has(id) && ebene !== 'land')
              f(mOrt, `Ursache ${id} liegt beim Bund – Maßnahmen aus Landesprogrammen nur für Ursachen mit „ebene“: „land“`)
          }
          if (new Set(ids).size !== ids.length) f(mOrt, '„ursachen_ids“ enthält Doppelte')
          m.ursachen_ids = ids as number[]
        }

        // Beleg muss ins Programm der Partei zeigen (Bundes- bzw. Landesprogramm), mit Seitenanker.
        if (m.beleg_programm_url && programm) {
          if (ohneAnker(m.beleg_programm_url) !== programm.url) {
            f(mOrt, `„beleg_programm_url“ zeigt nicht auf das Programm der Partei (${programm.url})`)
          }
          if (!SEITENANKER.test(m.beleg_programm_url)) f(mOrt, '„beleg_programm_url“ braucht einen Seitenanker wie #page=12')
        }
        if (programm && m.stand && programm.stand && m.stand < programm.stand) {
          f(mOrt, `„stand“ ${m.stand} liegt vor dem Programmstand ${programm.stand} – bitte im aktuellen Programm neu prüfen`)
        }

        // Geprüft erst ab zwei unabhängigen Bewertungen – bei Instrumenten die des Instruments.
        if (!katalog.fiktiv && m.geprueft && bewertung.bewertungen < 2) {
          f(
            mOrt,
            instrument
              ? `„geprueft“ erst, wenn Instrument ${instrument.id} zwei unabhängige Bewertungen hat („bewertung.anzahl“ ≥ 2, siehe daten/README.md → „Prüfung“)`
              : '„geprueft“ erst ab zwei unabhängigen Bewertungen („bewertung.anzahl“ ≥ 2, siehe daten/README.md → „Prüfung“)',
          )
        }

        if (!m.geprueft) {
          alleGeprueft = false
          if (!kiEntwurf) alleKiOderGeprueft = false
          if (!katalog.fiktiv && aktuell) {
            warnungen.push(`${mOrt}: noch nicht geprüft – bis alle Maßnahmen der Partei zum Thema geprüft sind, gilt es als „noch nicht erfasst“`)
          }
        }
        if (m.stand > neuesterStand) neuesterStand = m.stand
        katalog.massnahmen.push(m)
      }
      katalog.abdeckung.push({
        thema_id: thema.id, partei_id: parteiId, land, art: 'massnahmen', begruendung: null, stand: neuesterStand, geprueft: alleGeprueft,
        ki_entwurf: !alleGeprueft && alleKiOderGeprueft, ...(landtagswahl ? { landtagswahl } : {}),
        ...(durchsucht ? { durchsucht_fuer: durchsucht } : {}), aktuell,
      })
    }

    for (const id of eigeneInstrumente.keys()) {
      if (!instrumentGenutzt.has(id)) warnungen.push(`${ort}: Instrument ${id} wird von keiner Maßnahme genutzt`)
    }
    // Geprüft heißt: Menschen haben geprüft – das setzt eine Freigabe der Ursachen durch die Betreiberin voraus.
    const etwasGeprueft =
      katalog.abdeckung.some((a) => a.thema_id === thema.id && a.art === 'keine' && a.geprueft) ||
      katalog.massnahmen.some((m) => m.thema_id === thema.id && m.geprueft)
    if (!katalog.fiktiv && thema.freigabe?.art === 'ki' && etwasGeprueft)
      f(ort, '„geprueft“ erst nach der Freigabe der Ursachen durch die Betreiberin – „freigabe“ hat nur „art“: „ki“')
    for (const [id, e] of instrumentEbene) ebeneJeInstrument.set(id, e)

    // Landesprogramme sind eine Ergänzung: Maßgeblich für „noch nicht erfasst“ ist das Bundesprogramm.
    const fehlend = katalog.parteien.filter((p) => !bundErfasst.has(p.id))
    if (fehlend.length) {
      warnungen.push(
        `${ort}: noch nicht erfasst für ${fehlend.map((p) => `„${p.kurzname}“ (${p.id})`).join(', ')} – ` +
          'Runden mit diesen Parteien werden nicht gewertet, bis Maßnahmen oder „keine_massnahme“ eingetragen sind',
      )
    }
    // Erst aussagekräftig, wenn alle Parteien erfasst sind.
    if (!fehlend.length) {
      for (const id of eigeneUrsachen) {
        if (!adressiert.has(id)) warnungen.push(`${ort}: Ursache ${id} wird von keiner Partei adressiert`)
      }
    }
  }

  // --- Haltungen (daten/haltungen/, docs/plan-haltungen.md Teil B) -----------
  // Wertfragen ohne Punkte: Frage, Beschreibung und Zielkonflikte (Phase A, mit Freigabe), dann je Partei
  // eine Position mit Zitat (Phase B). Eigener Nummernkreis, nie wiederverwendet.
  const haltungIds = new Set<number>()
  const fragen = new Set<string>()
  const parteinamen = katalog.parteien.map(({ name, kurzname }) => ({ name, kurzname }))
  for (const datei of haltungDateien) {
    const ort = datei.pfad
    const h = datei.inhalt
    if (!istObjekt(h)) {
      f(ort, 'erwartet ein Objekt')
      continue
    }
    unbekannteFelder(ort, h, ['id', 'frage', 'beschreibung', 'status_quo', 'verwandte_themen', 'zielkonflikte', 'einordnung', 'suchbegriffe', 'positionen', 'freigabe', 'schlagwoerter'])
    const haltung: KatalogHaltung = {
      id: ganzzahl(ort, h, 'id', 1, 32767),
      frage: text(ort, h, 'frage', 160),
      beschreibung: text(ort, h, 'beschreibung', 300),
      verwandte_themen: [],
      zielkonflikte: [],
      positionen: [],
    }
    if (haltung.frage && !haltung.frage.trim().endsWith('?')) f(ort, '„frage“ ist eine neutrale Ja/Nein-Frage und endet mit „?“')
    // Heutige Lage: Pflicht ab der Freigabe, denn im Quiz „Wer sagt Ja?“ zählt „keine Aussage“ wie diese Antwort (docs/haltungen.md).
    if (h.status_quo === undefined) {
      if (h.freigabe !== undefined) f(ort, '„status_quo“ fehlt: „ja“ oder „nein“ – die Antwort, die der heutigen Rechtslage bzw. Praxis entspricht („offen“, wenn weder noch)')
    } else if (h.status_quo === 'ja' || h.status_quo === 'nein' || h.status_quo === 'offen') haltung.status_quo = h.status_quo
    else f(ort, '„status_quo“ ist „ja“, „nein“ oder „offen“')
    for (const [feld, wert] of [['frage', haltung.frage], ['beschreibung', haltung.beschreibung]] as const)
      if (wert && ohneParteinamen(wert, parteinamen) !== wert) f(ort, `„${feld}“ nennt eine Partei – die Frage beschreibt den Wertkonflikt, nicht wer wo steht`)
    if (haltungIds.has(haltung.id)) f(ort, `Haltungs-ID ${haltung.id} ist doppelt`)
    if (katalog.haltungenStillgelegt.includes(haltung.id))
      f(ort, `Haltungs-ID ${haltung.id} ist stillgelegt (daten/ids.json → „haltungen_stillgelegt“) und darf nicht wieder vergeben werden`)
    haltungIds.add(haltung.id)
    if (haltung.frage && fragen.has(haltung.frage.toLowerCase())) f(ort, `Frage „${haltung.frage}“ gibt es schon`)
    fragen.add(haltung.frage.toLowerCase())
    const sw = schlagwoerter(ort, h)
    if (sw) haltung.schlagwoerter = sw

    // Brücke zum Alltag: Themen, deren Probleme mit der Haltung zusammenhängen.
    const vt = h.verwandte_themen
    if (!Array.isArray(vt) || vt.length === 0 || vt.some((x) => !Number.isInteger(x))) f(ort, '„verwandte_themen“ muss eine nicht leere Liste von Themen-IDs sein')
    else {
      for (const id of vt as number[]) if (!themaIds.has(id)) f(ort, `„verwandte_themen“: Thema ${id} gibt es nicht`)
      if (new Set(vt).size !== vt.length) f(ort, '„verwandte_themen“ enthält Doppelte')
      haltung.verwandte_themen = vt as number[]
    }

    // Zielkonflikte: zwei bis vier Sätze, je mit unabhängiger Quelle, mindestens einer je Seite der Frage.
    const zk = h.zielkonflikte
    if (!Array.isArray(zk) || zk.length < 2 || zk.length > 4) f(ort, '„zielkonflikte“ muss zwei bis vier Einträge haben')
    for (const [i, roh] of (Array.isArray(zk) ? zk : []).entries()) {
      const zOrt = `${ort} › zielkonflikte[${i}]`
      if (!istObjekt(roh)) {
        f(zOrt, 'erwartet ein Objekt { seite, text, quelle_url }')
        continue
      }
      unbekannteFelder(zOrt, roh, ['seite', 'text', 'quelle_url'])
      if (roh.seite !== 'ja' && roh.seite !== 'nein') f(zOrt, '„seite“ muss „ja“ oder „nein“ sein')
      const t = text(zOrt, roh, 'text', 300)
      if (t && ohneParteinamen(t, parteinamen) !== t) f(zOrt, '„text“ nennt eine Partei – Zielkonflikte beschreiben Ziele, nicht Parteien')
      haltung.zielkonflikte.push({ haltung_id: haltung.id, seite: roh.seite === 'nein' ? 'nein' : 'ja', text: t, quelle_url: url(zOrt, roh, 'quelle_url') ?? '' })
    }
    for (const seite of ['ja', 'nein'] as const)
      if (Array.isArray(zk) && !haltung.zielkonflikte.some((z) => z.seite === seite)) f(ort, `„zielkonflikte“: mindestens einer für die Seite „${seite}“`)

    // Freigabe von Frage, Beschreibung und Zielkonflikten durch die Betreiberin (Phase A).
    if (h.freigabe !== undefined) {
      const fOrt = `${ort} › freigabe`
      if (!istObjekt(h.freigabe)) f(fOrt, 'erwartet { datum } oder { datum, art: "ki" }')
      else {
        unbekannteFelder(fOrt, h.freigabe, ['datum', 'art'])
        if (h.freigabe.art !== undefined && h.freigabe.art !== 'ki') f(fOrt, '„art“ kann nur „ki“ sein (KI-Freigabe für die Testphase)')
        haltung.freigabe = { datum: datum(fOrt, h.freigabe, 'datum'), ...(h.freigabe.art === 'ki' ? { art: 'ki' as const } : {}) }
      }
    }

    // Maßstab der Einordnung (Phase A) und Suchbegriffe für die Erfassung.
    if (h.einordnung !== undefined) {
      const eOrt = `${ort} › einordnung`
      if (!istObjekt(h.einordnung)) f(eOrt, 'erwartet { ja, teils, nein }')
      else {
        unbekannteFelder(eOrt, h.einordnung, ['ja', 'teils', 'nein'])
        const e = { ja: text(eOrt, h.einordnung, 'ja', 300), teils: text(eOrt, h.einordnung, 'teils', 300), nein: text(eOrt, h.einordnung, 'nein', 300) }
        for (const [feld, wert] of Object.entries(e))
          if (wert && ohneParteinamen(wert, parteinamen) !== wert) f(eOrt, `„${feld}“ nennt eine Partei`)
        haltung.einordnung = e
      }
    }
    if (h.suchbegriffe !== undefined) {
      const s = h.suchbegriffe
      if (!Array.isArray(s) || !s.length || s.some((x) => typeof x !== 'string' || !x.trim())) f(ort, '„suchbegriffe“ muss eine nicht leere Liste von Wörtern sein')
      else {
        haltung.suchbegriffe = s as string[]
        for (const b of s as string[]) {
          const n = suchbegriffInParteinamen(b, parteinamen)
          if (n) f(ort, `Suchbegriff „${b}“ steckt im Parteinamen „${n}“ – träfe dort fast jede Seite; genauer fassen`)
        }
      }
    }

    // Positionen der Parteien (Phase B): erst nach der Freigabe, höchstens eine je Partei und Programm.
    const pos = h.positionen
    if (pos !== undefined && !Array.isArray(pos)) f(ort, '„positionen“ muss eine Liste sein (eine je Partei)')
    const liste = Array.isArray(pos) ? pos : []
    if (liste.length && !haltung.freigabe && !katalog.fiktiv)
      f(ort, '„positionen“ erst nach der Freigabe von Frage, Beschreibung und Zielkonflikten („freigabe“) erfassen')
    for (const [i, roh] of liste.entries()) {
      const pOrt = `${ort} › positionen[${i}]`
      if (!istObjekt(roh)) {
        f(pOrt, 'erwartet ein Objekt')
        continue
      }
      unbekannteFelder(pOrt, roh, [
        'partei_id', 'position', 'kurzfassung', 'zitat', 'beleg_programm_url', 'begruendung', 'stand', 'geprueft', 'pruefung', 'ki_entwurf',
      ])
      const parteiId = ganzzahl(pOrt, roh, 'partei_id', 1, 32767)
      const partei = parteiNach.get(parteiId)
      if (!partei) f(pOrt, `unbekannte Partei-ID ${parteiId}`)
      if (haltung.positionen.some((p) => p.partei_id === parteiId)) f(pOrt, `Partei ${parteiId} hat schon eine Position zu dieser Haltung`)
      if (!(POSITIONSWERTE as readonly unknown[]).includes(roh.position)) f(pOrt, `„position“ muss ${POSITIONSWERTE.map((w) => `„${w}“`).join(', ')} sein`)
      const wert = (POSITIONSWERTE as readonly unknown[]).includes(roh.position) ? (roh.position as KatalogPosition['position']) : 'keine_aussage'
      const keine = wert === 'keine_aussage'
      const geprueft = wahrheitswert(pOrt, roh, 'geprueft')
      const p: KatalogPosition = {
        haltung_id: haltung.id, partei_id: parteiId, land: null, position: wert,
        kurzfassung: null, zitat: null, beleg_programm_url: null, begruendung: null,
        stand: datum(pOrt, roh, 'stand'), geprueft,
      }
      if (roh.ki_entwurf !== undefined) p.ki_entwurf = wahrheitswert(pOrt, roh, 'ki_entwurf')

      if (keine) {
        // Was durchsucht wurde – „keine Aussage“ heißt nur: im Programm mit diesem Stand nichts gefunden.
        p.begruendung = text(pOrt, roh, 'begruendung', 400)
        for (const feld of ['kurzfassung', 'zitat', 'beleg_programm_url'])
          if (roh[feld] !== undefined) f(pOrt, `„${feld}“ gibt es bei „keine_aussage“ nicht – dort steht nur „begruendung“`)
      } else {
        // Kurzfassung in eigenen Worten, Zitat und Beleg: Bei Haltungen ist der Wortlaut der eigentliche Beleg.
        p.kurzfassung = text(pOrt, roh, 'kurzfassung', 250)
        p.zitat = text(pOrt, roh, 'zitat', 800)
        p.beleg_programm_url = url(pOrt, roh, 'beleg_programm_url') ?? null
        if (roh.begruendung !== undefined) f(pOrt, '„begruendung“ nur bei „keine_aussage“ – sonst stehen Kurzfassung und Zitat für sich')
        const woerter = p.kurzfassung.split(/\s+/).filter(Boolean).length
        if (woerter > MAX_KURZFASSUNG_WOERTER) f(pOrt, `„kurzfassung“ hat ${woerter} Wörter – höchstens ${MAX_KURZFASSUNG_WOERTER}`)
        if (p.kurzfassung && ohneParteinamen(p.kurzfassung, parteinamen) !== p.kurzfassung)
          f(pOrt, '„kurzfassung“ nennt eine Partei – in neutralen eigenen Worten, die Partei steht daneben')
        if (p.beleg_programm_url && partei) {
          if (ohneAnker(p.beleg_programm_url) !== partei.programm_url) f(pOrt, `„beleg_programm_url“ zeigt nicht auf das Programm der Partei (${partei.programm_url})`)
          if (!SEITENANKER.test(p.beleg_programm_url)) f(pOrt, '„beleg_programm_url“ braucht einen Seitenanker wie #page=12')
        }
      }
      if (partei && p.stand && partei.programm_stand && p.stand < partei.programm_stand)
        f(pOrt, `„stand“ ${p.stand} liegt vor dem Programmstand ${partei.programm_stand} – bitte im aktuellen Programm neu prüfen`)

      // Nachweis der Prüfung: Belege geprüft (bei „keine_aussage“ mit zweiter Suche); die Einordnung ja/nein/teils
      // haben zusätzlich mindestens zwei Prüfende bestätigt, die die Partei nicht sehen.
      const pr = roh.pruefung
      if (pr === undefined) {
        if (geprueft && !katalog.fiktiv)
          f(pOrt, `„geprueft“ nur mit „pruefung“: { „belege_geprueft“: Datum, ${keine ? '„zweite_suche“: wie und wonach erneut gesucht wurde' : '„einordnung_bestaetigt“: Zahl der blinden Bestätigungen (mindestens 2)'} }`)
      } else {
        const prOrt = `${pOrt} › pruefung`
        if (!istObjekt(pr)) f(prOrt, 'erwartet ein Objekt')
        else {
          unbekannteFelder(prOrt, pr, keine ? ['belege_geprueft', 'zweite_suche'] : ['belege_geprueft', 'einordnung_bestaetigt'])
          datum(prOrt, pr, 'belege_geprueft')
          if (keine) {
            const z = text(prOrt, pr, 'zweite_suche', 400)
            if (z && z.length < 30) f(prOrt, '„zweite_suche“ nennt Suchbegriffe und gelesene Kapitel (mindestens 30 Zeichen)')
          } else {
            const n = ganzzahl(prOrt, pr, 'einordnung_bestaetigt', 0, 99)
            if (geprueft && !katalog.fiktiv && n < 2) f(prOrt, '„geprueft“ erst, wenn mindestens zwei Prüfende die Einordnung ohne Parteinamen bestätigt haben')
          }
        }
      }
      if (!katalog.fiktiv && geprueft && haltung.freigabe?.art === 'ki')
        f(pOrt, '„geprueft“ erst nach der Freigabe von Frage, Beschreibung und Zielkonflikten durch die Betreiberin – „freigabe“ hat nur „art“: „ki“')
      if (!katalog.fiktiv && !geprueft)
        warnungen.push(`${pOrt}: noch nicht geprüft – zählt erst nach der Prüfung${p.ki_entwurf ? ' (Testphase: KI-Entwurf)' : ''}`)
      haltung.positionen.push(p)
    }

    // „Alle oder keine“: Die Karte erscheint erst, wenn jede Partei eine Position hat.
    const fehlend = katalog.parteien.filter((x) => !haltung.positionen.some((p) => p.partei_id === x.id))
    if ((haltung.freigabe || katalog.fiktiv) && fehlend.length)
      warnungen.push(`${ort}: keine Position für ${fehlend.map((x) => `„${x.kurzname}“ (${x.id})`).join(', ')} – die Haltungskarte erscheint erst, wenn alle Parteien erfasst sind`)
    // Aufnahmekriterium: Die Frage kommt in mindestens drei Programmen mit erkennbarer Position vor.
    const erkennbar = haltung.positionen.filter((p) => p.position !== 'keine_aussage').length
    if (!fehlend.length && erkennbar < 3)
      warnungen.push(`${ort}: nur ${erkennbar} Programme mit erkennbarer Position – Aufnahmekriterium sind mindestens drei (docs/plan-haltungen.md, B1)`)
    haltung.positionen.sort((a, b) => a.partei_id - b.partei_id)
    katalog.haltungen.push(haltung)
  }

  // `entspricht`: das Gegenstück gehört zum selben Thema, gilt für die andere Ebene und verweist zurück.
  for (const i of katalog.instrumente) {
    if (i.entspricht === undefined) continue
    const ort = `Thema ${i.thema_id} › Instrument ${i.id}`
    const anderes = katalog.instrumente.find((x) => x.id === i.entspricht)
    if (!anderes) f(ort, `„entspricht“: Instrument ${i.entspricht} gibt es nicht`)
    else if (anderes.thema_id !== i.thema_id) f(ort, `„entspricht“: Instrument ${anderes.id} gehört zu einem anderen Thema`)
    else if (anderes.entspricht !== i.id) f(ort, `„entspricht“: Instrument ${anderes.id} verweist nicht auf dieses Instrument zurück`)
    else {
      const e1 = ebeneJeInstrument.get(i.id)
      const e2 = ebeneJeInstrument.get(anderes.id)
      if (e1 && e2 && e1 === e2) f(ort, `„entspricht“: Instrument ${anderes.id} gilt für dieselbe Ebene – gemeint ist das Gegenstück auf der anderen (Bund ↔ Land)`)
    }
  }

  const nachId = <T extends { id: number }>(a: T, b: T) => a.id - b.id
  katalog.themen.sort(nachId)
  katalog.ursachen.sort(nachId)
  katalog.instrumente.sort(nachId)
  katalog.massnahmen.sort(nachId)
  katalog.haltungen.sort(nachId)
  return { katalog, fehler, warnungen }
}

/** Ergebnis von Vites `import.meta.glob(…, { eager: true, import: 'default' })` als sortierte Dateiliste. */
export const alsDateien = (module: Record<string, unknown>): Datei[] =>
  Object.entries(module)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pfad, inhalt]) => ({ pfad: pfad.replace(/^(\.\.\/)+/, ''), inhalt }))

/** Prüft und wirft bei Fehlern – für Stellen, an denen die Daten schon geprüft sein müssen. */
/**
 * Steckt ein Suchbegriff in einem Parteinamen („bündnis“ in „Bündnis 90/Die Grünen“, „sozial“ in
 * „Sozialdemokratische Partei“)? Dann träfe die Suche im Programm dieser Partei fast jede Seite (Kopfzeilen, Selbstnennung)
 * und begrübe die eigentlichen Stellen – eine Ungleichbehandlung. Gibt den getroffenen Namen zurück, sonst null.
 */
export function suchbegriffInParteinamen(begriff: string, parteien: { name: string; kurzname: string }[]): string | null {
  const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
  const b = norm(begriff)
  if (b.length < 3) return null
  for (const p of parteien) for (const n of [p.name, p.kurzname]) if (norm(n).includes(b)) return n
  return null
}

export function ladeKatalog(parteienDatei: Datei, themenDateien: Datei[], haltungDateien: Datei[] = []): Katalog {
  const { katalog, fehler } = pruefeKatalog(parteienDatei, themenDateien, undefined, undefined, haltungDateien)
  if (fehler.length) throw new Error(`Datenkatalog fehlerhaft (npm run daten:pruefen):\n${fehler.join('\n')}`)
  return katalog
}
