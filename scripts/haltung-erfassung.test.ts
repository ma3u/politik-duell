import { describe, expect, it } from 'vitest'
import { pruefeKatalog, type Datei, type KatalogHaltung } from '../src/data/katalog'
import { erkennbar, haltungBlind, positionenEintragen, pruefeFund, pruefeHaltungAntwort, type HaltungAntwort, type HaltungFund } from './haltung-erfassung'

const parteien = [11, 12, 13].map((id, i) => ({
  id, name: ['Christlich Demokratische Union', 'Sozialdemokratische Partei', 'Bündnis 90/Die Grünen'][i], kurzname: ['CDU', 'SPD', 'Grüne'][i],
  farbe: '#112233', programm_url: `https://p${id}.de/p.pdf`, programm_stand: '2025-01-01',
}))
const PARTEIEN: Datei = { pfad: 'parteien.json', inhalt: { fiktiv: false, parteien } }
const THEMA: Datei = { pfad: 'themen/15-auto.json', inhalt: { id: 15, name: 'Autofahren', beschreibung: 'x', ziel: 'Gut ankommen.', ursachen: [{ id: 1501, beschreibung: 'Staus', quelle_url: 'https://destatis.de/a', ebene: 'bund' }] } }
const haltung = (extra: Record<string, unknown> = {}) => ({
  id: 4, frage: 'Soll es ein Tempolimit geben?', beschreibung: 'Ob auf Autobahnen eine Höchstgeschwindigkeit gilt.', status_quo: 'nein', verwandte_themen: [15],
  zielkonflikte: [
    { seite: 'ja', text: 'Wer es will, nennt Sicherheit.', quelle_url: 'https://doi.org/1' },
    { seite: 'nein', text: 'Wer es ablehnt, nennt Fahrzeit.', quelle_url: 'https://doi.org/2' },
  ],
  einordnung: { ja: 'will ein allgemeines Limit', teils: 'nur auf Teilstrecken', nein: 'lehnt ein Limit ab' },
  suchbegriffe: ['tempolimit'],
  freigabe: { datum: '2026-10-05', art: 'ki' },
  ...extra,
})
const katalog = (h = haltung()) => {
  const r = pruefeKatalog(PARTEIEN, [THEMA], undefined, [], [{ pfad: 'haltungen/04-tempo.json', inhalt: h }])
  expect(r.fehler).toEqual([])
  return r.katalog
}
const funde: HaltungFund[] = [
  { haltung_id: 4, partei_id: 11, zitat: 'Ein generelles Tempolimit lehnt die CDU ab.', seite: 5 },
  { haltung_id: 4, partei_id: 12, zitat: 'Wir wollen Tempo 130 auf Autobahnen.', seite: 9 },
  { haltung_id: 4, partei_id: 13, keine_aussage: 'Verkehrskapitel S. 40–48 gelesen, Suchbegriffe ohne Treffer.' },
]

describe('Haltungen erfassen', () => {
  it('prüft die Form eines Funds', () => {
    const k = katalog()
    const h = k.haltungen[0] as KatalogHaltung
    expect(pruefeFund(k, h, funde[0])).toEqual([])
    expect(pruefeFund(k, h, { haltung_id: 4, partei_id: 11 }).join()).toMatch(/weder zitat noch keine_aussage/)
    expect(pruefeFund(k, h, { ...funde[0], zitat: 'a […] b […] c' }).join()).toMatch(/höchstens eine Auslassung/)
  })

  it('ordnet ohne Parteinamen ein und trägt Positionen als KI-Entwurf ein', () => {
    const k = katalog()
    const h = k.haltungen[0] as KatalogHaltung
    const { liste, kennungen } = haltungBlind(k, h, funde)
    expect(liste.eintraege).toHaveLength(2)
    expect(JSON.stringify(liste)).not.toMatch(/CDU|"partei_id"/)
    expect(liste.einordnung?.nein).toBe('lehnt ein Limit ab')
    const nach = (p: number) => kennungen.find((x) => x.partei_id === p)!.kennung
    const antwort: HaltungAntwort = {
      pruefsumme: liste.pruefsumme,
      einordnungen: [
        { kennung: nach(11), position: 'nein', kurzfassung: 'Lehnt ein generelles Tempolimit ab.', begruendung: 'Das Zitat lehnt das Limit ab.' },
        { kennung: nach(12), position: 'ja', kurzfassung: 'Will Tempo 130 auf Autobahnen.', begruendung: 'Das Zitat fordert ein Limit.' },
      ],
    }
    expect(pruefeHaltungAntwort(liste, antwort)).toEqual([])
    expect(pruefeHaltungAntwort(liste, { ...antwort, einordnungen: [{ ...antwort.einordnungen[0], kurzfassung: 'Die SPD will Tempo 130.' }] }).join())
      .toMatch(/nennt eine Partei[^]*fehlt in der Antwort/)
    const datei = positionenEintragen(k, haltung(), funde, kennungen, antwort, '2026-10-05')
    expect(erkennbar(datei)).toBe(2)
    const r = pruefeKatalog(PARTEIEN, [THEMA], undefined, [], [{ pfad: 'haltungen/04-tempo.json', inhalt: datei }])
    expect(r.fehler).toEqual([])
    expect(r.katalog.haltungen[0].positionen.map((p) => [p.partei_id, p.position, p.beleg_programm_url])).toEqual([
      [11, 'nein', 'https://p11.de/p.pdf#page=5'],
      [12, 'ja', 'https://p12.de/p.pdf#page=9'],
      [13, 'keine_aussage', null],
    ])
  })

  it('lässt „geprueft“ bei KI-Freigabe nicht zu', () => {
    const pos = [11, 12, 13].map((partei_id) => ({ partei_id, position: 'keine_aussage', begruendung: 'Durchsucht.', stand: '2026-10-05', geprueft: true, pruefung: { belege_geprueft: '2026-10-05', zweite_suche: 'x' } }))
    const r = pruefeKatalog(PARTEIEN, [THEMA], undefined, [], [{ pfad: 'haltungen/04-tempo.json', inhalt: haltung({ positionen: pos }) }])
    expect(r.fehler.join()).toMatch(/„geprueft“ erst nach der Freigabe/)
  })
})
