import { describe, expect, it } from 'vitest'
import { pruefeDatenordner } from './katalog-laden'
import { seedSql } from './seed-sql'
import { naechsteHaltungsId, vergleicheIds } from './ids'
import { trenneHaltungsPhasen } from './stand-vergleich'
import { pruefeKatalog, spielbareHaltungen, type Datei } from '../src/data/katalog'
import { vollstaendigeHaltungen } from '../supabase/functions/_shared/haltung'

// Datenformat und Prüfregeln für daten/haltungen/ (docs/plan-haltungen.md, Teil B und „Automatische Prüfung“).
// Kleiner, echter (nicht fiktiver) Katalog: zwei Parteien, ein Thema ohne Abdeckung.

const parteien = (fiktiv = false): Datei => ({
  pfad: 'parteien.json',
  inhalt: {
    fiktiv,
    parteien: [
      { id: 1, name: 'Partei Eins', kurzname: 'Eins', farbe: '#112233', programm_url: 'https://eins.de/programm.pdf', programm_stand: '2026-01-01', programm_sha256: 'a'.repeat(64) },
      { id: 2, name: 'Partei Zwei', kurzname: 'Zwei', farbe: '#445566', programm_url: 'https://zwei.de/programm.pdf', programm_stand: '2026-02-01', programm_sha256: 'b'.repeat(64) },
    ],
  },
})

const thema: Datei = {
  pfad: 'themen/08-verkehr.json',
  inhalt: {
    id: 8,
    name: 'Verkehr',
    beschreibung: 'Unterwegs sein.',
    ziel: 'Sicher und bezahlbar ankommen.',
    ursachen: [{ id: 801, beschreibung: 'Zu wenige Züge', quelle_url: 'https://studie.de/zuege', ebene: 'bund' }],
  },
}

const position = (ueber: Record<string, unknown> = {}) => ({
  partei_id: 1,
  position: 'ja',
  kurzfassung: 'Will ein Tempolimit von 130 km/h auf Autobahnen.',
  zitat: 'Wir führen ein Tempolimit von 130 km/h ein.',
  beleg_programm_url: 'https://eins.de/programm.pdf#page=12',
  stand: '2026-10-10',
  geprueft: true,
  pruefung: { belege_geprueft: '2026-10-11', einordnung_bestaetigt: 2 },
  ...ueber,
})

const keineAussage = (ueber: Record<string, unknown> = {}) => ({
  partei_id: 2,
  position: 'keine_aussage',
  begruendung: 'Kapitel Verkehr durchsucht (Tempolimit, Autobahn) – nichts gefunden.',
  stand: '2026-10-10',
  geprueft: true,
  pruefung: { belege_geprueft: '2026-10-11', zweite_suche: 'Tempolimit, Höchstgeschwindigkeit, Autobahn erneut gesucht, Kapitel 4 gelesen' },
  ...ueber,
})

const haltung = (ueber: Record<string, unknown> = {}): Datei => ({
  pfad: 'haltungen/01-tempolimit.json',
  inhalt: {
    id: 1,
    frage: 'Soll es ein generelles Tempolimit auf Autobahnen geben?',
    beschreibung: 'Ob überall eine feste Höchstgeschwindigkeit gelten soll.',
    status_quo: 'nein',
    verwandte_themen: [8],
    zielkonflikte: [
      { seite: 'ja', text: 'Wer es will, nennt weniger schwere Unfälle.', quelle_url: 'https://studie.de/unfaelle' },
      { seite: 'nein', text: 'Wer es ablehnt, nennt kürzere Fahrzeiten.', quelle_url: 'https://studie.de/fahrzeit' },
    ],
    positionen: [position(), keineAussage()],
    freigabe: { datum: '2026-10-05' },
    ...ueber,
  },
})

const pruefe = (h: Datei | Datei[], p = parteien(), ids?: Datei) => pruefeKatalog(p, [thema], ids, undefined, Array.isArray(h) ? h : [h])
const fehlerVon = (h: Datei | Datei[], p = parteien()) => pruefe(h, p).fehler.join('\n')
const mitPosition = (ueber: Record<string, unknown>) => haltung({ positionen: [position(ueber), keineAussage()] })

