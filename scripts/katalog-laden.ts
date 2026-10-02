// Lädt den Datenkatalog aus `daten/` für Node-Skripte (Seed, Prüfung, Tests).
// Die App lädt dieselben Dateien über Vite (src/data/mock.ts).
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { pruefeKatalog, type Datei, type Pruefergebnis } from '../src/data/katalog.ts'

const WURZEL = new URL('../', import.meta.url)

/** Woher die Dateien kommen: Arbeitsverzeichnis oder ein Git-Stand (etwa der Zielzweig eines Pull Requests). */
interface Quelle {
  themen(): string[]
  /** Übernommene Exporte der Prüfenden (daten/pruefungen/); fehlt der Ordner, eine leere Liste. */
  pruefungen(): string[]
  lesen(pfad: string): string
}

const arbeitsverzeichnis: Quelle = {
  themen: () => readdirSync(new URL('daten/themen/', WURZEL)),
  pruefungen: () => (existsSync(new URL('daten/pruefungen/', WURZEL)) ? readdirSync(new URL('daten/pruefungen/', WURZEL)) : []),
  lesen: (pfad) => readFileSync(new URL(pfad, WURZEL), 'utf8'),
}

/** Dateien aus einem Git-Stand, z. B. „origin/main“. */
export function gitStand(ref: string): Quelle {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: WURZEL, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
  return {
    themen: () => git('ls-tree', '--name-only', `${ref}:daten/themen/`).split('\n').filter(Boolean),
    pruefungen: () => {
      try {
        return git('ls-tree', '--name-only', `${ref}:daten/pruefungen/`).split('\n').filter(Boolean)
      } catch {
        return []
      }
    },
    lesen: (pfad) => git('show', `${ref}:${pfad}`),
  }
}

export function pruefeDatenordner(quelle: Quelle = arbeitsverzeichnis): Pruefergebnis {
  const pfade = [
    'daten/parteien.json',
    ...quelle
      .themen()
      .filter((d) => d.endsWith('.json'))
      .sort()
      .map((d) => `daten/themen/${d}`),
  ]
  const dateien: Datei[] = []
  const syntaxfehler: string[] = []
  for (const pfad of pfade) {
    try {
      dateien.push({ pfad, inhalt: JSON.parse(quelle.lesen(pfad)) })
    } catch (e) {
      syntaxfehler.push(`${pfad}: kein gültiges JSON – ${e instanceof Error ? e.message : e}`)
    }
  }
  // Liste stillgelegter IDs; ältere Stände haben sie noch nicht.
  let ids: Datei | undefined
  try {
    ids = { pfad: 'daten/ids.json', inhalt: JSON.parse(quelle.lesen('daten/ids.json')) }
  } catch (e) {
    if (quelle === arbeitsverzeichnis) syntaxfehler.push(`daten/ids.json: nicht lesbar – ${e instanceof Error ? e.message : e}`)
  }
  const pruefungen: Datei[] = []
  for (const d of quelle.pruefungen().filter((x) => x.endsWith('.json')).sort()) {
    const pfad = `daten/pruefungen/${d}`
    try {
      pruefungen.push({ pfad, inhalt: JSON.parse(quelle.lesen(pfad)) })
    } catch (e) {
      syntaxfehler.push(`${pfad}: kein gültiges JSON – ${e instanceof Error ? e.message : e}`)
    }
  }
  if (syntaxfehler.length) return { ...pruefeKatalog({ pfad: '', inhalt: null }, []), fehler: syntaxfehler, warnungen: [] }
  return pruefeKatalog(dateien[0], dateien.slice(1), ids, pruefungen)
}
