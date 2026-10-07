import { BETREIBER } from '../rechtliches/betreiber'

export function Fusszeile() {
  return (
    <footer className="fusszeile">
      <a href="#/themen">Themen &amp; Zahlen</a>
      <a href="#/quiz">Quiz</a>
      <a href="#/methode">So bewerten wir</a>
      <a href="#/impressum">Impressum</a>
      <a href="#/datenschutz">Datenschutz</a>
      <a href={BETREIBER.quellcode}>Quellcode</a>
    </footer>
  )
}
