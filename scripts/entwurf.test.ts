import { describe, expect, it } from 'vitest'
import { pruefeKatalog, type Datei } from '../src/data/katalog'
import { BUENDEL_OHNE, begriffePruefsumme, bewertungsHinweise, pruefeLeitfaden, pruefeProgramm, zitatHinweise, zuordnungsBilanz, type Leitfaden, blindListe, blindReste, eintragen, erfassungsHinweise, neutralisiere, resteSchwelle, zuordnungsHinweise, kennungen, ohneParteinamen, programmServer, PROTOKOLL, pruefeBewertung, pruefeErfassung, pruefeKennungen, ordneKennungen, pruefeProtokoll, vergleicheErfassung, ohneBuendel, teilbewertung, fuehreTeilbewertungZusammen, kurzbericht, enthaeltParteinamen, pruefeAntwort, type BlindListe, ursachenFreigegeben, pruefeNachtrag, type Bewertung, type Erfassung, type Kennung, type Treffermatrix, type Zuordnung } from './entwurf'
import { seitenOhneText } from './programme'
import { auftragText } from './entwurf/auftrag-text'
import { erstesJsonObjekt, fehlerStelle } from './entwurf/json-text'
import { mitLeitfaden } from './entwurf/erfassung-datei'
import { berichtText } from './entwurf/bericht-text'
import { breiteBegriffe } from './entwurf/vorab'
import { wortformen } from './entwurf/suche'
import { pruefeDatenordner } from './katalog-laden'
import { readdirSync, readFileSync } from 'node:fs'
import { phaseAZuerst, vergleicheStand } from './stand-vergleich'

const PARTEIEN: Datei = {
  pfad: 'parteien.json',
  inhalt: {
    fiktiv: false,
    laender: [{ id: 'ST', name: 'Sachsen-Anhalt', letzte_wahl: '2026-09-06' }],
    parteien: [
      { id: 1, name: 'Partei Eins', kurzname: 'Eins', farbe: '#112233', programm_url: 'https://eins.de/p.pdf', programm_stand: '2025-01-01' },
      {
        id: 2,
        name: 'Partei Zwei',
        kurzname: 'Zwei',
        farbe: '#445566',
        programm_url: 'https://zwei.de/p.pdf',
        programm_stand: '2025-01-01',
        landesprogramme: [{ land: 'ST', landtagswahl: '2026-09-06', url: 'https://zwei-st.de/p.pdf', stand: '2026-03-01' }],
      },
    ],
  },
}

const themaInhalt = (ursachen = [
  { id: 1701, beschreibung: 'Zu wenige Plätze', quelle_url: 'https://destatis.de/a', ebene: 'land' },
  { id: 1702, beschreibung: 'Zu wenig Personal', quelle_url: 'https://destatis.de/b', ebene: 'bund' },
]) => ({ id: 17, name: 'Kita', beschreibung: 'Kein Kitaplatz.', ziel: 'Eltern finden einen Platz.', freigabe: { datum: '2026-10-01', quellen_bestaetigt: [1701, 1702] }, ursachen })

const katalog = (inhalt: Record<string, unknown> = themaInhalt()) => {
  const r = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/17-kita.json', inhalt }], { pfad: 'ids.json', inhalt: { stillgelegt: [] } })
  expect(r.fehler).toEqual([])
  return r.katalog
}

const SUCHBEGRIFFE = { '1701': { 'Plätze ausbauen': ['kita'] }, '1702': { 'Fachkräfte gewinnen': ['erzieher'], Quereinstieg: ['quereinst'] } }
const TREFFER: Treffermatrix = {
  begriffe_pruefsumme: begriffePruefsumme(SUCHBEGRIFFE),
  programme: [
    { partei_id: 1, land: null, ursachen: { '1701': { 'Plätze ausbauen': { kita: 4 } }, '1702': { 'Fachkräfte gewinnen': { erzieher: 2 }, Quereinstieg: { quereinst: 0 } } } },
    { partei_id: 2, land: null, ursachen: { '1701': { 'Plätze ausbauen': { kita: 12 } }, '1702': { 'Fachkräfte gewinnen': { erzieher: 0 }, Quereinstieg: { quereinst: 0 } } } },
    { partei_id: 2, land: 'ST', ursachen: { '1701': { 'Plätze ausbauen': { kita: 3 } } } },
  ],
}

const erfassung = (): Erfassung => ({
  thema_id: 17,
  suchbegriffe: structuredClone(SUCHBEGRIFFE),
  treffer: structuredClone(TREFFER),
  programme: [
    {
      partei_id: 1,
      land: null,
      massnahmen: [
        { beschreibung: 'Mehr Kitaplätze fördern', ursachen_ids: [1701], zitat: 'Wir Freie Demokraten fördern Kitaplätze.', seite: 12 },
        { beschreibung: 'Erzieherausbildung vergüten', ursachen_ids: [1702], zitat: 'Die Ausbildung wird vergütet.', seite: 13 },
      ],
    },
    { partei_id: 2, land: null, massnahmen: [], keine_massnahme: 'Kapitel Familie (S. 20–24) gelesen, nichts zu Kitas.' },
    { partei_id: 2, land: 'ST', massnahmen: [{ beschreibung: 'Kita-Ausbau im Land', ursachen_ids: [1701], zitat: 'Die LINKE will mehr Kitas.', seite: 5 }] },
  ],
})

const bewertung = (e: Erfassung): Bewertung => {
  const k = kennungen(e)
  const nach = (p: number, m: number) => k.find((x) => x.programm === p && x.massnahme === m)!.kennung
  return {
    blind_pruefsumme: blindListe(katalog(), e).pruefsumme,
    neue_instrumente: [{ kennung: 'I1', name: 'Kitaplätze ausbauen (Bund)', wirksamkeit: 2, umsetzbarkeit: 2, begruendung: 'Mehr Plätze.', evidenz: 'belegt' }],
    zuordnung: [
      { kennung: nach(0, 0), instrument: 'I1', ursachen: [1701] },
      { kennung: nach(0, 1), einzeln: { wirksamkeit: 2, umsetzbarkeit: 3, begruendung: 'Mehr Bewerbungen.', evidenz: 'gemischt' }, ursachen: [1702] },
      { kennung: nach(2, 0), einzeln: { wirksamkeit: 2, umsetzbarkeit: 2, begruendung: 'Land ist zuständig.', evidenz: 'belegt' }, ursachen: [1701] },
    ],
  }
}

describe('Ursachen freigegeben', () => {
  it('verlangt, dass das Thema mit denselben Ursachen im Zielzweig steht', () => {
    const k = katalog()
    expect(ursachenFreigegeben(k, k, 17)).toEqual([])
    expect(ursachenFreigegeben(k, k, 18).join()).toMatch(/noch nicht im Zielzweig/)
    const geaendert = katalog(themaInhalt([
      { id: 1701, beschreibung: 'Zu wenige Plätze im Westen', quelle_url: 'https://destatis.de/a', ebene: 'land' },
      { id: 1702, beschreibung: 'Zu wenig Personal', quelle_url: 'https://destatis.de/b', ebene: 'bund' },
      { id: 1703, beschreibung: 'Neu', quelle_url: 'https://destatis.de/c', ebene: 'bund' },
    ]))
    const fehler = ursachenFreigegeben(k, geaendert, 17).join('\n')
    expect(fehler).toMatch(/1701 weicht/)
    expect(fehler).toMatch(/1703 ist nicht freigegeben/)
  })

  it('verlangt Freigabe mit Datum und bestätigten Quellen im Zielzweig', () => {
    const { freigabe: _f, ...ohne } = themaInhalt()
    expect(ursachenFreigegeben(katalog(ohne), katalog(), 17).join()).toMatch(/keine „freigabe“/)
    const teilweise = katalog({ ...themaInhalt(), freigabe: { datum: '2026-10-01', quellen_bestaetigt: [1701] } })
    expect(ursachenFreigegeben(teilweise, katalog(), 17).join()).toMatch(/Ursache 1702 sind nicht bestätigt/)
    expect(pruefeKatalog(PARTEIEN, [{ pfad: 't.json', inhalt: { ...themaInhalt(), freigabe: { datum: '1.10.', quellen_bestaetigt: [1799] } } }]).fehler.join()).toMatch(/1799 gehört nicht zum Thema[^]*Datum/)
  })

  it('akzeptiert eine KI-Freigabe ohne bestätigte Quellen', () => {
    const ki = katalog({ ...themaInhalt(), freigabe: { datum: '2026-10-05', art: 'ki' } })
    expect(ursachenFreigegeben(ki, ki, 17)).toEqual([])
    expect(ki.themen[0].freigabe).toEqual({ datum: '2026-10-05', quellen_bestaetigt: [], art: 'ki' })
  })

  it('verlangt auch das freigegebene Ziel', () => {
    const k = katalog()
    const anderesZiel = katalog({ ...themaInhalt(), ziel: 'Eltern finden einen bezahlbaren Platz.' })
    expect(ursachenFreigegeben(k, anderesZiel, 17).join()).toMatch(/Ziel von Thema 17 weicht/)
  })
})

describe('Quellen beim Festlegen der Ursachen', () => {
  it('sperrt die Server der Wahlprogramme, auch als Archivkopie', () => {
    const k = katalog()
    expect(programmServer(k, 'https://www.eins.de/andere.pdf')).toMatch(/eins\.de/)
    expect(programmServer(k, 'https://landtag.zwei-st.de/x.pdf')).toMatch(/zwei-st\.de/)
    expect(programmServer(k, 'https://web.archive.org/web/2025id_/https://zwei.de/p.pdf')).toMatch(/zwei\.de/)
    expect(programmServer(k, 'https://web.archive.org/web/2025/https%3A%2F%2Fzwei.de%2Fp.pdf')).toMatch(/zwei\.de/)
    expect(programmServer(k, 'https://www.dji.de/studie.pdf')).toBeNull()
    expect(programmServer(k, 'https://keins.de/p.pdf')).toBeNull()
  })
})

