import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pruefeKatalog } from '../src/data/katalog'
import { pruefeDatenordner } from './katalog-laden'
import { formatiere, pruefeExport, uebernehme } from './pruefung-export'

// Kleiner echter (nicht fiktiver) Katalog mit zwei Maßnahmen zu Thema 1.
const PARTEIEN = {
  pfad: 'parteien.json',
  inhalt: {
    fiktiv: false,
    parteien: [
      { id: 1, name: 'Partei Eins', kurzname: 'Eins', farbe: '#112233', programm_url: 'https://eins.de/p.pdf', programm_stand: '2026-01-01' },
      { id: 2, name: 'Partei Zwei', kurzname: 'Zwei', farbe: '#445566', programm_url: 'https://zwei.de/p.pdf', programm_stand: '2026-01-01' },
    ],
  },
}
const massnahme = (id: number, w: number, u: number) => ({
  id,
  beschreibung: `Maßnahme ${id}`,
  ursachen_ids: [11],
  wirksamkeit: w,
  umsetzbarkeit: u,
  begruendung: 'Neutral.',
  zitat: 'Wörtlich.',
  beleg_programm_url: 'https://eins.de/p.pdf#page=2',
  stand: '2026-03-01',
  evidenz: 'belegt',
  geprueft: false,
})
const THEMA = {
  id: 1,
  name: 'Arzttermine',
  beschreibung: 'x',
  ziel: 'y',
  ursachen: [{ id: 11, beschreibung: 'Zu wenige Praxen', quelle_url: 'https://studie.de/a', ebene: 'bund' }],
  abdeckung: [{ partei_id: 1, massnahmen: [massnahme(101, 2, 3), massnahme(102, 1, 1)] }],
}
const katalog = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/01.json', inhalt: THEMA }]).katalog

const exportDatei = (bewertungen: unknown[], ueber: Record<string, unknown> = {}) => ({
  thema_id: 1,
  datum: '2026-10-05',
  bewertungen,
  ...ueber,
})
const b = (massnahme_id: number, ueber: Record<string, unknown> = {}) => ({
  massnahme_id, anzahl: 3, median_w: 3, median_u: 2, spannweite: 1, ...ueber,
})

describe('Export prüfen', () => {
  it('akzeptiert einen gültigen Export und meldet fehlende Maßnahmen', () => {
    const r = pruefeExport(exportDatei([b(101)]), katalog)
    expect(r.fehler).toEqual([])
    expect(r.export).not.toBeNull()
    expect(r.warnungen.join('\n')).toMatch(/Ohne Bewertung im Export: 102/)
  })

  it('lässt keine Namen oder anderen Felder durch', () => {
    expect(pruefeExport(exportDatei([b(101, { namen: ['Erika'] })]), katalog).fehler.join('\n')).toMatch(/unbekanntes Feld „namen“/)
    expect(pruefeExport(exportDatei([b(101)], { pruefende: ['Erika'] }), katalog).fehler.join('\n')).toMatch(/unbekanntes Feld „pruefende“/)
  })

  it('prüft gegen den Katalog', () => {
    expect(pruefeExport(exportDatei([b(999)]), katalog).fehler.join('\n')).toMatch(/unbekannte Maßnahme oder unbekanntes Instrument 999/)
    expect(pruefeExport(exportDatei([b(101)], { thema_id: 7 }), katalog).fehler.join('\n')).toMatch(/unbekanntes Thema 7/)
    expect(pruefeExport(exportDatei([b(101), b(101)]), katalog).fehler.join('\n')).toMatch(/doppelt/)
    expect(pruefeExport(exportDatei([b(101, { median_w: 4 })]), katalog).fehler.join('\n')).toMatch(/zwischen 0 und 3/)
  })

  it('halbe Mediane (gerade Anzahl): Betreiberin muss entscheiden', () => {
    const f = pruefeExport(exportDatei([b(101, { anzahl: 2, median_w: 2.5 })]), katalog).fehler.join('\n')
    expect(f).toMatch(/„median_w“ ist 2,5 – zwischen 2 und 3 entscheiden/)
  })

  it('große Spannweite erst nach Klärung, wenige Bewertungen als Warnung', () => {
    const offen = pruefeExport(exportDatei([b(101, { spannweite: 2 })]), katalog)
    expect(offen.fehler.join('\n')).toMatch(/Spannweite 2 – vor der Übernahme klären/)
    const geklaert = pruefeExport(exportDatei([b(101, { spannweite: 2 })]), katalog, { geklaert: true })
    expect(geklaert.fehler).toEqual([])
    expect(pruefeExport(exportDatei([b(101, { anzahl: 1 })]), katalog).warnungen.join('\n')).toMatch(/nur 1 Bewertung/)
  })
})

