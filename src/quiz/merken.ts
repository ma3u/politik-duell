// Dein Name im Spiel bleibt auf diesem Gerät (localStorage), damit er beim nächsten Mal schon dasteht. Er verlässt das
// Gerät nur im Spiel (die anderen im Raum sehen ihn). Ein leeres Namensfeld löscht ihn; Raumnamen merkt sich das Quiz
// nicht. Datenschutzerklärung: „Name im Spiel“.

const SCHLUESSEL = 'politik-duell-quiz'

export function gemerkterName(): string {
  try {
    const roh = localStorage.getItem(SCHLUESSEL)
    if (!roh) return ''
    const d = JSON.parse(roh) as { name?: unknown }
    return typeof d.name === 'string' ? d.name.slice(0, 20) : ''
  } catch {
    return ''
  }
}

export function nameMerken(name: string) {
  try {
    const n = name.trim()
    // Ältere Fassungen speicherten auch den Raumnamen – beim Schreiben bleibt nur der Name.
    if (n) localStorage.setItem(SCHLUESSEL, JSON.stringify({ name: n.slice(0, 20) }))
    else localStorage.removeItem(SCHLUESSEL)
  } catch {
    // privater Modus o. Ä.: dann eben nicht
  }
}
