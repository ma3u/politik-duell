import { describe, expect, it } from 'vitest'
import { gruppiere, sammelAuftragText, textdateiPfad } from './entwurf/sammelauftrag-text'

const auftrag = (id: number, text = '') =>
  [
    `# Erfassungsauftrag: SPD (Bund) – Thema ${id} „Thema ${id}“`,
    '',
    'Vorgehen und Regeln: `.claude/agents/programm-erfassung.md`. Dieser Auftrag enthält alles Übrige.',
    '',
    '| | |',
    '| --- | --- |',
    `| Textdatei | \`.cache/entwurf/${id}/texte/SPD-Bund.txt\` (68 PDF-Seiten) |`,
    `| Ergebnis | \`.cache/entwurf/${id}/protokoll/erfassung-SPD-Bund.txt\` – JSON und Protokoll hierhin schreiben |`,
    '',
    `## Nachtrag: Lösungsweg „Forderung ${id}“`,
    '',
    '## Ziel',
    '',
    `Ziel ${id}${text}`,
    '',
  ].join('\n')

describe('Sammelauftrag', () => {
  it('liest den Pfad der Textdatei', () => {
    expect(textdateiPfad(auftrag(2))).toBe('.cache/entwurf/2/texte/SPD-Bund.txt')
  })

  it('übernimmt jeden Teilauftrag vollständig, mit eigener Ergebnisdatei, Überschriften eine Ebene tiefer', () => {
    const teile = [2, 5].map((id) => ({ pfad: `.cache/entwurf/${id}/auftraege/SPD-Bund.md`, text: auftrag(id) }))
    const text = sammelAuftragText('SPD-Bund', teile, '.cache/entwurf/2/texte/SPD-Bund.txt')
    expect(text).toMatch(/^# Sammelauftrag: SPD-Bund – 2 Teilaufträge/)
    expect(text).toContain('## Teilauftrag 1 von 2 (`.cache/entwurf/2/auftraege/SPD-Bund.md`)')
    expect(text).toContain('## Teilauftrag 2 von 2 (`.cache/entwurf/5/auftraege/SPD-Bund.md`)')
    for (const id of [2, 5]) {
      expect(text).toContain(`.cache/entwurf/${id}/protokoll/erfassung-SPD-Bund.txt`)
      expect(text).toContain(`### Nachtrag: Lösungsweg „Forderung ${id}“`)
      expect(text).toContain(`## Erfassungsauftrag: SPD (Bund) – Thema ${id}`)
    }
    // Die allgemeine Zeile steht nur einmal oben.
    expect(text.match(/Vorgehen und Regeln/g)).toHaveLength(1)
  })

  it('teilt nach Länge, ohne die Reihenfolge zu ändern', () => {
    const teile = [1, 2, 3, 4].map((id) => ({ pfad: `${id}`, text: 'x'.repeat(id === 3 ? 90 : 40) }))
    expect(gruppiere(teile, 100).map((g) => g.map((t) => t.pfad))).toEqual([['1', '2'], ['3'], ['4']])
    expect(gruppiere(teile, 1000)).toHaveLength(1)
  })
})
