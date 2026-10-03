#!/usr/bin/env node
// PreToolUse-Hook (.claude/settings.json): technische Sperren für die Neutralität, auch für Agenten.
//
// 1. WebFetch auf Partei-, Fraktions- und Stiftungsserver, die Server aller Programme aus
//    daten/parteien.json und das Repository auf GitHub ist immer gesperrt (Liste: daten/gesperrte-adressen.json).
// 2. Phase A (Ursachen festlegen, /thema-anlegen): Solange .cache/phase-a besteht, sind Lesezugriffe auf
//    .cache/ (Programmtexte, Erfassungen) und die Programm-Werkzeuge gesperrt. Start und Ende:
//    npm run phase-a -- start "<Thema>" bzw. npm run phase-a -- ende
// 3. Agent blind-bewertung (erkannt an agent_type in der Hook-Eingabe, die Claude Code bei jedem
//    Werkzeugaufruf eines Subagenten mitschickt): Read nur genau .cache/entwurf/<ID>/blind.json und die
//    eigene Antwort, Write nur genau .cache/entwurf/<ID>/protokoll/bewertung-antwort.txt, Bash nur genau
//    die Selbstprüfung `npm run -s entwurf:antwort-pruefen -- <ID>`, WebFetch wie unter 1; alles andere gesperrt.
//
// Eingabe: JSON auf stdin ({ tool_name, tool_input, cwd, agent_type? }). Ausgabe bei Sperre: Entscheidung
// „deny“ mit Grund. Ohne Abhängigkeiten, damit der Hook schnell startet.
import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

const wurzel = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const MARKER = join(wurzel, '.cache', 'phase-a')

/** Name des Bewertungs-Agenten (.claude/agents/blind-bewertung.md); bei Plugins mit Präfix „plugin:“. */
export const BLIND_AGENT = /(^|:)blind-bewertung$/

/**
 * Darf der Bewertungs-Agent diesen Pfad mit diesem Werkzeug benutzen? Genau zwei Dateien je Thema:
 * die Blindliste lesen, die Antwort schreiben. Relative Pfade gelten ab `cwd` (sonst Projektordner), `..` wird aufgelöst.
 */
export function blindPfadErlaubt(werkzeug, pfad, wurzel, cwd = wurzel) {
  if (typeof pfad !== 'string' || !pfad.trim()) return false
  const norm = (p) => {
    const r = resolve(wurzel, p).replace(/\\/g, '/')
    return process.platform === 'win32' ? r.toLowerCase() : r
  }
  const datei = norm(isAbsolute(pfad) ? pfad : join(cwd, pfad))
  const basis = norm(wurzel).replace(/\/$/, '')
  const rest = datei.startsWith(`${basis}/`) ? datei.slice(basis.length + 1) : null
  if (rest === null) return false
  if (werkzeug === 'Read') return /^\.cache\/entwurf\/\d+\/(blind\.json|protokoll\/bewertung-antwort\.txt)$/.test(rest)
  if (werkzeug === 'Write') return /^\.cache\/entwurf\/\d+\/protokoll\/bewertung-antwort\.txt$/.test(rest)
  return false
}

/**
 * Die Selbstprüfung des Bewertungs-Agenten – genau dieser Befehl, ohne weitere Zeichen: keine
 * Verkettung, Umleitung oder Ersetzung. Das Skript liest nur blind.json und die Antwort.
 */
export const BLIND_PRUEFBEFEHL = /^npm run (-s |--silent )?entwurf:antwort-pruefen '?--'? \d+$/