describe('Übernahme', () => {
  it('schreibt Mediane und Bewertung, behält Entwurf und „geprueft“, keine Namen', () => {
    const { inhalt, aenderungen } = uebernehme(THEMA, exportDatei([b(101)]) as never)
    const m = (inhalt as typeof THEMA).abdeckung[0].massnahmen
    expect(m[0]).toMatchObject({
      wirksamkeit: 3,
      umsetzbarkeit: 2,
      geprueft: false,
      bewertung: { anzahl: 3, median_w: 3, median_u: 2, spannweite: 1, datum: '2026-10-05', entwurf: [2, 3] },
    })
    expect(Object.keys(m[0]).indexOf('bewertung')).toBe(Object.keys(m[0]).indexOf('umsetzbarkeit') + 1)
    expect(m[1]).toEqual(massnahme(102, 1, 1))
    expect(aenderungen).toEqual([{ massnahme_id: 101, vorher: [2, 3], nachher: [3, 2] }])
    expect(Object.keys((m[0] as unknown as { bewertung: object }).bewertung)).toEqual(['anzahl', 'median_w', 'median_u', 'spannweite', 'datum', 'entwurf'])
    // Das Original bleibt unverändert.
    expect(THEMA.abdeckung[0].massnahmen[0].wirksamkeit).toBe(2)
  })

  it('erneute Übernahme behält den ursprünglichen Entwurf', () => {
    const erst = uebernehme(THEMA, exportDatei([b(101)]) as never).inhalt
    const zweit = uebernehme(erst, exportDatei([b(101, { median_w: 1, anzahl: 4 })]) as never).inhalt as typeof THEMA
    expect(zweit.abdeckung[0].massnahmen[0]).toMatchObject({ wirksamkeit: 1, bewertung: { anzahl: 4, entwurf: [2, 3] } })
  })

  it('Ergebnis besteht die Katalogprüfung; „geprueft“ erst ab zwei Bewertungen', () => {
    const { inhalt } = uebernehme(THEMA, exportDatei([b(101, { anzahl: 1 }), b(102)]) as never)
    const t = inhalt as typeof THEMA
    expect(pruefeKatalog(PARTEIEN, [{ pfad: 't.json', inhalt: t }]).fehler).toEqual([])
    for (const m of t.abdeckung[0].massnahmen) (m as { geprueft: boolean }).geprueft = true
    expect(pruefeKatalog(PARTEIEN, [{ pfad: 't.json', inhalt: t }]).fehler.join('\n')).toMatch(/erst ab zwei unabhängigen Bewertungen/)
  })
})

describe('Instrumente', () => {
  // Maßnahme 103 und 104 verweisen auf Instrument 190, 101 bleibt einzeln.
  const mitInstrument = (id: number) => {
    const { wirksamkeit: _w, umsetzbarkeit: _u, begruendung: _b, evidenz: _e, ...rest } = massnahme(id, 0, 0)
    return { ...rest, instrument: 190 }
  }
  const T = {
    ...THEMA,
    instrumente: [{ id: 190, name: 'Mehr Praxen', wirksamkeit: 2, umsetzbarkeit: 2, begruendung: 'Neutral.', evidenz: 'gemischt' }],
    abdeckung: [
      { partei_id: 1, massnahmen: [massnahme(101, 2, 3), mitInstrument(103)] },
      { partei_id: 2, massnahmen: [{ ...mitInstrument(104), beleg_programm_url: 'https://zwei.de/p.pdf#page=5' }] },
    ],
  }
  const k = pruefeKatalog(PARTEIEN, [{ pfad: 'themen/01.json', inhalt: T }]).katalog

  it('bewertet das Instrument, nicht die Maßnahmen dahinter', () => {
    expect(pruefeExport(exportDatei([b(101), b(190)]), k).fehler).toEqual([])
    expect(pruefeExport(exportDatei([b(103)]), k).fehler.join('\n')).toMatch(/unbekannte Maßnahme oder unbekanntes Instrument 103/)
    expect(pruefeExport(exportDatei([b(101)]), k).warnungen.join('\n')).toMatch(/Ohne Bewertung im Export: 190/)
  })

  it('schreibt das Ergebnis an das Instrument; Maßnahmen bleiben ohne eigene Bewertung', () => {
    const { inhalt, aenderungen } = uebernehme(T, exportDatei([b(190, { median_w: 1, median_u: 3 })]) as never)
    const t = inhalt as typeof T
    expect(t.instrumente[0]).toMatchObject({ wirksamkeit: 1, umsetzbarkeit: 3, bewertung: { anzahl: 3, entwurf: [2, 2] } })
    expect(t.abdeckung[0].massnahmen[1]).toEqual(mitInstrument(103))
    expect(aenderungen).toEqual([{ massnahme_id: 190, vorher: [2, 2], nachher: [1, 3] }])
    const { fehler, katalog } = pruefeKatalog(PARTEIEN, [{ pfad: 't.json', inhalt: t }])
    expect(fehler).toEqual([])
    expect(katalog.massnahmen.filter((m) => m.instrument_id === 190).map((m) => m.wirksamkeit * m.umsetzbarkeit)).toEqual([3, 3])
  })
})

