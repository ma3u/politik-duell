import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pruefeDatenordner } from './katalog-laden'
import { pruefMassnahmenTs } from './pruef-massnahmen'
import { seedSql } from './seed-sql'
import { pruefeKatalog, spielbareAbdeckung, spielbareLandesprogramme, spielbareMassnahmen, type Datei } from '../src/data/katalog'

// Kleiner, gültiger Katalog mit echten (nicht fiktiven) Regeln als Ausgangspunkt.
const parteien = (fiktiv = false): Datei => ({
  pfad: 'parteien.json',
  inhalt: {
    fiktiv,
    parteien: [
      { id: 1, name: 'Partei Eins', kurzname: 'Eins', farbe: '#112233', programm_url: 'https://eins.de/programm.pdf', programm_stand: '2026-01-01' },
      { id: 2, name: 'Partei Zwei', kurzname: 'Zwei', farbe: '#445566', programm_url: 'https://zwei.de/programm.pdf', programm_stand: '2026-02-01' },
    ],
  },
})

const massnahme = (ueber: Record<string, unknown> = {}) => ({
  id: 1,
  beschreibung: 'Mehr Praxen',
  ursachen_ids: [11],
  wirksamkeit: 3,
  umsetzbarkeit: 2,
  begruendung: 'Setzt an der Ursache an.',
  zitat: 'Wir schaffen mehr Praxen.',
  beleg_programm_url: 'https://eins.de/programm.pdf#page=4',
  stand: '2026-03-01',
  evidenz: 'belegt',
  geprueft: true,
  bewertung: { anzahl: 2, median_w: 3, median_u: 2, spannweite: 1, datum: '2026-03-05', entwurf: [2, 2] },
  ...ueber,
})

const thema = (ueber: Record<string, unknown> = {}): Datei => ({
  pfad: 'themen/01-arzt.json',
  inhalt: {
    id: 1,
    name: 'Arzttermine',
    beschreibung: 'Lange Wartezeiten.',
    ziel: 'Termine in angemessener Zeit.',
    ursachen: [{ id: 11, beschreibung: 'Zu wenige Praxen', quelle_url: 'https://studie.de/aerzte', ebene: 'bund' }],
    abdeckung: [
      { partei_id: 1, massnahmen: [massnahme()] },
      { partei_id: 2, keine_massnahme: { begruendung: 'Programm durchsucht, nichts gefunden.', stand: '2026-03-01', geprueft: true } },
    ],
    ...ueber,
  },
})

const fehlerVon = (t: Datei, p = parteien()) => pruefeKatalog(p, [t]).fehler.join('\n')

