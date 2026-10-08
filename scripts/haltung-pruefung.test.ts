import { describe, expect, it } from 'vitest'
import { pruefeDatenordner } from './katalog-laden'
import { ANTWORTEN, auswerten, blindeZitate, standVon, type Abgabe } from './haltung-pruefung'
import { belegeBlatt, blindesBlatt, formulierungsBlatt } from './haltung-pruefliste-html'
import { enthaeltParteinamen } from './entwurf'

// Prüfung der Haltungen: Blindliste, Stand-Prüfsumme, Auswertung und die drei Seiten (docs/haltungen.md).
const { katalog } = pruefeDatenordner()
const zitate = blindeZitate(katalog)
const mitZitat = katalog.haltungen.flatMap((h) => h.positionen).filter((p) => p.position !== 'keine_aussage' && p.zitat)

const abgabe = (aender: Record<string, string> = {}, stand = standVon(katalog)): Abgabe => ({
  stand,
  antworten: { ...Object.fromEntries(zitate.map((z) => [z.kennung, z.entwurf])), ...aender },
})

describe('Blindliste der Zitate', () => {
  it('enthält jedes Zitat einer Position (nicht „Keine Aussage“) genau einmal, ohne Parteinamen', () => {
    expect(zitate).toHaveLength(mitZitat.length)
    expect(mitZitat.length).toBeGreaterThan(0)
    expect(new Set(zitate.map((z) => z.kennung)).size).toBe(zitate.length)
    for (const z of zitate) {
      expect(z.kennung).toMatch(/^H\d+-\d+$/)
      expect(enthaeltParteinamen(z.zitat, katalog.parteien.flatMap((p) => [p.name, p.kurzname])), z.kennung).toBe(false)
      expect(['ja', 'nein', 'teils']).toContain(z.entwurf)
    }
    // „Keine Aussage“ hat nichts einzuordnen.
    const keine = katalog.haltungen.flatMap((h) => h.positionen.filter((p) => p.position === 'keine_aussage').map((p) => [h.id, p.partei_id]))
    for (const [h, p] of keine) expect(zitate.some((z) => z.haltung_id === h && z.partei_id === p)).toBe(false)
  })

  it('ersetzt Parteinamen im Zitat und ist stabil', () => {
    expect(zitate).toEqual(blindeZitate(katalog))
    const alt = katalog.haltungen.flatMap((h) => h.positionen).find((p) => /Freie Demokraten|AfD/.test(p.zitat ?? ''))
    if (alt) {
      const z = zitate.find((x) => x.partei_id === alt.partei_id && x.haltung_id === alt.haltung_id)!
      expect(z.zitat).not.toMatch(/Freie Demokraten|AfD/)
    }
  })

  it('mischt je Haltung: Die Reihenfolge verrät nicht die Parteireihenfolge', () => {
    for (const h of katalog.haltungen) {
      const ids = zitate.filter((z) => z.haltung_id === h.id).map((z) => z.partei_id)
      if (ids.length > 3) expect(ids).not.toEqual([...ids].sort((a, b) => a - b))
    }
  })

  it('ändert den Stand, sobald sich Frage oder Zitat ändern', () => {
    const stand = standVon(katalog)
    expect(stand).toMatch(/^[0-9a-f]{10}$/)
    const anders = structuredClone(katalog)
    const p = anders.haltungen.flatMap((h) => h.positionen).find((x) => x.zitat)!
    p.zitat += ' Zusatz.'
    expect(standVon(anders)).not.toBe(stand)
    const andereFrage = structuredClone(katalog)
    andereFrage.haltungen[0].frage = 'Soll es etwas ganz anderes geben?'
    expect(standVon(andereFrage)).not.toBe(stand)
    // Die Einordnung des Entwurfs gehört nicht dazu: Prüfende sehen sie nie.
    const andereEinordnung = structuredClone(katalog)
    andereEinordnung.haltungen[0].positionen.find((x) => x.zitat)!.position = 'teils'
    expect(standVon(andereEinordnung)).toBe(stand)
  })
})

