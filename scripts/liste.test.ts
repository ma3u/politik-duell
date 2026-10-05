import { describe, expect, it } from 'vitest'
import { auftraege, evaluationsZeilen, leseListe } from './liste'

const TABELLE = `# Liste

| Nr | Eintrag | Art | Vorschlag | Ziel | OK |
| --- | --- | --- | --- | --- | --- |
| 1 | Befürwortung der Wehrpflicht | haltung | Soll die Wehrpflicht wieder eingeführt werden? | neu | [x] |
| 2 | Wehrdienst wieder einführen | doppelt | – | #1 | [x] |
| 3 | Polizei besser ausstatten | forderung | Mehr Personal für die Polizei | T9 | [x] |
| 4 | Mehr Streifen | forderung | Mehr Polizeipräsenz | T9 | [x] |
| 5 | Infrastruktur im ländlichen Raum | thema | Ländlicher Raum | neu | [ ] |
| 6 | Abschiebungen | haltung | – | H2 | [x] |
| 7 | Holocaust-Relativierung | grenze | – | – | [x] |
`

describe('Einordnungstabelle', () => {
  it('liest bestätigte Aufträge je Skill', () => {
    const { zeilen, fehler } = leseListe(TABELLE)
    expect(fehler).toEqual([])
    const a = auftraege(zeilen)
    expect(a.haltungen).toEqual(['Soll die Wehrpflicht wieder eingeführt werden?'])
    expect(a.forderungen).toEqual([{ thema: 9, forderungen: ['Mehr Personal für die Polizei', 'Mehr Polizeipräsenz'] }])
    expect(a.themen).toEqual([])
    expect(a.zuVorhandenenHaltungen.map((z) => z.nr)).toEqual([6])
    expect(evaluationsZeilen(zeilen)).toContain('| Holocaust-Relativierung | grenze | grenze |')
  })

  it('meldet Formfehler', () => {
    const kaputt = TABELLE.replace('| neu | [x] |', '| T3 | [x] |').replace('| #1 |', '| #9 |').replace('| grenze |', '| sonstiges |').replace('Soll die Wehrpflicht wieder eingeführt werden?', 'Wehrpflicht')
    const f = leseListe(kaputt).fehler.join('\n')
    expect(f).toMatch(/Ziel „T3“ passt nicht zur Art haltung/)
    expect(f).toMatch(/#9, die es nicht gibt/)
    expect(f).toMatch(/Art „sonstiges“ unbekannt/)
    expect(leseListe('| 1 | a | b |').fehler.join()).toMatch(/6 Spalten/)
  })
})
