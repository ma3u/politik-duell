import { useEffect, useState } from 'react'
import { useDaten, useLandName } from '../data/kontext'
import { ROLLEN } from '../data/rollen'
import type { Massnahme } from '../data/types'
import type { ParteiErgebnis } from '../logic/bewertung'
import { ohneTreffer } from '../logic/ohneTreffer'
import type { RundenErgebnis, Spieler } from '../spiel'
import { Kreuzfeld } from './Kreuz'
import { parteiStil } from './stil'

function seitenText(url: string, land: boolean) {
  const seite = /#page=(\d+)/.exec(url)?.[1]
  const name = land ? 'Landesprogramm' : 'Programm'
  return seite ? `${name}, S. ${seite}` : name
}

const EVIDENZ_TEXT = { gemischt: 'Wirkung in der Forschung umstritten', offen: 'Wirkung bisher kaum untersucht' }


export function MassnahmeBelege({ massnahme }: { massnahme: Massnahme }) {
  return (
    <span className="belege">
      <a href={massnahme.beleg_programm_url} target="_blank" rel="noopener noreferrer">
        {seitenText(massnahme.beleg_programm_url, !!massnahme.land)}
      </a>
      {massnahme.beleg_studie_url && (
        <>
          {' · '}
          <a href={massnahme.beleg_studie_url} target="_blank" rel="noopener noreferrer">
            Studie
          </a>
        </>
      )}
    </span>
  )
}

export function Belege({ ergebnis }: { ergebnis: ParteiErgebnis }) {
  return (
    <ul className="belege-liste">
      {ergebnis.treffer.map((t) => (
        <li key={t.massnahme.id}>
          <MassnahmeBelege massnahme={t.massnahme} />
        </li>
      ))}
    </ul>
  )
}

function ParteiKarte({
  ergebnis,
  spielerName,
  gewinnt,
  verzoegerung,
}: {
  ergebnis: ParteiErgebnis
  spielerName: string
  gewinnt: boolean
  verzoegerung: number
}) {
  const { ursachen } = useDaten()
  const ursacheText = (id: number) => ursachen.find((u) => u.id === id)?.beschreibung ?? ''
  const landName = useLandName()
  const leer = ohneTreffer(ergebnis, landName)
  const programme = ergebnis.programme.length
    ? ergebnis.programme
    : [{ land: null, url: ergebnis.partei.programm_url }]
  return (
    <article
      className={`partei-karte enthuellen${gewinnt ? ' gewinnt' : ''}`}
      style={{
        ...parteiStil(ergebnis.partei.farbe),
        animationDelay: `${verzoegerung}ms`,
        // Das Kreuz der Gewinnerin wird gezogen, nachdem die Karte erschienen ist.
        ['--kreuz-verzoegerung' as string]: `${verzoegerung + 700}ms`,
      }}
    >
      <header>
        <span className="karte-spieler">{spielerName}</span>
        <h3>{ergebnis.partei.name}</h3>
        {ergebnis.abdeckung ? (
          <span className="karte-punkte" aria-label={`${ergebnis.punkte} Punkte`}>
            {ergebnis.punkte}
          </span>
        ) : (
          <span className="karte-punkte karte-punkte-leer" aria-label="keine Wertung">
            –
          </span>
        )}
        <Kreuzfeld />
      </header>
      {leer ? (
        <div className="keine-massnahme">
          {leer.badge && <span className="badge-ungeprueft">{leer.badge}</span>}
          <p>{leer.lang}</p>
          {ergebnis.abdeckung?.begruendung && <p className="keine-begruendung">{ergebnis.abdeckung.begruendung}</p>}
          <span className="belege">
            {programme.map((p, i) => (
              <span key={p.land ?? 'bund'}>
                {i > 0 && ' · '}
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.land ? `Landeswahlprogramm ${landName(p.land)}` : 'Wahlprogramm'}
                </a>
              </span>
            ))}
          </span>
        </div>
      ) : (
        ergebnis.treffer.map((t) => (
          <div key={t.massnahme.id} className="massnahme">
            <p className="massnahme-titel">{t.massnahme.beschreibung}</p>
            <p className="massnahme-werte">
              Wirksamkeit {t.massnahme.wirksamkeit}/3
              {t.rollenBonus !== 0 && ` (für deine Rolle ${t.wirksamkeit}/3)`} × Umsetzbarkeit {t.massnahme.umsetzbarkeit}/3
              {' '}= {t.punkteJeUrsache} Punkte
              {t.ursachen_ids.length > 1 && ` · × ${t.ursachen_ids.length} Ursachen`}
            </p>
            <p className="massnahme-ursachen">Setzt an bei: {t.ursachen_ids.map(ursacheText).join(', ')}</p>
            {t.massnahme.land && <p className="massnahme-ursachen">Aus dem Landeswahlprogramm {landName(t.massnahme.land)}</p>}
            {(t.massnahme.evidenz === 'gemischt' || t.massnahme.evidenz === 'offen') && (
              <p className="massnahme-rolle">{EVIDENZ_TEXT[t.massnahme.evidenz]}</p>
            )}
            <p className="massnahme-begruendung">{t.massnahme.begruendung}</p>
            {t.rollenBegruendung && <p className="massnahme-rolle">Rolle: {t.rollenBegruendung}</p>}
            <MassnahmeBelege massnahme={t.massnahme} />
          </div>
        ))
      )}
    </article>
  )
}

