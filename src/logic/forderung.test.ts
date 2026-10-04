import { describe, expect, it } from 'vitest'
import { MOCK_DATEN, type Daten } from '../data/quelle'
import type { AbdeckungEintrag, InstrumentEintrag, Massnahme } from '../data/types'
import { forderungskarte } from './forderung'

// Beispieldaten: Instrument 90 (Mietpreisbremse, Bund) steht nur im Programm von Partei 1 (Alpha); die
// Parteien 2 bis 5 sind zum Thema Miete ausgewertet. Für Land ST kommt ein Gegenstück dazu.
const bund = MOCK_DATEN.instrumente.find((i) => i.id === 90)!
const alpha = MOCK_DATEN.massnahmen.find((m) => m.instrument_id === 90)!

const landInstrument: InstrumentEintrag = {
  ...bund, id: 91, name: 'Mietpreisbremse im Land verlängern', ebene: 'land', entspricht: 90,
}
const landMassnahme: Massnahme = {
  ...alpha, id: 9001, land: 'ST', ursachen_ids: [202], instrument_id: 91,
  beleg_programm_url: 'https://example.org/mock/alpha/st.pdf#page=3',
}

const mitLand = (ueber: Partial<Daten> = {}): Daten => ({
  ...MOCK_DATEN,
  instrumente: [{ ...bund, entspricht: 91 }, landInstrument],
  massnahmen: [...MOCK_DATEN.massnahmen, landMassnahme],
  ursachen: MOCK_DATEN.ursachen.map((u) => (u.id === 202 ? { ...u, ebene: 'land' as const } : u)),
  landesprogramme: [
    { partei_id: 1, land: 'ST', url: 'https://example.org/mock/alpha/st.pdf', stand: '2026-03-01', kein_programm: null },
    { partei_id: 2, land: 'ST', url: null, stand: null, kein_programm: 'nicht angetreten' },
    { partei_id: 3, land: 'ST', url: 'https://example.org/mock/gamma/st.pdf', stand: '2026-03-01', kein_programm: null },
  ],
  abdeckung: [
    ...MOCK_DATEN.abdeckung,
    { thema_id: 2, partei_id: 1, land: 'ST', art: 'massnahmen', begruendung: null, stand: '2026-03-01' },
    { thema_id: 2, partei_id: 3, land: 'ST', art: 'keine', begruendung: 'durchsucht', stand: '2026-03-01' },
  ],
  ...ueber,
})

const funde = (k: ReturnType<typeof forderungskarte>, i = 0) => k!.bloecke[i].parteien.map((p) => [p.partei.id, p.fund])

