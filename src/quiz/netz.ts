// Netzwerk-Einstellungen des Quiz – eigene kleine Datei, weil auch die Datenschutzerklärung sie liest.

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
