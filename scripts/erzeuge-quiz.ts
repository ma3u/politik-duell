// Erzeugt die Fragen für das Quiz „Wer sagt Ja?“ (eigenes Repository: https://github.com/ma3u/wer-sagt-ja) aus den
// Haltungen in daten/haltungen/ – dort als public/fragen.json einchecken.
// Aufruf:
//   npm run quiz:erzeugen                       → .cache/fragen.json, nur geprüfte Positionen
//   npm run quiz:erzeugen -- --entwuerfe        → auch KI-Entwürfe (das Quiz zeigt dann einen Hinweis)
//   npm run quiz:erzeugen -- ../wer-sagt-ja/public/fragen.json [--entwuerfe]   → direkt dorthin schreiben
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { spielbareHaltungen, type Katalog } from '../src/data/katalog.ts'
import { pruefeDatenordner } from './katalog-laden.ts'
import { quizFragen, quizParteien, type QuizDaten } from './quiz-fragen.ts'

const args = process.argv.slice(2)
const mitEntwuerfen = args.includes('--entwuerfe')
const ziel = args.find((a) => !a.startsWith('--')) ?? '.cache/fragen.json'
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error(`Datenkatalog fehlerhaft – Quiz nicht erzeugt:\n  ${fehler.join('\n  ')}`)
  process.exit(1)
}

function quizDaten(k: Katalog): QuizDaten {
  const h = spielbareHaltungen(k, mitEntwuerfen)
  const parteien = quizParteien(k.parteien)
  const fragen = quizFragen(h.haltungen, h.positionen, h.zielkonflikte, parteien)
  const inhalt = { parteien, fragen }
  const version = createHash('sha256').update(JSON.stringify(inhalt)).digest('hex').slice(0, 8)
  return { version, entwurf: mitEntwuerfen, ...inhalt }
}

const daten = quizDaten(katalog)
mkdirSync(dirname(ziel), { recursive: true })
writeFileSync(ziel, `${JSON.stringify(daten, null, 1)}\n`)
console.log(`${ziel} geschrieben: ${daten.fragen.length} Fragen${mitEntwuerfen ? ' (mit KI-Entwürfen)' : ' (nur geprüfte Positionen)'}.`)
