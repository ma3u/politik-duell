import { useState } from 'react'
import { useDaten } from '../data/kontext'
import { analysiere, AnalyseFehler, ebenenFuer, type Daten } from '../data/quelle'
import { ROLLEN } from '../data/rollen'
import type { AnalyseAntwort, Nachricht } from '../data/types'
import { besteParteien, bewertePartei, werteRunde } from '../logic/bewertung'
import { haltungskarte } from '../logic/haltung'
import { fuerBeideErfasst } from '../logic/stand'
import { mitKarte, type Karte, type RundenErgebnis, type Spieler } from '../spiel'
import { SprechKnopf } from './SprechKnopf'
import { parteiStil } from './stil'
import { ForderungsKarte } from './ForderungsKarte'
import { HALTUNG_EINLEITUNG, HaltungsKarte } from './HaltungsKarte'
import { UrsachenAuswahl } from './UrsachenAuswahl'

/** Fester Satz zu einer Haltung, wenn die KI keine eigene Rückmeldung liefert. */
const WERT_ANTWORT =
  'Das ist eine persönliche Haltung – darüber kann man verschieden denken. ' +
  'Magst du erzählen, wo dir das im Alltag begegnet?'

/**
 * Grenze (Abwertung, Gewalt, Beleidigung): ohne Belehrung, ohne Wiedergabe, ohne Karte – nur die Einladung
 * zu einem Alltagsproblem. Die Runde läuft weiter.
 */
const GRENZE_ANTWORT = 'Darauf geht das Spiel nicht ein. Magst du ein Problem aus deinem Alltag nennen?'

/** Nach einem Pauschalurteil ohne Alltagsproblem: das Urteil nicht als „Forderung“ bestätigen. */
const PAUSCHAL_ANTWORT = 'Gewertet werden hier Lösungen für konkrete Alltagsprobleme. Magst du eins nennen?'

/**
 * Fester Satz zu einer Forderung ohne Alltagsproblem nach zwei Nachfragen (keine Wertung, neues Problem
 * möglich) – wenn die KI keine eigene Rückmeldung liefert.
 */
function forderungAntwort(themaName: string | null): string {
  return (
    'Deine Forderung haben wir verstanden' +
    (themaName ? ` – sie gehört zum Thema „${themaName}“` : '') +
    '. Gewertet werden hier Lösungen für konkrete Alltagsprobleme. Magst du eins nennen?'
  )
}

const spielerTexte = (v: Nachricht[]) => v.filter((n) => n.von === 'spieler').map((n) => n.text)

