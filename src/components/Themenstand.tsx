import { useEffect, useState } from 'react'
import type { Daten } from '../data/quelle'
import { statistik, themenStand, type Erfassung, type ThemaStand } from '../logic/stand'
import { BETREIBER } from '../rechtliches/betreiber'
import { Logo } from './Logo'
import { parteiStil } from './stil'

// Übersicht unter #/themen: welche Themen das Spiel kennt, wie weit die Programme
// ausgewertet sind und ein paar Zahlen zum Datenbestand. Neutralität: Parteien
// stehen in fester Reihenfolge (wie in der Datenbank), je Partei gibt es nur den
// Erfassungsstand – keine Maßnahmenzahlen, keine Summen, keine Sortierung nach Parteien.

const ERFASSUNG: Record<Erfassung, { label: string; zeichen: string }> = {
  massnahmen: { label: 'ausgewertet, mit Maßnahmen', zeichen: '●' },
  keine: { label: 'ausgewertet, nichts zum Thema im Programm', zeichen: '○' },
  offen: { label: 'noch nicht erfasst', zeichen: '–' },
}
const REIHENFOLGE: Erfassung[] = ['massnahmen', 'keine', 'offen']

const zahl = (n: number) => n.toLocaleString('de-DE')
const datum = (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

function Kachel({ label, wert, zusatz }: { label: string; wert: string; zusatz?: string }) {
  return (
    <div className="kachel">
      <span className="kachel-label">{label}</span>
      <span className="kachel-wert">{wert}</span>
      {zusatz && <span className="kachel-zusatz">{zusatz}</span>}
    </div>
  )
}

function Legende({ eintraege }: { eintraege: { klasse: string; label: string }[] }) {
  return (
    <ul className="diagramm-legende">
      {eintraege.map((e) => (
        <li key={e.klasse}>
          <span className={`legende-feld ${e.klasse}`} aria-hidden="true" />
          {e.label}
        </li>
      ))}
    </ul>
  )
}

/** Balkendiagramm aus Zeilen: Hover, Fokus oder Tippen zeigt die Details unter dem Diagramm. */
function Balkendiagramm({
  titel,
  unterzeile,
  legende,
  zeilen,
  leer,
}: {
  titel: string
  unterzeile: string
  legende?: { klasse: string; label: string }[]
  zeilen: { id: number; name: string; wert: string; segmente: { klasse: string; anteil: number }[]; detail: string }[]
  leer: string
}) {
  const [aktiv, setAktiv] = useState<number | null>(null)
  const detail = zeilen.find((z) => z.id === aktiv)?.detail
  return (
    <figure className="diagramm">
      <figcaption>
        <strong>{titel}</strong>
        <span>{unterzeile}</span>
      </figcaption>
      {legende && <Legende eintraege={legende} />}
      <ul className="balken" onMouseLeave={() => setAktiv(null)}>
        {zeilen.map((z) => (
          <li key={z.id}>
            <button
              type="button"
              className={`balken-zeile${aktiv === z.id ? ' aktiv' : ''}`}
              aria-label={z.detail}
              onMouseEnter={() => setAktiv(z.id)}
              onFocus={() => setAktiv(z.id)}
              onBlur={() => setAktiv(null)}
              onClick={() => setAktiv(z.id)}
            >
              <span className="balken-name">{z.name}</span>
              <span className="balken-spur" aria-hidden="true">
                {z.segmente
                  .filter((s) => s.anteil > 0)
                  .map((s, i) => (
                    <span key={i} className={`balken-teil ${s.klasse}`} style={{ flexBasis: `${s.anteil * 100}%` }} />
                  ))}
              </span>
              <span className="balken-wert" aria-hidden="true">
                {z.wert}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="diagramm-detail" aria-hidden="true">
        {detail ?? leer}
      </p>
    </figure>
  )
}

function Auswertungsdiagramm({ themen, parteien }: { themen: ThemaStand[]; parteien: number }) {
  return (
    <Balkendiagramm
      titel="Auswertung je Thema"
      unterzeile={`Wie viele der ${parteien} Wahlprogramme zu jedem Thema schon ausgewertet sind`}
      legende={REIHENFOLGE.map((e) => ({ klasse: `st-${e}`, label: ERFASSUNG[e].label }))}
      leer="Tippe auf ein Thema für Details."
      zeilen={themen.map((t) => {
        const erfasst = t.zaehlung.massnahmen + t.zaehlung.keine
        return {
          id: t.id,
          name: t.name,
          wert: `${erfasst}/${parteien}`,
          segmente: REIHENFOLGE.map((e) => ({ klasse: `st-${e}`, anteil: parteien ? t.zaehlung[e] / parteien : 0 })),
          detail:
            `${t.name}: ${erfasst} von ${parteien} Programmen ausgewertet` +
            (t.zaehlung.keine ? `, davon ${t.zaehlung.keine} ohne Aussage zum Thema` : '') +
            (t.zaehlung.offen ? `; ${t.zaehlung.offen} noch nicht erfasst.` : '.'),
        }
      })}
    />
  )
}

function Massnahmendiagramm({ themen, testphase }: { themen: ThemaStand[]; testphase: boolean }) {
  const max = Math.max(1, ...themen.map((t) => t.massnahmen + t.massnahmenEntwurf))
  const mitEntwurf = testphase && themen.some((t) => t.massnahmenEntwurf > 0)
  return (
    <Balkendiagramm
      titel="Maßnahmen je Thema"
      unterzeile="Erfasste Maßnahmen aller Parteien zusammen; Ursachen in den Details"
      legende={
        mitEntwurf
          ? [
              { klasse: 'mn-geprueft', label: 'geprüft' },
              { klasse: 'mn-entwurf', label: 'KI-Entwurf, ungeprüft' },
            ]
          : undefined
      }
      leer="Tippe auf ein Thema für Details."
      zeilen={themen.map((t) => ({
        id: t.id,
        name: t.name,
        wert: zahl(t.massnahmen + t.massnahmenEntwurf),
        segmente: [
          { klasse: 'mn-geprueft', anteil: t.massnahmen / max },
          { klasse: 'mn-entwurf', anteil: t.massnahmenEntwurf / max },
        ],
        detail:
          `${t.name}: ${zahl(t.ursachen)} ${t.ursachen === 1 ? 'Ursache' : 'Ursachen'}, ` +
          `${zahl(t.massnahmen + t.massnahmenEntwurf)} Maßnahmen` +
          (t.massnahmenEntwurf ? ` (davon ${zahl(t.massnahmenEntwurf)} KI-Entwurf)` : '') +
          '.',
      }))}
    />
  )
}

function Tabelle({ daten, themen }: { daten: Daten; themen: ThemaStand[] }) {
  const mitEntwurf = themen.some((t) => t.parteien.some((p) => p.ki_entwurf))
  return (
    <>
      <div className="stand-tabelle-rahmen" tabIndex={0} role="region" aria-label="Tabelle: Auswertung je Thema und Partei">
        <table className="stand-tabelle">
          <caption className="sr-only">Auswertung der Bundesprogramme je Thema und Partei</caption>
          <thead>
            <tr>
              <th scope="col">Thema</th>
              <th scope="col" className="zahl">
                Ursachen
              </th>
              {daten.parteien.map((p) => (
                <th key={p.id} scope="col" style={parteiStil(p.farbe)} title={p.name}>
                  <span className="partei-punkt" aria-hidden="true" />
                  {p.kurzname}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {themen.map((t) => (
              <tr key={t.id}>
                <th scope="row">{t.name}</th>
                <td className="zahl">{zahl(t.ursachen)}</td>
                {t.parteien.map((p) => (
                  <td key={p.partei_id} className={`st-zelle st-zelle-${p.stand}`} title={ERFASSUNG[p.stand].label}>
                    <span aria-hidden="true">
                      {ERFASSUNG[p.stand].zeichen}
                      {p.ki_entwurf && '*'}
                    </span>
                    <span className="sr-only">
                      {ERFASSUNG[p.stand].label}
                      {p.ki_entwurf && ' (KI-Entwurf)'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="meta stand-zeichen">
        {REIHENFOLGE.map((e) => (
          <span key={e}>
            <span aria-hidden="true">{ERFASSUNG[e].zeichen}</span> {ERFASSUNG[e].label}
          </span>
        ))}
        {mitEntwurf && <span>* nur als KI-Entwurf ausgewertet</span>}
      </p>
    </>
  )
}

export function Themenstand({
  daten,
  ladeFehler,
  onZurueck,
}: {
  daten: Daten | null
  ladeFehler: string | null
  onZurueck: () => void
}) {
  useEffect(() => {
    scrollTo(0, 0)
  }, [])

  return (
    <main className="seite recht themenstand">
      <header className="recht-kopf">
        <button className="knopf knopf-leise" onClick={onZurueck}>
          ← Zurück
        </button>
        <a href="#/" className="recht-marke" aria-label="Politik-Duell – Startseite">
          <Logo groesse={32} />
        </a>
      </header>
      <h1>Was das Spiel schon kennt</h1>
      <p>
        Wir werten die Wahlprogramme Thema für Thema aus. Hier siehst du, zu welchen Alltagsproblemen das Spiel
        schon etwas sagen kann. Gewertet wird eine Runde nur, wenn das Thema für beide gewählten Parteien ausgewertet
        ist – fehlende Daten kosten keine Partei einen Punkt.
      </p>
      <p className="meta">
        Die Übersicht zeigt nur, <strong>wie weit die Auswertung ist</strong> – nicht, welche Partei die besseren
        Lösungen hat. Parteien stehen in fester Reihenfolge.
      </p>
      {ladeFehler ? (
        <p className="recht-warnung" role="alert">
          Die Spieldaten konnten nicht geladen werden ({ladeFehler}).
        </p>
      ) : !daten ? (
        <p className="meta">Lade Spieldaten …</p>
      ) : (
        <Inhalt daten={daten} />
      )}
    </main>
  )
}

function Inhalt({ daten }: { daten: Daten }) {
  const s = statistik(daten)
  const themen = themenStand(daten)
  const testphase = !!daten.testphase
  const anteil = s.paare ? Math.round((s.erfasst / s.paare) * 100) : 0
  return (
    <>
      {testphase && (
        <p className="recht-warnung">
          Geschlossene Testphase: Die Zahlen enthalten vorläufige KI-Entwürfe, die noch nicht von Menschen geprüft
          sind. In der öffentlichen App zählen nur geprüfte Einträge.
        </p>
      )}
      <h2>In Zahlen</h2>
      <div className="kacheln">
        <Kachel label="Themen" wert={zahl(s.themen)} />
        <Kachel label="Ursachen" wert={zahl(s.ursachen)} zusatz="mit Quelle belegt" />
        <Kachel
          label="Maßnahmen"
          wert={zahl(s.massnahmen + s.massnahmenEntwurf)}
          zusatz={s.massnahmenEntwurf ? `davon ${zahl(s.massnahmenEntwurf)} KI-Entwurf` : 'geprüft'}
        />
        <Kachel label="Parteien" wert={zahl(s.parteien)} />
        {s.landesprogramme > 0 && (
          <Kachel
            label="Landesprogramme"
            wert={zahl(s.landesprogramme)}
            zusatz={`in ${s.laender} ${s.laender === 1 ? 'Land' : 'Ländern'}`}
          />
        )}
      </div>
      <div className="fortschritt">
        <div className="fortschritt-kopf">
          <span>Bundesprogramme ausgewertet</span>
          <strong>{anteil} %</strong>
        </div>
        <div
          className="fortschritt-spur"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={s.paare}
          aria-valuenow={s.erfasst}
          aria-label="Bundesprogramme ausgewertet"
        >
          <span className="fortschritt-fuellung" style={{ width: `${anteil}%` }} />
        </div>
        <p className="meta">
          {zahl(s.erfasst)} von {zahl(s.paare)} Kombinationen aus Thema und Partei
          {s.stand && <> · Stand {datum(s.stand)}</>}
        </p>
      </div>

      <h2>Themen</h2>
      {themen.length ? (
        <>
          <Auswertungsdiagramm themen={themen} parteien={s.parteien} />
          <Massnahmendiagramm themen={themen} testphase={testphase} />
          <h2>Je Thema und Partei</h2>
          <Tabelle daten={daten} themen={themen} />
        </>
      ) : (
        <p>Noch keine Themen erfasst.</p>
      )}

      <h2>Dein Thema fehlt?</h2>
      <p>
        Du kannst es trotzdem nennen: Das Spiel gibt dann eine vorläufige Einschätzung ohne Wertung, und wir merken
        uns das Thema für die Auswertung. Wie wir bewerten, steht unter <a href="#/methode">So bewerten wir</a>; alle
        Daten mit Belegen liegen im <a href={BETREIBER.quellcode}>öffentlichen Quellcode</a>.
      </p>
    </>
  )
}
