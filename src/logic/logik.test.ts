import { describe, expect, it } from 'vitest'
import { ABDECKUNG, INSTRUMENTE, MASSNAHMEN, PARTEIEN, THEMEN, URSACHEN } from '../data/mock'
import type { AbdeckungEintrag, Landesprogramm, Massnahme, Nachricht } from '../data/types'
import { kartenHaltungen, MOCK_DATEN } from '../data/quelle'
import { analysiere } from './analyse'
import { besteParteien, bewertePartei, massnahmenPunkte, rundenpunkte, werteRunde, type Ebenen } from './bewertung'
import { ohneTreffer } from './ohneTreffer'

const spieler = (...texte: string[]): Nachricht[] => texte.map((text) => ({ von: 'spieler', text }))
const partei = (id: number) => PARTEIEN.find((p) => p.id === id)!

describe('analysiere (Mock der Edge Function)', () => {
  it('erkennt ein Alltagsproblem und ordnet Thema und Ursache zu', () => {
    const a = analysiere(spieler('Ich warte seit Monaten auf einen Termin beim Facharzt'), THEMEN, URSACHEN)
    expect(a.typ).toBe('problem')
    expect(a.thema_id).toBe(1)
    expect(a.ursachen_ids).toEqual([102])
  })

  it('fragt bei einer Forderung nach dem Problem dahinter', () => {
    const a = analysiere(spieler('Weniger Steuern!'), THEMEN, URSACHEN)
    expect(a.typ).toBe('forderung')
    expect(a.nachfrage).toBeTruthy()
  })

  it('fragt bei einem Pauschalurteil nach dem Erlebten und gibt das Urteil nicht wieder', () => {
    const a = analysiere(spieler('Die Ausländer sind doch alle kriminell'), THEMEN, URSACHEN)
    expect(a.typ).toBe('forderung')
    expect(a.nachfrage).toContain('selbst erlebt')
    expect(a).toMatchObject({ pauschal: true, thema_id: null })
    expect(a.zusammenfassung).not.toMatch(/kriminell|Ausländer/i)
  })

  it('geht auf Abwertung, Gewaltaufrufe und Beleidigungen nicht ein (Grenze)', () => {
    for (const text of ['Die gehören alle aufgehängt', 'Das sind doch keine Menschen', 'Die sollen keine Rechte haben', 'Du Vollidiot']) {
      const a = analysiere(spieler(text), THEMEN, URSACHEN, { instrumente: INSTRUMENTE, massnahmen: MASSNAHMEN })
      expect(a).toEqual({
        typ: 'grenze', nachfrage: null, thema_id: null, ursachen_ids: [], zusammenfassung: '', stichwort: '', einschaetzung: null, rueckmeldung: null,
      })
    }
    // Ein Pauschalurteil ist noch keine Grenze: Nachfrage nach dem Erlebten.
    expect(analysiere(spieler('Die Ausländer sind doch alle kriminell'), THEMEN, URSACHEN)).toMatchObject({ typ: 'forderung', pauschal: true })
    // Auch eine Forderung mit Thema bleibt eine Forderung.
    expect(analysiere(spieler('Mehr Abschiebungen!'), THEMEN, URSACHEN).typ).toBe('forderung')
  })

  it('fragt höchstens zweimal nach', () => {
    const verlauf: Nachricht[] = [
      { von: 'spieler', text: 'Mehr Wohnungen!' },
      { von: 'ki', text: 'Nachfrage 1' },
      { von: 'spieler', text: 'Man sollte mehr bauen' },
      { von: 'ki', text: 'Nachfrage 2' },
      { von: 'spieler', text: 'Wir brauchen mehr Wohnungen' },
    ]
    const a = analysiere(verlauf, THEMEN, URSACHEN)
    // Bleibt es bei der Forderung, wird sie nicht zum Problem umgedeutet: ohne Wertung, mit Thema.
    expect(a).toMatchObject({ typ: 'forderung', nachfrage: null, thema_id: 2, ursachen_ids: [] })
  })

  it('nennt bei einer Forderung das Thema für die Ursachenauswahl', () => {
    const a = analysiere(spieler('Mehr Wohnungen!'), THEMEN, URSACHEN)
    expect(a).toMatchObject({ typ: 'forderung', thema_id: 2, ursachen_ids: [] })
    expect(a.nachfrage).toBeTruthy()
  })

  it('ordnet eine Forderung einem Instrument des Themas zu (zweiter Schritt, nur mit eindeutigem Treffer)', () => {
    const mit = (text: string, land: string | null = null) =>
      analysiere(spieler(text), THEMEN, URSACHEN, { instrumente: INSTRUMENTE, massnahmen: MASSNAHMEN, land })
    const a = mit('Weg mit hohen Mieten – Mietpreisbremse verlängern!')
    expect(a).toMatchObject({ typ: 'forderung', thema_id: 2, instrument_id: 90 })
    // Ohne eindeutigen Treffer (nur das Thema ist klar): kein Instrument, die Forderung bleibt wie bisher.
    expect(mit('Weniger Mieten!')).toMatchObject({ typ: 'forderung', thema_id: 2 })
    expect(mit('Weniger Mieten!')).not.toHaveProperty('instrument_id')
    // Ohne Katalog (alter Aufruf) ändert sich nichts.
    expect(analysiere(spieler('Weg mit hohen Mieten – Mietpreisbremse verlängern!'), THEMEN, URSACHEN)).not.toHaveProperty('instrument_id')
  })

  it('ordnet Pauschalurteile und Probleme keinem Instrument zu', () => {
    const o = { instrumente: INSTRUMENTE, massnahmen: MASSNAHMEN }
    expect(analysiere(spieler('Die Ausländer sind doch alle kriminell'), THEMEN, URSACHEN, o)).not.toHaveProperty('instrument_id')
    expect(analysiere(spieler('Die Mietpreisbremse greift bei mir nicht, ich finde keine Wohnung'), THEMEN, URSACHEN, o)).not.toHaveProperty('instrument_id')
  })

  it('erkennt eine persönliche Haltung', () => {
    const a = analysiere(spieler('Ich finde Gerechtigkeit wichtig'), THEMEN, URSACHEN)
    expect(a.typ).toBe('wert')
  })

  it('ordnet eine Haltung einer vollständig erfassten Wertfrage zu (Haltungskarte), sonst keiner', () => {
    const o = { haltungen: kartenHaltungen(MOCK_DATEN) }
    expect(analysiere(spieler('Ich finde, ein Tempolimit wäre richtig'), THEMEN, URSACHEN, o)).toMatchObject({ typ: 'wert', haltung_id: 1 })
    expect(analysiere(spieler('Ich bin dagegen, dass so viele Menschen zuwandern – es sind zu viele'), THEMEN, URSACHEN, o)).toMatchObject({
      typ: 'wert',
      haltung_id: 2,
    })
    // Haltung 3 ist nicht für alle Parteien erfasst: keine Zuordnung, nur der Satz.
    const unvollstaendig = analysiere(spieler('Ich finde Wahlfreiheit bei der Betreuung wichtig'), THEMEN, URSACHEN, o)
    expect(unvollstaendig.typ).toBe('wert')
    expect(unvollstaendig).not.toHaveProperty('haltung_id')
    // Ohne Haltungen (Datenbank ohne Karten) und bei einer Forderung: keine Haltung.
    expect(analysiere(spieler('Ich finde, ein Tempolimit wäre richtig'), THEMEN, URSACHEN)).not.toHaveProperty('haltung_id')
    expect(analysiere(spieler('Wir brauchen ein Tempolimit!'), THEMEN, URSACHEN, o)).toMatchObject({ typ: 'forderung' })
    expect(analysiere(spieler('Wir brauchen ein Tempolimit!'), THEMEN, URSACHEN, o)).not.toHaveProperty('haltung_id')
    // Ein Problem bleibt ein Problem.
    expect(analysiere(spieler('Ich finde keine bezahlbare Wohnung, die Miete ist zu hoch'), THEMEN, URSACHEN, o)).not.toHaveProperty('haltung_id')
  })

  it('liefert thema_id null für unbekannte Themen', () => {
    const a = analysiere(spieler('Das Internet bei uns im Ort ist ständig weg'), THEMEN, URSACHEN)
    expect(a.typ).toBe('problem')
    expect(a.thema_id).toBeNull()
  })

  it('fragt nach, wenn das Thema klar ist, aber keine Ursache', () => {
    const a = analysiere(spieler('Meine Stromrechnung ist ein Problem'), THEMEN, URSACHEN)
    expect(a).toMatchObject({ typ: 'problem', thema_id: 3, ursachen_ids: [] })
    expect(a.nachfrage).toBeTruthy()
  })

  it('wertet ohne erkennbare Ursache nach zwei Nachfragen nicht', () => {
    const verlauf: Nachricht[] = [
      { von: 'spieler', text: 'Meine Stromrechnung ist ein Problem' },
      { von: 'ki', text: 'Nachfrage 1' },
      { von: 'spieler', text: 'Die Stromrechnung eben' },
      { von: 'ki', text: 'Nachfrage 2' },
      { von: 'spieler', text: 'Strom ist ein Problem' },
    ]
    const a = analysiere(verlauf, THEMEN, URSACHEN)
    expect(a).toMatchObject({ typ: 'problem', nachfrage: null, thema_id: null, ursachen_ids: [] })
  })
})

