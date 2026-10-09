import { describe, expect, it } from 'vitest'
import type { HaltungPosition, Positionswert } from '../src/data/types'
import { quizFrage, quizFragen } from './quiz-fragen'

const PARTEIEN = [11, 12, 13, 14, 15, 16, 17].map((id) => ({ id }))
const haltung = (id: number, status_quo?: 'ja' | 'nein') => ({ id, frage: `Frage ${id}?`, beschreibung: 'b', verwandte_themen: [], ...(status_quo ? { status_quo } : {}) })
const pos = (haltung_id: number, werte: Positionswert[], extra: Partial<HaltungPosition> = {}): HaltungPosition[] =>
  werte.map((position, i) => ({
    haltung_id,
    partei_id: 11 + i,
    position,
    kurzfassung: position === 'keine_aussage' ? null : `K${i}`,
    zitat: position === 'keine_aussage' ? null : `Z${i}`,
    beleg_programm_url: position === 'keine_aussage' ? null : `https://x.de/p.pdf#page=${i + 1}`,
    begruendung: position === 'keine_aussage' ? 'durchsucht' : null,
    stand: '2026-10-04',
    land: null,
    ...extra,
  }))

describe('quizFrage', () => {
  it('Mehrfachauswahl, wenn mehrere Ja sagen; „teils“ zählt weder noch', () => {
    const f = quizFrage(haltung(1), pos(1, ['nein', 'ja', 'ja', 'nein', 'teils', 'ja', 'keine_aussage']), [], PARTEIEN)!
    expect(f).toMatchObject({ id: 'h1', art: 'mehrfach', gesucht: 'ja', status_quo: null, richtig: [12, 13, 16], neutral: [15] })
    expect(f.positionen.map((p) => p.partei_id)).toEqual([11, 12, 13, 14, 15, 16, 17])
    expect(f.positionen[6]).toMatchObject({ zitat: null, beleg_url: null, begruendung: 'durchsucht' })
  })

  it('„keine Aussage“ zählt wie die heutige Lage – nur mit status_quo', () => {
    const werte: Positionswert[] = ['ja', 'nein', 'keine_aussage', 'ja', 'nein', 'keine_aussage', 'teils']
    const ohne = quizFrage(haltung(5), pos(5, werte), [], PARTEIEN)!
    expect(ohne.richtig).toEqual([11, 14])
    expect(ohne.status_quo).toBeNull()
    const heuteJa = quizFrage(haltung(5, 'ja'), pos(5, werte), [], PARTEIEN)!
    expect(heuteJa.richtig).toEqual([11, 13, 14, 16])
    expect(heuteJa.status_quo).toBe('ja')
    const heuteNein = quizFrage(haltung(5, 'nein'), pos(5, werte), [], PARTEIEN)!
    expect(heuteNein.richtig).toEqual([11, 14])
    expect(heuteNein.neutral).toEqual([17])
    // Nur eine Partei sagt Ja, eine schweigt bei heutiger Lage Ja: dann ist es eine Mehrfachauswahl.
    const zwei = quizFrage(haltung(6, 'ja'), pos(6, ['ja', 'nein', 'keine_aussage', 'nein', 'nein', 'nein', 'nein']), [], PARTEIEN)!
    expect(zwei.art).toBe('mehrfach')
    expect(zwei.richtig).toEqual([11, 13])
    // Stehen alle auf einer Seite, gibt es nichts zu raten.
    expect(quizFrage(haltung(7, 'ja'), pos(7, ['ja', 'ja', 'keine_aussage', 'ja', 'ja', 'ja', 'keine_aussage']), [], PARTEIEN)).toBeNull()
  })

  it('Einzelauswahl, wenn genau eine Partei klar Ja sagt – dann ist „teils“ falsch', () => {
    const f = quizFrage(haltung(2), pos(2, ['teils', 'teils', 'nein', 'teils', 'ja', 'nein', 'teils']), [], PARTEIEN)!
    expect(f).toMatchObject({ art: 'einzeln', gesucht: 'ja', status_quo: null, richtig: [15], neutral: [] })
  })

  it('fragt nach Nein, wenn niemand Ja sagt', () => {
    expect(quizFrage(haltung(3), pos(3, ['teils', 'nein', 'keine_aussage', 'teils', 'teils', 'keine_aussage', 'teils']), [], PARTEIEN))
      .toMatchObject({ art: 'einzeln', gesucht: 'nein', richtig: [12] })
    expect(quizFrage(haltung(4), pos(4, ['teils', 'teils', 'teils', 'teils', 'keine_aussage', 'keine_aussage', 'teils']), [], PARTEIEN)).toBeNull()
  })

  it('„Alle sieben oder keine“: keine Frage, wenn ein Bundesprogramm fehlt; Landesprogramme zählen nicht', () => {
    const sechs = pos(5, ['ja', 'ja', 'nein', 'nein', 'nein', 'nein', 'nein']).slice(0, 6)
    expect(quizFrage(haltung(5), sechs, [], PARTEIEN)).toBeNull()
    const land = pos(5, ['ja'], { partei_id: 17, land: 'BE' })
    expect(quizFrage(haltung(5), [...sechs, ...land], [], PARTEIEN)).toBeNull()
  })

  it('übernimmt Zielkonflikte (erst Ja-, dann Nein-Seite) und merkt KI-Entwürfe', () => {
    const z = [
      { haltung_id: 6, seite: 'nein' as const, text: 'n', quelle_url: 'https://q/n' },
      { haltung_id: 6, seite: 'ja' as const, text: 'j', quelle_url: 'https://q/j' },
      { haltung_id: 7, seite: 'ja' as const, text: 'fremd', quelle_url: 'https://q/f' },
    ]
    const p = pos(6, ['ja', 'ja', 'nein', 'nein', 'nein', 'nein', 'nein'])
    p[3].ki_entwurf = true
    const f = quizFrage(haltung(6), p, z, PARTEIEN)!
    expect(f.zielkonflikte.map((x) => x.text)).toEqual(['j', 'n'])
    expect(f.ki_entwurf).toBe(true)
  })

  it('quizFragen sortiert nach Haltung und lässt unklare weg', () => {
    const p = [...pos(9, ['ja', 'nein', 'nein', 'nein', 'nein', 'nein', 'nein']), ...pos(8, ['teils', 'teils', 'teils', 'teils', 'teils', 'teils', 'teils'])]
    expect(quizFragen([haltung(9), haltung(8)], p, [], PARTEIEN).map((f) => f.id)).toEqual(['h9'])
  })
})
