import { describe, expect, it } from 'vitest'
import type { QuizFrage, QuizPartei } from '../typen'
import { aufloesung, dauerMs, parteiWoerter, POP_MS, reaktionFuer, vorspann } from './ablauf'
import { alleClips, loesungClip, ohneTags, optionenClip, REAKTION } from './texte'

const PARTEIEN: QuizPartei[] = [
  [11, 'Union'], [12, 'SPD'], [13, 'Grüne'], [14, 'FDP'], [15, 'AfD'], [16, 'Linke'], [17, 'BSW'],
].map(([id, kurzname]) => ({ id: id as number, kurzname: kurzname as string, name: kurzname as string, farbe: '#000', programm_url: '' }))
const frage = (art: 'einzeln' | 'mehrfach', richtig: number[]): QuizFrage => ({
  id: 'h1', haltung_id: 1, frage: 'Soll es ein Tempolimit geben?', beschreibung: '', art, gesucht: 'ja', richtig, neutral: [],
  positionen: [], zielkonflikte: [], ki_entwurf: false,
})

describe('Show-Ablauf', () => {
  it('Vorspann: Intro nur bei Frage 1 des ersten Spiels, Antworten nur beim ersten Mal vorgelesen', () => {
    const f = frage('mehrfach', [12, 13])
    expect(vorspann(f, 0, 5, PARTEIEN, true).map((s) => s.marke)).toEqual([
      'intro', 'intro', 'intro', 'intro', 'ansage', 'frage', 'anleitung', 'optionen', 'los',
    ])
    expect(vorspann(f, 0, 5, PARTEIEN, false)[0].marke).toBe('ansage')
    const zweite = vorspann(f, 1, 5, PARTEIEN, true)
    expect(zweite.find((s) => s.marke === 'optionen')).toMatchObject({ takte: 7 })
    expect(vorspann(f, 4, 5, PARTEIEN, false)[0].clip?.id).toBe('ansage-letzte')
  })

  it('Dauer ist für alle Geräte gleich berechnet und enthält Pausen und Takte', () => {
    const s = vorspann(frage('einzeln', [15]), 1, 2, PARTEIEN, false)
    const ohneClips = s.reduce((a, x) => a + (x.pause ?? 0) + (x.takte ?? 0) * POP_MS, 0)
    expect(dauerMs(s)).toBeGreaterThan(ohneClips)
    expect(dauerMs(s)).toBe(dauerMs(vorspann(frage('einzeln', [15]), 1, 2, PARTEIEN, false)))
  })

  it('findet die Parteinamen in den Ansagen – für Pop-in und Stempel im Takt', () => {
    expect([...parteiWoerter(optionenClip(PARTEIEN), PARTEIEN).values()]).toEqual([11, 12, 13, 14, 15, 16, 17])
    const l = loesungClip(frage('mehrfach', [12, 13, 16]), PARTEIEN)
    expect(ohneTags(l.text)).toBe('Ja sagen: SPD, Grüne und Linke!')
    expect([...parteiWoerter(l, PARTEIEN).values()]).toEqual([12, 13, 16])
    expect(ohneTags(loesungClip(frage('einzeln', [15]), PARTEIEN).text)).toBe('Klar Ja sagt nur: AfD!')
  })

  it('Reaktion nach dem eigenen Ergebnis', () => {
    expect(reaktionFuer(1, true)).toBe('richtig')
    expect(reaktionFuer(0.5, true)).toBe('teils')
    expect(reaktionFuer(0, true)).toBe('falsch')
    expect(reaktionFuer(0, false)).toBe('keine')
    expect(aufloesung(frage('einzeln', [15]), 2, PARTEIEN, 'falsch').at(-1)).toMatchObject({ clip: REAKTION.falsch[2], klang: 'falsch' })
    expect(aufloesung(frage('einzeln', [15]), 0, PARTEIEN, null).map((s) => s.marke)).toEqual(['spannung', 'loesung'])
  })

  it('Sprechertexte: eindeutige IDs, keine Parteinamen in Moderation außerhalb der Aufzählungen', () => {
    const clips = alleClips([frage('mehrfach', [12])], PARTEIEN)
    expect(new Set(clips.map((c) => c.id)).size).toBe(clips.length)
    const moderation = clips.filter((c) => !/^(optionen|loesung-|frage-)/.test(c.id))
    for (const c of moderation) for (const p of PARTEIEN) expect(ohneTags(c.text)).not.toMatch(new RegExp(`\\b${p.kurzname}\\b`))
  })
})