/** Gründe für eine Sperre; null = erlaubt. Reine Funktion für Tests (scripts/sperre.test.ts). */
export function pruefe(eingabe, { liste, programmHosts, phaseA, wurzel: basis = wurzel }) {
  const { tool_name: werkzeug, tool_input: e = {} } = eingabe
  if (werkzeug === 'WebFetch' && typeof e.url === 'string') {
    const grund = gesperrteAdresse(e.url, liste, programmHosts)
    if (grund) return grund
  }
  if (typeof eingabe.agent_type === 'string' && BLIND_AGENT.test(eingabe.agent_type)) {
    if (werkzeug === 'WebFetch' || werkzeug === 'WebSearch') return null
    if ((werkzeug === 'Read' || werkzeug === 'Write') && blindPfadErlaubt(werkzeug, e.file_path, basis, eingabe.cwd || basis)) return null
    if (werkzeug === 'Bash' && typeof e.command === 'string' && BLIND_PRUEFBEFEHL.test(e.command.trim()) && !e.run_in_background) return null
    return (
      `Bewertung ohne Parteinamen: ${werkzeug} ${e.file_path ?? e.path ?? e.command ?? ''} ist gesperrt. ` +
      'Erlaubt sind nur Read auf .cache/entwurf/<ID>/blind.json und protokoll/bewertung-antwort.txt, Write auf .cache/entwurf/<ID>/protokoll/bewertung-antwort.txt, ' +
      'Bash nur „npm run -s entwurf:antwort-pruefen -- <ID>“, WebSearch und WebFetch.'
    )
  }
  if (werkzeug === 'WebFetch') return null
  if (!phaseA) return null
  const cache = /(^|[\s/\\'"=])\.cache([\s/\\'"]|$)/
  const texte = [e.file_path, e.path, e.pattern, e.glob].filter((x) => typeof x === 'string')
  if (['Read', 'Grep', 'Glob', 'NotebookRead'].includes(werkzeug) && texte.some((t) => cache.test(t) || t.includes('/.cache/') || t.startsWith('.cache')))
    return 'Phase A (Ursachen festlegen): kein Zugriff auf .cache/ – dort liegen Programmtexte und Erfassungen.'
  if (werkzeug === 'Bash' && typeof e.command === 'string') {
    const c = e.command
    if (/\bnpm run phase-a\b/.test(c) && !/[;&|]/.test(c.replace(/\b2>&1\b/g, ''))) return null
    if (cache.test(c) || /\.cache\//.test(c)) return 'Phase A (Ursachen festlegen): kein Zugriff auf .cache/ – dort liegen Programmtexte und Erfassungen.'
    if (/\b(programme:(laden|suche|texte)|programm:(text|sichern)|zitate:pruefen|entwurf:|punkte\b|pruefliste|blind:reste)/.test(c))
      return 'Phase A (Ursachen festlegen): Werkzeuge, die Wahlprogramme lesen, sind gesperrt. Erlaubt: npm run quelle:text, npm run themen:ueberblick.'
    if (/(^|[\s/])scripts\/(entwurf\/(programm|programme|treffer|reste)|pruefe-zitate|erzeuge-pruefliste)/.test(c))
      return 'Phase A (Ursachen festlegen): Werkzeuge, die Wahlprogramme lesen, sind gesperrt.'
  }
  return null
}

export function gesperrteAdresse(url, liste, programmHosts) {
  let adresse = url.toLowerCase()
  try {
    adresse = decodeURIComponent(adresse)
  } catch {
    // ungültige Prozentkodierung: so prüfen, wie sie ist
  }
  // Auch Kopien im Internet Archive oder hinter Weiterleitungsdiensten: jede Adresse in der URL zählt.
  const hosts = [...adresse.matchAll(/(?:https?:\/\/|^|\/)([a-z0-9.-]+\.[a-z]{2,})(?=[/:?#]|$)/g)].map((m) => m[1].replace(/^www\./, ''))
  const pfade = [...adresse.matchAll(/(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+\.[a-z]{2,}\/[^\s?#]*)/g)].map((m) => m[1])
  for (const h of hosts) {
    const exakt = [...liste.hosts, ...programmHosts].find((g) => h === g || h.endsWith(`.${g}`))
    if (exakt) return `${url}: ${exakt} ist gesperrt (Partei, Fraktion, Stiftung, Programmserver oder Politik-Duell selbst – daten/gesperrte-adressen.json)`
    if (liste.muster.some((m) => new RegExp(m).test(h))) return `${url}: ${h} sieht nach einem Parteiserver aus und ist gesperrt (daten/gesperrte-adressen.json)`
  }
  for (const p of pfade) {
    const treffer = liste.pfade.find((g) => p === g || p.startsWith(`${g}/`))
    if (treffer) return `${url}: ${treffer} ist gesperrt (Repository mit Maßnahmen und Bewertungen)`
  }
  return null
}

function ladeListe() {
  const liste = JSON.parse(readFileSync(join(wurzel, 'daten', 'gesperrte-adressen.json'), 'utf8'))
  const parteien = JSON.parse(readFileSync(join(wurzel, 'daten', 'parteien.json'), 'utf8'))
  const programmHosts = new Set()
  for (const p of parteien.parteien ?? [])
    for (const u of [p.programm_url, ...(p.landesprogramme ?? []).map((l) => l.url)])
      if (u)
        try {
          programmHosts.add(new URL(u).hostname.toLowerCase().replace(/^www\./, ''))
        } catch {
          // ungültige Adresse meldet daten:pruefen
        }
  return { liste, programmHosts: [...programmHosts] }
}

// Nur als Hook ausführen, nicht beim Import in Tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  let roh = ''
  for await (const teil of process.stdin) roh += teil
  let eingabe
  try {
    eingabe = JSON.parse(roh)
  } catch {
    process.exit(0)
  }
  const phaseA = existsSync(MARKER)
  const braucheListe = eingabe.tool_name === 'WebFetch'
  const { liste, programmHosts } = braucheListe ? ladeListe() : { liste: null, programmHosts: [] }
  const grund = pruefe(eingabe, { liste, programmHosts, phaseA, wurzel })
  if (grund)
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: grund } }))
}
