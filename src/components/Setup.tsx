import { useState } from 'react'
import { useAnsicht } from '../barrierefrei'
import { useDaten } from '../data/kontext'
import { waehlbareLaender } from '../data/quelle'
import { ROLLEN } from '../data/rollen'
import type { Partei, Rolle } from '../data/types'
import { Kreuzfeld } from './Kreuz'
import { parteiStil } from './stil'
import type { Spieler } from '../spiel'

interface Auswahl {
  partei: Partei | null
  rolle: Rolle | null
  land: string | null
}

function SpielerWahl({
  titel,
  auswahl,
  gesperrt,
  onChange,
}: {
  titel: string
  auswahl: Auswahl
  gesperrt: Partei | null
  onChange: (a: Auswahl) => void
}) {
  const daten = useDaten()
  const { parteien } = daten
  const laender = waehlbareLaender(daten)
  return (
    <fieldset className="spieler-wahl stimmzettel">
      <legend>{titel}</legend>
      <p className="stimmzettel-anleitung">Ein Kreuz für eine Partei</p>
      <div className="partei-liste">
        {parteien.map((p) => {
          const belegt = gesperrt?.id === p.id
          const gewaehlt = auswahl.partei?.id === p.id
          return (
            <button
              key={p.id}
              type="button"
              className={`partei-zeile${gewaehlt ? ' gewaehlt' : ''}`}
              style={parteiStil(p.farbe)}
              disabled={belegt}
              aria-pressed={gewaehlt}
              onClick={() => onChange({ ...auswahl, partei: p })}
            >
              <span className="partei-zeile-name">
                {p.name}
                {belegt && <small> vergeben</small>}
              </span>
              <Kreuzfeld />
            </button>
          )
        })}
      </div>
      <label className="rolle-wahl-label" htmlFor={`${titel}-rolle`}>
        Deine Rolle im Alltag (optional)
      </label>
      <select
        id={`${titel}-rolle`}
        value={auswahl.rolle ?? ''}
        onChange={(e) => onChange({ ...auswahl, rolle: (e.target.value || null) as Rolle | null })}
      >
        <option value="">Keine Angabe</option>
        {ROLLEN.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      {laender.length > 0 && (
        <>
          <label className="rolle-wahl-label" htmlFor={`${titel}-land`}>
            Dein Bundesland (optional)
          </label>
          <select
            id={`${titel}-land`}
            value={auswahl.land ?? ''}
            onChange={(e) => onChange({ ...auswahl, land: e.target.value || null })}
          >
            <option value="">Keine Angabe – nur Bundesprogramme</option>
            {laender.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </>
      )}
    </fieldset>
  )
}

export function Setup({ onFertig }: { onFertig: (s: [Spieler, Spieler]) => void }) {
  const [a, setA] = useState<Auswahl>({ partei: null, rolle: null, land: null })
  const [b, setB] = useState<Auswahl>({ partei: null, rolle: null, land: null })
  const mitLaendern = waehlbareLaender(useDaten()).length > 0
  const bereit = a.partei && b.partei && a.partei.id !== b.partei.id
  const titel = useAnsicht('Wer tritt an?')

  return (
    <main className="seite">
      <h2 ref={titel}>Wer tritt an?</h2>
      <p className="hinweis">
        Jede Seite wählt eine andere Partei. Die Rolle beeinflusst manche Bewertungen.
        {mitLaendern && ' Mit Bundesland zählt bei Landesthemen wie Schule das Landeswahlprogramm. Gespeichert wird es nicht.'}
      </p>
      <div className="stimmzettel-paar">
        <SpielerWahl titel="Spieler:in A" auswahl={a} gesperrt={b.partei} onChange={setA} />
        <SpielerWahl titel="Spieler:in B" auswahl={b} gesperrt={a.partei} onChange={setB} />
      </div>
      <button
        className="knopf knopf-gross"
        disabled={!bereit}
        onClick={() =>
          onFertig([
            { name: 'Spieler:in A', partei: a.partei!, rolle: a.rolle, land: a.land },
            { name: 'Spieler:in B', partei: b.partei!, rolle: b.rolle, land: b.land },
          ])
        }
      >
        Los geht’s
      </button>
    </main>
  )
}
