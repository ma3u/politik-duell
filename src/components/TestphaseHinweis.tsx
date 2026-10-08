import { speichereZugang } from '../data/quelle'

/** Band oben in der geschlossenen Testphase: Hier zählen auch KI-Entwürfe. */
export function TestphaseHinweis({ ohneDatenbank = false }: { ohneDatenbank?: boolean }) {
  if (ohneDatenbank)
    return (
      <div className="mock-hinweis testphase-hinweis" role="note">
        Testfassung: Viele Bewertungen sind vorläufige KI-Entwürfe, noch nicht von Menschen geprüft. Die Einordnung
        deiner Eingabe läuft hier ohne KI über eine einfache Stichwortsuche im Browser.
      </div>
    )
  return (
    <div className="mock-hinweis testphase-hinweis" role="note">
      Geschlossene Testphase: Ein Teil der Bewertungen sind vorläufige KI-Entwürfe, noch nicht von Menschen geprüft.
      Bitte nicht weiterverbreiten.{' '}
      <button
        type="button"
        className="link-knopf"
        onClick={() => {
          speichereZugang(null)
          location.reload()
        }}
      >
        Testphase verlassen
      </button>
    </div>
  )
}
