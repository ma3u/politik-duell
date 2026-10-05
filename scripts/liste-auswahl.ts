// Liest eine Einordnungstabelle aus /liste-einordnen und gibt die bestätigten Aufträge aus.
// Aufruf: npm run liste:auswahl -- <.cache/listen/….md>                – prüft die Tabelle, zählt je Art, nennt die Aufträge
//         npm run liste:auswahl -- <datei> --art haltung|forderung|thema   – nur diese Aufträge (eine Zeile je Auftrag)
//         npm run liste:auswahl -- <datei> --evaluation             – Vorlage für docs/prompt-evaluation.md (Äußerung dort nur umschrieben)
import { readFileSync } from 'node:fs'
import { ARTEN, auftraege, evaluationsZeilen, leseListe } from './liste.ts'

const args = process.argv.slice(2)
const a = args.indexOf('--art')
const art = a >= 0 ? args.splice(a, 2)[1] : undefined
const evaluation = args.includes('--evaluation')
const datei = args.find((x) => !x.startsWith('--'))
if (!datei) {
  console.error('Aufruf: npm run liste:auswahl -- <.cache/listen/….md> [--art haltung|forderung|thema] [--evaluation]')
  process.exit(1)
}
const { zeilen, fehler } = leseListe(readFileSync(datei, 'utf8'))
for (const f of fehler) console.error(`Fehler:  ${f}`)
if (fehler.length) process.exit(1)
const x = auftraege(zeilen)
if (evaluation) {
  console.error('Vorlage – die Äußerung vor dem Übernehmen umschreiben (keine Parolen, Beleidigungen oder Namen im Wortlaut):')
  console.log('| Äußerung | Art | Erwartet |\n| --- | --- | --- |')
  for (const z of evaluationsZeilen(zeilen)) console.log(z)
} else if (art === 'haltung') {
  for (const h of x.haltungen) console.log(h)
} else if (art === 'forderung') {
  for (const f of x.forderungen) console.log(`${f.thema} ${f.forderungen.map((t) => `"${t}"`).join('; ')}`)
} else if (art === 'thema') {
  for (const t of x.themen) console.log(t)
} else {
  const n = (k: string, nur = false) => zeilen.filter((z) => z.art === k && (!nur || z.ok)).length
  console.log(`${zeilen.length} Zeilen, ${zeilen.filter((z) => z.ok).length} bestätigt.`)
  for (const k of Object.keys(ARTEN)) if (n(k)) console.log(`  ${k}: ${n(k)} (bestätigt ${n(k, true)})`)
  console.log(`\nAufträge: ${x.haltungen.length} neue Haltungen, ${x.forderungen.reduce((s, f) => s + f.forderungen.length, 0)} Forderungen in ${x.forderungen.length} Themen, ${x.themen.length} neue Themen.`)
  for (const z of x.zuVorhandenenHaltungen) console.log(`  Zu vorhandener Haltung ${z.ziel}: Nr ${z.nr} „${z.eintrag}“ – nichts anzulegen`)
}
