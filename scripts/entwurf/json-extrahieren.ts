// Holt das erste vollständige JSON-Objekt aus einer Textdatei (etwa der gespeicherten Antwort eines
// Agenten, die vor oder nach dem JSON Text enthält) und schreibt es als UTF-8-Datei.
// Aufruf: npm run entwurf:json -- <antwort.txt> <ziel.json>
import { readFileSync, writeFileSync } from 'node:fs'
import { erstesJsonObjekt } from './json-text.ts'

const [quelle, ziel, ...rest] = process.argv.slice(2)
if (!quelle || !ziel || rest.length) {
  console.error('Aufruf: npm run entwurf:json -- <antwort.txt> <ziel.json>')
  process.exit(1)
}
let gefunden: ReturnType<typeof erstesJsonObjekt>
try {
  gefunden = erstesJsonObjekt(readFileSync(quelle, 'utf8'))
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
}
writeFileSync(ziel, JSON.stringify(gefunden.objekt, null, 2) + '\n', 'utf8')
console.log(`${ziel} geschrieben.${gefunden.rest ? ` Text nach dem JSON (${gefunden.rest.length} Zeichen) wurde nicht übernommen – für das Protokoll selbst lesen.` : ''}`)
