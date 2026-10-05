import { describe, expect, it } from 'vitest'
import { MOCK_DATEN, type Daten } from '../data/quelle'
import { baueGraph, obersteKnoten } from './graph'
import { themenStand } from './stand'

describe('Zusammenhangsgraph (#/themen)', () => {
  const [t] = MOCK_DATEN.themen
  const [u1, u2] = MOCK_DATEN.ursachen.filter((u) => u.thema_id === t.id)
  const m = MOCK_DATEN.massnahmen[0]
  const daten: Daten = {
    ...MOCK_DATEN,
    themen: [t],
    ursachen: [u1, u2],
    massnahmen: [
      { ...m, id: 1, thema_id: t.id, ursachen_ids: [u1.id, u2.id] },
      { ...m, id: 2, thema_id: t.id, ursachen_ids: [u1.id], ki_entwurf: true },
    ],
  }

  it('zeigt zugeklappt nur Themen', () => {
    const g = baueGraph(daten, 'problem', new Set())
    expect(g.knoten.map((k) => k.schluessel)).toEqual([`t${t.id}`])
    expect(g.knoten[0]).toMatchObject({ anzahl: 2, massnahmen: 2, klappbar: true, aufgeklappt: false })
    expect(g.kanten).toEqual([])
  })

  it('klappt Ursachen und Maßnahmen auf; geteilte Maßnahmen gibt es einmal', () => {
    const g = baueGraph(daten, 'problem', new Set([`t${t.id}`, `u${u1.id}`, `u${u2.id}`]))
    expect(g.knoten.filter((k) => k.art === 'ursache').map((k) => k.anzahl)).toEqual([2, 1])
    expect(g.knoten.filter((k) => k.art === 'massnahme').map((k) => k.id)).toEqual([1, 2])
    expect(g.kanten.filter((k) => k.zu === 'm1')).toHaveLength(2)
    // Maßnahmen tragen keine Partei
    expect(g.knoten.every((k) => !('partei_id' in k))).toBe(true)
  })

  it('zeigt Maßnahmen nur unter aufgeklappten Themen', () => {
    const g = baueGraph(daten, 'problem', new Set([`u${u1.id}`]))
    expect(g.knoten).toHaveLength(1)
  })

  it('zählt Maßnahmen je Ursache im Datenstand', () => {
    const [stand] = themenStand(daten)
    expect(stand.ursachenStand.map((u) => [u.massnahmen, u.massnahmenEntwurf])).toEqual([
      [1, 1],
      [1, 0],
    ])
    expect(stand.ursachenOhneMassnahme).toBe(0)
  })

  it('Forderungen: Themen → Lösungswege → Maßnahmen, ohne Partei', () => {
    const [i1, i2] = [
      { id: 1, thema_id: t.id, name: 'Weg A', begruendung: null, evidenz: 'belegt' as const, ebene: 'bund' as const },
      { id: 2, thema_id: t.id, name: 'Weg B', begruendung: null, evidenz: null, ebene: 'bund' as const },
    ]
    const mit: Daten = {
      ...daten,
      instrumente: [i1, i2],
      massnahmen: [
        { ...m, id: 1, thema_id: t.id, partei_id: 1, instrument_id: 1 },
        { ...m, id: 2, thema_id: t.id, partei_id: 2, instrument_id: 1 },
        { ...m, id: 3, thema_id: t.id, partei_id: 2, instrument_id: null },
      ],
    }
    const zu = baueGraph(mit, 'forderung', new Set())
    expect(zu.knoten).toHaveLength(1)
    expect(zu.knoten[0]).toMatchObject({ art: 'thema', anzahl: 2, massnahmen: 2 })
    const g = baueGraph(mit, 'forderung', new Set([`t${t.id}`, 'i1', 'i2']))
    const wege = g.knoten.filter((k) => k.art === 'instrument')
    // Weg A: 2 Maßnahmen aus 2 Parteien; Weg B ohne Maßnahme ist nicht aufklappbar
    expect(wege.map((k) => [k.anzahl, k.massnahmen, k.klappbar])).toEqual([
      [2, 2, true],
      [0, 0, false],
    ])
    expect(g.knoten.filter((k) => k.art === 'massnahme').map((k) => k.id)).toEqual([1, 2])
    expect(g.kanten.filter((k) => k.von === 'i1')).toHaveLength(2)
    expect(g.knoten.every((k) => !('partei_id' in k))).toBe(true)
  })

  it('Haltungen: Positionen nur als erfasst/offen, verwandte Themen einmal', () => {
    const [p1, p2] = MOCK_DATEN.parteien
    const position = { kurzfassung: 'x', zitat: 'x', beleg_programm_url: 'https://x', begruendung: null, stand: '2026-10-01' }
    const mit: Daten = {
      ...daten,
      parteien: [p1, p2],
      haltungen: [
        { id: 1, frage: 'Frage 1?', beschreibung: '', verwandte_themen: [t.id] },
        { id: 2, frage: 'Frage 2?', beschreibung: '', verwandte_themen: [t.id] },
      ],
      haltungPositionen: [
        { ...position, haltung_id: 1, partei_id: p1.id, position: 'ja' },
        { ...position, haltung_id: 1, partei_id: p2.id, position: 'nein' },
        { ...position, haltung_id: 2, partei_id: p1.id, position: 'teils' },
        // Landesprogramm zählt nicht
        { ...position, haltung_id: 2, partei_id: p2.id, position: 'ja', land: 'ST' },
      ],
      zielkonflikte: [
        { haltung_id: 1, seite: 'ja', text: 'A', quelle_url: 'https://a' },
        { haltung_id: 1, seite: 'nein', text: 'B', quelle_url: 'https://b' },
      ],
    }
    const zu = baueGraph(mit, 'haltung', new Set())
    expect(zu.knoten.map((k) => [k.schluessel, k.anzahl, k.erfasst])).toEqual([
      ['h1', 2, true],
      ['h2', 1, false],
    ])
    const g = baueGraph(mit, 'haltung', new Set(obersteKnoten(mit, 'haltung')))
    expect(g.knoten.filter((k) => k.art === 'position').map((k) => [k.schluessel, k.erfasst])).toEqual([
      [`p1_${p1.id}`, true],
      [`p1_${p2.id}`, true],
      [`p2_${p1.id}`, true],
      [`p2_${p2.id}`, false],
    ])
    expect(g.knoten.filter((k) => k.art === 'zielkonflikt').map((k) => k.seite)).toEqual(['ja', 'nein'])
    expect(g.knoten.filter((k) => k.art === 'thema')).toHaveLength(1)
    expect(g.kanten.filter((k) => k.zu === `t${t.id}`)).toHaveLength(2)
    // Der Inhalt einer Position (ja/nein/teils) steht nicht im Graphen
    expect(g.knoten.every((k) => !('position' in k) && (k.art === 'zielkonflikt' || k.seite === undefined))).toBe(true)
  })
})
