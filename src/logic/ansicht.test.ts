import { describe, expect, it } from 'vitest'
import { graphPunkt, halteImGraph, MAX_ZOOM, verschiebe, vergroesserung, zoomeUm, type Ausschnitt } from './ansicht'

const ganz: Ausschnitt = { x: -300, y: -200, w: 600, h: 400 }
const flaeche = { breite: 600, hoehe: 400 }

describe('graphPunkt', () => {
  it('rechnet Pixel in Graphkoordinaten um', () => {
    expect(graphPunkt(ganz, flaeche, 0, 0)).toEqual({ x: -300, y: -200 })
    expect(graphPunkt(ganz, flaeche, 300, 200)).toEqual({ x: 0, y: 0 })
  })

  it('berücksichtigt den Rand bei abweichendem Seitenverhältnis', () => {
    // Fläche doppelt so breit: Ausschnitt sitzt mittig, links 300 px Rand.
    const p = graphPunkt(ganz, { breite: 1200, hoehe: 400 }, 600, 200)
    expect(p).toEqual({ x: 0, y: 0 })
  })
})

describe('zoomeUm', () => {
  it('lässt den Punkt unter dem Zeiger an seiner Stelle', () => {
    const p = { x: 100, y: 50 }
    const a = zoomeUm(ganz, p, 2, ganz)
    expect(a.w).toBe(300)
    expect(a.h).toBe(200)
    // Relative Lage des Punkts im Ausschnitt bleibt gleich.
    expect((p.x - a.x) / a.w).toBeCloseTo((p.x - ganz.x) / ganz.w)
    expect((p.y - a.y) / a.h).toBeCloseTo((p.y - ganz.y) / ganz.h)
  })

  it('begrenzt Vergrößerung und Verkleinerung', () => {
    const p = { x: 0, y: 0 }
    expect(vergroesserung(zoomeUm(ganz, p, 1000, ganz), ganz)).toBe(MAX_ZOOM)
    expect(zoomeUm(ganz, p, 0.1, ganz)).toEqual(ganz)
  })
})

describe('verschiebe', () => {
  it('bewegt den Inhalt mit dem Finger', () => {
    const a = verschiebe(ganz, 60, -40, flaeche)
    expect(a.x).toBe(-360)
    expect(a.y).toBe(-160)
  })

  it('verschiebt im Maßstab der Vergrößerung weniger', () => {
    const nah = zoomeUm(ganz, { x: 0, y: 0 }, 2, ganz)
    expect(verschiebe(nah, 100, 0, flaeche).x).toBe(nah.x - 50)
  })
})

describe('halteImGraph', () => {
  it('lässt die Mitte nicht aus dem Graphen wandern', () => {
    const a = halteImGraph({ x: 5000, y: -5000, w: 100, h: 60 }, ganz)
    expect(a.x + a.w / 2).toBe(300)
    expect(a.y + a.h / 2).toBe(-200)
  })

  it('ändert einen Ausschnitt innerhalb nicht', () => {
    expect(halteImGraph(ganz, ganz)).toEqual(ganz)
  })
})
