import { describe, expect, it } from 'vitest'
import { kartenHaltungen, MOCK_DATEN, type Daten } from '../data/quelle'
import { gespraechsKarten, mitKarte, type RundenErgebnis } from '../spiel'
import { haltungskarte, POSITION_TEXT } from './haltung'

// Beispieldaten (daten/beispiel/haltungen/): Haltung 1 (Tempolimit) und 2 (Zuwanderung) sind für alle fünf
// Parteien erfasst, Haltung 3 (Betreuung zu Hause) nur für zwei – dafür gibt es keine Karte.

describe('haltungskarte', () => {
  it('zeigt alle Parteien in fester Reihenfolge mit Position aus dem Bundesprogramm', () => {
    const k = haltungskarte(MOCK_DATEN, 1)!
    expect(k.haltung.frage).toBe('Soll es ein generelles Tempolimit auf Autobahnen geben?')
    expect(k.positionen.map((p) => [p.partei.id, p.position.position])).toEqual([
      [1, 'ja'], [2, 'nein'], [3, 'teils'], [4, 'keine_aussage'], [5, 'ja'],
    ])
    // Mit Zitat und Beleg; bei „keine Aussage“ nur, was durchsucht wurde.
    expect(k.positionen[0].position).toMatchObject({ zitat: expect.any(String), beleg_programm_url: expect.stringMatching(/#page=\d+$/) })
    expect(k.positionen[3].position).toMatchObject({ zitat: null, kurzfassung: null, begruendung: expect.any(String) })
    expect(k.ki_entwurf).toBe(false)
  })

  it('nennt erst die Ziele der Ja-, dann die der Nein-Seite, und die verwandten Themen', () => {
    const k = haltungskarte(MOCK_DATEN, 2)!
    expect(k.zielkonflikte.map((z) => z.seite)).toEqual(['ja', 'nein', 'nein'])
    expect(k.themen.map((t) => t.id)).toEqual([6, 5])
  })

  it('„Alle oder keine“: keine Karte, solange eine Partei fehlt', () => {
    expect(haltungskarte(MOCK_DATEN, 3)).toBeNull()
    expect(kartenHaltungen(MOCK_DATEN).map((h) => h.id)).toEqual([1, 2])
    const ohneEpsilon: Daten = { ...MOCK_DATEN, haltungPositionen: MOCK_DATEN.haltungPositionen.filter((p) => !(p.haltung_id === 1 && p.partei_id === 5)) }
    expect(haltungskarte(ohneEpsilon, 1)).toBeNull()
    expect(haltungskarte(MOCK_DATEN, 99)).toBeNull()
  })

  it('zeigt keine Punkte und keine Wertung der Positionen', () => {
    const k = haltungskarte(MOCK_DATEN, 1)!
    expect(JSON.stringify(k)).not.toMatch(/punkte|wirksamkeit|umsetzbarkeit|richtig|falsch/i)
    expect(Object.values(POSITION_TEXT)).toEqual(['Ja', 'Nein', 'Teils', 'Keine Aussage im Programm'])
  })

  it('kennzeichnet Entwürfe der Testphase', () => {
    const entwurf: Daten = {
      ...MOCK_DATEN,
      testphase: true,
      haltungPositionen: MOCK_DATEN.haltungPositionen.map((p) => (p.haltung_id === 1 && p.partei_id === 2 ? { ...p, ki_entwurf: true } : p)),
    }
    expect(haltungskarte(entwurf, 1)!.ki_entwurf).toBe(true)
    expect(haltungskarte(entwurf, 2)!.ki_entwurf).toBe(false)
  })
})

describe('Karten der Partie (Endbildschirm)', () => {
  const runde = (nr: number, karten?: RundenErgebnis['karten']) => ({ nr, karten }) as RundenErgebnis

  it('sammelt Haltungs- und Forderungskarten in der Reihenfolge der Runden, jede nur einmal', () => {
    const k = gespraechsKarten([
      runde(1, [{ art: 'haltung', haltung_id: 2 }]),
      runde(2),
      runde(3, [{ art: 'forderung', instrument_id: 90, land: null }, { art: 'haltung', haltung_id: 2 }]),
      runde(4, [{ art: 'forderung', instrument_id: 90, land: 'ST' }]),
    ])
    expect(k).toEqual([
      { art: 'haltung', haltung_id: 2 },
      { art: 'forderung', instrument_id: 90, land: null },
      { art: 'forderung', instrument_id: 90, land: 'ST' },
    ])
  })

  it('mitKarte fügt eine Karte nur einmal hinzu', () => {
    const a = mitKarte([], { art: 'haltung', haltung_id: 1 })
    expect(mitKarte(a, { art: 'haltung', haltung_id: 1 })).toBe(a)
    expect(mitKarte(a, { art: 'haltung', haltung_id: 2 })).toHaveLength(2)
  })
})
