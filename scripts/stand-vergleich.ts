// Vergleich mit dem Zielzweig eines Pull Requests (npm run daten:id -- --gegen origin/main):
// Was ein Pull Request nicht unbemerkt tun darf. Reine Funktionen; IDs prüft scripts/ids.ts.
import type { Katalog } from '../src/data/katalog.ts'
import { enthaeltParteinamen } from './entwurf.ts'

const ort = (k: Katalog, partei: number, land: string | null) => `${k.parteien.find((p) => p.id === partei)?.kurzname ?? partei} (${land ?? 'Bund'})`

/**
 * 1. Kommt zu einem Thema mit Abdeckung eine Ursache hinzu, muss jeder aktuelle Eintrag, für den
 *    sie zählt, `durchsucht_fuer` ausdrücklich angeben – mit der neuen Ursache, wenn das Programm
 *    danach durchsucht wurde, sonst ohne (dann „noch nicht erfasst“). Ohne Angabe gälte das
 *    Programm als durchsucht, und die Partei bekäme 0 Punkte, ohne dass jemand gesucht hat.
 * 2. Werte aus der Blindbewertung (`entwurf_herkunft: blind`) ändern sich nur durch die Prüfung
 *    (neue `bewertung`). Wer sie mit Kenntnis der Partei ändert, setzt `nicht_blind`.
 * 3. Phasen getrennt: Ursachen oder Ziel eines Themas und seine Maßnahmen (Abdeckung, Instrumente)
 *    ändern sich nicht im selben Pull Request – sonst ließen sich Ursachen passend zu den gefundenen
 *    Maßnahmen zuschneiden. Ausnahme: nachträgliche Ursachen (`nachtraeglich`), wenn jeder aktuelle
 *    Eintrag des Themas `durchsucht_fuer` angibt.
 * 4. Neue oder geänderte Ursachen und Ziele nennen keine Partei.
 * 5. Haltungen: Frage, Beschreibung und Zielkonflikte (Phase A) und die Positionen (Phase B) ändern sich nicht im
 *    selben Pull Request; ändert sich Phase A nach der Freigabe, braucht es eine neue Freigabe.
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
  fehler.push(...trennePhasen(alt, neu))
  fehler.push(...trenneHaltungsPhasen(alt, neu))
  return fehler
}

/**
 * Haltungen in zwei Phasen wie Themen (docs/plan-haltungen.md, „Erfassen und Prüfen“): erst Frage, Beschreibung,
 * verwandte Themen und Zielkonflikte ohne Blick in die Programme, freigegeben von der Betreiberin; dann die
 * Positionen. Sonst ließe sich die Frage passend zu den gefundenen Positionen zuschneiden.
 */
export function trenneHaltungsPhasen(alt: Katalog, neu: Katalog): string[] {
  const fehler: string[] = []
  const phaseA = (h: Katalog['haltungen'][number]) => JSON.stringify([h.frage, h.beschreibung, h.verwandte_themen, h.zielkonflikte])
  for (const h of neu.haltungen) {
    const vorher = alt.haltungen.find((x) => x.id === h.id)
    const aGeaendert = !vorher || phaseA(vorher) !== phaseA(h)
    const bGeaendert = JSON.stringify(vorher?.positionen ?? []) !== JSON.stringify(h.positionen)
    if (aGeaendert && bGeaendert && h.positionen.length)
      fehler.push(
        `Haltung ${h.id}: ${vorher ? 'Frage, Beschreibung oder Zielkonflikte' : 'neue Haltung'} und Positionen im selben Pull Request – ` +
          'erst Frage, Beschreibung und Zielkonflikte freigeben lassen (eigener Pull Request), dann die Positionen erfassen',
      )
    if (vorher && aGeaendert && h.freigabe && vorher.freigabe?.datum === h.freigabe.datum)
      fehler.push(`Haltung ${h.id}: Frage, Beschreibung oder Zielkonflikte nach der Freigabe geändert – neue Freigabe („freigabe.datum“) nötig`)
  }
  return fehler
}

const ursacheText = (u: Katalog['ursachen'][number]) => JSON.stringify([u.beschreibung, u.quelle_url, u.ebene ?? 'bund'])

/** Phase A (Ursachen, Ziel) und Phase B–D (Maßnahmen) desselben Themas nicht im selben Pull Request. */
export function trennePhasen(alt: Katalog, neu: Katalog): string[] {
  const fehler: string[] = []
  const namen = neu.parteien.flatMap((p) => [p.name, p.kurzname])
  const massnahmenTeil = (k: Katalog, id: number) =>
    JSON.stringify([
      k.instrumente.filter((i) => i.thema_id === id),
      k.massnahmen.filter((m) => m.thema_id === id),
      k.abdeckung.filter((a) => a.thema_id === id),
    ])
  for (const t of neu.themen) {
    const vorher = alt.themen.find((x) => x.id === t.id)
    const alteU = new Map(alt.ursachen.filter((u) => u.thema_id === t.id).map((u) => [u.id, u]))
    const jetztU = neu.ursachen.filter((u) => u.thema_id === t.id)
    const geaendert = jetztU.filter((u) => !alteU.has(u.id) || ursacheText(alteU.get(u.id)!) !== ursacheText(u))
    const entfernt = [...alteU.keys()].filter((id) => !jetztU.some((u) => u.id === id))
    const zielNeu = (vorher?.ziel ?? '') !== (t.ziel ?? '')

    for (const u of geaendert)
      if (enthaeltParteinamen(u.beschreibung, namen)) fehler.push(`Ursache ${u.id} nennt eine Partei oder Person – Ursachen beschreiben das Problem, nicht wer es wie lösen will`)
    if (zielNeu && t.ziel && enthaeltParteinamen(t.ziel, namen)) fehler.push(`Ziel von Thema ${t.id} nennt eine Partei oder Person`)

    const phaseA = !vorher || zielNeu || geaendert.length > 0 || entfernt.length > 0
    if (!phaseA || massnahmenTeil(alt, t.id) === massnahmenTeil(neu, t.id)) continue
    // Maßnahmen haben sich geändert – und Ursachen oder Ziel auch.
    const ausnahme =
      vorher && !zielNeu && !entfernt.length &&
      geaendert.every((u) => !alteU.has(u.id) && u.nachtraeglich) &&
      neu.abdeckung.filter((a) => a.thema_id === t.id && a.aktuell).every((a) => a.durchsucht_fuer)
    if (!ausnahme)
      fehler.push(
        `Thema ${t.id}: ${!vorher ? 'neues Thema' : zielNeu ? 'Ziel' : `Ursache ${[...geaendert.map((u) => u.id), ...entfernt].join(', ')}`} und Maßnahmen im selben Pull Request – ` +
          'erst Ursachen und Ziel freigeben lassen (eigener Pull Request), dann erfassen. Ausnahme: neue Ursache mit „nachtraeglich“ und „durchsucht_fuer“ an jedem aktuellen Eintrag',
      )
  }
  return fehler
}
