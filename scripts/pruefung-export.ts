// Übernahme der Prüfergebnisse (Export aus Admin → Prüfung) in daten/themen/*.json.
// Reine Funktionen, damit sie sich testen lassen; das Kommando steht in
// scripts/uebernehme-pruefung.ts.
import { pruefEinheiten, type Katalog } from '../src/data/katalog.ts'
import { KRITISCHE_SPANNWEITE, MINDEST_BEWERTUNGEN, werteStimmen, type PruefExport } from '../src/pruefung/auswertung.ts'

const istObjekt = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const DATUM = /^\d{4}-\d{2}-\d{2}$/

export interface ExportPruefung {
  export: PruefExport | null
  fehler: string[]
  warnungen: string[]
}

/**
 * Prüft den Export gegen den Katalog. Unbekannte Felder sind Fehler – so kann
 * nichts außer Zahlen (etwa Namen) ins Repo gelangen.
 */
export function pruefeExport(roh: unknown, katalog: Katalog, { geklaert = false } = {}): ExportPruefung {
  const fehler: string[] = []
  const warnungen: string[] = []
  const nur = (ort: string, o: Record<string, unknown>, erlaubt: string[]) => {
    for (const k of Object.keys(o)) if (!erlaubt.includes(k)) fehler.push(`${ort}: unbekanntes Feld „${k}“ – der Export darf nur Zahlen enthalten`)
  }
  if (!istObjekt(roh) || !Array.isArray(roh.bewertungen)) {
    return { export: null, fehler: ['Export: erwartet { thema_id, datum, bewertungen: [...] }'], warnungen }
  }
  nur('Export', roh, ['thema_id', 'datum', 'bewertungen'])
  const thema = katalog.themen.find((t) => t.id === roh.thema_id)
  if (!thema) fehler.push(`Export: unbekanntes Thema ${String(roh.thema_id)}`)
  if (typeof roh.datum !== 'string' || !DATUM.test(roh.datum)) fehler.push('Export: „datum“ muss JJJJ-MM-TT sein')

  // Bewertet werden Prüfeinheiten: Instrumente und Maßnahmen ohne Instrument (Feld heißt weiter „massnahme_id“).
  const einheiten = pruefEinheiten(katalog)
  const ids = new Set<number>()
  for (const [i, b] of roh.bewertungen.entries()) {
    const ort = `Export › bewertungen[${i}]`
    if (!istObjekt(b)) {
      fehler.push(`${ort}: erwartet ein Objekt`)
      continue
    }
    nur(ort, b, ['massnahme_id', 'anzahl', 'median_w', 'median_u', 'spannweite', 'werte'])
    const m = einheiten.find((x) => x.id === b.massnahme_id)
    if (!m) fehler.push(`${ort}: unbekannte Maßnahme oder unbekanntes Instrument ${String(b.massnahme_id)}`)
    else if (thema && m.thema_id !== thema.id) fehler.push(`${ort}: ${m.id} gehört nicht zum Thema „${thema.name}“`)
    if (typeof b.massnahme_id === 'number') {
      if (ids.has(b.massnahme_id)) fehler.push(`${ort}: Maßnahme ${b.massnahme_id} ist doppelt`)
      ids.add(b.massnahme_id)
    }
    const name = `${m?.instrument ? 'Instrument' : 'Maßnahme'} ${String(b.massnahme_id)}`
    if (!Number.isInteger(b.anzahl) || (b.anzahl as number) < 1) fehler.push(`${ort}: „anzahl“ muss eine ganze Zahl ab 1 sein`)
    else if ((b.anzahl as number) < MINDEST_BEWERTUNGEN)
      warnungen.push(`${name}: nur ${String(b.anzahl)} Bewertung – für „geprueft“ sind mindestens ${MINDEST_BEWERTUNGEN} nötig`)
    for (const feld of ['median_w', 'median_u'] as const) {
      const v = b[feld]
      if (typeof v !== 'number' || v < 0 || v > 3 || !Number.isInteger(v * 2)) {
        fehler.push(`${ort}: „${feld}“ muss zwischen 0 und 3 liegen`)
      } else if (!Number.isInteger(v)) {
        // Gerade Anzahl, zwei verschiedene mittlere Werte: Die Betreiberin entscheidet.
        fehler.push(
          `${name}: „${feld}“ ist ${String(v).replace('.', ',')} – zwischen ${Math.floor(v)} und ${Math.ceil(v)} entscheiden, ` +
            'den Wert in der Exportdatei eintragen und die Entscheidung im Pull Request begründen',
        )
      }
    }
    // Einzelwerte (ohne Personen): Mediane und Spannweite müssen sich daraus ergeben.
    if (b.werte !== undefined) {
      const werte = b.werte
      if (!Array.isArray(werte) || werte.some((x) => !Array.isArray(x) || x.length !== 2 || x.some((v) => !Number.isInteger(v) || v < 0 || v > 3)))
        fehler.push(`${ort}: „werte“ muss eine Liste von [Wirksamkeit, Umsetzbarkeit] sein, je 0 bis 3`)
      else fehler.push(...werteStimmen(name, b as Parameters<typeof werteStimmen>[1]))
    }
    if (!Number.isInteger(b.spannweite) || (b.spannweite as number) < 0 || (b.spannweite as number) > 3) {
      fehler.push(`${ort}: „spannweite“ muss eine ganze Zahl von 0 bis 3 sein`)
    } else if ((b.spannweite as number) >= KRITISCHE_SPANNWEITE) {
      const text = `${name}: Spannweite ${String(b.spannweite)} – vor der Übernahme klären (Maßstab präzisieren oder bei den Prüfenden nachfragen)`
      if (geklaert) warnungen.push(`${text}; laut --geklaert erledigt`)
      else fehler.push(`${text}. Danach mit --geklaert übernehmen.`)
    }
  }
  if (thema) {
    const ohne = einheiten.filter((m) => m.thema_id === thema.id && !ids.has(m.id)).map((m) => m.id)
    if (ohne.length) warnungen.push(`Ohne Bewertung im Export: ${ohne.join(', ')}`)
  }
  return { export: fehler.length ? null : (roh as unknown as PruefExport), fehler, warnungen }
}

