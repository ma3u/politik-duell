import { describe, expect, it } from 'vitest'
import { pruefeKatalog, type Datei } from '../src/data/katalog'
import { bewertungsHinweise, blindListe, eintragen, kennungen, ohneParteinamen, programmServer, PROTOKOLL, pruefeBewertung, pruefeErfassung, pruefeKennungen, pruefeProtokoll, ursachenFreigegeben, type Bewertung, type Erfassung, type Kennung } from './entwurf'
import { seitenOhneText } from './programme'
import { vergleicheStand } from './stand-vergleich'

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
]) => ({ id: 17, name: 'Kita', beschreibung: 'Kein Kitaplatz.', ziel: 'Eltern finden einen Platz.', ursachen })

const katalog = (inhalt: Record<string, unknown> = themaInhalt()) => {
  const r = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/17-kita.json', inhalt }], { pfad: 'ids.json', inhalt: { stillgelegt: [] } })
  expect(r.fehler).toEqual([])
  return r.katalog
}

const erfassung = (): Erfassung => ({
  thema_id: 17,
  suchbegriffe: ['Kita', 'Erzieher'],
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
      { kennung: nach(0, 0), instrument: 'I1' },
      { kennung: nach(0, 1), einzeln: { wirksamkeit: 2, umsetzbarkeit: 3, begruendung: 'Mehr Bewerbungen.', evidenz: 'gemischt' } },
      { kennung: nach(2, 0), einzeln: { wirksamkeit: 2, umsetzbarkeit: 2, begruendung: 'Land ist zuständig.', evidenz: 'belegt' } },
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
  it('ersetzt Parteinamen, aber keine Wortteile', () => {
    expect(ohneParteinamen('Wir Freie Demokraten und die LINKE wollen das.')).toBe('Wir [Partei] und die [Partei] wollen das.')
    expect(ohneParteinamen('Grünflächen und Unionsrecht bleiben.')).toBe('Grünflächen und Unionsrecht bleiben.')
    expect(ohneParteinamen('Die Europäische Union und die linke Spur bleiben, die Union nicht.')).toBe('Die Europäische Union und die linke Spur bleiben, die [Partei] nicht.')
    expect(ohneParteinamen('Die Partei Eins will das.', ['Partei Eins'])).toBe('Die [Partei] will das.')
  })

  it('mischt die Reihenfolge fest und zeigt keine Partei', () => {
    const e = erfassung()
    expect(kennungen(e)).toEqual(kennungen(erfassung()))
    expect(kennungen(e).map((x) => x.kennung)).toEqual(['M01', 'M02', 'M03'])
    const liste = blindListe(katalog(), e)
    const text = JSON.stringify(liste)
    expect(text).not.toMatch(/partei_id|Freie Demokraten|LINKE|eins\.de|zwei/)
    expect(liste.massnahmen.find((m) => m.ebene === 'land')?.zitat).toBe('Die [Partei] will mehr Kitas.')
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
    expect(kennungen(e, fest)).toEqual(fest)
    expect(pruefeKennungen(e, fest)).toEqual([])
    const liste = blindListe(katalog(), e, fest)
    expect(liste.massnahmen.map((m) => m.kennung)).toEqual(fest.map((x) => x.kennung))
    // Eine Maßnahme mehr oder weniger macht die gespeicherte Zuordnung ungültig.
    e.programme[0].massnahmen.push({ beschreibung: 'Neu', ursachen_ids: [1701], zitat: 'Neu.', seite: 1 })
    expect(pruefeKennungen(e, fest).join()).toMatch(/fehlt in der gespeicherten Zuordnung/)
    e.programme[0].massnahmen.splice(0, 2)
    expect(pruefeKennungen(e, fest).join()).toMatch(/gibt es in der Erfassung nicht mehr/)
  })

  it('erkennt umsortierte Programme und ausgetauschte Maßnahmen bei gleicher Anzahl', () => {
    // Zwei Programme mit gleich vielen Maßnahmen tauschen: Positionen passen, Parteien nicht.
    const e = erfassung()
    e.programme[0].massnahmen.splice(1)
    const fest = kennungen(e)
    const getauscht = structuredClone(e)
    ;[getauscht.programme[0], getauscht.programme[2]] = [getauscht.programme[2], getauscht.programme[0]]
    expect(pruefeKennungen(getauscht, fest).join()).toMatch(/Programme umsortiert/)
    // Nur das Zitat korrigiert: erlaubt. Beschreibung und Zitat neu: andere Maßnahme.
    e.programme[0].massnahmen[0].zitat = 'Korrigiertes Zitat.'
    expect(pruefeKennungen(e, fest)).toEqual([])
    e.programme[0].massnahmen[0].beschreibung = 'Ganz andere Maßnahme'
    expect(pruefeKennungen(e, fest).join()).toMatch(/ausgetauscht/)
    // Alte kennungen.json ohne die neuen Felder wird weiter nach Position geprüft.
    const alt = fest.map(({ kennung, programm, massnahme }) => ({ kennung, programm, massnahme }))
    expect(pruefeKennungen(e, alt)).toEqual([])
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

describe('Protokoll', () => {
  const vollstaendig = (e: Erfassung, auftrag: string) =>
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
    expect(fehler).toHaveLength(2)
    expect(fehler.join()).toMatch(/Ursache 1703 ist neu/)
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
