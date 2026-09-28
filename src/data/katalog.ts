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
}

/** Abdeckung im Repo: wie in der Datenbank, plus Prüfstatus des ganzen Eintrags. */
export interface Abdeckung extends AbdeckungEintrag {
  /** true, wenn `keine_massnahme` bzw. alle Maßnahmen der Partei zum Thema geprüft sind. */
  geprueft: boolean
}

/** Landesprogramm im Repo: mit Wahl, zu der es gehört. */
export interface LandesprogrammEintrag extends Landesprogramm {
  landtagswahl: string
  /** true, wenn es zur letzten Landtagswahl des Landes gehört (laufende Wahlperiode). */
  aktuell: boolean
}

export interface Katalog {
  /** true = erfundene Platzhalterdaten (Mock). Dann gelten gelockerte Regeln. */
  fiktiv: boolean
  laender: Land[]
  landesprogramme: LandesprogrammEintrag[]
  parteien: Partei[]
  themen: Thema[]
  ursachen: Ursache[]
  /** Alle erfassten Maßnahmen, auch ungeprüfte Entwürfe. */
  massnahmen: Massnahme[]
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

export function spielbareAbdeckung(k: Katalog): AbdeckungEintrag[] {
  // Landesprogramme zählen nur in der laufenden Wahlperiode.
  const aktuell = new Set(spielbareLandesprogramme(k).filter((p) => p.url).map((p) => `${p.partei_id}/${p.land}`))
  return k.abdeckung
    .filter((a) => k.fiktiv || a.geprueft)
    .filter((a) => !a.land || aktuell.has(`${a.partei_id}/${a.land}`))
    .map(({ thema_id, partei_id, land, art, begruendung, stand }) => ({
      thema_id, partei_id, land: land ?? null, art, begruendung, stand,
    }))
}

const programmSchluessel = (x: { thema_id: number; partei_id: number; land?: string | null }) =>
  `${x.thema_id}/${x.partei_id}/${x.land ?? ''}`

export function spielbareMassnahmen(k: Katalog): Massnahme[] {
  const frei = new Set(spielbareAbdeckung(k).map(programmSchluessel))
  return k.massnahmen.filter((m) => frei.has(programmSchluessel(m)))
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/
const FARBE = /^#[0-9a-fA-F]{6}$/
const SEITENANKER = /#page=\d+$/
const PLATZHALTER_HOSTS = ['example.org', 'example.com', 'example.net']
const LAND_KUERZEL = /^[A-Z]{2}$/
const EBENEN = ['bund', 'land'] as const
const EVIDENZ = ['belegt', 'gemischt', 'offen'] as const

const istObjekt = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const istDatum = (v: unknown): v is string =>
  typeof v === 'string' && DATUM.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v)

const ohneAnker = (url: string) => url.split('#')[0]

export function pruefeKatalog(parteienDatei: Datei, themenDateien: Datei[]): Pruefergebnis {
  const fehler: string[] = []
  const warnungen: string[] = []
  const katalog: Katalog = {
    fiktiv: false, laender: [], landesprogramme: [], parteien: [], themen: [], ursachen: [], massnahmen: [], abdeckung: [],
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
  const schlagwoerter = (ort: string, o: Record<string, unknown>): string[] | undefined => {
    const v = o.schlagwoerter
    if (v === undefined) return undefined
    if (!Array.isArray(v) || v.some((s) => typeof s !== 'string' || !s.trim())) {
      f(ort, '„schlagwoerter“ muss eine Liste von Texten sein')
      return undefined
    }
    return v as string[]
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
    unbekannteFelder(ort, roh, ['id', 'name', 'kurzname', 'farbe', 'programm_url', 'programm_stand', 'landesprogramme'])
    const p: Partei = {
      id: ganzzahl(ort, roh, 'id', 1, 32767),
      name: text(ort, roh, 'name', 80),
      kurzname: text(ort, roh, 'kurzname', 20),
      farbe: text(ort, roh, 'farbe', 7),
      programm_url: url(ort, roh, 'programm_url') ?? '',
      programm_stand: datum(ort, roh, 'programm_stand'),
    }
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
      unbekannteFelder(lOrt, lRoh, ['land', 'landtagswahl', 'url', 'stand', 'kein_programm'])
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
      if (lp.url?.includes('#')) f(lOrt, '„url“ ist die Adresse des ganzen Programms – ohne #-Anker')
      if (land && landtagswahl > land.letzte_wahl) f(lOrt, `„landtagswahl“ liegt nach der letzten Wahl in ${land.name} (${land.letzte_wahl})`)
      if (land && landtagswahl && landtagswahl < land.letzte_wahl) {
        warnungen.push(`${lOrt}: Programm zur Wahl ${landtagswahl} ist veraltet (letzte Wahl in ${land.name}: ${land.letzte_wahl}) – zählt nicht mehr; Programm zur neuen Wahl eintragen`)
      }
      if (katalog.landesprogramme.some((x) => x.partei_id === p.id && x.land === landId)) f(lOrt, `Land „${landId}“ ist für diese Partei doppelt`)
      katalog.landesprogramme.push(lp)
    }
  })
  if (katalog.parteien.length < 2) f(pOrt, 'mindestens zwei Parteien nötig')
  const parteiNach = new Map(katalog.parteien.map((p) => [p.id, p]))

