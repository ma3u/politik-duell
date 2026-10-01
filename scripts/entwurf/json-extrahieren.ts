// Holt das erste vollständige JSON-Objekt aus einer Textdatei (etwa der gespeicherten Antwort eines
// Agenten, die vor oder nach dem JSON Text enthält) und schreibt es als UTF-8-Datei.
// Aufruf: npm run entwurf:json -- <antwort.txt> <ziel.json>
import { readFileSync, writeFileSync } from 'node:fs'

const [quelle, ziel, ...rest] = process.argv.slice(2)
if (!quelle || !ziel || rest.length) {
  console.error('Aufruf: npm run entwurf:json -- <antwort.txt> <ziel.json>')
  process.exit(1)
}
const text = readFileSync(quelle, 'utf8')
const start = text.indexOf('{')
if (start < 0) {
  console.error('Kein JSON-Objekt gefunden.')
  process.exit(1)
}
let tiefe = 0
let inText = false
let maskiert = false
let ende = -1
for (let i = start; i < text.length; i++) {
  const c = text[i]
  if (inText) {
    if (maskiert) maskiert = false
    else if (c === '\\') maskiert = true
    else if (c === '"') inText = false
    continue
  }
  if (c === '"') inText = true
  else if (c === '{') tiefe++
  else if (c === '}' && --tiefe === 0) {
    ende = i
    break
  }
}
if (ende < 0) {
  console.error('JSON-Objekt nicht abgeschlossen (Antwort abgeschnitten?).')
  process.exit(1)
}
let objekt: unknown
try {
  objekt = JSON.parse(text.slice(start, ende + 1))
} catch (e) {
  console.error(`Kein gültiges JSON: ${e instanceof Error ? e.message : e}`)
  process.exit(1)
}
writeFileSync(ziel, JSON.stringify(objekt, null, 2) + '\n', 'utf8')
const rest2 = text.slice(ende + 1).trim()
console.log(`${ziel} geschrieben.${rest2 ? ` Text nach dem JSON (${rest2.length} Zeichen) wurde nicht übernommen – für das Protokoll selbst lesen.` : ''}`)
