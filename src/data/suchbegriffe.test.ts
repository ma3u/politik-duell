import { describe, expect, it } from 'vitest'
import { suchbegriffInParteinamen } from './katalog'

const parteien = [
  { name: 'Bündnis 90/Die Grünen', kurzname: 'Grüne' },
  { name: 'Bündnis Sahra Wagenknecht', kurzname: 'BSW' },
  { name: 'Sozialdemokratische Partei Deutschlands', kurzname: 'SPD' },
  { name: 'Christlich Demokratische Union / Christlich-Soziale Union', kurzname: 'Union' },
]

describe('suchbegriffInParteinamen', () => {
  it('findet Begriffe, die in einem Parteinamen stecken (8. 10. 2026: „bündnis“ traf zwei Programme auf fast jeder Seite)', () => {
    expect(suchbegriffInParteinamen('bündnis', parteien)).toBe('Bündnis 90/Die Grünen')
    expect(suchbegriffInParteinamen('sozial', parteien)).toBe('Sozialdemokratische Partei Deutschlands')
    expect(suchbegriffInParteinamen('Union', parteien)).not.toBeNull()
  })
  it('lässt genauere Begriffe durch', () => {
    for (const b of ['verteidigungsbündnis', 'bündnisfall', 'währungsunion', 'nato', 'sozialleistung', 'ja']) expect(suchbegriffInParteinamen(b, parteien), b).toBeNull()
  })
})
