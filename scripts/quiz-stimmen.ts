// Erzeugt die Sprecher-Aufnahmen und Geräusche der Quiz-Show über die ElevenLabs-API (docs/plan-quiz.md → „Show“).
// Aufruf: npm run quiz:stimmen                 → fehlende oder geänderte Clips erzeugen
//         npm run quiz:stimmen -- --nur-zeigen → nur zählen, was erzeugt würde (keine Kosten)
// Der Schlüssel steht in .env.local (ELEVENLABS_API_KEY, nie in .env – die ist eingecheckt).
// Beim ersten Lauf entwirft das Skript die beiden Stimmen (Voice Design) und merkt sich ihre IDs in
// public/quiz/audio/manifest.json. Ergebnis: public/quiz/audio/*.mp3 und manifest.json mit Dauer und Wortzeiten.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { QuizDaten } from '../src/quiz/typen.ts'
import { alleClips, GERAEUSCHE, ohneTags, SPRECHER, type Clip, type Sprecher } from '../src/quiz/show/texte.ts'
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
console.log(
  `${clips.length} Clips, davon ${fehlend.length} zu erzeugen (${zeichen} Zeichen ≈ ${zeichen} Credits); ` +
    `${fehlendeGeraeusche.length} von ${GERAEUSCHE.length} Geräuschen.`,
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
console.log('Fertig: public/quiz/audio/')
