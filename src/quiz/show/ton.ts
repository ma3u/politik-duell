import { useSyncExternalStore } from 'react'
import type { ShowManifest } from './manifest'
import { CHOR, ohneTags, type Clip, type Sprecher } from './texte'

// Ton der Quiz-Show: Sprecher-Clips und Geräusche aus public/quiz/audio/ (erzeugt mit `npm run quiz:stimmen`),
// abgespielt über die Web-Audio-API (spielt nach dem ersten Antippen auch auf iPhone und iPad). Ist der Ton aus
// oder fehlt eine Datei, läuft derselbe Zeitplan mit Untertiteln – alle Geräte im Raum bleiben im Takt.
// Die Dateien kommen von der eigenen Website. Gespeichert wird nur die ausdrücklich gewählte Ton-Einstellung
// (an/aus, localStorage), wenn man „Ton einschalten“, „Ohne Ton spielen“ oder den Lautsprecher antippt.

const BASIS = `${import.meta.env.BASE_URL}quiz/audio/`
let manifest: ShowManifest | null = null
let ctx: AudioContext | null = null
let laut: GainNode | null = null
const puffer = new Map<string, AudioBuffer>()
const ladend = new Map<string, Promise<AudioBuffer | null>>()
/** Heruntergeladene, noch nicht dekodierte Dateien – ohne AudioContext möglich, also schon vor dem ersten Tippen. */
const roh = new Map<string, Promise<ArrayBuffer | null>>()

const alleDateien = () =>
  manifest ? [...Object.values(manifest.geraeusche), ...Object.values(manifest.clips)].map((x) => x.datei) : []

function holen(datei: string): Promise<ArrayBuffer | null> {
  let p = roh.get(datei)
  if (!p) {
    p = fetch(`${BASIS}${datei}`)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null)
    roh.set(datei, p)
  }
  return p
}

// Startmusik als gestreamtes <audio>: Sie spielt, sobald die ersten Sekunden da sind, statt auf das Herunterladen
// und Dekodieren der ganzen Datei zu warten. Der Dateiname ist fest (npm run quiz:stimmen), so kann das Element
// schon vor dem Manifest puffern. Klappt es nicht (Datei fehlt, Safari aus dem Service-Worker-Cache), spielt die
// Startmelodie wie bisher über die Web-Audio-API.
const STARTMUSIK_DATEI = 'klang-startmusik.mp3'
let musik: HTMLAudioElement | null = null
let musikGeht = true
let musikBereit: Promise<void> = Promise.resolve()

function startmusikVorladen() {
  if (musik || typeof Audio === 'undefined') return
  const el = new Audio(`${BASIS}${STARTMUSIK_DATEI}`)
  el.preload = 'auto'
  el.muted = !tonAn
  el.addEventListener('ended', () => (melodieLaeuft = false))
  el.addEventListener('playing', freigeben)
  el.addEventListener('error', () => (musikGeht = false))
  musikBereit = new Promise((ok) => {
    for (const art of ['canplaythrough', 'error'] as const) el.addEventListener(art, () => ok(), { once: true })
    setTimeout(ok, 4000)
  })
  musik = el
}

/**
 * Lädt das Manifest (Dauer und Wortzeiten) und alle Aufnahmen und Geräusche (ca. 3 MB) – sonst käme der Ton erst
 * Sekunden nach dem Start. Die Startmusik puffert zuerst, der Rest folgt, wenn sie spielbereit ist (höchstens 4 s),
 * damit sie nicht mit dem ganzen Show-Ton um die Leitung konkurriert. Ohne Manifest gibt es nur Untertitel.
 */
export async function ladeShow(): Promise<void> {
  startmusikVorladen()
  try {
    const r = await fetch(`${BASIS}manifest.json`)
    if (r.ok && r.headers.get('content-type')?.includes('json')) manifest = (await r.json()) as ShowManifest
  } catch {
    manifest = null
  }
  // Nicht abwarten: Die Startseite erscheint sofort, der übrige Ton lädt im Hintergrund nach.
  void musikBereit.then(() => {
    for (const d of alleDateien()) void holen(d)
  })
}

type AudioNavigator = Navigator & { audioSession?: { type: string } }
type AudioFenster = Window & { webkitAudioContext?: typeof AudioContext }

