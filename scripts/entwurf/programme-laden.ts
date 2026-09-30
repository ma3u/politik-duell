// Lädt alle Programme aus daten/parteien.json in den Zwischenspeicher .cache/
// (PDF und Seitentexte), damit Suche und Zitatprüfung ohne erneuten Download laufen.
// .cache/ ist nicht versioniert: Die Programme dürfen nicht ins Repository.
// Aufruf: npm run programme:laden                 – Bundes- und aktuelle Landesprogramme
//         npm run programme:laden -- --alle       – auch Landesprogramme früherer Wahlperioden
//         npm run programme:laden -- --lokal <ordner> – PDFs aus einem Ordner (Zuordnung über die Prüfsumme)
import { pruefeDatenordner } from '../katalog-laden.ts'
import { lokalePdfs, programme, programmSeiten } from '../programme.ts'

const wert = (name: string) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const lokal = wert('--lokal') ? lokalePdfs(wert('--lokal')!) : undefined
const { katalog } = pruefeDatenordner()
const liste = programme(katalog).filter((p) => p.aktuell || process.argv.includes('--alle'))

const hinweise: string[] = []
let fehlt = 0
// Einige gleichzeitig, aber nicht alle: Manche Parteiserver brechen sonst ab.
const warteschlange = [...liste]
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let p = warteschlange.shift(); p; p = warteschlange.shift()) {
      try {
        const { seiten, hinweis } = await programmSeiten(p.url, p.sha256, lokal)
        console.log(`ok     ${p.name}: ${seiten.length} Seiten`)
        if (hinweis) hinweise.push(`${p.name}: ${hinweis}`)
      } catch (e) {
        fehlt++
        console.log(`FEHLT  ${p.name}: ${e instanceof Error ? e.message : e} – ${p.url}`)
      }
    }
  }),
)
for (const h of hinweise) console.warn(`Hinweis: ${h}`)
console.log(`${liste.length - fehlt} von ${liste.length} Programmen im Zwischenspeicher (.cache/).`)
if (fehlt) console.log('Fehlende von einem normalen Internetanschluss aus laden oder mit --lokal <ordner>.')