function werteAus(
  analyse: AnalyseAntwort,
  nr: number,
  sprecher: 0 | 1,
  spieler: [Spieler, Spieler],
  daten: Daten,
  forderung?: RundenErgebnis['forderung'],
  karten: Karte[] = [],
): RundenErgebnis {
  const { themen, parteien, massnahmen, abdeckung } = daten
  const { rolle, land } = spieler[sprecher]
  const thema = themen.find((t) => t.id === analyse.thema_id) ?? null

  // Ohne Thema in der Datenbank: ungeprüft. Die Review-Warteschlange füllt die Edge Function.
  if (!thema) {
    return {
      nr, sprecher, rolle, land, thema: null, status: 'ungeprueft', ...(forderung ? { forderung } : {}), ...(karten.length ? { karten } : {}),
      zusammenfassung: analyse.zusammenfassung, einschaetzung: analyse.einschaetzung ?? null,
      ergebnisse: null, punkte: [0, 0], beste: [], nichtErfasst: [],
    }
  }

  const ebenen = ebenenFuer(daten, land)
  const ea = bewertePartei(spieler[0].partei, thema.id, analyse.ursachen_ids, rolle, massnahmen, abdeckung, ebenen)
  const eb = bewertePartei(spieler[1].partei, thema.id, analyse.ursachen_ids, rolle, massnahmen, abdeckung, ebenen)
  const { status, punkte } = werteRunde(ea, eb)
  return {
    nr, sprecher, rolle, land, thema, status, ...(forderung ? { forderung } : {}), ...(karten.length ? { karten } : {}),
    ursachen_ids: analyse.ursachen_ids,
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
  /**
   * Gespräch des letzten Versuchs, der ohne Wertung endete (Haltung, Forderung, Grenze): bleibt oben stehen,
   * damit man sieht, was man eingegeben hat – bis zur nächsten Eingabe. Geht nicht an die KI.
   */
  const [vorher, setVorher] = useState<Nachricht[]>([])
  const [hinweis, setHinweis] = useState<string | null>(null)
  const [eingabe, setEingabe] = useState('')
  const [denkt, setDenkt] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  /** Thema, dessen Ursachen gerade zum Antippen angeboten werden (bei einer offenen Nachfrage). */
  const [auswahlThema, setAuswahlThema] = useState<number | null>(null)
  /**
   * Neutrale Zusammenfassung der KI zu einem geschilderten Problem – für die Anzeige nach einer Auswahl.
   * Bei einer Forderung bleibt sie leer: Dann steht das Thema mit den gewählten Ursachen als Problem da.
   */
  const [zusammenfassung, setZusammenfassung] = useState<string | null>(null)
  /**
   * Lösungsweg, dem die genannte Forderung entspricht (Forderungskarte, ohne Punkte). Bleibt für den Rest der
   * Runde: Wird danach ein Problem gewertet, erscheint die Karte zusätzlich in der Auflösung.
   */
  const [forderung, setForderung] = useState<{ instrument_id: number; thema_id: number } | null>(null)
  const [karteOffen, setKarteOffen] = useState(false)
  /** Haltung, deren Karte gerade unter dem Verlauf steht (bis zur nächsten Eingabe). */
  const [haltung, setHaltung] = useState<number | null>(null)
  /** Höchstens eine Haltungskarte je Runde (B4) – sonst würden fünf Runden zu fünf Haltungsdebatten. */
  const [haltungGezeigt, setHaltungGezeigt] = useState(false)
  /** Karten dieser Runde (ohne Punkte) für den Endbildschirm. */
  const [karten, setKarten] = useState<Karte[]>([])
  const daten = useDaten()

  const aktiv = spieler[sprecher]
  const rolle = ROLLEN.find((r) => r.id === aktiv.rolle)?.label
  const land = daten.laender.find((l) => l.id === aktiv.land)?.name

  async function absenden(e: { preventDefault(): void }) {
    e.preventDefault()
    const text = eingabe.trim()
    if (!text || denkt) return
    const neu: Nachricht[] = [...verlauf, { von: 'spieler', text }]
    const vorherAlt = vorher
    setVerlauf(neu)
    setVorher([])
    setEingabe('')
    setHinweis(null)
    setFehler(null)
    setAuswahlThema(null)
    setHaltung(null)
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
      setVorher(vorherAlt)
      setEingabe(text)
      setFehler(err instanceof AnalyseFehler ? err.message : 'Die Einordnung hat gerade nicht geklappt.')
      return
    } finally {
      setDenkt(false)
    }

    // Forderungskarte nur, wenn die Forderung eindeutig einem bekannten Lösungsweg entspricht.
    // Eine Haltung („wert“) setzt sie zurück; ein Problem lässt sie unverändert.
    let rundenKarten = karten
    if (analyse.typ === 'forderung') {
      const bekannt = analyse.instrument_id != null && daten.instrumente.some((i) => i.id === analyse.instrument_id)
      setForderung(bekannt && analyse.thema_id !== null ? { instrument_id: analyse.instrument_id!, thema_id: analyse.thema_id } : null)
      // Nach der letzten Nachfrage („Forderung bleibt“) zeigt die Runde die Karte gleich.
      setKarteOffen(bekannt && !analyse.nachfrage)
      if (bekannt && analyse.thema_id !== null)
        rundenKarten = mitKarte(rundenKarten, { art: 'forderung', instrument_id: analyse.instrument_id!, land: aktiv.land })
    } else if (analyse.typ === 'wert' || analyse.typ === 'grenze') {
      setForderung(null)
      setKarteOffen(false)
    }

    if (analyse.typ === 'grenze') {
      // Die Runde beginnt von vorn; die eigene Eingabe bleibt zum Nachlesen stehen (die Antwort gibt sie nicht wieder).
      setVerlauf([])
      setVorher(neu)
      setZusammenfassung(null)
      setHinweis(GRENZE_ANTWORT)
      return
    }

    // Nachfrage bei einer Forderung oder wenn keine Ursache erkennbar ist – mit erkanntem Thema
    // zusätzlich dessen Ursachen zum Antippen (nicht bei Pauschalurteilen über Gruppen).
    if (analyse.nachfrage) {
      setVerlauf([...neu, { von: 'ki', text: analyse.nachfrage }])
      setAuswahlThema(analyse.pauschal ? null : analyse.thema_id)
      setZusammenfassung(analyse.typ === 'problem' ? analyse.zusammenfassung || null : null)
    } else if (analyse.typ === 'wert' || analyse.typ === 'forderung') {
      // Runde ohne Wertung – ein neues Problem kann genannt werden.
      const thema = daten.themen.find((t) => t.id === analyse.thema_id)?.name ?? null
      setVerlauf([])
      setVorher(neu)
      setZusammenfassung(null)
      // Haltung zu einer vollständig erfassten Wertfrage: die Haltungskarte (einmal je Runde), sonst ein Satz.
      const karte =
        analyse.typ === 'wert' && analyse.haltung_id != null && !haltungGezeigt && haltungskarte(daten, analyse.haltung_id)
          ? analyse.haltung_id
          : null
      if (karte !== null) {
        setHaltung(karte)
        setHaltungGezeigt(true)
        rundenKarten = mitKarte(rundenKarten, { art: 'haltung', haltung_id: karte })
        setHinweis(HALTUNG_EINLEITUNG)
      } else {
        // Die KI greift die Äußerung auf; ohne brauchbare Rückmeldung (oder bei Pauschalurteilen) ein fester Satz.
        setHinweis(
          analyse.rueckmeldung ||
            (analyse.typ === 'wert' ? WERT_ANTWORT : analyse.pauschal ? PAUSCHAL_ANTWORT : forderungAntwort(thema)),
        )
      }
    } else {
      onErgebnis({ ...werteAus(analyse, nr, sprecher, spieler, daten, forderung ?? undefined, rundenKarten), eingaben: spielerTexte(neu) })
    }
    setKarten(rundenKarten)
  }

  /** Angetippte Ursachen werten: ohne KI, die Edge Function speichert die Runde. */
  async function auswaehlen(themaId: number, ursachenIds: number[]) {
    if (denkt) return
    setFehler(null)
    setDenkt(true)
    let analyse: AnalyseAntwort
    try {
      analyse = await analysiere(daten, {
        verlauf: [],
        rolle: aktiv.rolle,
        land: aktiv.land,
        parteien: [spieler[0].partei.id, spieler[1].partei.id],
        auswahl: { thema_id: themaId, ursachen_ids: ursachenIds },
      })
    } catch (err) {
      setFehler(err instanceof AnalyseFehler ? err.message : 'Die Wertung hat gerade nicht geklappt.')
      return
    } finally {
      setDenkt(false)
    }
    // Angetippt nach einer Nachfrage: das bisherige Gespräch; nach einer Haltungskarte: die Haltung davor.
    const eingaben = spielerTexte(verlauf.length ? verlauf : vorher)
    onErgebnis({
      ...werteAus(
        { ...analyse, zusammenfassung: zusammenfassung ?? analyse.zusammenfassung },
        nr, sprecher, spieler, daten, forderung ?? undefined, karten,
      ),
      ...(eingaben.length ? { eingaben } : {}),
    })
  }

  const angebot = daten.themen.find((t) => t.id === auswahlThema) ?? null

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
        {vorher.map((n, i) => (
          <p key={`v${i}`} className={`blase blase-${n.von}`}>
            {n.text}
          </p>
        ))}
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

      {haltung !== null && (
        <HaltungsKarte
          haltungId={haltung}
          onThema={(id) => {
            // Ein Tipp füllt das Eingabefeld nicht vor, sondern zeigt die Ursachen des Themas zum Antippen (A2).
            setAuswahlThema(id)
            setZusammenfassung(null)
          }}
        />
      )}

      {angebot && (
        <UrsachenAuswahl
          key={`${angebot.id}-${verlauf.length}`}
          thema={angebot}
          ursachen={daten.ursachen}
          gesperrt={denkt}
          onWaehlen={(ids) => auswaehlen(angebot.id, ids)}
        />
      )}

      {forderung && (
        <div className="forderung-knopf">
          {!karteOffen && (
            <button type="button" className="knopf knopf-zweit" onClick={() => setKarteOffen(true)}>
              Zeig mir, wer das fordert
            </button>
          )}
          {karteOffen && (
            <>
              <ForderungsKarte instrumentId={forderung.instrument_id} land={aktiv.land} />
              <button type="button" className="knopf-link" onClick={() => setKarteOffen(false)}>
                Karte ausblenden
              </button>
            </>
          )}
        </div>
      )}

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
