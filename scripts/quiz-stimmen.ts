// Erzeugt die Sprecher-Aufnahmen und Geräusche der Quiz-Show über die ElevenLabs-API (docs/plan-quiz.md → „Show“).
// Aufruf: npm run quiz:stimmen                 → fehlende oder geänderte Clips erzeugen
//         npm run quiz:stimmen -- --nur-zeigen → nur zählen, was erzeugt würde (keine Kosten)
// Der Schlüssel steht in .env.local (ELEVENLABS_API_KEY, nie in .env – die ist eingecheckt).
// Beim ersten Lauf entwirft das Skript die beiden Stimmen (Voice Design) und merkt sich ihre IDs in
// public/quiz/audio/manifest.json. Ergebnis: public/quiz/audio/*.mp3 und manifest.json mit Dauer und Wortzeiten.
// Für die Startmusik braucht es ffmpeg und ffprobe (mischt den Ruf über den Song).
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { QuizDaten } from '../src/quiz/typen.ts'
import { alleClips, CHOR, GERAEUSCHE, ohneTags, SPRECHER, STARTMUSIK, type Clip, type Sprecher } from '../src/quiz/show/texte.ts'
import type { ShowManifest } from '../src/quiz/show/manifest.ts'

const API = 'https://api.elevenlabs.io/v1'
const MODELL = 'eleven_v3'
const FORMAT = 'mp3_44100_64'
const ordner = new URL('../public/quiz/audio/', import.meta.url)
const manifestDatei = new URL('manifest.json', ordner)
const nurZeigen = process.argv.includes('--nur-zeigen')

function schluessel(): string {
  for (const datei of ['../.env.local']) {
    const pfad = new URL(datei, import.meta.url)
    if (!existsSync(pfad)) continue
    const zeile = readFileSync(pfad, 'utf8').split('\n').find((z) => z.startsWith('ELEVENLABS_API_KEY='))
    if (zeile) return zeile.slice('ELEVENLABS_API_KEY='.length).trim()
  }
  return process.env.ELEVENLABS_API_KEY ?? ''
}

const KEY = schluessel()
if (!KEY && !nurZeigen) {
  console.error('Kein ELEVENLABS_API_KEY in .env.local.')
  process.exit(1)
}

async function api(pfad: string, body: unknown): Promise<Response> {
  for (let versuch = 1; ; versuch++) {
    const r = await fetch(`${API}${pfad}`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (r.ok) return r
    const text = await r.text()
    if ((r.status === 429 || r.status >= 500) && versuch < 4) {
      await new Promise((ok) => setTimeout(ok, 2000 * versuch))
      continue
    }
    throw new Error(`${pfad}: ${r.status} ${text.slice(0, 300)}`)
  }
}

const hash = (...teile: unknown[]) => createHash('sha256').update(JSON.stringify(teile)).digest('hex').slice(0, 12)

// Fragen: die Fassung mit Entwürfen enthält alle (auch die geprüften).
const fragenDatei = new URL('../public/quiz/fragen-entwurf.json', import.meta.url)
const quelle = existsSync(fragenDatei) ? fragenDatei : new URL('../public/quiz/fragen.json', import.meta.url)
const daten = JSON.parse(readFileSync(quelle, 'utf8')) as QuizDaten
const clips = alleClips(daten.fragen, daten.parteien)

mkdirSync(ordner, { recursive: true })
const manifest: ShowManifest = existsSync(manifestDatei)
  ? (JSON.parse(readFileSync(manifestDatei, 'utf8')) as ShowManifest)
  : { stimmen: { mara: '', ben: '' }, clips: {}, geraeusche: {} }
const speichern = () => writeFileSync(manifestDatei, `${JSON.stringify(manifest, null, 1)}\n`)

// ---- Stimmen entwerfen (einmalig) ----
async function stimmeEntwerfen(s: Sprecher): Promise<string> {
  const { beschreibung, probe, name } = SPRECHER[s]
  console.log(`Entwerfe Stimme ${name} …`)
  const entwurf = (await (
    await api('/text-to-voice/design', { voice_description: beschreibung, text: probe, model_id: 'eleven_ttv_v3' })
  ).json()) as { previews: { generated_voice_id: string; audio_base_64: string }[] }
  const erste = entwurf.previews[0]
  writeFileSync(new URL(`probe-${s}.mp3`, new URL('../.cache/', import.meta.url)), Buffer.from(erste.audio_base_64, 'base64'))
  const stimme = (await (
    await api('/text-to-voice', {
      voice_name: `Politik-Duell – ${name}`,
      voice_description: beschreibung,
      generated_voice_id: erste.generated_voice_id,
    })
  ).json()) as { voice_id: string }
  return stimme.voice_id
}

// ---- Wortzeiten aus der Zeichen-Ausrichtung ----
interface Ausrichtung {
  characters: string[]
  character_start_times_seconds: number[]
  character_end_times_seconds: number[]
}

/** Startzeit jedes Worts des Untertitels (ohne Tags), in Sekunden. */
function wortzeiten(text: string, a: Ausrichtung): number[] {
  const zeiten: number[] = []
  for (const m of text.matchAll(/\S+/g)) {
    if (/^\[[^\]]*\]$/.test(m[0])) continue
    zeiten.push(Math.round((a.character_start_times_seconds[m.index] ?? 0) * 1000) / 1000)
  }
  return zeiten
}

