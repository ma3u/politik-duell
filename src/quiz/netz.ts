// Netzwerk-Einstellungen des Quiz – eigene kleine Datei, weil auch die Datenschutzerklärung sie liest.

/**
 * Firebase Realtime Database zur Vermittlung (VITE_FIREBASE_DATABASE_URL, z. B.
 * `https://<projekt>-default-rtdb.europe-west1.firebasedatabase.app`). Hat Vorrang vor Supabase.
 * Regeln: firebase/database.rules.json.
 */
export const FIREBASE_URL: string | null = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(firebasedatabase\.app|firebaseio\.com)\/?$/.test(
  String(import.meta.env.VITE_FIREBASE_DATABASE_URL ?? ''),
)
  ? String(import.meta.env.VITE_FIREBASE_DATABASE_URL).replace(/\/$/, '')
  : null

const REGIONEN: Record<string, string> = { 'europe-west1': 'Belgien', 'asia-southeast1': 'Singapur', 'us-central1': 'USA' }

/** Standort der Firebase-Datenbank für die Datenschutzerklärung (aus der Adresse; ohne Region: USA). */
export function firebaseStandort(url: string): string {
  const region = /\.([a-z]+-[a-z]+\d)\.firebasedatabase\.app/.exec(url)?.[1] ?? 'us-central1'
  return REGIONEN[region] ?? region
}

/** Wer die Verbindungen vermittelt – für Hinweise in der App. */
export const VERMITTLUNG = FIREBASE_URL
  ? `Google Firebase (Rechenzentrum in ${firebaseStandort(FIREBASE_URL)})`
  : 'Supabase (Rechenzentrum in Frankfurt am Main)'

/**
 * STUN-Server für Direktverbindungen übers Internet (VITE_STUN_URLS, durch Komma getrennt, z. B.
 * `stun:stun.example.eu:3478`). Standard: keiner – dann verbinden sich Geräte direkt nur im selben Netz, sonst
 * über die Weiterleitung. Der Betreiber eines STUN-Servers sieht die IP-Adresse (docs/plan-quiz.md, Q3).
 */
export const STUN_URLS: string[] = String(import.meta.env.VITE_STUN_URLS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter((s) => /^stuns?:/.test(s))

/** Rechnername eines STUN-Servers für die Datenschutzerklärung. */
export const stunHost = (url: string) => url.replace(/^stuns?:/, '').replace(/:\d+$/, '')
