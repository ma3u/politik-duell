// Text einer unabhängigen Quelle als PDF (Studie, Statistik, Gutachten) mit Seitenmarken –
// zum Festlegen der Ursachen (/thema-anlegen), wenn WebFetch ein PDF nicht lesen kann.
// Aufruf: npm run quelle:text -- <url> [--seiten 2-4,57] [--suche "Elternbeitrag"]
// Adressen auf den Servern der Wahlprogramme im Katalog (auch als Archivkopie) sind gesperrt:
// Ursachen werden festgelegt, bevor jemand in die Programme schaut.
// Die Seitenzahl in „===== Seite N =====“ ist die PDF-Seite für das Zitat (#page=N).
import { programmServer } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { herunterladen } from '../programme.ts'
import { seitenTexte } from '../zitate.ts'
import { gibSeitenAus, optionenAus } from './seiten-ausgabe.ts'

const argumente = process.argv.slice(2)
const optionen = optionenAus(argumente)
const [url] = argumente
if (!url || !/^https?:\/\//.test(url)) {
  console.error('Aufruf: npm run quelle:text -- <url> [--seiten 2-4,57] [--suche "Wort"]')
  process.exit(1)
}

const gesperrt = programmServer(pruefeDatenordner().katalog, url)
if (gesperrt) {
  console.error(`Gesperrt: ${gesperrt}`)
  process.exit(1)
}

let daten: Uint8Array
try {
  daten = await herunterladen(url)
} catch (e) {
  console.error(`Nicht geladen: ${e instanceof Error ? e.message : String(e)} – ${url}`)
  process.exit(1)
}
const seiten = await seitenTexte(daten)
console.error(`${seiten.length} Seiten`)
gibSeitenAus(seiten, optionen)