describe('Bewertung', () => {
  it('summiert über Ursachen und nimmt je Ursache die beste Maßnahme', () => {
    // Partei Gamma, Energie: Netzentgelte (2+2) + Importe (2+2); Steuern: keine Maßnahme
    const e = bewertePartei(partei(3), 3, [301, 302, 303], null, MASSNAHMEN, ABDECKUNG)
    expect(e.punkte).toBe(8)
    expect(e.treffer).toHaveLength(2)
  })

  it('gibt 0 Punkte ohne Maßnahme zum Thema und vermerkt „keine“', () => {
    const e = bewertePartei(partei(5), 1, [101, 102, 103], null, MASSNAHMEN, ABDECKUNG)
    expect(e.punkte).toBe(0)
    expect(e.abdeckung?.art).toBe('keine')
    expect(e.abdeckung?.begruendung).toBeTruthy()
  })

  it('unterscheidet „keine Maßnahme zu diesen Ursachen“ von „nichts zum Thema“', () => {
    // Partei Beta hat Maßnahmen zu Arztterminen, aber keine zu fehlenden Praxen (101).
    const e = bewertePartei(partei(2), 1, [101], null, MASSNAHMEN, ABDECKUNG)
    expect(e.punkte).toBe(0)
    expect(e.abdeckung?.art).toBe('massnahmen')
  })

  it('wertet nicht, wenn das Thema für eine Partei noch nicht erfasst ist', () => {
    const ohneAlpha = ABDECKUNG.filter((a) => !(a.partei_id === 1 && a.thema_id === 2))
    const alpha = bewertePartei(partei(1), 2, [202], null, MASSNAHMEN, ohneAlpha)
    const beta = bewertePartei(partei(2), 2, [201], null, MASSNAHMEN, ohneAlpha)
    expect(alpha.abdeckung).toBeNull()
    // Maßnahmen liegen vor, zählen aber nicht, solange das Thema nicht erfasst ist.
    expect(alpha.treffer).toEqual([])
    expect(alpha.punkte).toBe(0)
    expect(werteRunde(alpha, beta)).toEqual({ status: 'unvollstaendig', punkte: [0, 0] })
    expect(werteRunde(beta, alpha)).toEqual({ status: 'unvollstaendig', punkte: [0, 0] })
    // Sind beide erfasst, gilt die normale Regel.
    const alphaErfasst = bewertePartei(partei(1), 2, [202], null, MASSNAHMEN, ABDECKUNG)
    expect(werteRunde(alphaErfasst, beta).status).toBe('gewertet')
  })

  it('vergleicht bei der besten Lösung nur erfasste Parteien', () => {
    const ohneAlpha = ABDECKUNG.filter((a) => !(a.partei_id === 1 && a.thema_id === 1))
    expect(besteParteien(PARTEIEN, 1, [101], null, MASSNAHMEN, ohneAlpha).map((b) => b.partei.id)).toEqual([3])
    expect(besteParteien(PARTEIEN, 1, [101], null, MASSNAHMEN, [])).toEqual([])
  })

  it('berücksichtigt den Rollen-Modifikator', () => {
    // Beispielmaßnahme: Wirksamkeit 2, Umsetzbarkeit 3; Mieter +1, Eigentümer −1 auf die Wirksamkeit.
    expect(bewertePartei(partei(1), 2, [202], null, MASSNAHMEN, ABDECKUNG).punkte).toBe(2 * 3)
    expect(bewertePartei(partei(1), 2, [202], 'mieter', MASSNAHMEN, ABDECKUNG).punkte).toBe(3 * 3)
    expect(bewertePartei(partei(1), 2, [202], 'eigentuemer', MASSNAHMEN, ABDECKUNG).punkte).toBe(1 * 3)
  })

  it('multipliziert Wirksamkeit und Umsetzbarkeit, Rolle nur innerhalb 0–3', () => {
    const m = { ...MASSNAHMEN[0], wirksamkeit: 1 as const, umsetzbarkeit: 3 as const, rollen_modifikator: { mieter: { wert: 2, begruendung: 'x' }, eigentuemer: { wert: -2, begruendung: 'x' } } }
    expect(massnahmenPunkte(m, null).punkte).toBe(3)
    expect(massnahmenPunkte({ ...m, wirksamkeit: 0 }, null).punkte).toBe(0)
    expect(massnahmenPunkte({ ...m, umsetzbarkeit: 0 }, null).punkte).toBe(0)
    expect(massnahmenPunkte({ ...m, wirksamkeit: 2 }, 'mieter')).toMatchObject({ punkte: 9, wirksamkeit: 3 })
    expect(massnahmenPunkte(m, 'eigentuemer')).toMatchObject({ punkte: 0, wirksamkeit: 0 })
  })

  it('hebt die Wirksamkeit über die Rolle nur mit belegter Wirkung auf 3', () => {
    const m = { ...MASSNAHMEN[0], wirksamkeit: 2 as const, umsetzbarkeit: 3 as const, rollen_modifikator: { mieter: { wert: 1, begruendung: 'x' } } }
    expect(massnahmenPunkte({ ...m, evidenz: 'gemischt' }, 'mieter')).toMatchObject({ punkte: 6, wirksamkeit: 2 })
    expect(massnahmenPunkte({ ...m, evidenz: 'offen' }, 'mieter')).toMatchObject({ punkte: 6, wirksamkeit: 2 })
    expect(massnahmenPunkte({ ...m, evidenz: 'belegt' }, 'mieter')).toMatchObject({ punkte: 9, wirksamkeit: 3 })
  })

  it('wertet nicht für eine Ursache, nach der das Programm nicht durchsucht wurde', () => {
    // Partei Gamma, Energie: Maßnahmen zu 301 und 303, keine zu 302. Angenommen, 302 kam nachträglich dazu.
    const ohne302 = ABDECKUNG.map((a) => (a.partei_id === 3 && a.thema_id === 3 ? { ...a, durchsucht_fuer: [301, 303] } : a))
    expect(bewertePartei(partei(3), 3, [301], null, MASSNAHMEN, ohne302).punkte).toBe(4)
    const neu = bewertePartei(partei(3), 3, [301, 302], null, MASSNAHMEN, ohne302)
    expect(neu.abdeckung).toBeNull()
    expect(neu.fehlt).toMatchObject({ grund: 'nicht_erfasst' })
    // Ohne Angabe (ältere Einträge) gilt das Programm für alle Ursachen als durchsucht: 0 Punkte bei 302.
    expect(bewertePartei(partei(3), 3, [302], null, MASSNAHMEN, ABDECKUNG)).toMatchObject({ punkte: 0, abdeckung: { art: 'massnahmen' } })
  })

  it('vergibt Rundenpunkte nach Regel', () => {
    expect(rundenpunkte(5, 3)).toEqual([1, 0])
    expect(rundenpunkte(2, 4)).toEqual([0, 1])
    expect(rundenpunkte(4, 4)).toEqual([1, 1])
    expect(rundenpunkte(0, 0)).toEqual([0, 0])
  })

  it('findet die insgesamt beste Partei', () => {
    const beste = besteParteien(PARTEIEN, 1, [101], null, MASSNAHMEN, ABDECKUNG)
    expect(beste.map((b) => b.partei.id)).toEqual([1])
  })
})

