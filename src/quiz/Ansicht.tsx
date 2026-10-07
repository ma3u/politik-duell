import { useEffect, useId, useRef, useState } from 'react'
import { useAnsicht } from '../barrierefrei'
import { ProgrammLink } from '../components/belege'
import { Kreuzfeld } from '../components/Kreuz'
import { parteiStil } from '../components/stil'
import { KI_HINWEIS_HALTUNG } from '../components/HaltungsKarte'
import { POSITION_TEXT } from '../logic/haltung'
import { anleitung } from './fragen'
import { MAX_PUNKTE, ZEITFAKTOR_TEXT, type Zeitfaktor } from './punkte'
import { limitFuer, rangliste, type Ergebnis, type QuizSpieler, type QuizZustand, type Weg } from './spielleitung'
import type { QuizDaten, QuizFrage, QuizPartei } from './typen'
import { frageVon } from './useSpiel'

// Ansichten des Quiz – für Spielleitung und Gäste gleich; nur die Knöpfe zum Weiterschalten hat die Leitung.

const WEG_TEXT: Record<Weg, string> = {
  selbst: 'Spielleitung',
  direkt: 'direkt verbunden',
  server: 'über Server',
  lokal: 'lokal (Test)',
}

const sekunden = (ms: number) => (ms / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })

export interface AnsichtProps {
  daten: QuizDaten
  z: QuizZustand
  ich: string
  restMs: number | null
  istLeitung: boolean
  allein: boolean
  onAntwort: (auswahl: number[], ms: number) => void
  onStart?: () => void
  onWeiter?: () => void
  onNochmal?: () => void
  /** Nur Spielleitung vor dem Start: Zeit je Frage (WCAG 2.2.1). */
  onZeit?: (f: Zeitfaktor) => void
  /** Nur Spielleitung ohne Zeitlimit: auflösen, auch wenn nicht alle geantwortet haben. */
  onAufloesen?: () => void
  onVerlassen: () => void
  /** Nur Spielleitung im Raum: Code und Link zum Einladen. */
  raum?: { code: string; link: string; bereit: boolean }
}

export function QuizAnsicht(p: AnsichtProps) {
  const frage = frageVon(p.daten, p.z)
  if (p.z.phase === 'lobby') return <Lobby {...p} />
  if (p.z.phase === 'ende') return <Ende {...p} />
  if (!frage) return <p className="hinweis">Diese Frage fehlt in deiner Fassung der Fragen. Bitte lade die Seite neu.</p>
  if (p.z.phase === 'frage') return <Frage key={`${p.z.fragen.join()}-${p.z.index}`} {...p} frage={frage} />
  return <Aufloesung {...p} frage={frage} />
}

function SpielerListe({ spieler, ich, mitWeg }: { spieler: QuizSpieler[]; ich: string; mitWeg: boolean }) {
  return (
    <ul className="quiz-spieler">
      {spieler.map((s) => (
        <li key={s.id} className={s.verbunden ? '' : 'getrennt'}>
          <span className="quiz-spieler-name">
            {s.name}
            {s.id === ich && ' (du)'}
          </span>
          {mitWeg && <span className="quiz-weg">{s.verbunden ? WEG_TEXT[s.weg] : 'getrennt'}</span>}
        </li>
      ))}
    </ul>
  )
}

