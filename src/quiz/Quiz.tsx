import { useEffect, useId, useRef, useState } from 'react'
import { Fusszeile } from '../components/Fusszeile'
import { Logo } from '../components/Logo'
import { useErstesMal } from '../components/erstesMal'
import { useHash } from '../navigation'
import { QuizAnsicht } from './Ansicht'
import { useAnsicht } from '../barrierefrei'
import { ZEITFAKTOR_TEXT, type Zeitfaktor } from './punkte'
import { pruefeText } from '../../supabase/functions/_shared/moderation'
import { gemerkt, merken, vergessen } from './merken'
import { beobachteOeffentliche, meldeOeffentlich, OEFFENTLICH_MOEGLICH, type OeffentlicherRaum } from './oeffentlich'
import { neuerRaumname, raumAusEingabe, raumPfad, type Raum } from './raumname'
import { bereinigeName, FRAGEN_JE_SPIEL } from './spielleitung'
import type { QuizDaten } from './typen'
import { useGast, useSpielleitung } from './useSpiel'
import { VERMITTLUNG } from './netz'
import { TonAufruf, TonKnopf, UntertitelLeiste } from './show/Buehne'
import { alleClips, GERAEUSCHE } from './show/texte'
import { entsperren, gemerkteTonWahl, ladeShow, melodieStoppen, startmelodie, vorladen } from './show/ton'
import { SIGNAL_ART } from './verbindung'

// Programm-Quiz „Wer sagt Ja?“ unter #/quiz (Einladung: #/quiz/<Raumname>, z. B. #/quiz/kluge-eule-27). Ohne Datenbank: Die Fragen kommen
// aus public/quiz/fragen.json, das Spiel läuft zwischen den Browsern (docs/plan-quiz.md).

const MIT_ENTWUERFEN = import.meta.env.DEV || import.meta.env.VITE_QUIZ_ENTWUERFE === 'true'
// Ist das Quiz die Startseite dieser Fassung (src/main.tsx), führt „Politik-Duell“ im Kopf zum Duell.
const QUIZ_IST_START = import.meta.env.VITE_STARTSEITE === 'quiz'

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

const einladungAus = (hash: string): Raum | null => {
  const teil = /^#\/quiz\/(.+)$/.exec(hash)?.[1]
  if (!teil) return null
  try {
    return raumAusEingabe(decodeURIComponent(teil))
  } catch {
    return null
  }
}

/** Namen, die Fremde in öffentlichen Räumen nicht sehen sollen (Beleidigung, Hetze). */
const nameAnstoessig = (name: string) => {
  const g = pruefeText(name)
  return g === 'beleidigung' || g === 'hetze'
}

/** In einer Nutzeraktion: Ton freischalten und alle Clips und Geräusche schon laden (ca. 3 MB). */
function showStarten(daten: QuizDaten) {
  melodieStoppen()
  entsperren()
  vorladen(alleClips(daten.fragen, daten.parteien), GERAEUSCHE.map((g) => g.id))
}

/** Startmelodie nur einmal je Besuch – beim ersten Tippen oder Tastendruck auf der Startseite (vorher darf kein Ton). */
let melodieGespielt = false
function useStartmelodie() {
  useEffect(() => {
    if (melodieGespielt) return
    const arten = ['pointerdown', 'keydown'] as const
    const entfernen = () => arten.forEach((a) => removeEventListener(a, los, true))
    function los(e: Event) {
      // Landet das erste Tippen auf dem Ton-Knopf oder dem Hinweis, entscheiden diese (aus: keine Musik, an: Musik).
      if (e.target instanceof Element && e.target.closest('.ton-wahl')) {
        entfernen()
        melodieGespielt = true
        return
      }
      entfernen()
      if (melodieGespielt) return
      melodieGespielt = true
      void startmelodie()
    }
    arten.forEach((a) => addEventListener(a, los, true))
    // Hat man den Ton früher ausdrücklich eingeschaltet, gleich versuchen – manche Browser erlauben das bei
    // bekannten Seiten. Sonst bleibt es beim ersten Tippen (und dem Hinweis „Mit Ton spielen?“).
    if (gemerkteTonWahl() === 'an')
      void startmelodie().then((ok) => {
        if (!ok) return
        melodieGespielt = true
        entfernen()
      })
    return entfernen
  }, [])
}

const raumLink = (r: Raum) => `${location.origin}${location.pathname}#/quiz/${raumPfad(r)}`

