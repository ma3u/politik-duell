// Bereitet die Erfassung vor: schreibt je Programm die Textdatei (texte/<Name>.txt) und einen Auftrag
// (auftraege/<Name>.md) mit Ziel, zulässigen Ursachen, Leitfaden, Bündeln, Trefferzahlen und
// Fundstellen. Der Erfassungs-Agent bekommt danach nur noch den Pfad seines Auftrags.
// Programme: alle Bundesprogramme und – hat das Thema Landesursachen – alle aktuellen
// Landesprogramme; Programme mit schon vorhandenem Abdeckungseintrag werden ausgelassen.
// Aufruf: npm run entwurf:auftrag -- <erfassung.json> [--bund | --land XX …] [--partei SPD …] [--max-seiten 80] [--lokal <ordner>]
// (Unter PowerShell 7 „--“ in Anführungszeichen: npm run entwurf:auftrag '--' <erfassung.json> '--land' BE)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PROTOKOLL, programmName, pruefeLeitfaden, pruefeSuchbegriffe } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { erfassungsSeiten, lokalePdfs, textdatei } from '../programme.ts'
import { auftragText, auswahlProgramme, zulaessigeUrsachen } from './auftrag-text.ts'
import { leseErfassung, leitfadenPfad } from './erfassung-datei.ts'

const args = process.argv.slice(2)
const liste = (name: string) => {
  const werte: string[] = []
  for (let i = args.indexOf(name); i >= 0; i = args.indexOf(name)) werte.push(...args.splice(i, 2).slice(1))
  return werte
}
const bundPos = args.indexOf('--bund')
const nurBund = bundPos >= 0
if (nurBund) args.splice(bundPos, 1)
const laender = liste('--land').map((l) => l.toUpperCase())
const parteien = liste('--partei').map((p) => p.toLowerCase())
const maxSeiten = Number(liste('--max-seiten')[0] ?? 80)
const lokalOrdner = liste('--lokal')[0]
const [pfad, ...rest] = args
if (!pfad || rest.length || !Number.isInteger(maxSeiten) || maxSeiten < 1) {
  console.error('Aufruf: npm run entwurf:auftrag -- <erfassung.json> [--bund | --land XX …] [--partei SPD …] [--max-seiten 80] [--lokal <ordner>]')
  process.exit(1)
}
if (!/(^|[\\/])\.cache([\\/]|$)/.test(pfad)) {
  console.error('Die Erfassung muss unter .cache/ liegen (Programmtexte nie ins Repository).')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = leseErfassung(pfad)
const themaId = erfassung.thema_id
if (!erfassung.leitfaden) console.error(`Hinweis: Kein Leitfaden (${relative(process.cwd(), fileURLToPath(leitfadenPfad(themaId)))}) – Abgrenzungsfragen landen dann in Rückfragen. Erst den Leitfaden anlegen?`)
const leitfadenFehler = erfassung.leitfaden ? pruefeLeitfaden(katalog, erfassung.leitfaden) : []
for (const f of leitfadenFehler) console.error(`Fehler:  ${f}`)
if (leitfadenFehler.length) process.exit(1)

const auswahl = auswahlProgramme(katalog, themaId, { nurBund, laender, parteien })
// Suchbegriffe müssen für jede Ursache stehen, die eines der Programme betrifft (die Treffer zählt erst entwurf:treffer).
const stub = { ...erfassung, treffer: undefined, programme: auswahl.map((p) => ({ partei_id: 0, land: p.land, massnahmen: [] })) }
const begriffFehler = pruefeSuchbegriffe(katalog, stub).filter((f) => !f.startsWith('treffer'))
for (const f of begriffFehler) console.error(`Fehler:  ${f}`)
if (begriffFehler.length) process.exit(1)

const ordner = join(pfad, '..')
const lokal = lokalOrdner ? lokalePdfs(lokalOrdner) : undefined
mkdirSync(join(ordner, 'texte'), { recursive: true })
mkdirSync(join(ordner, 'auftraege'), { recursive: true })
mkdirSync(join(ordner, 'protokoll'), { recursive: true })
let nichtGeladen = 0
const fertig: string[] = []
for (const p of auswahl) {
  const partei = katalog.parteien.find((x) => x.kurzname === p.partei)!
  if (katalog.abdeckung.some((a) => a.thema_id === themaId && a.partei_id === partei.id && (a.land ?? null) === p.land && a.aktuell)) {
    console.log(`übersprungen: ${p.name} – hat schon einen Eintrag (von Hand ergänzen)`)
    continue
  }
  const name = programmName(p.partei, p.land)
  let seiten: string[]
  try {
    ;({ seiten } = await erfassungsSeiten(p.url, p.sha256, lokal))
  } catch (e) {
    nichtGeladen++
    console.error(`NICHT GELADEN: ${p.name}: ${e instanceof Error ? e.message : e} – bleibt „noch nicht erfasst“`)
    continue
  }
  const textPfad = join(ordner, 'texte', `${name}.txt`)
  writeFileSync(textPfad, textdatei(seiten), 'utf8')
  const lp = p.land ? katalog.landesprogramme.find((l) => l.partei_id === partei.id && l.land === p.land && l.aktuell) : undefined
  const auftragPfad = join(ordner, 'auftraege', `${name}.md`)
  const text = auftragText(
    katalog,
    erfassung,
    { partei_id: partei.id, kurzname: partei.kurzname, land: p.land, url: p.url, stand: lp ? lp.stand : partei.programm_stand },
    seiten,
    { textPfad: textPfad.replace(/\\/g, '/'), ergebnisPfad: join(ordner, 'protokoll', PROTOKOLL.erfassung(partei.kurzname, p.land)).replace(/\\/g, '/'), maxSeiten },
  )
  writeFileSync(auftragPfad, text, 'utf8')
  const ursachen = zulaessigeUrsachen(katalog, themaId, p.land).map((u) => u.id)
  console.log(`${auftragPfad}  (${seiten.length} Seiten, Ursachen ${ursachen.join(', ')}, ${Math.round(text.length / 1000)} Tsd. Zeichen)`)
  fertig.push(auftragPfad.replace(/\\/g, '/'))
}
console.log(`\n${fertig.length} Aufträge. Je Agent genügt: „Erledige den Erfassungsauftrag <Pfad> nach .claude/agents/programm-erfassung.md.“`)
if (nichtGeladen) console.error(`${nichtGeladen} Programme nicht geladen – im Pull Request nennen (bleiben „noch nicht erfasst“) oder mit --lokal laden.`)
