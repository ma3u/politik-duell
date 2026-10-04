// Nummernkreis für Maßnahmen und Instrumente, dazu der eigene der Haltungen (daten/README.md → „IDs“):
// Eine ID wird einmal vergeben und nie wieder – gespielte Runden, Prüfungen und
// Links verweisen darauf. Reine Funktionen; das Kommando steht in scripts/daten-id.ts.
import type { Katalog } from '../src/data/katalog.ts'

/** Wofür eine ID steht. Ändert sich das, wäre sie umgewidmet. */
interface Eintrag {
  was: string
  /** Nur bei Landesprogrammen; ältere Stände kennen sie noch nicht. */
  wahl?: string
}

function eintraege(k: Katalog): Map<number, Eintrag> {
  const m = new Map<number, Eintrag>()
  for (const i of k.instrumente) m.set(i.id, { was: `Instrument in Thema ${i.thema_id}` })
  for (const x of k.massnahmen) {
    m.set(x.id, { was: `Maßnahme in Thema ${x.thema_id}, Partei ${x.partei_id}, ${x.land ?? 'Bund'}`, wahl: x.landtagswahl })
  }
  return m
}

export function naechsteId(k: Katalog): number {
  return Math.max(0, ...eintraege(k).keys(), ...k.stillgelegt) + 1
}

/** Nächste freie ID für eine neue Haltung (eigener Nummernkreis 1, 2, …). */
export function naechsteHaltungsId(k: Katalog): number {
  return Math.max(0, ...k.haltungen.map((h) => h.id), ...k.haltungenStillgelegt) + 1
}

/**
 * Vergleicht zwei Stände: Keine ID darf verschwinden (außer, sie ist in
 * daten/ids.json stillgelegt), umgewidmet werden oder aus der Stilllegung zurückkehren.
 */
export function vergleicheIds(alt: Katalog, neu: Katalog): string[] {
  const fehler: string[] = []
  const vorher = eintraege(alt)
  const nachher = eintraege(neu)
  const still = new Set(neu.stillgelegt)
  const text = (e: Eintrag) => (e.wahl ? `${e.was}, Wahl ${e.wahl}` : e.was)
  for (const [id, a] of vorher) {
    const n = nachher.get(id)
    if (n === undefined) {
      if (!still.has(id))
        fehler.push(`ID ${id} (${text(a)}) ist entfernt – Einträge bleiben stehen; wenn sie wirklich weg müssen, in daten/ids.json mit Grund stilllegen`)
    } else if (n.was !== a.was || (a.wahl && n.wahl !== a.wahl)) {
      fehler.push(`ID ${id} ist umgewidmet (vorher ${text(a)}, jetzt ${text(n)}) – neuer Eintrag braucht eine neue ID (npm run daten:id)`)
    }
  }
  for (const id of alt.stillgelegt) {
    if (!still.has(id)) fehler.push(`ID ${id} fehlt in daten/ids.json – stillgelegte IDs bleiben dort für immer`)
  }
  // Haltungen: eigener Nummernkreis, ebenfalls nie wiederverwendet (gespeicherte Runden verweisen darauf).
  const haltungenStill = new Set(neu.haltungenStillgelegt)
  for (const h of alt.haltungen) {
    if (!neu.haltungen.some((x) => x.id === h.id) && !haltungenStill.has(h.id))
      fehler.push(`Haltung ${h.id} ist entfernt – wenn sie wirklich weg muss, in daten/ids.json unter „haltungen_stillgelegt“ mit Grund eintragen`)
  }
  for (const id of alt.haltungenStillgelegt) {
    if (!haltungenStill.has(id)) fehler.push(`Haltung ${id} fehlt in daten/ids.json → „haltungen_stillgelegt“ – stillgelegte IDs bleiben dort für immer`)
  }
  return fehler
}
