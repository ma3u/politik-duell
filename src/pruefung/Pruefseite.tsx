import { useCallback, useEffect, useRef, useState } from 'react'
import type { BewertungEingabe, Wert } from '../../supabase/functions/_shared/pruefung'
import { Logo } from '../components/Logo'
import { pruefEinheiten, type Pruefeinheit } from '../data/katalog'
import type { Thema, Ursache } from '../data/types'
import { UMSETZBARKEIT, WIRKSAMKEIT } from '../rechtliches/massstab'
import { Skala } from '../rechtliches/Methode'
import * as api from './api'
import { blindeReihenfolge } from './auswertung'
import { KATALOG } from './katalog'

// Prüfseite für eingeladene Prüfende (#/pruefen/<token>), Ablauf siehe
// docs/plan-pruefung.md: Einwilligung → Ziel und Maßstab → Maßnahmen ohne
// Parteinamen bewerten (eine nach der anderen) → Empfehlung erst danach →
// Fertig melden. Gespeichert wird laufend; über den Link geht es jederzeit weiter.

type Werte = Record<number, api.GeladeneBewertung>

const leer = (massnahme_id: number): api.GeladeneBewertung => ({
  massnahme_id,
  wirksamkeit: null,
  umsetzbarkeit: null,
  notiz: null,
  empfehlung_gesehen: false,
  abgesendet: false,
})

const bewertet = (b: api.GeladeneBewertung | undefined) => b?.wirksamkeit != null && b.umsetzbarkeit != null

type Stand = api.PruefStand | { fehler: string }

/** Lädt den Stand; Fehler werden zur Meldung (wirft nie). */
async function ladeStand(token: string): Promise<Stand> {
  try {
    return await api.laden(token)
  } catch (e) {
    if (e instanceof api.PruefFehler && e.status === 403)
      return { fehler: 'Dieser Link ist nicht (mehr) gültig. Bitte wende dich an die Person, die dich eingeladen hat.' }
    return { fehler: e instanceof Error ? e.message : 'Laden fehlgeschlagen.' }
  }
}

export function Pruefseite({ token }: { token: string }) {
  const [stand, setStand] = useState<Stand | null>(null)

  useEffect(() => {
    let aktiv = true
    void ladeStand(token).then((s) => aktiv && setStand(s))
    return () => {
      aktiv = false
    }
  }, [token])

  const neuLaden = useCallback(async () => setStand(await ladeStand(token)), [token])

  return (
    <div className="app pruefung">
      <header className="admin-kopf">
        <span className="admin-marke">
          <Logo groesse={36} />
          <span>Politik-Duell · Prüfung</span>
        </span>
      </header>
      {!api.pruefungVerfuegbar ? (
        <p className="admin-fehler">Keine Verbindung zum Server konfiguriert.</p>
      ) : stand === null ? (
        <p className="admin-hinweis">Lade …</p>
      ) : 'fehler' in stand ? (
        <div className="ladefehler" role="alert">
          <p>{stand.fehler}</p>
          <button className="knopf knopf-zweit" onClick={() => void neuLaden()}>
            Noch einmal versuchen
          </button>
        </div>
      ) : !stand.einwilligung ? (
        <Einwilligung token={token} stand={stand} onFertig={neuLaden} />
      ) : (
        <Bewerten token={token} stand={stand} onNeuLaden={neuLaden} />
      )}
    </div>
  )
}

const themaVon = (id: number) => KATALOG.themen.find((t) => t.id === id)
// Bewertet wird je Prüfeinheit: ein Instrument (gleicher Lösungsweg in mehreren Programmen) oder eine einzelne Maßnahme.
const massnahmenVon = (themaId: number) => blindeReihenfolge(pruefEinheiten(KATALOG, themaId))

/** Ebene, aus deren Sicht die Umsetzbarkeit bewertet wird (ein Instrument gilt nur für eine). */
function ebeneText(e: Pruefeinheit): string {
  const laender = [...new Set(e.massnahmen.map((m) => m.land).filter((l): l is string => !!l))]
  if (!laender.length) return 'Bundesebene'
  return `Landesebene (${laender.map((l) => KATALOG.laender.find((x) => x.id === l)?.name ?? l).join(', ')})`
}

