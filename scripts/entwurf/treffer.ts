// Treffermatrix: zählt jeden Suchbegriff (je Ursache und Lösungsrichtung) in jedem Programm der
// Erfassung und schreibt das Ergebnis als `treffer` in die Erfassung. So ist nachvollziehbar, dass
// alle Programme mit denselben Begriffen durchsucht wurden, und es fällt auf, wo ein Programm viele
// Treffer, aber keine Maßnahme hat. Ergänzt ein Agent eigene Synonyme, kommen sie in `suchbegriffe`
// und werden mit einem neuen Lauf in allen Programmen gezählt.
//
// --vorab (vor entwurf:auftrag, ohne Erfassung von Programmen): zählt jeden Begriff in allen Programmen
// des Durchlaufs (wie entwurf:auftrag: --bund, --land XX, --partei) und meldet zu allgemeine Begriffe
// mit ihren häufigsten Wortformen (scripts/entwurf/vorab.ts). Schreibt nichts.
// Aufruf: npm run entwurf:treffer -- <erfassung.json> [--lokal <ordner>]
//         npm run entwurf:treffer -- <erfassung.json> --vorab [--bund | --land XX …] [--partei SPD …] [--lokal <ordner>]
import { readFileSync, writeFileSync } from 'node:fs'
import { begriffePruefsumme, erfassungsHinweise, pruefeSuchbegriffe, type Erfassung, type Treffermatrix } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { erfassungsSeiten, lokalePdfs } from '../programme.ts'
import { auswahlProgramme, zulaessigeUrsachen } from './auftrag-text.ts'
import { leseLeitfaden } from './erfassung-datei.ts'
import { fliesstext, wortformen, zaehle } from './suche.ts'
import { breiteBegriffe, type BegriffZaehlung } from './vorab.ts'