describe('Datenkatalog: Prüfregeln', () => {
  it('akzeptiert einen vollständigen, belegten Katalog', () => {
    const { katalog, fehler, warnungen } = pruefeKatalog(parteien(), [thema()])
    expect(fehler).toEqual([])
    expect(warnungen).toEqual([])
    expect(katalog.massnahmen[0]).toMatchObject({ id: 1, thema_id: 1, partei_id: 1 })
    expect(katalog.ursachen[0]).toMatchObject({ id: 11, thema_id: 1 })
    expect(katalog.abdeckung).toEqual([
      { thema_id: 1, partei_id: 1, land: null, art: 'massnahmen', begruendung: null, stand: '2026-03-01', geprueft: true, ki_entwurf: false },
      { thema_id: 1, partei_id: 2, land: null, art: 'keine', begruendung: 'Programm durchsucht, nichts gefunden.', stand: '2026-03-01', geprueft: true, ki_entwurf: false },
    ])
  })

  it('behandelt fehlende Parteien in der Abdeckung als „noch nicht erfasst“', () => {
    const { katalog, fehler, warnungen } = pruefeKatalog(parteien(), [thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme()] }] })])
    expect(fehler).toEqual([])
    expect(warnungen.join('\n')).toMatch(/noch nicht erfasst für „Zwei“ \(2\)/)
    expect(spielbareAbdeckung(katalog).map((a) => a.partei_id)).toEqual([1])
  })

  it('erlaubt ein Thema nur mit Ursachen (Schritt 1 des Ablaufs)', () => {
    const inhalt = { ...(thema().inhalt as Record<string, unknown>) }
    delete inhalt.abdeckung
    const { katalog, fehler, warnungen } = pruefeKatalog(parteien(), [{ pfad: 'themen/01-arzt.json', inhalt }])
    expect(fehler).toEqual([])
    expect(katalog.ursachen).toHaveLength(1)
    expect(katalog.abdeckung).toEqual([])
    expect(warnungen.join('\n')).toMatch(/noch nicht erfasst für „Eins“ \(1\), „Zwei“ \(2\)/)
    expect(warnungen.join('\n')).not.toMatch(/von keiner Partei adressiert/)
    expect(fehlerVon({ pfad: 'x.json', inhalt: { ...inhalt, abdeckung: {} } })).toMatch(/„abdeckung“ muss eine Liste sein/)
  })

  it('verlangt genau eines von massnahmen oder keine_massnahme', () => {
    const doppelt = { partei_id: 2, massnahmen: [massnahme({ id: 2 })], keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: true } }
    expect(fehlerVon(thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme()] }, doppelt] }))).toMatch(/genau eines/)
    expect(fehlerVon(thema({ abdeckung: [{ partei_id: 1, massnahmen: [] }, { partei_id: 2 }] }))).toMatch(/mindestens eine Maßnahme/)
  })

  it('verlangt bei echten Daten ein Ziel je Thema', () => {
    const t = thema(); delete (t.inhalt as Record<string, unknown>).ziel
    expect(fehlerVon(t)).toMatch(/„ziel“ fehlt/)
    expect(fehlerVon(t, parteien(true))).not.toMatch(/ziel/)
  })

  it('erlaubt einen Vermerk für nachträglich ergänzte Ursachen', () => {
    const u = { id: 11, beschreibung: 'Zu wenige Praxen', quelle_url: 'https://studie.de/aerzte', ebene: 'bund' }
    expect(fehlerVon(thema({ ursachen: [{ ...u, nachtraeglich: '2026-09-28: ergänzt, weil …' }] }))).toBe('')
    expect(fehlerVon(thema({ ursachen: [{ ...u, nachtraeglich: '' }] }))).toMatch(/„nachtraeglich“ fehlt oder ist leer/)
  })

  it('verlangt bei echten Daten ein wörtliches Zitat, bei fiktiven nicht', () => {
    const ohneZitat = { ...massnahme() } as Record<string, unknown>
    delete ohneZitat.zitat
    const t = thema({ abdeckung: [{ partei_id: 1, massnahmen: [ohneZitat] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: true } }] })
    expect(fehlerVon(t)).toMatch(/„zitat“ fehlt/)
    expect(fehlerVon(t, parteien(true))).not.toMatch(/zitat/)
    expect(pruefeKatalog(parteien(), [thema()]).katalog.massnahmen[0].zitat).toBe('Wir schaffen mehr Praxen.')
  })

  it('erlaubt gleichen Namen und Kurznamen, aber keine Doppelung zwischen Parteien', () => {
    const p = parteien()
    const liste = (p.inhalt as { parteien: Record<string, unknown>[] }).parteien
    liste[0] = { ...liste[0], name: 'SPD', kurzname: 'SPD' }
    expect(pruefeKatalog(p, [thema()]).fehler.join('\n')).not.toMatch(/doppelt/)
    liste[1] = { ...liste[1], kurzname: 'SPD' }
    expect(pruefeKatalog(p, [thema()]).fehler.join('\n')).toMatch(/„SPD“ ist doppelt/)
  })

  it('verlangt einen Beleg mit Seitenanker im Programm genau dieser Partei', () => {
    const ohneAnker = thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme({ beleg_programm_url: 'https://eins.de/programm.pdf' })] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: true } }] })
    expect(fehlerVon(ohneAnker)).toMatch(/Seitenanker/)
    const fremd = thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme({ beleg_programm_url: 'https://zwei.de/programm.pdf#page=3' })] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: true } }] })
    expect(fehlerVon(fremd)).toMatch(/nicht auf das Programm der Partei/)
  })

  it('lehnt Werte außerhalb 0–3, fremde Ursachen und unbekannte Rollen ab', () => {
    const mit = (m: Record<string, unknown>) =>
      fehlerVon(thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme(m)] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: true } }] }))
    expect(mit({ wirksamkeit: 4 })).toMatch(/„wirksamkeit“ muss eine ganze Zahl von 0 bis 3/)
    expect(mit({ umsetzbarkeit: 1.5 })).toMatch(/„umsetzbarkeit“/)
    expect(mit({ ursachen_ids: [99] })).toMatch(/Ursache 99 gehört nicht zum Thema/)
    expect(mit({ rollen_modifikator: { pilot: { wert: 1, begruendung: 'x' } } })).toMatch(/unbekannte Rolle/)
    expect(mit({ rollen_modifikator: { mieter: { wert: 1 } } })).toMatch(/„begruendung“ fehlt/)
    expect(mit({ rollen_modifikator: { mieter: { wert: 3, begruendung: 'x' } } })).toMatch(/von -2 bis 2/)
    expect(mit({ wirkung: 3 })).toMatch(/unbekanntes Feld „wirkung“/)
  })

  it('bei echten Daten „geprueft“ erst ab zwei Bewertungen; Mediane passen zu den Werten', () => {
    const mit = (m: Record<string, unknown>, p = parteien()) =>
      fehlerVon(thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme(m)] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: true } }] }), p)
    const bw = { anzahl: 2, median_w: 3, median_u: 2, spannweite: 1, datum: '2026-03-05', entwurf: [2, 2] }
    expect(mit({ bewertung: undefined })).toMatch(/erst ab zwei unabhängigen Bewertungen/)
    expect(mit({ bewertung: { ...bw, anzahl: 1 } })).toMatch(/erst ab zwei unabhängigen Bewertungen/)
    expect(mit({ bewertung: undefined, geprueft: false })).toBe('')
    expect(mit({ bewertung: undefined }, parteien(true))).toBe('')
    expect(mit({ wirksamkeit: 2 })).toMatch(/weichen von den Medianen der Prüfung ab/)
    expect(mit({ bewertung: { ...bw, median_w: 2.5 } })).toMatch(/„median_w“ muss eine ganze Zahl/)
    expect(mit({ bewertung: { ...bw, entwurf: [2] } })).toMatch(/„entwurf“/)
    expect(mit({ bewertung: { ...bw, namen: ['Erika'] } })).toMatch(/unbekanntes Feld „namen“/)
  })

  it('verlangt Quellen für Ursachen und verbietet Platzhalter-Links bei echten Daten', () => {
    expect(fehlerVon(thema({ ursachen: [{ id: 11, beschreibung: 'Zu wenige Praxen' }] }))).toMatch(/„quelle_url“ fehlt/)
    const platzhalter = thema({ ursachen: [{ id: 11, beschreibung: 'x', quelle_url: 'https://example.org/studie' }] })
    expect(fehlerVon(platzhalter)).toMatch(/Platzhalter-Link/)
    expect(fehlerVon(platzhalter, parteien(true))).not.toMatch(/Platzhalter-Link/)
  })

  it('verlangt eine Neuprüfung, wenn der Eintrag älter als das Programm ist', () => {
    const alt = thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme({ stand: '2025-12-01' })] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-01-15', geprueft: true } }] })
    const f = fehlerVon(alt)
    expect(f).toMatch(/2025-12-01 liegt vor dem Programmstand 2026-01-01/)
    expect(f).toMatch(/2026-01-15 liegt vor dem Programmstand 2026-02-01/)
  })

  it('erkennt doppelte IDs über Dateien hinweg', () => {
    const zweites = thema({ name: 'Anderes' })
    const f = pruefeKatalog(parteien(), [thema(), zweites]).fehler.join('\n')
    expect(f).toMatch(/Themen-ID 1 ist doppelt/)
    expect(f).toMatch(/Ursachen-ID 11 ist doppelt/)
    expect(f).toMatch(/Maßnahmen-ID 1 ist doppelt/)
  })

  it('übernimmt bei echten Daten nur vollständig geprüfte Einträge je Thema und Partei', () => {
    // Partei 1: eine Maßnahme geprüft, eine nicht → ganzer Eintrag gilt als „noch nicht erfasst“.
    const t = thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme(), massnahme({ id: 2, geprueft: false })] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: true } }] })
    const echt = pruefeKatalog(parteien(), [t])
    expect(echt.fehler).toEqual([])
    expect(echt.warnungen).toHaveLength(1)
    expect(spielbareMassnahmen(echt.katalog)).toEqual([])
    expect(spielbareAbdeckung(echt.katalog)).toEqual([
      { thema_id: 1, partei_id: 2, land: null, art: 'keine', begruendung: 'x', stand: '2026-03-01' },
    ])

    // Sind alle Maßnahmen geprüft, zählt der Eintrag.
    const fertig = thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme(), massnahme({ id: 2 })] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: false } }] })
    const k = pruefeKatalog(parteien(), [fertig]).katalog
    expect(spielbareMassnahmen(k).map((m) => m.id)).toEqual([1, 2])
    expect(spielbareAbdeckung(k).map((a) => a.partei_id)).toEqual([1])

    const fiktiv = pruefeKatalog(parteien(true), [t])
    expect(fiktiv.warnungen).toEqual([])
    expect(spielbareMassnahmen(fiktiv.katalog).map((m) => m.id)).toEqual([1, 2])
  })
})