/** Dateiname im Repository für einen übernommenen Export. */
export const exportPfad = (e: Pick<PruefExport, 'thema_id' | 'datum'>) => `daten/pruefungen/thema-${String(e.thema_id).padStart(2, '0')}-${e.datum}.json`

export interface Aenderung {
  massnahme_id: number
  vorher: [number, number]
  nachher: [number, number]
}

/**
 * Schreibt die Mediane als `wirksamkeit`/`umsetzbarkeit` in die Themendatei – an
 * das Instrument bzw. an die Maßnahme ohne Instrument – und
 * hält Anzahl, Spannweite, Datum und die ursprünglichen Entwurfswerte in
 * `bewertung` fest. `geprueft` bleibt unverändert: Das setzt die Betreiberin
 * nach der Belegprüfung.
 */
export function uebernehme(themaDatei: unknown, daten: PruefExport): { inhalt: unknown; aenderungen: Aenderung[] } {
  const nach = new Map(daten.bewertungen.map((b) => [b.massnahme_id, b]))
  const aenderungen: Aenderung[] = []
  const t = structuredClone(themaDatei) as { instrumente?: Record<string, unknown>[]; abdeckung?: { massnahmen?: Record<string, unknown>[] }[] }
  const setze = (m: Record<string, unknown>) => {
    const b = nach.get(m.id as number)
    // Maßnahmen mit Instrument haben keine eigene Bewertung.
    if (!b || m.instrument !== undefined) return m
    const alt = m.bewertung as { entwurf?: [number, number] } | undefined
    const vorher: [number, number] = [m.wirksamkeit as number, m.umsetzbarkeit as number]
    aenderungen.push({ massnahme_id: b.massnahme_id, vorher, nachher: [b.median_w, b.median_u] })
    // Feldreihenfolge erhalten, `bewertung` direkt nach `umsetzbarkeit` – für kleine Diffs.
    const neu: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(m)) {
      if (k === 'bewertung') continue
      neu[k] = k === 'wirksamkeit' ? b.median_w : k === 'umsetzbarkeit' ? b.median_u : v
      if (k === 'umsetzbarkeit') {
        neu.bewertung = {
          anzahl: b.anzahl,
          median_w: b.median_w,
          median_u: b.median_u,
          spannweite: b.spannweite,
          datum: daten.datum,
          // Bei erneuter Übernahme bleibt der ursprüngliche Entwurf stehen.
          entwurf: alt?.entwurf ?? vorher,
        }
      }
    }
    return neu
  }
  t.instrumente = t.instrumente?.map(setze)
  for (const a of t.abdeckung ?? []) a.massnahmen = a.massnahmen?.map(setze)
  return { inhalt: t, aenderungen }
}

/** JSON im Stil von daten/: zwei Leerzeichen Einzug, Listen einfacher Werte in einer Zeile. */
export function formatiere(v: unknown, einzug = ''): string {
  const innen = einzug + '  '
  if (Array.isArray(v)) {
    if (v.every((x) => x === null || typeof x !== 'object')) return `[${v.map((x) => JSON.stringify(x)).join(', ')}]`
    return `[\n${v.map((x) => innen + formatiere(x, innen)).join(',\n')}\n${einzug}]`
  }
  if (istObjekt(v)) {
    const eintraege = Object.entries(v).filter(([, x]) => x !== undefined)
    if (!eintraege.length) return '{}'
    return `{\n${eintraege.map(([k, x]) => `${innen}${JSON.stringify(k)}: ${formatiere(x, innen)}`).join(',\n')}\n${einzug}}`
  }
  return JSON.stringify(v)
}
