// Hält die ausgewertete Fassung eines Programms fest: Prüfsumme (SHA-256) in
// daten/parteien.json und eine Kopie im Internet Archive.
// Aufruf: npm run programm:sichern -- <url>                 – lädt das Programm herunter
//         npm run programm:sichern -- <url> --datei x.pdf   – nimmt eine lokale Kopie (Server gesperrt)
// Die URL muss schon in parteien.json stehen (programm_url bzw. landesprogramme[].url).
import { readFileSync, writeFileSync } from 'node:fs'
import { archivieren, herunterladen, sha256 } from '../programme.ts'

const argumente = process.argv.slice(2)
const i = argumente.indexOf('--datei')
const datei = i >= 0 ? argumente.splice(i, 2)[1] : undefined
const [url] = argumente
if (!url) {
  console.error('Aufruf: npm run programm:sichern -- <url> [--datei lokale-kopie.pdf]')
  process.exit(1)
}

const daten = datei ? new Uint8Array(readFileSync(datei)) : await herunterladen(url)
if (new TextDecoder().decode(daten.slice(0, 5)) !== '%PDF-') {
  console.error('Keine PDF-Datei.')
  process.exit(1)
}
const summe = sha256(daten)

// Gezielt die eine Zeile ändern, damit die Formatierung von parteien.json bleibt.
const pfad = new URL('../../daten/parteien.json', import.meta.url)
const zeilen = readFileSync(pfad, 'utf8').split('\n')
const esc = JSON.stringify(url)
let geaendert = false
for (let n = 0; n < zeilen.length; n++) {
  const z = zeilen[n]
  if (z.includes(`"programm_url": ${esc}`)) {
    // Bundesprogramm: eigene Zeile „programm_sha256“ nach „programm_stand“.
    const stand = zeilen.findIndex((x, k) => k > n && x.includes('"programm_stand"'))
    const einzug = z.slice(0, z.indexOf('"'))
    if (zeilen[stand + 1]?.includes('"programm_sha256"')) zeilen[stand + 1] = `${einzug}"programm_sha256": "${summe}",`
    else zeilen.splice(stand + 1, 0, `${einzug}"programm_sha256": "${summe}",`)
    geaendert = true
    break
  }
  if (z.includes(`"url": ${esc}`)) {
    zeilen[n] = z.includes('"sha256"')
      ? z.replace(/"sha256": "[0-9a-f]*"/, `"sha256": "${summe}"`)
      : z.replace(/("stand": "[0-9-]+")/, `$1, "sha256": "${summe}"`)
    geaendert = true
    break
  }
}
if (!geaendert) {
  console.error(`Die URL steht nicht in daten/parteien.json – erst eintragen. Prüfsumme: ${summe}`)
  process.exit(1)
}
writeFileSync(pfad, zeilen.join('\n'))
console.log(`daten/parteien.json: sha256 ${summe}`)

try {
  console.log(await archivieren(url))
} catch (e) {
  // Aus manchen Netzen ist web.archive.org nicht erreichbar; die Zitatprüfung holt das montags nach.
  console.warn(`Internet Archive nicht erreichbar (${e instanceof Error ? e.message : e}) – sichert der wöchentliche Lauf „Zitate prüfen“.`)
}