describe('Liste ohne Parteinamen', () => {
  it('ersetzt Parteinamen samt Artikel und „Wir“, aber keine Wortteile', () => {
    expect(ohneParteinamen('Wir Freie Demokraten und die LINKE wollen das.')).toBe('Wir und [Partei] wollen das.')
    expect(ohneParteinamen('Grünflächen und Unionsrecht bleiben.')).toBe('Grünflächen und Unionsrecht bleiben.')
    expect(ohneParteinamen('Die Europäische Union und die linke Spur bleiben, die Union nicht.')).toBe('Die Europäische Union und die linke Spur bleiben, [Partei] nicht.')
    expect(ohneParteinamen('Die Partei Eins will das.', ['Partei Eins'])).toBe('[Partei] will das.')
    // Mehrwortnamen ohne Rücksicht auf Groß- und Kleinschreibung, Namen mit Artikel aus parteien.json.
    expect(ohneParteinamen('DIE LINKE und BÜNDNIS 90/DIE GRÜNEN, wir als AfD', ['Die Linke'])).toBe('[Partei] und [Partei], wir')
    expect(ohneParteinamen('Das BSW und Friedrich Merz')).toBe('[Partei] und [Person]')
  })

  it('ersetzt Länder, Städte und Landesorgane', () => {
    expect(neutralisiere('Der Berliner Senat und das Abgeordnetenhaus, Sachsen-Anhalts Kitas in Magdeburg')).toBe('Der [Land] [Land] und das [Land], [Land] Kitas in [Land]')
    expect(neutralisiere('Niedersächsische Sachsenhausen-Gedenkstätte')).toBe('Niedersächsische Sachsenhausen-Gedenkstätte')
  })

  it('meldet verdächtige Reste und bricht über einer Schwelle ab', () => {
    const liste = { massnahmen: [{ kennung: 'M01', ebene: 'bund' as const, beschreibung: 'Liberale Kita-Politik', zitat: 'Unsere Fraktion will das. Die Ampel hat versagt.', ursachen_ids: [1701] }] }
    expect(blindReste(liste)).toEqual([{ kennung: 'M01', reste: ['Liberale', 'Fraktion', 'Ampel'] }])
    expect(blindReste({ massnahmen: [{ ...liste.massnahmen[0], beschreibung: 'Ampelphasen', zitat: 'Genossenschaften fördern' }] })).toEqual([])
    expect(resteSchwelle(10)).toBe(3)
    expect(resteSchwelle(200)).toBe(10)
  })

  it('mischt die Reihenfolge fest und zeigt keine Partei', () => {
    const e = erfassung()
    expect(kennungen(e)).toEqual(kennungen(erfassung()))
    expect(kennungen(e).map((x) => x.kennung)).toEqual(['M01', 'M02', 'M03'])
    const liste = blindListe(katalog(), e)
    const text = JSON.stringify(liste)
    expect(text).not.toMatch(/partei_id|Freie Demokraten|LINKE|eins\.de|zwei/)
    expect(liste.massnahmen.find((m) => m.ebene === 'land')?.zitat).toBe('[Partei] will mehr Kitas.')
    expect(liste.ursachen).toHaveLength(2)
  })

  it('hält gespeicherte Kennungen stabil, auch wenn ein Text später geändert wird', () => {
    const e = erfassung()
    const fest = kennungen(e)
    expect(pruefeKennungen(e, fest)).toEqual([])
    // Ohne gespeicherte Zuordnung verschiebt sich die Reihenfolge bei manchen Textänderungen (Prüfsumme).
    const verschiebt = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].some((x) => {
      e.programme[0].massnahmen[0].beschreibung = `Kitaplätze fördern ${x}`
      const nur = (l: Kennung[]) => JSON.stringify(l.map(({ kennung, programm, massnahme }) => [kennung, programm, massnahme]))
      return nur(kennungen(e)) !== nur(fest)
    })
    expect(verschiebt).toBe(true)
    // Über den Inhalt zugeordnet: gleiche Kennung, Beschreibung als geändert gemeldet.
    const a = ordneKennungen(e, fest)
    expect(a.neu).toEqual([])
    expect(a.entfallen).toEqual([])
    expect(a.kennungen.map((x) => [x.kennung, x.programm, x.massnahme])).toEqual(fest.map((x) => [x.kennung, x.programm, x.massnahme]))
    expect(a.geaendert.map((g) => [g.kennung.kennung, g.was])).toEqual([[fest.find((x) => x.programm === 0 && x.massnahme === 0)!.kennung, ['Beschreibung oder Ursachen']]])
    expect(pruefeKennungen(e, fest)).toEqual([])
    const liste = blindListe(katalog(), e, a.kennungen)
    expect(liste.massnahmen.map((m) => m.kennung)).toEqual(fest.map((x) => x.kennung))
  })

  it('vergibt beim Einfügen nur der neuen Maßnahme eine neue, fortlaufende Kennung', () => {
    const e = erfassung()
    const fest = kennungen(e)
    const vorher = new Map(fest.map((x) => [`${x.partei_id}/${x.land}/${x.zitat}`, x.kennung]))
    // Maßnahme vorn einfügen: Alle Stellen in Programm 0 verschieben sich, die Kennungen nicht.
    e.programme[0].massnahmen.unshift({ beschreibung: 'Neue Zusage', ursachen_ids: [1702], zitat: 'Wir stellen mehr Erzieher ein.', seite: 14 })
    const a = ordneKennungen(e, fest, fest.length)
    expect(a.neu.map((x) => [x.kennung, x.programm, x.massnahme])).toEqual([['M04', 0, 0]])
    expect(a.entfallen).toEqual([])
    expect(a.geaendert).toEqual([])
    for (const x of a.kennungen.filter((k) => k.kennung !== 'M04')) expect(vorher.get(`${x.partei_id}/${x.land}/${x.zitat}`)).toBe(x.kennung)
    expect(pruefeKennungen(e, fest).join()).toMatch(/noch keine Kennung/)
    // Die Blindliste nennt die neue Kennung zuletzt; die übrigen Einträge sind unverändert (gleiche Prüfsumme je Maßnahme).
    const alt = blindListe(katalog(), erfassung(), fest)
    const neu = blindListe(katalog(), e, a.kennungen)
    expect(neu.massnahmen.map((m) => m.kennung)).toEqual(['M01', 'M02', 'M03', 'M04'])
    for (const m of alt.massnahmen) expect(neu.massnahmen.find((x) => x.kennung === m.kennung)?.pruefsumme).toBe(m.pruefsumme)
  })

  it('vergibt entfallene Kennungen nicht neu und erkennt Umsortieren und geänderte Zitate', () => {
    const e = erfassung()
    const fest = kennungen(e)
    const weg = fest.find((x) => x.programm === 0 && x.massnahme === 1)!
    // Löschen: Kennung entfällt, die nächste neue Maßnahme bekommt trotzdem eine höhere Nummer.
    e.programme[0].massnahmen.splice(1, 1)
    const a = ordneKennungen(e, fest, fest.length)
    expect(a.entfallen.map((x) => x.kennung)).toEqual([weg.kennung])
    expect(a.neu).toEqual([])
    expect(pruefeKennungen(e, fest).join()).toMatch(/gibt es in der Erfassung nicht mehr/)
    e.programme[0].massnahmen.push({ beschreibung: 'Andere Zusage', ursachen_ids: [1702], zitat: 'Ganz anders.', seite: 30 })
    const b = ordneKennungen(e, a.kennungen, a.vergeben_bis)
    expect(b.neu.map((x) => x.kennung)).toEqual(['M04'])
    // Programme umsortieren: Zuordnung über Partei und Land, nicht über die Stelle.
    const getauscht = structuredClone(erfassung())
    ;[getauscht.programme[0], getauscht.programme[2]] = [getauscht.programme[2], getauscht.programme[0]]
    const c = ordneKennungen(getauscht, fest)
    expect([c.neu, c.entfallen, c.geaendert]).toEqual([[], [], []])
    for (const x of c.kennungen) expect(getauscht.programme[x.programm].partei_id).toBe(fest.find((f) => f.kennung === x.kennung)!.partei_id)
    // Zitat korrigiert (gleicher Anfang): dieselbe Kennung, als geändert gemeldet. Beschreibung und Zitat neu: neue Maßnahme.
    const korr = erfassung()
    korr.programme[0].massnahmen[0].zitat = 'Wir Freie Demokraten fördern Kitaplätze überall.'
    const d = ordneKennungen(korr, fest)
    expect(d.geaendert.map((g) => g.was)).toEqual([['Zitat']])
    korr.programme[0].massnahmen[0] = { beschreibung: 'Ganz andere Maßnahme', ursachen_ids: [1701], zitat: 'Etwas völlig anderes.', seite: 12 }
    const f = ordneKennungen(korr, fest)
    expect([f.neu.length, f.entfallen.length]).toEqual([1, 1])
    // Ältere kennungen.json ohne Herkunft: weiter lesbar (Herkunft aus der damaligen Stelle).
    const alt = fest.map(({ kennung, programm, massnahme, beschreibung, zitat }) => ({ kennung, programm, massnahme, beschreibung, zitat }))
    expect(pruefeKennungen(erfassung(), alt)).toEqual([])
  })

  it('ordnet ein Zitat mit Parteinamen über das Original zu, obwohl die Blindliste den Namen ersetzt', () => {
    const e = erfassung()
    const fest = kennungen(e)
    const fdp = fest.find((x) => x.programm === 0 && x.massnahme === 0)!
    expect(blindListe(katalog(), e, fest).massnahmen.find((m) => m.kennung === fdp.kennung)?.zitat).toBe('Wir fördern Kitaplätze.')
    // Eine zweite Maßnahme mit demselben neutralisierten Zitat, aber anderem Original („Die LINKE“ statt „Wir Freie Demokraten“).
    e.programme[2].massnahmen.unshift({ beschreibung: 'Kitaplätze', ursachen_ids: [1701], zitat: 'Wir fördern Kitaplätze.', seite: 12 })
    const a = ordneKennungen(e, fest, fest.length)
    expect(a.kennungen.find((x) => x.kennung === fdp.kennung)).toMatchObject({ partei_id: 1, land: null, programm: 0, massnahme: 0 })
    expect(a.neu).toHaveLength(1)
    expect(a.neu[0]).toMatchObject({ partei_id: 2, land: 'ST' })
    // Das neutralisierte Zitat steht nicht in kennungen.json – dort nur Anfang und Prüfsumme des Originals.
    expect(fdp.zitat).toBe('wir freie demokraten fördern kitaplätze.')
  })
})

describe('Hinweise zur Bewertung', () => {
  it('warnt vor fast nur „offen“, fehlenden Quellen und zu vielen Instrumenten', () => {
    const ins = (n: number, evidenz: 'offen' | 'gemischt', url?: string) =>
      ({ kennung: `I${n}`, name: `I${n}`, wirksamkeit: 1, umsetzbarkeit: 1, begruendung: 'x', evidenz, ...(url ? { beleg_studie_url: url } : {}) }) as Bewertung['neue_instrumente'][number]
    const b: Bewertung = {
      neue_instrumente: [ins(1, 'offen'), ins(2, 'offen'), ins(3, 'offen'), ins(4, 'gemischt'), ins(5, 'offen')],
      zuordnung: Array.from({ length: 8 }, (_, i) => ({ kennung: `M${i + 1}`, instrument: `I${(i % 5) + 1}` })),
    }
    const h = bewertungsHinweise(b).join('\n')
    expect(h).toMatch(/4 von 5 Bewertungen mit evidenz „offen“/)
    expect(h).toMatch(/1 Bewertungen mit evidenz/)
    expect(bewertungsHinweise({ neue_instrumente: [ins(1, 'gemischt', 'https://x.de')], zuordnung: [{ kennung: 'M1', instrument: 'I1' }] })).toEqual([])
  })
})