describe('Datenkatalog: Länder und Stand der Forschung', () => {
  // Partei 1 hat ein Programm zur letzten Wahl in ST, Partei 2 ist dort nicht angetreten.
  const mitLaendern = (ueber: Record<string, unknown>[] = []): Datei => {
    const p = parteien()
    const inhalt = p.inhalt as { parteien: Record<string, unknown>[] } & Record<string, unknown>
    inhalt.laender = [{ id: 'ST', name: 'Sachsen-Anhalt', letzte_wahl: '2026-09-06' }]
    inhalt.parteien[0].landesprogramme = [
      { land: 'ST', landtagswahl: '2026-09-06', url: 'https://eins.de/st.pdf', stand: '2026-04-01' },
      ...ueber,
    ]
    inhalt.parteien[1].landesprogramme = [{ land: 'ST', landtagswahl: '2026-09-06', kein_programm: 'nicht angetreten' }]
    return p
  }
  const landUrsachen = [
    { id: 11, beschreibung: 'Zu wenige Praxen', quelle_url: 'https://studie.de/aerzte', ebene: 'bund' },
    { id: 12, beschreibung: 'Zu wenige Lehrkräfte', quelle_url: 'https://studie.de/schule', ebene: 'land' },
  ]
  const landMassnahme = (ueber: Record<string, unknown> = {}) =>
    massnahme({ id: 5, ursachen_ids: [12], beleg_programm_url: 'https://eins.de/st.pdf#page=7', stand: '2026-05-01', ...ueber })
  const mitLandEintrag = (m: Record<string, unknown> = landMassnahme()) =>
    thema({ ursachen: landUrsachen, abdeckung: [...(thema().inhalt as { abdeckung: unknown[] }).abdeckung, { partei_id: 1, land: 'ST', massnahmen: [m] }] })

  it('liest Länder und Landesprogramme; nur aktuelle zählen', () => {
    const { katalog, fehler } = pruefeKatalog(mitLaendern(), [mitLandEintrag()])
    expect(fehler).toEqual([])
    expect(katalog.laender).toEqual([{ id: 'ST', name: 'Sachsen-Anhalt', letzte_wahl: '2026-09-06' }])
    expect(spielbareLandesprogramme(katalog)).toEqual([
      { partei_id: 1, land: 'ST', url: 'https://eins.de/st.pdf', stand: '2026-04-01', kein_programm: null },
      { partei_id: 2, land: 'ST', url: null, stand: null, kein_programm: 'nicht angetreten' },
    ])
    expect(spielbareMassnahmen(katalog).map((m) => [m.id, m.land])).toEqual([[1, null], [5, 'ST']])
    expect(spielbareAbdeckung(katalog).filter((a) => a.land).map((a) => a.partei_id)).toEqual([1])
  })

  it('verwirft Landesprogramme früherer Wahlperioden mit Warnung', () => {
    const p = mitLaendern()
    const inhalt = p.inhalt as { laender: Record<string, unknown>[] }
    inhalt.laender[0].letzte_wahl = '2031-06-01'
    const { katalog, fehler, warnungen } = pruefeKatalog(p, [mitLandEintrag()])
    expect(fehler).toEqual([])
    expect(warnungen.join('\n')).toMatch(/veraltet/)
    expect(spielbareLandesprogramme(katalog)).toEqual([])
    expect(spielbareMassnahmen(katalog).map((m) => m.id)).toEqual([1])
  })

  it('prüft Landeseinträge: Programm, Beleg und Ebene der Ursache', () => {
    expect(fehlerVon(mitLandEintrag(landMassnahme({ beleg_programm_url: 'https://eins.de/programm.pdf#page=7' })), mitLaendern()))
      .toMatch(/nicht auf das Programm der Partei \(https:\/\/eins.de\/st.pdf\)/)
    expect(fehlerVon(mitLandEintrag(landMassnahme({ ursachen_ids: [11] })), mitLaendern())).toMatch(/Ursache 11 liegt beim Bund/)
    expect(fehlerVon(mitLandEintrag(landMassnahme({ stand: '2026-03-01' })), mitLaendern())).toMatch(/vor dem Programmstand 2026-04-01/)
    const ohneProgramm = thema({ ursachen: landUrsachen, abdeckung: [{ partei_id: 2, land: 'ST', keine_massnahme: { begruendung: 'x', stand: '2026-05-01', geprueft: true } }] })
    expect(fehlerVon(ohneProgramm, mitLaendern())).toMatch(/hat in „ST“ kein Programm/)
    const unbekannt = thema({ ursachen: landUrsachen, abdeckung: [{ partei_id: 1, land: 'BY', keine_massnahme: { begruendung: 'x', stand: '2026-05-01', geprueft: true } }] })
    expect(fehlerVon(unbekannt, mitLaendern())).toMatch(/kein Landesprogramm „BY“/)
    expect(fehlerVon(mitLandEintrag(), mitLaendern([{ land: 'ST', landtagswahl: '2026-09-06', kein_programm: 'x' }]))).toMatch(/„ST“ ist für diese Partei doppelt/)
    expect(fehlerVon(mitLandEintrag(), mitLaendern([{ land: 'XX', landtagswahl: '2026-09-06', kein_programm: 'x' }]))).toMatch(/unbekanntes Land „XX“/)
  })

  it('verlangt bei echten Daten eine Ebene je Ursache', () => {
    const ohne = thema({ ursachen: [{ id: 11, beschreibung: 'x', quelle_url: 'https://studie.de/aerzte' }] })
    expect(fehlerVon(ohne)).toMatch(/„ebene“ muss „bund“ oder „land“ sein/)
    expect(fehlerVon(ohne, parteien(true))).not.toMatch(/ebene/)
  })

  it('erlaubt Wirksamkeit 3 nur mit belegter Wirkung', () => {
    const mit = (m: Record<string, unknown>) =>
      fehlerVon(thema({ abdeckung: [{ partei_id: 1, massnahmen: [massnahme(m)] }, { partei_id: 2, keine_massnahme: { begruendung: 'x', stand: '2026-03-01', geprueft: true } }] }))
    expect(mit({ evidenz: 'gemischt' })).toMatch(/„wirksamkeit“ 3 nur mit „evidenz“: „belegt“/)
    expect(mit({ evidenz: 'unklar' })).toMatch(/„evidenz“ muss/)
    expect(mit({ evidenz: undefined })).toMatch(/„evidenz“ fehlt/)
    expect(mit({ evidenz: 'gemischt', wirksamkeit: 2, bewertung: { anzahl: 2, median_w: 2, median_u: 2, spannweite: 1, datum: '2026-03-05', entwurf: [2, 2] } })).toBe('')
  })
})

