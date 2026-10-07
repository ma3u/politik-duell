// Merkbare Raumnamen („Kluge Eule 27“) statt kryptischer Codes. Aus dem Namen berechnet jedes Gerät denselben
// sechsstelligen Raumcode (Schlüssel in der Vermittlung, Regeln in firebase/database.rules.json) – der Name selbst
// muss nirgends gespeichert werden. Ohne Umlaute, damit er sich leicht sagen und tippen lässt; das Adjektiv
// beginnt möglichst mit demselben Buchstaben wie das Tier (Stabreim merkt sich leichter).

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

type Geschlecht = 'm' | 'f' | 'n'
const TIERE: [string, Geschlecht][] = [
  ['Eule', 'f'], ['Fuchs', 'm'], ['Biber', 'm'], ['Dachs', 'm'], ['Igel', 'm'], ['Otter', 'm'], ['Meise', 'f'],
  ['Luchs', 'm'], ['Wal', 'm'], ['Robbe', 'f'], ['Hummel', 'f'], ['Panda', 'm'], ['Pinguin', 'm'], ['Elster', 'f'],
  ['Falke', 'm'], ['Kranich', 'm'], ['Lama', 'n'], ['Zebra', 'n'], ['Koala', 'm'], ['Marder', 'm'], ['Specht', 'm'],
  ['Schwan', 'm'], ['Tiger', 'm'], ['Wiesel', 'n'], ['Rabe', 'm'], ['Hase', 'm'], ['Biene', 'f'], ['Ente', 'f'],
  ['Taube', 'f'], ['Katze', 'f'], ['Maus', 'f'], ['Ziege', 'f'], ['Kamel', 'n'], ['Pony', 'n'], ['Reh', 'n'],
  ['Huhn', 'n'], ['Nashorn', 'n'], ['Krokodil', 'n'], ['Seehund', 'm'], ['Mops', 'm'],
]
const ADJEKTIVE = [
  'flink', 'mutig', 'klug', 'wach', 'tapfer', 'schlau', 'munter', 'neugierig', 'eifrig', 'fix', 'frech', 'heiter',
  'listig', 'pfiffig', 'ruhig', 'stolz', 'wild', 'witzig', 'lustig', 'sanft', 'kess', 'bunt', 'flott', 'keck', 'lieb',
  'emsig', 'zahm', 'kernig', 'mild', 'putzig', 'rasant', 'treu',
]
const ENDUNG: Record<Geschlecht, string> = { m: 'er', f: 'e', n: 'es' }

const gross = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)

/** Ein neuer Raumname, z. B. „Kluges Krokodil 27“ oder „Flinker Fuchs 8“. `zufall` liefert [0, 1). */
export function neuerRaumname(zufall: () => number = Math.random): string {
  const [tier, geschlecht] = TIERE[Math.floor(zufall() * TIERE.length)]
  const passend = ADJEKTIVE.filter((a) => a[0] === tier[0].toLowerCase())
  const liste = passend.length ? passend : ADJEKTIVE
  const adjektiv = liste[Math.floor(zufall() * liste.length)]
  const zahl = 2 + Math.floor(zufall() * 98)
  return `${gross(adjektiv)}${ENDUNG[geschlecht]} ${tier} ${zahl}`
}

/** Vergleichbare Form: klein, Umlaute ausgeschrieben, nur Buchstaben/Ziffern mit Bindestrich („kluge-eule-27“). */
export function normalisiereRaumname(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Raumcode aus dem Namen – auf allen Geräten gleich (FNV-1a, zwei Durchläufe). */
export function codeAusName(name: string): string {
  const norm = normalisiereRaumname(name)
  let a = 0x811c9dc5
  let b = 0x01000193 ^ norm.length
  for (let i = 0; i < norm.length; i++) {
    const c = norm.charCodeAt(i)
    a = Math.imul(a ^ c, 0x01000193) >>> 0
    b = Math.imul(b ^ (c + 31 * i), 0x01000193) >>> 0
  }
  let n = BigInt(a) * 0x100000000n + BigInt(b)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[Number(n % 31n)]
    n /= 31n
  }
  return code
}

export const istRaumcode = (s: string) => new RegExp(`^[${ALPHABET}]{6}$`).test(s)

/** Anzeigeform eines eingegebenen oder per Link übergebenen Namens („kluge-eule-27“ → „Kluge Eule 27“). */
export const raumnameAnzeige = (s: string) =>
  normalisiereRaumname(s)
    .split('-')
    .filter(Boolean)
    .map(gross)
    .join(' ')

export interface Raum {
  code: string
  /** Anzeigename; null bei einem alten sechsstelligen Code. */
  name: string | null
}

/**
 * Liest, was jemand eingibt oder im Link steht: ein Raumname (mindestens zwei Wörter oder ein Wort mit Zahl,
 * höchstens 40 Zeichen) oder ein alter sechsstelliger Code. Sonst null.
 */
export function raumAusEingabe(eingabe: string): Raum | null {
  const roh = eingabe.trim()
  if (istRaumcode(roh.toUpperCase()) && !/\s|-/.test(roh) && /\d/.test(roh)) return { code: roh.toUpperCase(), name: null }
  const norm = normalisiereRaumname(roh)
  if (norm.length < 3 || norm.length > 40 || !/[a-z]/.test(norm) || !norm.includes('-')) return null
  return { code: codeAusName(norm), name: raumnameAnzeige(norm) }
}

/** Teil der Adresse für einen Raum (#/quiz/<…>): der Name mit Bindestrichen, sonst der Code. */
export const raumPfad = (r: Raum) => (r.name ? normalisiereRaumname(r.name) : r.code)
