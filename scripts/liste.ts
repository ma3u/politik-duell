// Einordnungstabelle aus /liste-einordnen (docs/listen/<Datum>-<Name>.md): je Zeile einer Liste von Äußerungen,
// welche Art sie ist, was daraus wird und ob die Betreiberin das bestätigt hat. Reine Funktionen
// (Tests: scripts/liste.test.ts); Befehl: scripts/liste-auswahl.ts.
//
// | Nr | Eintrag | Art | Vorschlag | Ziel | OK |
// | 1 | Befürwortung der Wehrpflicht | haltung | Soll die Wehrpflicht wieder eingeführt werden? | neu | [x] |

/** Arten einer Zeile und was daraus wird. */
export const ARTEN = {
  haltung: 'neue Haltung (/haltung-anlegen) oder Teil einer vorhandenen (Ziel H<ID>)',
  forderung: 'Lösungsweg in einem Thema (/forderung-erfassen, Ziel T<ID>)',
  thema: 'neues Thema (/thema-anlegen, Ziel neu) oder schon abgedeckt (Ziel T<ID>)',
  grenze: 'Abwertung, Gewalt, NS-Relativierung, Antisemitismus – kein Katalogeintrag',
  pauschal: 'Pauschalurteil über eine Gruppe – kein Eintrag, im Spiel Nachfrage',
  tatsache: 'Tatsachenbehauptung – kein Eintrag (Teil C nicht umgesetzt)',
  meta: 'Aussage über Parteien, Wähler oder Stimmung – kein Eintrag',
  doppelt: 'gleich wie eine andere Zeile (Ziel #<Nr>)',
} as const
export type Art = keyof typeof ARTEN

/** Erwartete Antwort der Gesprächs-KI (Edge Function `analyse`) – für die Prompt-Evaluation. */
export const ERWARTET: Record<Exclude<Art, 'doppelt'>, string> = {
  haltung: 'wert, haltung_id wenn erfasst',
  forderung: 'forderung, instrument_id wenn erfasst',
  thema: 'problem (oder Nachfrage)',
  grenze: 'grenze',
  pauschal: 'forderung mit pauschal: true (Nachfrage nach dem Erlebten)',
  tatsache: 'wert oder Nachfrage – keine Bestätigung, keine Zahlen',
  meta: 'wert – keine Bewertung von Parteien',
}

export interface Zeile {
  nr: number
  eintrag: string
  art: Art
  vorschlag: string
  ziel: string
  ok: boolean
}

const zellen = (z: string) => z.trim().replace(/^\||\|$/g, '').split('|').map((x) => x.trim())

/** Liest die Tabelle; Fehler mit Zeilennummer der Datei. */
export function leseListe(text: string): { zeilen: Zeile[]; fehler: string[] } {
  const zeilen: Zeile[] = []
  const fehler: string[] = []
  const nrs = new Set<number>()
  for (const [i, roh] of text.split('\n').entries()) {
    if (!/^\s*\|\s*\d+\s*\|/.test(roh)) continue
    const c = zellen(roh)
    const ort = `Zeile ${i + 1}`
    if (c.length !== 6) {
      fehler.push(`${ort}: erwartet 6 Spalten (Nr | Eintrag | Art | Vorschlag | Ziel | OK), gefunden ${c.length} – „|“ im Text als „/“ schreiben`)
      continue
    }
    const [nrText, eintrag, artText, vorschlag, ziel, okText] = c
    const nr = Number(nrText)
    const art = artText.toLowerCase() as Art
    if (nrs.has(nr)) fehler.push(`${ort}: Nr ${nr} doppelt`)
    nrs.add(nr)
    if (!(art in ARTEN)) fehler.push(`${ort}: Art „${artText}“ unbekannt (${Object.keys(ARTEN).join(', ')})`)
    if (!/^\[[ xX]\]$/.test(okText)) fehler.push(`${ort}: OK muss „[ ]“ oder „[x]“ sein`)
    const zielOk =
      art === 'haltung' ? /^(neu|H\d+)$/.test(ziel) :
      art === 'forderung' ? /^T\d+$/.test(ziel) :
      art === 'thema' ? /^(neu|T\d+)$/.test(ziel) :
      art === 'doppelt' ? /^#\d+$/.test(ziel) : ziel === '–' || ziel === '-' || ziel === ''
    if (art in ARTEN && !zielOk) fehler.push(`${ort}: Ziel „${ziel}“ passt nicht zur Art ${art} (${ARTEN[art]})`)
    if (((art === 'haltung' && ziel === 'neu') || art === 'forderung' || (art === 'thema' && ziel === 'neu')) && (!vorschlag || vorschlag === '–'))
      fehler.push(`${ort}: Vorschlag fehlt (Frage, Forderung bzw. Thema)`)
    if (art === 'haltung' && ziel === 'neu' && !vorschlag.endsWith('?')) fehler.push(`${ort}: Vorschlag für eine Haltung ist eine Ja/Nein-Frage mit „?“`)
    zeilen.push({ nr, eintrag, art, vorschlag, ziel, ok: /x/i.test(okText) })
  }
  for (const z of zeilen) if (z.art === 'doppelt' && !nrs.has(Number(z.ziel.slice(1)))) fehler.push(`Nr ${z.nr}: verweist auf #${z.ziel.slice(1)}, die es nicht gibt`)
  if (!zeilen.length) fehler.push('Keine Tabellenzeilen gefunden (| Nr | Eintrag | Art | Vorschlag | Ziel | OK |)')
  return { zeilen, fehler }
}

/** Bestätigte Aufträge je Skill: neue Haltungen, Forderungen je Thema, neue Themen. */
export function auftraege(zeilen: Zeile[]) {
  const ok = zeilen.filter((z) => z.ok)
  const forderungen = new Map<string, string[]>()
  for (const z of ok.filter((x) => x.art === 'forderung')) forderungen.set(z.ziel, [...new Set([...(forderungen.get(z.ziel) ?? []), z.vorschlag])])
  return {
    haltungen: [...new Set(ok.filter((z) => z.art === 'haltung' && z.ziel === 'neu').map((z) => z.vorschlag))],
    zuVorhandenenHaltungen: ok.filter((z) => z.art === 'haltung' && z.ziel !== 'neu'),
    forderungen: [...forderungen].map(([thema, liste]) => ({ thema: Number(thema.slice(1)), forderungen: liste })),
    themen: [...new Set(ok.filter((z) => z.art === 'thema' && z.ziel === 'neu').map((z) => z.vorschlag))],
  }
}

/** Zeilen für die Prompt-Evaluation (docs/prompt-evaluation.md): Äußerung und erwartete Antwort. */
export const evaluationsZeilen = (zeilen: Zeile[]) =>
  zeilen.filter((z) => z.ok && z.art !== 'doppelt').map((z) => `| ${z.eintrag} | ${z.art} | ${ERWARTET[z.art as Exclude<Art, 'doppelt'>]} |`)
