import { describe, expect, it } from 'vitest'
import { bereinigeSeite, findeZitat, kompakt, seiteVon, seitenTexte, zitatTeile } from './zitate'

/** Kleines PDF mit einer Textzeile-Liste je Seite (Helvetica, WinAnsi – Umlaute als Oktal-Escape). */
function testPdf(seiten: string[][]): Uint8Array {
  const winAnsi = (s: string) =>
    [...s].map((c) => (c.charCodeAt(0) > 127 ? `\\${c.charCodeAt(0).toString(8)}` : /[()\\]/.test(c) ? `\\${c}` : c)).join('')
  const objekte: string[] = []
  const n = seiten.length
  const font = 3 + 2 * n
  objekte.push('<< /Type /Catalog /Pages 2 0 R >>')
  objekte.push(`<< /Type /Pages /Kids [${seiten.map((_, i) => `${3 + 2 * i} 0 R`).join(' ')}] /Count ${n} >>`)
  seiten.forEach((zeilen, i) => {
    const text = zeilen.map((z, j) => `BT /F1 10 Tf 20 ${180 - 14 * j} Td (${winAnsi(z)}) Tj ET`).join('\n')
    objekte.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Contents ${4 + 2 * i} 0 R /Resources << /Font << /F1 ${font} 0 R >> >> >>`)
    objekte.push(`<< /Length ${Buffer.byteLength(text, 'latin1')} >>\nstream\n${text}\nendstream`)
  })
  objekte.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  let pdf = '%PDF-1.4\n'
  const offsets = objekte.map((o, i) => {
    const pos = Buffer.byteLength(pdf, 'latin1')
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`
    return pos
  })
  const xref = Buffer.byteLength(pdf, 'latin1')
  pdf += `xref\n0 ${objekte.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  pdf += `trailer\n<< /Size ${objekte.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new Uint8Array(Buffer.from(pdf, 'latin1'))
}

describe('Zitatprüfung', () => {
  it('vergleicht ohne Leerzeichen, Satzzeichen, Silbentrennung und Groß-/Kleinschreibung', () => {
    expect(kompakt('„Mehr Woh-\nnungen, schneller!“')).toBe('mehrwohnungenschneller')
    expect(kompakt('Soft­hyphen und ﬁnanziert')).toBe('softhyphenundfinanziert')
    expect(zitatTeile('Wir wollen […] mehr bauen … und zwar schnell')).toEqual(['wirwollen', 'mehrbauen', 'undzwarschnell'])
  })

  it('findet Zitate auf der angegebenen Seite, auch über den Seitenumbruch', () => {
    const seiten = ['Einleitung', 'Wir bauen 400.000 Wohnungen', 'im Jahr. Außerdem …', 'Wir senken die Mieten.']
    expect(findeZitat('Wir bauen 400.000 Wohnungen', seiten, 2)).toEqual({ status: 'ok' })
    expect(findeZitat('Wohnungen im Jahr', seiten, 2)).toEqual({ status: 'ok' })
    expect(findeZitat('Wir senken die Mieten', seiten, 2)).toEqual({ status: 'andere_seite', seiten: [4] })
    expect(findeZitat('Wir schaffen die Miete ab', seiten, 2)).toEqual({ status: 'nicht_gefunden' })
    // Teile mit Auslassung müssen in dieser Reihenfolge vorkommen.
    expect(findeZitat('Wir […] Wohnungen', seiten, 2)).toEqual({ status: 'ok' })
    expect(findeZitat('Wohnungen […] Wir bauen', seiten, 2)).toEqual({ status: 'nicht_gefunden' })
  })

  it('toleriert Zeilennummern am Zeilenende und Ligatur-Glyphen, nur als zweiten Versuch', () => {
    const nummeriert = ['Titel', 'Wir sorgen daf\u00fcr, dass alle Kinder 1477\nstark in die Schule starten. 1478\nDazu 2027 gleich 1479']
    expect(findeZitat('Wir sorgen daf\u00fcr, dass alle Kinder stark in die Schule starten.', nummeriert, 2)).toEqual({ status: 'ok' })
    expect(bereinigeSeite('Zeile eins 1477\nZeile zwei')).toBe('Zeile eins\nZeile zwei')
    const glyphen = ['Beitragsfreie Kita sichern, bei gleichzei\u019fg h\u00f6herer Kosten, die gesellscha\u014cliche Aufwertung.']
    expect(findeZitat('Beitragsfreie Kita sichern, bei gleichzeitig h\u00f6herer Kosten', glyphen, 1)).toEqual({ status: 'ok' })
    expect(findeZitat('Aufwertung gesellschaftliche', glyphen, 1)).toEqual({ status: 'nicht_gefunden' })
    // Eine echte Zahl am Zeilenende bleibt im ersten Versuch erhalten.
    expect(findeZitat('Das Jahr 2027', ['Das Jahr 2027'], 1)).toEqual({ status: 'ok' })
  })

  it('liest den Seitenanker', () => {
    expect(seiteVon('https://x.de/p.pdf#page=17')).toBe(17)
    expect(seiteVon('https://x.de/p.pdf')).toBeNull()
  })

  it('liest den Text je Seite aus einem PDF', async () => {
    const pdf = testPdf([['Titelseite'], ['Wir wollen mehr bezahlbare Woh-', 'nungen bauen und Mieten begrenzen.'], ['Größere Förderung für Städte.']])
    const seiten = await seitenTexte(pdf)
    expect(seiten).toHaveLength(3)
    expect(findeZitat('Wir wollen mehr bezahlbare Wohnungen bauen', seiten, 2)).toEqual({ status: 'ok' })
    expect(findeZitat('Größere Förderung für Städte', seiten, 2)).toEqual({ status: 'andere_seite', seiten: [3] })
  })
})