describe('Bewertung mit Bund und Ländern', () => {
  // Thema 99: Ursache 991 beim Bund, 992 bei den Ländern. Alpha hat ein Programm in ST, Beta ist dort nicht angetreten.
  const alpha = partei(1)
  const beta = partei(2)
  const m = (id: number, parteiId: number, ursache: number, land: string | null, w: 0 | 1 | 2 | 3, u: 0 | 1 | 2 | 3): Massnahme => ({
    id, thema_id: 99, partei_id: parteiId, land, beschreibung: `M${id}`, ursachen_ids: [ursache], wirksamkeit: w, umsetzbarkeit: u,
    begruendung: 'x', beleg_programm_url: 'https://example.org/p.pdf#page=1', stand: '2026-05-01', geprueft: true,
  })
  const massnahmen = [m(1, 1, 991, null, 2, 2), m(2, 1, 992, null, 1, 1), m(3, 1, 992, 'ST', 3, 3), m(4, 2, 992, null, 2, 3)]
  const eintrag = (parteiId: number, land: string | null, art: 'massnahmen' | 'keine' = 'massnahmen'): AbdeckungEintrag => ({
    thema_id: 99, partei_id: parteiId, land, art, begruendung: art === 'keine' ? 'durchsucht' : null, stand: '2026-05-01',
  })
  const abdeckung = [eintrag(1, null), eintrag(1, 'ST'), eintrag(2, null)]
  const landesprogramme: Landesprogramm[] = [
    { partei_id: 1, land: 'ST', url: 'https://example.org/st.pdf', stand: '2026-04-01', kein_programm: null },
    { partei_id: 2, land: 'ST', url: null, stand: null, kein_programm: 'nicht angetreten' },
  ]
  const ursachen = [{ id: 991, ebene: 'bund' as const }, { id: 992, ebene: 'land' as const }]
  const ebenen = (land: string | null): Ebenen => ({ land, ursachen, landesprogramme })

  it('wertet ohne Bundesland nur Bundesprogramme', () => {
    const e = bewertePartei(alpha, 99, [991, 992], null, massnahmen, abdeckung, ebenen(null))
    expect(e.punkte).toBe(4 + 1)
    expect(e.programme.map((p) => p.land)).toEqual([null])
    expect(bewertePartei(alpha, 99, [991, 992], null, massnahmen, abdeckung).punkte).toBe(5)
  })

  it('nimmt mit Bundesland für Landesursachen nur das Landesprogramm', () => {
    const e = bewertePartei(alpha, 99, [991, 992], null, massnahmen, abdeckung, ebenen('ST'))
    // 991 aus dem Bundesprogramm (2×2), 992 nur aus dem Landesprogramm (3×3) – die Bundesmaßnahme zu 992 zählt nicht.
    expect(e.punkte).toBe(4 + 9)
    expect(e.treffer.map((t) => t.massnahme.id)).toEqual([1, 3])
    expect(e.programme.map((p) => [p.land, p.url])).toEqual([[null, alpha.programm_url], ['ST', 'https://example.org/st.pdf']])
  })

  it('wertet nicht ohne aktuelles Landesprogramm oder ohne Auswertung', () => {
    const b = bewertePartei(beta, 99, [992], null, massnahmen, abdeckung, ebenen('ST'))
    expect(b).toMatchObject({ abdeckung: null, punkte: 0, fehlt: { grund: 'kein_landesprogramm', land: 'ST', begruendung: 'nicht angetreten' } })
    const a = bewertePartei(alpha, 99, [992], null, massnahmen, abdeckung, ebenen('ST'))
    expect(werteRunde(a, b).status).toBe('unvollstaendig')
    // Programm vorhanden, aber zum Thema noch nicht ausgewertet.
    const ohneLandEintrag = abdeckung.filter((x) => x.land !== 'ST')
    expect(bewertePartei(alpha, 99, [992], null, massnahmen, ohneLandEintrag, ebenen('ST')).fehlt).toEqual({ grund: 'nicht_erfasst', land: 'ST' })
    // Land ohne erfasste Programme.
    expect(bewertePartei(alpha, 99, [992], null, massnahmen, abdeckung, ebenen('BE')).fehlt).toEqual({ grund: 'nicht_erfasst', land: 'BE' })
    // Bundesursache allein braucht kein Landesprogramm.
    expect(bewertePartei(beta, 99, [991], null, massnahmen, abdeckung, ebenen('ST')).abdeckung).not.toBeNull()
  })

  it('meldet „nichts zum Thema“ nur, wenn alle genutzten Programme nichts enthalten', () => {
    const keine = [eintrag(1, null, 'keine'), eintrag(1, 'ST')]
    const e = bewertePartei(alpha, 99, [991, 992], null, [], keine, ebenen('ST'))
    expect(e.abdeckung?.art).toBe('massnahmen')
    const beideKeine = [eintrag(1, null, 'keine'), eintrag(1, 'ST', 'keine')]
    const leer = bewertePartei(alpha, 99, [991, 992], null, [], beideKeine, ebenen('ST'))
    expect(leer.abdeckung?.art).toBe('keine')
    expect(ohneTreffer(leer, () => 'Sachsen-Anhalt')?.lang).toMatch(/Wahlprogramm .* und das Landeswahlprogramm Sachsen-Anhalt .* enthalten keine Maßnahme zu diesem Thema/)
    const kein = bewertePartei(beta, 99, [992], null, massnahmen, abdeckung, ebenen('ST'))
    expect(ohneTreffer(kein, () => 'Sachsen-Anhalt')?.lang).toMatch(/Für Sachsen-Anhalt gibt es kein Wahlprogramm der laufenden Wahlperiode \(nicht angetreten\)/)
  })

  it('kennzeichnet Wertungen aus KI-Entwürfen (Testphase)', () => {
    const mitKi = abdeckung.map((x) => (x.land === 'ST' ? { ...x, ki_entwurf: true } : x))
    expect(bewertePartei(alpha, 99, [991, 992], null, massnahmen, mitKi, ebenen('ST')).ki_entwurf).toBe(true)
    expect(bewertePartei(alpha, 99, [991, 992], null, massnahmen, mitKi, ebenen(null)).ki_entwurf).toBeUndefined()
  })

  it('kennzeichnet KI-Entwürfe, deren Werte nicht blind entstanden sind', () => {
    const ki = (herkunft: 'blind' | 'nicht_blind' | null) => massnahmen.map((m) => ({ ...m, ki_entwurf: true, entwurf_herkunft: herkunft }))
    const mitKi = abdeckung.map((x) => ({ ...x, ki_entwurf: true }))
    expect(bewertePartei(alpha, 99, [991, 992], null, ki('blind'), mitKi, ebenen(null)).nicht_blind).toBeUndefined()
    expect(bewertePartei(alpha, 99, [991, 992], null, ki('nicht_blind'), mitKi, ebenen(null)).nicht_blind).toBe(true)
    expect(bewertePartei(alpha, 99, [991, 992], null, ki(null), mitKi, ebenen(null)).nicht_blind).toBe(true)
    expect(bewertePartei(alpha, 99, [991, 992], null, massnahmen, abdeckung, ebenen(null)).nicht_blind).toBeUndefined()
  })

  it('vergleicht bei der besten Lösung nur Parteien mit Wertung', () => {
    expect(besteParteien([alpha, beta], 99, [992], null, massnahmen, abdeckung, ebenen('ST')).map((b) => b.partei.id)).toEqual([1])
    expect(besteParteien([alpha, beta], 99, [992], null, massnahmen, abdeckung, ebenen(null)).map((b) => b.partei.id)).toEqual([2])
  })
})