describe('Erfassung und Bewertung prüfen (Längen)', () => {
  it('meldet zu lange Beschreibungen, Zitate und Begründungen vor dem Eintragen', () => {
    const e = erfassung()
    e.programme[0].massnahmen[0].beschreibung = 'x'.repeat(201)
    e.programme[0].massnahmen[1].zitat = 'x'.repeat(801)
    expect(pruefeErfassung(katalog(), e).join('\n')).toMatch(/länger als 200 Zeichen[^]*länger als 800 Zeichen/)
    const f = erfassung()
    const b = bewertung(f)
    b.neue_instrumente[0].begruendung = 'x'.repeat(301)
    b.neue_instrumente[0].name = 'x'.repeat(121)
    expect(pruefeBewertung(katalog(), f, b).join('\n')).toMatch(/name ist länger als 120[^]*begruendung ist länger als 300/)
  })
})

describe('Erfassung und Bewertung prüfen', () => {
  it('nimmt eine vollständige Erfassung an', () => {
    const e = erfassung()
    expect(pruefeErfassung(katalog(), e)).toEqual([])
    expect(pruefeBewertung(katalog(), e, bewertung(e))).toEqual([])
  })

  it('meldet Landesmaßnahmen zu Bundesursachen, fehlende Zitate und leere Programme', () => {
    const e = erfassung()
    e.programme[2].massnahmen[0].ursachen_ids = [1702]
    e.programme[0].massnahmen[1].zitat = ''
    e.programme[1].keine_massnahme = undefined
    const fehler = pruefeErfassung(katalog(), e).join('\n')
    expect(fehler).toMatch(/ebene „land“/)
    expect(fehler).toMatch(/zitat fehlt/)
    expect(fehler).toMatch(/weder Maßnahmen noch keine_massnahme/)
  })

  it('meldet fehlende Kennungen, Instrumente über zwei Ebenen und Wirksamkeit 3 ohne Beleg', () => {
    const e = erfassung()
    const b = bewertung(e)
    const land = kennungen(e).find((x) => x.programm === 2)!.kennung
    b.zuordnung = b.zuordnung.map((z) => (z.kennung === land ? { kennung: land, instrument: 'I1' } : z))
    b.neue_instrumente[0].wirksamkeit = 3
    b.neue_instrumente[0].evidenz = 'offen'
    b.zuordnung.pop()
    const fehler = pruefeBewertung(katalog(), e, b).join('\n')
    expect(fehler).toMatch(/Wirksamkeit 3 nur mit evidenz/)
    expect(fehler).toMatch(/Wirksamkeit 3 nur mit beleg_studie_url/)
    expect(fehler).toMatch(/nicht bewertet/)
  })

  it('lehnt eine Bewertung ab, wenn sich die Blindliste danach geändert hat', () => {
    const e = erfassung()
    const b = bewertung(e)
    const fest = kennungen(e)
    // Beschreibung nach dem Bewerten umgeschrieben (Zitat gleich): Die Kennungen bleiben, die Prüfsumme nicht.
    e.programme[0].massnahmen[0].beschreibung = 'Kitaplätze großzügig fördern und Gebühren abschaffen'
    expect(pruefeKennungen(e, fest)).toEqual([])
    expect(pruefeBewertung(katalog(), e, b, fest).join('\n')).toMatch(/blind_pruefsumme passt nicht/)
    expect(pruefeBewertung(katalog(), e, { ...b, blind_pruefsumme: undefined }, fest).join('\n')).toMatch(/blind_pruefsumme fehlt/)
  })
})

describe('Suchbegriffe je Lösungsrichtung', () => {
  it('verlangt je Ursache Richtungen mit Begriffen und eine passende Treffermatrix', () => {
    const k = katalog()
    const alt = { ...erfassung(), suchbegriffe: ['kita'] } as unknown as Erfassung
    expect(pruefeErfassung(k, alt).join()).toMatch(/je Richtung aus der Perspektivenprüfung eigene Begriffe/)
    const leer = erfassung()
    leer.suchbegriffe['1702'] = { 'Fachkräfte gewinnen': ['erzieher'], Quereinstieg: [] }
    delete (leer.suchbegriffe as Record<string, unknown>)['1701']
    const f = pruefeErfassung(k, leer).join('\n')
    expect(f).toMatch(/Ursache 1701 ohne Lösungsrichtung/)
    expect(f).toMatch(/Richtung „Quereinstieg“ ohne Begriffe/)
    const ergaenzt = erfassung()
    ergaenzt.suchbegriffe['1701']['Plätze ausbauen'].push('krippe')
    expect(pruefeErfassung(k, ergaenzt).join()).toMatch(/treffer passen nicht zu den Suchbegriffen/)
    expect(pruefeErfassung(k, { ...erfassung(), treffer: undefined }).join()).toMatch(/npm run entwurf:treffer/)
  })

  it('weist auf viele Treffer ohne Maßnahme hin', () => {
    const h = erfassungsHinweise(katalog(), erfassung())
    expect(h).toHaveLength(1)
    expect(h[0]).toMatch(/Zwei \(Bund\): 12 Treffer zu Ursache 1701/)
  })
})

describe('Zuordnung zu Ursachen blind entschieden', () => {
  it('verlangt „ursachen“ je Kennung, nimmt Verworfenes ohne Bewertung an und weist auf abweichende Mehrfachzuordnung hin', () => {
    const e = erfassung()
    const b = bewertung(e)
    const k = katalog()
    b.zuordnung[0] = { kennung: b.zuordnung[0].kennung, ursachen: [] }
    const { ursachen: _u, ...ohne } = b.zuordnung[1] as Exclude<Bewertung['zuordnung'][number], { ursachen: [] }>
    b.zuordnung[1] = ohne
    const f = pruefeBewertung(k, e, b).join('\n')
    expect(f).toMatch(/„ursachen“ fehlt/)
    // Verworfen (keine Ursache bestätigt) braucht keine Bewertung – I1 hängt dann an keiner Maßnahme mehr.
    expect(f).not.toMatch(/nicht bewertet|nicht bestätigt/)
    expect(f).toMatch(/Instrument I1: keine Maßnahme verweist darauf/)
    // Ursachen bestätigt, aber weder Instrument noch Einzelbewertung.
    const c0 = bewertung(e)
    c0.zuordnung[1] = { kennung: c0.zuordnung[1].kennung, ursachen: [1702] } as unknown as Bewertung['zuordnung'][number]
    expect(pruefeBewertung(k, e, c0).join()).toMatch(/weder instrument noch einzeln/)
    const c = bewertung(e)
    c.zuordnung[2] = { ...c.zuordnung[2], ursachen: [1701, 1702] } as Zuordnung
    expect(zuordnungsHinweise(k, e, c).join()).toMatch(/zusätzlich Ursache 1702/)
    // Gleiches Instrument, unterschiedliche Ursachen.
    e.programme[0].massnahmen[1].ursachen_ids = [1701, 1702]
    const d = bewertung(e)
    const zweite = kennungen(e).find((x) => x.programm === 0 && x.massnahme === 1)!.kennung
    d.zuordnung = d.zuordnung.map((z) => (z.kennung === zweite ? { kennung: zweite, instrument: 'I1', ursachen: [1701, 1702] } : z))
    expect(zuordnungsHinweise(k, e, d).join()).toMatch(/Instrument I1: Maßnahmen mit unterschiedlichen Ursachen/)
  })
})

describe('Protokoll', () => {
  const vollstaendig = (_e: Erfassung, auftrag: string) =>
    new Map([
      [PROTOKOLL.erfassung('Eins', null), 'Rohantwort …'],
      [PROTOKOLL.erfassung('Zwei', null), 'Rohantwort …'],
      [PROTOKOLL.erfassung('Zwei', 'ST'), 'Rohantwort …'],
      [PROTOKOLL.auftrag, auftrag],
      [PROTOKOLL.antwort, '{ … }'],
      [PROTOKOLL.rueckfragen, 'keine'],
    ])

  it('verlangt Rohantworten, Auftrag mit Prüfsumme ohne Parteinamen, Antwort und Rückfragen', () => {
    const e = erfassung()
    const liste = blindListe(katalog(), e)
    const auftrag = `Bewerte diese Liste.\n${JSON.stringify(liste)}`
    expect(pruefeProtokoll(katalog(), e, vollstaendig(e, auftrag), liste.pruefsumme)).toEqual([])
    const fehlt = vollstaendig(e, auftrag)
    fehlt.delete(PROTOKOLL.erfassung('Zwei', 'ST'))
    fehlt.delete(PROTOKOLL.rueckfragen)
    const fehler = pruefeProtokoll(katalog(), e, fehlt, liste.pruefsumme).join('\n')
    expect(fehler).toMatch(/erfassung-Zwei-ST\.txt fehlt/)
    expect(fehler).toMatch(/rueckfragen\.md fehlt/)
    expect(pruefeProtokoll(katalog(), e, vollstaendig(e, `${auftrag}\nM03 stammt von der SPD.`), liste.pruefsumme).join()).toMatch(/Parteinamen/)
    expect(pruefeProtokoll(katalog(), e, vollstaendig(e, 'Bewerte die Liste.'), liste.pruefsumme).join()).toMatch(/Prüfsumme/)
  })
})

describe('Eintragen', () => {
  it('schreibt Instrumente und Abdeckung als ungeprüften KI-Entwurf mit neuen IDs – der Katalog bleibt gültig', () => {
    const e = erfassung()
    const k = katalog()
    const neu = eintragen(k, themaInhalt(), e, bewertung(e), '2026-10-01')
    const r = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/17-kita.json', inhalt: neu }], { pfad: 'ids.json', inhalt: { stillgelegt: [] } })
    expect(r.fehler).toEqual([])
    expect(r.katalog.instrumente.map((i) => i.id)).toEqual([1])
    expect(r.katalog.massnahmen.map((m) => [m.id, m.partei_id, m.land ?? null, m.beleg_programm_url])).toEqual([
      [2, 1, null, 'https://eins.de/p.pdf#page=12'],
      [3, 1, null, 'https://eins.de/p.pdf#page=13'],
      [4, 2, 'ST', 'https://zwei-st.de/p.pdf#page=5'],
    ])
    expect(r.katalog.massnahmen.every((m) => !m.geprueft)).toBe(true)
    expect(r.katalog.abdeckung.every((a) => a.ki_entwurf && !a.geprueft)).toBe(true)
    expect(r.katalog.massnahmen[0].instrument_id).toBe(1)
    // Herkunft der Werte und durchsuchte Ursachen stehen dabei (Land: nur Landesursachen).
    expect(r.katalog.instrumente[0].entwurf_herkunft).toBe('blind')
    expect(r.katalog.massnahmen.find((m) => m.instrument_id === undefined)?.entwurf_herkunft).toBe('blind')
    expect(r.katalog.abdeckung.map((a) => [a.partei_id, a.land ?? null, a.durchsucht_fuer])).toEqual([
      [1, null, [1701, 1702]],
      [2, null, [1701, 1702]],
      [2, 'ST', [1701]],
    ])
    const keine = r.katalog.abdeckung.find((a) => a.partei_id === 2 && !a.land)
    expect(keine).toMatchObject({ art: 'keine', ki_entwurf: true, geprueft: false })
    expect(pruefeErfassung(r.katalog, e).join('\n')).toMatch(/schon einen Eintrag/)
  })
})