const args = process.argv.slice(2)
const liste = (name: string) => {
  const werte: string[] = []
  for (let i = args.indexOf(name); i >= 0; i = args.indexOf(name)) werte.push(...args.splice(i, 2).slice(1))
  return werte
}
const schalter = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? (args.splice(i, 1), true) : false
}
const lokalOrdner = liste('--lokal')[0]
const lokal = lokalOrdner ? lokalePdfs(lokalOrdner) : undefined
const vorab = schalter('--vorab')
const nurBund = schalter('--bund')
const laender = liste('--land').map((x) => x.toUpperCase())
const parteien = liste('--partei')
const [pfad, ...rest] = args
if (!pfad || rest.length || (!vorab && (nurBund || laender.length || parteien.length))) {
  console.error('Aufruf: npm run entwurf:treffer -- <erfassung.json> [--lokal <ordner>]   oder   … --vorab [--bund | --land XX …] [--partei SPD …]')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = JSON.parse(readFileSync(pfad, 'utf8')) as Erfassung
// Nur das Format der Begriffe muss stimmen; die Treffer schreibt dieses Skript erst.
const format = pruefeSuchbegriffe(katalog, { ...erfassung, treffer: undefined }).filter((f) => !f.startsWith('treffer'))
for (const f of format) console.error(`Fehler:  ${f}`)
if (format.length) process.exit(1)

if (vorab) {
  // Alle Programme des Durchlaufs, wie entwurf:auftrag sie auswählt – noch bevor ein Agent startet.
  const auswahl = auswahlProgramme(katalog, erfassung.thema_id, { nurBund, laender, parteien })
  const zaehlungen = new Map<string, BegriffZaehlung>()
  let gezaehlt = 0
  for (const p of auswahl) {
    let seiten: string[]
    try {
      ;({ seiten } = await erfassungsSeiten(p.url, p.sha256, lokal))
    } catch (e) {
      console.error(`NICHT GELADEN: ${p.name}: ${e instanceof Error ? e.message : e} – nicht mitgezählt`)
      continue
    }
    const texte = seiten.map(fliesstext)
    for (const u of zulaessigeUrsachen(katalog, erfassung.thema_id, p.land))
      for (const [richtung, begriffe] of Object.entries(erfassung.suchbegriffe[String(u.id)] ?? {}))
        for (const b of begriffe) {
          const key = `${u.id}|${richtung}|${b}`
          const z: BegriffZaehlung = zaehlungen.get(key) ?? { ursache: String(u.id), richtung, begriff: b, treffer: [], formen: new Map() }
          z.treffer.push(zaehle(texte, b, true))
          for (const [w, n] of wortformen(texte, b, true)) z.formen.set(w, (z.formen.get(w) ?? 0) + n)
          zaehlungen.set(key, z)
        }
    gezaehlt++
  }
  const breit = breiteBegriffe([...zaehlungen.values()])
  console.log(`Vorabprüfung: ${zaehlungen.size} Begriffe in ${gezaehlt} von ${auswahl.length} Programmen gezählt.`)
  if (!breit.length) console.log('Keine zu allgemeinen Begriffe.')
  else {
    console.log(`\n${breit.length} Begriffe sind sehr allgemein – genauer fassen (für alle Programme gleich), bevor entwurf:auftrag läuft:`)
    for (const z of breit) console.log(`  ${z}`)
  }
  process.exit(0)
}

const matrix: Treffermatrix = { begriffe_pruefsumme: begriffePruefsumme(erfassung.suchbegriffe), programme: [] }
let nichtGeladen = 0
for (const p of erfassung.programme) {
  const partei = katalog.parteien.find((x) => x.id === p.partei_id)
  const lp = p.land ? katalog.landesprogramme.find((x) => x.partei_id === p.partei_id && x.land === p.land && x.aktuell && x.url) : undefined
  const name = `${partei?.kurzname ?? p.partei_id} (${p.land ?? 'Bund'})`
  const url = lp?.url ?? partei?.programm_url
  if (!url || (p.land && !lp)) {
    console.error(`Fehler:  ${name}: kein Programm im Katalog`)
    nichtGeladen++
    continue
  }
  let seiten: string[]
  try {
    ;({ seiten } = await erfassungsSeiten(url, lp ? lp.sha256 : partei?.programm_sha256, lokal))
  } catch (e) {
    console.error(`NICHT GELADEN: ${name}: ${e instanceof Error ? e.message : e}`)
    nichtGeladen++
    continue
  }
  const ursachen: Treffermatrix['programme'][number]['ursachen'] = {}
  for (const u of katalog.ursachen.filter((x) => x.thema_id === erfassung.thema_id && (!p.land || (x.ebene ?? 'bund') === 'land'))) {
    ursachen[u.id] = {}
    for (const [richtung, begriffe] of Object.entries(erfassung.suchbegriffe[String(u.id)] ?? {}))
      ursachen[u.id][richtung] = Object.fromEntries(begriffe.map((b) => [b, zaehle(seiten, b)]))
  }
  matrix.programme.push({ partei_id: p.partei_id, land: p.land, ursachen })
  const summen = Object.entries(ursachen).map(([u, r]) => `${u}: ${Object.entries(r).map(([rn, b]) => `${rn} ${Object.values(b).reduce((a, c) => a + c, 0)}`).join(' / ')}`)
  console.log(`${name.padEnd(16)} ${summen.join(' · ')}`)
}
if (nichtGeladen) {
  console.error(`${nichtGeladen} Programme nicht gezählt – aus der Erfassung nehmen (bleiben „noch nicht erfasst“) oder mit --lokal laden.`)
  process.exit(1)
}
const neu = { ...erfassung, treffer: matrix }
writeFileSync(pfad, JSON.stringify(neu, null, 2) + '\n', 'utf8')
const leitfaden = leseLeitfaden(neu.thema_id)
for (const h of erfassungsHinweise(katalog, leitfaden ? { ...neu, leitfaden } : neu)) console.error(`Hinweis: ${h}`)
console.log(`\nTreffer für ${matrix.programme.length} Programme in ${pfad} geschrieben.`)
