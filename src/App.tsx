import { useEffect, useState } from 'react'
import { Aufloesung } from './components/Aufloesung'
import { Ende } from './components/Ende'
import { Fusszeile } from './components/Fusszeile'
import { Kopfzeile } from './components/Kopfzeile'
import { MockHinweis } from './components/MockHinweis'
import { TestphaseHinweis } from './components/TestphaseHinweis'
import { Testphasesperre } from './components/Testphasesperre'
import { Themenstand } from './components/Themenstand'
import { Punktestand } from './components/Punktestand'
import { Runde } from './components/Runde'
import { Setup } from './components/Setup'
import { Start } from './components/Start'
import { DatenKontext } from './data/kontext'
import {
  gespeicherterZugang,
  ladeDaten,
  mitTestphase,
  MOCK_DATEN,
  sindBeispieldaten,
  speichereZugang,
  ZugangUngueltig,
  type Daten,
} from './data/quelle'
import { useHash, zurueck } from './navigation'
import { RUNDEN_GESAMT, type RundenErgebnis, type Spieler } from './spiel'

const NUR_TESTPHASE = import.meta.env.VITE_OFFEN !== 'true'

type Phase = 'start' | 'setup' | 'runde' | 'aufloesung' | 'ende'

export default function App() {
  const [phase, setPhase] = useState<Phase>('start')
  const [spieler, setSpieler] = useState<[Spieler, Spieler] | null>(null)
  const [runden, setRunden] = useState<RundenErgebnis[]>([])
  const [daten, setDaten] = useState<Daten | null>(null)
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const [zugangsHinweis, setZugangsHinweis] = useState<string | null>(null)
  // Nur für diese Sitzung im Speicher, damit der Weg zurück zur Startseite nicht erneut fragt.
  const [einverstanden, setEinverstanden] = useState(false)
  // Themenübersicht (#/themen): liegt über dem Spiel, damit eine laufende Partie erhalten bleibt.
  const themenSeite = useHash().startsWith('#/themen')

  useEffect(() => {
    ladeDaten()
      .then(async (d) => {
        const zugang = gespeicherterZugang()
        if (!zugang) return d
        try {
          return await mitTestphase(d, zugang)
        } catch (e) {
          // Gesperrter oder unbekannter Zugang: normal weiterspielen, nur mit geprüften Daten.
          if (e instanceof ZugangUngueltig) speichereZugang(null)
          setZugangsHinweis(e instanceof Error ? e.message : String(e))
          return d
        }
      })
      .then(setDaten)
      .catch((e: unknown) => setLadeFehler(e instanceof Error ? e.message : String(e)))
  }, [])

  const aktuelleNr = runden.length + 1
  const sprecher: 0 | 1 = runden.length % 2 === 0 ? 0 : 1

  function neuesSpiel(ziel: Phase = 'setup') {
    setSpieler(null)
    setRunden([])
    setPhase(ziel)
    scrollTo({ top: 0 })
  }

  // Nur geschlossene Testphase: Ohne gültigen Zugangslink kein Spiel. Mit VITE_OFFEN=true wieder öffentlich.
  if (NUR_TESTPHASE && daten?.quelle === 'supabase' && !daten.testphase) {
    return (
      <div className="app">
        {zugangsHinweis && (
          <div className="mock-hinweis" role="alert">
            {zugangsHinweis}
          </div>
        )}
        <Testphasesperre />
      </div>
    )
  }

  return (
    <DatenKontext.Provider value={daten ?? MOCK_DATEN}>
      {themenSeite && (
        <div className="app">
          {daten && sindBeispieldaten(daten) && <MockHinweis />}
          {daten?.testphase && <TestphaseHinweis />}
          <Themenstand daten={daten} ladeFehler={ladeFehler} onZurueck={zurueck} />
          <Fusszeile />
        </div>
      )}
      <div className="app" hidden={themenSeite}>
        {sindBeispieldaten(daten ?? MOCK_DATEN) && <MockHinweis />}
        {daten?.testphase && <TestphaseHinweis />}
        {zugangsHinweis && (
          <div className="mock-hinweis" role="alert">
            {zugangsHinweis} Es werden nur geprüfte Daten gezeigt.
          </div>
        )}
        {phase !== 'start' && (
          <Kopfzeile
            spielLaeuft={phase === 'runde' || phase === 'aufloesung'}
            onStartseite={() => neuesSpiel('start')}
            onNeuesSpiel={() => neuesSpiel('setup')}
          />
        )}
        {phase === 'start' && (
          <Start
            bereit={daten !== null}
            daten={daten}
            einverstanden={einverstanden}
            onEinverstanden={setEinverstanden}
            ladeFehler={ladeFehler}
            onBeispieldaten={() => {
              setLadeFehler(null)
              setDaten(MOCK_DATEN)
            }}
            onStart={() => setPhase('setup')}
          />
        )}
        {phase === 'setup' && (
          <Setup
            onFertig={(s) => {
              setSpieler(s)
              setPhase('runde')
            }}
          />
        )}
        {spieler && (phase === 'runde' || phase === 'aufloesung') && (
          <Punktestand
            spieler={spieler}
            runden={runden}
            aktuelleRunde={phase === 'aufloesung' ? runden.length : aktuelleNr}
          />
        )}
        {phase === 'runde' && spieler && (
          <Runde
            key={aktuelleNr}
            nr={aktuelleNr}
            sprecher={sprecher}
            spieler={spieler}
            onErgebnis={(r) => {
              setRunden((alt) => [...alt, r])
              setPhase('aufloesung')
            }}
          />
        )}
        {phase === 'aufloesung' && spieler && runden.length > 0 && (
          <Aufloesung
            runde={runden[runden.length - 1]}
            spieler={spieler}
            letzte={runden.length >= RUNDEN_GESAMT}
            onWeiter={() => setPhase(runden.length >= RUNDEN_GESAMT ? 'ende' : 'runde')}
          />
        )}
        {phase === 'ende' && spieler && <Ende spieler={spieler} runden={runden} onNeu={() => neuesSpiel()} />}
        <Fusszeile />
      </div>
    </DatenKontext.Provider>
  )
}
