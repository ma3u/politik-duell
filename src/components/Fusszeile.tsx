import { useBewegung } from '../barrierefrei'
import { feedbackLink } from '../feedback'
import { BETREIBER } from '../rechtliches/betreiber'

export function Fusszeile() {
  const [bewegungAus, umschalten] = useBewegung()
  return (
    <footer className="fusszeile">
      <a href="#/themen">Themen &amp; Zahlen</a>
      <a href="#/quiz">Quiz</a>
      <a href="#/methode">So bewerten wir</a>
      <a href="#/impressum">Impressum</a>
      <a href="#/datenschutz">Datenschutz</a>
      <a href={BETREIBER.quellcode}>Quellcode</a>
      <a href={feedbackLink()} target="_blank" rel="noopener noreferrer">
        Feedback
      </a>
      <button type="button" aria-pressed={bewegungAus} onClick={umschalten}>
        Bewegung anhalten
      </button>
    </footer>
  )
}