let zeichen = 0
let erzeugt = 0
const fehlend: Clip[] = []
for (const c of clips) {
  const stimme = manifest.stimmen[c.sprecher]
  const h = hash(MODELL, c.sprecher, c.text, SPRECHER[c.sprecher].beschreibung)
  const alt = manifest.clips[c.id]
  if (alt?.hash === h && existsSync(new URL(alt.datei, ordner)) && stimme) continue
  fehlend.push(c)
  zeichen += c.text.length
}
const fehlendeGeraeusche = GERAEUSCHE.filter((g) => {
  const alt = manifest.geraeusche[g.id]
  return !(alt?.hash === hash(g) && existsSync(new URL(alt.datei, ordner)))
})
// Startmusik: der Song der Music-API liegt als Quelle in scripts/quiz-audio/; ausgeliefert wird die Mischung mit dem
// Ruf CHOR (ffmpeg). MISCHUNG erhöhen, wenn sich das Mischen ändert.
const MISCHUNG = 6
const instrumental = new URL('./quiz-audio/startmusik-song.mp3', import.meta.url)
const instrumentalHash = new URL('./quiz-audio/startmusik-song.hash', import.meta.url)
const musikFehlt = !(existsSync(instrumental) && existsSync(instrumentalHash) && readFileSync(instrumentalHash, 'utf8').trim() === hash(STARTMUSIK))
const mischHash = () => hash(MISCHUNG, readFileSync(instrumentalHash, 'utf8').trim(), CHOR.map((c) => manifest.clips[c.id]?.hash))
const musikAlt = manifest.geraeusche[STARTMUSIK.id]
console.log(
  `${clips.length} Clips, davon ${fehlend.length} zu erzeugen (${zeichen} Zeichen ≈ ${zeichen} Credits); ` +
    `${fehlendeGeraeusche.length} von ${GERAEUSCHE.length} Geräuschen; Startmusik ${musikFehlt ? 'zu erzeugen' : 'vorhanden'}` +
    `${!musikFehlt && musikAlt?.hash !== mischHash() ? ', neu zu mischen' : ''}.`,
)
if (nurZeigen) process.exit(0)

mkdirSync(new URL('../.cache/', import.meta.url), { recursive: true })
for (const s of ['mara', 'ben'] as const) {
  if (!manifest.stimmen[s]) {
    manifest.stimmen[s] = await stimmeEntwerfen(s)
    speichern()
  }
}