describe('forderungskarte', () => {
  it('zeigt für alle Parteien in fester Reihenfolge, wo der Lösungsweg im Bundesprogramm steht', () => {
    const k = forderungskarte(MOCK_DATEN, 90, null)!
    expect(k.instrument.name).toBe(bund.name)
    expect(k.bloecke).toHaveLength(1)
    expect(k.bloecke[0]).toMatchObject({ ebene: 'bund', land: null })
    // Alpha hat ihn, die anderen vier sind ausgewertet („zu diesem Thema nicht gefunden“ – auch Gamma mit „keine Maßnahme“).
    expect(funde(k)).toEqual([[1, 'steht'], [2, 'nicht_gefunden'], [3, 'nicht_gefunden'], [4, 'nicht_gefunden'], [5, 'nicht_gefunden']])
    expect(k.bloecke[0].parteien[0].massnahmen.map((m) => m.id)).toEqual([alpha.id])
    expect(k.ki_entwurf).toBe(false)
  })

  it('zeigt keine Punkte und hebt keine Partei hervor', () => {
    const k = forderungskarte(MOCK_DATEN, 90, null)!
    const text = JSON.stringify(k.instrument)
    expect(text).not.toMatch(/wirksamkeit|umsetzbarkeit|punkte/i)
    expect(Object.keys(k.bloecke[0].parteien[0]).sort()).toEqual(['fund', 'massnahmen', 'partei'])
  })

  it('nennt „noch nicht erfasst“, wenn das Thema für die Partei fehlt oder die Ursachen nicht durchsucht sind', () => {
    const ohneBeta: AbdeckungEintrag[] = MOCK_DATEN.abdeckung.filter((a) => !(a.thema_id === 2 && a.partei_id === 2))
    const k1 = forderungskarte({ ...MOCK_DATEN, abdeckung: ohneBeta }, 90, null)
    expect(funde(k1).find(([id]) => id === 2)).toEqual([2, 'offen'])
    // Nur eine andere Ursache durchsucht, die des Instruments (202) fehlt.
    const teilweise = MOCK_DATEN.abdeckung.map((a) => (a.thema_id === 2 && a.partei_id === 4 ? { ...a, durchsucht_fuer: [201] } : a))
    const k2 = forderungskarte({ ...MOCK_DATEN, abdeckung: teilweise }, 90, null)
    expect(funde(k2).find(([id]) => id === 4)).toEqual([4, 'offen'])
    const vollstaendig = MOCK_DATEN.abdeckung.map((a) => (a.thema_id === 2 && a.partei_id === 4 ? { ...a, durchsucht_fuer: [201, 202] } : a))
    expect(funde(forderungskarte({ ...MOCK_DATEN, abdeckung: vollstaendig }, 90, null)).find(([id]) => id === 4)).toEqual([4, 'nicht_gefunden'])
  })

  it('ergänzt mit gewähltem Bundesland den Block der Landesprogramme (Gegenstück über „entspricht“)', () => {
    const k = forderungskarte(mitLand(), 90, 'ST')!
    expect(k.bloecke.map((b) => [b.ebene, b.land, b.instrument.id])).toEqual([['bund', null, 90], ['land', 'ST', 91]])
    expect(funde(k, 0)[0]).toEqual([1, 'steht'])
    expect(funde(k, 1)).toEqual([
      [1, 'steht'],
      [2, 'kein_programm'],
      [3, 'nicht_gefunden'],
      [4, 'offen'],
      [5, 'offen'],
    ])
    expect(k.bloecke[1].parteien[0].massnahmen.map((m) => m.id)).toEqual([9001])
  })

  it('zeigt ohne Bundesland nur den Bund – auch wenn das erkannte Instrument selbst für das Land gilt', () => {
    expect(forderungskarte(mitLand(), 90, null)!.bloecke.map((b) => b.ebene)).toEqual(['bund'])
    // Land-Instrument erkannt, Person ohne Land (etwa in der Auflösung einer anderen Runde): Bund über das Gegenstück.
    expect(forderungskarte(mitLand(), 91, null)!.bloecke.map((b) => [b.ebene, b.instrument.id])).toEqual([['bund', 90]])
    // Land-Instrument ohne Gegenstück und ohne Land: keine Karte.
    const einzeln = mitLand({ instrumente: [{ ...landInstrument, entspricht: null }] })
    expect(forderungskarte(einzeln, 91, null)).toBeNull()
    expect(forderungskarte(einzeln, 91, 'ST')!.bloecke.map((b) => b.ebene)).toEqual(['land'])
  })

  it('liefert null für ein unbekanntes Instrument', () => {
    expect(forderungskarte(MOCK_DATEN, 99999, null)).toBeNull()
  })

  it('kennzeichnet Entwürfe der Testphase', () => {
    const entwurf: Daten = {
      ...MOCK_DATEN,
      testphase: true,
      instrumente: [{ ...bund, ki_entwurf: true, entwurf_herkunft: 'blind' }],
      massnahmen: MOCK_DATEN.massnahmen.map((m) => (m.id === alpha.id ? { ...m, ki_entwurf: true, entwurf_herkunft: 'blind' as const } : m)),
    }
    expect(forderungskarte(entwurf, 90, null)).toMatchObject({ ki_entwurf: true, nicht_blind: false })
    const nichtBlind: Daten = { ...entwurf, instrumente: [{ ...bund, ki_entwurf: true, entwurf_herkunft: 'nicht_blind' }] }
    expect(forderungskarte(nichtBlind, 90, null)).toMatchObject({ ki_entwurf: true, nicht_blind: true })
  })
})
