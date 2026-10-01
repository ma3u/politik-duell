import {
  ROLLEN_IDS,
  type AbdeckungEintrag,
  type Land,
  type Landesprogramm,
  type Massnahme,
  type Partei,
  type Thema,
  type Ursache,
} from './types.ts'

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
}

export type EntwurfHerkunft = 'blind' | 'nicht_blind'

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

export interface Katalog {
  /** true = erfundene Platzhalterdaten (Mock). Dann gelten gelockerte Regeln. */
  fiktiv: boolean
  laender: Land[]
  landesprogramme: LandesprogrammEintrag[]
  parteien: KatalogPartei[]
  themen: Thema[]
  ursachen: Ursache[]
  instrumente: Instrument[]
  /** Alle erfassten Maßnahmen, auch ungeprüfte Entwürfe und frühere Wahlperioden. */
  massnahmen: KatalogMassnahme[]
  /** IDs entfernter Einträge (daten/ids.json) – werden nie wieder vergeben. */
  stillgelegt: number[]
  abdeckung: Abdeckung[]
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
      const { instrument_id: _i, landtagswahl: _l, entwurf_herkunft: _h, bewertungen: _b, ...m } = eintrag
      return mitKiEntwurf ? { ...m, ki_entwurf: !k.fiktiv && !eintraege.get(programmSchluessel(eintrag))!.geprueft } : m
    })
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

export function pruefeKatalog(parteienDatei: Datei, themenDateien: Datei[], idsDatei?: Datei): Pruefergebnis {
  const fehler: string[] = []
  const warnungen: string[] = []
  const katalog: Katalog = {
    fiktiv: false, laender: [], landesprogramme: [], parteien: [], themen: [], ursachen: [], instrumente: [], massnahmen: [],
    abdeckung: [], stillgelegt: [],
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

  // Wirksamkeit, Umsetzbarkeit, Begründung, Forschungsstand, Rollen und Ergebnis der Prüfung.
  const bewertungsteil = (ort: string, roh: Record<string, unknown>, evidenzPflicht: boolean): Bewertungsteil => {
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
      unbekannteFelder(idsDatei.pfad, d, ['hinweis', 'stillgelegt'])
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
    unbekannteFelder(ort, t, ['id', 'name', 'beschreibung', 'ziel', 'schlagwoerter', 'ursachen', 'instrumente', 'abdeckung'])
    // Ziel aus Sicht der Betroffenen: Daran wird die Wirksamkeit gemessen. Bei echten Daten Pflicht.
    const ziel = t.ziel !== undefined || !katalog.fiktiv ? text(ort, t, 'ziel', 200) : ''
    const thema: Thema = {
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
      unbekannteFelder(uOrt, roh, ['id', 'beschreibung', 'quelle_url', 'ebene', 'schlagwoerter', 'nachtraeglich'])
      // Nach dem Blick in die Programme ergänzt? Dann offen vermerkt, mit Datum und Grund.
      if (roh.nachtraeglich !== undefined) text(uOrt, roh, 'nachtraeglich', 300)
      const u: Ursache = {
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
      const uw = schlagwoerter(uOrt, roh)
      if (uw) u.schlagwoerter = uw
      if (ursacheIds.has(u.id)) f(uOrt, `Ursachen-ID ${u.id} ist doppelt`)
      ursacheIds.add(u.id)
      eigeneUrsachen.add(u.id)
      katalog.ursachen.push(u)
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
      unbekannteFelder(iOrt, roh, ['id', 'name', ...INSTRUMENT_FELDER])
      const ins: Instrument = {
        id: ganzzahl(iOrt, roh, 'id', 1, 2147483647),
        thema_id: thema.id,
        name: text(iOrt, roh, 'name', 120),
        ...bewertungsteil(iOrt, roh, true),
      }
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
        unbekannteFelder(kOrt, k, ['begruendung', 'stand', 'geprueft', 'ki_entwurf'])
        const begruendung = text(kOrt, k, 'begruendung')
        const stand = datum(kOrt, k, 'stand')
        const geprueft = wahrheitswert(kOrt, k, 'geprueft')
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
          'begruendung', 'zitat', 'beleg_programm_url', 'beleg_studie_url', 'evidenz', 'stand', 'geprueft', 'bewertung', 'ki_entwurf',
          'entwurf_herkunft',
        ])
        const kiEntwurf = mRoh.ki_entwurf !== undefined && wahrheitswert(mOrt, mRoh, 'ki_entwurf')
        const geprueft = wahrheitswert(mOrt, mRoh, 'geprueft')
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
          bewertung = bewertungsteil(mOrt, mRoh, geprueft || kiEntwurf)
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

  const nachId = <T extends { id: number }>(a: T, b: T) => a.id - b.id
  katalog.themen.sort(nachId)
  katalog.ursachen.sort(nachId)
  katalog.instrumente.sort(nachId)
  katalog.massnahmen.sort(nachId)
  return { katalog, fehler, warnungen }
}

/** Ergebnis von Vites `import.meta.glob(…, { eager: true, import: 'default' })` als sortierte Dateiliste. */
export const alsDateien = (module: Record<string, unknown>): Datei[] =>
  Object.entries(module)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pfad, inhalt]) => ({ pfad: pfad.replace(/^(\.\.\/)+/, ''), inhalt }))

/** Prüft und wirft bei Fehlern – für Stellen, an denen die Daten schon geprüft sein müssen. */
export function ladeKatalog(parteienDatei: Datei, themenDateien: Datei[]): Katalog {
  const { katalog, fehler } = pruefeKatalog(parteienDatei, themenDateien)
  if (fehler.length) throw new Error(`Datenkatalog fehlerhaft (npm run daten:pruefen):\n${fehler.join('\n')}`)
  return katalog
}
