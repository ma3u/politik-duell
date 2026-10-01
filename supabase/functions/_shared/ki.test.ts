import { describe, expect, it } from 'vitest'
import { PARTEIEN, THEMEN, URSACHEN } from '../../../src/data/mock'
import { bereinigeAntwort, EingabeFehler, NACHFRAGE_URSACHE, nutzerNachrichten, ohneParteinamen, pruefeAnfrage, systemPrompt } from './ki.ts'
import type { Nachricht } from './typen.ts'

const spieler = (text: string): Nachricht => ({ von: 'spieler', text })
const ki = (text: string): Nachricht => ({ von: 'ki', text })
const bereinige = (roh: unknown, verlauf: Nachricht[] = [spieler('Test')]) =>
  bereinigeAntwort(roh, verlauf, THEMEN, URSACHEN)

describe('systemPrompt', () => {
  it('enthält den Katalog mit IDs, aber keine Links', () => {
    const p = systemPrompt(THEMEN, URSACHEN)
    expect(p).toContain('Thema 2: Miete')
    expect(p).toContain('Ursache 202')
    expect(p).not.toMatch(/https?:\/\//)
  })

  it('behandelt Pauschalurteile über Gruppen wie Forderungen und trennt Gefühl von Erlebnis', () => {
    const p = systemPrompt(THEMEN, URSACHEN)
    expect(p).toContain('pauschales Urteil über eine Gruppe')
    expect(p).toContain('Widersprich nicht, belehre nicht')
    expect(p).toContain('Unterscheide Erlebnis und Gefühl')
  })
})

describe('nutzerNachrichten', () => {
  it('verlangt nach zwei Nachfragen eine abschließende Einordnung', () => {
    const n = nutzerNachrichten([spieler('a'), ki('b'), spieler('c'), ki('d'), spieler('e')], 'mieter')
    expect(n[0].content).toContain('Mieter:in')
    expect(n[0].content).toContain('bereits zweimal')
    expect(n.slice(1).map((x) => x.role)).toEqual(['user', 'assistant', 'user', 'assistant', 'user'])
  })
})

describe('bereinigeAntwort', () => {
  it('liefert ein kurzes Stichwort für die Wortwolke', () => {
    const a = bereinige({ typ: 'problem', thema_id: 2, ursachen_ids: [202], stichwort: '„Mieterhöhung“', zusammenfassung: 'Miete steigt.' })
    expect(a.stichwort).toBe('Mieterhöhung')
    const b = bereinige({ typ: 'problem', thema_id: 2, ursachen_ids: [202], zusammenfassung: 'Die Miete steigt stark an.' })
    expect(b.stichwort).toBe('Die Miete steigt')
  })

  it('übernimmt eine gültige Zuordnung', () => {
    const a = bereinige({ typ: 'problem', thema_id: 2, ursachen_ids: [202], zusammenfassung: 'Miete steigt stark.' })
    expect(a).toMatchObject({ typ: 'problem', thema_id: 2, ursachen_ids: [202] })
  })

  it('verwirft Ursachen, die nicht zum Thema gehören', () => {
    const a = bereinige({ typ: 'problem', thema_id: 2, ursachen_ids: [202, 101, 999], zusammenfassung: 'x' })
    expect(a.ursachen_ids).toEqual([202])
  })

  it('fragt nach, statt ohne erkennbare Ursache alle Ursachen zu werten', () => {
    const a = bereinige({ typ: 'problem', thema_id: 2, ursachen_ids: [101], nachfrage: 'Was genau?', zusammenfassung: 'x' })
    expect(a).toMatchObject({ typ: 'problem', nachfrage: 'Was genau?', thema_id: null, ursachen_ids: [] })
    const b = bereinige({ typ: 'problem', thema_id: 2, zusammenfassung: 'x' })
    expect(b.nachfrage).toBe(NACHFRAGE_URSACHE)
  })

  it('wertet nach zwei Nachfragen ohne erkennbare Ursache nicht', () => {
    const verlauf = [spieler('a'), ki('?'), spieler('b'), ki('?'), spieler('c')]
    const a = bereinige({ typ: 'problem', thema_id: 2, nachfrage: 'Noch was?', zusammenfassung: 'x' }, verlauf)
    expect(a).toMatchObject({ typ: 'problem', nachfrage: null, thema_id: null, ursachen_ids: [] })
  })

  it('setzt unbekannte Themen auf ungeprüft', () => {
    const a = bereinige({ typ: 'problem', thema_id: 77, ursachen_ids: [1], zusammenfassung: 'Bus', einschaetzung: 'Takt' })
    expect(a).toMatchObject({ thema_id: null, ursachen_ids: [], einschaetzung: 'Takt' })
  })

  it('entfernt Links aus allen Texten', () => {
    const a = bereinige({ typ: 'problem', thema_id: null, zusammenfassung: 'Siehe https://x.de hier', einschaetzung: 'www.y.de' })
    expect(a.zusammenfassung).not.toContain('x.de')
    expect(a.einschaetzung).toBeNull()
  })

  it('erzwingt nach zwei Nachfragen keine dritte', () => {
    const verlauf = [spieler('Weniger X'), ki('?'), spieler('Mehr Y'), ki('?'), spieler('Weniger Z')]
    const a = bereinige({ typ: 'forderung', nachfrage: 'Noch eine Frage?', zusammenfassung: 'z' }, verlauf)
    expect(a.typ).toBe('problem')
    expect(a.nachfrage).toBeNull()
  })

  it('ergänzt eine fehlende Nachfrage', () => {
    const a = bereinige({ typ: 'forderung', zusammenfassung: 'x' })
    expect(a.nachfrage).toBe('Was läuft in deinem Alltag konkret schief?')
  })

  it('kommt mit Müll zurecht', () => {
    const a = bereinige('kein json', [spieler('Mein Problem')])
    expect(a).toMatchObject({ typ: 'problem', thema_id: null, zusammenfassung: 'Mein Problem' })
  })
})

describe('pruefeAnfrage', () => {
  const gueltig = {
    sitzung: '0b5c1f3e-8d2a-4e7b-9c1d-2a3b4c5d6e7f',
    verlauf: [spieler('Mein Arzt hat keine Termine')],
    rolle: 'mieter',
    parteien: [1, 2],
  }

  it('akzeptiert eine gültige Anfrage', () => {
    expect(pruefeAnfrage(gueltig).rolle).toBe('mieter')
    expect(pruefeAnfrage(gueltig).land).toBeNull()
    expect(pruefeAnfrage({ ...gueltig, land: 'ST' }).land).toBe('ST')
    expect(pruefeAnfrage(gueltig).zugang).toBeNull()
    const zugang = 'a'.repeat(43)
    expect(pruefeAnfrage({ ...gueltig, zugang }).zugang).toBe(zugang)
  })

  it.each([
    ['ohne Sitzung', { ...gueltig, sitzung: 'x' }],
    ['feste Sitzung des globalen Limits', { ...gueltig, sitzung: '00000000-0000-0000-0000-000000000000' }],
    ['mit zu langem Text', { ...gueltig, verlauf: [spieler('a'.repeat(501))] }],
    ['mit KI als letzter Nachricht', { ...gueltig, verlauf: [spieler('a'), ki('b')] }],
    ['mit unbekannter Rolle', { ...gueltig, rolle: 'koenig' }],
    ['mit gleicher Partei', { ...gueltig, parteien: [1, 1] }],
    ['mit ungültigem Bundesland', { ...gueltig, land: 'Sachsen-Anhalt' }],
    ['mit ungültigem Zugang zur Testphase', { ...gueltig, zugang: 'geheim' }],
    ['mit zu langem Verlauf', { ...gueltig, verlauf: Array(7).fill(spieler('a')) }],
  ])('lehnt Anfrage %s ab', (_, anfrage) => {
    expect(() => pruefeAnfrage(anfrage)).toThrow(EingabeFehler)
  })
})

describe('ohneParteinamen', () => {
  const echt = [
    { name: 'BÜNDNIS 90/DIE GRÜNEN', kurzname: 'Grüne' },
    { name: 'Die Linke', kurzname: 'Linke' },
    { name: 'Christlich Demokratische Union', kurzname: 'CDU/CSU' },
  ]

  it.each([
    ['Die Grünen wollen mehr Radwege', '[Partei] wollen mehr Radwege'],
    ['Die CDU tut nichts gegen Mieten', '[Partei] tut nichts gegen Mieten'],
    ['Die Linke fordert einen Mietendeckel', '[Partei] fordert einen Mietendeckel'],
    ['Wie bei der CSU und der spd', 'Wie bei [Partei] und der spd'],
    ['Ich schreibe mit der linken Hand', 'Ich schreibe mit der linken Hand'],
    ['Die Wiese ist grün', 'Die Wiese ist grün'],
    ['Die CDUler im Süden', 'Die CDUler im Süden'],
  ])('%s → %s', (ein, aus) => {
    expect(ohneParteinamen(ein, echt)).toBe(aus)
  })

  it('erkennt vollen Namen vor Kurznamen', () => {
    expect(ohneParteinamen('Partei Alpha verspricht viel', PARTEIEN)).toBe('[Partei] verspricht viel')
  })
})

describe('bereinigeAntwort ohne Parteinamen', () => {
  it('entfernt Parteinamen aus Zusammenfassung, Einschätzung und Stichwort', () => {
    const a = bereinigeAntwort(
      {
        typ: 'problem',
        thema_id: null,
        zusammenfassung: 'Partei Beta kümmert sich nicht um Busse auf dem Land.',
        einschaetzung: 'Alpha und Gamma haben dazu Ideen.',
        stichwort: 'Beta Busverkehr',
      },
      [spieler('Bus fährt selten')],
      THEMEN,
      URSACHEN,
      PARTEIEN,
    )
    expect(a.zusammenfassung).toBe('[Partei] kümmert sich nicht um Busse auf dem Land.')
    expect(a.einschaetzung).toBe('[Partei] und [Partei] haben dazu Ideen.')
    expect(a.stichwort).toBe('Busverkehr')
  })

  it('nimmt die Zusammenfassung, wenn das Stichwort nur ein Parteiname ist', () => {
    const a = bereinigeAntwort(
      { typ: 'wert', zusammenfassung: 'Gerechtigkeit ist wichtig', stichwort: 'Epsilon' },
      [spieler('x')],
      THEMEN,
      URSACHEN,
      PARTEIEN,
    )
    expect(a.stichwort).toBe('Gerechtigkeit ist wichtig')
  })
})
