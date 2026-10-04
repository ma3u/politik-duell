import { useState } from 'react'
import { MAX_AUSWAHL, type Thema, type Ursache } from '../data/types'

/** So viele Ursachen sind sofort sichtbar, der Rest hinter „weitere zeigen“. */
export const SICHTBAR = 8

/**
 * Ursachen eines erkannten Themas zum Antippen (docs/plan-haltungen.md, A2). Die gewählten
 * Ursachen gelten als Schilderung der Person und werden gewertet wie eine Zuordnung durch die KI –
 * höchstens MAX_AUSWAHL, sonst gewänne, wer zum Thema die meisten Maßnahmen hat.
 */
export function UrsachenAuswahl({
  thema,
  ursachen,
  gesperrt,
  onWaehlen,
}: {
  thema: Thema
  ursachen: Ursache[]
  gesperrt: boolean
  onWaehlen: (ids: number[]) => void
}) {
  const [gewaehlt, setGewaehlt] = useState<number[]>([])
  const [alle, setAlle] = useState(false)
  const liste = ursachen.filter((u) => u.thema_id === thema.id).sort((a, b) => a.id - b.id)
  if (!liste.length) return null
  const sichtbar = alle ? liste : liste.slice(0, SICHTBAR)
  const voll = gewaehlt.length >= MAX_AUSWAHL

  const umschalten = (id: number) =>
    setGewaehlt((g) => (g.includes(id) ? g.filter((x) => x !== id) : g.length < MAX_AUSWAHL ? [...g, id] : g))

  return (
    <fieldset className="ursachen-auswahl">
      <legend>Oder tipp an, was davon dich betrifft ({thema.name})</legend>
      <p className="meta">Höchstens {MAX_AUSWAHL}. Gewertet wird dann, wer dafür die beste Lösung hat.</p>
      <ul>
        {sichtbar.map((u) => {
          const an = gewaehlt.includes(u.id)
          return (
            <li key={u.id}>
              <button
                type="button"
                className={`ursache-chip${an ? ' gewaehlt' : ''}`}
                aria-pressed={an}
                disabled={gesperrt || (voll && !an)}
                onClick={() => umschalten(u.id)}
              >
                {u.beschreibung}
              </button>
            </li>
          )
        })}
      </ul>
      {liste.length > sichtbar.length && (
        <button type="button" className="knopf-link" onClick={() => setAlle(true)}>
          {liste.length - sichtbar.length} weitere zeigen
        </button>
      )}
      <button
        type="button"
        className="knopf knopf-zweit"
        disabled={gesperrt || gewaehlt.length === 0}
        onClick={() => onWaehlen(gewaehlt)}
      >
        {gewaehlt.length ? `Damit werten (${gewaehlt.length})` : 'Damit werten'}
      </button>
    </fieldset>
  )
}
