import { useMemo } from 'react'

const FARBEN = ['var(--stimmblau)', 'var(--kuli)', 'var(--warnung)', 'var(--gut)', '#ffffff']

/**
 * Konfettiregen für den Sieg – rein dekorativ, fällt einmal und langsam, ohne Blinken (WCAG 2.3.1).
 * Ruht bei „Bewegung anhalten“ und „Bewegung reduzieren“ (index.css).
 */
export function Konfetti({ teile = 120 }: { teile?: number }) {
  // Feste Verteilung aus dem Index statt Zufall: gleich auf allen Geräten und bei jedem Rendern.
  const liste = useMemo(
    () =>
      Array.from({ length: teile }, (_, i) => ({
        links: (i * 37) % 100,
        verzug: ((i * 53) % 100) / 28,
        dauer: 2.8 + ((i * 29) % 100) / 45,
        farbe: FARBEN[i % FARBEN.length],
        drehung: (i * 47) % 360,
        breite: 7 + (i % 3) * 2,
      })),
    [teile],
  )
  return (
    <div className="show-konfetti" aria-hidden="true">
      {liste.map((t, i) => (
        <span
          key={i}
          style={{
            left: `${t.links}%`,
            width: `${t.breite}px`,
            animationDelay: `${t.verzug}s`,
            animationDuration: `${t.dauer}s`,
            background: t.farbe,
            transform: `rotate(${t.drehung}deg)`,
          }}
        />
      ))}
    </div>
  )
}
