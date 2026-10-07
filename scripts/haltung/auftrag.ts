// Schreibt je Bundesprogramm die Textdatei und **einen** Auftrag für alle Haltungen des Laufs (Agent
// haltung-erfassung): je Haltung Frage, Beschreibung, Maßstab der Einordnung, Treffer und Fundstellen.
// So liest jeder Agent sein Programm einmal, gleich wie viele Haltungen es sind.
// Aufruf: npm run haltung:auftrag -- <Haltungs-ID> [<Haltungs-ID> …] [--lokal <ordner>] [--nachtrag <Partei-ID>]
// Mit --nachtrag nur der Auftrag für dieses eine Programm (neu aufgenommene Partei).
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { programmName } from '../entwurf.ts'
import { erfassungsSeiten, lokalePdfs, textdatei } from '../programme.ts'
import { fundstellen } from '../entwurf/auftrag-text.ts'
import { abbruch, ids, katalogUndHaltungen, laufOrdner, nachtrag, oderAbbruch, ordnerAnlegen } from './gemeinsam.ts'

const args = process.argv.slice(2)
const l = args.indexOf('--lokal')
const lokal = l >= 0 ? lokalePdfs(args.splice(l, 2)[1]) : undefined
const nur = oderAbbruch(() => nachtrag(args))
const { katalog, haltungen } = oderAbbruch(() => katalogUndHaltungen(ids(args)))
for (const { haltung: h } of haltungen) {
  if (!h.freigabe) abbruch(`Haltung ${h.id} hat keine „freigabe“ – erst /haltung-anlegen`)
  if (!h.suchbegriffe?.length) abbruch(`Haltung ${h.id} hat keine „suchbegriffe“ – in der Haltungsdatei ergänzen (für alle Programme gleich)`)
}
// Neuer Lauf: alte Aufträge und Antworten weg, damit kein Agent einen veralteten Auftrag liest.
const lauf = laufOrdner()
rmSync(lauf, { recursive: true, force: true })
ordnerAnlegen(join(lauf, 'texte'), join(lauf, 'auftraege'), join(lauf, 'protokoll'))
writeFileSync(join(lauf, 'lauf.json'), JSON.stringify({ haltungen: haltungen.map((x) => x.haltung.id), datum: new Date().toISOString().slice(0, 10) }) + '\n')
const jeHaltung = haltungen.length > 3 ? 20 : 60
let fehlt = 0
for (const p of katalog.parteien.filter((x) => nur === null || x.id === nur)) {
  const name = programmName(p.kurzname, null)
  let seiten: string[]
  try {
    ;({ seiten } = await erfassungsSeiten(p.programm_url, p.programm_sha256, lokal))
  } catch (e) {
    fehlt++
    console.error(`NICHT GELADEN: ${p.kurzname}: ${e instanceof Error ? e.message : e} – mit --lokal laden, sonst bleiben die Haltungen unvollständig`)
    continue
  }
  const textPfad = join(lauf, 'texte', `${name}.txt`)
  writeFileSync(textPfad, textdatei(seiten), 'utf8')
  const ergebnis = join(lauf, 'protokoll', `fund-${name}.json`)
  const z = [
    `# Haltungen ${haltungen.map((x) => x.haltung.id).join(', ')}: ${p.kurzname} (Bund)`,
    '',
    'Vorgehen und Regeln: `.claude/agents/haltung-erfassung.md`. Lies sonst nur die Textdatei.',
    '',
    '| | |',
    '| --- | --- |',
    `| partei_id | ${p.id} |`,
    `| Textdatei | \`${textPfad}\` (${seiten.length} PDF-Seiten) |`,
    `| Ergebnis | \`${ergebnis}\` – eine JSON-Liste mit genau einem Eintrag je Haltung |`,
    `| Selbstprüfung | \`npm run -s haltung:programm-pruefen '--' ${ergebnis}\` |`,
    '',
  ]
  const treffer: string[] = []
  for (const { haltung: h } of haltungen) {
    const f = fundstellen(seiten, { '0': { Frage: h.suchbegriffe! } }, [0])
    treffer.push(`${h.id}: ${f.seiten.length}`)
    z.push(
      `## Haltung ${h.id}: ${h.frage}`,
      '',
      h.beschreibung,
      '',
      ...(h.einordnung ? [`- Ja: ${h.einordnung.ja}`, `- Teils: ${h.einordnung.teils}`, `- Nein: ${h.einordnung.nein}`, ''] : []),
      `Treffer: ${Object.entries(f.zahlen[0]?.Frage ?? {}).map(([b, n]) => `${b} ${n}`).join(', ')}`,
      '',
      ...f.seiten.slice(0, jeHaltung).map((s) => `- S. ${s.n}: ${s.auszug}`),
      ...(f.seiten.length > jeHaltung ? ['', `Weitere Seiten mit Treffern: ${f.seiten.slice(jeHaltung).map((s) => s.n).join(', ')}`] : []),
      '',
    )
  }
  const auftrag = join(lauf, 'auftraege', `${name}.md`)
  writeFileSync(auftrag, z.join('\n'), 'utf8')
  console.log(`${auftrag}  (Seiten mit Treffern je Haltung: ${treffer.join(', ')})`)
}
console.log('\nJe Agent haltung-erfassung genügt: „Erledige den Auftrag <Pfad> nach .claude/agents/haltung-erfassung.md.“')
if (fehlt) process.exitCode = 1
