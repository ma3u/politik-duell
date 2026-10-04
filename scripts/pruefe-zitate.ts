// Prüft alle wörtlichen Zitate (Maßnahmen und Positionen zu Haltungen) gegen die Programm-PDFs: Steht das Zitat auf der
// Seite, auf die der Beleg zeigt? Lädt jedes Programm einmal herunter und legt
// es in .cache/programme/ ab. Weicht eine Datei von der ausgewerteten Fassung ab
// (Prüfsumme in parteien.json), gibt es eine Warnung.
// Aufruf: npm run zitate:pruefen                    – alle Maßnahmen
//         npm run zitate:pruefen -- --thema 4       – nur ein Thema
//         npm run zitate:pruefen -- --lokal <ordner> – PDFs aus einem Ordner nehmen (zugeordnet über die Prüfsumme),
//                                                     etwa wenn ein Parteiserver den Abruf sperrt
//         npm run zitate:pruefen -- --archivieren   – zusätzlich jedes Programm im Internet Archive sichern
// Außerdem: Auslassungen „[…]“ über 200 Zeichen, Teile unter 20 Zeichen und einschränkende Wörter
// („nicht“, „nur“, „sofern“ …) im ausgelassenen Text werden gemeldet (kein Fehler).
import { pruefeDatenordner } from './katalog-laden.ts'
import { archivieren, ladeProgramm, lokalePdfs, programme } from './programme.ts'
import { findeZitat, seiteVon, seitenTexte, zitatKontext } from './zitate.ts'

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
const partei = (id: number) => katalog.parteien.find((p) => p.id === id)?.kurzname ?? String(id)

/** Was geprüft wird: Zitate von Maßnahmen und von Positionen zu Haltungen (dort ist der Wortlaut der Beleg). */
interface Zitat {
  wo: string
  zitat: string
  beleg_programm_url: string
}
const zitate: Zitat[] = [
  ...katalog.massnahmen
    .filter((m) => m.zitat && (nurThema === null || m.thema_id === nurThema))
    .map((m) => ({ wo: `Maßnahme ${m.id} (${partei(m.partei_id)}${m.land ? `, ${m.land}` : ''})`, zitat: m.zitat!, beleg_programm_url: m.beleg_programm_url })),
  // Haltungen gehören zu keinem Thema – mit --thema bleiben sie weg.
  ...(nurThema === null ? katalog.haltungen : []).flatMap((h) =>
    h.positionen
      .filter((p) => p.zitat && p.beleg_programm_url)
      .map((p) => ({ wo: `Haltung ${h.id}, Position ${partei(p.partei_id)}`, zitat: p.zitat!, beleg_programm_url: p.beleg_programm_url! })),
  ),
]

const jeProgramm = new Map<string, Zitat[]>()
for (const z of zitate) {
  const url = z.beleg_programm_url.split('#')[0]
  jeProgramm.set(url, [...(jeProgramm.get(url) ?? []), z])
}

const fehler: string[] = []
const auslassungen: string[] = []
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
    const { wo } = m
    const seite = seiteVon(m.beleg_programm_url)
    if (seite === null) {
      fehler.push(`${wo}: Beleg ohne Seitenanker`)
      continue
    }
    const befund = findeZitat(m.zitat, seiten, seite)
    if (befund.status === 'ok') {
      ok++
      // Auslassungen, die den Sinn ändern könnten: zum Nachsehen in der Belegprüfung (npm run pruefliste).
      const kontext = zitatKontext(m.zitat, seiten, seite)
      if (kontext?.warnungen.length)
        auslassungen.push(`${wo}: ${kontext.warnungen.join('; ')} – ausgelassen: ${kontext.auslassungen.map((a) => `„${a.length > 160 ? `${a.slice(0, 160)}…` : a}“`).join(' / ')}`)
    }
    else if (befund.status === 'andere_seite')
      fehler.push(`${wo}: Zitat steht nicht auf S. ${seite}, sondern auf S. ${befund.seiten.join(', ')} – Seitenanker anpassen`)
    else fehler.push(`${wo}: Zitat nicht im Programm gefunden (S. ${seite}) – Wortlaut prüfen`)
  }
}

// Kein Fehler: Auslassungen sind erlaubt, sollen aber bei der Belegprüfung angesehen werden.
for (const a of auslassungen) console.warn(`Auslassung: ${a}`)
if (auslassungen.length && process.env.GITHUB_ACTIONS)
  console.warn(`::warning::${auslassungen.length} Zitate mit langen oder einschränkenden Auslassungen – in der Belegprüfung ansehen (Liste im Lauf, npm run pruefliste)`)

// In GitHub Actions als Warnung am Lauf sichtbar, damit ungeprüfte Zitate nicht untergehen.
for (const h of hinweise) console.warn(process.env.GITHUB_ACTIONS ? `::warning::${h}` : `Hinweis: ${h}`)
for (const f of fehler) console.error(`Fehler:  ${f}`)
console.log(
  `\n${ok} von ${zitate.length} Zitaten auf der angegebenen Seite gefunden` +
    (ungeprueft ? `, ${ungeprueft} ungeprüft (Programm nicht erreichbar).` : '.'),
)
if (fehler.length) process.exit(1)
console.log(ungeprueft ? 'Alle erreichbaren Zitate in Ordnung.' : 'Alle Zitate in Ordnung.')