for (const c of fehlend) {
  const r = await api(`/text-to-speech/${manifest.stimmen[c.sprecher]}/with-timestamps?output_format=${FORMAT}`, {
    text: c.text,
    model_id: MODELL,
    language_code: 'de',
  })
  const antwort = (await r.json()) as { audio_base64: string; alignment: Ausrichtung }
  const datei = `${c.id}.mp3`
  writeFileSync(new URL(datei, ordner), Buffer.from(antwort.audio_base64, 'base64'))
  const ende = antwort.alignment.character_end_times_seconds.at(-1) ?? 0
  manifest.clips[c.id] = {
    datei,
    sprecher: c.sprecher,
    text: ohneTags(c.text),
    dauer: Math.round(ende * 1000) / 1000,
    woerter: wortzeiten(c.text, antwort.alignment),
    hash: hash(MODELL, c.sprecher, c.text, SPRECHER[c.sprecher].beschreibung),
  }
  speichern()
  erzeugt++
  process.stdout.write(`\r${erzeugt}/${fehlend.length} ${c.id.padEnd(30)}`)
}
if (fehlend.length) console.log()

for (const g of fehlendeGeraeusche) {
  const r = await api(`/sound-generation?output_format=mp3_44100_128`, {
    text: g.beschreibung,
    duration_seconds: g.sekunden,
    prompt_influence: 0.5,
  })
  const datei = `klang-${g.id}.mp3`
  writeFileSync(new URL(datei, ordner), Buffer.from(await r.arrayBuffer()))
  manifest.geraeusche[g.id] = { datei, dauer: g.sekunden, hash: hash(g) }
  speichern()
  console.log(`Geräusch ${g.id}`)
}
if (musikFehlt) {
  // Music-API (Musik mit Gesang; der Schlüssel braucht die Berechtigung „Music Generation“).
  const r = await api(`/music?output_format=mp3_44100_128`, {
    prompt: STARTMUSIK.beschreibung,
    music_length_ms: STARTMUSIK.sekunden * 1000,
    model_id: 'music_v1',
  })
  mkdirSync(new URL('./quiz-audio/', import.meta.url), { recursive: true })
  writeFileSync(instrumental, Buffer.from(await r.arrayBuffer()))
  writeFileSync(instrumentalHash, `${hash(STARTMUSIK)}\n`)
  console.log('Startmusik (Song)')
}
if (musikFehlt || manifest.geraeusche[STARTMUSIK.id]?.hash !== mischHash()) {
  const datei = `klang-${STARTMUSIK.id}.mp3`
  const dauer = startmusikMischen(new URL(datei, ordner))
  manifest.geraeusche[STARTMUSIK.id] = { datei, dauer, hash: mischHash() }
  speichern()
  console.log(`Startmusik gemischt (${dauer} s)`)
}
console.log('Fertig: public/quiz/audio/')

// ---- Startmusik mischen: Ruf beider Moderatoren im Takt über das Instrumental ----

function pfad(u: URL): string {
  return decodeURIComponent(u.pathname)
}

/** Tempo und erster Schlag aus der Lautstärke-Hüllkurve (Anstiege), per Autokorrelation – ohne Zusatzpakete. */
function takt(datei: URL): { schlag: number; erster: number; dauer: number } {
  const rate = 11025
  const roh = execFileSync('ffmpeg', ['-v', 'error', '-i', pfad(datei), '-ac', '1', '-ar', String(rate), '-f', 'f32le', '-'], {
    maxBuffer: 64 * 1024 * 1024,
  })
  const x = new Float32Array(roh.buffer, roh.byteOffset, Math.floor(roh.byteLength / 4))
  const hop = 128
  const n = Math.floor(x.length / hop)
  const energie = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let e = 0
    for (let j = i * hop; j < (i + 1) * hop; j++) e += x[j] * x[j]
    energie[i] = Math.log1p(1000 * e)
  }
  const anstieg = new Float64Array(n)
  for (let i = 1; i < n; i++) anstieg[i] = Math.max(0, energie[i] - energie[i - 1])
  // Mittelwert abziehen, sonst gewinnt bei der Autokorrelation die kürzeste Verschiebung (höchstes Tempo).
  const mittel = anstieg.reduce((a, b) => a + b, 0) / n
  const zentriert = anstieg.map((v) => v - mittel)
  const fps = rate / hop
  let besteLag = 0
  let besterWert = -1
  for (let bpm = 70; bpm <= 200; bpm += 0.25) {
    const lag = (60 / bpm) * fps
    let summe = 0
    for (let i = 0; i + lag + 1 < n; i++) {
      const k = Math.floor(i + lag)
      const f = i + lag - k
      summe += zentriert[i] * (zentriert[k] * (1 - f) + zentriert[k + 1] * f)
    }
    if (summe > besterWert) {
      besterWert = summe
      besteLag = lag
    }
  }
  let bestePhase = 0
  besterWert = -1
  for (let p = 0; p < besteLag; p++) {
    let summe = 0
    for (let t = p; t < n; t += besteLag) summe += anstieg[Math.round(t)] ?? 0
    if (summe > besterWert) {
      besterWert = summe
      bestePhase = p
    }
  }
  return { schlag: besteLag / fps, erster: bestePhase / fps, dauer: x.length / rate }
}

