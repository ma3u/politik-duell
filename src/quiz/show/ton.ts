import { useSyncExternalStore } from 'react'
import type { ShowManifest } from './manifest'
import { ohneTags, type Clip, type Sprecher } from './texte'

// Ton der Quiz-Show: Sprecher-Clips und Geräusche aus public/quiz/audio/ (erzeugt mit `npm run quiz:stimmen`),
// abgespielt über die Web-Audio-API (spielt nach dem ersten Antippen auch auf iPhone und iPad). Ist der Ton aus
// oder fehlt eine Datei, läuft derselbe Zeitplan mit Untertiteln – alle Geräte im Raum bleiben im Takt.
// Nichts wird gespeichert; die Dateien kommen von der eigenen Website.

const BASIS = `${import.meta.env.BASE_URL}quiz/audio/`
let manifest: ShowManifest | null = null
let ctx: AudioContext | null = null
let laut: GainNode | null = null
const puffer = new Map<string, AudioBuffer>()
const ladend = new Set<string>()

/** Lädt das Manifest (Dauer und Wortzeiten). Ohne Manifest gibt es nur Untertitel mit geschätzter Dauer. */
export async function ladeShow(): Promise<void> {
  try {
    const r = await fetch(`${BASIS}manifest.json`)
    if (r.ok && r.headers.get('content-type')?.includes('json')) manifest = (await r.json()) as ShowManifest
  } catch {
    manifest = null
  }
}

/** Muss in einer Nutzeraktion (Klick) aufgerufen werden, sonst bleibt der Ton gesperrt. */
export function entsperren() {
  if (typeof AudioContext === 'undefined') return
  if (!ctx) {
    ctx = new AudioContext()
    laut = ctx.createGain()
    laut.gain.value = tonAn ? 1 : 0
    laut.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

function laden(datei: string) {
  if (!ctx || puffer.has(datei) || ladend.has(datei)) return
  ladend.add(datei)
  fetch(`${BASIS}${datei}`)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
    .then((b) => ctx!.decodeAudioData(b))
    .then((b) => puffer.set(datei, b))
    .catch(() => {})
    .finally(() => ladend.delete(datei))
}

/** Clips und Geräusche schon laden, bevor sie gebraucht werden. */
export function vorladen(clips: Clip[], geraeusche: string[] = []) {
  for (const c of clips) {
    const d = manifest?.clips[c.id]?.datei
    if (d) laden(d)
  }
  for (const g of geraeusche) {
    const d = manifest?.geraeusche[g]?.datei
    if (d) laden(d)
  }
}

function abspielen(datei: string | undefined): AudioBufferSourceNode | null {
  const b = datei ? puffer.get(datei) : undefined
  if (!ctx || !laut || !b) return null
  const q = ctx.createBufferSource()
  q.buffer = b
  q.connect(laut)
  q.start()
  return q
}

/** Geräusch abspielen (nicht abwarten). */
export function klang(id: string) {
  abspielen(manifest?.geraeusche[id]?.datei)
}

/** Dauer eines Clips in Millisekunden – aus dem Manifest, sonst geschätzt (gleich auf allen Geräten). */
export function clipMs(c: Clip): number {
  const d = manifest?.clips[c.id]?.dauer
  return Math.round((d ?? Math.max(0.8, ohneTags(c.text).length * 0.065)) * 1000)
}

function wortzeitenMs(c: Clip): number[] {
  const w = manifest?.clips[c.id]?.woerter
  if (w) return w.map((s) => s * 1000)
  const n = ohneTags(c.text).split(/\s+/).length
  const ms = clipMs(c)
  return Array.from({ length: n }, (_, i) => (i * ms) / n)
}

// ---- Untertitel ----
export interface Untertitel {
  sprecher: Sprecher
  woerter: string[]
  /** Bis zu welchem Wort gesprochen ist. */
  wort: number
}
let untertitel: Untertitel | null = null
const hoerer = new Set<() => void>()
const melden = () => hoerer.forEach((h) => h())
const abo = (h: () => void) => (hoerer.add(h), () => hoerer.delete(h))

export const useUntertitel = () => useSyncExternalStore(abo, () => untertitel)

export function untertitelLeeren() {
  untertitel = null
  melden()
}

const warte = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((ok, fehler) => {
    if (signal?.aborted) return fehler(new DOMException('abgebrochen', 'AbortError'))
    const t = setTimeout(ok, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      fehler(new DOMException('abgebrochen', 'AbortError'))
    })
  })

export const pause = warte

/**
 * Spricht einen Clip (oder zeigt ihn nur als Untertitel) und wartet, bis er zu Ende ist. `onWort` meldet jedes
 * gesprochene Wort (Index im Untertitel) – für Animationen im Takt der Sprache.
 */
export async function sprich(
  c: Clip,
  { signal, onWort, bis }: { signal?: AbortSignal; onWort?: (i: number) => void; bis?: number } = {},
) {
  const woerter = ohneTags(c.text).split(/\s+/)
  untertitel = { sprecher: c.sprecher, woerter, wort: -1 }
  melden()
  const quelle = abspielen(manifest?.clips[c.id]?.datei)
  const timer = wortzeitenMs(c).map((ms, i) =>
    setTimeout(() => {
      if (untertitel) untertitel = { ...untertitel, wort: i }
      melden()
      onWort?.(i)
    }, ms),
  )
  try {
    // `bis`: fester Endzeitpunkt (performance.now) – so summieren sich Verzögerungen nicht auf.
    await warte(bis === undefined ? clipMs(c) + 120 : Math.max(0, bis - performance.now()), signal)
  } finally {
    timer.forEach(clearTimeout)
    if (signal?.aborted) quelle?.stop()
  }
}

// ---- Ton an/aus (WCAG 1.4.2): nur im Arbeitsspeicher ----
let tonAn = true
const tonHoerer = new Set<() => void>()
export function setzeTon(an: boolean) {
  tonAn = an
  if (laut && ctx) laut.gain.setTargetAtTime(an ? 1 : 0, ctx.currentTime, 0.02)
  tonHoerer.forEach((h) => h())
}
export const useTon = () =>
  useSyncExternalStore(
    (h) => (tonHoerer.add(h), () => tonHoerer.delete(h)),
    () => tonAn,
  )