describe('Datenkatalog: Haltungen', () => {
  it('akzeptiert eine freigegebene, vollständige und geprüfte Haltung', () => {
    const { katalog, fehler, warnungen } = pruefe(haltung())
    expect(fehler).toEqual([])
    const zuHaltungen = warnungen.filter((w) => w.startsWith('haltungen/'))
    // Nur das Aufnahmekriterium (der Testkatalog hat zwei Parteien), keine fehlenden oder ungeprüften Positionen.
    expect(zuHaltungen).toEqual([expect.stringMatching(/nur 1 Programme mit erkennbarer Position – Aufnahmekriterium/)])
    expect(katalog.haltungen).toHaveLength(1)
    expect(katalog.haltungen[0].positionen.map((p) => [p.partei_id, p.position])).toEqual([[1, 'ja'], [2, 'keine_aussage']])
    expect(katalog.haltungen[0].zielkonflikte.map((z) => z.seite)).toEqual(['ja', 'nein'])
  })

  it('Phase A allein (ohne Positionen) ist gültig; die Karte fehlt nur', () => {
    const { fehler, warnungen } = pruefe(haltung({ positionen: undefined }))
    expect(fehler).toEqual([])
    expect(warnungen.join('\n')).toMatch(/keine Position für „Eins“ \(1\), „Zwei“ \(2\) – die Haltungskarte erscheint erst/)
  })

  it('prüft Frage, Beschreibung und verwandte Themen', () => {
    expect(fehlerVon(haltung({ frage: 'Tempolimit auf Autobahnen' }))).toMatch(/endet mit „\?“/)
    expect(fehlerVon(haltung({ frage: 'Hat Partei Eins recht mit dem Tempolimit?' }))).toMatch(/„frage“ nennt eine Partei/)
    expect(fehlerVon(haltung({ verwandte_themen: [] }))).toMatch(/„verwandte_themen“ muss eine nicht leere Liste/)
    expect(fehlerVon(haltung({ verwandte_themen: [9] }))).toMatch(/Thema 9 gibt es nicht/)
    expect(fehlerVon(haltung({ verwandte_themen: [8, 8] }))).toMatch(/enthält Doppelte/)
    expect(fehlerVon(haltung({ meinung: 'x' }))).toMatch(/unbekanntes Feld „meinung“/)
    expect(fehlerVon(haltung({ status_quo: undefined }))).toMatch(/„status_quo“ fehlt/)
    expect(fehlerVon(haltung({ status_quo: 'teils' }))).toMatch(/„status_quo“ ist „ja“, „nein“ oder „offen“/)
    expect(fehlerVon(haltung({ status_quo: 'offen' }))).toBe('')
  })

  it('verlangt zwei bis vier Zielkonflikte, mindestens einen je Seite, jeden mit https-Quelle', () => {
    const zk = (seite: string, ueber: Record<string, unknown> = {}) => ({ seite, text: 'Ein Ziel.', quelle_url: 'https://studie.de/x', ...ueber })
    expect(fehlerVon(haltung({ zielkonflikte: [zk('ja')] }))).toMatch(/zwei bis vier Einträge/)
    expect(fehlerVon(haltung({ zielkonflikte: [zk('ja'), zk('ja'), zk('ja'), zk('nein'), zk('nein')] }))).toMatch(/zwei bis vier Einträge/)
    expect(fehlerVon(haltung({ zielkonflikte: [zk('ja'), zk('ja')] }))).toMatch(/mindestens einer für die Seite „nein“/)
    expect(fehlerVon(haltung({ zielkonflikte: [zk('ja'), zk('vielleicht')] }))).toMatch(/„seite“ muss „ja“ oder „nein“ sein/)
    expect(fehlerVon(haltung({ zielkonflikte: [zk('ja'), zk('nein', { quelle_url: 'http://studie.de' })] }))).toMatch(/vollständige https-Adresse/)
    expect(fehlerVon(haltung({ zielkonflikte: [zk('ja'), zk('nein', { quelle_url: 'https://example.org/x' })] }))).toMatch(/Platzhalter-Link/)
    expect(fehlerVon(haltung({ zielkonflikte: [zk('ja'), zk('nein', { text: 'Partei Zwei will das nicht.' })] }))).toMatch(/nennt eine Partei/)
  })

  it('erlaubt Positionen erst nach der Freigabe (bei fiktiven Daten immer)', () => {
    expect(fehlerVon(haltung({ freigabe: undefined }))).toMatch(/„positionen“ erst nach der Freigabe/)
    expect(pruefe(haltung({ freigabe: undefined }), parteien(true)).fehler).toEqual([])
    expect(fehlerVon(haltung({ freigabe: { datum: '5.10.' } }))).toMatch(/Datum im Format/)
  })

  it('verlangt je Positionswert die richtigen Felder', () => {
    expect(fehlerVon(mitPosition({ position: 'eher ja' }))).toMatch(/„position“ muss „ja“, „nein“, „teils“, „keine_aussage“ sein/)
    expect(fehlerVon(mitPosition({ zitat: undefined }))).toMatch(/„zitat“ fehlt/)
    expect(fehlerVon(mitPosition({ kurzfassung: undefined }))).toMatch(/„kurzfassung“ fehlt/)
    expect(fehlerVon(mitPosition({ beleg_programm_url: undefined }))).toMatch(/„beleg_programm_url“ fehlt/)
    expect(fehlerVon(mitPosition({ begruendung: 'x' }))).toMatch(/„begruendung“ nur bei „keine_aussage“/)
    const ohneBegruendung = haltung({ positionen: [position(), keineAussage({ begruendung: undefined })] })
    expect(fehlerVon(ohneBegruendung)).toMatch(/„begruendung“ fehlt/)
    const mitZitat = haltung({ positionen: [position(), keineAussage({ zitat: 'x' })] })
    expect(fehlerVon(mitZitat)).toMatch(/„zitat“ gibt es bei „keine_aussage“ nicht/)
  })

  it('Beleg zeigt mit Seitenanker ins Programm der Partei, Stand nicht vor dem Programm', () => {
    expect(fehlerVon(mitPosition({ beleg_programm_url: 'https://zwei.de/programm.pdf#page=3' }))).toMatch(/zeigt nicht auf das Programm der Partei/)
    expect(fehlerVon(mitPosition({ beleg_programm_url: 'https://eins.de/programm.pdf' }))).toMatch(/Seitenanker/)
    expect(fehlerVon(mitPosition({ stand: '2025-12-31' }))).toMatch(/liegt vor dem Programmstand 2026-01-01/)
  })

  it('Kurzfassung: höchstens 25 Wörter, kein Parteiname', () => {
    const lang = Array.from({ length: 26 }, (_, i) => `Wort${i}`).join(' ')
    expect(fehlerVon(mitPosition({ kurzfassung: lang }))).toMatch(/hat 26 Wörter – höchstens 25/)
    expect(fehlerVon(mitPosition({ kurzfassung: 'Anders als Partei Zwei will sie ein Tempolimit.' }))).toMatch(/„kurzfassung“ nennt eine Partei/)
    expect(fehlerVon(mitPosition({ kurzfassung: 'Will wie die Zwei ein Tempolimit.' }))).toMatch(/„kurzfassung“ nennt eine Partei/)
  })

  it('höchstens eine Position je Partei; unbekannte Parteien werden gemeldet', () => {
    expect(fehlerVon(haltung({ positionen: [position(), position(), keineAussage()] }))).toMatch(/Partei 1 hat schon eine Position/)
    expect(fehlerVon(haltung({ positionen: [position({ partei_id: 7 }), keineAussage()] }))).toMatch(/unbekannte Partei-ID 7/)
  })

  it('„geprueft“ nur mit Nachweis: Belege geprüft, Einordnung zweimal blind bestätigt bzw. zweite Suche', () => {
    expect(fehlerVon(mitPosition({ pruefung: undefined }))).toMatch(/„geprueft“ nur mit „pruefung“: \{ „belege_geprueft“: Datum, „einordnung_bestaetigt“/)
    expect(fehlerVon(mitPosition({ pruefung: { belege_geprueft: '2026-10-11', einordnung_bestaetigt: 1 } }))).toMatch(/mindestens zwei Prüfende/)
    expect(fehlerVon(mitPosition({ pruefung: { belege_geprueft: '2026-10-11', einordnung_bestaetigt: 2, zweite_suche: 'x' } }))).toMatch(/unbekanntes Feld „zweite_suche“/)
    const ohneSuche = haltung({ positionen: [position(), keineAussage({ pruefung: { belege_geprueft: '2026-10-11' } })] })
    expect(fehlerVon(ohneSuche)).toMatch(/„zweite_suche“ fehlt/)
    // Ungeprüfte Entwürfe brauchen keinen Nachweis, melden sich aber als Warnung.
    const entwurf = pruefe(mitPosition({ geprueft: false, ki_entwurf: true, pruefung: undefined }))
    expect(entwurf.fehler).toEqual([])
    expect(entwurf.warnungen.join('\n')).toMatch(/positionen\[0\]: noch nicht geprüft – zählt erst nach der Prüfung \(Testphase: KI-Entwurf\)/)
  })

  it('Haltungs-IDs: eindeutig, nie wiederverwendet (daten/ids.json → „haltungen_stillgelegt“)', () => {
    expect(fehlerVon([haltung(), haltung({ frage: 'Soll es etwas anderes geben?' })])).toMatch(/Haltungs-ID 1 ist doppelt/)
    expect(fehlerVon([haltung(), haltung({ id: 2 })])).toMatch(/gibt es schon/)
    const ids = (hs: unknown): Datei => ({ pfad: 'ids.json', inhalt: { stillgelegt: [], haltungen_stillgelegt: hs } })
    expect(pruefe(haltung(), parteien(), ids([{ id: 1, grund: 'Frage zurückgezogen' }])).fehler.join('\n')).toMatch(/Haltungs-ID 1 ist stillgelegt/)
    expect(pruefe(haltung(), parteien(), ids([{ id: 2, grund: 'Frage zurückgezogen' }])).fehler).toEqual([])
    expect(pruefe(haltung(), parteien(), ids([{ id: 2 }])).fehler.join('\n')).toMatch(/„grund“ fehlt/)
    const k = pruefe(haltung(), parteien(), ids([{ id: 4, grund: 'x' }])).katalog
    expect(naechsteHaltungsId(k)).toBe(5)
  })

  it('warnt, wenn weniger als drei Programme eine erkennbare Position haben (Aufnahmekriterium)', () => {
    // Nur eine Warnung, kein Fehler: Ob die Frage ins Spiel gehört, entscheiden Menschen.
    const drei = pruefe(haltung({ positionen: [position(), position({ partei_id: 2, beleg_programm_url: 'https://zwei.de/programm.pdf#page=3' })] }))
    expect(drei.warnungen.join('\n')).toMatch(/nur 2 Programme mit erkennbarer Position/)
    const keine = pruefe(haltung({ positionen: [keineAussage({ partei_id: 1 }), keineAussage()] }))
    expect(keine.fehler).toEqual([])
    expect(keine.warnungen.join('\n')).toMatch(/nur 0 Programme mit erkennbarer Position – Aufnahmekriterium/)
  })
})

describe('spielbareHaltungen', () => {
  it('öffentlich nur freigegebene Haltungen mit geprüften Positionen; Entwürfe nur im Seed, gekennzeichnet', () => {
    const entwurf = haltung({ positionen: [position(), keineAussage({ geprueft: false, ki_entwurf: true, pruefung: undefined })] })
    const ungeprueft = haltung({ positionen: [position(), keineAussage({ geprueft: false, pruefung: undefined })] })
    const k = (h: Datei) => pruefe(h).katalog

    const oeffentlich = spielbareHaltungen(k(entwurf))
    expect(oeffentlich.positionen.map((p) => p.partei_id)).toEqual([1])
    expect(oeffentlich.positionen[0]).not.toHaveProperty('ki_entwurf')
    expect(oeffentlich.positionen[0]).not.toHaveProperty('geprueft')

    const seed = spielbareHaltungen(k(entwurf), true)
    expect(seed.positionen.map((p) => [p.partei_id, p.ki_entwurf])).toEqual([[1, false], [2, true]])
    // Ungeprüft ohne Entwurfskennzeichen: zählt nirgends.
    expect(spielbareHaltungen(k(ungeprueft), true).positionen.map((p) => p.partei_id)).toEqual([1])

    // Ohne Freigabe (Phase A noch offen): gar nicht im Spiel.
    expect(spielbareHaltungen(k(haltung({ freigabe: undefined, positionen: undefined })))).toEqual({ haltungen: [], positionen: [], zielkonflikte: [] })
  })

  it('liefert Frage, Zielkonflikte und Positionen in der Form der Datenbank', () => {
    const s = spielbareHaltungen(pruefe(haltung()).katalog)
    expect(s.haltungen).toEqual([
      { id: 1, frage: 'Soll es ein generelles Tempolimit auf Autobahnen geben?', beschreibung: 'Ob überall eine feste Höchstgeschwindigkeit gelten soll.', status_quo: 'nein', verwandte_themen: [8] },
    ])
    expect(s.zielkonflikte).toEqual([
      { haltung_id: 1, seite: 'ja', text: 'Wer es will, nennt weniger schwere Unfälle.', quelle_url: 'https://studie.de/unfaelle' },
      { haltung_id: 1, seite: 'nein', text: 'Wer es ablehnt, nennt kürzere Fahrzeiten.', quelle_url: 'https://studie.de/fahrzeit' },
    ])
    expect(s.positionen[1]).toEqual({
      haltung_id: 1, partei_id: 2, land: null, position: 'keine_aussage', kurzfassung: null, zitat: null, beleg_programm_url: null,
      begruendung: 'Kapitel Verkehr durchsucht (Tempolimit, Autobahn) – nichts gefunden.', stand: '2026-10-10',
    })
  })

  it('„Alle oder keine“: vollständig nur mit einer Bundesposition je Partei', () => {
    const s = spielbareHaltungen(pruefe(haltung()).katalog)
    const p = [{ id: 1 }, { id: 2 }]
    expect(vollstaendigeHaltungen(s.haltungen, s.positionen, p).map((h) => h.id)).toEqual([1])
    expect(vollstaendigeHaltungen(s.haltungen, s.positionen.slice(0, 1), p)).toEqual([])
    // Eine Landesposition zählt nicht für die Bundeskarte.
    const land = s.positionen.map((x) => (x.partei_id === 2 ? { ...x, land: 'ST' } : x))
    expect(vollstaendigeHaltungen(s.haltungen, land, p)).toEqual([])
    expect(vollstaendigeHaltungen(s.haltungen, s.positionen, [])).toEqual([])
  })
})

describe('Haltungen im Pull Request (npm run daten:id -- --gegen)', () => {
  const k = (h: Datei | Datei[], ids?: Datei) => pruefe(h, parteien(), ids).katalog
  const phaseA = haltung({ positionen: undefined })

  it('trennt Phase A (Frage, Zielkonflikte) und Phase B (Positionen)', () => {
    // Neue Haltung mit Positionen im selben Schritt.
    expect(trenneHaltungsPhasen(k([]), k(haltung())).join()).toMatch(/Haltung 1: neue Haltung und Positionen im selben Pull Request/)
    // Erst Phase A, dann Positionen: in Ordnung.
    expect(trenneHaltungsPhasen(k([]), k(phaseA))).toEqual([])
    expect(trenneHaltungsPhasen(k(phaseA), k(haltung()))).toEqual([])
    // Frage geändert und Positionen ergänzt.
    const beides = haltung({ frage: 'Soll ein Tempolimit gelten?', freigabe: { datum: '2026-10-09' } })
    expect(trenneHaltungsPhasen(k(phaseA), k(beides)).join()).toMatch(/Frage, Beschreibung oder Zielkonflikte und Positionen im selben Pull Request/)
  })

  it('verlangt nach einer Änderung der Frage eine neue Freigabe', () => {
    const geaendert = haltung({ positionen: undefined, frage: 'Soll ein Tempolimit gelten?' })
    expect(trenneHaltungsPhasen(k(phaseA), k(geaendert)).join()).toMatch(/nach der Freigabe geändert – neue Freigabe/)
    const neuFrei = haltung({ positionen: undefined, frage: 'Soll ein Tempolimit gelten?', freigabe: { datum: '2026-10-09' } })
    expect(trenneHaltungsPhasen(k(phaseA), k(neuFrei))).toEqual([])
  })

  it('eine Haltung verschwindet nicht ohne Stilllegung', () => {
    expect(vergleicheIds(k(haltung()), k([])).join()).toMatch(/Haltung 1 ist entfernt/)
    const ids: Datei = { pfad: 'ids.json', inhalt: { stillgelegt: [], haltungen_stillgelegt: [{ id: 1, grund: 'zurückgezogen' }] } }
    expect(vergleicheIds(k(haltung()), k([], ids))).toEqual([])
    expect(vergleicheIds(k([], ids), k([])).join()).toMatch(/Haltung 1 fehlt in daten\/ids.json/)
  })
})

describe('Haltungen im Repo', () => {
  it('Datenordner ist gültig und der Seed enthält seine Haltungen', () => {
    const { katalog, fehler } = pruefeDatenordner()
    expect(fehler).toEqual([])
    const sql = seedSql(katalog)
    expect(sql).toContain('delete from public.haltungen where id not in (')
    for (const h of spielbareHaltungen(katalog, true).haltungen) expect(sql).toContain(`(${h.id}, '`)
  })
})
