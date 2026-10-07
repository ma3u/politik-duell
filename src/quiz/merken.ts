// „Auf diesem Gerät merken“: Spielername und eigener Raumname im localStorage – nur, wenn man das Häkchen setzt
// (ausdrücklich gewünscht, § 25 Abs. 2 Nr. 2 TDDDG). Ohne Häkchen bleibt nichts im Browser; Abwählen löscht alles.

const SCHLUESSEL = 'politik-duell-quiz'

export interface Gemerkt {
  name: string
  /** Eigener Raumname (für „Raum eröffnen“ beim nächsten Mal). */
  raum?: string
}

export function gemerkt(): Gemerkt | null {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    if (!roh) return null
    const d = JSON.parse(roh) as Partial<Gemerkt>
    return { name: typeof d.name === 'string' ? d.name.slice(0, 40) : '', raum: typeof d.raum === 'string' ? d.raum.slice(0, 40) : undefined }
  } catch {
    return null
  }
}

export function merken(g: Gemerkt) {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(g))
  } catch {
    // privater Modus o. Ä.: dann eben nicht
  }
}

export function vergessen() {
  try {
    localStorage.removeItem(SCHLUESSEL)
  } catch {
    // nichts zu tun
  }
}