  // --- Themen ----------------------------------------------------------------
  const themaIds = new Set<number>()
  const themaNamen = new Set<string>()
  const ursacheIds = new Set<number>()
  const massnahmeIds = new Set<number>()

  for (const datei of themenDateien) {
    const ort = datei.pfad
    const t = datei.inhalt
    if (!istObjekt(t)) {
      f(ort, 'erwartet ein Objekt')
      continue
    }
    unbekannteFelder(ort, t, ['id', 'name', 'beschreibung', 'ziel', 'schlagwoerter', 'ursachen', 'abdeckung'])
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
      unbekannteFelder(aOrt, roh, ['partei_id', 'land', 'massnahmen', 'keine_massnahme'])
      const parteiId = ganzzahl(aOrt, roh, 'partei_id', 1, 32767)
      const partei = parteiNach.get(parteiId)
      if (!partei) f(aOrt, `unbekannte Partei-ID ${parteiId}`)

      // Ohne „land“: Bundesprogramm. Mit „land“: Landesprogramm der Partei in diesem Land.
      const land = roh.land === undefined ? null : text(aOrt, roh, 'land', 2)
      let programm = partei ? { url: partei.programm_url, stand: partei.programm_stand } : null
      if (land !== null) {
        const lp = katalog.landesprogramme.find((x) => x.partei_id === parteiId && x.land === land)
        if (!lp) f(aOrt, `kein Landesprogramm „${land}“ für Partei ${parteiId} eingetragen (parteien.json → „landesprogramme“)`)
        else if (!lp.url) f(aOrt, `Partei ${parteiId} hat in „${land}“ kein Programm (${lp.kein_programm}) – Eintrag entfernen`)
        else if (!lp.aktuell) warnungen.push(`${aOrt}: Landesprogramm „${land}“ ist veraltet – zählt nicht mehr`)
        programm = lp?.url && lp.stand ? { url: lp.url, stand: lp.stand } : null
      }
      const schluessel = `${parteiId}/${land ?? ''}`
      if (gesehen.has(schluessel)) f(aOrt, `Partei ${parteiId}${land ? ` (${land})` : ''} ist mehrfach eingetragen`)
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
        unbekannteFelder(kOrt, k, ['begruendung', 'stand', 'geprueft'])
        const begruendung = text(kOrt, k, 'begruendung')
        const stand = datum(kOrt, k, 'stand')
        const geprueft = wahrheitswert(kOrt, k, 'geprueft')
        if (programm && stand && programm.stand && stand < programm.stand) {
          f(kOrt, `„stand“ ${stand} liegt vor dem Programmstand ${programm.stand} – bitte im aktuellen Programm neu prüfen`)
        }
        if (!katalog.fiktiv && !geprueft) warnungen.push(`${kOrt}: noch nicht geprüft – Thema gilt für die Partei als „noch nicht erfasst“`)
        katalog.abdeckung.push({ thema_id: thema.id, partei_id: parteiId, land, art: 'keine', begruendung, stand, geprueft })
        continue
      }

