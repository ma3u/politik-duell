import { Logo } from './Logo'

/** Sperrseite: Solange nur die geschlossene Testphase läuft, kommt man ohne Zugangslink nicht ins Spiel. */
export function Testphasesperre() {
  return (
    <main className="start">
      <div className="start-inhalt stimmzettel">
        <div className="start-kopf">
          <div>
            <h1 className="titel">Politik-Duell</h1>
            <p className="slogan">Versprechen kann jeder.</p>
          </div>
          <Logo groesse={72} />
        </div>
        <p className="erklaerung">
          Das Spiel läuft gerade als geschlossene Testphase und ist noch nicht öffentlich. Wenn du einen Zugangslink
          bekommen hast, öffne ihn bitte in diesem Browser.
        </p>
        <p className="datenschutz">
          <a href="#/impressum">Impressum</a> · <a href="#/datenschutz">Datenschutz</a> · <a href="#/methode">Methode</a>
        </p>
      </div>
    </main>
  )
}
