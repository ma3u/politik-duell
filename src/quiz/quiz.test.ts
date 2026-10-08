import { describe, expect, it } from 'vitest'
import type { HaltungPosition, Positionswert } from '../data/types'
import { anleitung, anleitungRegeln, quizFrage, quizFragen } from './fragen'
import { bewerte, ZEIT_MS, zeitlimit } from './punkte'
import {
  alleFertig,
  alsGastNachricht,
  alsLeitungNachricht,
  aufloesen,
  bereinigeName,
  mitAntwort,
  mitSpieler,
  mitZeitfaktor,
  neuerZustand,
  ohneSpieler,
  rangliste,
  starte,
  waehleFragen,
  weiter,
  zurLobby,
  type QuizZustand,
} from './spielleitung'
import type { QuizFrage } from './typen'

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
    expect(anleitung(f)).toBe('Wer sagt Ja? Mehrere sind richtig.')
    expect(anleitungRegeln(f)).toEqual(['„teils“ zählt nicht'])
  })

  it('„keine Aussage“ zählt wie die heutige Lage – nur mit status_quo', () => {
    const werte: Positionswert[] = ['ja', 'nein', 'keine_aussage', 'ja', 'nein', 'keine_aussage', 'teils']
    const ohne = quizFrage(haltung(5), pos(5, werte), [], PARTEIEN)!
    expect(ohne.richtig).toEqual([11, 14])
    expect(ohne.status_quo).toBeNull()
    const heuteJa = quizFrage(haltung(5, 'ja'), pos(5, werte), [], PARTEIEN)!
    expect(heuteJa.richtig).toEqual([11, 13, 14, 16])
    expect(heuteJa.status_quo).toBe('ja')
    expect(anleitungRegeln(heuteJa)).toContain('keine Aussage zählt als Ja')
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
    expect(anleitung(f)).toBe('Nur eine Partei sagt Ja. Welche?')
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

describe('bewerte', () => {
  const mehr = { art: 'mehrfach' as const, richtig: [12, 13, 16], neutral: [15] }
  const ein = { art: 'einzeln' as const, richtig: [15], neutral: [] }

  it('volle Punkte für sofort und vollständig richtig, halbe bei Zeitablauf', () => {
    expect(bewerte(mehr, [12, 13, 16], 0).punkte).toBe(1000)
    expect(bewerte(mehr, [12, 13, 16], ZEIT_MS.mehrfach).punkte).toBe(500)
    expect(bewerte(ein, [15], ZEIT_MS.einzeln / 2).punkte).toBe(750)
  })

  it('Mehrfachauswahl: Fehlgriffe ziehen ab, „teils“ zählt nicht, nichts oder alles bringt 0', () => {
    expect(bewerte(mehr, [12, 13], 0)).toMatchObject({ treffer: 2, fehler: 0, punkte: 667 })
    expect(bewerte(mehr, [12, 13, 16, 15], 0)).toMatchObject({ fehler: 0, punkte: 1000 })
    expect(bewerte(mehr, [12, 13, 11], 0)).toMatchObject({ treffer: 2, fehler: 1, punkte: 333 })
    expect(bewerte(mehr, [], 0).punkte).toBe(0)
    expect(bewerte(mehr, [11, 12, 13, 14, 15, 16, 17], 0).punkte).toBe(0)
  })

  it('Einzelauswahl: nur genau die richtige Partei zählt', () => {
    expect(bewerte(ein, [14], 0).punkte).toBe(0)
    expect(bewerte(ein, [15, 14], 0).punkte).toBe(0)
  })

  it('Zeit je Frage (WCAG 2.2.1): doppelt verschiebt den Tempobonus, ohne Zeitlimit gibt es keinen', () => {
    expect(zeitlimit('mehrfach', 2)).toBe(60_000)
    expect(zeitlimit('einzeln', 0)).toBeNull()
    expect(bewerte(mehr, [12, 13, 16], 30_000, zeitlimit('mehrfach', 2)).punkte).toBe(750)
    expect(bewerte(mehr, [12, 13, 16], 999_999, null).punkte).toBe(1000)
    expect(bewerte(mehr, [12, 13], 5_000, null).punkte).toBe(667)
    expect(bewerte(ein, [15], null, null).punkte).toBe(0)
  })

  it('keine Antwort = 0; Zeiten außerhalb werden begrenzt; doppelte Kreuze zählen einmal', () => {
    expect(bewerte(ein, [15], null).punkte).toBe(0)
    expect(bewerte(ein, [15], -500).punkte).toBe(1000)
    expect(bewerte(ein, [15], 99_999).punkte).toBe(500)
    expect(bewerte(mehr, [12, 12, 12], 0).treffer).toBe(1)
  })
})

describe('Spielleitung', () => {
  const frage: QuizFrage = {
    id: 'h1', haltung_id: 1, frage: 'F?', beschreibung: '', art: 'einzeln', gesucht: 'ja', status_quo: null, richtig: [15], neutral: [],
    positionen: [], zielkonflikte: [], ki_entwurf: false,
  }
  const raum = () => {
    let z: QuizZustand = neuerZustand('v1', { id: 'L', name: 'Leitung' })
    z = mitSpieler(z, { id: 'a', name: 'Ada', weg: 'direkt' }) as QuizZustand
    return mitSpieler(z, { id: 'b', name: 'Bo', weg: 'server' }) as QuizZustand
  }

  it('spielt eine Frage durch: Antworten sammeln, auflösen, Punkte vergeben, ans Ende', () => {
    let z = starte(raum(), ['h1'])
    expect(z).toMatchObject({ phase: 'frage', index: 0 })
    z = mitAntwort(mitAntwort(z, 'L'), 'a')
    expect(alleFertig(z)).toBe(false)
    z = mitAntwort(z, 'b')
    expect(alleFertig(z)).toBe(true)
    z = aufloesen(z, frage, { L: { auswahl: [15], ms: 0 }, a: { auswahl: [14], ms: 1000 } })
    expect(z.phase).toBe('aufloesung')
    expect(z.verlauf[0].b).toMatchObject({ ms: null, punkte: 0 })
    expect(z.spieler.map((s) => s.punkte)).toEqual([1000, 0, 0])
    z = weiter(z)
    expect(z.phase).toBe('ende')
    expect(rangliste(z.spieler).map((r) => [r.spieler.id, r.rang])).toEqual([['L', 1], ['a', 2], ['b', 2]])
  })

  it('Zeit je Frage lässt sich nur vor dem Start ändern und zählt bei der Auflösung', () => {
    let z = mitZeitfaktor(raum(), 2)
    expect(z.zeitfaktor).toBe(2)
    z = starte(z, ['h1'])
    expect(mitZeitfaktor(z, 0).zeitfaktor).toBe(2)
    z = aufloesen(z, frage, { L: { auswahl: [15], ms: 20_000 } })
    expect(z.verlauf[0].L.punkte).toBe(750)
    expect(alsLeitungNachricht({ t: 'zustand', du: 'a', z: { ...z, zeitfaktor: 5 } })).toBeNull()
  })

  it('nimmt nach dem Start und über acht Personen niemanden mehr auf', () => {
    expect(mitSpieler(starte(raum(), ['h1']), { id: 'c', name: 'C', weg: 'direkt' })).toBe('laeuft')
    let z = raum()
    for (const id of ['c', 'd', 'e', 'f', 'g']) z = mitSpieler(z, { id, name: id, weg: 'direkt' }) as QuizZustand
    expect(z.spieler).toHaveLength(8)
    expect(mitSpieler(z, { id: 'h', name: 'h', weg: 'direkt' })).toBe('voll')
  })

  it('wer im Spiel die Verbindung verliert, bleibt mit Punkten stehen und hält niemanden auf', () => {
    let z = ohneSpieler(starte(raum(), ['h1']), 'b')
    expect(z.spieler.find((s) => s.id === 'b')?.verbunden).toBe(false)
    z = mitAntwort(mitAntwort(z, 'L'), 'a')
    expect(alleFertig(z)).toBe(true)
    expect(zurLobby(z).spieler.map((s) => s.id)).toEqual(['L', 'a'])
    expect(ohneSpieler(raum(), 'a').spieler.map((s) => s.id)).toEqual(['L', 'b'])
  })

  it('zählt eine Antwort nur einmal und nur in der Fragephase', () => {
    const z = mitAntwort(mitAntwort(starte(raum(), ['h1']), 'a'), 'a')
    expect(z.beantwortet).toEqual(['a'])
    expect(mitAntwort(raum(), 'a').beantwortet).toEqual([])
    expect(mitAntwort(z, 'fremd').beantwortet).toEqual(['a'])
  })

  it('waehleFragen mischt und kürzt', () => {
    const f = (id: string) => ({ id, art: 'mehrfach' as const, richtig: [11, 12] })
    expect(waehleFragen([f('a'), f('b'), f('c')], 2, () => 0)).toEqual(['b', 'c'])
    expect(waehleFragen([f('a')], 5)).toEqual(['a'])
  })

  it('waehleFragen: keine Partei ist zweimal die einzige richtige Antwort, solange genug andere Fragen da sind', () => {
    const allein = (id: string, partei: number) => ({ id, art: 'einzeln' as const, richtig: [partei] })
    const mehr = (id: string) => ({ id, art: 'mehrfach' as const, richtig: [11, 12] })
    const fragen = [allein('x1', 15), allein('x2', 15), allein('x3', 15), mehr('m1'), mehr('m2'), allein('y', 12)]
    for (let i = 0; i < 20; i++) {
      const ids = waehleFragen(fragen, 4)
      expect(ids).toHaveLength(4)
      expect(ids.filter((id) => id.startsWith('x'))).toHaveLength(1)
    }
    // Reicht der Rest nicht, wird aufgefüllt.
    expect(waehleFragen([allein('x1', 15), allein('x2', 15)], 5)).toHaveLength(2)
  })
})

describe('Nachrichten', () => {
  it('Namen: Steuerzeichen raus, Leerraum zusammengefasst, höchstens 20 Zeichen', () => {
    expect(bereinigeName('  Ada\u0000 \n Lovelace‮ ', 'Gast')).toBe('Ada Lovelace')
    expect(bereinigeName('x'.repeat(50), 'Gast')).toHaveLength(20)
    expect(bereinigeName(42, 'Gast')).toBe('Gast')
  })

  it('verwirft fremde oder kaputte Nachrichten von Gästen', () => {
    expect(alsGastNachricht({ t: 'antwort', index: 0, auswahl: [15], ms: 1200 })).toEqual({ t: 'antwort', index: 0, auswahl: [15], ms: 1200 })
    expect(alsGastNachricht({ t: 'antwort', index: 0, auswahl: Array(8).fill(1), ms: 1 })).not.toBeNull()
    expect(alsGastNachricht({ t: 'antwort', index: 0, auswahl: Array(21).fill(1), ms: 1 })).toBeNull()
    expect(alsGastNachricht({ t: 'antwort', index: 0, auswahl: ['x'], ms: 1 })).toBeNull()
    expect(alsGastNachricht({ t: 'antwort', index: 0, auswahl: [1], ms: Infinity })).toBeNull()
    expect(alsGastNachricht({ t: 'zustand' })).toBeNull()
    expect(alsGastNachricht('hallo')).toBeNull()
  })

  it('nimmt Schnappschüsse der Spielleitung nur in erwarteter Form an', () => {
    const z = neuerZustand('v1', { id: 'L', name: 'Leitung' })
    expect(alsLeitungNachricht({ t: 'zustand', du: 'a', z })).toMatchObject({ t: 'zustand', du: 'a' })
    expect(alsLeitungNachricht({ t: 'zustand', du: 'a', z: { ...z, phase: 'hack' } })).toBeNull()
    expect(alsLeitungNachricht({ t: 'abgelehnt', grund: 'voll' })).toEqual({ t: 'abgelehnt', grund: 'voll' })
  })
})
