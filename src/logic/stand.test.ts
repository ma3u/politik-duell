import { describe, expect, it } from 'vitest'
import { MOCK_DATEN, type Daten } from '../data/quelle'
import { fuerBeideErfasst, haltungStand, instrumentStand, statistik, themenStand } from './stand'

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

  it('zählt Lösungswege und Haltungen ohne Parteinamen und ohne Positionsverteilung', () => {
    const [p1, p2] = MOCK_DATEN.parteien
    const t = MOCK_DATEN.themen[0]
    const m = MOCK_DATEN.massnahmen[0]
    const position = { kurzfassung: 'x', zitat: 'x', beleg_programm_url: 'https://x', begruendung: null, stand: '2026-10-01' }
    const daten: Daten = {
      ...MOCK_DATEN,
      parteien: [p1, p2],
      themen: [t],
      instrumente: [
        { id: 1, thema_id: t.id, name: 'Weg A', begruendung: null, evidenz: null, ebene: 'bund' },
        { id: 2, thema_id: t.id, name: 'Weg B', begruendung: null, evidenz: null, ebene: 'bund', ki_entwurf: true },
      ],
      massnahmen: [
        { ...m, id: 1, thema_id: t.id, partei_id: p1.id, instrument_id: 1, ki_entwurf: false },
        { ...m, id: 2, thema_id: t.id, partei_id: p2.id, instrument_id: 1, ki_entwurf: false },
        { ...m, id: 3, thema_id: t.id, partei_id: p2.id, instrument_id: 2, ki_entwurf: true },
        { ...m, id: 4, thema_id: t.id, partei_id: p2.id, instrument_id: null, ki_entwurf: false },
      ],
      haltungen: [
        { id: 1, frage: 'Frage 1?', beschreibung: '', verwandte_themen: [t.id] },
        { id: 2, frage: 'Frage 2?', beschreibung: '', verwandte_themen: [] },
      ],
      haltungPositionen: [
        { ...position, haltung_id: 1, partei_id: p1.id, position: 'ja' },
        { ...position, haltung_id: 1, partei_id: p2.id, position: 'nein', ki_entwurf: true },
        { ...position, haltung_id: 2, partei_id: p1.id, position: 'ja' },
        { ...position, haltung_id: 2, partei_id: p2.id, position: 'ja', land: 'ST' },
      ],
      zielkonflikte: [
        { haltung_id: 1, seite: 'ja', text: 'A', quelle_url: 'https://a' },
        { haltung_id: 1, seite: 'nein', text: 'B', quelle_url: 'https://b' },
        { haltung_id: 99, seite: 'nein', text: 'C', quelle_url: 'https://c' },
      ],
    }
    expect(statistik(daten)).toMatchObject({
      instrumente: 1,
      instrumenteEntwurf: 1,
      massnahmenMitInstrument: 2,
      massnahmenMitInstrumentEntwurf: 1,
      haltungen: 2,
      haltungenVollstaendig: 1,
      positionen: 2,
      positionenEntwurf: 1,
      positionenMoeglich: 4,
      zielkonflikte: 2,
    })
    const [wege] = instrumentStand(daten)
    expect(wege.instrumente.map((i) => [i.massnahmen, i.parteien])).toEqual([
      [2, 2],
      [1, 1],
    ])
    expect(wege.mehrere).toBe(1)
    const h = haltungStand(daten)
    expect(h.map((x) => [x.positionen, x.positionenEntwurf, x.vollstaendig])).toEqual([
      [1, 1, true],
      [1, 0, false],
    ])
    expect(h[0].zielkonflikte).toEqual({ ja: 1, nein: 1 })
    expect(h.every((x) => !('ja' in x) && !('verteilung' in x))).toBe(true)
  })
})