function Einwilligung({ token, stand, onFertig }: { token: string; stand: api.PruefStand; onFertig: () => Promise<void> }) {
  const [ja, setJa] = useState(false)
  const [nameOeffentlich, setNameOeffentlich] = useState(stand.name_oeffentlich)
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  async function weiter() {
    setLaeuft(true)
    setFehler(null)
    try {
      await api.einwilligen(token, nameOeffentlich)
      await onFertig()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.')
      setLaeuft(false)
    }
  }

  return (
    <main className="pruef-inhalt">
      <h1>Hallo {stand.name},</h1>
      <p>
        danke, dass du mitmachst! Du bewertest Maßnahmen aus den Wahlprogrammen danach, wie stark sie ein
        Alltagsproblem lösen und wie realistisch sie sind. Die Parteien sind dabei ausgeblendet.
      </p>
      <ul className="pruef-themen">
        {stand.themen.map((id) => (
          <li key={id}>
            <strong>{themaVon(id)?.name ?? `Thema ${id}`}</strong> – {massnahmenVon(id).length} Maßnahmen, etwa 20 bis 30
            Minuten
          </li>
        ))}
      </ul>
      <p className="hinweis">
        Du kannst jederzeit unterbrechen: Alles wird automatisch gespeichert, und dieser Link bringt dich zurück. Gib
        ihn bitte nicht weiter – er ist nur für dich.
      </p>

      <section className="pruef-kasten" aria-labelledby="h-daten">
        <h2 id="h-daten">Was wir speichern</h2>
        <ul>
          <li>
            <strong>Was:</strong> je Maßnahme deine beiden Werte, deine Notizen, ob du die Empfehlung angesehen hast,
            Zeitpunkte – und deinen Namen, wie er bei der Einladung eingetragen wurde. Keine IP-Adressen, kein Konto.
          </li>
          <li>
            <strong>Wozu:</strong> Aus den Bewertungen aller Prüfenden bilden wir je Maßnahme den Median. Veröffentlicht
            werden nur Anzahl, Median, Spannweite und Datum – nie deine Einzelwerte.
          </li>
          <li>
            <strong>Wer es sieht:</strong> nur die Betreiberin des Politik-Duells. Andere Prüfende sehen deine
            Bewertungen nicht.
          </li>
          <li>
            <strong>Warum wir fragen:</strong> Bewertungen von Parteimaßnahmen können politische Haltungen erkennen
            lassen. Das sind besonders geschützte Daten (Art. 9 DSGVO).
          </li>
          <li>
            <strong>Löschen:</strong> jederzeit auf dieser Seite („Einwilligung widerrufen“) oder per E-Mail. Dann
            löschen wir alle deine Bewertungen.
          </li>
        </ul>
        <p className="hinweis">
          Mehr in der <a href="#/datenschutz">Datenschutzerklärung</a> (Abschnitt „Prüfung von Bewertungen“).
        </p>
      </section>

      <label className="pruef-haken">
        <input type="checkbox" checked={ja} onChange={(e) => setJa(e.target.checked)} />
        <span>
          <strong>Pflicht:</strong> Ich willige ein, dass meine Bewertungen wie beschrieben gespeichert und ausgewertet
          werden.
        </span>
      </label>
      <label className="pruef-haken">
        <input type="checkbox" checked={nameOeffentlich} onChange={(e) => setNameOeffentlich(e.target.checked)} />
        <span>
          <strong>Freiwillig:</strong> Mein Name darf öffentlich als Prüfer:in genannt werden (auf der Seite „So
          bewerten wir“). Ohne Häkchen steht dort nur die Zahl der Prüfenden.
        </span>
      </label>
      {fehler && (
        <p className="admin-fehler" role="alert">
          {fehler}
        </p>
      )}
      <button className="knopf knopf-gross" disabled={!ja || laeuft} onClick={() => void weiter()}>
        {laeuft ? 'Speichere …' : 'Einwilligen und loslegen'}
      </button>
    </main>
  )
}

type Speicherstatus = 'bereit' | 'speichert' | 'gespeichert' | { fehler: string }

