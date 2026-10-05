import { useEffect, useState } from 'react'
import type { Daten } from '../data/quelle'
import {
  haltungStand,
  instrumentStand,
  statistik,
  themenStand,
  type Erfassung,
  type HaltungStand,
  type Statistik,
  type ThemaInstrumente,
  type ThemaStand,
} from '../logic/stand'
import { BETREIBER } from '../rechtliches/betreiber'
import { EVIDENZ_TEXT } from '../logic/forderung'
import { Logo } from './Logo'
import { Zusammenhaenge } from './Zusammenhaenge'
import { parteiStil } from './stil'

// Übersicht unter #/themen: welche Themen das Spiel kennt, wie weit die Programme
// ausgewertet sind und ein paar Zahlen zum Datenbestand. Neutralität: Parteien
// stehen in fester Reihenfolge (wie in der Datenbank), je Partei gibt es nur den
// Erfassungsstand – keine Maßnahmenzahlen, keine Summen, keine Sortierung nach Parteien.
// Bei Lösungswegen steht nur, in wie vielen Programmen sie vorkommen (ohne Namen), bei
// Haltungen nur, wie viele Positionen erfasst sind – nicht, wie die Parteien zur Frage stehen.

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

interface Zeile {
  id: number
  name: string
  wert: string
  segmente: { klasse: string; anteil: number }[]
  detail: string
  /** Aufklappbare Unterzeilen (z. B. Ursachen eines Themas). */
  kinder?: Zeile[]
}

function Balken({ segmente }: { segmente: Zeile['segmente'] }) {
  return (
    <span className="balken-spur" aria-hidden="true">
      {segmente
        .filter((s) => s.anteil > 0)
        .map((s, i) => (
          <span key={i} className={`balken-teil ${s.klasse}`} style={{ flexBasis: `${s.anteil * 100}%` }} />
        ))}
    </span>
  )
}

