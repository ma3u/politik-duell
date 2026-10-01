// Zitatprüfung: Steht das wörtliche Zitat einer Maßnahme wirklich auf der
// angegebenen Seite des Programms? Reine Funktionen plus Textauszug aus PDFs;
// Herunterladen und Ausgabe übernimmt scripts/pruefe-zitate.ts.

/**
 * Vergleichsform: nur Buchstaben und Ziffern, klein. So stören Zeilenumbrüche,
 * Silbentrennung („Woh- nungen“), weiche Trennzeichen, Ligaturen, Anführungszeichen
 * und Leerzeichen aus dem PDF-Textauszug nicht.
 */
export function kompakt(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

/** Auslassungen im Zitat („…“, „[…]“, „...“) trennen Teile, die der Reihe nach vorkommen müssen. */
export function zitatTeile(zitat: string): string[] {
  return zitat
    .split(/\[\s*(?:…|\.\.\.)\s*\]|…|\.\.\./)
    .map(kompakt)
    .filter((t) => t.length > 0)
}

function enthaelt(text: string, teile: string[]): boolean {
  let ab = 0
  for (const teil of teile) {
    const i = text.indexOf(teil, ab)
    if (i < 0) return false
    ab = i + teil.length
  }
  return teile.length > 0
}

export type ZitatBefund =
  | { status: 'ok' }
  | { status: 'andere_seite'; seiten: number[] }
  | { status: 'nicht_gefunden' }

/**
 * Sucht das Zitat auf Seite `erwartet` (1-basiert, wie #page=N). Ein Zitat, das
 * auf die nächste Seite umbricht, gilt als gefunden. Sonst: Auf welchen Seiten steht es?
 */
export function findeZitat(zitat: string, seiten: string[], erwartet: number): ZitatBefund {
  const teile = zitatTeile(zitat)
  const kompakteSeiten = seiten.map(kompakt)
  const auf = (n: number) => enthaelt(kompakteSeiten[n - 1] ?? '', teile)
  const mitFolgeseite = (n: number) => enthaelt((kompakteSeiten[n - 1] ?? '') + (kompakteSeiten[n] ?? ''), teile)
  // Beginnt auf Seite n: steht ganz dort oder bricht auf die nächste Seite um (steht aber nicht ganz auf ihr).
  const beginntAuf = (n: number) => auf(n) || (mitFolgeseite(n) && !auf(n + 1))
  if (beginntAuf(erwartet)) return { status: 'ok' }
  const treffer = kompakteSeiten.map((_, i) => i + 1).filter(beginntAuf)
  return treffer.length ? { status: 'andere_seite', seiten: treffer } : { status: 'nicht_gefunden' }
}

/** Seite aus einem Beleg wie „…/programm.pdf#page=17“. */
export function seiteVon(url: string): number | null {
  const m = /#page=(\d+)$/.exec(url)
  return m ? Number(m[1]) : null
}

/** Text jeder Seite eines PDFs (Index 0 = Seite 1). */
export async function seitenTexte(pdf: Uint8Array): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const ladeAuftrag = pdfjs.getDocument({ data: pdf, isEvalSupported: false, verbosity: pdfjs.VerbosityLevel.ERRORS })
  const dokument = await ladeAuftrag.promise
  try {
    const seiten: string[] = []
    for (let n = 1; n <= dokument.numPages; n++) {
      const inhalt = await (await dokument.getPage(n)).getTextContent()
      seiten.push(inhalt.items.map((t) => ('str' in t ? t.str + (t.hasEOL ? '\n' : ' ') : '')).join(''))
    }
    return seiten
  } finally {
    await ladeAuftrag.destroy()
  }
}
