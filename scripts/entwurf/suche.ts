// Gemeinsame Suchlogik für programme:suche und entwurf:treffer: Wortteile ohne Groß-/Kleinschreibung,
// Silbentrennung am Zeilenende und zerlegte Wörter im Textauszug stören nicht.

/** Fließtext einer Seite: Silbentrennung am Zeilenende zusammengezogen, Leerraum vereinheitlicht. */
export const fliesstext = (seite: string) =>
  seite
    .normalize('NFKC')
    .replace(/­/g, '')
    .replace(/(\p{Ll})[-‐]\s*\n\s*(\p{Ll})/gu, '$1$2')
    .replace(/\s+/g, ' ')

// Manche PDFs zerlegen Wörter im Textauszug („unab - dingbar“, „erh ö hen“): Zwischen
// zwei Zeichen eines Begriffs darf deshalb ein Leerzeichen oder eine Trennung stehen.
const zwischen = '(?:\\s*[-‐]\\s+|\\s)?'

/** Regulärer Ausdruck (ohne Flags) für einen Begriff. */
export const begriffQuelle = (b: string) =>
  [...b.trim().replace(/\s+/g, '')].map((z) => z.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(zwischen)

/** Treffer eines Begriffs in allen Seiten. */
export function zaehle(seiten: string[], begriff: string): number {
  const m = new RegExp(begriffQuelle(begriff), 'giu')
  return seiten.reduce((s, roh) => s + [...fliesstext(roh).matchAll(m)].length, 0)
}