/**
 * Balkendiagramm aus Zeilen: Hover, Fokus oder Tippen zeigt die Details unter dem Diagramm.
 * Zeilen mit `kinder` klappen beim Tippen ihre Unterzeilen auf.
 */
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
  zeilen: Zeile[]
  leer: string
}) {
  const [aktiv, setAktiv] = useState<string | null>(null)
  const [offen, setOffen] = useState<ReadonlySet<number>>(new Set())
  const klappbar = zeilen.some((z) => z.kinder?.length)
  const schluessel = (z: Zeile, eltern?: number) => (eltern === undefined ? `${z.id}` : `${eltern}/${z.id}`)
  const detail = [
    ...zeilen.map((z) => [schluessel(z), z.detail]),
    ...zeilen.flatMap((z) => (z.kinder ?? []).map((k) => [schluessel(k, z.id), k.detail])),
  ].find(([s]) => s === aktiv)?.[1]
  const umschalten = (id: number) =>
    setOffen((o) => {
      const n = new Set(o)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const knopf = (z: Zeile, eltern?: number) => {
    const s = schluessel(z, eltern)
    const kinder = eltern === undefined && z.kinder?.length ? z.kinder : null
    return (
      <button
        type="button"
        className={`balken-zeile${aktiv === s ? ' aktiv' : ''}${eltern !== undefined ? ' balken-kind' : ''}`}
        aria-label={z.detail}
        aria-expanded={kinder ? offen.has(z.id) : undefined}
        onMouseEnter={() => setAktiv(s)}
        onFocus={() => setAktiv(s)}
        onBlur={() => setAktiv(null)}
        onClick={() => {
          setAktiv(s)
          if (kinder) umschalten(z.id)
        }}
      >
        <span className="balken-name">
          {kinder && (
            <span className={`balken-pfeil${offen.has(z.id) ? ' offen' : ''}`} aria-hidden="true">
              ▸
            </span>
          )}
          {z.name}
        </span>
        <Balken segmente={z.segmente} />
        <span className="balken-wert" aria-hidden="true">
          {z.wert}
        </span>
      </button>
    )
  }

  return (
    <figure className="diagramm">
      <figcaption>
        <strong>{titel}</strong>
        <span>{unterzeile}</span>
      </figcaption>
      {legende && <Legende eintraege={legende} />}
      {klappbar && (
        <p className="diagramm-steuerung">
          <button type="button" className="knopf-link" onClick={() => setOffen(new Set(zeilen.map((z) => z.id)))}>
            Alle aufklappen
          </button>
          <button type="button" className="knopf-link" onClick={() => setOffen(new Set())}>
            Alle zuklappen
          </button>
        </p>
      )}
      <ul className="balken" onMouseLeave={() => setAktiv(null)}>
        {zeilen.map((z) => (
          <li key={z.id}>
            {knopf(z)}
            {z.kinder && offen.has(z.id) && (
              <ul className="balken balken-unter">
                {z.kinder.map((k) => (
                  <li key={k.id}>{knopf(k, z.id)}</li>
                ))}
              </ul>
            )}
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

const kurz = (text: string, max = 60) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

function Ursachendiagramm({ themen, testphase }: { themen: ThemaStand[]; testphase: boolean }) {
  const maxUrsachen = Math.max(1, ...themen.map((t) => t.ursachen))
  const maxMassnahmen = Math.max(1, ...themen.flatMap((t) => t.ursachenStand.map((u) => u.massnahmen + u.massnahmenEntwurf)))
  const mitEntwurf = testphase && themen.some((t) => t.massnahmenEntwurf > 0)
  return (
    <Balkendiagramm
      titel="Ursachen je Thema"
      unterzeile="Belegte Ursachen und ob schon Maßnahmen an ihnen ansetzen; aufklappen zeigt die Maßnahmen je Ursache (alle Parteien zusammen)"
      legende={[
        { klasse: 'ur-mit', label: 'Ursache mit Maßnahmen' },
        { klasse: 'ur-ohne', label: 'noch ohne Maßnahme' },
        ...(mitEntwurf ? [{ klasse: 'mn-entwurf', label: 'Maßnahmen als KI-Entwurf' }] : []),
      ]}
      leer="Tippe auf ein Thema, um seine Ursachen aufzuklappen."
      zeilen={themen.map((t) => {
        const mit = t.ursachen - t.ursachenOhneMassnahme
        return {
          id: t.id,
          name: t.name,
          wert: zahl(t.ursachen),
          segmente: [
            { klasse: 'ur-mit', anteil: mit / maxUrsachen },
            { klasse: 'ur-ohne', anteil: t.ursachenOhneMassnahme / maxUrsachen },
          ],
          detail:
            `${t.name}: ${zahl(t.ursachen)} ${t.ursachen === 1 ? 'Ursache' : 'Ursachen'}` +
            (t.ursachenOhneMassnahme ? `, davon ${zahl(t.ursachenOhneMassnahme)} noch ohne Maßnahme.` : ', an allen setzen Maßnahmen an.'),
          kinder: t.ursachenStand.map((u) => {
            const summe = u.massnahmen + u.massnahmenEntwurf
            return {
              id: u.id,
              name: kurz(u.beschreibung),
              wert: zahl(summe),
              segmente: [
                { klasse: 'mn-geprueft', anteil: u.massnahmen / maxMassnahmen },
                { klasse: 'mn-entwurf', anteil: u.massnahmenEntwurf / maxMassnahmen },
              ],
              detail:
                `${u.beschreibung} (${u.ebene === 'land' ? 'Länderzuständigkeit' : 'Bund'}): ` +
                (summe
                  ? `${zahl(summe)} ${summe === 1 ? 'Maßnahme setzt' : 'Maßnahmen setzen'} hier an` +
                    (u.massnahmenEntwurf ? ` (davon ${zahl(u.massnahmenEntwurf)} KI-Entwurf).` : '.')
                  : 'noch keine Maßnahme erfasst.'),
            }
          }),
        }
      })}
    />
  )
}

function Loesungswegdiagramm({ themen, parteien }: { themen: ThemaInstrumente[]; parteien: number }) {
  const max = Math.max(1, ...themen.map((t) => t.instrumente.length))
  return (
    <Balkendiagramm
      titel="Lösungswege je Thema"
      unterzeile="Grundlage der Forderungskarte; aufklappen zeigt je Lösungsweg, in den Programmen wie vieler Parteien er steht"
      legende={[
        { klasse: 'fd-mehrere', label: 'in Programmen mehrerer Parteien' },
        { klasse: 'fd-eine', label: 'im Programm einer Partei' },
      ]}
      leer="Tippe auf ein Thema, um seine Lösungswege aufzuklappen."
      zeilen={themen.map((t) => {
        const n = t.instrumente.length
        return {
          id: t.id,
          name: t.name,
          wert: zahl(n),
          segmente: [
            { klasse: 'fd-mehrere', anteil: t.mehrere / max },
            { klasse: 'fd-eine', anteil: (n - t.mehrere) / max },
          ],
          detail: n
            ? `${t.name}: ${zahl(n)} ${n === 1 ? 'Lösungsweg' : 'Lösungswege'}, davon ${zahl(t.mehrere)} in Programmen mehrerer Parteien.`
            : `${t.name}: noch keine Lösungswege erfasst.`,
          kinder: t.instrumente.map((i) => ({
            id: i.id,
            name: kurz(i.name),
            wert: `${i.parteien}/${parteien}`,
            segmente: [{ klasse: i.parteien > 1 ? 'fd-mehrere' : 'fd-eine', anteil: parteien ? i.parteien / parteien : 0 }],
            detail:
              `${i.name} (${i.ebene === 'land' ? 'Landesprogramme' : 'Bundesprogramme'}${i.ki_entwurf ? ', KI-Entwurf' : ''}): ` +
              (i.massnahmen
                ? `${zahl(i.massnahmen)} ${i.massnahmen === 1 ? 'Maßnahme' : 'Maßnahmen'} aus den Programmen von ${zahl(i.parteien)} ${i.parteien === 1 ? 'Partei' : 'Parteien'}`
                : 'noch keine Maßnahme zugeordnet') +
              (i.evidenz ? `. ${EVIDENZ_TEXT[i.evidenz]}.` : '.'),
          })),
        }
      })}
    />
  )
}

function Haltungsdiagramm({ haltungen }: { haltungen: HaltungStand[] }) {
  const mitEntwurf = haltungen.some((h) => h.positionenEntwurf > 0)
  return (
    <Balkendiagramm
      titel="Positionen je Haltung"
      unterzeile="Eine Haltungskarte gibt es erst, wenn die Positionen aller Parteien erfasst sind („Alle oder keine“); ✓ = im Spiel"
      legende={[
        { klasse: 'st-massnahmen', label: 'Position erfasst' },
        ...(mitEntwurf ? [{ klasse: 'mn-entwurf', label: 'als KI-Entwurf erfasst' }] : []),
        { klasse: 'st-offen', label: 'noch nicht erfasst' },
      ]}
      leer="Tippe auf eine Haltung für Details."
      zeilen={haltungen.map((h) => {
        const erfasst = h.positionen + h.positionenEntwurf
        const anteil = (n: number) => (h.parteien ? n / h.parteien : 0)
        return {
          id: h.id,
          name: `${h.vollstaendig ? '✓ ' : ''}${kurz(h.frage)}`,
          wert: `${erfasst}/${h.parteien}`,
          segmente: [
            { klasse: 'st-massnahmen', anteil: anteil(h.positionen) },
            { klasse: 'mn-entwurf', anteil: anteil(h.positionenEntwurf) },
            { klasse: 'st-offen', anteil: anteil(h.parteien - erfasst) },
          ],
          detail:
            `${h.frage} – ${erfasst} von ${h.parteien} Positionen erfasst` +
            (h.positionenEntwurf ? ` (davon ${h.positionenEntwurf} KI-Entwurf)` : '') +
            `; ${h.vollstaendig ? 'im Spiel' : 'noch nicht im Spiel'}. ` +
            `Zielkonflikte: ${h.zielkonflikte.ja} auf der Ja-, ${h.zielkonflikte.nein} auf der Nein-Seite; ` +
            `${h.verwandteThemen} verwandte ${h.verwandteThemen === 1 ? 'Thema' : 'Themen'}.`,
        }
      })}
    />
  )
}

/** Ein Strang der Datengrundlage als Kette von Kacheln, die im Spiel zu einem Ergebnis führt. */
function Strang({
  name,
  ergebnis,
  glieder,
  hinweis,
}: {
  name: string
  ergebnis: string
  glieder: { label: string; wert: string; zusatz?: string }[]
  hinweis: string
}) {
  return (
    <section className="strang" aria-label={`${name}: ${glieder.map((g) => `${g.wert} ${g.label}`).join(', ')}`}>
      <header className="strang-kopf">
        <strong>{name}</strong>
        <span>{hinweis}</span>
      </header>
      <ol className="strang-kette">
        {glieder.map((g) => (
          <li key={g.label}>
            <Kachel {...g} />
          </li>
        ))}
        <li className="strang-ergebnis">
          <span>{ergebnis}</span>
        </li>
      </ol>
    </section>
  )
}

function Aufbau({ s, testphase }: { s: Statistik; testphase: boolean }) {
  const entwurf = (n: number) => (testphase && n ? `, davon ${zahl(n)} KI-Entwurf` : '')
  const massnahmen = s.massnahmen + s.massnahmenEntwurf
  const mitWeg = s.massnahmenMitInstrument + s.massnahmenMitInstrumentEntwurf
  const positionen = s.positionen + s.positionenEntwurf
  return (
    <div className="aufbau">
      <Strang
        name="Probleme"
        hinweis="Ein Alltagsproblem wird Thema und Ursachen zugeordnet; die Maßnahmen an diesen Ursachen bringen Punkte."
        ergebnis="Wertung mit Punkten"
        glieder={[
          { label: 'Themen', wert: zahl(s.themen) },
          { label: 'Ursachen', wert: zahl(s.ursachen), zusatz: 'mit Quelle belegt' },
          { label: 'Maßnahmen', wert: zahl(massnahmen), zusatz: `aus den Programmen${entwurf(s.massnahmenEntwurf)}` },
        ]}
      />
      <Strang
        name="Forderungen"
        hinweis="Eine Forderung wird einem Lösungsweg zugeordnet; die Karte zeigt, in welchen Programmen er steht."
        ergebnis="Forderungskarte, ohne Punkte"
        glieder={[
          { label: 'Themen', wert: zahl(s.themen), zusatz: 'dieselben wie oben' },
          {
            label: 'Lösungswege',
            wert: zahl(s.instrumente + s.instrumenteEntwurf),
            zusatz: `gleiche Wege in mehreren Programmen${entwurf(s.instrumenteEntwurf)}`,
          },
          {
            label: 'Maßnahmen mit Lösungsweg',
            wert: zahl(mitWeg),
            zusatz: `von ${zahl(massnahmen)} Maßnahmen${entwurf(s.massnahmenMitInstrumentEntwurf)}`,
          },
        ]}
      />
      <Strang
        name="Haltungen"
        hinweis="Eine Wertfrage, über die man verschieden denken kann – mit der Position jeder Partei und den Zielkonflikten."
        ergebnis="Haltungskarte, ohne Punkte"
        glieder={[
          {
            label: 'Haltungen',
            wert: zahl(s.haltungen),
            zusatz: `davon ${zahl(s.haltungenVollstaendig)} vollständig und im Spiel`,
          },
          {
            label: 'Positionen',
            wert: zahl(positionen),
            zusatz: `von ${zahl(s.positionenMoeglich)} (Haltungen × Parteien)${entwurf(s.positionenEntwurf)}`,
          },
          { label: 'Zielkonflikte', wert: zahl(s.zielkonflikte), zusatz: 'je Seite der Frage, mit Quelle' },
        ]}
      />
    </div>
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
  const wege = instrumentStand(daten)
  const haltungen = haltungStand(daten)
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
      <h2>So ist die Datengrundlage aufgebaut</h2>
      <p>
        Das Spiel unterscheidet, was jemand nennt: ein <strong>Problem</strong> aus dem Alltag, eine{' '}
        <strong>Forderung</strong> nach einer bestimmten Lösung oder eine <strong>Haltung</strong>. Für jedes gibt es
        einen eigenen Teil der Daten. Nur Probleme werden mit Punkten gewertet.
      </p>
      <Aufbau s={s} testphase={testphase} />
      <h2>Programme</h2>
      <div className="kacheln">
        <Kachel label="Parteien" wert={zahl(s.parteien)} zusatz="Bundesprogramme" />
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
          <Ursachendiagramm themen={themen} testphase={testphase} />
          <h2>Forderungen</h2>
          <Loesungswegdiagramm themen={wege} parteien={s.parteien} />
          <h2>Haltungen</h2>
          {haltungen.length ? <Haltungsdiagramm haltungen={haltungen} /> : <p>Noch keine Haltungen erfasst.</p>}
          <h2>Zusammenhänge</h2>
          <Zusammenhaenge daten={daten} />
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
