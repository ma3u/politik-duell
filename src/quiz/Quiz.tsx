import { useEffect, useId, useRef, useState } from 'react'
import { Fusszeile } from '../components/Fusszeile'
import { Logo } from '../components/Logo'
import { useHash } from '../navigation'
import { QuizAnsicht } from './Ansicht'
import { useAnsicht } from '../barrierefrei'
import { ZEITFAKTOR_TEXT, type Zeitfaktor } from './punkte'
import { bereinigeName, FRAGEN_JE_SPIEL } from './spielleitung'
import type { QuizDaten } from './typen'
import { useGast, useSpielleitung } from './useSpiel'
import { VERMITTLUNG } from './netz'
import { istRaumcode, neuerRaumcode, SIGNAL_ART } from './verbindung'

// Programm-Quiz „Wer sagt Ja?“ unter #/quiz (Einladung: #/quiz/<Raumcode>). Ohne Datenbank: Die Fragen kommen
// aus public/quiz/fragen.json, das Spiel läuft zwischen den Browsern (docs/plan-quiz.md).

const MIT_ENTWUERFEN = import.meta.env.DEV || import.meta.env.VITE_QUIZ_ENTWUERFE === 'true'

const istQuizDaten = (d: unknown): d is QuizDaten =>
  !!d &&
  typeof d === 'object' &&
  typeof (d as QuizDaten).version === 'string' &&
  Array.isArray((d as QuizDaten).parteien) &&
  Array.isArray((d as QuizDaten).fragen)

async function ladeDatei(datei: string): Promise<QuizDaten | null> {
  const r = await fetch(`${import.meta.env.BASE_URL}quiz/${datei}`)
  if (!r.ok || !r.headers.get('content-type')?.includes('json')) return null
  const d: unknown = await r.json()
  return istQuizDaten(d) ? d : null
}

/** Lädt die Fragen – lokal (Entwicklung) bevorzugt die Fassung mit KI-Entwürfen, wenn es sie gibt. */
async function ladeQuiz(): Promise<QuizDaten> {
  if (MIT_ENTWUERFEN) {
    const entwurf = await ladeDatei('fragen-entwurf.json').catch(() => null)
    if (entwurf) return entwurf
  }
  const d = await ladeDatei('fragen.json')
  if (!d) throw new Error('Die Fragen konnten nicht geladen werden.')
  return d
}

const einladungAus = (hash: string) => {
  const code = /^#\/quiz\/([A-Za-z0-9]{6})$/.exec(hash)?.[1]?.toUpperCase()
  return code && istRaumcode(code) ? code : null
}

const raumLink = (code: string) => `${location.origin}${location.pathname}#/quiz/${code}`

type Modus = { art: 'start' } | { art: 'leitung'; code: string | null } | { art: 'gast'; code: string }

export function Quiz() {
  const hash = useHash()
  const einladung = einladungAus(hash)
  const [daten, setDaten] = useState<QuizDaten | null>(null)
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [zeit, setZeit] = useState<Zeitfaktor>(1)
  const [modus, setModus] = useState<Modus>({ art: 'start' })

  useEffect(() => {
    ladeQuiz()
      .then(setDaten)
      .catch((e: unknown) => setLadeFehler(e instanceof Error ? e.message : String(e)))
  }, [])

  const verlassen = () => {
    setModus({ art: 'start' })
    // Einladung aus der Adresse nehmen, damit die Startseite nicht erneut zum selben Raum einlädt.
    if (location.hash !== '#/quiz') location.hash = '#/quiz'
    scrollTo({ top: 0 })
  }

  return (
    <div className="app">
      {daten?.entwurf && (
        <div className="mock-hinweis" role="note">
          Testversion: Die meisten Fragen beruhen auf KI-Entwürfen, die noch nicht von Menschen geprüft sind. Einordnungen
          können falsch sein – bitte die Belege im Programm ansehen.
        </div>
      )}
      {SIGNAL_ART === 'lokal' && modus.art !== 'start' && modus.code !== null && (
        <div className="mock-hinweis" role="note">
          Testmodus ohne Verbindungsdienst: Räume funktionieren nur zwischen Tabs dieses Browsers.
        </div>
      )}
      <header className="kopfzeile">
        <a href="#/" className="kopfzeile-marke">
          <Logo groesse={30} />
          <span>Politik-Duell</span>
          <span className="sr-only"> – zur Startseite</span>
        </a>
        <span className="quiz-marke">Wer sagt Ja?</span>
      </header>
      {!daten ? (
        <main className="seite quiz">
          <p className="hinweis" role={ladeFehler ? 'alert' : undefined}>
            {ladeFehler ?? 'Lade Fragen …'}
          </p>
        </main>
      ) : modus.art === 'leitung' ? (
        <LeitungSpiel
          daten={daten}
          name={bereinigeName(name, 'Spielleitung')}
          code={modus.code}
          zeit={zeit}
          onVerlassen={verlassen}
        />
      ) : modus.art === 'gast' ? (
        <GastSpiel daten={daten} name={bereinigeName(name, '')} code={modus.code} onVerlassen={verlassen} />
      ) : (
        <QuizStart
          key={einladung}
          daten={daten}
          name={name}
          onName={setName}
          zeit={zeit}
          onZeit={setZeit}
          einladung={einladung}
          onEroeffnen={() => setModus({ art: 'leitung', code: neuerRaumcode() })}
          onAllein={() => setModus({ art: 'leitung', code: null })}
          onBeitreten={(code) => setModus({ art: 'gast', code })}
        />
      )}
      <Fusszeile />
    </div>
  )
}

