// Erzeugt die Seiten für die Prüfung der Haltungen in pruefung/ (nicht im Repository):
//   haltungen-belege.html       – Belegprüfung durch die Betreiberin
//   haltungen-blind.html        – für zwei Prüfende: Zitate ohne Parteinamen einordnen
//   haltungen-formulierung.html – für zwei Personen mit unterschiedlicher politischer Haltung (E9)
// Ablauf: daten/README.md → „Haltungen prüfen“. Die Antworten der Blindblätter wertet
// npm run haltung:auswerten aus.
// Aufruf: npm run haltung:pruefliste
//         npm run haltung:pruefliste -- --lokal <ordner>   – Programm-PDFs aus einem Ordner (Zuordnung über die Prüfsumme)
import { mkdirSync, writeFileSync } from 'node:fs'
import { pruefeDatenordner } from './katalog-laden.ts'
import { belegeBlatt, blindesBlatt, formulierungsBlatt } from './haltung-pruefliste-html.ts'
import { blindeZitate } from './haltung-pruefung.ts'
import { lokalePdfs, programmSeiten, programme } from './programme.ts'
import { seiteVon, zitatKontext } from './zitate.ts'

const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
if (!katalog.haltungen.some((h) => h.positionen.length)) {
  console.error('Keine Haltung mit Positionen im Katalog – nichts zu prüfen.')
  process.exit(1)
}

const i = process.argv.indexOf('--lokal')
const lokal = i >= 0 ? lokalePdfs(process.argv[i + 1]) : undefined
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Was die Zitate auslassen, steht in der Belegprüfung: Dafür werden die Programme gelesen (Zwischenspeicher
// .cache/, sonst Download oder --lokal). Ist ein Programm nicht erreichbar, fehlt nur dieser Hinweis.
const pruefsummen = new Map(programme(katalog).map((p) => [p.url, p.sha256]))
const seitenCache = new Map<string, string[] | null>()
const seitenVon = new Map<string, Promise<string[] | null>>()
const seiten = (url: string) => {
  if (!seitenVon.has(url))
    seitenVon.set(url, programmSeiten(url, pruefsummen.get(url), lokal).then((r) => r.seiten, () => null))
  return seitenVon.get(url)!
}
for (const h of katalog.haltungen)
  for (const p of h.positionen) if (p.beleg_programm_url) seitenCache.set(p.beleg_programm_url.split('#')[0], await seiten(p.beleg_programm_url.split('#')[0]))

const kontext = (p: (typeof katalog.haltungen)[number]['positionen'][number]) => {
  if (!p.zitat || !p.beleg_programm_url) return ''
  const s = seitenCache.get(p.beleg_programm_url.split('#')[0])
  const seite = seiteVon(p.beleg_programm_url)
  if (!s || seite === null) return '<p class="leise">Programm nicht geladen – Auslassungen im PDF selbst ansehen.</p>'
  const k = zitatKontext(p.zitat, s, seite)
  if (!k?.auslassungen.length) return ''
  return `<p class="leise${k.warnungen.length ? ' achtung' : ''}">Ausgelassen: ${k.auslassungen.map((a) => `„${esc(a)}“`).join(' · ')}${
    k.warnungen.length ? ` <b>(${esc(k.warnungen.join('; '))})</b>` : ''
  }</p>`
}

const ordner = new URL('../pruefung/', import.meta.url)
mkdirSync(ordner, { recursive: true })
for (const [name, html] of [
  ['haltungen-belege.html', belegeBlatt(katalog, kontext)],
  ['haltungen-blind.html', blindesBlatt(katalog)],
  ['haltungen-formulierung.html', formulierungsBlatt(katalog)],
] as const) {
  writeFileSync(new URL(name, ordner), html)
  console.log(`geschrieben: pruefung/${name}`)
}

// Hinweise: Zitate, die trotz Neutralisierung auf eine Partei hindeuten können.
for (const z of blindeZitate(katalog))
  if (z.reste.length) console.warn(`Hinweis: ${z.kennung} (Partei ${z.partei_id}) enthält Wörter, die auf eine Partei hindeuten können: ${z.reste.join(', ')} – vor dem Versand ansehen`)