describe('Nachtrag eines Lösungswegs', () => {
  const leitfaden: Leitfaden = { thema_id: 17, stand: '2026-10-05', regeln: [], suchbegriffe: { ...SUCHBEGRIFFE, '1701': { 'Plätze ausbauen': ['kita'], Betriebskitas: ['betriebskita'] } } }
  const nachtrag = { forderung: 'Betriebskitas fördern', richtungen: { '1701': ['Betriebskitas'] } }

  it('sucht nur nach den Richtungen des Lösungswegs', () => {
    const e = mitLeitfaden({ thema_id: 17, suchbegriffe: {}, nachtrag, programme: [] }, leitfaden)
    expect(e.suchbegriffe).toEqual({ '1701': { Betriebskitas: ['betriebskita'] } })
    const k = katalog()
    expect(pruefeNachtrag(k, e, leitfaden)).toEqual([])
    expect(pruefeNachtrag(k, { ...e, nachtrag: { forderung: 'x', richtungen: { '1701': ['Unbekannt'] } } }, leitfaden).join()).toMatch(/keine Suchbegriffe/)
  })

  it('ergänzt vorhandene Einträge, ohne etwas zu ersetzen oder doppelt aufzunehmen', () => {
    const vorher = eintragen(katalog(), themaInhalt(), erfassung(), bewertung(erfassung()), '2026-10-01')
    const k = katalog(vorher)
    const e: Erfassung = {
      thema_id: 17, suchbegriffe: { '1701': { Betriebskitas: ['betriebskita'] } }, nachtrag,
      programme: [
        { partei_id: 1, land: null, massnahmen: [
          { beschreibung: 'Betriebskitas fördern', ursachen_ids: [1701], zitat: 'Wir fördern Betriebskitas.', seite: 30 },
          { beschreibung: 'Schon erfasst', ursachen_ids: [1701], zitat: 'Wir Freie Demokraten fördern Kitaplätze.', seite: 12 },
        ] },
        { partei_id: 2, land: null, massnahmen: [{ beschreibung: 'Betriebskitas steuerlich fördern', ursachen_ids: [1701], zitat: 'Betriebskitas sollen steuerlich gefördert werden.', seite: 40 }] },
        { partei_id: 2, land: 'ST', massnahmen: [], keine_massnahme: 'Nichts zu Betriebskitas.' },
      ],
    }
    expect(pruefeErfassung(k, e).filter((f) => !f.startsWith('treffer'))).toEqual([])
    const kn = kennungen(e)
    const nach = (p: number, m: number) => kn.find((x) => x.programm === p && x.massnahme === m)!.kennung
    const b: Bewertung = {
      neue_instrumente: [{ kennung: 'I1', name: 'Betriebskitas fördern', wirksamkeit: 1, umsetzbarkeit: 2, begruendung: 'Wenige Plätze.', evidenz: 'gemischt' }],
      zuordnung: [
        { kennung: nach(0, 0), instrument: 'I1', ursachen: [1701] },
        { kennung: nach(0, 1), instrument: 1, ursachen: [1701] },
        { kennung: nach(1, 0), instrument: 'I1', ursachen: [1701] },
      ],
    }
    const neu = eintragen(k, vorher, e, b, '2026-10-05') as { abdeckung: Record<string, unknown>[] }
    const r = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/17-kita.json', inhalt: neu }], { pfad: 'ids.json', inhalt: { stillgelegt: [] } })
    expect(r.fehler).toEqual([])
    expect(neu.abdeckung).toHaveLength(3)
    // Partei 1: eine neue Maßnahme dazu (das schon erfasste Zitat nicht doppelt), Kopf bleibt.
    expect(r.katalog.massnahmen.filter((m) => m.partei_id === 1).map((m) => m.zitat)).toEqual([
      'Wir Freie Demokraten fördern Kitaplätze.', 'Die Ausbildung wird vergütet.', 'Wir fördern Betriebskitas.',
    ])
    // Partei 2 Bund: „keine Maßnahme“ wird zur Maßnahme; durchsucht_fuer bleibt.
    expect(r.katalog.abdeckung.find((a) => a.partei_id === 2 && !a.land)).toMatchObject({ art: 'massnahmen', durchsucht_fuer: [1701, 1702] })
    // Land ohne Fund: unverändert.
    expect(neu.abdeckung[2]).toEqual((vorher as { abdeckung: unknown[] }).abdeckung[2])
    expect(vergleicheStand(k, r.katalog)).toEqual([])
  })
})

describe('Vergleich mit dem Zielzweig', () => {
  const mitAbdeckung = (extra: Record<string, unknown> = {}, ursachen = themaInhalt().ursachen) => {
    const e = erfassung()
    return katalog({ ...eintragen(katalog(), themaInhalt(ursachen), e, bewertung(e), '2026-10-01'), ...extra })
  }

  it('verlangt „durchsucht_fuer“, wenn eine Ursache zu einem Thema mit Abdeckung dazukommt', () => {
    const alt = mitAbdeckung()
    const datei = eintragen(katalog(), themaInhalt(), erfassung(), bewertung(erfassung()), '2026-10-01') as { abdeckung: Record<string, unknown>[] }
    const ursachen = [...themaInhalt().ursachen, { id: 1703, beschreibung: 'Neu', quelle_url: 'https://destatis.de/c', ebene: 'bund' }]
    // Mit Angabe (aus eintragen): in Ordnung – 1703 fehlt dort, gilt also als „noch nicht erfasst“.
    expect(vergleicheStand(alt, katalog({ ...datei, ursachen }))).toEqual([])
    // Ohne Angabe (ältere Einträge): Fehler je Eintrag, für den die Bundesursache zählt.
    const ohne = { ...datei, ursachen, abdeckung: datei.abdeckung.map(({ durchsucht_fuer: _durchsucht, ...a }) => a) }
    const fehler = vergleicheStand(alt, katalog(ohne))
    expect(fehler.filter((f) => /Ursache 1703 ist neu/.test(f))).toHaveLength(2)
    // Dazu die Phasentrennung: neue Ursache ohne „nachtraeglich“ und geänderte Abdeckung im selben Pull Request.
    expect(fehler.join()).toMatch(/Ursache 1703 und Maßnahmen/)
  })

  it('lehnt still geänderte Werte einer Blindbewertung ab', () => {
    const alt = mitAbdeckung()
    const datei = eintragen(katalog(), themaInhalt(), erfassung(), bewertung(erfassung()), '2026-10-01') as { instrumente: Record<string, unknown>[] }
    const geaendert = { ...datei, instrumente: [{ ...datei.instrumente[0], wirksamkeit: 1 }] }
    expect(vergleicheStand(alt, katalog(geaendert)).join()).toMatch(/Werte der Blindbewertung geändert/)
    const offen = { ...datei, instrumente: [{ ...datei.instrumente[0], wirksamkeit: 1, entwurf_herkunft: 'nicht_blind' }] }
    expect(vergleicheStand(alt, katalog(offen))).toEqual([])
  })
})

describe('Abdeckung je Ursache im Katalog', () => {
  it('prüft „durchsucht_fuer“ gegen Thema, Ebene und Maßnahmen', () => {
    const datei = eintragen(katalog(), themaInhalt(), erfassung(), bewertung(erfassung()), '2026-10-01') as { abdeckung: Record<string, unknown>[] }
    const mit = (i: number, d: unknown) => ({ ...datei, abdeckung: datei.abdeckung.map((a, j) => (j === i ? { ...a, durchsucht_fuer: d } : a)) })
    const fehler = (inhalt: unknown) =>
      pruefeKatalog(PARTEIEN, [{ pfad: 'themen/17-kita.json', inhalt }], { pfad: 'ids.json', inhalt: { stillgelegt: [] } }).fehler.join('\n')
    expect(fehler(mit(2, [1702]))).toMatch(/1702 liegt beim Bund/)
    expect(fehler(mit(1, [1799]))).toMatch(/1799 gehört nicht zum Thema/)
    expect(fehler(mit(0, [1702]))).toMatch(/1701 fehlt in „durchsucht_fuer“/)
  })
})

describe('Seiten ohne Text', () => {
  it('nennt Seiten mit kaum Text', () => {
    expect(seitenOhneText(['x'.repeat(500), '  \n ', 'kurz', 'y'.repeat(300)])).toEqual([2, 3])
  })
})