function QuizStart({
  daten,
  name,
  onName,
  zeit,
  onZeit,
  einladung,
  onEroeffnen,
  onAllein,
  onBeitreten,
}: {
  daten: QuizDaten
  name: string
  onName: (n: string) => void
  zeit: Zeitfaktor
  onZeit: (f: Zeitfaktor) => void
  einladung: string | null
  onEroeffnen: () => void
  onAllein: () => void
  onBeitreten: (code: string) => void
}) {
  const id = useId()
  const [code, setCode] = useState(einladung ?? '')
  const codeOk = istRaumcode(code)
  const leer = daten.fragen.length === 0
  const titel = useAnsicht('Programm-Quiz')

  return (
    <main className="start quiz-start">
      <div className="start-inhalt stimmzettel">
        <div className="start-kopf">
          <div>
            <h1 className="titel" ref={titel}>
              Wer sagt Ja?
            </h1>
            <p className="slogan">Das Programm-Quiz</p>
          </div>
          <Logo groesse={72} />
        </div>
        <p className="erklaerung">
          Welche Parteien sagen in ihrem Wahlprogramm Ja? Ratet gegeneinander – wer richtig liegt, bekommt Punkte, wer
          schneller ist, mehr. Nach jeder Frage zeigt das Quiz die Stelle in jedem Programm.
        </p>
        <div className="quiz-start-felder">
        <p className="meta">
          {leer
            ? 'Noch gibt es keine vollständig geprüften Fragen.'
            : `${daten.fragen.length} ${daten.fragen.length === 1 ? 'Frage' : 'Fragen'} aus den Bundeswahlprogrammen 2025, je Spiel bis zu ${FRAGEN_JE_SPIEL}.`}
          {daten.entwurf &&
            ` Davon ${daten.fragen.filter((f) => f.ki_entwurf).length} als ungeprüfter KI-Entwurf (in der Auflösung gekennzeichnet).`}
        </p>

        <label className="label" htmlFor={`${id}-name`}>
          Dein Name im Spiel (freiwillig)
        </label>
        <input
          id={`${id}-name`}
          className="quiz-eingabe"
          value={name}
          maxLength={20}
          autoComplete="nickname"
          placeholder="z. B. Kim"
          onChange={(e) => onName(e.target.value)}
        />

        {!einladung && (
          <>
            <label className="label" htmlFor={`${id}-zeit`}>
              Zeit je Frage (für deinen Raum und zum Üben)
            </label>
            <select id={`${id}-zeit`} value={zeit} onChange={(e) => onZeit(Number(e.target.value) as Zeitfaktor)}>
              {([1, 2, 0] as const).map((f) => (
                <option key={f} value={f}>
                  {ZEITFAKTOR_TEXT[f]}
                </option>
              ))}
            </select>
          </>
        )}

        {einladung ? (
          <>
            <p className="hinweis quiz-einladung">Du bist in Raum {einladung} eingeladen.</p>
            <button type="button" className="knopf knopf-gross" disabled={leer} onClick={() => onBeitreten(einladung)}>
              Mitspielen
            </button>
          </>
        ) : (
          <>
            <div className="knopf-reihe">
              <button type="button" className="knopf" disabled={leer} onClick={onEroeffnen}>
                Raum eröffnen
              </button>
              <button type="button" className="knopf knopf-zweit" disabled={leer} onClick={onAllein}>
                Allein üben
              </button>
            </div>
            <form
              className="quiz-beitreten"
              onSubmit={(e) => {
                e.preventDefault()
                if (codeOk) onBeitreten(code)
              }}
            >
              <label className="label" htmlFor={`${id}-code`}>
                Oder mit Raumcode beitreten
              </label>
              <div className="quiz-beitreten-zeile">
                <input
                  id={`${id}-code`}
                  aria-describedby={`${id}-code-hinweis`}
                  className="quiz-eingabe quiz-code-eingabe"
                  value={code}
                  maxLength={6}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="ABC234"
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                />
                <button type="submit" className="knopf" disabled={!codeOk || leer}>
                  Beitreten
                </button>
              </div>
              <p className="meta" id={`${id}-code-hinweis`}>
                Sechs Zeichen, Buchstaben und Ziffern.
              </p>
            </form>
          </>
        )}
        </div>

        <p className="datenschutz">
          <strong>Datenschutz:</strong> Kein Konto, keine Cookies, keine KI, nichts wird gespeichert. Das Spiel läuft
          zwischen euren Geräten; {VERMITTLUNG} vermittelt nur die Verbindung und leitet weiter, wenn es direkt nicht
          klappt – Nachrichten liegen dort nur, bis sie gelesen sind. Bei einer direkten Verbindung sehen die Geräte im Raum gegenseitig ihre IP-Adresse.{' '}
          <a href="#/datenschutz">Mehr erfahren</a>
        </p>
      </div>
    </main>
  )
}

