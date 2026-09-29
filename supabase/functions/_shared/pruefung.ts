// Logik der Edge Function `pruefung`: Eingeladene Prüfende bewerten Maßnahmen
// über einen persönlichen Link (Ablauf: docs/plan-pruefung.md).
// Reines TypeScript ohne Deno-APIs – die Datenbank steckt hinter `PruefSpeicher`,
// damit sich alles in der App testen lässt.

import { EingabeFehler } from './fehler.ts'

/** Token im Link: 32 Zufallsbytes, base64url ohne Auffüllung. */
export const TOKEN_MUSTER = /^[A-Za-z0-9_-]{43}$/

export const MAX_NOTIZ = 1000
/** Höchstzahl Bewertungen je Speichern-Aufruf (die App schickt nur Geändertes). */
export const MAX_BEWERTUNGEN_JE_AUFRUF = 50

/** Pro Einladung. Automatisches Zwischenspeichern braucht einige Aufrufe. */
export const RATE_LIMIT_EINLADUNG = { max: 300, fenster: '30 minutes' }
/** Alle Aufrufe zusammen, auch mit unbekanntem Token (bremst Raten von Tokens). */
export const RATE_LIMIT_PRUEFUNG_GLOBAL = { max: 2000, fenster: '1 hour' }
/** Feste ID des globalen Zählers für `pruefung` (getrennt von `analyse`). */
export const PRUEFUNG_GLOBAL = '00000000-0000-0000-0000-000000000001'

export type Wert = 0 | 1 | 2 | 3

export interface BewertungEingabe {
  massnahme_id: number
  wirksamkeit: Wert | null
  umsetzbarkeit: Wert | null
  notiz: string | null
  /** Die Person hat die Empfehlung (Entwurfswerte) geöffnet. */
  empfehlung_gesehen: boolean
}

export type PruefAnfrage =
  | { token: string; aktion: 'laden' }
  | { token: string; aktion: 'einwilligen'; name_oeffentlich: boolean }
  | { token: string; aktion: 'speichern'; bewertungen: BewertungEingabe[] }
  | { token: string; aktion: 'absenden'; thema_id: number }
  | { token: string; aktion: 'widerrufen' }

export interface Einladung {
  id: string
  name: string
  themen: number[]
  gesperrt: boolean
  einwilligung_am: string | null
  name_oeffentlich: boolean
}

export interface GespeicherteBewertung extends BewertungEingabe {
  thema_id: number
  nach_empfehlung_geaendert: boolean
  abgesendet: boolean
}

export interface PruefSpeicher {
  /** Zählt eine Anfrage; false, wenn das Limit im Zeitfenster überschritten ist. */
  imLimit(schluessel: string, max: number, fenster: string): Promise<boolean>
  einladung(tokenHash: string): Promise<Einladung | null>
  bewertungen(einladungId: string): Promise<GespeicherteBewertung[]>
  einwilligen(einladungId: string, nameOeffentlich: boolean): Promise<void>
  /** Upsert je (Einladung, Maßnahme). */
  speichern(einladungId: string, zeilen: GespeicherteBewertung[]): Promise<void>
  absenden(einladungId: string, themaId: number): Promise<void>
  /** Löscht alle Bewertungen und die Einwilligung. */
  widerrufen(einladungId: string): Promise<void>
}

/** IDs der Prüfeinheiten (Instrumente, Maßnahmen ohne Instrument) je Thema – aus der Tabelle `pruef_einheiten`. */
export type MassnahmenJeThema = Record<number, readonly number[]>

export interface Antwort {
  status: number
  body: unknown
}