      if (!Array.isArray(roh.massnahmen) || roh.massnahmen.length === 0) {
        f(aOrt, '„massnahmen“ muss mindestens eine Maßnahme enthalten – sonst „keine_massnahme“ verwenden')
        continue
      }
      let alleGeprueft = true
      let neuesterStand = ''
      for (const [j, mRoh] of roh.massnahmen.entries()) {
        const mOrt = `${aOrt} › massnahmen[${j}]`
        if (!istObjekt(mRoh)) {
          f(mOrt, 'erwartet ein Objekt')
          continue
        }
        unbekannteFelder(mOrt, mRoh, [
          'id', 'beschreibung', 'ursachen_ids', 'wirksamkeit', 'umsetzbarkeit', 'rollen_modifikator',
          'begruendung', 'zitat', 'beleg_programm_url', 'beleg_studie_url', 'evidenz', 'stand', 'geprueft', 'bewertung',
        ])
        const m: Massnahme = {
          id: ganzzahl(mOrt, mRoh, 'id', 1, 2147483647),
          thema_id: thema.id,
          partei_id: parteiId,
          land,
          beschreibung: text(mOrt, mRoh, 'beschreibung', 200),
          ursachen_ids: [],
          wirksamkeit: ganzzahl(mOrt, mRoh, 'wirksamkeit', 0, 3) as Massnahme['wirksamkeit'],
          umsetzbarkeit: ganzzahl(mOrt, mRoh, 'umsetzbarkeit', 0, 3) as Massnahme['umsetzbarkeit'],
          begruendung: text(mOrt, mRoh, 'begruendung', 300),
          beleg_programm_url: url(mOrt, mRoh, 'beleg_programm_url') ?? '',
          stand: datum(mOrt, mRoh, 'stand'),
          geprueft: wahrheitswert(mOrt, mRoh, 'geprueft'),
        }
        const studie = url(mOrt, mRoh, 'beleg_studie_url', false)
        if (studie) m.beleg_studie_url = studie

        // Stand der Forschung: Höchste Wirksamkeit nur mit belegter Wirkung (docs/methode.md).
        if (mRoh.evidenz !== undefined) {
          if (!(EVIDENZ as readonly unknown[]).includes(mRoh.evidenz)) f(mOrt, `„evidenz“ muss ${EVIDENZ.map((e) => `„${e}“`).join(', ')} sein`)
          else m.evidenz = mRoh.evidenz as Massnahme['evidenz']
        }
        if (!katalog.fiktiv) {
          if (m.wirksamkeit === 3 && m.evidenz !== 'belegt') f(mOrt, '„wirksamkeit“ 3 nur mit „evidenz“: „belegt“ – sonst höchstens 2')
          if (m.geprueft && !m.evidenz) f(mOrt, '„evidenz“ fehlt – vor „geprueft“ angeben, wie gut die Wirkung belegt ist')
        }
        // Wörtliches Zitat aus dem Programm: macht die Prüfung nachvollziehbar
        // (Suche im PDF). Bei echten Daten Pflicht.
        if (mRoh.zitat !== undefined || !katalog.fiktiv) {
          const zitat = text(mOrt, mRoh, 'zitat', 800)
          if (zitat) m.zitat = zitat
        }

        if (massnahmeIds.has(m.id)) f(mOrt, `Maßnahmen-ID ${m.id} ist doppelt`)
        massnahmeIds.add(m.id)

        // Ursachen müssen zum Thema gehören.
        const ids = mRoh.ursachen_ids
        if (!Array.isArray(ids) || ids.length === 0 || ids.some((x) => !Number.isInteger(x))) {
          f(mOrt, '„ursachen_ids“ muss eine nicht leere Liste von IDs sein')
        } else {
          for (const id of ids as number[]) {
            if (!eigeneUrsachen.has(id)) f(mOrt, `Ursache ${id} gehört nicht zum Thema „${thema.name}“`)
            else adressiert.add(id)
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

        // Rollen-Modifikatoren: nur bekannte Rollen, kleiner Wert, immer begründet.
        const rm = mRoh.rollen_modifikator
        if (rm !== undefined && rm !== null) {
          if (!istObjekt(rm)) f(mOrt, '„rollen_modifikator“ muss ein Objekt sein')
          else {
            for (const [rolle, mod] of Object.entries(rm)) {
              const rOrt = `${mOrt} › rollen_modifikator.${rolle}`
              if (!(ROLLEN_IDS as readonly string[]).includes(rolle)) f(rOrt, `unbekannte Rolle (erlaubt: ${ROLLEN_IDS.join(', ')})`)
              if (!istObjekt(mod)) {
                f(rOrt, 'erwartet { wert, begruendung }')
                continue
              }
              unbekannteFelder(rOrt, mod, ['wert', 'begruendung'])
              ganzzahl(rOrt, mod, 'wert', -2, 2)
              if (mod.wert === 0) f(rOrt, '„wert“ 0 hat keine Wirkung – Eintrag weglassen')
              text(rOrt, mod, 'begruendung', 200)
            }
            m.rollen_modifikator = rm as Massnahme['rollen_modifikator']
          }
        }

        // Ergebnis der Prüfung durch Eingeladene (npm run pruefung:uebernehmen): Anzahl und Mediane,
        // nie Namen. Bei echten Daten gilt eine Maßnahme erst ab zwei Bewertungen als geprüft.
        const bw = mRoh.bewertung
        let anzahl = 0
        if (bw !== undefined) {
          const bOrt = `${mOrt} › bewertung`
          if (!istObjekt(bw)) f(bOrt, 'erwartet ein Objekt mit anzahl, median_w, median_u, spannweite, datum, entwurf')
          else {
            unbekannteFelder(bOrt, bw, ['anzahl', 'median_w', 'median_u', 'spannweite', 'datum', 'entwurf'])
            anzahl = ganzzahl(bOrt, bw, 'anzahl', 1, 99)
            const mw = ganzzahl(bOrt, bw, 'median_w', 0, 3)
            const mu = ganzzahl(bOrt, bw, 'median_u', 0, 3)
            ganzzahl(bOrt, bw, 'spannweite', 0, 3)
            datum(bOrt, bw, 'datum')
            const e = bw.entwurf
            if (!Array.isArray(e) || e.length !== 2 || e.some((x) => !Number.isInteger(x) || x < 0 || x > 3))
              f(bOrt, '„entwurf“ muss [Wirksamkeit, Umsetzbarkeit] des Entwurfs sein, je 0 bis 3')
            if (mw !== m.wirksamkeit || mu !== m.umsetzbarkeit)
              f(bOrt, '„wirksamkeit“/„umsetzbarkeit“ weichen von den Medianen der Prüfung ab – neu prüfen lassen oder „bewertung“ anpassen')
          }
        }
        if (!katalog.fiktiv && m.geprueft && anzahl < 2) {
          f(mOrt, '„geprueft“ erst ab zwei unabhängigen Bewertungen („bewertung.anzahl“ ≥ 2, siehe daten/README.md → „Prüfung“)')
        }

        if (!m.geprueft) {
          alleGeprueft = false
          if (!katalog.fiktiv) {
            warnungen.push(`${mOrt}: noch nicht geprüft – bis alle Maßnahmen der Partei zum Thema geprüft sind, gilt es als „noch nicht erfasst“`)
          }
        }
        if (m.stand > neuesterStand) neuesterStand = m.stand
        katalog.massnahmen.push(m)
      }
      katalog.abdeckung.push({
        thema_id: thema.id, partei_id: parteiId, land, art: 'massnahmen', begruendung: null, stand: neuesterStand, geprueft: alleGeprueft,
      })
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