function LeitungSpiel({
  daten,
  name,
  code,
  zeit,
  onVerlassen,
}: {
  daten: QuizDaten
  name: string
  code: string | null
  zeit: Zeitfaktor
  onVerlassen: () => void
}) {
  const s = useSpielleitung(daten, name, code, zeit)
  const allein = code === null
  // Allein üben: ohne Raum gleich los.
  const gestartet = useRef(false)
  useEffect(() => {
    if (allein && !gestartet.current) {
      gestartet.current = true
      s.starten()
    }
  }, [allein, s])

  if (s.raumFehler)
    return (
      <main className="seite quiz">
        <p className="hinweis" role="alert">
          Der Raum konnte nicht eröffnet werden: {s.raumFehler}
        </p>
        <button type="button" className="knopf" onClick={onVerlassen}>
          Zurück
        </button>
      </main>
    )
  return (
    <QuizAnsicht
      daten={daten}
      z={s.z}
      ich={s.ich!}
      restMs={s.restMs}
      istLeitung
      allein={allein}
      raum={code ? { code, link: raumLink(code), bereit: s.raumBereit } : undefined}
      onAntwort={s.antworten}
      onStart={s.starten}
      onZeit={s.setzeZeit}
      onAufloesen={s.aufloesen}
      onWeiter={s.weiterGehen}
      onNochmal={() => {
        s.nochmal()
        if (allein) s.starten()
      }}
      onVerlassen={onVerlassen}
    />
  )
}

function GastSpiel({ daten, name, code, onVerlassen }: { daten: QuizDaten; name: string; code: string; onVerlassen: () => void }) {
  const s = useGast(daten, name, code)
  const zurueck = (
    <button type="button" className="knopf knopf-zweit" onClick={onVerlassen}>
      Zurück
    </button>
  )
  if (s.fehler)
    return (
      <main className="seite quiz">
        <p className="hinweis" role="alert">
          {s.fehler}
        </p>
        {zurueck}
      </main>
    )
  if (!s.z || !s.ich)
    return (
      <main className="seite quiz">
        <p className="hinweis" aria-live="polite">
          {s.status === 'getrennt' ? 'Die Verbindung ist abgebrochen.' : `Verbinde mit Raum ${code} …`}
        </p>
        {zurueck}
      </main>
    )
  return (
    <>
      {s.status === 'getrennt' && (
        <div className="mock-hinweis" role="alert">
          Die Verbindung zur Spielleitung ist abgebrochen.
        </div>
      )}
      <QuizAnsicht
        daten={daten}
        z={s.z}
        ich={s.ich}
        restMs={s.restMs}
        istLeitung={false}
        allein={false}
        onAntwort={s.antworten}
        onVerlassen={onVerlassen}
      />
    </>
  )
}
