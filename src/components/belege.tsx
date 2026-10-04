import type { Massnahme } from '../data/types'

function seitenText(url: string, land: boolean) {
  const seite = /#page=(\d+)/.exec(url)?.[1]
  const name = land ? 'Landesprogramm' : 'Programm'
  return seite ? `${name}, S. ${seite}` : name
}

export const KI_HINWEIS = 'Vorläufige KI-Bewertung – noch nicht von Menschen geprüft'
/** KI-Entwurf, dessen Werte mit Kenntnis der Partei vergeben oder geändert wurden (oder vor der Blindbewertung entstanden). */
export const NICHT_BLIND = 'vorläufige Bewertung, nicht blind'

export function MassnahmeBelege({ massnahme }: { massnahme: Massnahme }) {
  return (
    <span className="belege">
      <a href={massnahme.beleg_programm_url} target="_blank" rel="noopener noreferrer">
        {seitenText(massnahme.beleg_programm_url, !!massnahme.land)}
      </a>
      {massnahme.beleg_studie_url && (
        <>
          {' · '}
          <a href={massnahme.beleg_studie_url} target="_blank" rel="noopener noreferrer">
            Studie
          </a>
        </>
      )}
    </span>
  )
}

/** Link ins Programm mit Seitenangabe („Programm, S. 12“) – etwa für Positionen in der Haltungskarte. */
export function ProgrammLink({ url, land = false }: { url: string; land?: boolean }) {
  return (
    <span className="belege">
      <a href={url} target="_blank" rel="noopener noreferrer">
        {seitenText(url, land)}
      </a>
    </span>
  )
}
