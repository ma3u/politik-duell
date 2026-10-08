// Fasst die Erfassungsaufträge mehrerer Themen je Programm zu Sammelaufträgen zusammen (siehe
// sammelauftrag-text.ts), etwa für mehrere Nachträge aus /forderung-erfassen. Vorher je Thema
// `entwurf:auftrag` ausführen. Prüft, dass die Textdateien eines Programms gleich sind.
// Schreibt .cache/entwurf/sammel/auftraege/<Name>.md (bei mehr als --max-zeichen: <Name>-2.md …).
// Aufruf: npm run entwurf:sammelauftrag -- <erfassung.json> <erfassung.json> … [--max-zeichen 150000]
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gruppiere, sammelAuftragText, textdateiPfad, type Teilauftrag } from './sammelauftrag-text.ts'

const args = process.argv.slice(2)
const m = args.indexOf('--max-zeichen')
const maxZeichen = m >= 0 ? Number(args.splice(m, 2)[1]) : 150_000
const pfade = args
if (pfade.length < 2 || !Number.isInteger(maxZeichen) || maxZeichen < 1 || pfade.some((p) => !/(^|[\\/])\.cache[\\/]/.test(p))) {
  console.error('Aufruf: npm run entwurf:sammelauftrag -- <erfassung.json> <erfassung.json> … [--max-zeichen 150000] (Erfassungen unter .cache/)')
  process.exit(1)
}

const posix = (p: string) => p.replace(/\\/g, '/')
const jeProgramm = new Map<string, Teilauftrag[]>()
const fehler: string[] = []
for (const pfad of pfade) {
  const ordner = join(pfad, '..', 'auftraege')
  if (!existsSync(ordner)) {
    fehler.push(`${posix(ordner)} fehlt – erst npm run entwurf:auftrag -- ${posix(pfad)}`)
    continue
  }
  for (const datei of readdirSync(ordner).filter((d) => d.endsWith('.md')).sort()) {
    const p = posix(join(ordner, datei))
    const name = datei.replace(/\.md$/, '')
    jeProgramm.set(name, [...(jeProgramm.get(name) ?? []), { pfad: p, text: readFileSync(p, 'utf8') }])
  }
}

const ziel = join('.cache', 'entwurf', 'sammel', 'auftraege')
rmSync(ziel, { recursive: true, force: true })
mkdirSync(ziel, { recursive: true })
const geschrieben: string[] = []
for (const [name, teile] of [...jeProgramm].sort(([a], [b]) => a.localeCompare(b))) {
  const texte = teile.map((t) => textdateiPfad(t.text))
  if (texte.some((t) => !t || !existsSync(t))) {
    fehler.push(`${name}: Textdatei fehlt in einem Auftrag – entwurf:auftrag erneut ausführen`)
    continue
  }
  const inhalt = readFileSync(texte[0]!, 'utf8')
  if (texte.some((t) => readFileSync(t!, 'utf8') !== inhalt)) {
    fehler.push(`${name}: Textdateien der Themen unterscheiden sich (andere Programmfassung?) – Aufträge einzeln vergeben`)
    continue
  }
  for (const [i, gruppe] of gruppiere(teile, maxZeichen).entries()) {
    const datei = posix(join(ziel, `${name}${i ? `-${i + 1}` : ''}.md`))
    writeFileSync(datei, sammelAuftragText(name, gruppe, texte[0]!), 'utf8')
    geschrieben.push(`${datei}  (${gruppe.length} Teilaufträge)`)
  }
}
for (const f of fehler) console.error(`Fehler:  ${f}`)
for (const g of geschrieben) console.log(g)
console.log(`\n${geschrieben.length} Sammelaufträge. Je Agent genügt: „Erledige den Sammelauftrag <Pfad> nach .claude/agents/programm-erfassung.md.“`)
if (fehler.length) process.exit(1)
