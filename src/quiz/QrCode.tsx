import { useMemo } from 'react'
import { create } from 'qrcode'

/**
 * QR-Code als SVG, im Browser erzeugt (Paket `qrcode`, MIT) – kein Dienst, kein Bild von außen (CSP: img-src 'self').
 * Für den Einladungslink des Raums: Mitspielende fotografieren ihn mit dem Handy ab. Der Link steht daneben auch als
 * Text, der Code ist nur eine Abkürzung (`aria-label` nennt das Ziel, nicht die Adresse).
 */
export function QrCode({ text, titel, className }: { text: string; titel: string; className?: string }) {
  const { groesse, pfad } = useMemo(() => {
    const qr = create(text, { errorCorrectionLevel: 'M' })
    const n = qr.modules.size
    const teile: string[] = []
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(y, x)) teile.push(`M${x} ${y}h1v1h-1z`)
    return { groesse: n, pfad: teile.join('') }
  }, [text])
  return (
    <svg className={className} viewBox={`0 0 ${groesse} ${groesse}`} role="img" aria-label={titel} shapeRendering="crispEdges">
      <path d={pfad} fill="#1a2233" />
    </svg>
  )
}
