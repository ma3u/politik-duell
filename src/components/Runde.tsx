import { useState } from 'react'
import { useDaten } from '../data/kontext'
import { analysiere, AnalyseFehler, ebenenFuer, type Daten } from '../data/quelle'
import { ROLLEN } from '../data/rollen'
import type { AnalyseAntwort, Nachricht } from '../data/types'
import { besteParteien, bewertePartei, werteRunde } from '../logic/bewertung'
import { fuerBeideErfasst } from '../logic/stand'
import type { RundenErgebnis, Spieler } from '../spiel'
import { SprechKnopf } from './SprechKnopf'
import { parteiStil } from './stil'

const WERT_ANTWORT =
  'Das klingt nach einer persönlichen Haltung – die respektieren wir. Werte werden hier nicht gewertet. ' +
  'Magst du stattdessen ein konkretes Alltagsproblem nennen?'

function werteAus(
  analyse: AnalyseAntwort,
  nr: number,
  sprecher: 0 | 1,
  spieler: [Spieler, Spieler],
  daten: Daten,
): RundenErgebnis {
  const { themen, parteien, massnahmen, abdeckung } = daten
  const { rolle, land } = spieler[sprecher]
  const thema = themen.find((t) => t.id === analyse.thema_id) ?? null

  // Ohne Thema in der Datenbank: ungeprüft. Die Review-Warteschlange füllt die Edge Function.
  if (!thema) {
    return {
      nr, sprecher, rolle, land, thema: null, status: 'ungeprueft',
      zusammenfassung: analyse.zusammenfassung, einschaetzung: analyse.einschaetzung ?? null,
      ergebnisse: null, punkte: [0, 0], beste: [], nichtErfasst: [],
    }
  }

  const ebenen = ebenenFuer(daten, land)
  const ea = bewertePartei(spieler[0].partei, thema.id, analyse.ursachen_ids, rolle, massnahmen, abdeckung, ebenen)
  const eb = bewertePartei(spieler[1].partei, thema.id, analyse.ursachen_ids, rolle, massnahmen, abdeckung, ebenen)
  const { status, punkte } = werteRunde(ea, eb)
  return {
    nr, sprecher, rolle, land, thema, status,
    zusammenfassung: analyse.zusammenfassung,
    einschaetzung: null,
    ergebnisse: [ea, eb],
    punkte,
    beste: besteParteien(parteien, thema.id, analyse.ursachen_ids, rolle, massnahmen, abdeckung, ebenen),
    nichtErfasst: parteien.filter(
      (p) => !bewertePartei(p, thema.id, analyse.ursachen_ids, rolle, massnahmen, abdeckung, ebenen).abdeckung,
    ),
  }
}

