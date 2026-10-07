import { FIREBASE_URL } from './netz'

// Öffentliche Räume („Mit Zufälligen spielen“): Die Spielleitung eines öffentlichen Raums trägt Name und
// Spielerzahl in der Firebase Realtime Database unter quiz-oeffentlich/<Code> ein, solange der Raum offen ist
// (Regeln: firebase/database.rules.json). Alle können die Liste lesen und beitreten. Der Eintrag wird beim Start,
// beim Schließen und beim Verlassen der Seite gelöscht; ohne Lebenszeichen (alle 30 s) gilt er nach 90 s als weg.

export interface OeffentlicherRaum {
  code: string
  name: string
  spieler: number
  /** Serverzeit des letzten Lebenszeichens (ms). */
  t: number
}

export const OEFFENTLICH_MOEGLICH = FIREBASE_URL !== null
const PFAD = 'quiz-oeffentlich'
const LEBENSZEICHEN_MS = 30_000
const VERFALL_MS = 90_000

const adresse = (pfad: string) => `${FIREBASE_URL}/${pfad}.json`

/** Beobachtet die Liste offener Räume (Server-Sent Events). Gibt eine Funktion zum Beenden zurück. */
export function beobachteOeffentliche(cb: (raeume: OeffentlicherRaum[]) => void): () => void {
  if (!FIREBASE_URL) return () => {}
  const stand = new Map<string, { n?: unknown; s?: unknown; t?: unknown }>()
  const melden = () => {
    const jetzt = Date.now()
    cb(
      [...stand.entries()]
        .map(([code, w]) => ({ code, name: String(w.n ?? ''), spieler: Number(w.s ?? 0), t: Number(w.t ?? 0) }))
        .filter((r) => r.name && r.spieler >= 1 && r.spieler < 8 && jetzt - r.t < VERFALL_MS)
        .sort((a, b) => b.t - a.t),
    )
  }
  const anwenden = (e: MessageEvent<string>) => {
    let d: { path?: string; data?: unknown }
    try {
      d = JSON.parse(e.data)
    } catch {
      return
    }
    if (typeof d?.path !== 'string') return
    const teile = d.path.split('/').filter(Boolean)
    if (!teile.length) {
      stand.clear()
      if (d.data && typeof d.data === 'object') for (const [k, v] of Object.entries(d.data)) stand.set(k, v as object)
    } else if (teile.length === 1) {
      if (d.data === null) stand.delete(teile[0])
      else if (e.type === 'patch') stand.set(teile[0], { ...stand.get(teile[0]), ...(d.data as object) })
      else stand.set(teile[0], d.data as object)
    } else if (teile.length === 2) {
      stand.set(teile[0], { ...stand.get(teile[0]), [teile[1]]: d.data })
    }
    melden()
  }
  const quelle = new EventSource(adresse(PFAD))
  quelle.addEventListener('put', anwenden)
  quelle.addEventListener('patch', anwenden)
  // Verfallene Einträge auch ohne neue Nachricht ausblenden.
  const t = setInterval(melden, 10_000)
  return () => {
    clearInterval(t)
    quelle.close()
  }
}

/**
 * Meldet einen öffentlichen Raum an (mit Lebenszeichen) und gibt `aktualisieren(spieler)` und `abmelden()` zurück.
 */
export function meldeOeffentlich(code: string, name: string, spieler: number) {
  if (!FIREBASE_URL) return { aktualisieren: () => {}, abmelden: () => {} }
  let anzahl = spieler
  let aktiv = true
  const schreiben = () =>
    aktiv &&
    void fetch(adresse(`${PFAD}/${code}`), {
      method: 'PUT',
      body: JSON.stringify({ n: name.slice(0, 40), s: Math.min(8, Math.max(1, anzahl)), t: { '.sv': 'timestamp' } }),
    }).catch(() => {})
  const loeschen = (keepalive = false) => fetch(adresse(`${PFAD}/${code}`), { method: 'DELETE', keepalive }).catch(() => {})
  const beimVerlassen = () => void loeschen(true)
  addEventListener('pagehide', beimVerlassen)
  schreiben()
  const t = setInterval(schreiben, LEBENSZEICHEN_MS)
  return {
    aktualisieren(n: number) {
      if (n === anzahl) return
      anzahl = n
      schreiben()
    },
    abmelden() {
      aktiv = false
      clearInterval(t)
      removeEventListener('pagehide', beimVerlassen)
      void loeschen()
    },
  }
}