function Lobby({ daten, z, ich, istLeitung, raum, onStart, onZeit, onVerlassen }: AnsichtProps) {
  const [kopiert, setKopiert] = useState(false)
  const titel = useAnsicht(istLeitung ? 'Dein Raum' : 'Im Raum')
  const zeitId = useId()
  const leitung = z.spieler[0]
  const fragen = Math.min(daten.fragen.length, 5)

  async function teilen() {
    if (!raum) return
    const text = `Spiel mit beim Programm-Quiz „Wer sagt Ja?“ – Raum ${raum.code}`
    try {
      if (navigator.share) await navigator.share({ title: 'Wer sagt Ja?', text, url: raum.link })
      else {
        await navigator.clipboard.writeText(raum.link)
        setKopiert(true)
      }
    } catch {
      // abgebrochen
    }
  }

  return (
    <main className="seite quiz">
      <h2 ref={titel}>{istLeitung ? 'Dein Raum' : 'Du bist im Raum'}</h2>
      {raum && (
        <div className="quiz-raum stimmzettel">
          <p className="label">Raumcode</p>
          <p className="quiz-code" aria-label={`Raumcode ${raum.code.split('').join(' ')}`}>
            {raum.code}
          </p>
          <p className="quiz-link">
            <code>{raum.link}</code>
          </p>
          <button type="button" className="knopf knopf-zweit" onClick={teilen} disabled={!raum.bereit}>
            {kopiert ? 'Link kopiert' : 'Einladen'}
          </button>
          {!raum.bereit && <p className="meta">Raum wird eröffnet …</p>}
        </div>
      )}
      <p className="label">Dabei ({z.spieler.length} von 8)</p>
      <SpielerListe spieler={z.spieler} ich={ich} mitWeg />
      {istLeitung && onZeit ? (
        <>
          <label className="label" htmlFor={zeitId}>
            Zeit je Frage
          </label>
          <select id={zeitId} value={z.zeitfaktor} onChange={(e) => onZeit(Number(e.target.value) as Zeitfaktor)}>
            {([1, 2, 0] as const).map((f) => (
              <option key={f} value={f}>
                {ZEITFAKTOR_TEXT[f]}
              </option>
            ))}
          </select>
        </>
      ) : (
        <p className="meta">Zeit je Frage: {ZEITFAKTOR_TEXT[z.zeitfaktor]}</p>
      )}
      {istLeitung ? (
        <>
          <button type="button" className="knopf knopf-gross" onClick={onStart} disabled={!raum?.bereit}>
            {z.spieler.length > 1 ? `Spiel starten (${fragen} Fragen)` : `Allein starten (${fragen} Fragen)`}
          </button>
          <p className="meta">Nach dem Start kann niemand mehr dazukommen.</p>
        </>
      ) : (
        <p className="hinweis quiz-warten">Gleich geht’s los – {leitung?.name ?? 'die Spielleitung'} startet das Spiel.</p>
      )}
      <button type="button" className="knopf knopf-leise" onClick={onVerlassen}>
        Raum verlassen
      </button>
    </main>
  )
}

function Zeitleiste({ dauer, rest }: { dauer: number; rest: number }) {
  // Screenreader: nur zwei Ansagen kurz vor Schluss statt jeder Sekunde (4.1.3).
  const ansage = rest <= 0 ? 'Zeit abgelaufen' : rest <= 5000 ? 'Noch 5 Sekunden' : rest <= 10_000 ? 'Noch 10 Sekunden' : ''
  return (
    <>
      <div className="quiz-zeit" role="timer" aria-label={`Noch ${Math.ceil(rest / 1000)} Sekunden`}>
        <div className="quiz-zeit-balken" style={{ transform: `scaleX(${Math.max(0, rest / dauer)})` }} />
        <span className="quiz-zeit-zahl" aria-hidden="true">
          {Math.ceil(rest / 1000)}
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        {ansage}
      </p>
    </>
  )
}