function Bewerten({ token, stand, onNeuLaden }: { token: string; stand: api.PruefStand; onNeuLaden: () => Promise<void> }) {
  const [themaId, setThemaId] = useState(stand.themen[0])
  const [werte, setWerte] = useState<Werte>(() => Object.fromEntries(stand.bewertungen.map((b) => [b.massnahme_id, b])))
  const [status, setStatus] = useState<Speicherstatus>('bereit')
  const [absendenFehler, setAbsendenFehler] = useState<string | null>(null)
  const [sendet, setSendet] = useState(false)

  // Zwischenspeichern: geänderte Maßnahmen sammeln und kurz nach der letzten Änderung schicken.
  const werteRef = useRef(werte)
  const offen = useRef(new Set<number>())
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Speichervorgänge laufen nacheinander, damit ein älterer Stand nie einen neueren überschreibt.
  const kette = useRef<Promise<boolean>>(Promise.resolve(true))

  // Ref und Zustand immer gemeinsam setzen: Das Speichern liest den Ref, auch bevor React neu zeichnet.
  const setzeWerte = (neu: Werte) => {
    werteRef.current = neu
    setWerte(neu)
  }

  const sichern = useCallback((): Promise<boolean> => {
    clearTimeout(timer.current)
    const einmal = async () => {
      const ids = [...offen.current]
      if (!ids.length) return true
      offen.current.clear()
      setStatus('speichert')
      try {
        const liste = ids.map((id): BewertungEingabe => {
          const { massnahme_id, wirksamkeit, umsetzbarkeit, notiz, empfehlung_gesehen } = werteRef.current[id]
          return { massnahme_id, wirksamkeit, umsetzbarkeit, notiz: notiz?.trim() || null, empfehlung_gesehen }
        })
        for (let i = 0; i < liste.length; i += 50) await api.speichern(token, liste.slice(i, i + 50))
        setStatus(offen.current.size ? 'speichert' : 'gespeichert')
        return true
      } catch (e) {
        for (const id of ids) offen.current.add(id)
        setStatus({ fehler: e instanceof Error ? e.message : 'Speichern fehlgeschlagen.' })
        return false
      }
    }
    kette.current = kette.current.then(einmal)
    return kette.current
  }, [token])

  useEffect(() => {
    // Warnen, wenn beim Schließen noch etwas ungespeichert ist.
    const warnen = (e: BeforeUnloadEvent) => {
      if (offen.current.size) e.preventDefault()
    }
    const ausstehend = offen.current
    addEventListener('beforeunload', warnen)
    return () => {
      removeEventListener('beforeunload', warnen)
      // Beim Verlassen der Seite (z. B. zur Datenschutzerklärung) sofort speichern.
      if (ausstehend.size) void sichern()
    }
  }, [sichern])

  function aendern(id: number, teil: Partial<api.GeladeneBewertung>, sofort = false) {
    const vorher = werteRef.current
    setzeWerte({ ...vorher, [id]: { ...(vorher[id] ?? leer(id)), ...teil } })
    offen.current.add(id)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => void sichern(), sofort ? 0 : 800)
  }

  const thema = themaVon(themaId)
  const massnahmen = massnahmenVon(themaId)
  const ursachen = KATALOG.ursachen.filter((u) => u.thema_id === themaId)
  const fertig = massnahmen.filter((m) => bewertet(werte[m.id])).length
  const abgesendet = massnahmen.length > 0 && massnahmen.every((m) => werte[m.id]?.abgesendet)

  // Eine Maßnahme nach der anderen; Schritt = Anzahl Maßnahmen ist der Abschluss.
  // Start bei der ersten noch offenen Maßnahme – so geht es nach einer Pause dort weiter.
  const ersterOffener = (id: number) => {
    const liste = massnahmenVon(id)
    const i = liste.findIndex((m) => !bewertet(werte[m.id]))
    return i < 0 ? liste.length : i
  }
  const [schritt, setSchritt] = useState(() => ersterOffener(themaId))
  const [richtung, setRichtung] = useState<'vor' | 'zurueck'>('vor')
  const schrittRef = useRef<HTMLDivElement>(null)

  function gehe(ziel: number) {
    setRichtung(ziel < schritt ? 'zurueck' : 'vor')
    setSchritt(Math.max(0, Math.min(massnahmen.length, ziel)))
    // Neue Karte oben ansetzen, auch wenn vorher weit gescrollt wurde.
    requestAnimationFrame(() => {
      const el = schrittRef.current
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' })
    })
  }

  function themaWechseln(id: number) {
    setThemaId(id)
    setRichtung('vor')
    setSchritt(ersterOffener(id))
  }

  async function senden() {
    setSendet(true)
    setAbsendenFehler(null)
    try {
      if (!(await sichern())) throw new Error('Speichern fehlgeschlagen – bitte noch einmal versuchen.')
      await api.absenden(token, themaId)
      const neu = { ...werteRef.current }
      for (const m of massnahmen) neu[m.id] = { ...neu[m.id], abgesendet: true }
      setzeWerte(neu)
    } catch (e) {
      setAbsendenFehler(e instanceof Error ? e.message : 'Fertigmelden fehlgeschlagen.')
    } finally {
      setSendet(false)
    }
  }

  const aktuelle = massnahmen[schritt]
  const naechsterOffener = massnahmen.findIndex((m) => !bewertet(werte[m.id]))

  return (
    <main className="pruef-inhalt">
      {stand.themen.length > 1 && (
        <nav className="admin-reiter" aria-label="Themen">
          {stand.themen.map((id) => (
            <button
              key={id}
              className={id === themaId ? 'aktiv' : ''}
              aria-current={id === themaId ? 'page' : undefined}
              onClick={() => themaWechseln(id)}
            >
              {themaVon(id)?.name ?? `Thema ${id}`}
            </button>
          ))}
        </nav>
      )}

      <h1>{thema?.name ?? `Thema ${themaId}`}</h1>
      {thema && <ZielUndMassstab thema={thema} ursachen={ursachen} />}

      {massnahmen.length === 0 ? (
        <p className="admin-leer">Zu diesem Thema sind noch keine Maßnahmen erfasst.</p>
      ) : (
        <>
          <p className="pruef-pause">
            <strong>Du musst nicht alles auf einmal schaffen.</strong> Jede Angabe wird sofort gespeichert. Mach Pause,
            wann du willst: Über deinen Link geht es später an derselben Stelle weiter – auch auf einem anderen Gerät.
          </p>

          <div className="pruef-fortschritt">
            <div className="pruef-fortschritt-zeile">
              <span>
                <strong>
                  {fertig} von {massnahmen.length}
                </strong>{' '}
                bewertet
              </span>
              <SpeicherAnzeige status={status} onNochmal={() => void sichern()} />
            </div>
            <div
              className="pruef-balken"
              role="progressbar"
              aria-label="Fortschritt"
              aria-valuemin={0}
              aria-valuemax={massnahmen.length}
              aria-valuenow={fertig}
            >
              <div style={{ width: `${(fertig / massnahmen.length) * 100}%` }} />
            </div>
          </div>

          <div ref={schrittRef} className="pruef-schritt">
            {aktuelle ? (
              <MassnahmeKarte
                key={aktuelle.id}
                className={richtung === 'vor' ? 'rein-rechts' : 'rein-links'}
                kennung={`Maßnahme ${schritt + 1} von ${massnahmen.length}`}
                massnahme={aktuelle}
                ursachen={ursachen}
                wert={werte[aktuelle.id] ?? leer(aktuelle.id)}
                onAendern={(teil, sofort) => aendern(aktuelle.id, teil, sofort)}
              />
            ) : (
              <section key="abschluss" className={`pruef-kasten pruef-abschluss ${richtung === 'vor' ? 'rein-rechts' : 'rein-links'}`}>
                {abgesendet ? (
                  <>
                    <h2>Vielen Dank!</h2>
                    <p>
                      Du hast deine Bewertungen fertig gemeldet. Ändern kannst du sie trotzdem weiter, bis wir sie in den
                      Datenkatalog übernehmen – Änderungen werden automatisch gespeichert.
                    </p>
                  </>
                ) : fertig < massnahmen.length ? (
                  <>
                    <h2>Noch {massnahmen.length - fertig} offen</h2>
                    <p>
                      Alles, was du bisher bewertet hast, ist schon gespeichert. Du kannst die Seite jetzt schließen und
                      später über deinen Link weitermachen.
                    </p>
                    <button className="knopf knopf-gross" onClick={() => gehe(naechsterOffener)}>
                      Zur nächsten offenen Maßnahme
                    </button>
                  </>
                ) : (
                  <>
                    <h2>Alle {massnahmen.length} Maßnahmen bewertet</h2>
                    <p>
                      Deine Werte sind schon gespeichert. Mit „Fertig melden“ sagst du uns nur, dass wir sie auswerten
                      können. Ändern kannst du danach trotzdem noch.
                    </p>
                    <button className="knopf knopf-gross" disabled={sendet} onClick={() => void senden()}>
                      {sendet ? 'Melde …' : 'Fertig melden'}
                    </button>
                  </>
                )}
                {absendenFehler && (
                  <p className="admin-fehler" role="alert">
                    {absendenFehler}
                  </p>
                )}
              </section>
            )}
          </div>

          <div className="knopf-reihe pruef-blaettern">
            <button className="knopf knopf-zweit" disabled={schritt === 0} onClick={() => gehe(schritt - 1)}>
              ← Zurück
            </button>
            <button className="knopf" disabled={schritt >= massnahmen.length} onClick={() => gehe(schritt + 1)}>
              {schritt === massnahmen.length - 1 ? 'Zum Abschluss →' : 'Weiter →'}
            </button>
          </div>
          {aktuelle && !bewertet(werte[aktuelle.id]) && (
            <p className="hinweis pruef-mitte">Unsicher? Du kannst eine Maßnahme überspringen und später zurückkommen.</p>
          )}

          <details className="pruef-kasten pruef-uebersicht">
            <summary>Alle Maßnahmen im Überblick</summary>
            <ol className="pruef-sprung">
              {massnahmen.map((m, i) => (
                <li key={m.id}>
                  <button
                    className={`${bewertet(werte[m.id]) ? 'fertig' : ''} ${i === schritt ? 'aktuell' : ''}`}
                    aria-current={i === schritt ? 'step' : undefined}
                    aria-label={`Maßnahme ${i + 1}${bewertet(werte[m.id]) ? ', bewertet' : ', offen'}`}
                    onClick={() => gehe(i)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
            <p className="admin-klein">Ausgefüllt = bewertet. Antippen springt zur Maßnahme.</p>
          </details>
        </>
      )}

      <Einstellungen token={token} stand={stand} onNeuLaden={onNeuLaden} />
    </main>
  )
}

function SpeicherAnzeige({ status, onNochmal }: { status: Speicherstatus; onNochmal: () => void }) {
  if (status === 'bereit') return <span className="meta">Änderungen werden automatisch gespeichert.</span>
  if (status === 'speichert') return <span className="meta">Speichere …</span>
  if (status === 'gespeichert') return <span className="meta">Alles gespeichert.</span>
  return (
    <span className="admin-fehler" role="alert">
      {status.fehler}{' '}
      <button className="knopf knopf-klein knopf-leise" onClick={onNochmal}>
        Erneut speichern
      </button>
    </span>
  )
}

function ZielUndMassstab({ thema, ursachen }: { thema: Thema; ursachen: Ursache[] }) {
  return (
    <>
      {thema.ziel && (
        <div className="pruef-ziel">
          <p className="label">Ziel – daran misst sich die Wirksamkeit</p>
          <p>{thema.ziel}</p>
        </div>
      )}
      <details className="pruef-kasten pruef-massstab">
        <summary>Maßstab und Ursachen</summary>
        <h3>Wirksamkeit: Wie stark hilft die Maßnahme beim Ziel?</h3>
        <p className="hinweis">
          Nur aus Sicht der Betroffenen. Vor- und Nachteile für andere Gruppen zählen hier nicht.
        </p>
        <Skala stufen={WIRKSAMKEIT} />
        <p className="hinweis">
          Stufe 3 nur, wenn die Wirkung belegt ist (übereinstimmende Studien oder Erfahrungen anderswo). Ist die
          Forschung uneins, höchstens 2.
        </p>
        <h3>Umsetzbarkeit: Könnte die zuständige Regierung sie in einer Wahlperiode rechtlich und finanziell umsetzen?</h3>
        <p className="hinweis">
          Zuständig ist die Ebene des Programms: bei Bundesprogrammen die Bundesregierung, bei Landesprogrammen die
          Landesregierung (steht an jeder Maßnahme). Ob sie politisch mehrheitsfähig ist, spielt keine Rolle.
        </p>
        <Skala stufen={UMSETZBARKEIT} />
        <p className="hinweis">Punkte je Maßnahme = Wirksamkeit × Umsetzbarkeit (0 bis 9).</p>
        <h3>Ursachen</h3>
        <ul>
          {ursachen.map((u) => (
            <li key={u.id}>
              {u.beschreibung} ·{' '}
              <a href={u.quelle_url} target="_blank" rel="noopener noreferrer">
                Quelle
              </a>
            </li>
          ))}
        </ul>
      </details>
    </>
  )
}

function WertWahl({
  name,
  titel,
  wert,
  onWahl,
}: {
  name: string
  titel: string
  wert: Wert | null
  onWahl: (w: Wert) => void
}) {
  return (
    <fieldset className="pruef-wahl">
      <legend>{titel}</legend>
      <div className="pruef-stufen">
        {([0, 1, 2, 3] as const).map((w) => (
          <label key={w} className={wert === w ? 'gewaehlt' : ''}>
            <input type="radio" name={name} checked={wert === w} onChange={() => onWahl(w)} />
            {w}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function MassnahmeKarte({
  className,
  kennung,
  massnahme: m,
  ursachen,
  wert,
  onAendern,
}: {
  className: string
  kennung: string
  massnahme: Pruefeinheit
  ursachen: Ursache[]
  wert: api.GeladeneBewertung
  onAendern: (teil: Partial<api.GeladeneBewertung>, sofort?: boolean) => void
}) {
  const fertig = bewertet(wert)
  const ursacheText = (id: number) => ursachen.find((u) => u.id === id)?.beschreibung ?? String(id)

  return (
    <article className={`pruef-karte ${className}`}>
      <p className="pruef-kennung">{kennung}</p>
      <p className="pruef-text">{m.beschreibung}</p>
      {m.instrument && (
        <div className="admin-klein">
          <p>Dieser Lösungsweg steht in {m.massnahmen.length} Programmen, deine Bewertung gilt für alle. So heißt er dort:</p>
          <ul>
            {[...new Set(m.massnahmen.map((x) => x.beschreibung))].map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="admin-klein">
        Setzt an bei: {m.ursachen_ids.map(ursacheText).join(' · ')} · {ebeneText(m)}
      </p>
      <div className="pruef-wahlen">
        <WertWahl name={`w-${m.id}`} titel="Wirksamkeit" wert={wert.wirksamkeit} onWahl={(w) => onAendern({ wirksamkeit: w }, true)} />
        <WertWahl name={`u-${m.id}`} titel="Umsetzbarkeit" wert={wert.umsetzbarkeit} onWahl={(u) => onAendern({ umsetzbarkeit: u }, true)} />
      </div>
      <label className="pruef-notiz">
        <span className="admin-klein">Notiz (optional, z. B. Einwand oder Quelle)</span>
        <textarea
          rows={2}
          maxLength={1000}
          value={wert.notiz ?? ''}
          onChange={(e) => onAendern({ notiz: e.target.value })}
        />
      </label>
      {wert.empfehlung_gesehen ? (
        <div className="pruef-empfehlung">
          <p>
            <strong>
              Empfehlung: Wirksamkeit {m.wirksamkeit}, Umsetzbarkeit {m.umsetzbarkeit} (= {m.wirksamkeit * m.umsetzbarkeit}{' '}
              Punkte)
            </strong>
          </p>
          <p>{m.begruendung}</p>
          <p className="admin-klein">
            Übernimm sie, wenn die Begründung dich überzeugt, sonst bleib bei deinen Werten. Änderungen nach dem Ansehen
            werden vermerkt.
          </p>
        </div>
      ) : (
        <button
          className="knopf knopf-klein knopf-leise pruef-empfehlung-knopf"
          disabled={!fertig}
          onClick={() => onAendern({ empfehlung_gesehen: true }, true)}
        >
          {fertig ? 'Empfehlung ansehen' : 'Empfehlung ansehen (erst nach deiner Bewertung)'}
        </button>
      )}
    </article>
  )
}

function Einstellungen({ token, stand, onNeuLaden }: { token: string; stand: api.PruefStand; onNeuLaden: () => Promise<void> }) {
  const [nameOeffentlich, setNameOeffentlich] = useState(stand.name_oeffentlich)
  const [fehler, setFehler] = useState<string | null>(null)

  async function nennung(wert: boolean) {
    setFehler(null)
    try {
      await api.einwilligen(token, wert)
      setNameOeffentlich(wert)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.')
    }
  }

  async function widerrufen() {
    if (!confirm('Einwilligung widerrufen? Alle deine Bewertungen und Notizen werden sofort gelöscht.')) return
    setFehler(null)
    try {
      await api.widerrufen(token)
      await onNeuLaden()
    } catch (e) {
      setFehler(e instanceof Error ? e.message : 'Widerruf fehlgeschlagen.')
    }
  }

  return (
    <section className="pruef-einstellungen" aria-labelledby="h-einst">
      <h2 id="h-einst">Deine Einwilligung</h2>
      <label className="pruef-haken">
        <input type="checkbox" checked={nameOeffentlich} onChange={(e) => void nennung(e.target.checked)} />
        <span>Mein Name darf öffentlich als Prüfer:in genannt werden.</span>
      </label>
      <button className="knopf knopf-klein knopf-gefahr" onClick={() => void widerrufen()}>
        Einwilligung widerrufen und alles löschen
      </button>
      {fehler && (
        <p className="admin-fehler" role="alert">
          {fehler}
        </p>
      )}
      <p className="meta">
        <a href="#/datenschutz">Datenschutz</a> · <a href="#/methode">So bewerten wir</a>
      </p>
    </section>
  )
}
