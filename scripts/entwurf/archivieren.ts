// Sichert die Protokolle eines Durchgangs im Repository, damit „jeder Eingriff steht im Protokoll“ auch
// nach dem Ende des Containers belegbar bleibt: daten/protokolle/<ID>/<Datum>-<Ebene>/ mit Erfassung,
// Ständen, Kennungen, bewerteter Blindliste, Bewertung, protokoll/ und pr-daten.md.
// Nicht kopiert werden Programmtexte (texte/) und Aufträge (auftraege/, enthalten lange Programmauszüge) –
// sie sind urheberrechtlich geschützt und lassen sich aus dem Programm neu erzeugen.
// Aufruf: npm run entwurf:archivieren -- <erfassung.json> [--name <Bezeichnung>] [--datum JJJJ-MM-TT]
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { leseErfassung } from './erfassung-datei.ts'

const args = process.argv.slice(2)
const wert = (n: string) => {
  const i = args.indexOf(n)
  return i >= 0 ? args.splice(i, 2)[1] : undefined
}
const nameArg = wert('--name')
const datum = wert('--datum') ?? new Date().toISOString().slice(0, 10)
const [pfad, ...rest] = args
if (!pfad || rest.length || !/^\d{4}-\d{2}-\d{2}$/.test(datum) || (nameArg !== undefined && !/^[a-z0-9-]+$/i.test(nameArg))) {
  console.error('Aufruf: npm run entwurf:archivieren -- <erfassung.json> [--name <Bezeichnung>] [--datum JJJJ-MM-TT]')
  process.exit(1)
}
const ordner = join(pfad, '..')
const erfassung = leseErfassung(pfad)
const laender = [...new Set(erfassung.programme.map((p) => p.land).filter((l): l is string => !!l))].sort()
const bund = erfassung.programme.some((p) => !p.land)
const name = nameArg ?? [bund ? 'bund' : '', laender.length ? `land-${laender.join('-')}` : ''].filter(Boolean).join('-')
const ziel = fileURLToPath(new URL(`../../daten/protokolle/${erfassung.thema_id}/${datum}-${name}/`, import.meta.url))
if (existsSync(ziel)) {
  console.error(`${ziel} gibt es schon – mit --name eine andere Bezeichnung wählen`)
  process.exit(1)
}
// Nur diese Dateien und Ordner; alles andere im Arbeitsordner bleibt draußen.
const dateien = ['erfassung.json', 'kennungen.json', 'blind.json', 'bewertung.json', 'pr-daten.md', 'ohne-buendel.txt', 'treffer.txt']
const ordnerListe = ['protokoll', 'staende']
let groesse = 0
let anzahl = 0
const kopiere = (von: string, nach: string) => {
  mkdirSync(join(nach, '..'), { recursive: true })
  copyFileSync(von, nach)
  groesse += statSync(von).size
  anzahl++
}
for (const d of dateien) if (existsSync(join(ordner, d))) kopiere(join(ordner, d), join(ziel, d))
for (const o of ordnerListe)
  if (existsSync(join(ordner, o)))
    for (const d of readdirSync(join(ordner, o)))
      // Archivierte Zwischenlisten (blind-<Prüfsumme>.json) sind aus Erfassung und Kennungen nachvollziehbar; die bewertete Liste liegt als blind.json bei.
      if (!/^blind-[0-9a-f]+\.json$/.test(d)) kopiere(join(ordner, o, d), join(ziel, o, d))
console.log(`${anzahl} Dateien (${Math.round(groesse / 1024)} KB) nach ${ziel} kopiert – mit dem Pull Request committen.`)
