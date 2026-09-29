// Prüft alle wörtlichen Zitate gegen die Programm-PDFs: Steht das Zitat auf der
// Seite, auf die der Beleg zeigt? Lädt jedes Programm einmal herunter und legt
// es in .cache/programme/ ab. Weicht eine Datei von der ausgewerteten Fassung ab
// (Prüfsumme in parteien.json), gibt es eine Warnung.
// Aufruf: npm run zitate:pruefen                    – alle Maßnahmen
//         npm run zitate:pruefen -- --thema 4       – nur ein Thema
//         npm run zitate:pruefen -- --lokal <ordner> – PDFs aus einem Ordner nehmen (zugeordnet über die Prüfsumme),
//                                                     etwa wenn ein Parteiserver den Abruf sperrt
//         npm run zitate:pruefen -- --archivieren   – zusätzlich jedes Programm im Internet Archive sichern
import { pruefeDatenordner } from './katalog-laden.ts'
import { archivieren, ladeProgramm, lokalePdfs, programme } from './programme.ts'
import { findeZitat, seiteVon, seitenTexte } from './zitate.ts'

const hinweise: string[] = []

const { katalog, fehler: katalogFehler } = pruefeDatenordner()
if (katalogFehler.length) {
  console.error('Datenkatalog fehlerhaft – erst npm run daten:pruefen.')
  process.exit(1)
}

const wert = (name: string) => {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const nurThema = wert('--thema') ? Number(wert('--thema')) : null
const lokal = wert('--lokal') ? lokalePdfs(wert('--lokal')!) : undefined
const pruefsumme = new Map(programme(katalog).map((p) => [p.url, p.sha256]))

if (process.argv.includes('--archivieren')) {
  for (const p of programme(katalog)) {
    try {
      console.log(`${p.name}: ${await archivieren(p.url)}`)
    } catch (e) {
      hinweise.push(`${p.name}: ${e instanceof Error ? e.message : e} – ${p.url}`)
    }
  }
}
const massnahmen = katalog.massnahmen.filter((m) => m.zitat && (nurThema === null || m.thema_id === nurThema))
const partei = (id: number) => katalog.parteien.find((p) => p.id === id)?.kurzname ?? String(id)

const jeProgramm = new Map<string, typeof massnahmen>()
for (const m of massnahmen) {
  const url = m.beleg_programm_url.split('#')[0]
  jeProgramm.set(url, [...(jeProgramm.get(url) ?? []), m])
}

const fehler: string[] = []
let ok = 0
let ungeprueft = 0
for (const [url, liste] of jeProgramm) {
  let seiten: string[]
  try {
    const { daten, hinweis } = await ladeProgramm(url, pruefsumme.get(url), lokal)
    if (hinweis) hinweise.push(hinweis)
    seiten = await seitenTexte(daten)
  } catch (e) {
    // Kein Datenfehler, sondern ein gesperrter Server: melden, aber die Prüfung der anderen nicht rot färben.
    hinweise.push(`Programm nicht erreichbar (${e instanceof Error ? e.message : e}): ${url} – ${liste.length} Zitate ungeprüft, bitte von einem normalen Internetanschluss aus prüfen`)
    ungeprueft += liste.length
    continue
  }
  for (const m of liste) {
    const wo = `Maßnahme ${m.id} (${partei(m.partei_id)}${m.land ? `, ${m.land}` : ''})`
    const seite = seiteVon(m.beleg_programm_url)
    if (seite === null) {
      fehler.push(`${wo}: Beleg ohne Seitenanker`)
      continue
    }
    const befund = findeZitat(m.zitat!, seiten, seite)
    if (befund.status === 'ok') ok++
    else if (befund.status === 'andere_seite')
      fehler.push(`${wo}: Zitat steht nicht auf S. ${seite}, sondern auf S. ${befund.seiten.join(', ')} – Seitenanker anpassen`)
    else fehler.push(`${wo}: Zitat nicht im Programm gefunden (S. ${seite}) – Wortlaut prüfen`)
  }
}

// In GitHub Actions als Warnung am Lauf sichtbar, damit ungeprüfte Zitate nicht untergehen.
for (const h of hinweise) console.warn(process.env.GITHUB_ACTIONS ? `::warning::${h}` : `Hinweis: ${h}`)
for (const f of fehler) console.error(`Fehler:  ${f}`)
console.log(
  `\n${ok} von ${massnahmen.length} Zitaten auf der angegebenen Seite gefunden` +
    (ungeprueft ? `, ${ungeprueft} ungeprüft (Programm nicht erreichbar).` : '.'),
)
if (fehler.length) process.exit(1)
console.log(ungeprueft ? 'Alle erreichbaren Zitate in Ordnung.' : 'Alle Zitate in Ordnung.')
