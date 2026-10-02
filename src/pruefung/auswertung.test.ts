import { describe, expect, it } from 'vitest'
import { blindeReihenfolge, exportiere, median, spannweite, werteAus } from './auswertung'

const w = (wirksamkeit: number, umsetzbarkeit: number) => ({ wirksamkeit, umsetzbarkeit })

describe('Median und Spannweite', () => {
  it('ungerade Anzahl: mittlerer Wert, unabhängig von der Reihenfolge', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([0, 3, 3])).toBe(3)
    expect(median([2])).toBe(2)
  })

  it('gerade Anzahl: Mitte der beiden mittleren Werte', () => {
    expect(median([2, 2])).toBe(2)
    expect(median([1, 2])).toBe(1.5)
    expect(median([3, 0, 2, 1])).toBe(1.5)
  })

  it('ohne Werte: null', () => {
    expect(median([])).toBeNull()
    expect(spannweite([])).toBeNull()
  })

  it('Spannweite = größter minus kleinster Wert', () => {
    expect(spannweite([2, 2, 2])).toBe(0)
    expect(spannweite([1, 3, 2])).toBe(2)
  })
})

describe('Auswertung je Maßnahme', () => {
  it('Punkte erst aus den Medianen, nicht als Median der Einzelpunkte', () => {
    // Einzelpunkte 3×1=3, 1×3=3, 2×2=4 → deren Median wäre 3; Median W × Median U = 2 × 2 = 4.
    const a = werteAus(2001, [w(3, 1), w(1, 3), w(2, 2)])
    expect(a).toMatchObject({ anzahl: 3, median_w: 2, median_u: 2, punkte: 4, spannweite: 2 })
  })

  it('markiert zu wenige Bewertungen und große Spannweite', () => {
    expect(werteAus(1, [w(2, 2)]).klaeren).toBe(true)
    expect(werteAus(1, [w(2, 2), w(3, 2)]).klaeren).toBe(false)
    expect(werteAus(1, [w(1, 2), w(3, 2)]).klaeren).toBe(true)
    expect(werteAus(1, [w(2, 0), w(2, 2)]).klaeren).toBe(true)
  })

  it('gerade Anzahl mit verschiedenen Mitten ergibt halbe Werte', () => {
    expect(werteAus(1, [w(2, 3), w(3, 3)])).toMatchObject({ median_w: 2.5, median_u: 3, punkte: 7.5 })
  })

  it('ohne Bewertungen: nichts berechnet', () => {
    expect(werteAus(1, [])).toMatchObject({ anzahl: 0, median_w: null, punkte: null, spannweite: null, klaeren: true })
  })
})

describe('Export', () => {
  it('enthält nur Zahlen je Maßnahme, keine Namen, sortierte Einzelwerte, und lässt Unbewertetes weg', () => {
    const daten = exportiere(2, '2026-10-05', [werteAus(2001, [w(2, 3), w(2, 2), w(3, 2)]), werteAus(2002, [])])
    expect(daten).toEqual({
      thema_id: 2,
      datum: '2026-10-05',
      bewertungen: [{ massnahme_id: 2001, anzahl: 3, median_w: 2, median_u: 2, spannweite: 1, werte: [[2, 2], [2, 3], [3, 2]] }],
    })
  })
})

describe('Blinde Reihenfolge', () => {
  it('ist fest und mischt die IDs', () => {
    const liste = [2001, 2002, 2003, 2011, 2012, 2021].map((id) => ({ id }))
    const a = blindeReihenfolge(liste).map((m) => m.id)
    expect(blindeReihenfolge([...liste].reverse()).map((m) => m.id)).toEqual(a)
    expect(a).not.toEqual(liste.map((m) => m.id))
    expect([...a].sort()).toEqual(liste.map((m) => m.id))
  })
})
