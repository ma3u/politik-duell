// Schreibt je Bundesprogramm die Textdatei und einen Auftrag für den Agenten haltung-erfassung:
// Frage, Beschreibung, Maßstab der Einordnung, Treffer und Fundstellen der Suchbegriffe der Haltung.
// Aufruf: npm run haltung:auftrag -- <Haltungs-ID> [--lokal <ordner>]
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { programmName } from '../entwurf.ts'
import { erfassungsSeiten, lokalePdfs, textdatei } from '../programme.ts'
import { fundstellen } from '../entwurf/auftrag-text.ts'
import { abbruch, fundeOrdner, katalogUndHaltung, ordnerAnlegen } from './gemeinsam.ts'

const args = process.argv.slice(2)
const l = args.indexOf('--lokal')
const lokal = l >= 0 ? lokalePdfs(args.splice(l, 2)[1]) : undefined
let ctx
try {
  ctx = katalogUndHaltung(args[0])
} catch (e) {
  abbruch(e)
}
const { katalog, haltung, arbeit } = ctx
if (!haltung.freigabe) abbruch(`Haltung ${haltung.id} hat keine „freigabe“ – erst /haltung-anlegen`)
if (!haltung.suchbegriffe?.length) abbruch(`Haltung ${haltung.id} hat keine „suchbegriffe“ – in der Haltungsdatei ergänzen (für alle Programme gleich)`)
ordnerAnlegen(join(arbeit, 'texte'), join(arbeit, 'auftraege'), fundeOrdner(arbeit), join(arbeit, 'protokoll'))
let fehlt = 0
for (const p of katalog.parteien) {
  const name = programmName(p.kurzname, null)
  let seiten: string[]
  try {
    ;({ seiten } = await erfassungsSeiten(p.programm_url, p.programm_sha256, lokal))
  } catch (e) {
    fehlt++
    console.error(`NICHT GELADEN: ${p.kurzname}: ${e instanceof Error ? e.message : e} – mit --lokal laden, sonst bleibt die Haltung unvollständig`)
    continue
  }
  const textPfad = join(arbeit, 'texte', `${name}.txt`)
  writeFileSync(textPfad, textdatei(seiten), 'utf8')
  const f = fundstellen(seiten, { '0': { Frage: haltung.suchbegriffe } }, [0])
  const ergebnis = join(arbeit, 'protokoll', `fund-${name}.json`)
  const z = [
    `# Haltung ${haltung.id}: ${p.kurzname} (Bund)`,
    '',
    'Vorgehen und Regeln: `.claude/agents/haltung-erfassung.md`. Lies keine anderen Dateien in diesem Ordner.',
    '',
    '| | |',
    '| --- | --- |',
    `| haltung_id | ${haltung.id} |`,
    `| partei_id | ${p.id} |`,
    `| Textdatei | \`${textPfad}\` (${seiten.length} PDF-Seiten) |`,
    `| Ergebnis | \`${ergebnis}\` |`,
    `| Selbstprüfung | \`npm run -s haltung:programm-pruefen '--' ${ergebnis}\` |`,
    '',
    '## Frage',
    '',
    `**${haltung.frage}**`,
    '',
    haltung.beschreibung,
    '',
    ...(haltung.einordnung
      ? ['## Worauf es ankommt', '', `- Ja: ${haltung.einordnung.ja}`, `- Teils: ${haltung.einordnung.teils}`, `- Nein: ${haltung.einordnung.nein}`, '']
      : []),
    `## Treffer (${Object.entries(f.zahlen[0]?.Frage ?? {}).map(([b, n]) => `${b} ${n}`).join(', ')})`,
    '',
    ...f.seiten.slice(0, 60).map((s) => `- S. ${s.n}: ${s.auszug}`),
    ...(f.seiten.length > 60 ? ['', `Weitere Seiten mit Treffern: ${f.seiten.slice(60).map((s) => s.n).join(', ')}`] : []),
    '',
  ]
  const auftrag = join(arbeit, 'auftraege', `${name}.md`)
  writeFileSync(auftrag, z.join('\n'), 'utf8')
  console.log(`${auftrag}  (${f.seiten.length} Seiten mit Treffern)`)
}
console.log('\nJe Agent haltung-erfassung genügt: „Erledige den Auftrag <Pfad> nach .claude/agents/haltung-erfassung.md.“')
if (fehlt) process.exitCode = 1