describe('waehlbareLaender', () => {
  it('bietet nur Länder an, für die Landeseinträge im Spiel sind', async () => {
    const { waehlbareLaender, MOCK_DATEN } = await import('../data/quelle')
    const laender = [{ id: 'ST', name: 'Sachsen-Anhalt', letzte_wahl: '2026-09-06' }, { id: 'BE', name: 'Berlin', letzte_wahl: '2026-09-20' }]
    expect(waehlbareLaender({ ...MOCK_DATEN, laender })).toEqual([])
    const abdeckung = [...MOCK_DATEN.abdeckung, { ...MOCK_DATEN.abdeckung[0], land: 'ST' }]
    expect(waehlbareLaender({ ...MOCK_DATEN, laender, abdeckung }).map((l) => l.id)).toEqual(['ST'])
  })
})

describe('sindBeispieldaten', () => {
  it('erkennt eingebaute und fiktive Supabase-Daten, nicht aber echte', async () => {
    const { sindBeispieldaten, MOCK_DATEN } = await import('../data/quelle')
    expect(sindBeispieldaten(MOCK_DATEN)).toBe(true)
    expect(sindBeispieldaten({ ...MOCK_DATEN, quelle: 'supabase' })).toBe(true)
    const echt = { ...MOCK_DATEN, quelle: 'supabase' as const, parteien: [{ ...MOCK_DATEN.parteien[0], programm_url: 'https://www.spd.de/programm.pdf' }] }
    expect(sindBeispieldaten(echt)).toBe(false)
  })
})