describe('Phasen getrennt', () => {
  const datei = () => eintragen(katalog(), themaInhalt(), erfassung(), bewertung(erfassung()), '2026-10-01') as { abdeckung: Record<string, unknown>[]; ursachen: Record<string, unknown>[] }

  it('lehnt Ursachen oder Ziel und Maßnahmen desselben Themas im selben Pull Request ab', () => {
    const vorher = katalog()
    // Neues Thema mit Ursachen und Abdeckung zugleich.
    expect(vergleicheStand({ ...vorher, themen: [], ursachen: [] }, katalog(datei())).join()).toMatch(/Thema 17: neues Thema und Maßnahmen/)
    // Ursache umformuliert und Maßnahmen erfasst.
    const d = datei()
    d.ursachen[0] = { ...d.ursachen[0], beschreibung: 'Zu wenige Plätze im Westen' }
    expect(vergleicheStand(vorher, katalog(d)).join()).toMatch(/Thema 17: Ursache 1701 und Maßnahmen/)
    // Ziel geändert und Maßnahmen erfasst.
    expect(vergleicheStand(vorher, katalog({ ...datei(), ziel: 'Anderes Ziel.' })).join()).toMatch(/Thema 17: Ziel und Maßnahmen/)
    // Nur Maßnahmen: in Ordnung.
    expect(vergleicheStand(vorher, katalog(datei()))).toEqual([])
  })

  it('erlaubt eine nachträgliche Ursache mit „durchsucht_fuer“ an jedem Eintrag', () => {
    const vorher = katalog(datei())
    const neu = datei()
    neu.ursachen.push({ id: 1703, beschreibung: 'Neu', quelle_url: 'https://destatis.de/c', ebene: 'land', nachtraeglich: '2026-10-02: Fachquelle, Grund …' })
    neu.abdeckung[2] = { ...neu.abdeckung[2], durchsucht_fuer: [1701, 1703] }
    expect(vergleicheStand(vorher, katalog(neu))).toEqual([])
    neu.ursachen[2] = { ...neu.ursachen[2], nachtraeglich: undefined }
    expect(vergleicheStand(vorher, katalog(JSON.parse(JSON.stringify(neu)))).join()).toMatch(/Ursache 1703 und Maßnahmen/)
  })

  it('erlaubt mit KI-Freigabe beide Phasen, wenn Phase A vorher in einem eigenen Commit feststand', () => {
    const ki = { ...themaInhalt(), freigabe: { datum: '2026-10-05', art: 'ki' } }
    const mitMassnahmen = { ...datei(), freigabe: { datum: '2026-10-05', art: 'ki' } }
    const leer = { ...katalog(), themen: [], ursachen: [] }
    // Verlauf: Zielzweig ohne Thema → Commit 1 Phase A mit KI-Freigabe → Commit 2 Maßnahmen.
    const verlauf = (staende: (Record<string, unknown> | undefined)[]) => ({ thema: () => staende, haltung: () => undefined })
    expect(vergleicheStand(leer, katalog(mitMassnahmen), verlauf([undefined, ki, mitMassnahmen]))).toEqual([])
    // Ohne eigenen Commit für Phase A, ohne Verlauf oder mit Freigabe durch die Betreiberin: abgelehnt.
    expect(vergleicheStand(leer, katalog(mitMassnahmen), verlauf([undefined, mitMassnahmen])).join()).toMatch(/neues Thema und Maßnahmen/)
    expect(vergleicheStand(leer, katalog(mitMassnahmen)).join()).toMatch(/neues Thema und Maßnahmen/)
    expect(phaseAZuerst([undefined, themaInhalt(), datei()])).toBe(false)
    // Ursache nach Beginn der Erfassung geändert: abgelehnt.
    const umformuliert = { ...ki, ursachen: [{ ...themaInhalt().ursachen[0], beschreibung: 'Anders' }, themaInhalt().ursachen[1]] }
    expect(phaseAZuerst([undefined, umformuliert, mitMassnahmen])).toBe(false)
    expect(phaseAZuerst([undefined, ki, { ...mitMassnahmen, ursachen: umformuliert.ursachen }, mitMassnahmen])).toBe(false)
  })

  it('erlaubt „geprueft“ nicht mit KI-Freigabe', () => {
    const d = datei() as { abdeckung: { massnahmen?: Record<string, unknown>[] }[] }
    d.abdeckung[0].massnahmen![0] = { ...d.abdeckung[0].massnahmen![0], geprueft: true, pruefung: { belege_geprueft: '2026-10-05' } }
    const r = pruefeKatalog(PARTEIEN, [{ pfad: 't.json', inhalt: { ...d, freigabe: { datum: '2026-10-05', art: 'ki' } } }])
    expect(r.fehler.join()).toMatch(/„geprueft“ erst nach der Freigabe der Ursachen durch die Betreiberin/)
    expect(pruefeKatalog(PARTEIEN, [{ pfad: 't.json', inhalt: { ...themaInhalt(), freigabe: { datum: '2026-10-05', art: 'mensch' } } }]).fehler.join()).toMatch(/„art“ kann nur „ki“ sein/)
  })

  it('meldet Parteinamen in neuen Ursachen und Zielen', () => {
    const vorher = katalog()
    const mitName = themaInhalt([...themaInhalt().ursachen.slice(0, 1), { id: 1702, beschreibung: 'Die Politik der Grünen', quelle_url: 'https://destatis.de/b', ebene: 'bund' }])
    expect(vergleicheStand(vorher, katalog(mitName)).join()).toMatch(/Ursache 1702 nennt eine Partei/)
    expect(vergleicheStand(vorher, katalog({ ...themaInhalt(), ziel: 'Wie die SPD es will.' })).join()).toMatch(/Ziel von Thema 17 nennt eine Partei/)
  })
})

const LEITFADEN: Leitfaden = {
  thema_id: 17,
  stand: '2026-10-02',
  regeln: [
    { nr: 1, ursachen: [1702], text: 'Ausbildungsvergütung gehört zu 1702.' },
    { nr: 2, text: 'Finanzierung ohne Zweck ist keine Maßnahme.' },
  ],
  buendel: { '1702': ['Vergütung', 'Ausbildung'] },
}

describe('Offene Zuordnung', () => {
  it('erlaubt Grenzfälle in ursachen_offen, zeigt sie der Bewertung und trägt nur Bestätigtes ein', () => {
    const k = katalog()
    const e = erfassung()
    // Maßnahme 1 von Partei Eins: sicher 1701, offen 1702; Maßnahme 2: nur offen.
    e.programme[0].massnahmen[0].ursachen_offen = [1702]
    e.programme[0].massnahmen[1].ursachen_ids = []
    e.programme[0].massnahmen[1].ursachen_offen = [1702]
    expect(pruefeErfassung(k, e)).toEqual([])
    const liste = blindListe(k, e)
    expect(liste.massnahmen.filter((m) => m.ursachen_offen).map((m) => m.ursachen_offen)).toEqual([[1702], [1702]])
    const b = bewertung(e)
    const nach = (p: number, m: number) => kennungen(e).find((x) => x.programm === p && x.massnahme === m)!.kennung
    // Bewertung: bei der ersten nur 1701 (offene 1702 abgelehnt), die zweite verworfen.
    b.zuordnung = b.zuordnung.map((z): Zuordnung =>
      z.kennung === nach(0, 0) ? ({ ...z, ursachen: [1701] } as Zuordnung) : z.kennung === nach(0, 1) ? { kennung: z.kennung, ursachen: [] as [] } : z,
    )
    b.blind_pruefsumme = liste.pruefsumme
    expect(pruefeBewertung(k, e, b)).toEqual([])
    const bilanz = zuordnungsBilanz(k, e, b).join('\n')
    expect(bilanz).toMatch(/Eins \(Bund\): 2 Maßnahmen, 3 Zuordnungen \(davon 2 offen\); nicht bestätigt 2 .*verworfen 1/)
    const neu = eintragen(k, themaInhalt(), e, b, '2026-10-01')
    const r = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/17-kita.json', inhalt: neu }], { pfad: 'ids.json', inhalt: { stillgelegt: [] } })
    expect(r.fehler).toEqual([])
    expect(r.katalog.massnahmen.filter((m) => m.partei_id === 1).map((m) => m.ursachen_ids)).toEqual([[1701]])
  })

  it('macht aus einem ganz verworfenen Programm „keine Maßnahme“ und lässt unbenutzte Instrumente weg', () => {
    const k = katalog()
    const e = erfassung()
    const b = bewertung(e)
    const nach = (p: number, m: number) => kennungen(e).find((x) => x.programm === p && x.massnahme === m)!.kennung
    b.zuordnung = b.zuordnung.map((z) => (z.kennung === nach(0, 0) || z.kennung === nach(0, 1) ? { kennung: z.kennung, ursachen: [] as [] } : z))
    const neu = eintragen(k, themaInhalt(), e, b, '2026-10-01')
    const r = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/17-kita.json', inhalt: neu }], { pfad: 'ids.json', inhalt: { stillgelegt: [] } })
    expect(r.fehler).toEqual([])
    expect(r.katalog.instrumente).toEqual([])
    const eins = r.katalog.abdeckung.find((a) => a.partei_id === 1)!
    expect(eins).toMatchObject({ art: 'keine', ki_entwurf: true, geprueft: false })
    expect(eins.begruendung).toMatch(/S\. 12, 13.*keiner der Ursachen/)
  })
})

describe('Leitfaden und Bündel', () => {
  it('prüft Regeln und Bündel und gibt die Regeln ohne Parteinamen an die Bewertung', () => {
    const k = katalog()
    expect(pruefeLeitfaden(k, LEITFADEN)).toEqual([])
    const kaputt: Leitfaden = { ...LEITFADEN, regeln: [...LEITFADEN.regeln, { nr: 2, ursachen: [9999], text: 'Wie die SPD es will.' }], buendel: { '1702': ['A', 'A'], '9999': ['B'] } }
    const f = pruefeLeitfaden(k, kaputt).join('\n')
    expect(f).toMatch(/Regel 2 – Nummer fehlt oder doppelt/)
    expect(f).toMatch(/nennt eine Partei/)
    expect(f).toMatch(/Ursache 9999, die nicht zum Thema gehört/)
    expect(f).toMatch(/Bündel „A“ zu Ursache 1702 doppelt/)
    const e = { ...erfassung(), leitfaden: { ...LEITFADEN, regeln: [{ nr: 1, text: 'Die Ausbildung zählt (wie bei Partei Eins).' }] } }
    expect(blindListe(k, e).regeln).toEqual([{ nr: 1, text: 'Die Ausbildung zählt (wie bei [Partei]).' }])
  })

  it('verlangt bekannte Bündel, höchstens eine Maßnahme je Bündel und weist auf ungebündelte Einzelzusagen hin', () => {
    const k = katalog()
    const e = { ...erfassung(), leitfaden: LEITFADEN }
    const p = e.programme[0]
    p.massnahmen[1].buendel = 'Vergütung'
    expect(pruefeProgramm(k, e, p)).toEqual([])
    p.massnahmen.push({ ...p.massnahmen[1], zitat: 'Die Ausbildung wird besser vergütet.', buendel: 'Vergütung' })
    p.massnahmen.push({ ...p.massnahmen[1], zitat: 'Wir zahlen mehr.', buendel: 'Gehälter' })
    const f = pruefeProgramm(k, e, p).join('\n')
    expect(f).toMatch(/Bündel „Vergütung“ schon bei Maßnahme 2/)
    expect(f).toMatch(/Bündel „Gehälter“ steht im Leitfaden nicht.*„Neue Bündel“/)
    // Ungebündelt viele Maßnahmen an einer Ursache mit Bündelliste.
    const viele = { ...erfassung(), leitfaden: LEITFADEN }
    viele.programme[0].massnahmen = Array.from({ length: BUENDEL_OHNE + 1 }, (_, i) => ({ beschreibung: `Zusage ${i}`, ursachen_ids: [1702], zitat: `Zusage ${i}.`, seite: 13 }))
    expect(erfassungsHinweise(k, viele).join()).toMatch(/Eins \(Bund\): 4 Maßnahmen zu Ursache 1702 ohne Bündel/)
  })

  it('meldet nicht durchsuchte Programme, offene und sichere Ursache doppelt und Zitate, die klein beginnen', () => {
    const k = katalog()
    const e = erfassung()
    expect(pruefeProgramm(k, e, { partei_id: 1, land: null, massnahmen: [], nicht_durchsucht: 'HTTP 503' }).join()).toMatch(/noch nicht erfasst/)
    e.programme[0].massnahmen[0].ursachen_offen = [1701]
    expect(pruefeProgramm(k, e, e.programme[0]).join()).toMatch(/Ursache doppelt/)
    expect(zitatHinweise({ beschreibung: 'x', ursachen_ids: [1701], zitat: '[…] mehr Kitaplätze schaffen.', seite: 1 })).toHaveLength(1)
    expect(zitatHinweise({ beschreibung: 'x', ursachen_ids: [1701], zitat: 'Wir schaffen mehr Kitaplätze.', seite: 1 })).toEqual([])
  })
})

