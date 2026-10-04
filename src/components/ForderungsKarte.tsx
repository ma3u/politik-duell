import { useDaten, useLandName } from '../data/kontext'
import { EVIDENZ_TEXT, forderungskarte, type Fund, type Fundblock } from '../logic/forderung'
import { KI_HINWEIS, MassnahmeBelege, NICHT_BLIND } from './belege'
import { parteiStil } from './stil'

const FUND_TEXT: Record<Fund, (ebene: 'bund' | 'land') => string> = {
  steht: (e) => (e === 'bund' ? 'steht im Bundesprogramm' : 'steht im Landesprogramm'),
  // Gesucht wurde nach Maßnahmen zu den Ursachen des Themas – „steht nicht im Programm“ wäre nicht belegt.
  nicht_gefunden: () => 'zu diesem Thema nicht gefunden',
  offen: () => 'noch nicht erfasst',
  kein_programm: () => 'kein aktuelles Landeswahlprogramm',
}

/**
 * Forderungskarte (docs/plan-haltungen.md, A3): Wer hat diesen Lösungsweg im Programm, und was sagt die
 * Forschung dazu? Ohne Punkte und ohne Hervorhebung einer Partei – eingeordnet wird der Lösungsweg, nicht die
 * Partei. Alles stammt aus der Datenbank (Instrumente, Maßnahmen, Abdeckung).
 */
export function ForderungsKarte({
  instrumentId,
  land,
  titel = 'Wer fordert das?',
}: {
  instrumentId: number
  land: string | null
  titel?: string
}) {
  const daten = useDaten()
  const landName = useLandName()
  const karte = forderungskarte(daten, instrumentId, land)
  if (!karte) return null
  const { instrument } = karte
  const blockTitel = (b: Fundblock) => (b.land ? `Landeswahlprogramme ${landName(b.land)}` : 'Bundeswahlprogramme')

  return (
    <section className="forderungskarte" aria-label="Forderungskarte">
      <h3>{titel}</h3>
      <p className="forderung-name">{instrument.name}</p>

      {karte.bloecke.map((b) => (
        <div key={b.land ?? 'bund'} className="forderung-block">
          <h4>{blockTitel(b)}</h4>
          <ul className="fund-liste">
            {b.parteien.map(({ partei, fund, massnahmen }) => (
              <li key={partei.id} className={`fund fund-${fund}`} style={parteiStil(partei.farbe)}>
                <span className="fund-partei" title={partei.name}>
                  {partei.kurzname}
                </span>
                <span className="fund-text">{FUND_TEXT[fund](b.ebene)}</span>
                {massnahmen.map((m) => (
                  <p key={m.id} className="fund-massnahme">
                    {m.beschreibung} <MassnahmeBelege massnahme={m} />
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="forderung-forschung">
        <h4>Was die Forschung sagt</h4>
        {instrument.evidenz && <p className="forderung-evidenz">{EVIDENZ_TEXT[instrument.evidenz]}</p>}
        {instrument.begruendung && <p>{instrument.begruendung}</p>}
        {instrument.beleg_studie_url && (
          <span className="belege">
            <a href={instrument.beleg_studie_url} target="_blank" rel="noopener noreferrer">
              Studie
            </a>
          </span>
        )}
      </div>

      {karte.ki_entwurf && (
        <p className="ki-hinweis" role="note">
          <strong>{KI_HINWEIS}</strong>
          {karte.nicht_blind && ` („${NICHT_BLIND}“)`}
        </p>
      )}
      <p className="meta">
        Eingeordnet wird der Lösungsweg, nicht die Partei. „Zu diesem Thema nicht gefunden“ heißt: Gesucht wurde
        nach Maßnahmen zu den Ursachen des Themas, nicht nach jeder Erwähnung im Programm. Punkte gibt es nur für
        Lösungen zu einem Alltagsproblem.
      </p>
    </section>
  )
}
