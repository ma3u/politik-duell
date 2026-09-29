import { describe, expect, it } from 'vitest'
import { pruefeKatalog, type Datei } from '../src/data/katalog'
import { naechsteId, vergleicheIds } from './ids'

const PARTEIEN: Datei = {
  pfad: 'parteien.json',
  inhalt: {
    fiktiv: true,
    parteien: [
      { id: 1, name: 'Eins', kurzname: 'Eins', farbe: '#112233', programm_url: 'https://eins.de/p.pdf', programm_stand: '2026-01-01' },
      { id: 2, name: 'Zwei', kurzname: 'Zwei', farbe: '#445566', programm_url: 'https://zwei.de/p.pdf', programm_stand: '2026-01-01' },
    ],
  },
}
const m = (id: number, partei_id = 1) => ({
  partei_id,
  massnahmen: [{ id, beschreibung: 'x', ursachen_ids: [11], wirksamkeit: 1, umsetzbarkeit: 1, begruendung: 'x', beleg_programm_url: `https://${partei_id === 1 ? 'eins' : 'zwei'}.de/p.pdf#page=1`, stand: '2026-02-01', geprueft: false }],
})
const katalog = (abdeckung: unknown[], stillgelegt: unknown[] = []) =>
  pruefeKatalog(
    PARTEIEN,
    [{ pfad: 't.json', inhalt: { id: 1, name: 'T', beschreibung: 'x', ursachen: [{ id: 11, beschreibung: 'x', quelle_url: 'https://q.de' }], abdeckung } }],
    { pfad: 'ids.json', inhalt: { stillgelegt } },
  ).katalog

describe('IDs', () => {
  it('nennt die nächste freie ID, auch nach stillgelegten', () => {
    expect(naechsteId(katalog([m(5)]))).toBe(6)
    expect(naechsteId(katalog([m(5)], [{ id: 9, grund: 'x' }]))).toBe(10)
  })

  it('erlaubt neue IDs, aber keine entfernten oder umgewidmeten', () => {
    const alt = katalog([m(5), m(6, 2)])
    expect(vergleicheIds(alt, katalog([m(5), m(6, 2), m(7)]))).toEqual([])
    expect(vergleicheIds(alt, katalog([m(5)])).join('\n')).toMatch(/ID 6 \(Maßnahme in Thema 1, Partei 2, Bund\) ist entfernt/)
    expect(vergleicheIds(alt, katalog([m(5)], [{ id: 6, grund: 'Doppelt erfasst' }]))).toEqual([])
    expect(vergleicheIds(alt, katalog([m(5), m(6, 1)])).join('\n')).toMatch(/ID 6 ist umgewidmet/)
    const still = katalog([m(5)], [{ id: 6, grund: 'x' }])
    expect(vergleicheIds(still, katalog([m(5)])).join('\n')).toMatch(/ID 6 fehlt in daten\/ids.json/)
  })
})