type Modus =
  | { art: 'start' }
  | { art: 'suche' }
  | { art: 'leitung'; raum: Raum | null; oeffentlich: boolean }
  | { art: 'gast'; raum: Raum }

export function Quiz() {
  const hash = useHash()
  // Schon beim Öffnen, nicht erst mit der fertigen Startseite: Das erste Tippen startet die Musik auch, wenn die
  // Fragen noch laden.
  useStartmelodie()
  const einladung = einladungAus(hash)
  const [daten, setDaten] = useState<QuizDaten | null>(null)
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  // „Auf diesem Gerät merken“: Name und eigener Raumname nur mit Häkchen im localStorage.
  const [anfang] = useState(gemerkt)
  const [name, setName] = useState(anfang?.name ?? '')
  const [merkenAn, setMerkenAn] = useState(anfang !== null)
  const [eigenerRaum, setEigenerRaum] = useState(() => anfang?.raum ?? neuerRaumname())
  const [zeit, setZeit] = useState<Zeitfaktor>(1)
  const [modus, setModus] = useState<Modus>({ art: 'start' })

  useEffect(() => {
    if (merkenAn) merken({ name, raum: eigenerRaum })
    else vergessen()
  }, [merkenAn, name, eigenerRaum])

  useEffect(() => {
    Promise.all([ladeQuiz(), ladeShow()])
      .then(([d]) => setDaten(d))
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
      {/* Hinweise nur auf der Startseite des Quiz – im Spiel kennzeichnet jede Auflösung Entwürfe selbst. */}
      {daten?.entwurf && modus.art === 'start' && (
        <div className="mock-hinweis" role="note">
          Testversion: Die meisten Fragen beruhen auf KI-Entwürfen, die noch nicht von Menschen geprüft sind. Einordnungen
          können falsch sein – bitte die Belege im Programm ansehen.
        </div>
      )}
      {SIGNAL_ART === 'lokal' && modus.art === 'leitung' && modus.raum !== null && (
        <div className="mock-hinweis" role="note">
          Testmodus ohne Verbindungsdienst: Räume funktionieren nur zwischen Tabs dieses Browsers.
        </div>
      )}
      <header className="kopfzeile">
        <a href="#/" className="kopfzeile-marke">
          <Logo groesse={30} />
          <span>Politik-Duell</span>
          <span className="sr-only">{QUIZ_IST_START ? ' – zum Duell' : ' – zur Startseite'}</span>
        </a>
        <span className="quiz-kopf-rechts">
          <span className="quiz-marke">Wer sagt Ja?</span>
          <TonKnopf />
        </span>
      </header>
      <TonAufruf mitMelodie={modus.art === 'start'} />
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
          raum={modus.raum}
          oeffentlich={modus.oeffentlich}
          zeit={zeit}
          onVerlassen={verlassen}
        />
      ) : modus.art === 'gast' ? (
        <GastSpiel daten={daten} name={bereinigeName(name, '')} raum={modus.raum} onVerlassen={verlassen} />
      ) : modus.art === 'suche' ? (
        <ZufallSuche
          name={name}
          onBeitreten={(raum) => {
            showStarten(daten)
            setModus({ art: 'gast', raum })
          }}
          onEroeffnen={() => {
            showStarten(daten)
            const r = raumAusEingabe(neuerRaumname())!
            setModus({ art: 'leitung', raum: r, oeffentlich: true })
          }}
          onZurueck={() => setModus({ art: 'start' })}
        />
      ) : (
        <QuizStart
          key={einladung?.code}
          daten={daten}
          name={name}
          onName={setName}
          merkenAn={merkenAn}
          onMerken={setMerkenAn}
          eigenerRaum={eigenerRaum}
          onNeuerRaum={() => setEigenerRaum(neuerRaumname())}
          zeit={zeit}
          onZeit={setZeit}
          einladung={einladung}
          onEroeffnen={() => {
            showStarten(daten)
            setModus({ art: 'leitung', raum: raumAusEingabe(eigenerRaum), oeffentlich: false })
          }}
          onAllein={() => {
            showStarten(daten)
            setModus({ art: 'leitung', raum: null, oeffentlich: false })
          }}
          onZufall={() => setModus({ art: 'suche' })}
          onBeitreten={(raum) => {
            showStarten(daten)
            setModus({ art: 'gast', raum })
          }}
        />
      )}
      <UntertitelLeiste />
      <Fusszeile />
    </div>
  )
}