describe('Datenkatalog: KI-Entwürfe für die Testphase', () => {
  const eintraege = (eins: Record<string, unknown>[], zwei: Record<string, unknown> = { begruendung: 'x', stand: '2026-03-01', geprueft: false, ki_entwurf: true }) =>
    thema({ abdeckung: [{ partei_id: 1, massnahmen: eins }, { partei_id: 2, keine_massnahme: zwei }] })
  const ki = (ueber: Record<string, unknown> = {}) => massnahme({ geprueft: false, bewertung: undefined, ki_entwurf: true, ...ueber })

  it('zählt KI-Entwürfe nur mit Testphase, gekennzeichnet', () => {
    const { katalog, fehler } = pruefeKatalog(parteien(), [eintraege([ki(), massnahme({ id: 2 })])])
    expect(fehler).toEqual([])
    // Öffentlich: nichts (Partei 1 hat einen KI-Entwurf, Partei 2 ist nur KI-Entwurf).
    expect(spielbareAbdeckung(katalog)).toEqual([])
    expect(spielbareMassnahmen(katalog)).toEqual([])
    // Mit Testphase: beide Einträge, als KI-Entwurf gekennzeichnet – auch die schon geprüfte Maßnahme im selben Eintrag.
    expect(spielbareAbdeckung(katalog, true).map((a) => [a.partei_id, a.ki_entwurf])).toEqual([[1, true], [2, true]])
    expect(spielbareMassnahmen(katalog, true).map((m) => [m.id, m.ki_entwurf])).toEqual([[1, true], [2, true]])
  })

  it('zählt einen Eintrag nicht, wenn ein Teil weder geprüft noch KI-Entwurf ist', () => {
    const { katalog } = pruefeKatalog(parteien(), [eintraege([ki(), massnahme({ id: 2, geprueft: false, bewertung: undefined })])])
    expect(spielbareAbdeckung(katalog, true).map((a) => a.partei_id)).toEqual([2])
  })

  it('geprüfte Einträge bleiben öffentlich, ohne Kennzeichnung', () => {
    const { katalog } = pruefeKatalog(parteien(), [eintraege([massnahme()], { begruendung: 'x', stand: '2026-03-01', geprueft: true })])
    expect(spielbareAbdeckung(katalog, true).map((a) => a.ki_entwurf)).toEqual([false, false])
    expect(spielbareAbdeckung(katalog).map((a) => a.ki_entwurf)).toEqual([undefined, undefined])
  })

  it('verlangt auch bei KI-Entwürfen den Forschungsstand', () => {
    expect(fehlerVon(eintraege([ki({ evidenz: undefined })]))).toMatch(/„evidenz“ fehlt/)
    expect(fehlerVon(eintraege([ki({ ki_entwurf: 'ja' })]))).toMatch(/„ki_entwurf“ muss true oder false sein/)
  })
})