describe('Auswertung der Antworten', () => {
  it('bestätigt, wenn mindestens zwei Prüfende wie der Entwurf einordnen', () => {
    const r = auswerten(katalog, [abgabe(), abgabe()])
    expect(r.fehler).toEqual([])
    expect(r.zeilen.every((z) => z.bestaetigt === 2)).toBe(true)
  })

  it('zeigt Abweichungen, statt zu mitteln', () => {
    const k = zitate[0].kennung
    const r = auswerten(katalog, [abgabe(), abgabe({ [k]: 'unklar' }), abgabe({ [k]: zitate[0].entwurf })])
    const z = r.zeilen.find((x) => x.kennung === k)!
    expect(z.antworten).toEqual([zitate[0].entwurf, 'unklar', zitate[0].entwurf])
    expect(z.bestaetigt).toBe(2)
    expect(r.zeilen.filter((x) => x.kennung !== k).every((x) => x.bestaetigt === 3)).toBe(true)
    // Nur zwei Abgaben, eine weicht ab: keine Bestätigung.
    expect(auswerten(katalog, [abgabe(), abgabe({ [k]: 'unklar' })]).zeilen.find((x) => x.kennung === k)!.bestaetigt).toBe(1)
  })

  it('verlangt mindestens zwei Abgaben und lehnt einen geänderten Stand ab', () => {
    expect(auswerten(katalog, [abgabe()]).fehler.join()).toMatch(/Mindestens zwei Abgaben/)
    expect(auswerten(katalog, [abgabe(), abgabe({}, 'abcdef0123')]).fehler.join()).toMatch(/Stand abcdef0123 passt nicht zum Katalog/)
  })

  it('meldet unbekannte Kennungen, ungültige Antworten und fehlende Antworten', () => {
    const fehlt = abgabe()
    delete fehlt.antworten[zitate[1].kennung]
    const f = auswerten(katalog, [abgabe({ 'H9-9': 'ja', [zitate[0].kennung]: 'vielleicht' }), fehlt]).fehler.join('\n')
    expect(f).toMatch(/unbekannte Kennung „H9-9“/)
    expect(f).toMatch(/Antwort „vielleicht“ gibt es nicht/)
    expect(f).toMatch(new RegExp(`${zitate[1].kennung}: nicht von allen beantwortet`))
    expect(auswerten(katalog, [{} as Abgabe, abgabe()]).fehler.join()).toMatch(/erwartet \{ "stand", "antworten" \}/)
    expect(ANTWORTEN).toEqual(['ja', 'nein', 'teils', 'unklar'])
  })
})

describe('Prüfseiten', () => {
  const namen = katalog.parteien.flatMap((p) => [p.name, p.kurzname]).filter((n) => n.length > 2)

  it('das Blindblatt verrät weder Partei noch Einordnung des Entwurfs noch Kurzfassung', () => {
    const html = blindesBlatt(katalog)
    // Wie bei den Zitaten: „Europäische Union“ ist kein Parteiname (ersetzeNamen in entwurf.ts).
    for (const n of namen) expect(enthaeltParteinamen(html.replace(/<[^>]*>/g, ' '), [n]), n).toBe(false)
    for (const p of mitZitat) expect(html).not.toContain(p.kurzfassung!)
    for (const z of zitate) expect(html).toContain(`"r-${z.kennung}"`)
    expect(html).not.toMatch(/partei_id|ki_entwurf|beleg_programm_url|#page=/)
    expect(html).toContain(`var STAND = "${standVon(katalog)}"`)
  })

  it('das Formulierungsblatt zeigt Fragen, Ziele und Quellen, aber keine Positionen', () => {
    const html = formulierungsBlatt(katalog)
    for (const h of katalog.haltungen) {
      expect(html).toContain(h.frage)
      for (const z of h.zielkonflikte) expect(html).toContain(z.quelle_url.replace(/&/g, '&amp;'))
    }
    for (const p of mitZitat) expect(html).not.toContain(p.zitat!)
    expect(html).not.toMatch(/#page=/)
  })

  it('das Belegblatt enthält je Position den Link auf die Seite, das Zitat und die Kurzfassung', () => {
    const html = belegeBlatt(katalog, () => '')
    for (const p of mitZitat) {
      expect(html).toContain(p.beleg_programm_url!)
      expect(html).toContain(p.kurzfassung!)
    }
    for (const p of katalog.haltungen.flatMap((h) => h.positionen).filter((x) => x.position === 'keine_aussage')) expect(html).toContain(p.begruendung!)
    expect(html).toContain('zweite_suche')
  })
})