export function Aufloesung({
  runde,
  spieler,
  letzte,
  onWeiter,
}: {
  runde: RundenErgebnis
  spieler: [Spieler, Spieler]
  letzte: boolean
  onWeiter: () => void
}) {
  const [enthuellt, setEnthuellt] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setEnthuellt(true), 1200)
    return () => clearTimeout(t)
  }, [])

  const rolle = ROLLEN.find((r) => r.id === runde.rolle)?.label
  const landName = useLandName()
  const ohneWertung = runde.ergebnisse?.filter((e) => !e.abdeckung) ?? []
  const keinLandesprogramm = ohneWertung.filter((e) => e.fehlt?.grund === 'kein_landesprogramm')

  return (
    <main className="seite aufloesung">
      <h2 className="sr-only">Das Problem</h2>
      <blockquote className="problem-zitat">{runde.zusammenfassung}</blockquote>
      <p className="meta">
        {runde.thema ? `Thema: ${runde.thema.name}` : 'Thema nicht in der Datenbank'}
        {rolle && ` · Rolle: ${rolle}`}
        {runde.land && ` · ${landName(runde.land)}`}
      </p>

      {!enthuellt ? (
        <div className="trommelwirbel" aria-live="polite">
          <span>Wird ausgezählt …</span>
        </div>
      ) : runde.status === 'ungeprueft' || !runde.ergebnisse ? (
        <section className="ungeprueft enthuellen">
          <span className="badge-ungeprueft">ungeprüft – keine Wertung</span>
          <p>
            Zu diesem Problem liegen noch keine geprüften Daten vor. Deshalb gibt es keine Punkte und keine Links. Das
            Problem wurde zur Prüfung vorgemerkt.
          </p>
          {runde.einschaetzung && (
            <p className="einschaetzung">
              <strong>Vorläufige Einschätzung (ungeprüft):</strong> {runde.einschaetzung}
            </p>
          )}
        </section>
      ) : (
        <>
          <div className="karten">
            {runde.ergebnisse.map((e, i) => (
              <ParteiKarte
                key={e.partei.id}
                ergebnis={e}
                spielerName={spieler[i].name}
                gewinnt={runde.punkte[i] === 1}
                verzoegerung={i * 400}
              />
            ))}
          </div>
          <p className="rundensieger enthuellen" style={{ animationDelay: '900ms' }}>
            {runde.status === 'unvollstaendig'
              ? keinLandesprogramm.length
                ? `Keine Wertung: ${keinLandesprogramm.map((e) => e.partei.kurzname).join(' und ')} ${
                    keinLandesprogramm.length > 1 ? 'haben' : 'hat'
                  } in ${landName(runde.land ?? '')} kein aktuelles Landeswahlprogramm. Fehlende Daten kosten keine Partei einen Punkt.`
                : `Keine Wertung: Für ${ohneWertung
                    .map((e) => e.partei.kurzname)
                    .join(' und ')} ist dieses Thema noch nicht erfasst. Fehlende Daten kosten keine Partei einen Punkt.`
              : runde.punkte[0] === 1 && runde.punkte[1] === 1
              ? 'Gleichstand – beide bekommen einen Punkt.'
              : runde.punkte[0] === 1
                ? `Punkt für ${spieler[0].name} (${spieler[0].partei.kurzname})!`
                : runde.punkte[1] === 1
                  ? `Punkt für ${spieler[1].name} (${spieler[1].partei.kurzname})!`
                  : 'Keine der beiden Parteien hat dazu eine Maßnahme im Programm – kein Punkt.'}
          </p>
          <section className="beste enthuellen" style={{ animationDelay: '1200ms' }}>
            <h3 className="beste-titel">Beste Lösung aller Parteien</h3>
            {runde.beste.length === 0 ? (
              <p>
                {runde.nichtErfasst.length === 0
                  ? 'Keine Partei hat dazu eine Maßnahme im Programm.'
                  : 'Unter den bisher erfassten Parteien hat keine eine Maßnahme dazu.'}
              </p>
            ) : (
              runde.beste.map((b) => (
                <div key={b.partei.id} className="beste-zeile" style={parteiStil(b.partei.farbe)}>
                  <strong>{b.partei.name}</strong> mit {b.punkte} Punkten
                  {b.treffer.map((t) => (
                    <p key={t.massnahme.id} className="beste-massnahme">
                      {t.massnahme.beschreibung} <MassnahmeBelege massnahme={t.massnahme} />
                    </p>
                  ))}
                </div>
              ))
            )}
            {runde.nichtErfasst.length > 0 && (
              <p className="beste-hinweis">
                Ohne Wertung und daher nicht verglichen (noch nicht erfasst
                {runde.land ? ' oder ohne aktuelles Landeswahlprogramm' : ''}):{' '}
                {runde.nichtErfasst.map((p) => p.kurzname).join(', ')}.
              </p>
            )}
          </section>
        </>
      )}

      {enthuellt && runde.ergebnisse && (
        <p className="hinweis methode-link">
          Punkte sind eine Einschätzung nach offener Methode, kein Urteil über Parteien.{' '}
          <a href="#/methode">So bewerten wir · Fehler melden</a>
        </p>
      )}
      {enthuellt && (
        <button className="knopf knopf-gross" onClick={onWeiter}>
          {letzte ? 'Zum Endergebnis' : 'Nächste Runde'}
        </button>
      )}
    </main>
  )
}
