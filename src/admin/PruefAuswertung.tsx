import { useState } from 'react'
import { exportiere, KRITISCHE_SPANNWEITE, MINDEST_BEWERTUNGEN, werteAus, type Einzelwert } from '../pruefung/auswertung'
import { KATALOG } from '../pruefung/katalog'
import type { PruefBewertung, PruefEinladung } from './client'
import { einheiten, massnahmenIds, themaName } from './pruefKatalog'

// Admin → Prüfung → Auswertung je Thema: Einzelwerte (mit Namen, nur hier),
// Median je Kriterium, Punkte aus den Medianen, Spannweite. Der Export enthält
// keine Namen und geht an `npm run pruefung:uebernehmen`.
//
// Es zählen nur abgesendete Bewertungen von nicht gesperrten Einladungen.

const zahl = (x: number | null) => (x === null ? '–' : x.toLocaleString('de-DE'))

const heute = () => new Date().toISOString().slice(0, 10)

function herunterladen(dateiname: string, inhalt: string) {
  const url = URL.createObjectURL(new Blob([inhalt], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = dateiname
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function PruefAuswertung({ einladungen, bewertungen }: { einladungen: PruefEinladung[]; bewertungen: PruefBewertung[] }) {
  const themen = KATALOG.themen.filter((t) => massnahmenIds(t.id).length > 0)
  const [themaId, setThemaId] = useState(() => themen.find((t) => einladungen.some((e) => e.themen.includes(t.id)))?.id ?? themen[0]?.id)
  if (themaId === undefined) return <p className="admin-leer">Noch kein Thema mit Maßnahmen im Datenkatalog.</p>

  const name = new Map(einladungen.map((e) => [e.id, e.name]))
  const aktiv = new Set(einladungen.filter((e) => !e.gesperrt).map((e) => e.id))
  const partei = (id: number) => KATALOG.parteien.find((p) => p.id === id)
  // Instrumente zuerst, dann einzelne Maßnahmen nach Partei.
  const massnahmen = einheiten(themaId).sort(
    (a, b) => Number(b.instrument) - Number(a.instrument) || a.massnahmen[0].partei_id - b.massnahmen[0].partei_id || a.id - b.id,
  )

  const zeilen = massnahmen.map((m) => {
    const einzel = bewertungen.filter((b) => b.massnahme_id === m.id && aktiv.has(b.einladung_id))
    const gezaehlt = einzel.filter(
      (b): b is PruefBewertung & Einzelwert => b.abgesendet && b.wirksamkeit !== null && b.umsetzbarkeit !== null,
    )
    return { m, einzel, auswertung: werteAus(m.id, gezaehlt) }
  })
  const auswertungen = zeilen.map((z) => z.auswertung)
  const zuKlaeren = auswertungen.filter((a) => a.klaeren).length

  function exportieren() {
    const daten = exportiere(themaId!, heute(), auswertungen)
    herunterladen(`pruefung-thema-${themaId}-${daten.datum}.json`, JSON.stringify(daten, null, 2) + '\n')
  }

  return (
    <section className="pruef-auswertung" aria-labelledby="h-auswertung">
      <h2 id="h-auswertung">Auswertung</h2>
      <div className="admin-aktionen">
        <label className="admin-stichwort">
          Thema
          <select value={themaId} onChange={(e) => setThemaId(Number(e.target.value))}>
            {themen.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <button className="knopf knopf-klein" onClick={exportieren} disabled={auswertungen.every((a) => a.anzahl === 0)}>
          Export (ohne Namen)
        </button>
      </div>
      <p className="admin-hinweis">
        Es zählen nur abgesendete Bewertungen nicht gesperrter Einladungen. Punkte = Median Wirksamkeit × Median
        Umsetzbarkeit. Markiert (⚠) sind Maßnahmen mit weniger als {MINDEST_BEWERTUNGEN} Bewertungen oder einer
        Spannweite ab {KRITISCHE_SPANNWEITE} – vor der Übernahme klären. * = nach dem Ansehen der Empfehlung geändert.
      </p>
      <p className="admin-klein">
        {themaName(themaId)}: {massnahmen.length} Prüfeinheiten (Instrumente und einzelne Maßnahmen), davon {zuKlaeren} zu klären.
      </p>
      <div className="pruef-tabelle-rahmen">
        <table className="pruef-tabelle">
          <thead>
            <tr>
              <th scope="col">Maßnahme</th>
              <th scope="col">Entwurf W×U</th>
              <th scope="col">Einzelwerte W/U</th>
              <th scope="col">n</th>
              <th scope="col">Median W</th>
              <th scope="col">Median U</th>
              <th scope="col">Punkte</th>
              <th scope="col">Spannweite</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map(({ m, einzel, auswertung: a }) => (
              <tr key={m.id} className={a.klaeren ? 'pruef-klaeren' : ''}>
                <th scope="row">
                  <span className="admin-klein">
                    {a.klaeren && '⚠ '}
                    {m.instrument
                      ? `Instrument · ${m.id} · ${m.massnahmen.map((x) => `${partei(x.partei_id)?.kurzname}${x.land ? ` ${x.land}` : ''}`).join(', ')}`
                      : `${partei(m.massnahmen[0].partei_id)?.kurzname}${m.massnahmen[0].land ? ` ${m.massnahmen[0].land}` : ''} · ${m.id}`}
                  </span>
                  <br />
                  {m.beschreibung}
                  {einzel
                    .filter((b) => b.notiz)
                    .map((b) => (
                      <span key={b.einladung_id} className="pruef-notiz-zeile">
                        {name.get(b.einladung_id)}: {b.notiz}
                      </span>
                    ))}
                </th>
                <td>
                  {m.wirksamkeit}×{m.umsetzbarkeit}
                </td>
                <td>
                  {einzel.length === 0
                    ? '–'
                    : einzel.map((b) => (
                        <span key={b.einladung_id} className={b.abgesendet ? 'pruef-einzel' : 'pruef-einzel admin-klein'}>
                          {name.get(b.einladung_id)}: {b.wirksamkeit ?? '–'}/{b.umsetzbarkeit ?? '–'}
                          {b.nach_empfehlung_geaendert && '*'}
                          {!b.abgesendet && ' (nicht abgesendet)'}
                        </span>
                      ))}
                </td>
                <td>{a.anzahl}</td>
                <td>{zahl(a.median_w)}</td>
                <td>{zahl(a.median_u)}</td>
                <td>
                  <strong>{zahl(a.punkte)}</strong>
                </td>
                <td>{zahl(a.spannweite)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
