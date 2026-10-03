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

/** Treffer eines Begriffs in allen Seiten (`fliessend`: Seiten schon mit `fliesstext` aufbereitet – spart Zeit bei vielen Begriffen). */
export function zaehle(seiten: string[], begriff: string, fliessend = false): number {
  const m = new RegExp(begriffQuelle(begriff), 'giu')
  return seiten.reduce((s, roh) => s + [...(fliessend ? roh : fliesstext(roh)).matchAll(m)].length, 0)
}

/** Ganze Wörter, in denen ein Begriff vorkommt („sucht“ → „untersucht“, „Suchthilfe“ …), mit Anzahl. */
export function wortformen(seiten: string[], begriff: string, fliessend = false): Map<string, number> {
  const m = new RegExp(begriffQuelle(begriff), 'giu')
  const buchstabe = /[\p{L}\p{N}]/u
  const formen = new Map<string, number>()
  for (const roh of seiten) {
    const text = fliessend ? roh : fliesstext(roh)
    for (const t of text.matchAll(m)) {
      // Vom Treffer aus bis zur Wortgrenze erweitern (statt eines teuren Musters mit Präfix).
      let von = t.index
      let bis = t.index + t[0].length
      while (von > 0 && buchstabe.test(text[von - 1])) von--
      while (bis < text.length && buchstabe.test(text[bis])) bis++
      const form = text.slice(von, bis).toLowerCase().replace(/\s+/g, '')
      formen.set(form, (formen.get(form) ?? 0) + 1)
    }
  }
  return formen
}
