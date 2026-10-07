import { describe, expect, it } from 'vitest'
import { codeAusName, istRaumcode, neuerRaumname, normalisiereRaumname, raumAusEingabe, raumnameAnzeige, raumPfad } from './raumname'

describe('Raumnamen', () => {
  it('erzeugt merkbare Namen: Adjektiv, Tier, Zahl – ohne Umlaute, mit passender Endung', () => {
    for (let i = 0; i < 200; i++) {
      const n = neuerRaumname()
      expect(n).toMatch(/^[A-Z][a-z]+(er|e|es) [A-Z][a-z]+ \d{1,2}$/)
      expect(n).not.toMatch(/[äöüß]/i)
    }
    expect(neuerRaumname(() => 0)).toBe('Eifrige Eule 2')
  })

  it('derselbe Name ergibt auf jedem Gerät denselben gültigen Code – egal wie geschrieben', () => {
    const c = codeAusName('Kluge Eule 27')
    expect(istRaumcode(c)).toBe(true)
    for (const v of ['kluge eule 27', 'KLUGE-EULE-27', '  Kluge   Eule  27 ', 'kluge_eule_27']) expect(codeAusName(v)).toBe(c)
    expect(codeAusName('Kluge Eule 28')).not.toBe(c)
  })

  it('verschiedene Namen geben (praktisch) verschiedene Codes', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 2000; i++) codes.add(codeAusName(`Raum ${i}`))
    expect(codes.size).toBe(2000)
  })

  it('liest Eingaben und Links: Name oder alter Code', () => {
    expect(raumAusEingabe('kluge eule 27')).toEqual({ code: codeAusName('kluge-eule-27'), name: 'Kluge Eule 27' })
    expect(raumAusEingabe('kluge-eule-27')?.name).toBe('Kluge Eule 27')
    expect(raumAusEingabe('ABC234')).toEqual({ code: 'ABC234', name: null })
    expect(raumAusEingabe('abc234')).toEqual({ code: 'ABC234', name: null })
    expect(raumAusEingabe('x')).toBeNull()
    expect(raumAusEingabe('Hallo')).toBeNull()
    expect(raumAusEingabe('a'.repeat(50) + ' b')).toBeNull()
  })

  it('Pfad und Anzeige', () => {
    expect(normalisiereRaumname('Schöne Möwe 3')).toBe('schoene-moewe-3')
    expect(raumnameAnzeige('flinker-fuchs-8')).toBe('Flinker Fuchs 8')
    expect(raumPfad({ code: 'ABC234', name: 'Flinker Fuchs 8' })).toBe('flinker-fuchs-8')
    expect(raumPfad({ code: 'ABC234', name: null })).toBe('ABC234')
  })
})