function Frage({ daten, z, ich, restMs, frage, istLeitung, onAntwort, onAufloesen }: AnsichtProps & { frage: QuizFrage }) {
  const titel = useAnsicht(`Frage ${z.index + 1} von ${z.fragen.length}`)
  // null = ohne Zeitlimit (WCAG 2.2.1).
  const dauer = limitFuer(z, frage)
  // Die Zeit läuft ab Anzeige auf diesem Gerät; die Restzeit kommt mit der Frage von der Spielleitung.
  const [frist] = useState(() => (dauer === null ? Infinity : Math.min(restMs ?? dauer, dauer)))
  const [rest, setRest] = useState(frist)
  const [auswahl, setAuswahl] = useState<number[]>([])
  const [abgegeben, setAbgegeben] = useState(false)
  const beginn = useRef(0)
  const auswahlRef = useRef<number[]>([])
  const abgegebenRef = useRef(false)
  const abgelaufen = rest <= 0

  function abgeben(a: number[], ms = performance.now() - beginn.current) {
    if (abgegebenRef.current) return
    abgegebenRef.current = true
    setAbgegeben(true)
    onAntwort(a, Math.round(ms))
  }

  useEffect(() => {
    const start = performance.now()
    beginn.current = start
    if (dauer === null) return
    const t = setInterval(() => {
      const r = Math.max(0, frist - (performance.now() - start))
      setRest(r)
      if (r > 0) return
      clearInterval(t)
      // Zeit um: Eine angekreuzte, aber nicht abgegebene Auswahl zählt (mit voller Zeit).
      if (auswahlRef.current.length) abgeben(auswahlRef.current, frist)
    }, 100)
    return () => clearInterval(t)
    // Nur beim Erscheinen der Frage – abgeben liest den neuesten Stand aus Refs.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const gesperrt = abgegeben || abgelaufen
  const verbunden = z.spieler.filter((s) => s.verbunden).length

  function waehle(id: number) {
    if (gesperrt) return
    const neu = frage.art === 'einzeln' ? [id] : auswahl.includes(id) ? auswahl.filter((x) => x !== id) : [...auswahl, id]
    auswahlRef.current = neu
    setAuswahl(neu)
    if (frage.art === 'einzeln') abgeben(neu)
  }

  return (
    <main className="seite quiz">
      <p className="quiz-fortschritt">
        Frage {z.index + 1} von {z.fragen.length}
      </p>
      {dauer === null ? <p className="meta">Ohne Zeitlimit</p> : <Zeitleiste dauer={dauer} rest={rest} />}
      <h2 className="quiz-frage" ref={titel}>
        {frage.frage}
      </h2>
      <p className="meta">{frage.beschreibung}</p>
      <p className="quiz-anleitung">
        {anleitung(frage)}
        {frage.art === 'einzeln' && <span className="quiz-anleitung-zusatz"> Ein Tipp auf eine Partei gibt die Antwort ab.</span>}
      </p>
      <div className="partei-liste stimmzettel quiz-wahl" role="group" aria-label="Parteien">
        {daten.parteien.map((partei) => {
          const gewaehlt = auswahl.includes(partei.id)
          return (
            <button
              key={partei.id}
              type="button"
              className={`partei-zeile${gewaehlt ? ' gewaehlt' : ''}`}
              style={parteiStil(partei.farbe)}
              aria-pressed={gewaehlt}
              disabled={gesperrt && !gewaehlt}
              onClick={() => waehle(partei.id)}
            >
              <span className="partei-zeile-name">{partei.name}</span>
              <Kreuzfeld />
            </button>
          )
        })}
      </div>
      {frage.art === 'mehrfach' && !gesperrt && (
        <button type="button" className="knopf knopf-gross" disabled={!auswahl.length} onClick={() => abgeben(auswahl)}>
          Abgeben
        </button>
      )}
      <p className="hinweis quiz-warten" aria-live="polite">
        {abgegeben
          ? verbunden > 1
            ? `Abgegeben. Warte auf die anderen (${z.beantwortet.length + (z.beantwortet.includes(ich) ? 0 : 1)} von ${verbunden}) …`
            : 'Abgegeben.'
          : abgelaufen
            ? 'Zeit abgelaufen.'
            : ''}
      </p>
      {istLeitung && dauer === null && onAufloesen && verbunden > 1 && (
        <button type="button" className="knopf knopf-zweit" onClick={onAufloesen}>
          Jetzt auflösen
        </button>
      )}
    </main>
  )
}

/** Wie eine Partei zur gesuchten Antwort steht und was das eigene Kreuz daraus macht. */
function kreuzText(frage: QuizFrage, parteiId: number, gewaehlt: boolean): { text: string; art: 'treffer' | 'daneben' | 'neutral' | 'verpasst' } | null {
  const richtig = frage.richtig.includes(parteiId)
  if (gewaehlt && richtig) return { text: '✓ dein Kreuz – Treffer', art: 'treffer' }
  if (gewaehlt && frage.neutral.includes(parteiId)) return { text: 'dein Kreuz – „teils“ zählt nicht', art: 'neutral' }
  if (gewaehlt) return { text: '✗ dein Kreuz – daneben', art: 'daneben' }
  if (richtig) return { text: 'nicht angekreuzt', art: 'verpasst' }
  return null
}

/** Alle sieben Positionen mit Beleg – feste Reihenfolge, keine Farben für Positionen (wie die Haltungskarte). */
export function Positionen({ frage, parteien, auswahl }: { frage: QuizFrage; parteien: QuizPartei[]; auswahl: number[] | null }) {
  return (
    <ul className="position-liste quiz-positionen">
      {parteien.map((partei) => {
        const p = frage.positionen.find((x) => x.partei_id === partei.id)
        if (!p) return null
        const kreuz = auswahl ? kreuzText(frage, partei.id, auswahl.includes(partei.id)) : null
        return (
          <li key={partei.id} className="position" style={parteiStil(partei.farbe)}>
            <span className="fund-partei" title={partei.name}>
              {partei.kurzname}
            </span>
            <span className="position-wert">{POSITION_TEXT[p.position]}</span>
            {kreuz && <span className={`quiz-kreuz quiz-kreuz-${kreuz.art}`}>{kreuz.text}</span>}
            {p.position === 'keine_aussage' ? (
              p.begruendung && <p className="position-text meta">{p.begruendung}</p>
            ) : (
              <>
                <p className="position-text">
                  {p.kurzfassung} {p.beleg_url && <ProgrammLink url={p.beleg_url} />}
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
        )
      })}
    </ul>
  )
}

function Zielkonflikte({ frage }: { frage: QuizFrage }) {
  if (!frage.zielkonflikte.length) return null
  return (
    <details className="quiz-ziele haltung-ziele">
      <summary>Welche Ziele gegeneinander stehen</summary>
      <ul>
        {frage.zielkonflikte.map((z, i) => (
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
    </details>
  )
}

/** Testversion: Positionen nur als KI-Entwurf erfasst, noch nicht von Menschen geprüft. */
function KiHinweis({ frage }: { frage: QuizFrage }) {
  if (!frage.ki_entwurf) return null
  return (
    <p className="ki-hinweis" role="note">
      <strong>{KI_HINWEIS_HALTUNG}</strong>
    </p>
  )
}

function MeinErgebnis({ e, frage }: { e: Ergebnis | undefined; frage: QuizFrage }) {
  if (!e || e.ms === null) return <p className="quiz-ergebnis">Keine Antwort – 0 Punkte.</p>
  const teile =
    frage.art === 'einzeln'
      ? [e.anteil === 1 ? 'richtig' : 'leider daneben']
      : [`${e.treffer} von ${frage.richtig.length} getroffen`, ...(e.fehler ? [`${e.fehler} daneben`] : [])]
  return (
    <p className="quiz-ergebnis">
      <strong>+{e.punkte} Punkte</strong> · {teile.join(', ')} · {sekunden(e.ms)} s
    </p>
  )
}

function Stand({ z, ich, letzte }: { z: QuizZustand; ich: string; letzte?: Record<string, Ergebnis> }) {
  return (
    <ol className="quiz-stand">
      {rangliste(z.spieler).map(({ spieler: s, rang }) => (
        <li key={s.id} className={`${s.id === ich ? 'ich' : ''}${s.verbunden ? '' : ' getrennt'}`}>
          <span className="quiz-rang">{rang}.</span>
          <span className="quiz-spieler-name">
            {s.name}
            {s.id === ich && ' (du)'}
          </span>
          {letzte && <span className="quiz-plus">+{letzte[s.id]?.punkte ?? 0}</span>}
          <span className="quiz-punkte">{s.punkte}</span>
        </li>
      ))}
    </ol>
  )
}

function loesungText(frage: QuizFrage, parteien: QuizPartei[]) {
  const namen = frage.richtig.map((id) => parteien.find((p) => p.id === id)?.kurzname ?? id).join(', ')
  return `${frage.gesucht === 'ja' ? 'Ja' : 'Nein'} ${frage.richtig.length === 1 ? 'sagt' : 'sagen'}: ${namen}`
}

function Aufloesung({ daten, z, ich, frage, istLeitung, allein, onWeiter }: AnsichtProps & { frage: QuizFrage }) {
  const titel = useAnsicht(`Auflösung ${z.index + 1} von ${z.fragen.length}`)
  const ergebnisse = z.verlauf[z.index]
  const mein = ergebnisse?.[ich]
  const letzte = z.index + 1 >= z.fragen.length
  return (
    <main className="seite quiz">
      <p className="quiz-fortschritt">
        Auflösung {z.index + 1} von {z.fragen.length}
      </p>
      <h2 className="quiz-frage" ref={titel}>
        {frage.frage}
      </h2>
      <p className="quiz-loesung">{loesungText(frage, daten.parteien)}</p>
      <MeinErgebnis e={mein} frage={frage} />
      <Positionen frage={frage} parteien={daten.parteien} auswahl={mein?.auswahl ?? []} />
      <Zielkonflikte frage={frage} />
      <KiHinweis frage={frage} />
      <p className="meta">
        Positionen aus den Bundeswahlprogrammen 2025 mit Wortlaut und Seite. „Keine Aussage im Programm“ heißt: Das
        Programm wurde durchsucht, eine Position dazu nicht gefunden. Punkte gibt es fürs Wissen, was im Programm
        steht – nicht für eine Meinung.
      </p>
      {!allein && (
        <>
          <p className="label">Zwischenstand</p>
          <Stand z={z} ich={ich} letzte={ergebnisse} />
        </>
      )}
      {istLeitung ? (
        <button type="button" className="knopf knopf-gross" onClick={onWeiter}>
          {letzte ? 'Zum Ergebnis' : 'Nächste Frage'}
        </button>
      ) : (
        <p className="hinweis quiz-warten">Gleich geht’s weiter – {z.spieler[0]?.name ?? 'die Spielleitung'} schaltet weiter.</p>
      )}
    </main>
  )
}

function Ende({ daten, z, ich, istLeitung, allein, onNochmal, onVerlassen }: AnsichtProps) {
  const titel = useAnsicht('Ergebnis', z.verlauf.length)
  const fragen = z.fragen.map((id) => daten.fragen.find((f) => f.id === id)).filter((f): f is QuizFrage => !!f)
  const ich_ = z.spieler.find((s) => s.id === ich)
  const max = fragen.length * MAX_PUNKTE
  const plaetze = rangliste(z.spieler)
  const sieger = plaetze.filter((p) => p.rang === 1).map((p) => p.spieler.name)
  return (
    <main className="seite quiz">
      <h2 ref={titel}>{allein ? 'Geschafft' : sieger.length > 1 ? `Gleichstand: ${sieger.join(' und ')}` : `${sieger[0]} gewinnt`}</h2>
      <p className="quiz-ergebnis">
        Du hast <strong>{ich_?.punkte ?? 0}</strong> von {max} möglichen Punkten.
      </p>
      {!allein && <Stand z={z} ich={ich} />}
      <h3 className="quiz-zf-titel">Alle Fragen mit Belegen</h3>
      {fragen.map((f, i) => {
        const e = z.verlauf[i]?.[ich]
        return (
          <details key={f.id} className="quiz-zf">
            <summary>
              <span>{f.frage}</span>
              <span className="quiz-plus">+{e?.punkte ?? 0}</span>
            </summary>
            <p className="quiz-loesung">{loesungText(f, daten.parteien)}</p>
            <Positionen frage={f} parteien={daten.parteien} auswahl={e?.auswahl ?? []} />
            <Zielkonflikte frage={f} />
            <KiHinweis frage={f} />
          </details>
        )
      })}
      <div className="knopf-reihe">
        {(istLeitung || allein) && (
          <button type="button" className="knopf" onClick={onNochmal}>
            Nochmal
          </button>
        )}
        <button type="button" className="knopf knopf-zweit" onClick={onVerlassen}>
          {istLeitung && !allein ? 'Raum schließen' : 'Quiz verlassen'}
        </button>
      </div>
      {!istLeitung && !allein && <p className="meta">Ob es noch eine Runde gibt, entscheidet die Spielleitung.</p>}
    </main>
  )
}