describe('Erfassungsauftrag', () => {
  const seiten = ['Inhalt: Familie 2', 'Wir bauen 1.000 neue Kitas und Kitaplätze aus. Erzieher werden besser bezahlt.', 'Kein Treffer hier.']

  it('enthält zulässige Ursachen, Leitfaden, Trefferzahlen, Pflichtursachen und Fundstellen mit PDF-Seite', () => {
    const k = katalog()
    const e = { ...erfassung(), leitfaden: LEITFADEN }
    const text = auftragText(k, e, { partei_id: 1, kurzname: 'Eins', land: null, url: 'https://eins.de/p.pdf', stand: '2025-01-01' }, seiten, { textPfad: 't.txt', ergebnisPfad: 'protokoll/erfassung-Eins-Bund.txt' })
    expect(text).toMatch(/\*\*1701\*\* \(Land\)/)
    expect(text).toMatch(/\*\*R1\*\* \[1702\]/)
    expect(text).toMatch(/„Vergütung“ · „Ausbildung“/)
    expect(text).toMatch(/Plätze ausbauen \(2\): kita 2/)
    expect(text).toMatch(/Quereinstieg \(0\): – · ohne Treffer: quereinst/)
    expect(text).toMatch(/- S\. 2 \[1701 Plätze ausbauen 2; 1702 Fachkräfte gewinnen 1\]: .*«Kita»/)
    expect(text).not.toMatch(/S\. 3 \[/)
    expect(text).not.toMatch(/Pflicht:/)
    const viel = auftragText(k, e, { partei_id: 1, kurzname: 'Eins', land: null, url: 'u', stand: null }, Array(12).fill('kita'), { textPfad: 't', ergebnisPfad: 'e', maxSeiten: 3 })
    expect(viel).toMatch(/\*\*Pflicht:\*\* Zu Ursache 1701/)
    expect(viel).toMatch(/Weitere Seiten mit Treffern \(ohne Auszug\): 4 \[1701 Plätze ausbauen\]/)
  })

  it('nennt einem Landesprogramm nur Landesursachen und ihre Regeln', () => {
    const text = auftragText(katalog(), { ...erfassung(), leitfaden: LEITFADEN }, { partei_id: 2, kurzname: 'Zwei', land: 'ST', url: 'u', stand: '2026-03-01' }, seiten, { textPfad: 't', ergebnisPfad: 'e' })
    expect(text).toMatch(/\*\*1701\*\*/)
    expect(text).not.toMatch(/\*\*1702\*\*|\*\*R1\*\*|Bündel/)
    expect(text).toMatch(/\*\*R2\*\*/)
  })
})

describe('JSON aus einer Agentenantwort', () => {
  it('holt das erste vollständige Objekt, auch mit Klammern in Texten', () => {
    expect(erstesJsonObjekt('Antwort:\n{ "a": "x { y }", "b": [1] }\nProtokoll …')).toEqual({ objekt: { a: 'x { y }', b: [1] }, rest: 'Protokoll …' })
    expect(() => erstesJsonObjekt('{ "a": 1')).toThrow(/abgeschnitten/)
    // Liste nur auf Wunsch (Funde mehrerer Haltungen); sonst zählt das erste Objekt.
    expect(erstesJsonObjekt('[{ "a": 1 }, { "a": 2 }]\nProtokoll', true)).toEqual({ objekt: [{ a: 1 }, { a: 2 }], rest: 'Protokoll' })
    expect(erstesJsonObjekt('[{ "a": 1 }, { "a": 2 }]').objekt).toEqual({ a: 1 })
  })

  it('nennt bei Fehlern Zeile und Spalte in der Datei', () => {
    expect(() => erstesJsonObjekt('Antwort\n{\n  "a": [1, 2,\n  "b": 2\n}')).toThrow(/„}“ schließt „\[“ aus Zeile 3, Spalte 8.*Zeile 5, Spalte 1/)
    expect(() => erstesJsonObjekt('{"a": 1,\n "b": }')).toThrow(/Zeile 2, Spalte 7/)
    expect(() => erstesJsonObjekt('x\n{"a": [1]\n, "c": tru }')).toThrow(/Zeile 3, Spalte 8/)
    expect(fehlerStelle('{"a": [1, 2]}')).toBe(-1)
    expect(fehlerStelle('{"a" 1}')).toBe(5)
  })
})

describe('Leitfäden im Repository', () => {
  it('passen zum Datenkatalog', () => {
    const { katalog: k } = pruefeDatenordner()
    const ordner = new URL('../daten/leitfaeden/', import.meta.url)
    for (const d of readdirSync(ordner)) {
      const l = JSON.parse(readFileSync(new URL(d, ordner), 'utf8')) as Leitfaden
      expect(d).toBe(`${l.thema_id}.json`)
      expect(pruefeLeitfaden(k, l)).toEqual([])
    }
  })
})

describe('Verluste nach Rückfragen (Vergleich mit dem vorherigen Stand)', () => {
  it('meldet zusammengefasste und entfallene Maßnahmen und Ursachen ohne Maßnahme', () => {
    const k = katalog()
    // Fall Thema 9: zwei verschiedene Zusagen, eine im Bündel, eine ohne – die Rückfrage fasst sie zusammen.
    const vorher = erfassung().programme
    vorher[0].massnahmen = [
      { beschreibung: 'Ausbildung vergüten', ursachen_ids: [1702], buendel: 'Vergütung', zitat: 'Die Ausbildung wird vergütet.', seite: 13 },
      { beschreibung: 'Mehr Kitaplätze fördern', ursachen_ids: [1701], zitat: 'Wir Freie Demokraten fördern Kitaplätze.', seite: 12 },
    ]
    const jetzt = structuredClone(vorher)
    jetzt[0].massnahmen = [{ beschreibung: 'Ausbildung vergüten und Kitaplätze fördern', ursachen_ids: [1702], buendel: 'Vergütung', zitat: 'Die Ausbildung wird vergütet.', seite: 13 }]
    const z = vergleicheErfassung(k, vorher, jetzt).join('\n')
    expect(z).toMatch(/Eins \(Bund\): zusammengefasst\? S\. 12 „Mehr Kitaplätze fördern“ fehlt, S\. 13 „Ausbildung vergüten und Kitaplätze fördern“ \[Vergütung\] ist neu oder geändert/)
    expect(z).toMatch(/Eins \(Bund\): Ursache 1701 hatte 1 Maßnahme\(n\), jetzt keine/)
    // Ohne passende geänderte Maßnahme: schlicht entfallen. Neue Maßnahmen und weggefallene Programme werden genannt.
    const nurWeg = structuredClone(vorher)
    nurWeg[0].massnahmen.splice(1, 1)
    nurWeg.pop()
    nurWeg[0].massnahmen.push({ beschreibung: 'Neu', ursachen_ids: [1702], zitat: 'Neu.', seite: 40 })
    const w = vergleicheErfassung(k, vorher, nurWeg).join('\n')
    expect(w).toMatch(/Eins \(Bund\): entfallen S\. 12/)
    expect(w).toMatch(/Eins \(Bund\): neu S\. 40 „Neu“/)
    expect(w).toMatch(/Zwei \(ST\): ganz entfallen/)
    expect(vergleicheErfassung(k, vorher, structuredClone(vorher))).toEqual([])
  })

  it('listet Maßnahmen ohne Bündel an Ursachen mit Bündeln', () => {
    const k = katalog()
    const e = { ...erfassung(), leitfaden: LEITFADEN }
    expect(ohneBuendel(k, e)).toEqual(['Eins (Bund): S. 13 „Erzieherausbildung vergüten“ ohne Bündel (Ursache 1702 hat Bündel)'])
    e.programme[0].massnahmen[1].buendel = 'Vergütung'
    expect(ohneBuendel(k, e)).toEqual([])
  })
})

describe('Teil-Neubewertung', () => {
  const k = katalog()
  const basis = () => {
    const e = erfassung()
    const fest = kennungen(e)
    const liste = blindListe(k, e, fest)
    return { e, fest, liste, bisher: bewertung(e) }
  }

  it('bewertet nur neue oder geänderte Kennungen und übernimmt die übrigen unverändert', () => {
    const { e, fest, liste, bisher } = basis()
    e.programme[0].massnahmen.push({ beschreibung: 'Erzieher einstellen', ursachen_ids: [1702], zitat: 'Wir stellen Erzieher ein.', seite: 15 })
    const a = ordneKennungen(e, fest, fest.length)
    const jetzt = blindListe(k, e, a.kennungen)
    const { block, fehler } = teilbewertung(liste, jetzt, bisher)
    expect(fehler).toEqual([])
    expect(block!.zu_bewerten).toEqual(['M04'])
    expect(block!.bisher.zuordnung).toHaveLength(3)
    expect(JSON.stringify(block)).not.toMatch(/partei|Freie Demokraten|LINKE/)
    const teil: Bewertung = { blind_pruefsumme: jetzt.pruefsumme, neue_instrumente: [], zuordnung: [{ kennung: 'M04', instrument: 'I1', ursachen: [1702] }] }
    const { bewertung: zusammen, fehler: f2 } = fuehreTeilbewertungZusammen(jetzt, block!, teil)
    expect(f2).toEqual([])
    expect(zusammen!.zuordnung.map((z) => z.kennung)).toEqual(['M01', 'M02', 'M03', 'M04'])
    expect(zusammen!.teilbewertung).toEqual({ vorherige_pruefsumme: liste.pruefsumme, neu_bewertet: ['M04'] })
    // Danach dieselbe strenge Prüfung wie bei einer vollständigen Bewertung.
    expect(pruefeBewertung(k, e, zusammen!, a.kennungen)).toEqual([])
  })

  it('lehnt ab, wenn unveränderte Einträge anders bewertet werden, Kennungen fehlen oder der Maßstab sich geändert hat', () => {
    const { e, fest, liste, bisher } = basis()
    e.programme[0].massnahmen[1].beschreibung = 'Erzieherausbildung vergüten, mit Zuschlag'
    const jetzt = blindListe(k, e, ordneKennungen(e, fest).kennungen)
    const { block } = teilbewertung(liste, jetzt, bisher)
    const geaendert = fest.find((x) => x.programm === 0 && x.massnahme === 1)!.kennung
    expect(block!.zu_bewerten).toEqual([geaendert])
    const unveraendert = bisher.zuordnung.find((z) => z.kennung !== geaendert)!
    const falsch: Bewertung = {
      blind_pruefsumme: jetzt.pruefsumme,
      neue_instrumente: [{ ...bisher.neue_instrumente[0], wirksamkeit: 3 }],
      zuordnung: [{ ...unveraendert, ursachen: [] }],
    }
    const f = fuehreTeilbewertungZusammen(jetzt, block!, falsch).fehler.join('\n')
    expect(f).toMatch(/unverändert, aber anders bewertet/)
    expect(f).toMatch(/Instrument I1: gibt es schon mit anderen Werten/)
    expect(f).toMatch(new RegExp(`${geaendert}: neu oder geändert, aber nicht bewertet`))
    expect(fuehreTeilbewertungZusammen(jetzt, block!, { ...falsch, blind_pruefsumme: liste.pruefsumme }).fehler.join()).toMatch(/aktuellen Blindliste/)
    // Regeln geändert: keine Teil-Neubewertung.
    const mitRegel = blindListe(k, { ...e, leitfaden: LEITFADEN }, ordneKennungen(e, fest).kennungen)
    expect(teilbewertung(liste, mitRegel, bisher).fehler.join()).toMatch(/Teil-Neubewertung nicht zulässig/)
    expect(teilbewertung(liste, jetzt, { ...bisher, blind_pruefsumme: 'x' }).fehler.join()).toMatch(/gehört nicht zur archivierten/)
  })

  it('lässt Instrumente entfallener Maßnahmen weg', () => {
    const { e, fest, liste, bisher } = basis()
    const mitI1 = bisher.zuordnung.find((z) => 'instrument' in z)!.kennung
    const pos = fest.find((x) => x.kennung === mitI1)!
    e.programme[pos.programm].massnahmen.splice(pos.massnahme, 1)
    const jetzt = blindListe(k, e, ordneKennungen(e, fest).kennungen) as BlindListe
    const { block } = teilbewertung(liste, jetzt, bisher)
    expect(block!.zu_bewerten).toEqual([])
    const { bewertung: b } = fuehreTeilbewertungZusammen(jetzt, block!, { blind_pruefsumme: jetzt.pruefsumme, neue_instrumente: [], zuordnung: [] })
    expect(b!.neue_instrumente).toEqual([])
    expect(b!.zuordnung).toHaveLength(2)
  })
})

describe('Suchbegriffe vor dem Start prüfen', () => {
  it('meldet Begriffe mit vielen Treffern oder vielen Fehltreffern mitten in anderen Wörtern', () => {
    const seiten = ['Die Sucht ist schlimm. Wir haben versucht, untersucht und besucht.', 'Suchthilfe hilft. Er sucht.']
    expect([...wortformen(seiten, 'sucht')]).toEqual([['sucht', 2], ['versucht', 1], ['untersucht', 1], ['besucht', 1], ['suchthilfe', 1]])
    const z = (begriff: string, treffer: number[], formen: [string, number][]) => ({ ursache: '911', richtung: 'Suchthilfe', begriff, treffer, formen: new Map(formen) })
    const breit = breiteBegriffe([
      z('sucht', [3, 4, 3], [['versucht', 4], ['sucht', 3], ['untersucht', 3]]),
      z('prävention', [12, 15, 10], [['prävention', 37]]),
      z('islamis', [4, 5, 4], [['islamismus', 7], ['islamistische', 6]]),
      z('fußfessel', [1, 0, 2], [['fußfessel', 3]]),
    ])
    expect(breit).toHaveLength(2)
    expect(breit[0]).toMatch(/„sucht“ \(911 Suchthilfe\): 10 Treffer, 70 % mitten in anderen Wörtern/)
    expect(breit[1]).toMatch(/„prävention“.*Median 12 Treffer je Programm/)
  })
})

describe('Kurzbericht der Erfassung (feste Form)', () => {
  it('gibt Zahlen nur aus den Daten wieder', () => {
    const p = { ...erfassung().programme[0], neue_buendel: [{ ursache: 1702, name: 'Zulagen', seite: 13 }], eigene_synonyme: [{ begriff: 'fachkraft', ursache: 1702, richtung: 'Fachkräfte gewinnen' }] }
    p.massnahmen[0].ursachen_offen = [1702]
    expect(kurzbericht('Eins-Bund', p, 1, 'programme/Eins-Bund.json').split('\n')).toEqual([
      'Eins-Bund: 2 Maßnahmen (1701: 1, 1702: 2; 1 mit offener Zuordnung), 1 Hinweise – gespeichert in programme/Eins-Bund.json',
      'Grenzfälle: Maßnahme 1 (S. 12) offen 1702',
      'Neue Bündel: 1702 „Zulagen“ (S. 13)',
      'Eigene Synonyme: „fachkraft“ → 1702 Fachkräfte gewinnen',
      'Nicht erfasst: keine',
      'Stand im PDF: wie im Auftrag',
    ])
    expect(kurzbericht('Zwei-Bund', erfassung().programme[1], 0, 'x').split('\n')[0]).toBe('Zwei-Bund: keine Maßnahme – gespeichert in x')
    expect(pruefeProgramm(k(), erfassung(), { ...p, eigene_synonyme: [{ begriff: '', ursache: 1, richtung: 'x' }] }).join()).toMatch(/eigene_synonyme/)
  })
  const k = () => katalog()
})

describe('Evaluationen des Skills (.claude/skills/thema-erfassen/evals)', () => {
  const ordner = new URL('../.claude/skills/thema-erfassen/evals/', import.meta.url)
  const evals = readdirSync(ordner).filter((d) => d.endsWith('.json'))

  it('haben mindestens drei Szenarien im Format der Best Practices', () => {
    expect(evals.length).toBeGreaterThanOrEqual(3)
    for (const d of evals) {
      const e = JSON.parse(readFileSync(new URL(d, ordner), 'utf8'))
      expect(e.skills, d).toEqual(['thema-erfassen'])
      expect(typeof e.query, d).toBe('string')
      expect(Array.isArray(e.files), d).toBe(true)
      expect(e.expected_behavior.length, d).toBeGreaterThanOrEqual(3)
    }
  })

  it('(a) Bündel belegt: die Prüfung verlangt kein Zusammenfassen, der Vergleich meldet es', () => {
    const k = katalog()
    const e = { ...erfassung(), leitfaden: LEITFADEN }
    const p = e.programme[0]
    p.massnahmen = [
      { beschreibung: 'Ausbildung vergüten', ursachen_ids: [1702], buendel: 'Vergütung', zitat: 'Die Ausbildung wird vergütet.', seite: 13 },
      { beschreibung: 'Zulage für Leitungen', ursachen_ids: [1702], buendel: 'Vergütung', zitat: 'Kitaleitungen erhalten eine Zulage.', seite: 14 },
    ]
    const f = pruefeProgramm(k, e, p).join()
    expect(f).toMatch(/andere Zusage: ohne „buendel“ erfassen oder unter „neue_buendel“ melden, nie zusammenfassen/)
    // Richtig: zweite Zusage ohne Bündel – zulässig, aber in der Liste „ohne Bündel“ sichtbar.
    const richtig = structuredClone(p)
    delete richtig.massnahmen[1].buendel
    expect(pruefeProgramm(k, e, richtig)).toEqual([])
    expect(ohneBuendel(k, { programme: [richtig], leitfaden: LEITFADEN })).toHaveLength(1)
    // Falsch: zusammengefasst – der Vergleich meldet den Verlust vor entwurf:blind.
    const falsch = structuredClone(richtig)
    falsch.massnahmen = [{ ...falsch.massnahmen[0], beschreibung: 'Ausbildung vergüten und Leitungszulage' }]
    expect(vergleicheErfassung(k, [richtig], [falsch]).join()).toMatch(/zusammengefasst\? S\. 14 „Zulage für Leitungen“ fehlt/)
  })

  it('(b) Maßnahme nach Rückfrage eingefügt: eine neue Kennung, alte Bewertung passt nicht mehr, Teilbewertung möglich', () => {
    const k = katalog()
    const e = erfassung()
    const fest = kennungen(e)
    const alt = bewertung(e)
    e.programme[2].massnahmen.push({ beschreibung: 'Kitaplätze im Land ausbauen', ursachen_ids: [1701], zitat: 'Wir bauen 500 Plätze.', seite: 6 })
    const a = ordneKennungen(e, fest, fest.length)
    expect([a.neu.map((x) => x.kennung), a.entfallen, a.geaendert]).toEqual([['M04'], [], []])
    expect(pruefeBewertung(k, e, alt, a.kennungen).join()).toMatch(/blind_pruefsumme passt nicht|M04: nicht bewertet/)
    const { block } = teilbewertung(blindListe(k, erfassung(), fest), blindListe(k, e, a.kennungen), alt)
    expect(block!.zu_bewerten).toEqual(['M04'])
  })

  it('(c) Programm nicht erreichbar: bleibt „noch nicht erfasst“, lokale Kopie nur mit passender Prüfsumme', async () => {
    const k = katalog()
    expect(pruefeProgramm(k, erfassung(), { partei_id: 2, land: null, massnahmen: [], nicht_durchsucht: 'HTTP 503' }).join()).toMatch(/bleibt „noch nicht erfasst“/)
    // Ohne das Programm in der Erfassung entsteht kein Abdeckungseintrag – also auch kein keine_massnahme.
    const e = erfassung()
    e.programme.splice(1, 1)
    e.treffer!.programme.splice(1, 1)
    const b: Bewertung = {
      blind_pruefsumme: blindListe(k, e).pruefsumme,
      neue_instrumente: [],
      zuordnung: kennungen(e).map((x) => ({ kennung: x.kennung, einzeln: { wirksamkeit: 2, umsetzbarkeit: 2, begruendung: 'Test.', evidenz: 'offen' }, ursachen: e.programme[x.programm].massnahmen[x.massnahme].ursachen_ids })),
    }
    expect(pruefeBewertung(k, e, b)).toEqual([])
    const datei = eintragen(k, themaInhalt(), e, b, '2026-10-03') as { abdeckung: { partei_id: number; land?: string }[] }
    expect(datei.abdeckung.some((a) => a.partei_id === 2 && !a.land)).toBe(false)
    // Lokale Kopie: wird nur über die erwartete Prüfsumme gefunden, ohne Netz.
    const { ladeProgramm, sha256 } = await import('./programme')
    const pdf = new TextEncoder().encode('%PDF-1.4 Testdatei')
    const lokal = new Map([[sha256(pdf), pdf]])
    expect((await ladeProgramm('https://nicht-erreichbar.invalid/p.pdf', sha256(pdf), lokal)).hinweis).toMatch(/lokal geprüft/)
  })

  it('(d) Rest eines Parteinamens im Zitat: gemeldet, Zitat bleibt wörtlich, Herkunft geht nicht an die Bewertung', () => {
    const k = katalog()
    const e = erfassung()
    e.programme[0].massnahmen[0].zitat = 'Mit sozialdemokratischer Politik fördern wir Kitaplätze.'
    const liste = blindListe(k, e)
    const m = liste.massnahmen.find((x) => x.zitat.includes('sozialdemokratischer'))!
    expect(m.zitat).toBe('Mit sozialdemokratischer Politik fördern wir Kitaplätze.')
    expect(blindReste(liste)).toEqual([{ kennung: m.kennung, reste: ['sozialdemokratischer'] }])
    expect(enthaeltParteinamen(`${m.kennung} stammt von der SPD.`)).toBe(true)
  })
})

describe('Selbstprüfung der Bewertung (nur gegen die Blindliste)', () => {
  it('prüft mit demselben Code wie entwurf:bewertung-pruefen', () => {
    const k = katalog()
    const e = erfassung()
    const liste = blindListe(k, e)
    const b = bewertung(e)
    expect(pruefeAntwort(liste, b, { teil: false })).toEqual([])
    expect(pruefeBewertung(k, e, b)).toEqual([])
    const falsch: Bewertung = {
      ...b,
      neue_instrumente: [{ ...b.neue_instrumente[0], name: 'x'.repeat(121) }],
      zuordnung: [...b.zuordnung.slice(1), { kennung: 'M99', ursachen: [] }],
    }
    const f = pruefeAntwort(liste, falsch, { teil: false })
    expect(f).toEqual(pruefeBewertung(k, e, falsch))
    expect(f.join('\n')).toMatch(/name ist länger als 120 Zeichen \(121\)/)
    expect(f.join('\n')).toMatch(/M99: unbekannte Kennung/)
    expect(f.join('\n')).toMatch(new RegExp(`${b.zuordnung[0].kennung}: nicht bewertet`))
  })

  it('prüft eine Teilbewertung nur auf die neu zu bewertenden Kennungen', () => {
    const k = katalog()
    const e = erfassung()
    const fest = kennungen(e)
    const alt = blindListe(k, e, fest)
    const bisher = bewertung(e)
    e.programme[0].massnahmen.push({ beschreibung: 'Erzieher einstellen', ursachen_ids: [1702], zitat: 'Wir stellen Erzieher ein.', seite: 15 })
    const jetzt = blindListe(k, e, ordneKennungen(e, fest, fest.length).kennungen)
    jetzt.teilbewertung = teilbewertung(alt, jetzt, bisher).block
    const teil: Bewertung = { blind_pruefsumme: jetzt.pruefsumme, neue_instrumente: [], zuordnung: [{ kennung: 'M04', instrument: 'I1', ursachen: [1702] }] }
    expect(pruefeAntwort(jetzt, teil, { teil: true })).toEqual([])
    expect(pruefeAntwort(jetzt, { ...teil, zuordnung: [...teil.zuordnung, bisher.zuordnung[0]] }, { teil: true }).join()).toMatch(/nicht neu zu bewerten/)
    expect(pruefeAntwort(jetzt, { ...teil, zuordnung: [{ kennung: 'M04', instrument: 'I9', ursachen: [1702] }] }, { teil: true }).join()).toMatch(/I9 gibt es nicht/)
  })

  it('führt das Skript nur mit der Themen-ID aus und gibt keine Herkunft aus', async () => {
    const { execFileSync } = await import('node:child_process')
    const { mkdirSync, rmSync, writeFileSync } = await import('node:fs')
    const ordner = new URL('../.cache/entwurf/99999/', import.meta.url)
    mkdirSync(new URL('protokoll/', ordner), { recursive: true })
    try {
      const e = erfassung()
      const liste = blindListe(katalog(), e)
      writeFileSync(new URL('blind.json', ordner), JSON.stringify(liste))
      const b = bewertung(e)
      const lauf = (antwort: string) => {
        writeFileSync(new URL('protokoll/bewertung-antwort.txt', ordner), antwort)
        try {
          return { ok: true, text: execFileSync('node', ['--experimental-strip-types', '--no-warnings', 'scripts/entwurf/antwort-pruefen.ts', '99999'], { encoding: 'utf8', stdio: 'pipe' }) }
        } catch (x) {
          return { ok: false, text: String((x as { stderr: string }).stderr) }
        }
      }
      expect(lauf(`${JSON.stringify(b, null, 1)}\n\nAnmerkungen.`)).toMatchObject({ ok: true, text: expect.stringMatching(/Antwort in Ordnung: 3 Kennungen/) })
      const kaputt = lauf('{\n "blind_pruefsumme": "x",\n "zuordnung": [\n}')
      expect(kaputt.ok).toBe(false)
      expect(kaputt.text).toMatch(/Zeile 4, Spalte 1/)
      expect(kaputt.text).not.toMatch(/Eins|Zwei|partei/)
    } finally {
      rmSync(ordner, { recursive: true, force: true })
    }
  })
})

describe('Suchbegriffe und Begründungen im Repository', () => {
  it('nimmt Suchbegriffe aus dem Leitfaden und prüft ihr Format', () => {
    const k = katalog()
    const l: Leitfaden = { ...LEITFADEN, suchbegriffe: SUCHBEGRIFFE, suchbegriffe_geprueft: { kita: 'gehört dazu' } }
    expect(pruefeLeitfaden(k, l)).toEqual([])
    const e = mitLeitfaden({ ...erfassung(), suchbegriffe: {} }, l)
    expect(e.suchbegriffe).toEqual(SUCHBEGRIFFE)
    expect(pruefeErfassung(k, e)).toEqual([])
    const f = pruefeLeitfaden(k, { ...l, suchbegriffe: { '1799': { R: ['x'] }, '1701': { 'Wie die SPD': ['kita'] }, '1702': { Leer: [] } }, suchbegriffe_geprueft: { fremd: 'x', kita: '' } }).join('\n')
    expect(f).toMatch(/Ursache 1799, die nicht zum Thema gehört/)
    expect(f).toMatch(/nennen eine Partei/)
    expect(f).toMatch(/Richtung „Leer“ – Liste nicht leerer Begriffe/)
    expect(f).toMatch(/„fremd“ steht in keiner Richtung/)
    expect(f).toMatch(/„kita“ ohne Grund/)
  })

  it('sieht Treffer-Hinweise mit strukturierter Begründung als erledigt an', () => {
    const k = katalog()
    const e = erfassung()
    // Partei 2 (Bund) hat 12 Treffer zu 1701 und keine Maßnahme.
    expect(erfassungsHinweise(k, e).join()).toMatch(/Zwei \(Bund\): 12 Treffer zu Ursache 1701/)
    e.programme[1].nicht_erfasst = [{ ursache: 1701, seiten: [20, 21], grund: 'Nur Rückblick auf frühere Kita-Politik.' }]
    expect(erfassungsHinweise(k, e)).toEqual([])
    expect(pruefeProgramm(k, e, e.programme[1])).toEqual([])
    expect(kurzbericht('Zwei-Bund', e.programme[1], 0, 'x')).toMatch(/Nicht erfasst: 1701 \(S\. 20, 21\)/)
    expect(pruefeProgramm(k, e, { ...e.programme[1], nicht_erfasst: [{ ursache: 1701, seiten: [], grund: '' }] }).join()).toMatch(/nicht_erfasst/)
  })

  it('gibt der Bewertung die Quelle vorhandener Instrumente mit', () => {
    const k = katalog()
    const e = erfassung()
    const b = bewertung(e)
    b.neue_instrumente[0].beleg_studie_url = 'https://www.dji.de/studie.pdf'
    const datei = eintragen(k, themaInhalt(), e, b, '2026-10-03')
    const mit = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/17-kita.json', inhalt: datei }], { pfad: 'ids.json', inhalt: { stillgelegt: [] } }).katalog
    const neu = { ...erfassung(), programme: [{ partei_id: 1, land: 'ST', massnahmen: [] as Erfassung['programme'][number]['massnahmen'], keine_massnahme: 'x' }] }
    const instr = blindListe(mit, neu).instrumente
    expect(instr).toHaveLength(1)
    expect(instr[0]).toMatchObject({ ebene: 'bund', beleg_studie_url: 'https://www.dji.de/studie.pdf' })
  })
})

describe('Datenteil des Pull Requests', () => {
  it('kommt wörtlich aus den Dateien', () => {
    const k = katalog()
    const e = { ...erfassung(), leitfaden: LEITFADEN }
    const fest = kennungen(e)
    const b = bewertung(e)
    const rueckfragen = 'Modell der Erfassung: mittlere Stufe\nModell der Bewertung: geerbt\n\n| Programm | Anlass | Ergebnis |\n| --- | --- | --- |\n| Eins-Bund | Pflichtursache (R1) | Seiten nachgetragen |'
    const vorher = structuredClone(e)
    vorher.programme[0].massnahmen.push({ beschreibung: 'Weggefallen', ursachen_ids: [1701], zitat: 'Weg.', seite: 40 })
    const text = berichtText({
      katalog: k,
      erfassung: e,
      bewertung: b,
      fest,
      liste: blindListe(k, e, fest),
      protokoll: new Map([
        ['rueckfragen.md', rueckfragen],
        ['erfassung-Eins-Bund-rueckfrage-1.txt', '{}'],
        ['bewertung-antwort.txt', `${JSON.stringify(b)}\nSchwierig: M02, weil …`],
        ['kosten.md', '| Agent | Tokens |\n| programm-erfassung Eins-Bund | 50000 |'],
      ]),
      staende: [vorher],
      nichtDurchsucht: [['Drei-Bund', 'HTTP 503']],
      entfallen: [],
      punkte: 'Kita – Punkte …',
    })
    expect(text).toMatch(/- Modell der Erfassung: mittlere Stufe/)
    expect(text).toMatch(/\| Eins \| 2 → 2; 1 Rückfrage \| – \|/)
    expect(text).toMatch(/\| Zwei \| 0 → 0 \| 1 → 1 \|/)
    expect(text).toMatch(/\*\*Bund\*\* 1701 Zwei; 1702 Zwei/)
    expect(text).toMatch(/Drei-Bund \(HTTP 503\)/)
    expect(text).toMatch(/Eins \(Bund\): entfallen S\. 40 „Weggefallen“/)
    expect(text).toMatch(/Ohne Bündel an Ursachen mit Bündeln \(1,/)
    expect(text).toMatch(/Zuordnung: Eins \(Bund\): 2 Maßnahmen/)
    expect(text).toMatch(/Schwierig: M02, weil …/)
    expect(text).toMatch(/\| Eins-Bund \| Pflichtursache \(R1\) \| Seiten nachgetragen \|/)
    expect(text).toMatch(/programm-erfassung Eins-Bund \| 50000/)
    expect(text).toMatch(new RegExp(`Prüfsumme \`${blindListe(k, e, fest).pruefsumme}\``))
  })
})
