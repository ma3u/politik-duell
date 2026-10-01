import { describe, expect, it } from 'vitest'
import { pruefeKatalog, type Datei } from '../src/data/katalog'
import { bewertungsHinweise, blindListe, eintragen, kennungen, ohneParteinamen, pruefeBewertung, pruefeErfassung, pruefeKennungen, ursachenFreigegeben, type Bewertung, type Erfassung } from './entwurf'

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
      return JSON.stringify(kennungen(e)) !== JSON.stringify(fest)
    })
    expect(verschiebt).toBe(true)
    expect(kennungen(e, fest)).toEqual(fest)
    const liste = blindListe(katalog(), e, fest)
    expect(liste.massnahmen.map((m) => m.kennung)).toEqual(fest.map((x) => x.kennung))
    // Eine Maßnahme mehr oder weniger macht die gespeicherte Zuordnung ungültig.
    e.programme[0].massnahmen.push({ beschreibung: 'Neu', ursachen_ids: [1701], zitat: 'Neu.', seite: 1 })
    expect(pruefeKennungen(e, fest).join()).toMatch(/fehlt in der gespeicherten Zuordnung/)
    e.programme[0].massnahmen.splice(0, 2)
    expect(pruefeKennungen(e, fest).join()).toMatch(/gibt es in der Erfassung nicht mehr/)
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
    expect(fehler).toMatch(/nicht bewertet/)
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
    const keine = r.katalog.abdeckung.find((a) => a.partei_id === 2 && !a.land)
    expect(keine).toMatchObject({ art: 'keine', ki_entwurf: true, geprueft: false })
    expect(pruefeErfassung(r.katalog, e).join('\n')).toMatch(/schon einen Eintrag/)
  })
})
