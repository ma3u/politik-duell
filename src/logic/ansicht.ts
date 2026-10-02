// Zoomen und Verschieben des Zusammenhangsgraphen. Der Ausschnitt ist das viewBox
// des SVG (Koordinaten im Graphen); die Funktionen rechnen Pixel der Zeichenfläche
// darin um. Das SVG zeigt den Ausschnitt mit „meet“: gleicher Maßstab in beide
// Richtungen, bei abweichendem Seitenverhältnis mittig mit Rand.

export interface Ausschnitt {
  x: number
  y: number
  w: number
  h: number
}

/** Größe der Zeichenfläche in Pixeln. */
export interface Flaeche {
  breite: number
  hoehe: number
}

/** Größtmögliche Vergrößerung gegenüber dem ganzen Graphen. */
export const MAX_ZOOM = 8

const zwischen = (wert: number, min: number, max: number) => Math.min(max, Math.max(min, wert))

/** Pixel je Einheit im Graphen. */
export const massstab = (a: Ausschnitt, f: Flaeche) => Math.min(f.breite / a.w, f.hoehe / a.h)

/** Pixel der Fläche (von deren oberer linker Ecke aus) → Punkt im Graphen. */
export function graphPunkt(a: Ausschnitt, f: Flaeche, px: number, py: number) {
  const s = massstab(a, f)
  return { x: a.x + (px - (f.breite - a.w * s) / 2) / s, y: a.y + (py - (f.hoehe - a.h * s) / 2) / s }
}

/**
 * Zoomt um einen Punkt des Graphen, der dabei an derselben Stelle bleibt. Die
 * Breite bleibt zwischen `ganz.w / MAX_ZOOM` (stärkste Vergrößerung) und `ganz.w`
 * (ganzer Graph); das Seitenverhältnis bleibt gleich.
 */
export function zoomeUm(a: Ausschnitt, punkt: { x: number; y: number }, faktor: number, ganz: Ausschnitt): Ausschnitt {
  const w = zwischen(a.w / faktor, ganz.w / MAX_ZOOM, Math.max(a.w, ganz.w))
  const f = a.w / w
  return { x: punkt.x - (punkt.x - a.x) / f, y: punkt.y - (punkt.y - a.y) / f, w, h: a.h / f }
}

/** Verschiebt den Ausschnitt um eine Strecke in Pixeln (Inhalt folgt dem Finger). */
export function verschiebe(a: Ausschnitt, dx: number, dy: number, f: Flaeche): Ausschnitt {
  const s = massstab(a, f)
  return { ...a, x: a.x - dx / s, y: a.y - dy / s }
}

/** Hält die Mitte des Ausschnitts im Bereich des ganzen Graphen, damit man ihn nicht verliert. */
export function halteImGraph(a: Ausschnitt, ganz: Ausschnitt): Ausschnitt {
  const mx = zwischen(a.x + a.w / 2, ganz.x, ganz.x + ganz.w)
  const my = zwischen(a.y + a.h / 2, ganz.y, ganz.y + ganz.h)
  return { ...a, x: mx - a.w / 2, y: my - a.h / 2 }
}

/** Wie stark ist vergrößert (1 = ganzer Graph)? */
export const vergroesserung = (a: Ausschnitt, ganz: Ausschnitt) => ganz.w / a.w
