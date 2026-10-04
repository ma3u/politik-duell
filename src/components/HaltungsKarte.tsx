import { useDaten } from '../data/kontext'
import { haltungskarte, POSITION_TEXT } from '../logic/haltung'
import { ProgrammLink } from './belege'
import { parteiStil } from './stil'

/** Einleitung, wenn die Runde eine Haltung erkennt und die Karte zeigt (docs/plan-haltungen.md, B4). */
export const HALTUNG_EINLEITUNG = 'Das ist eine Haltung – darüber kann man verschieden denken. So stehen die Parteien dazu:'

/** Testphase: Positionen, die nur als KI-Entwurf vorliegen. */
export const KI_HINWEIS_HALTUNG = 'Vorläufig: Positionen mit KI-Hilfe erfasst – noch nicht von Menschen geprüft'

/**
 * Haltungskarte (docs/plan-haltungen.md, B4): die Wertfrage, die Position jeder Partei aus ihrem Bundesprogramm
 * (Kurzfassung, Zitat zum Aufklappen, Beleg) und die Zielkonflikte beider Seiten. Ohne Punkte, ohne Ampelfarben,
 * feste Parteireihenfolge, keine Hervorhebung der gewählten Parteien (E5). Mit `onThema` endet sie mit den
 * verwandten Themen zum Antippen – ein Tipp zeigt deren Ursachen (A2).
 */
export function HaltungsKarte({ haltungId, onThema }: { haltungId: number; onThema?: (themaId: number) => void }) {
  const daten = useDaten()
  const karte = haltungskarte(daten, haltungId)
  if (!karte) return null
  const { haltung } = karte

  return (
    <section className="haltungskarte" aria-label="Haltungskarte">
      <h3>{haltung.frage}</h3>
      <p className="meta">{haltung.beschreibung}</p>

      <ul className="position-liste">
        {karte.positionen.map(({ partei, position: p }) => (
          <li key={partei.id} className="position" style={parteiStil(partei.farbe)}>
            <span className="fund-partei" title={partei.name}>
              {partei.kurzname}
            </span>
            <span className="position-wert">{POSITION_TEXT[p.position]}</span>
            {p.position === 'keine_aussage' ? (
              p.begruendung && <p className="position-text meta">{p.begruendung}</p>
            ) : (
              <>
                <p className="position-text">
                  {p.kurzfassung}{' '}
                  {p.beleg_programm_url && <ProgrammLink url={p.beleg_programm_url} land={!!p.land} />}
                </p>
                {p.zitat && (
                  <details className="position-zitat">
                    <summary>Wortlaut im Programm</summary>
                    <blockquote>„{p.zitat}“</blockquote>
                  </details>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {karte.zielkonflikte.length > 0 && (
        <div className="haltung-ziele">
          <h4>Welche Ziele gegeneinander stehen</h4>
          <ul>
            {karte.zielkonflikte.map((z, i) => (
              <li key={i}>
                {z.text}{' '}
                <span className="belege">
                  <a href={z.quelle_url} target="_blank" rel="noopener noreferrer">
                    Quelle
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onThema && karte.themen.length > 0 && (
        <div className="haltung-themen">
          <h4>Welches Alltagsproblem hängt für dich damit zusammen?</h4>
          <ul className="haltung-themen-liste">
            {karte.themen.map((t) => (
              <li key={t.id}>
                <button type="button" className="ursache-chip" onClick={() => onThema(t.id)}>
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {karte.ki_entwurf && (
        <p className="ki-hinweis" role="note">
          <strong>{KI_HINWEIS_HALTUNG}</strong>
        </p>
      )}
      <p className="meta">
        Positionen aus den Bundeswahlprogrammen, mit Wortlaut und Seite. „Keine Aussage im Programm“ heißt: Das
        Programm wurde durchsucht, eine Position dazu nicht gefunden. Über Werte entscheiden keine Studien – deshalb
        gibt es hier keine Punkte und kein Richtig oder Falsch.
      </p>
    </section>
  )
}
