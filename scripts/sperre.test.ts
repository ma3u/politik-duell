import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
// @ts-expect-error – Hook in reinem JavaScript (schneller Start), ohne Typdeklaration
import { pruefe } from '../.claude/hooks/sperre.mjs'

const liste = JSON.parse(readFileSync(new URL('../daten/gesperrte-adressen.json', import.meta.url), 'utf8'))
const kontext = (phaseA = false) => ({ liste, programmHosts: ['cms.gruene.de', 'berlin-wird.de'], phaseA, wurzel: '/repo' })
const web = (url: string) => pruefe({ tool_name: 'WebFetch', tool_input: { url } }, kontext())

describe('Programmsperre (PreToolUse-Hook)', () => {
  it('sperrt Partei-, Fraktions-, Stiftungs- und Programmserver und das Repository', () => {
    expect(web('https://www.spd.de/x')).toMatch(/spd\.de ist gesperrt/)
    expect(web('https://spd-mv.de/uploads/a.pdf')).toMatch(/gesperrt/)
    expect(web('https://lichtenberg.afd.berlin/x.pdf')).toMatch(/gesperrt/)
    for (const host of ['cdulsa.de', 'spdsachsenanhalt.de', 'gruene-lsa.de', 'dielinke.berlin', 'die-linke-mv.de', 'st.bsw-vg.de']) expect(web(`https://${host}/p.pdf`)).toMatch(/gesperrt/)
    expect(web('https://berlin-wird.de/image/x.pdf')).toMatch(/berlin-wird\.de ist gesperrt/)
    expect(web('https://web.archive.org/web/2025id_/https%3A%2F%2Fwww.fdp.de%2Fx.pdf')).toMatch(/fdp\.de/)
    expect(web('https://library.fes.de/pdf-files/x.pdf')).toMatch(/fes\.de/)
    expect(web('https://raw.githubusercontent.com/politik-duell/politik-duell/main/daten/themen/02-miete.json')).toMatch(/Repository/)
    expect(web('https://politik-duell.de/#/stand')).toMatch(/gesperrt/)
  })

  it('lässt unabhängige Quellen durch', () => {
    for (const url of ['https://www.destatis.de/a', 'https://www.dji.de/b.pdf', 'https://www.iab.de/c', 'https://github.com/andere/repo', 'https://www.bundestag.de/d', 'https://www.linkedin.com/x', 'https://spdx.org/y', 'https://www.afdb.org/z'])
      expect(web(url)).toBeNull()
  })

  it('sperrt in Phase A Lesezugriffe auf .cache/ und Programm-Werkzeuge', () => {
    const p = (tool_name: string, tool_input: Record<string, string>, phaseA = true) => pruefe({ tool_name, tool_input }, kontext(phaseA))
    expect(p('Read', { file_path: '/repo/.cache/entwurf/17/texte/SPD-Bund.txt' })).toMatch(/Phase A/)
    expect(p('Grep', { pattern: 'Kita', path: '.cache/texte' })).toMatch(/Phase A/)
    expect(p('Bash', { command: 'cat .cache/entwurf/17/erfassung.json' })).toMatch(/Phase A/)
    expect(p('Bash', { command: "npm run -s programme:suche '--' kita" })).toMatch(/Programme lesen|Wahlprogramme/)
    expect(p('Bash', { command: 'node --experimental-strip-types scripts/entwurf/programm-text.ts x' })).toMatch(/Phase A/)
    expect(p('Bash', { command: 'npm run phase-a -- ende' })).toBeNull()
    expect(p('Bash', { command: 'npm run -s quelle:text -- https://www.dji.de/x.pdf --suche Kita' })).toBeNull()
    expect(p('Read', { file_path: '/repo/daten/README.md' })).toBeNull()
    expect(p('Read', { file_path: '/repo/.cache/entwurf/17/texte/SPD-Bund.txt' }, false)).toBeNull()
  })

  describe('Agent blind-bewertung', () => {
    const blind = (tool_name: string, tool_input: Record<string, string>, extra: Record<string, unknown> = {}) =>
      pruefe({ tool_name, tool_input, agent_type: 'blind-bewertung', agent_id: 'a1', cwd: '/repo', ...extra }, kontext())

    it('erlaubt genau die Blindliste zum Lesen und die Antwortdatei zum Schreiben', () => {
      expect(blind('Read', { file_path: '/repo/.cache/entwurf/9/blind.json' })).toBeNull()
      expect(blind('Read', { file_path: '.cache/entwurf/17/blind.json' })).toBeNull()
      expect(blind('Write', { file_path: '/repo/.cache/entwurf/9/protokoll/bewertung-antwort.txt', content: '{}' })).toBeNull()
      expect(blind('WebSearch', { query: 'Wirkung Videoüberwachung Studie' })).toBeNull()
      expect(blind('WebFetch', { url: 'https://www.kfn.de/studie.pdf' })).toBeNull()
    })

    it('sperrt alles andere – auch Umwege über „..“, andere Arbeitsdateien und Werkzeuge', () => {
      for (const datei of [
        '/repo/.cache/entwurf/9/erfassung.json',
        '/repo/.cache/entwurf/9/kennungen.json',
        '/repo/.cache/entwurf/9/programme/SPD-Bund.json',
        '/repo/.cache/entwurf/9/texte/SPD-Bund.txt',
        '/repo/.cache/entwurf/9/protokoll/bewertung-antwort.txt',
        '/repo/.cache/entwurf/9/protokoll/blind-0123456789abcdef.json',
        '/repo/.cache/entwurf/9/x/../erfassung.json',
        '/repo/.cache/entwurf/9/x/../../9/blind.json/../kennungen.json',
        '/repo/daten/themen/09-sicherheit.json',
        '/repo/.cache/entwurf/9/blind.json.bak',
        '/anderes/.cache/entwurf/9/blind.json',
        '/etc/passwd',
      ])
        expect(blind('Read', { file_path: datei })).toMatch(/Bewertung ohne Parteinamen/)
      expect(blind('Read', { file_path: '/repo/.cache/entwurf/9/x/../blind.json' })).toBeNull()
      expect(blind('Write', { file_path: '/repo/.cache/entwurf/9/blind.json', content: '' })).toMatch(/gesperrt/)
      expect(blind('Write', { file_path: '/repo/.cache/entwurf/9/bewertung.json', content: '' })).toMatch(/gesperrt/)
      expect(blind('Edit', { file_path: '/repo/.cache/entwurf/9/protokoll/bewertung-antwort.txt' })).toMatch(/gesperrt/)
      expect(blind('Bash', { command: 'cat .cache/entwurf/9/erfassung.json' })).toMatch(/gesperrt/)
      expect(blind('Grep', { pattern: 'SPD', path: '.cache' })).toMatch(/gesperrt/)
      expect(blind('Glob', { pattern: '**/*.json' })).toMatch(/gesperrt/)
      expect(blind('Read', {})).toMatch(/gesperrt/)
      // Parteiserver bleiben auch für diesen Agenten gesperrt.
      expect(blind('WebFetch', { url: 'https://www.spd.de/programm.pdf' })).toMatch(/spd\.de ist gesperrt/)
    })

    it('gilt nur für diesen Agenten; die Koordination und andere Agenten sind nicht betroffen', () => {
      expect(pruefe({ tool_name: 'Read', tool_input: { file_path: '/repo/.cache/entwurf/9/erfassung.json' } }, kontext())).toBeNull()
      expect(pruefe({ tool_name: 'Read', tool_input: { file_path: '/repo/.cache/entwurf/9/erfassung.json' }, agent_type: 'programm-erfassung' }, kontext())).toBeNull()
      expect(blind('Read', { file_path: '/repo/.cache/entwurf/9/erfassung.json' }, { agent_type: 'projekt:blind-bewertung' })).toMatch(/gesperrt/)
    })
  })
})
