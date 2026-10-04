import { describe, expect, it } from 'vitest'
import { PARTEIEN, THEMEN, URSACHEN } from '../../../src/data/mock'
import {
  antwortAusAuswahl,
  bereinigeAntwort,
  EingabeFehler,
  NACHFRAGE_FORDERUNG,
  NACHFRAGE_URSACHE,
  nutzerNachrichten,
  ohneParteinamen,
  pruefeAnfrage,
  systemPrompt,
} from './ki.ts'
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
    expect(p).toContain('"pauschal": true')
  })

  it('lässt Forderungen spiegeln und dem Thema zuordnen', () => {
    const p = systemPrompt(THEMEN, URSACHEN)
    expect(p).toContain('neutralen Halbsatz wieder')
    expect(p).toContain('Thema aus dem Katalog, zu dem die Forderung gehört')
  })

  it('verlangt bei Haltungen eine aufgreifende Rückmeldung ohne Zustimmung oder Widerspruch', () => {
    const p = systemPrompt(THEMEN, URSACHEN)
    expect(p).toContain('"rueckmeldung": string | null')
    expect(p).toContain('Stimme nicht zu und widersprich nicht')
  })
})

describe('nutzerNachrichten', () => {
  it('verlangt nach zwei Nachfragen eine abschließende Einordnung', () => {
    const n = nutzerNachrichten([spieler('a'), ki('b'), spieler('c'), ki('d'), spieler('e')], 'mieter')
    expect(n[0].content).toContain('Mieter:in')
    expect(n[0].content).toContain('bereits zweimal')
    // Eine Forderung bleibt eine Forderung, sie wird nicht zum Problem umgedeutet.
    expect(n[0].content).toContain('als "forderung" ein')
    expect(n[0].content).toContain('"rueckmeldung"')
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
    // Das Thema bleibt erhalten, damit die App dessen Ursachen zum Antippen anbieten kann.
    expect(a).toMatchObject({ typ: 'problem', nachfrage: 'Was genau?', thema_id: 2, ursachen_ids: [] })
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

  it('erzwingt nach zwei Nachfragen keine dritte und deutet die Forderung nicht um', () => {
    const verlauf = [spieler('Weniger X'), ki('?'), spieler('Mehr Y'), ki('?'), spieler('Weniger Z')]
    const a = bereinige({ typ: 'forderung', nachfrage: 'Noch eine Frage?', thema_id: 2, zusammenfassung: 'z', einschaetzung: 'e' }, verlauf)
    expect(a).toMatchObject({ typ: 'forderung', nachfrage: null, thema_id: 2, ursachen_ids: [], einschaetzung: null })
  })

  it('behält bei einer Forderung das erkannte Thema, aber keine Ursachen', () => {
    const a = bereinige({ typ: 'forderung', nachfrage: 'Du willst X. Was soll sich ändern?', thema_id: 2, ursachen_ids: [202], zusammenfassung: 'x' })
    expect(a).toMatchObject({ typ: 'forderung', thema_id: 2, ursachen_ids: [] })
    expect(bereinige({ typ: 'forderung', thema_id: 77, zusammenfassung: 'x' }).thema_id).toBeNull()
  })

  it('bietet bei Pauschalurteilen kein Thema an', () => {
    const a = bereinige({ typ: 'forderung', pauschal: true, thema_id: 6, nachfrage: 'Was hast du erlebt?', zusammenfassung: 'x' })
    expect(a).toMatchObject({ typ: 'forderung', pauschal: true, thema_id: null })
    // „pauschal“ zählt nur bei Forderungen.
    expect(bereinige({ typ: 'wert', pauschal: true, zusammenfassung: 'x' }).pauschal).toBeUndefined()
  })

  it('übernimmt eine Rückmeldung zu Haltungen und abschließenden Forderungen', () => {
    const r = 'Heimat ist dir wichtig – darüber kann man verschieden denken. Wo begegnet dir das im Alltag?'
    expect(bereinige({ typ: 'wert', rueckmeldung: r, zusammenfassung: 'x' }).rueckmeldung).toBe(r)
    const verlauf = [spieler('Weniger X'), ki('?'), spieler('Mehr Y'), ki('?'), spieler('Weniger Z')]
    const f = bereinige({ typ: 'forderung', rueckmeldung: 'Du willst weniger X. Magst du ein Alltagsproblem nennen?', zusammenfassung: 'z' }, verlauf)
    expect(f.rueckmeldung).toBe('Du willst weniger X. Magst du ein Alltagsproblem nennen?')
  })

  it('verwirft die Rückmeldung, wo sie nicht passt oder unsicher ist', () => {
    const r = 'Das ist eine Haltung. Wo begegnet dir das?'
    // Bei offener Nachfrage, bei Problemen und bei Pauschalurteilen gibt es keine Rückmeldung.
    expect(bereinige({ typ: 'forderung', nachfrage: 'Was genau?', rueckmeldung: r, zusammenfassung: 'x' }).rueckmeldung).toBeNull()
    expect(bereinige({ typ: 'problem', thema_id: 2, ursachen_ids: [202], rueckmeldung: r, zusammenfassung: 'x' }).rueckmeldung).toBeUndefined()
    const verlauf = [spieler('a'), ki('?'), spieler('b'), ki('?'), spieler('c')]
    expect(bereinige({ typ: 'forderung', pauschal: true, rueckmeldung: r, zusammenfassung: 'x' }, verlauf).rueckmeldung).toBeNull()
    // Zu kurz, zu lang, mit Link-Rest oder Parteiname: fester Satz in der App.
    expect(bereinige({ typ: 'wert', rueckmeldung: 'Ok.', zusammenfassung: 'x' }).rueckmeldung).toBeNull()
    expect(bereinige({ typ: 'wert', rueckmeldung: 'a'.repeat(241), zusammenfassung: 'x' }).rueckmeldung).toBeNull()
    expect(bereinige({ typ: 'wert', zusammenfassung: 'x' }).rueckmeldung).toBeNull()
    const mitPartei = bereinigeAntwort({ typ: 'wert', rueckmeldung: 'Das sagt auch die Partei Alpha. Wo begegnet dir das?', zusammenfassung: 'x' }, [spieler('t')], THEMEN, URSACHEN, PARTEIEN)
    expect(mitPartei.rueckmeldung).toBeNull()
    const link = bereinige({ typ: 'wert', rueckmeldung: 'Mehr dazu auf https://example.org – wo begegnet dir das im Alltag?', zusammenfassung: 'x' })
    expect(link.rueckmeldung).not.toContain('example.org')
  })

  it('gibt bei Haltungen kein Thema weiter', () => {
    const a = bereinige({ typ: 'wert', thema_id: 2, ursachen_ids: [202], zusammenfassung: 'x' })
    expect(a).toMatchObject({ typ: 'wert', nachfrage: null, thema_id: null, ursachen_ids: [] })
  })

  it('ergänzt die Frage, wenn die KI eine Forderung nur wiedergibt', () => {
    const a = bereinige({ typ: 'forderung', nachfrage: 'Du möchtest, dass die Mieten sinken.', thema_id: 2, zusammenfassung: 'x' })
    expect(a.nachfrage).toBe(`Du möchtest, dass die Mieten sinken. ${NACHFRAGE_FORDERUNG}`)
    const b = bereinige({ typ: 'forderung', nachfrage: 'Du willst weniger Steuern. Was soll sich ändern?', zusammenfassung: 'x' })
    expect(b.nachfrage).toBe('Du willst weniger Steuern. Was soll sich ändern?')
  })

  it('nimmt die Standardfrage, wenn eine Nachfrage zur Ursache keine Frage ist', () => {
    const a = bereinige({ typ: 'problem', thema_id: 2, nachfrage: 'Die Miete ist zu hoch.', zusammenfassung: 'x' })
    expect(a.nachfrage).toBe(NACHFRAGE_URSACHE)
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
    ['ohne Verlauf und ohne Auswahl', { ...gueltig, verlauf: [] }],
    ['mit leerer Auswahl', { ...gueltig, auswahl: { thema_id: 2, ursachen_ids: [] } }],
    ['mit mehr als drei Ursachen', { ...gueltig, auswahl: { thema_id: 2, ursachen_ids: [201, 202, 203, 204] } }],
    ['mit doppelter Ursache', { ...gueltig, auswahl: { thema_id: 2, ursachen_ids: [202, 202] } }],
    ['mit Auswahl ohne Thema', { ...gueltig, auswahl: { ursachen_ids: [202] } }],
    ['mit Auswahl als Text', { ...gueltig, auswahl: { thema_id: 2, ursachen_ids: ['202'] } }],
  ])('lehnt Anfrage %s ab', (_, anfrage) => {
    expect(() => pruefeAnfrage(anfrage)).toThrow(EingabeFehler)
  })

  it('akzeptiert angetippte Ursachen ohne Verlauf', () => {
    const a = pruefeAnfrage({ ...gueltig, verlauf: [], auswahl: { thema_id: 2, ursachen_ids: [201, 202] } })
    expect(a.auswahl).toEqual({ thema_id: 2, ursachen_ids: [201, 202] })
    // Auch mit der Nachfrage der KI als letzter Nachricht.
    expect(pruefeAnfrage({ ...gueltig, verlauf: [spieler('a'), ki('b')], auswahl: { thema_id: 2, ursachen_ids: [202] } }).auswahl).toBeTruthy()
    expect(pruefeAnfrage(gueltig).auswahl).toBeNull()
  })
})

describe('antwortAusAuswahl', () => {
  it('wertet die angetippten Ursachen wie eine Zuordnung der KI', () => {
    const a = antwortAusAuswahl({ thema_id: 2, ursachen_ids: [202, 201] }, THEMEN, URSACHEN)
    expect(a).toMatchObject({ typ: 'problem', nachfrage: null, thema_id: 2, ursachen_ids: [202, 201], einschaetzung: null })
  })

  it('speichert keinen Text der Person, nur Thema und Ursachen', () => {
    const a = antwortAusAuswahl({ thema_id: 2, ursachen_ids: [202] }, THEMEN, URSACHEN)
    expect(a.zusammenfassung).toBe('Miete: eine Ursache angetippt')
    expect(a.stichwort).toBe('Miete')
    expect(antwortAusAuswahl({ thema_id: 2, ursachen_ids: [201, 202] }, THEMEN, URSACHEN).zusammenfassung).toBe('Miete: 2 Ursachen angetippt')
  })

  it('lehnt Ursachen eines anderen Themas und unbekannte Themen ab', () => {
    expect(() => antwortAusAuswahl({ thema_id: 2, ursachen_ids: [101] }, THEMEN, URSACHEN)).toThrow(EingabeFehler)
    expect(() => antwortAusAuswahl({ thema_id: 77, ursachen_ids: [202] }, THEMEN, URSACHEN)).toThrow(EingabeFehler)
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
