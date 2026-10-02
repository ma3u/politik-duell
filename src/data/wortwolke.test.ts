import { describe, expect, it } from 'vitest'
import { MOCK_DATEN, type Daten } from './quelle'
import { themenWoerter } from './wortwolke'

const thema = (id: number, name: string) => ({ id, name, beschreibung: '' })
const ursache = (id: number, thema_id: number) => ({
  id,
  thema_id,
  beschreibung: '',
  quelle_url: '',
  ebene: 'bund' as const,
})

describe('themenWoerter', () => {
  it('zeigt nur Themen mit Ursachen, breit erfasste zuerst', () => {
    const d: Daten = {
      ...MOCK_DATEN,
      themen: [thema(1, 'Miete'), thema(2, 'Rente'), thema(3, 'Schule')],
      ursachen: [ursache(11, 1), ursache(21, 2), ursache(22, 2)],
    }
    expect(themenWoerter(d)).toEqual([
      { text: 'Rente', anzahl: 2 },
      { text: 'Miete', anzahl: 1 },
    ])
  })

  it('zeigt bei den Beispieldaten alle Themen', () => {
    expect(
      themenWoerter(MOCK_DATEN)
        .map((w) => w.text)
        .sort(),
    ).toEqual(MOCK_DATEN.themen.map((t) => t.name).sort())
  })
})
