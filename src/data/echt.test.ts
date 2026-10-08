import { describe, expect, it } from 'vitest'
import { ECHTE_DATEN } from './echt'
import { waehlbareLaender } from './quelle'

describe('echter Katalog ohne Datenbank (VITE_DATENQUELLE=katalog)', () => {
  it('enthält alle Parteien, auch Volt, und gilt als Testphase', () => {
    expect(ECHTE_DATEN.quelle).toBe('katalog')
    expect(ECHTE_DATEN.testphase).toBe(true)
    expect(ECHTE_DATEN.parteien.map((p) => p.kurzname)).toContain('Volt')
    expect(ECHTE_DATEN.parteien.some((p) => /^https:\/\/example\./.test(p.programm_url))).toBe(false)
  })

  it('zählt Maßnahmen nur mit Abdeckung, KI-Entwürfe gekennzeichnet', () => {
    expect(ECHTE_DATEN.massnahmen.length).toBeGreaterThan(0)
    for (const m of ECHTE_DATEN.massnahmen) {
      expect(ECHTE_DATEN.abdeckung.some((a) => a.thema_id === m.thema_id && a.partei_id === m.partei_id && (a.land ?? null) === (m.land ?? null))).toBe(true)
    }
    expect(ECHTE_DATEN.massnahmen.some((m) => m.ki_entwurf)).toBe(true)
  })

  it('bietet die Länder mit erfassten Landesprogrammen an, auch für Volt', () => {
    const volt = ECHTE_DATEN.parteien.find((p) => p.kurzname === 'Volt')!
    expect(waehlbareLaender(ECHTE_DATEN).length).toBeGreaterThan(0)
    expect(ECHTE_DATEN.landesprogramme.filter((l) => l.partei_id === volt.id).map((l) => l.land).sort()).toEqual(['BE', 'MV', 'ST'])
  })
})
