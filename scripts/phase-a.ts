// Phase A (Ursachen festlegen, /thema-anlegen): schaltet die technische Programmsperre ein und aus.
// Solange .cache/phase-a besteht, sperrt der Hook .claude/hooks/sperre.mjs Lesezugriffe auf .cache/
// und die Werkzeuge, die Wahlprogramme lesen; der Sitzungsstart lädt keine Programme.
// Aufruf: npm run phase-a -- start "<Thema>"   |   npm run phase-a -- ende   |   npm run phase-a
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const marker = new URL('../.cache/phase-a', import.meta.url)
const [befehl, ...thema] = process.argv.slice(2)
if (befehl === 'start') {
  mkdirSync(new URL('.', marker), { recursive: true })
  writeFileSync(marker, `${new Date().toISOString()} ${thema.join(' ')}\n`)
  console.log('Phase A aktiv: Programme und .cache/ sind gesperrt (gilt auch für Agenten). Ende mit npm run phase-a -- ende')
} else if (befehl === 'ende') {
  if (existsSync(marker)) rmSync(marker)
  console.log('Phase A beendet: Programmsperre aufgehoben.')
} else if (!befehl) {
  console.log(existsSync(marker) ? `Phase A aktiv seit ${readFileSync(marker, 'utf8').trim()}` : 'Phase A nicht aktiv.')
} else {
  console.error('Aufruf: npm run phase-a -- start "<Thema>" | ende')
  process.exit(1)
}