function QuizStart({
  daten,
  name,
  onName,
  merkenAn,
  onMerken,
  eigenerRaum,
  onNeuerRaum,
  zeit,
  onZeit,
  einladung,
  onEroeffnen,
  onAllein,
  onZufall,
  onBeitreten,
}: {
  daten: QuizDaten
  name: string
  onName: (n: string) => void
  merkenAn: boolean
  onMerken: (an: boolean) => void
  eigenerRaum: string
  onNeuerRaum: () => void
  zeit: Zeitfaktor
  onZeit: (f: Zeitfaktor) => void
  einladung: Raum | null
  onEroeffnen: () => void
  onAllein: () => void
  onZufall: () => void
  onBeitreten: (raum: Raum) => void
}) {
  const id = useId()
  const [eingabe, setEingabe] = useState('')
  const ziel = raumAusEingabe(eingabe)
  const leer = daten.fragen.length === 0
  const titel = useAnsicht('Programm-Quiz')
  const auftritt = useErstesMal('quiz')

  return (
    <main className={auftritt ? 'start quiz-start start-auftritt' : 'start quiz-start'}>
      <div className="start-inhalt stimmzettel">
        <div className="start-kopf">
          <div>
            <h1 className="titel" ref={titel}>
              Wer sagt Ja?
            </h1>
            <p className="slogan">Das Programm-Quiz</p>
          </div>
          <Logo groesse={72} animiert={auftritt} />
        </div>
        <p className="erklaerung">
          Welche Parteien sagen in ihrem Wahlprogramm Ja? Ratet gegeneinander – wer richtig liegt, bekommt Punkte, wer
          schneller ist, mehr. Nach jeder Frage zeigt das Quiz die Stelle in jedem Programm.
        </p>
        <p className="start-themen">
          <a href="#/">Politik-Duell zu zweit: Wer liefert die beste Lösung?</a>
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
        <label className="quiz-merken" htmlFor={`${id}-merken`}>
          <input id={`${id}-merken`} type="checkbox" checked={merkenAn} onChange={(e) => onMerken(e.target.checked)} />
          Name und Raumnamen auf diesem Gerät merken
        </label>

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
            <p className="hinweis quiz-einladung">Du bist in den Raum „{einladung.name ?? einladung.code}“ eingeladen.</p>
            <button type="button" className="knopf knopf-gross" disabled={leer} onClick={() => onBeitreten(einladung)}>
              Mitspielen
            </button>
          </>
        ) : (
          <>
            <p className="quiz-eigener-raum">
              Dein Raum: <strong>{eigenerRaum}</strong>{' '}
              <button type="button" className="knopf-link" onClick={onNeuerRaum}>
                anderer Name
              </button>
            </p>
            <div className="knopf-reihe">
              <button type="button" className="knopf" disabled={leer} onClick={onEroeffnen}>
                Raum eröffnen
              </button>
              <button type="button" className="knopf knopf-zweit" disabled={leer} onClick={onAllein}>
                Allein üben
              </button>
            </div>
            {OEFFENTLICH_MOEGLICH && (
              <button type="button" className="knopf knopf-zweit knopf-gross" disabled={leer} onClick={onZufall}>
                Mit Zufälligen spielen
              </button>
            )}
            <form
              className="quiz-beitreten"
              onSubmit={(e) => {
                e.preventDefault()
                if (ziel) onBeitreten(ziel)
              }}
            >
              <label className="label" htmlFor={`${id}-code`}>
                Oder einem Raum beitreten
              </label>
              <div className="quiz-beitreten-zeile">
                <input
                  id={`${id}-code`}
                  aria-describedby={`${id}-code-hinweis`}
                  className="quiz-eingabe quiz-code-eingabe"
                  value={eingabe}
                  maxLength={40}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="z. B. Kluge Eule 27"
                  onChange={(e) => setEingabe(e.target.value)}
                />
                <button type="submit" className="knopf" disabled={!ziel || leer}>
                  Beitreten
                </button>
              </div>
              <p className="meta" id={`${id}-code-hinweis`}>
                Raumname mit Zahl, z. B. „Kluge Eule 27“ – Groß- und Kleinschreibung egal.
              </p>
            </form>
          </>
        )}
        </div>

        <p className="datenschutz">
          <strong>Datenschutz:</strong> Kein Konto, keine Cookies; gespeichert wird nur, was du mit dem Häkchen merken
          lässt, und nur auf deinem Gerät. Keine KI wertet deine Antworten aus. Mara und Ben sind KI-Stimmen (ElevenLabs), vorab aufgenommen – beim Spielen geht nichts an ElevenLabs. Das Spiel läuft
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
  raum,
  oeffentlich: oeffentlichAnfang,
  zeit,
  onVerlassen,
}: {
  daten: QuizDaten
  name: string
  raum: Raum | null
  oeffentlich: boolean
  zeit: Zeitfaktor
  onVerlassen: () => void
}) {
  const code = raum?.code ?? null
  const s = useSpielleitung(daten, name, code, zeit)
  const allein = code === null
  const [oeffentlich, setOeffentlich] = useState(oeffentlichAnfang)
  // Öffentlicher Raum: in der Liste, solange der Raum vor dem Start offen ist.
  const anmeldung = useRef<ReturnType<typeof meldeOeffentlich> | null>(null)
  const offen = oeffentlich && s.raumBereit && s.z.phase === 'lobby' && raum !== null
  useEffect(() => {
    if (!offen || !raum) return
    const a = meldeOeffentlich(raum.code, raum.name ?? raum.code, s.z.spieler.length)
    anmeldung.current = a
    return () => {
      a.abmelden()
      anmeldung.current = null
    }
    // Neu anmelden nur, wenn sich „offen“ ändert; die Spielerzahl folgt unten.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [offen, raum])
  useEffect(() => anmeldung.current?.aktualisieren(s.z.spieler.length), [s.z.spieler.length])
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
      raum={
        raum
          ? {
              code: raum.code,
              name: raum.name,
              link: raumLink(raum),
              bereit: s.raumBereit,
              oeffentlich: OEFFENTLICH_MOEGLICH ? oeffentlich : undefined,
              onOeffentlich: setOeffentlich,
            }
          : undefined
      }
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

function GastSpiel({ daten, name, raum, onVerlassen }: { daten: QuizDaten; name: string; raum: Raum; onVerlassen: () => void }) {
  const s = useGast(daten, name, raum.code)
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
          {s.status === 'getrennt' ? 'Die Verbindung ist abgebrochen.' : `Verbinde mit Raum „${raum.name ?? raum.code}“ …`}
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

/** „Mit Zufälligen spielen“: offene öffentliche Räume beitreten oder selbst einen eröffnen. */
function ZufallSuche({
  name,
  onBeitreten,
  onEroeffnen,
  onZurueck,
}: {
  name: string
  onBeitreten: (r: Raum) => void
  onEroeffnen: () => void
  onZurueck: () => void
}) {
  const titel = useAnsicht('Mit Zufälligen spielen')
  const [raeume, setRaeume] = useState<OeffentlicherRaum[] | null>(null)
  useEffect(() => beobachteOeffentliche(setRaeume), [])
  const anstoessig = nameAnstoessig(name)
  return (
    <main className="seite quiz quiz-auftritt">
      <h2 ref={titel}>Mit Zufälligen spielen</h2>
      <p className="hinweis">
        Offene Räume, in denen gerade Leute auf Mitspielende warten. Alle im Raum sehen deinen Namen im Spiel.
      </p>
      {anstoessig ? (
        <p className="hinweis" role="alert">
          Mit diesem Namen geht es in öffentlichen Räumen nicht. Bitte wähle auf der Startseite einen anderen.
        </p>
      ) : raeume === null ? (
        <p className="meta">Suche offene Räume …</p>
      ) : raeume.length === 0 ? (
        <p className="meta" aria-live="polite">
          Gerade wartet niemand. Eröffne einen öffentlichen Raum – wer als Nächstes sucht, findet dich.
        </p>
      ) : (
        <ul className="quiz-spieler quiz-oeffentlich" aria-live="polite">
          {raeume.map((r) => (
            <li key={r.code}>
              <span className="quiz-spieler-name">{r.name}</span>
              <span className="quiz-weg">{r.spieler} von 8</span>
              <button
                type="button"
                className="knopf knopf-klein"
                onClick={() => onBeitreten(raumAusEingabe(r.name) ?? { code: r.code, name: r.name })}
              >
                Beitreten
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="quiz-aktion">
        <button type="button" className="knopf knopf-gross" disabled={anstoessig} onClick={onEroeffnen}>
          Öffentlichen Raum eröffnen
        </button>
        <button type="button" className="knopf knopf-leise knopf-klein" onClick={onZurueck}>
          Zurück
        </button>
      </div>
    </main>
  )
}