/** Bei jeder Berührung: eine angehaltene Wiedergabe wieder starten (iOS hält sie nach Sperre oder Anruf an). */
function aufwecken() {
  if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => {})
}

/**
 * Muss in einer Nutzeraktion (Tippen, Klick) aufgerufen werden, sonst bleibt der Ton gesperrt. Auf iPhone/iPad:
 * Sitzungstyp „playback“, damit der Ton auch bei Stummschalter spielt (wie ein Video, Safari 17+), und ein
 * stiller Mini-Ton, der ältere Versionen freischaltet.
 */
export function entsperren() {
  const AC = window.AudioContext ?? (window as AudioFenster).webkitAudioContext
  if (!AC) return
  const nav = navigator as AudioNavigator
  try {
    if (nav.audioSession) nav.audioSession.type = 'playback'
  } catch {
    // ältere Browser
  }
  if (!ctx) {
    ctx = new AC()
    const c = ctx
    c.addEventListener('statechange', () => c.state === 'running' && freigeben())
    laut = ctx.createGain()
    laut.gain.value = tonAn ? 1 : 0
    laut.connect(ctx.destination)
    for (const art of ['pointerdown', 'touchend', 'keydown'] as const) addEventListener(art, aufwecken, { capture: true, passive: true })
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && aufwecken())
  }
  aufwecken()
  // Alles schon Heruntergeladene jetzt dekodieren (geht nur mit AudioContext).
  for (const d of alleDateien()) laden(d)
  try {
    const q = ctx.createBufferSource()
    q.buffer = ctx.createBuffer(1, 1, 22050)
    q.connect(ctx.destination)
    q.start(0)
  } catch {
    // ohne Ton weiter
  }
}