describe('Datenkatalog im Repo (daten/)', () => {
  const { katalog, fehler } = pruefeDatenordner()

  it('ist fehlerfrei', () => {
    expect(fehler).toEqual([])
  })

  it('hat höchstens einen Eintrag je Thema, Partei und Programm', () => {
    const paare = katalog.abdeckung.map((a) => `${a.thema_id}/${a.partei_id}/${a.land ?? ''}`)
    expect(new Set(paare).size).toBe(paare.length)
  })

  it('belegt alle Ursachen mit echten Quellen (keine Platzhalter)', () => {
    const platzhalter = katalog.ursachen.filter((u) => new URL(u.quelle_url).hostname.startsWith('example.'))
    expect(platzhalter.map((u) => u.id)).toEqual([])
  })

  it('supabase/seed.sql ist aktuell (sonst: npm run seed)', () => {
    const datei = readFileSync(new URL('../supabase/seed.sql', import.meta.url), 'utf8')
    expect(datei).toBe(seedSql(katalog))
  })

  it('Maßnahmenliste der Edge Function `pruefung` ist aktuell (sonst: npm run seed)', () => {
    const datei = readFileSync(new URL('../supabase/functions/_shared/pruef-massnahmen.ts', import.meta.url), 'utf8')
    expect(datei).toBe(pruefMassnahmenTs(katalog))
  })
})
