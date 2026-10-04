import { useState } from 'react'
import { gesamtpunkte, gespraechsKarten, type Karte, type RundenErgebnis, type Spieler } from '../spiel'
import { ohneTreffer } from '../logic/ohneTreffer'
import { forderungskarte } from '../logic/forderung'
import { haltungskarte } from '../logic/haltung'
import { useDaten, useLandName } from '../data/kontext'
import { Belege, KI_HINWEIS, NICHT_BLIND } from './Aufloesung'
import { ForderungsKarte } from './ForderungsKarte'
import { HaltungsKarte } from './HaltungsKarte'
import { Kreuz } from './Kreuz'
import { Logo } from './Logo'
import { parteiStil } from './stil'

export function Ende({
  spieler,
  runden,
  onNeu,
}: {
  spieler: [Spieler, Spieler]
  runden: RundenErgebnis[]
  onNeu: () => void
}) {
  const [pa, pb] = gesamtpunkte(runden)
  const landName = useLandName()
  const [geteilt, setGeteilt] = useState<string | null>(null)
  const sieger = pa === pb ? null : pa > pb ? spieler[0] : spieler[1]
  const mitKi = runden.some((r) => r.ergebnisse?.some((e) => e.ki_entwurf))

  async function teilen() {
    const text =
      `Politik-Duell – ${runden.length} Alltagsprobleme geprüft. ` +
      `Ergebnis: ${spieler[0].partei.kurzname} ${pa} : ${pb} ${spieler[1].partei.kurzname}. ` +
      (mitKi ? `(Testphase – ${KI_HINWEIS}.) ` : '') +
      'Versprechen kann jeder.'
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Politik-Duell', text, url: location.href })
        return
      } catch (e) {
        // Abbruch durch Nutzer:in – nichts weiter tun. Sonst: Zwischenablage.
        if (e instanceof DOMException && e.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${location.href}`)
      setGeteilt('In die Zwischenablage kopiert.')
    } catch {
      setGeteilt(text)
    }
  }

  return (
    <main className="seite ende">
      <div className="ende-kopf">
        <Logo groesse={72} />
        <h2 className="sr-only">Endstand</h2>
        <p className="endstand">
          <span style={parteiStil(spieler[0].partei.farbe)}>{spieler[0].partei.kurzname}</span> {pa} : {pb}{' '}
          <span style={parteiStil(spieler[1].partei.farbe)}>{spieler[1].partei.kurzname}</span>
        </p>
        <p className="sieger">
          {sieger ? `${sieger.partei.name} liefert in diesem Spiel mehr – ${sieger.name} gewinnt!` : 'Unentschieden!'}
        </p>
        {mitKi && (
          <p className="ki-hinweis" role="note">
            <strong>{KI_HINWEIS}.</strong> Das Ergebnis beruht teilweise auf KI-Entwürfen aus der Testphase.
          </p>
        )}
      </div>

      <section>
        <h3>Alle Runden</h3>
        <ol className="zusammenfassung">
          {runden.map((r) => (
            <li key={r.nr}>
              <p className="zf-kopf">
                <strong>Runde {r.nr}</strong>, {spieler[r.sprecher].name}:{' '}
                {r.thema ? r.thema.name : <span className="badge-ungeprueft">ungeprüft – keine Wertung</span>}
                {r.ergebnisse?.some((e) => e.ki_entwurf) && (
                  <>
                    {' '}
                    <span className="badge-ungeprueft">{r.ergebnisse.some((e) => e.nicht_blind) ? NICHT_BLIND : 'vorläufige KI-Bewertung'}</span>
                  </>
                )}
                {r.status === 'unvollstaendig' && (
                  <>
                    {' '}
                    <span className="badge-ungeprueft">keine Wertung – Daten unvollständig</span>
                  </>
                )}
              </p>
              <p className="zf-problem">„{r.zusammenfassung}“</p>
              {r.ergebnisse && (
                <div className="zf-parteien">
                  {r.ergebnisse.map((e, i) => {
                    const leer = ohneTreffer(e, landName)
                    return (
                      <div key={e.partei.id} className="zf-partei" style={parteiStil(e.partei.farbe)}>
                        <span>
                          {e.partei.kurzname}: {e.abdeckung ? `${e.punkte} P.` : '–'} {r.punkte[i] === 1 && (
                            <>
                              <Kreuz className="kreuz-klein" />
                              <span className="sr-only">Punkt</span>
                            </>
                          )}
                        </span>
                        {leer ? <small className="zf-leer">{leer.kurz}</small> : <Belege ergebnis={e} />}
                      </div>
                    )
                  })}
                </div>
              )}
              {r.beste.length > 0 && (
                <p className="zf-beste">Beste Lösung insgesamt: {r.beste.map((b) => b.partei.kurzname).join(', ')}</p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <Gespraechskarten karten={gespraechsKarten(runden)} />

      <div className="knopf-reihe">
        <button className="knopf" onClick={teilen}>
          Teilen
        </button>
        <button className="knopf knopf-zweit" onClick={onNeu}>
          Neues Spiel
        </button>
      </div>
      {geteilt && <p className="hinweis">{geteilt}</p>}
      <p className="hinweis methode-link">
        Das Ergebnis gilt nur für die {runden.length} genannten Probleme.{' '}
        <a href="#/methode">So bewerten wir · Fehler melden</a>
      </p>
    </main>
  )
}

/**
 * „Worüber ihr gesprochen habt“ (docs/plan-haltungen.md, B5): alle Haltungs- und Forderungskarten der Partie,
 * aufklappbar – als Gesprächsanlass nach dem Spiel, ohne Punkte. Nicht im Teilen-Text: Haltungen lassen
 * politische Meinungen erkennen (Art. 9 DSGVO).
 */
function Gespraechskarten({ karten }: { karten: Karte[] }) {
  const daten = useDaten()
  // Nur Karten, die es (noch) gibt – etwa nach einem Wechsel der Daten.
  const zeigbar = karten.filter((k) =>
    k.art === 'haltung' ? haltungskarte(daten, k.haltung_id) : forderungskarte(daten, k.instrument_id, k.land),
  )
  if (!zeigbar.length) return null
  return (
    <section className="gespraechskarten">
      <h3>Worüber ihr gesprochen habt</h3>
      <p className="hinweis">Haltungen und Forderungen aus eurer Partie – ohne Punkte, zum Weiterreden.</p>
      {zeigbar.map((k) =>
        k.art === 'haltung' ? (
          <details key={`h${k.haltung_id}`} className="gespraechskarte">
            <summary>
              <span className="karten-art">Haltung</span> {haltungskarte(daten, k.haltung_id)!.haltung.frage}
            </summary>
            <HaltungsKarte haltungId={k.haltung_id} />
          </details>
        ) : (
          <details key={`f${k.instrument_id}/${k.land ?? ''}`} className="gespraechskarte">
            <summary>
              <span className="karten-art">Forderung</span> {forderungskarte(daten, k.instrument_id, k.land)!.instrument.name}
            </summary>
            <ForderungsKarte instrumentId={k.instrument_id} land={k.land} />
          </details>
        ),
      )}
    </section>
  )
}
