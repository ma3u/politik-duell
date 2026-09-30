import { describe, expect, it } from 'vitest'
import { MOCK_DATEN, type Daten } from '../data/quelle'
import { baueGraph } from './graph'
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
    const g = baueGraph(daten, new Set(), new Set())
    expect(g.knoten.map((k) => k.schluessel)).toEqual([`t${t.id}`])
    expect(g.knoten[0]).toMatchObject({ anzahl: 2, massnahmen: 2, klappbar: true, aufgeklappt: false })
    expect(g.kanten).toEqual([])
  })

  it('klappt Ursachen und Maßnahmen auf; geteilte Maßnahmen gibt es einmal', () => {
    const g = baueGraph(daten, new Set([t.id]), new Set([u1.id, u2.id]))
    expect(g.knoten.filter((k) => k.art === 'ursache').map((k) => k.anzahl)).toEqual([2, 1])
    expect(g.knoten.filter((k) => k.art === 'massnahme').map((k) => k.id)).toEqual([1, 2])
    expect(g.kanten.filter((k) => k.zu === 'm1')).toHaveLength(2)
    // Maßnahmen tragen keine Partei
    expect(g.knoten.every((k) => !('partei_id' in k))).toBe(true)
  })

  it('zeigt Maßnahmen nur unter aufgeklappten Themen', () => {
    const g = baueGraph(daten, new Set(), new Set([u1.id]))
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
})