export function Runde({
  nr,
  sprecher,
  spieler,
  onErgebnis,
}: {
  nr: number
  sprecher: 0 | 1
  spieler: [Spieler, Spieler]
  onErgebnis: (r: RundenErgebnis) => void
}) {
  const [verlauf, setVerlauf] = useState<Nachricht[]>([])
  const [hinweis, setHinweis] = useState<string | null>(null)
  const [eingabe, setEingabe] = useState('')
  const [denkt, setDenkt] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const daten = useDaten()

  const aktiv = spieler[sprecher]
  const rolle = ROLLEN.find((r) => r.id === aktiv.rolle)?.label
  const land = daten.laender.find((l) => l.id === aktiv.land)?.name

  async function absenden(e: { preventDefault(): void }) {
    e.preventDefault()
    const text = eingabe.trim()
    if (!text || denkt) return
    const neu: Nachricht[] = [...verlauf, { von: 'spieler', text }]
    setVerlauf(neu)
    setEingabe('')
    setHinweis(null)
    setFehler(null)
    setDenkt(true)
    let analyse: AnalyseAntwort
    try {
      analyse = await analysiere(daten, {
        verlauf: neu,
        rolle: aktiv.rolle,
        land: aktiv.land,
        parteien: [spieler[0].partei.id, spieler[1].partei.id],
      })
    } catch (err) {
      // Eingabe zurückgeben, damit sie erneut gesendet werden kann.
      setVerlauf(verlauf)
      setEingabe(text)
      setFehler(err instanceof AnalyseFehler ? err.message : 'Die Einordnung hat gerade nicht geklappt.')
      return
    } finally {
      setDenkt(false)
    }

    if (analyse.typ === 'forderung' && analyse.nachfrage) {
      setVerlauf([...neu, { von: 'ki', text: analyse.nachfrage }])
    } else if (analyse.typ === 'wert') {
      // Runde ohne Wertung – ein neues Problem kann genannt werden.
      setVerlauf([])
      setHinweis(WERT_ANTWORT)
    } else {
      onErgebnis(werteAus(analyse, nr, sprecher, spieler, daten))
    }
  }

  return (
    <main className="seite runde">
      <div className="am-zug" style={parteiStil(aktiv.partei.farbe)}>
        <span className="am-zug-label">{aktiv.partei.kurzname}</span>
        <strong>{aktiv.name} ist dran</strong>
        {rolle && <span className="rolle-chip">{rolle}</span>}
        {land && <span className="rolle-chip">{land}</span>}
      </div>
      <h2>Welches Alltagsproblem nervt dich?</h2>
      <p className="hinweis">
        Halte den Knopf gedrückt und erzähl, was in deinem Alltag konkret schiefläuft – oder tippe es ein.
      </p>
      <ThemenHinweis parteiIds={[spieler[0].partei.id, spieler[1].partei.id]} />

      <div className="verlauf" aria-live="polite">
        {hinweis && <p className="blase blase-ki">{hinweis}</p>}
        {verlauf.map((n, i) => (
          <p key={i} className={`blase blase-${n.von}`}>
            {n.text}
          </p>
        ))}
        {denkt && <p className="blase blase-ki denkt">Ich ordne das ein …</p>}
        {fehler && (
          <p className="blase blase-fehler" role="alert">
            {fehler}
          </p>
        )}
      </div>

      <SprechKnopf
        gesperrt={denkt}
        onText={(t) => setEingabe((alt) => (alt.trim() ? `${alt.trim()} ${t}` : t))}
      />
      <p className="oder" aria-hidden="true">
        oder tippen
      </p>

      <form className="eingabe" onSubmit={absenden}>
        <label htmlFor="problem" className="sr-only">
          Dein Problem
        </label>
        <textarea
          id="problem"
          rows={3}
          maxLength={500}
          placeholder="z. B. „Ich warte seit drei Monaten auf einen Termin beim Facharzt.“"
          value={eingabe}
          onChange={(e) => setEingabe(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) absenden(e)
          }}
          disabled={denkt}
        />
        <button className="knopf" type="submit" disabled={denkt || !eingabe.trim()}>
          Senden
        </button>
      </form>
    </main>
  )
}

/**
 * Welche Themen das Spiel schon kennt – damit niemand ins Leere fragt. Markiert
 * wird nur, ob ein Thema für beide Parteien ausgewertet ist, nicht für welche
 * nicht: Das verrät vor der Auflösung nichts über eine einzelne Partei.
 */
function ThemenHinweis({ parteiIds }: { parteiIds: [number, number] }) {
  const daten = useDaten()
  if (!daten.themen.length) return null
  const themen = daten.themen.map((t) => ({ ...t, bereit: fuerBeideErfasst(daten, t.id, parteiIds) }))
  const bereit = themen.filter((t) => t.bereit).length
  return (
    <details className="themen-hinweis">
      <summary>
        Welche Themen kennt das Spiel schon? ({daten.themen.length})
      </summary>
      <ul className="themen-chips">
        {themen.map((t) => (
          <li key={t.id} className={t.bereit ? 'bereit' : undefined}>
            {t.bereit && <span aria-hidden="true">✓ </span>}
            {t.name}
            {!t.bereit && <span className="sr-only"> (noch nicht für beide Parteien ausgewertet)</span>}
          </li>
        ))}
      </ul>
      <p className="meta">
        {bereit === themen.length
          ? 'Alle Themen sind für eure beiden Parteien ausgewertet.'
          : `✓ = für eure beiden Parteien ausgewertet (${bereit} von ${themen.length}). Bei den anderen wird die Runde gezeigt, aber noch nicht gewertet.`}{' '}
        Andere Probleme kannst du trotzdem nennen – dann gibt es eine Einschätzung ohne Wertung.{' '}
        <a href="#/themen">Ganze Übersicht</a>
      </p>
    </details>
  )
}