function laden(datei: string): Promise<AudioBuffer | null> {
  const fertig = puffer.get(datei)
  if (fertig) return Promise.resolve(fertig)
  if (!ctx) return Promise.resolve(null)
  let p = ladend.get(datei)
  if (!p) {
    const c = ctx
    p = holen(datei)
      // Kopie: decodeAudioData übernimmt den Speicher, die Rohdaten bleiben für einen neuen Versuch.
      .then((b) => (b ? c.decodeAudioData(b.slice(0)) : null))
      .then((b) => (b && puffer.set(datei, b), b))
      .catch(() => null)
      .finally(() => ladend.delete(datei))
    ladend.set(datei, p)
  }
  return p
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

function abspielen(datei: string | undefined, wann = 0, ziel: AudioNode | null = laut): AudioBufferSourceNode | null {
  const b = datei ? puffer.get(datei) : undefined
  if (!ctx || !ziel || !b) return null
  const q = ctx.createBufferSource()
  q.buffer = b
  q.connect(ziel)
  q.start(wann)
  return q
}

/** Wann der Chor in der Startmelodie „Politik-Duell!“ ruft (Sekunden nach Beginn des Beats). */
const CHOR_EINSAETZE = [0.9, 3.0, 5.6]
let melodieLaeuft = false
let melodie: { lautstaerke: GainNode; quellen: AudioBufferSourceNode[] } | null = null

/**
 * Startmelodie: die Startmusik, gestreamt (spielt sofort, ohne auf die ganze Datei zu warten), oder – geht das nicht –
 * über die Web-Audio-API die Startmusik bzw. Beat mit Sprechchor beider Moderatoren: wartet dann kurz, bis die Dateien
 * dekodiert sind, und plant alles auf der Uhr des AudioContext, damit der Chor auf dem Beat sitzt. Muss in einer
 * Nutzeraktion starten (ruft entsperren auf). Spielt nicht doppelt, wenn sie schon läuft.
 */
export async function startmelodie(): Promise<boolean> {
  startmusikVorladen()
  entsperren()
  if (!tonAn || melodieLaeuft) return false
  // Gestreamte Startmusik: play() noch in der Nutzeraktion, vor dem ersten await (sonst sperrt Safari).
  if (musik && musikGeht) {
    melodieLaeuft = true
    musik.currentTime = 0
    musik.volume = 1
    musik.muted = false
    try {
      await musik.play()
      return true
    } catch (e) {
      melodieLaeuft = false
      // Gesperrt (keine Nutzeraktion): später über „Ton einschalten“. Sonst geht das Streamen nicht – Web-Audio versuchen.
      if (e instanceof DOMException && e.name === 'NotAllowedError') return false
      musikGeht = false
    }
  }
  if (!ctx || !manifest || !tonAn || melodieLaeuft) return false
  // Bevorzugt die Startmusik (Music-API); sonst Beat mit Sprechchor.
  const musikDatei = manifest.geraeusche.startmusik?.datei
  const beat = musikDatei ?? manifest.geraeusche.startbeat?.datei
  const stimmen = musikDatei ? [] : CHOR.map((c) => manifest!.clips[c.id]?.datei)
  if (!beat) return false
  melodieLaeuft = true
  const bereit = await Promise.race([
    Promise.all([beat, ...stimmen].map((d) => (d ? laden(d) : Promise.resolve(null)))),
    new Promise<null>((ok) => setTimeout(() => ok(null), 2500)),
  ])
  if (!bereit) {
    melodieLaeuft = false
    return false
  }
  if (!melodieLaeuft || !laut) return false // inzwischen abgebrochen (Spiel gestartet)
  const t0 = ctx.currentTime + 0.05
  const lautstaerke = ctx.createGain()
  lautstaerke.connect(laut)
  const q = abspielen(beat, t0, lautstaerke)
  const quellen = [q, ...CHOR_EINSAETZE.flatMap((e) => stimmen.map((d) => abspielen(d, t0 + e, lautstaerke)))].filter(
    (x): x is AudioBufferSourceNode => !!x,
  )
  melodie = { lautstaerke, quellen }
  if (q) q.onended = () => ((melodieLaeuft = false), (melodie = null))
  else melodieLaeuft = false
  return !!q && ctx.state === 'running'
}

/** Startmelodie sanft ausblenden – etwa wenn das Spiel beginnt und die Show ihren eigenen Jingle spielt. */
export function melodieStoppen() {
  melodieLaeuft = false
  if (musik && !musik.paused) {
    // Ausblenden in einer halben Sekunde (auf iPhone/iPad ist die Lautstärke fest – dort endet sie nach 0,5 s).
    const el = musik
    const beginn = performance.now()
    const schritt = () => {
      const t = (performance.now() - beginn) / 500
      if (t >= 1) {
        el.pause()
        el.volume = 1
        return
      }
      el.volume = 1 - t
      requestAnimationFrame(schritt)
    }
    requestAnimationFrame(schritt)
  }
  if (!melodie || !ctx) return
  const { lautstaerke, quellen } = melodie
  lautstaerke.gain.setTargetAtTime(0, ctx.currentTime, 0.12)
  for (const q of quellen) q.stop(ctx.currentTime + 0.6)
  melodie = null
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

// ---- Ton an/aus (WCAG 1.4.2) ----
// Die Wahl bleibt nur, wenn man sie ausdrücklich trifft („Ton einschalten“, „Ohne Ton spielen“, Lautsprecher) –
// § 25 Abs. 2 Nr. 2 TDDDG. Ohne Wahl ist der Ton an, spielt aber erst nach der ersten Nutzeraktion (Browser).
const WAHL = 'politik-duell-ton'
export function gemerkteTonWahl(): 'an' | 'aus' | null {
  try {
    const w = localStorage.getItem(WAHL)
    return w === 'an' || w === 'aus' ? w : null
  } catch {
    return null
  }
}
export function tonWahlMerken(an: boolean) {
  try {
    localStorage.setItem(WAHL, an ? 'an' : 'aus')
  } catch {
    // privater Modus o. Ä.: gilt dann nur für diesen Besuch
  }
}

let tonAn = gemerkteTonWahl() !== 'aus'
/** Hat der Browser den Ton in diesem Besuch freigegeben (Musik spielt oder Audio-Kontext läuft)? */
let frei = false
const tonHoerer = new Set<() => void>()
function freigeben() {
  if (frei) return
  frei = true
  tonHoerer.forEach((h) => h())
}
export function setzeTon(an: boolean) {
  tonAn = an
  if (laut && ctx) laut.gain.setTargetAtTime(an ? 1 : 0, ctx.currentTime, 0.02)
  if (musik) musik.muted = !an
  tonHoerer.forEach((h) => h())
}
export const tonIstAn = () => tonAn
const tonAbo = (h: () => void) => (tonHoerer.add(h), () => tonHoerer.delete(h))
export const useTon = () => useSyncExternalStore(tonAbo, () => tonAn)
export const useTonFrei = () => useSyncExternalStore(tonAbo, () => frei)
