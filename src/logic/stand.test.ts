import { describe, expect, it } from 'vitest'
import { MOCK_DATEN, type Daten } from '../data/quelle'
import { fuerBeideErfasst, statistik, themenStand } from './stand'

describe('Datenstand (#/themen)', () => {
  it('zählt Themen, Ursachen und Maßnahmen', () => {
    const s = statistik(MOCK_DATEN)
    expect(s.themen).toBe(MOCK_DATEN.themen.length)
    expect(s.ursachen).toBe(MOCK_DATEN.ursachen.length)
    expect(s.massnahmen + s.massnahmenEntwurf).toBe(MOCK_DATEN.massnahmen.length)
    expect(s.paare).toBe(MOCK_DATEN.parteien.length * MOCK_DATEN.themen.length)
    expect(s.erfasst).toBeLessThanOrEqual(s.paare)
  })

  it('unterscheidet ausgewertet, nichts im Programm und noch nicht erfasst', () => {
    const [p1, p2, p3] = MOCK_DATEN.parteien
    const t = MOCK_DATEN.themen[0]
    const eintrag = { thema_id: t.id, begruendung: null, stand: '2026-09-01' }
    const daten: Daten = {
      ...MOCK_DATEN,
      parteien: [p1, p2, p3],
      themen: [t],
      abdeckung: [
        { ...eintrag, partei_id: p1.id, art: 'massnahmen' },
        { ...eintrag, partei_id: p2.id, art: 'keine', ki_entwurf: true },
        // Landesprogramm zählt nicht als Bundesprogramm
        { ...eintrag, partei_id: p3.id, art: 'massnahmen', land: 'ST' },
      ],
      massnahmen: [
        { ...MOCK_DATEN.massnahmen[0], thema_id: t.id, ki_entwurf: false },
        { ...MOCK_DATEN.massnahmen[0], id: 99999, thema_id: t.id, ki_entwurf: true },
      ],
    }
    const [stand] = themenStand(daten)
    expect(stand.zaehlung).toEqual({ massnahmen: 1, keine: 1, offen: 1 })
    expect(stand.parteien.map((p) => p.ki_entwurf)).toEqual([false, true, false])
    expect([stand.massnahmen, stand.massnahmenEntwurf]).toEqual([1, 1])
    expect(statistik(daten)).toMatchObject({ erfasst: 2, paare: 3, massnahmen: 1, massnahmenEntwurf: 1 })
    expect(fuerBeideErfasst(daten, t.id, [p1.id, p2.id])).toBe(true)
    expect(fuerBeideErfasst(daten, t.id, [p1.id, p3.id])).toBe(false)
  })
})