function dauerVon(datei: URL): number {
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', pfad(datei)]).toString().trim())
}

/** Mischt den Ruf auf die Taktanfänge (Mara, Ben, dann beide), senkt den Song darunter leicht ab und gleicht die Lautheit an. */
function startmusikMischen(ziel: URL): number {
  const t = takt(instrumental)
  const takt4 = 4 * t.schlag
  // Stille vor und nach dem Ruf abschneiden (er fällt so auf den Schlag) und beide Rufe auf 90 % eines Takts
  // strecken (Tonhöhe bleibt) – so passt jeder in einen Takt, und beide Stimmen rufen im Gleichtakt.
  mkdirSync(new URL('../.cache/', import.meta.url), { recursive: true })
  const ruf = Math.round(0.9 * takt4 * 1000) / 1000
  const ab = 'silenceremove=start_periods=1:start_threshold=-38dB:start_silence=0.02'
  const [mara, ben] = CHOR.map((c) => {
    const roh = new URL(`../.cache/ruf-${c.sprecher}-roh.wav`, import.meta.url)
    const aus = new URL(`../.cache/ruf-${c.sprecher}.wav`, import.meta.url)
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', pfad(new URL(manifest.clips[c.id].datei, ordner)), '-af', `${ab},areverse,${ab},areverse`, pfad(roh)])
    const tempo = Math.min(2, Math.max(0.5, dauerVon(roh) / ruf))
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', pfad(roh), '-af', `atempo=${tempo.toFixed(4)}`, pfad(aus)])
    return aus
  })
  const einsaetze: number[] = []
  for (let z = t.erster + takt4; z + ruf < t.dauer - 0.2; z += takt4) einsaetze.push(z)
  const stimmen = einsaetze.flatMap((z, i) =>
    i === 0 ? [{ datei: mara, z }] : i === 1 ? [{ datei: ben, z }] : [{ datei: mara, z }, { datei: ben, z }],
  )
  const eingaben = ['-i', pfad(instrumental), ...stimmen.flatMap((s) => ['-i', pfad(s.datei)])]
  const teile = stimmen.map(
    (s, i) => `[${i + 1}]aformat=sample_rates=44100:channel_layouts=stereo,adelay=delays=${Math.round(s.z * 1000)}:all=1,volume=1.8[v${i}]`,
  )
  const filter = [
    ...teile,
    `${stimmen.map((_, i) => `[v${i}]`).join('')}amix=inputs=${stimmen.length}:normalize=0:duration=longest,apad=whole_dur=${t.dauer}[ruf]`,
    '[ruf]asplit=2[ruf1][ruf2]',
    '[0]aformat=sample_rates=44100:channel_layouts=stereo[musik]',
    '[musik][ruf1]sidechaincompress=threshold=0.05:ratio=3:attack=10:release=250[geduckt]',
    '[geduckt][ruf2]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[aus]',
  ].join(';')
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...eingaben, '-filter_complex', filter, '-map', '[aus]', '-ar', '44100', '-b:a', '128k', pfad(ziel)])
  console.log(
    `Takt: ${(60 / t.schlag).toFixed(1)} BPM, erster Schlag ${t.erster.toFixed(2)} s; Ruf ${ruf.toFixed(2)} s, Einsätze bei ${einsaetze.map((z) => z.toFixed(2)).join(', ')} s`,
  )
  return Math.round(dauerVon(ziel) * 1000) / 1000
}
