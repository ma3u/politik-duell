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

/** Private Ligatur-Glyphen aus Word-/Skia-PDFs (etwa BSW MV 2026), die der Textauszug statt „ti“, „ft“ usw. liefert. */
const LIGATUREN: Record<string, string> = {
  Ɵ: 'ti',
  Ō: 'ft',
  Ʃ: 'tt',
  ĩ: 'fb',
  ƞ: 'tf',
  ƪ: 'tf',
  ŏ: 'ff',
  Ņ: 'fk',
  Ī: 'ffb',
  ņ: 'ffk',
}

/**
 * Textauszug ohne Eigenheiten mancher PDFs: Zeilennummern am Zeilenende (Wahlprogramme mit
 * Zeilenzählung, etwa CDU MV 2026) fallen weg, Ligatur-Glyphen werden aufgelöst. Wird nur als
 * zweiter Versuch benutzt, damit echte Zahlen am Zeilenende das Prüfen nicht verfälschen.
 */
export function bereinigeSeite(text: string): string {
  return text.replace(/[ƟŌƩĩƞƪŏŅĪņ]/g, (c) => LIGATUREN[c]).replace(/[ \t]*\b\d{3,4}[ \t]*$/gm, '')
}

/**
 * Sucht das Zitat auf Seite `erwartet` (1-basiert, wie #page=N). Ein Zitat, das
 * auf die nächste Seite umbricht, gilt als gefunden. Sonst: Auf welchen Seiten steht es?
 */
export function findeZitat(zitat: string, seiten: string[], erwartet: number): ZitatBefund {
  const roh = findeInSeiten(zitat, seiten, erwartet)
  if (roh.status === 'ok') return roh
  const bereinigt = findeInSeiten(zitat, seiten.map(bereinigeSeite), erwartet)
  return bereinigt.status === 'ok' || roh.status === 'nicht_gefunden' ? bereinigt : roh
}

function findeInSeiten(zitat: string, seiten: string[], erwartet: number): ZitatBefund {
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

/** Vergleichsform wie `kompakt` und zu jedem Zeichen die Stelle im (NFKC-normalisierten) Text. */
function kompaktMitStellen(text: string): { kompakt: string; stellen: number[]; text: string } {
  const t = text.normalize('NFKC')
  let kompakt = ''
  const stellen: number[] = []
  for (let i = 0; i < t.length; ) {
    const z = String.fromCodePoint(t.codePointAt(i)!)
    for (const k of z.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')) {
      kompakt += k
      stellen.push(i)
    }
    i += z.length
  }
  return { kompakt, stellen, text: t }
}

/** Wörter, die eine Aussage einschränken oder umkehren – stehen sie im ausgelassenen Text, ändert das Zitat womöglich den Sinn. */
const EINSCHRAENKUNG = /(?<![\p{L}])(?:nicht|kein\p{L}*|nie|niemals|ohne|sofern|falls|wenn|soweit|solange|nur|außer|ausgenommen|vorausgesetzt|allerdings|jedoch|aber|lehnen|ablehn\p{L}*|prüfen|geprüft|langfristig)(?![\p{L}])/giu

export interface ZitatKontext {
  /** Was zwischen den Teilen des Zitats auf der Seite steht (je Auslassung „[…]“ eine Stelle). */
  auslassungen: string[]
  /** Hinweise für die Belegprüfung: lange Auslassungen, sehr kurze Teile, einschränkende Wörter im Ausgelassenen. */
  warnungen: string[]
}

/**
 * Was ein Zitat auslässt. Lange Auslassungen und kurze Bruchstücke können den Sinn verändern
 * („Wir wollen [… nicht …] abschaffen“); die Belegprüfung sieht deshalb den ausgelassenen Text.
 * null, wenn das Zitat auf der Seite (und ggf. der folgenden) nicht gefunden wird.
 */
export function zitatKontext(zitat: string, seiten: string[], erwartet: number): ZitatKontext | null {
  const teile = zitatTeile(zitat)
  for (const bereinigen of [false, true]) {
    const roh = (seiten[erwartet - 1] ?? '') + '\n' + (seiten[erwartet] ?? '')
    const { kompakt: k, stellen, text } = kompaktMitStellen(bereinigen ? bereinigeSeite(roh) : roh)
    const funde: [number, number][] = []
    let ab = 0
    for (const teil of teile) {
      const i = k.indexOf(teil, ab)
      if (i < 0) break
      funde.push([i, i + teil.length])
      ab = i + teil.length
    }
    if (funde.length !== teile.length || !teile.length) continue
    const auslassungen: string[] = []
    const warnungen: string[] = []
    for (let j = 1; j < funde.length; j++) {
      const von = stellen[funde[j - 1][1] - 1] + 1
      const bis = stellen[funde[j][0]]
      const aus = text.slice(von, bis).replace(/\s+/g, ' ').trim()
      auslassungen.push(aus)
      const laenge = funde[j][0] - funde[j - 1][1]
      if (laenge > 200) warnungen.push(`Auslassung ${j} umfasst ${laenge} Zeichen`)
      const woerter = [...new Set([...aus.matchAll(EINSCHRAENKUNG)].map((m) => m[0].toLowerCase()))]
      if (woerter.length) warnungen.push(`Auslassung ${j} enthält ${woerter.map((w) => `„${w}“`).join(', ')}`)
    }
    // Kurze Teile zählen nur neben einer echten Auslassung – nicht neben Zeilennummern (etwa CDU MV).
    const echt = (j: number) => /\p{L}/u.test(auslassungen[j] ?? '')
    for (const [j, t] of teile.entries())
      if (teile.length > 1 && t.length < 20 && (echt(j - 1) || echt(j))) warnungen.push(`Teil ${j + 1} hat nur ${t.length} Zeichen`)
    return { auslassungen, warnungen }
  }
  return null
}

const ZAHLWOERTER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf']

/** Zahlen aus einem Text, ohne Tausenderpunkte („100.000“ = „100000“); „sechs“ zählt als 6, „ein(e)“ als 1. */
const zahlen = (t: string) => [
  ...[...t.matchAll(/\d+(?:[.  ]\d{3})*(?:,\d+)?/g)].map((m) => m[0].replace(/[.  ]/g, '')),
  ...[...t.matchAll(/(?<![\p{L}])(null|eins?|eine[mnrs]?|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)(?![\p{L}])/giu)].map((m) =>
    String(m[1].toLowerCase().startsWith('ein') ? 1 : ZAHLWOERTER.indexOf(m[1].toLowerCase())),
  ),
]

/** Zahlen der Beschreibung, die im Zitat nicht vorkommen – die Beschreibung soll nichts dazuerfinden. */
export function fehlendeZahlen(beschreibung: string, zitat: string): string[] {
  const imZitat = new Set(zahlen(zitat))
  return [...new Set([...beschreibung.matchAll(/\d+(?:[.  ]\d{3})*(?:,\d+)?/g)].map((m) => m[0].replace(/[.  ]/g, '')))].filter((z) => !imZitat.has(z))
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
