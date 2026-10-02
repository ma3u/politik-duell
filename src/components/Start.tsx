import { useId } from 'react'
import { Kreuzfeld } from './Kreuz'
import { Logo } from './Logo'

export function Start({
  bereit,
  einverstanden,
  onEinverstanden,
  ladeFehler,
  onBeispieldaten,
  onStart,
}: {
  bereit: boolean
  einverstanden: boolean
  onEinverstanden: (ja: boolean) => void
  ladeFehler: string | null
  onBeispieldaten: () => void
  onStart: () => void
}) {
  const id = useId()
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
          Zwei Spieler:innen, zwei Parteien, fünf Runden. Nennt echte Alltagsprobleme – das Spiel zeigt, welche Partei
          dafür die wirksamste und umsetzbare Lösung bietet. Mit Beleg nach jeder Runde.
        </p>
        <p className="start-themen">
          <a href="#/themen">Welche Themen das Spiel schon kennt</a>
        </p>
        {ladeFehler ? (
          <div className="ladefehler" role="alert">
            <p>Die Spieldaten konnten nicht geladen werden ({ladeFehler}).</p>
            <button className="knopf knopf-gross" onClick={onBeispieldaten}>
              Mit Beispieldaten spielen
            </button>
          </div>
        ) : (
          <>
            {/* Ausdrückliche Einwilligung (Art. 9 DSGVO): Eingaben können politische Meinungen erkennen lassen. */}
            <label className="einwilligung" htmlFor={id}>
              <input
                id={id}
                type="checkbox"
                checked={einverstanden}
                onChange={(e) => onEinverstanden(e.target.checked)}
              />
              <span className="einwilligung-text">
                Ich bin einverstanden, dass eine KI meine Eingaben wie in der{' '}
                <a href="#/datenschutz">Datenschutzerklärung</a> beschrieben einordnet. Mir ist klar, dass sie
                politische Meinungen erkennen lassen können.
              </span>
              <Kreuzfeld />
            </label>
            <button className="knopf knopf-gross" onClick={onStart} disabled={!bereit || !einverstanden}>
              {bereit ? 'Spiel starten' : 'Lade Spieldaten …'}
            </button>
          </>
        )}
        <p className="datenschutz">
          <strong>Datenschutz:</strong> Keine Konten, keine Cookies, keine IP-Adressen, kein Audio. Deine Eingaben
          ordnet eine KI (Mistral, EU) ein. Gespeichert wird nur eine anonyme, neutrale Kurzfassung des Problems. Die
          Wortwolke im Hintergrund zeigt die Themen, die das Spiel kennt – keine Eingaben.{' '}
          <a href="#/datenschutz">Mehr erfahren</a>
        </p>
      </div>
    </main>
  )
}
