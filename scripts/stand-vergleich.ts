// Vergleich mit dem Zielzweig eines Pull Requests (npm run daten:id -- --gegen origin/main):
// Was ein Pull Request nicht unbemerkt tun darf. Reine Funktionen; IDs prüft scripts/ids.ts.
import type { Katalog } from '../src/data/katalog.ts'

const ort = (k: Katalog, partei: number, land: string | null) => `${k.parteien.find((p) => p.id === partei)?.kurzname ?? partei} (${land ?? 'Bund'})`

/**
 * 1. Kommt zu einem Thema mit Abdeckung eine Ursache hinzu, muss jeder aktuelle Eintrag, für den
 *    sie zählt, `durchsucht_fuer` ausdrücklich angeben – mit der neuen Ursache, wenn das Programm
 *    danach durchsucht wurde, sonst ohne (dann „noch nicht erfasst“). Ohne Angabe gälte das
 *    Programm als durchsucht, und die Partei bekäme 0 Punkte, ohne dass jemand gesucht hat.
 * 2. Werte aus der Blindbewertung (`entwurf_herkunft: blind`) ändern sich nur durch die Prüfung
 *    (neue `bewertung`). Wer sie mit Kenntnis der Partei ändert, setzt `nicht_blind`.
 */
export function vergleicheStand(alt: Katalog, neu: Katalog): string[] {
  const fehler: string[] = []
  const alteUrsachen = new Set(alt.ursachen.map((u) => u.id))
  for (const u of neu.ursachen) {
    if (alteUrsachen.has(u.id)) continue
    const eintraege = neu.abdeckung.filter((a) => a.thema_id === u.thema_id && a.aktuell && (a.land === null || (u.ebene ?? 'bund') === 'land'))
    for (const a of eintraege) {
      if (!a.durchsucht_fuer)
        fehler.push(
          `Ursache ${u.id} ist neu, aber der Eintrag ${ort(neu, a.partei_id, a.land ?? null)} in Thema ${u.thema_id} nennt kein „durchsucht_fuer“ – ` +
            `mit ${u.id}, wenn das Programm danach durchsucht wurde, sonst ohne (dann „noch nicht erfasst“)`,
        )
    }
  }

  const werte = (x: { wirksamkeit: number; umsetzbarkeit: number; evidenz?: string | null }) => `${x.wirksamkeit}×${x.umsetzbarkeit} ${x.evidenz ?? '–'}`
  const vorher = new Map<number, { werte: string; herkunft?: string; bewertungen: number }>()
  for (const i of alt.instrumente) vorher.set(i.id, { werte: werte(i), herkunft: i.entwurf_herkunft, bewertungen: i.bewertungen })
  for (const m of alt.massnahmen)
    if (m.instrument_id === undefined) vorher.set(m.id, { werte: werte(m), herkunft: m.entwurf_herkunft, bewertungen: m.bewertungen ?? 0 })
  const pruefe = (id: number, jetzt: { werte: string; herkunft?: string; bewertungen: number }, was: string) => {
    const a = vorher.get(id)
    if (!a || a.herkunft !== 'blind' || jetzt.herkunft !== 'blind') return
    if (a.werte !== jetzt.werte && a.bewertungen === jetzt.bewertungen)
      fehler.push(
        `${was} ${id}: Werte der Blindbewertung geändert (${a.werte} → ${jetzt.werte}) – ` +
          'neu blind bewerten lassen oder „entwurf_herkunft“: „nicht_blind“ setzen und im Pull Request begründen',
      )
  }
  for (const i of neu.instrumente) pruefe(i.id, { werte: werte(i), herkunft: i.entwurf_herkunft, bewertungen: i.bewertungen }, 'Instrument')
  for (const m of neu.massnahmen)
    if (m.instrument_id === undefined) pruefe(m.id, { werte: werte(m), herkunft: m.entwurf_herkunft, bewertungen: m.bewertungen ?? 0 }, 'Maßnahme')
  return fehler
}
