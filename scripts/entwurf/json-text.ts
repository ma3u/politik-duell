// Das erste vollständige JSON-Objekt aus einem Text – etwa der Antwort eines Agenten, die vor oder
// nach dem JSON Text enthält. Gemeinsam für entwurf:json und entwurf:programm-pruefen.
// Fehler nennen Zeile und Spalte in der Datei, damit eine Rückfrage die Stelle genau benennen kann.

/** Zeile und Spalte (1-basiert) einer Stelle im Text. */
export function zeileSpalte(text: string, stelle: number): { zeile: number; spalte: number } {
  const davor = text.slice(0, stelle)
  const zeile = davor.split('\n').length
  return { zeile, spalte: stelle - davor.lastIndexOf('\n') }
}

const ort = (text: string, stelle: number) => {
  const { zeile, spalte } = zeileSpalte(text, stelle)
  const z = text.split('\n')[zeile - 1] ?? ''
  return `Zeile ${zeile}, Spalte ${spalte}: „${z.slice(Math.max(0, spalte - 40), spalte + 20).trim()}“`
}

/**
 * Stelle des ersten Syntaxfehlers in einem JSON-Text (oder -1). Node nennt sie nicht bei jedem Fehler;
 * dieser kleine Prüfer läuft nur, wenn JSON.parse schon gescheitert ist.
 */
export function fehlerStelle(t: string): number {
  let i = 0
  const leer = () => {
    while (/\s/.test(t[i] ?? '')) i++
  }
  const fehler = () => {
    throw i
  }
  const wert = (): void => {
    leer()
    const c = t[i]
    if (c === '{') {
      i++
      leer()
      if (t[i] === '}') return void i++
      for (;;) {
        leer()
        if (t[i] !== '"') fehler()
        zeichenkette()
        leer()
        if (t[i] !== ':') fehler()
        i++
        wert()
        leer()
        if (t[i] === ',') i++
        else if (t[i] === '}') return void i++
        else fehler()
      }
    } else if (c === '[') {
      i++
      leer()
      if (t[i] === ']') return void i++
      for (;;) {
        wert()
        leer()
        if (t[i] === ',') i++
        else if (t[i] === ']') return void i++
        else fehler()
      }
    } else if (c === '"') zeichenkette()
    else {
      const m = /^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(t.slice(i))
      if (!m) fehler()
      i += m![0].length
    }
  }
  const zeichenkette = () => {
    i++
    while (i < t.length && t[i] !== '"') {
      if (t[i] === '\\') i++
      else if (t[i] === '\n') fehler()
      i++
    }
    if (t[i] !== '"') fehler()
    i++
  }
  try {
    wert()
    leer()
    return i < t.length ? i : -1
  } catch (stelle) {
    return typeof stelle === 'number' ? stelle : -1
  }
}

/** Erstes JSON-Objekt im Text; mit `auchListe` auch eine Liste, wenn sie vor dem ersten Objekt beginnt. */
export function erstesJsonObjekt(text: string, auchListe = false): { objekt: unknown; rest: string } {
  const klammer = text.indexOf('{')
  const eckig = auchListe ? text.indexOf('[') : -1
  const start = eckig >= 0 && (klammer < 0 || eckig < klammer) ? eckig : klammer
  if (start < 0) throw new Error('Kein JSON-Objekt gefunden.')
  let tiefe = 0
  let inText = false
  let maskiert = false
  const offen: number[] = []
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (inText) {
      if (maskiert) maskiert = false
      else if (c === '\\') maskiert = true
      else if (c === '"') inText = false
      continue
    }
    if (c === '"') inText = true
    else if (c === '{' || c === '[') offen.push(i)
    else if (c === '}' || c === ']') {
      const auf = offen.pop()
      if (auf === undefined || (c === '}') !== (text[auf] === '{'))
        throw new Error(`Kein gültiges JSON: „${c}“ schließt ${auf === undefined ? 'nichts' : `„${text[auf]}“ aus ${ort(text, auf)}`} – ${ort(text, i)}`)
    }
    tiefe = offen.length
    if ((c === '}' || (c === ']' && text[start] === '[')) && tiefe === 0) {
      try {
        return { objekt: JSON.parse(text.slice(start, i + 1)), rest: text.slice(i + 1).trim() }
      } catch (e) {
        const meldung = e instanceof Error ? e.message : String(e)
        const pos = Number(/position (\d+)/.exec(meldung)?.[1] ?? fehlerStelle(text.slice(start, i + 1)))
        const kurz = meldung.replace(/\s*\(line \d+ column \d+\)/, '').replace(/, (?:"|\.\.\.")[\s\S]*$/, '')
        throw new Error(`Kein gültiges JSON: ${kurz}${pos >= 0 ? ` – ${ort(text, start + pos)}` : ''}`)
      }
    }
  }
  throw new Error(`JSON-Objekt nicht abgeschlossen (Antwort abgeschnitten oder Klammer vergessen?): ${offen.length} Klammern offen, zuletzt geöffnet in ${ort(text, offen[offen.length - 1] ?? start)}`)
}