export async function tokenHash(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Neuer Token für eine Einladung (Admin-Ansicht). */
export function neuerToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const istWert = (v: unknown): v is Wert | null => v === null || v === 0 || v === 1 || v === 2 || v === 3
const istId = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= 2147483647

/** Prüft Form und Wertebereiche. Ein ungültiger Token ergibt später 403, nicht 400. */
export function pruefePruefAnfrage(roh: unknown): PruefAnfrage {
  const a = roh as Record<string, unknown> | null
  if (!a || typeof a !== 'object' || Array.isArray(a)) throw new EingabeFehler('Anfrage fehlt.')
  const token = typeof a.token === 'string' ? a.token : ''
  switch (a.aktion) {
    case 'laden':
    case 'widerrufen':
      return { token, aktion: a.aktion }
    case 'einwilligen':
      if (typeof a.name_oeffentlich !== 'boolean') throw new EingabeFehler('Angabe zur Namensnennung fehlt.')
      return { token, aktion: 'einwilligen', name_oeffentlich: a.name_oeffentlich }
    case 'absenden':
      if (!istId(a.thema_id)) throw new EingabeFehler('Ungültiges Thema.')
      return { token, aktion: 'absenden', thema_id: a.thema_id }
    case 'speichern': {
      const liste = a.bewertungen
      if (!Array.isArray(liste) || liste.length === 0 || liste.length > MAX_BEWERTUNGEN_JE_AUFRUF)
        throw new EingabeFehler('Ungültige Bewertungen.')
      const gesehen = new Set<number>()
      const bewertungen = liste.map((b): BewertungEingabe => {
        if (!b || typeof b !== 'object') throw new EingabeFehler('Ungültige Bewertung.')
        const { massnahme_id, wirksamkeit, umsetzbarkeit, notiz, empfehlung_gesehen } = b as Record<string, unknown>
        if (!istId(massnahme_id) || gesehen.has(massnahme_id)) throw new EingabeFehler('Ungültige Maßnahme.')
        gesehen.add(massnahme_id)
        if (!istWert(wirksamkeit) || !istWert(umsetzbarkeit)) throw new EingabeFehler('Werte müssen zwischen 0 und 3 liegen.')
        if (notiz !== null && notiz !== undefined && (typeof notiz !== 'string' || notiz.length > MAX_NOTIZ))
          throw new EingabeFehler(`Notiz zu lang (höchstens ${MAX_NOTIZ} Zeichen).`)
        if (typeof empfehlung_gesehen !== 'boolean') throw new EingabeFehler('Ungültige Bewertung.')
        if (empfehlung_gesehen && (wirksamkeit === null || umsetzbarkeit === null))
          throw new EingabeFehler('Die Empfehlung gibt es erst nach der eigenen Bewertung.')
        const text = typeof notiz === 'string' ? notiz.trim() : ''
        return { massnahme_id, wirksamkeit, umsetzbarkeit, notiz: text || null, empfehlung_gesehen }
      })
      return { token, aktion: 'speichern', bewertungen }
    }
    default:
      throw new EingabeFehler('Unbekannte Aktion.')
  }
}

const KEIN_ZUGANG: Antwort = { status: 403, body: { fehler: 'Dieser Link ist nicht (mehr) gültig.' } }

/** Bearbeitet eine geprüfte Anfrage. EingabeFehler werden zu 400. */
export async function bearbeitePruefung(
  anfrage: PruefAnfrage,
  speicher: PruefSpeicher,
  katalog: MassnahmenJeThema,
): Promise<Antwort> {
  try {
    return await bearbeite(anfrage, speicher, katalog)
  } catch (e) {
    if (e instanceof EingabeFehler) return { status: 400, body: { fehler: e.message } }
    throw e
  }
}

async function bearbeite(anfrage: PruefAnfrage, speicher: PruefSpeicher, katalog: MassnahmenJeThema): Promise<Antwort> {
  const g = RATE_LIMIT_PRUEFUNG_GLOBAL
  if (!(await speicher.imLimit(PRUEFUNG_GLOBAL, g.max, g.fenster)))
    return { status: 503, body: { fehler: 'Gerade zu viele Anfragen. Bitte später noch einmal versuchen.' } }

  // Unbekannt, gesperrt oder falsches Format: immer dieselbe Antwort ohne Details.
  if (!TOKEN_MUSTER.test(anfrage.token)) return KEIN_ZUGANG
  const einladung = await speicher.einladung(await tokenHash(anfrage.token))
  if (!einladung || einladung.gesperrt) return KEIN_ZUGANG

  const e = RATE_LIMIT_EINLADUNG
  if (!(await speicher.imLimit(einladung.id, e.max, e.fenster)))
    return { status: 429, body: { fehler: 'Zu viele Anfragen. Bitte ein paar Minuten warten.' } }

  const ok = { status: 200, body: { ok: true } }

  switch (anfrage.aktion) {
    case 'laden': {
      const bewertungen = await speicher.bewertungen(einladung.id)
      return {
        status: 200,
        body: {
          name: einladung.name,
          themen: einladung.themen,
          einwilligung: einladung.einwilligung_am !== null,
          name_oeffentlich: einladung.name_oeffentlich,
          bewertungen: bewertungen.map(({ massnahme_id, wirksamkeit, umsetzbarkeit, notiz, empfehlung_gesehen, abgesendet }) => ({
            massnahme_id, wirksamkeit, umsetzbarkeit, notiz, empfehlung_gesehen, abgesendet,
          })),
        },
      }
    }

    case 'einwilligen':
      await speicher.einwilligen(einladung.id, anfrage.name_oeffentlich)
      return ok

    case 'widerrufen':
      await speicher.widerrufen(einladung.id)
      return ok

    case 'speichern': {
      if (!einladung.einwilligung_am) throw new EingabeFehler('Bitte zuerst einwilligen.')
      const themaVon = new Map<number, number>()
      for (const t of einladung.themen) for (const id of katalog[t] ?? []) themaVon.set(id, t)
      const vorher = new Map((await speicher.bewertungen(einladung.id)).map((b) => [b.massnahme_id, b]))

      const zeilen = anfrage.bewertungen.map((b): GespeicherteBewertung => {
        const thema_id = themaVon.get(b.massnahme_id)
        if (thema_id === undefined) throw new EingabeFehler('Diese Maßnahme gehört nicht zu deinen Themen.')
        const alt = vorher.get(b.massnahme_id)
        if (alt?.abgesendet && (b.wirksamkeit === null || b.umsetzbarkeit === null))
          throw new EingabeFehler('Abgesendete Bewertungen brauchen beide Werte.')
        const empfehlung_gesehen = b.empfehlung_gesehen || (alt?.empfehlung_gesehen ?? false)
        if (empfehlung_gesehen && (b.wirksamkeit === null || b.umsetzbarkeit === null))
          throw new EingabeFehler('Nach dem Ansehen der Empfehlung brauchen beide Werte eine Angabe.')
        // Geändert, nachdem die Empfehlung schon offen war? Nur vermerken, nicht verhindern.
        const geaendert =
          alt !== undefined && alt.empfehlung_gesehen && (alt.wirksamkeit !== b.wirksamkeit || alt.umsetzbarkeit !== b.umsetzbarkeit)
        return {
          ...b,
          thema_id,
          empfehlung_gesehen,
          nach_empfehlung_geaendert: (alt?.nach_empfehlung_geaendert ?? false) || geaendert,
          abgesendet: alt?.abgesendet ?? false,
        }
      })
      await speicher.speichern(einladung.id, zeilen)
      return ok
    }

    case 'absenden': {
      if (!einladung.einwilligung_am) throw new EingabeFehler('Bitte zuerst einwilligen.')
      if (!einladung.themen.includes(anfrage.thema_id)) throw new EingabeFehler('Dieses Thema ist nicht freigegeben.')
      const bewertet = new Set(
        (await speicher.bewertungen(einladung.id))
          .filter((b) => b.wirksamkeit !== null && b.umsetzbarkeit !== null)
          .map((b) => b.massnahme_id),
      )
      const offen = (katalog[anfrage.thema_id] ?? []).filter((id) => !bewertet.has(id)).length
      if (offen) throw new EingabeFehler(`Noch ${offen} Maßnahme${offen === 1 ? '' : 'n'} ohne Bewertung.`)
      await speicher.absenden(einladung.id, anfrage.thema_id)
      return ok
    }
  }
}