describe('Formatierung', () => {
  it('erzeugt die Dateien in daten/ unverändert (kleine Diffs bei der Übernahme)', () => {
    const ordner = new URL('../daten/themen/', import.meta.url)
    for (const d of readdirSync(ordner).filter((x) => x.endsWith('.json'))) {
      const text = readFileSync(new URL(d, ordner), 'utf8')
      expect(formatiere(JSON.parse(text)) + '\n', d).toBe(text)
    }
  })

  it('der echte Katalog ist fehlerfrei', () => {
    expect(pruefeDatenordner().fehler).toEqual([])
  })
})

describe('Nachweis für „geprueft“ und Exporte im Repository', () => {
  const thema = (bewertung: Record<string, unknown>, geprueft = true, pruefung?: unknown) => ({
    ...THEMA,
    abdeckung: [
      { partei_id: 1, massnahmen: [{ ...massnahme(101, 3, 2), bewertung, geprueft, ...(pruefung ? { pruefung } : {}) }] },
      { partei_id: 2, keine_massnahme: { begruendung: 'Kapitel Gesundheit gelesen.', stand: '2026-03-01', geprueft: true, pruefung: { belege_geprueft: '2026-10-06', zweite_suche: 'Hausarzt, Praxis, Termin erneut gesucht; Kapitel 4 gelesen; Treffermatrix: 0' } } },
    ],
  })
  const bw = { anzahl: 3, median_w: 3, median_u: 2, spannweite: 1, datum: '2026-10-05', entwurf: [2, 3] }
  const ex = (werte?: [number, number][], ueber: Record<string, unknown> = {}) => ({
    pfad: 'daten/pruefungen/thema-01-2026-10-05.json',
    inhalt: exportDatei([b(101, { ...(werte ? { werte } : {}), ...ueber })]),
  })
  const fehler = (t: unknown, exporte = [ex()]) => pruefeKatalog(PARTEIEN, [{ pfad: 'themen/01.json', inhalt: t }], undefined, exporte).fehler.join('\n')

  it('verlangt das Datum der Belegprüfung und bei „keine Maßnahme“ die zweite Suche', () => {
    expect(fehler(thema(bw, true))).toMatch(/„geprueft“ nur mit „pruefung“/)
    expect(fehler(thema(bw, true, { belege_geprueft: '2026-10-06' }))).toBe('')
    const kurz = thema(bw, true, { belege_geprueft: '2026-10-06' })
    ;(kurz.abdeckung[1] as { keine_massnahme: Record<string, unknown> }).keine_massnahme.pruefung = { belege_geprueft: '2026-10-06', zweite_suche: 'ja' }
    expect(fehler(kurz)).toMatch(/zweite_suche“ nennt Suchbegriffe/)
  })

  it('gleicht jede „bewertung“ mit dem Export ab', () => {
    const t = thema(bw, false)
    expect(fehler(t)).toBe('')
    expect(fehler(t, [])).toMatch(/kein Export vom 2026-10-05/)
    expect(fehler(t, [ex(undefined, { median_w: 2 })])).toMatch(/weicht vom Export/)
    expect(fehler(t, [ex([[2, 2], [3, 2], [3, 3]])])).toBe('')
    expect(fehler(t, [ex([[2, 2], [2, 2], [3, 3]])])).toMatch(/median_w“ 3 passt nicht/)
    expect(fehler(t, [ex([[2, 2], [3, 2], [3, 3]], { namen: 'x' })])).toMatch(/unbekanntes Feld „namen“/)
  })
})
