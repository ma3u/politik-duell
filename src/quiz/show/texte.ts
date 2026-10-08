import type { QuizFrage, QuizPartei } from '../typen.ts'

// Sprechertexte der Quiz-Show (docs/plan-quiz.md → „Show“). Zwei erfundene Moderatoren im Dialog: Mara stellt
// Fragen und löst auf, Ben sagt an, erklärt und frotzelt. Frech gegenüber den Spielenden, nie wertend gegenüber
// Parteien (CLAUDE.md → Tonalität): keine Kommentare zu Positionen, keine Seitenhiebe.
// Die Tags in [eckigen Klammern] steuern die Betonung (ElevenLabs eleven_v3) und erscheinen nicht im Untertitel.
// Aus dieser Datei erzeugt `npm run quiz:stimmen` die Aufnahmen; die App zeigt dieselben Texte als Untertitel.

export type Sprecher = 'mara' | 'ben'

export const SPRECHER: Record<Sprecher, { name: string; beschreibung: string; probe: string }> = {
  mara: {
    name: 'Mara',
    beschreibung:
      'Energetic, witty female German game show host in her early thirties. Bright, warm, clear voice with crisp standard German (Hochdeutsch) pronunciation, fast confident delivery, playful and a little cheeky, big smile in the voice. Studio quality, close microphone.',
    probe:
      'Hallo und herzlich willkommen! Ich bin Mara, und heute finden wir gemeinsam heraus, wer wirklich weiß, was in den Wahlprogrammen steht. Seid ihr bereit? Dann los!',
  },
  ben: {
    name: 'Ben',
    beschreibung:
      'Energetic, cheeky male German game show co-host in his thirties. Warm mid-range voice, crisp standard German (Hochdeutsch) pronunciation, quick comedic timing, dry humor, lively and friendly. Studio quality, close microphone.',
    probe:
      'Und ich bin Ben. Ich passe auf, dass hier niemand schummelt – und dass ihr nicht zu lange überlegt. Die Uhr tickt nämlich. Also: Konzentration, Freunde!',
  },
}

export interface Clip {
  id: string
  sprecher: Sprecher
  /** Mit Betonungs-Tags; der Untertitel ist `ohneTags(text)`. */
  text: string
}

export const ohneTags = (t: string) => t.replace(/\[[^\]]*\]\s*/g, '').trim()

/** So werden Parteien gesprochen (Kurzname wie im Spiel). */
const gesprochen = (p: QuizPartei) => p.kurzname

const liste = (namen: string[]) => (namen.length < 2 ? namen.join('') : `${namen.slice(0, -1).join(', ')} und ${namen.at(-1)}`)

// ---- Feste Clips ----

export const INTRO: Clip[] = [
  { id: 'intro-1', sprecher: 'mara', text: '[excited] Willkommen bei „Wer sagt Ja?“ – dem Quiz, das Wahlprogramme endlich unterhaltsam macht!' },
  { id: 'intro-2', sprecher: 'ben', text: '[laughs] Oder zumindest weniger einschläfernd. Ich bin Ben.' },
  { id: 'intro-3', sprecher: 'mara', text: 'Und ich bin Mara. Acht Parteien – und ihr ratet, wer was im Programm stehen hat.' },
  { id: 'intro-4', sprecher: 'ben', text: '[playful] Schnell sein bringt Punkte. Wissen bringt mehr. Los geht’s!' },
]

/** Ansage der Frage nach Position im Spiel; die letzte Frage hat eine eigene. */
export const ANSAGE: Clip[] = [
  { id: 'ansage-1', sprecher: 'ben', text: '[excited] Frage eins!' },
  { id: 'ansage-2', sprecher: 'ben', text: '[excited] Frage zwei!' },
  { id: 'ansage-3', sprecher: 'ben', text: '[excited] Frage drei – Halbzeit!' },
  { id: 'ansage-4', sprecher: 'ben', text: '[excited] Frage vier!' },
  { id: 'ansage-letzte', sprecher: 'ben', text: '[dramatic] Und jetzt … die letzte Frage!' },
]

export const ANLEITUNG: Record<string, Clip> = {
  'einzeln-ja': { id: 'anl-einzeln-ja', sprecher: 'ben', text: '[playful] Nur eine Partei sagt hier klar Ja. Welche?' },
  'mehrfach-ja': { id: 'anl-mehrfach-ja', sprecher: 'ben', text: 'Welche Parteien sagen Ja? Mehrere sind richtig – „teils“ zählt nicht.' },
  'einzeln-nein': { id: 'anl-einzeln-nein', sprecher: 'ben', text: '[playful] Nur eine Partei sagt hier klar Nein. Welche?' },
  'mehrfach-nein': { id: 'anl-mehrfach-nein', sprecher: 'ben', text: 'Welche Parteien sagen Nein? Mehrere sind richtig – „teils“ zählt nicht.' },
}

export const optionenClip = (parteien: QuizPartei[]): Clip => ({
  id: 'optionen',
  sprecher: 'ben',
  text: `Zur Auswahl: ${liste(parteien.map(gesprochen))}.`,
})

export const LOS: Clip[] = [
  { id: 'los-1', sprecher: 'ben', text: '[excited] Und … los!' },
  { id: 'los-2', sprecher: 'ben', text: '[excited] Zeit läuft!' },
  { id: 'los-3', sprecher: 'ben', text: '[excited] Los geht’s!' },
]

export const COUNTDOWN: Clip = { id: 'countdown', sprecher: 'ben', text: '[whispers] Fünf Sekunden …' }

export const SPANNUNG: Clip[] = [
  { id: 'spannung-1', sprecher: 'mara', text: '[curious] Schauen wir ins Kleingedruckte …' },
  { id: 'spannung-2', sprecher: 'mara', text: 'Und die Programme sagen …' },
  { id: 'spannung-3', sprecher: 'mara', text: '[dramatic] Trommelwirbel, bitte …' },
  { id: 'spannung-4', sprecher: 'mara', text: '[curious] Mal sehen, was wirklich drinsteht …' },
]

export type Reaktion = 'richtig' | 'teils' | 'falsch' | 'keine'

export const REAKTION: Record<Reaktion, Clip[]> = {
  richtig: [
    { id: 'richtig-1', sprecher: 'ben', text: '[excited] Volltreffer! Hast du heimlich die Programme gelesen?' },
    { id: 'richtig-2', sprecher: 'mara', text: 'Richtig! Da hat jemand gut aufgepasst.' },
    { id: 'richtig-3', sprecher: 'ben', text: '[laughs] Treffer! Ich bin fast ein bisschen neidisch.' },
  ],
  teils: [
    { id: 'teils-1', sprecher: 'ben', text: 'Halb richtig ist auch ein bisschen richtig.' },
    { id: 'teils-2', sprecher: 'mara', text: 'Nicht schlecht – aber da fehlt noch was.' },
    { id: 'teils-3', sprecher: 'ben', text: '[playful] Fast! Ein Blick in die Belege hilft.' },
  ],
  falsch: [
    { id: 'falsch-1', sprecher: 'ben', text: '[sighs] Autsch. Aber genau dafür gibt’s die Belege.' },
    { id: 'falsch-2', sprecher: 'mara', text: 'Daneben – kein Drama, jetzt weißt du’s.' },
    { id: 'falsch-3', sprecher: 'ben', text: 'Knapp vorbei ist auch vorbei. Aber hey: wieder was gelernt!' },
  ],
  keine: [
    { id: 'keine-1', sprecher: 'ben', text: '[playful] Hallo? Jemand zu Hause?' },
    { id: 'keine-2', sprecher: 'mara', text: 'Die Zeit ist um – und du hast nur zugeschaut.' },
    { id: 'keine-3', sprecher: 'ben', text: '[laughs] Schweigen ist auch eine Antwort. Aber keine richtige.' },
  ],
}

export type Schluss = 'sieg' | 'niederlage' | 'gleichstand' | 'solo-gut' | 'solo-mittel' | 'solo-schwach'

export const SCHLUSS: Record<Schluss, Clip> = {
  sieg: { id: 'sieg', sprecher: 'mara', text: '[excited] Glückwunsch – du hast gewonnen! Die Wahlprogramme verneigen sich.' },
  niederlage: { id: 'niederlage', sprecher: 'ben', text: 'Nicht gewonnen – aber schlauer als vorher. Und das zählt auch.' },
  gleichstand: { id: 'gleichstand', sprecher: 'mara', text: '[laughs] Gleichstand! Ihr wisst einfach gleich viel. Oder gleich wenig.' },
  'solo-gut': { id: 'solo-gut', sprecher: 'mara', text: '[excited] Wow! Du kennst die Programme richtig gut – Respekt!' },
  'solo-mittel': { id: 'solo-mittel', sprecher: 'ben', text: 'Solide! Mit ein bisschen Nachlesen wird das noch was ganz Großes.' },
  'solo-schwach': { id: 'solo-schwach', sprecher: 'ben', text: '[laughs] Na ja. Aber jetzt weißt du, wo du nachlesen kannst.' },
}

/**
 * Startmelodie: Beat „startbeat“ mit Sprechchor – beide Moderatoren rufen „Politik-Duell!“. Spielt beim ersten
 * Tippen auf der Startseite des Quiz und beim Einschalten des Tons, damit man hört, ob der Ton an ist.
 */
/**
 * Startmusik (bevorzugt, wenn vorhanden): kurzer Party-Elektro-Song mit gesungenem Chor „Politik-Duell!“, erzeugt mit
 * der Music-API von ElevenLabs. Ohne Künstlernamen im Prompt: eigener Stil, keine Nachahmung. Fehlt die Datei, spielt
 * die Startmelodie Beat und CHOR.
 */
export const STARTMUSIK: Geraeusch = {
  id: 'startmusik',
  beschreibung:
    "High-energy German electro-punk party rap anthem intro for a TV quiz show called 'Politik-Duell'. A rowdy group of male and female voices shouts the German chant 'Po-li-tik-Du-ell!' in a stomping call-and-response, over a pounding four-on-the-floor kick, distorted squelchy analog synth bass, cheeky brass stabs and handclaps. Rave energy, ironic and fun, festival crowd vibe. Ends with one final shouted 'Politik-Duell!' and a hard stop.",
  sekunden: 10,
}

export const CHOR: Clip[] = [
  { id: 'chor-mara', sprecher: 'mara', text: '[shouting] Politik-Duell!' },
  { id: 'chor-ben', sprecher: 'ben', text: '[shouting] Politik-Duell!' },
]

export const OUTRO: Clip = { id: 'outro', sprecher: 'mara', text: 'Danke fürs Mitspielen – und denk dran: Versprechen kann jeder!' }

// ---- Clips je Frage ----

export const frageClip = (f: Pick<QuizFrage, 'id' | 'frage'>): Clip => ({ id: `frage-${f.id}`, sprecher: 'mara', text: f.frage })

export function loesungClip(f: Pick<QuizFrage, 'id' | 'art' | 'gesucht' | 'richtig'>, parteien: QuizPartei[]): Clip {
  const namen = f.richtig.map((id) => parteien.find((p) => p.id === id)).filter((p): p is QuizPartei => !!p).map(gesprochen)
  const wort = f.gesucht === 'ja' ? 'Ja' : 'Nein'
  const text = f.art === 'einzeln' ? `Klar ${wort} sagt nur: ${liste(namen)}!` : `${wort} sagen: ${liste(namen)}!`
  return { id: `loesung-${f.id}`, sprecher: 'mara', text: `[excited] ${text}` }
}

/** Alle Clips für die Fragen eines Katalogs (Generator und Prüfung). */
export function alleClips(fragen: QuizFrage[], parteien: QuizPartei[]): Clip[] {
  return [
    ...INTRO,
    ...CHOR,
    ...ANSAGE,
    ...Object.values(ANLEITUNG),
    optionenClip(parteien),
    ...LOS,
    COUNTDOWN,
    ...SPANNUNG,
    ...Object.values(REAKTION).flat(),
    ...Object.values(SCHLUSS),
    OUTRO,
    ...fragen.flatMap((f) => [frageClip(f), loesungClip(f, parteien)]),
  ]
}

// ---- Geräusche ----

export interface Geraeusch {
  id: string
  beschreibung: string
  sekunden: number
}

export const GERAEUSCHE: Geraeusch[] = [
  { id: 'jingle', beschreibung: 'Upbeat punchy TV game show intro jingle, funky brass stab, slap bass and drum fill, bright and energetic', sekunden: 3.5 },
  { id: 'wusch', beschreibung: 'Fast snappy cartoon whoosh swoosh transition', sekunden: 0.7 },
  { id: 'schlag', beschreibung: 'Bold punchy impact hit for a title slamming onto the screen, short and deep', sekunden: 0.8 },
  { id: 'plopp', beschreibung: 'Short bubbly pop click, a button appearing on screen, playful', sekunden: 0.5 },
  { id: 'start', beschreibung: 'Bright game show start buzzer, short', sekunden: 0.8 },
  { id: 'ticken', beschreibung: 'Tense quiz show clock ticking, steady, suspenseful', sekunden: 5 },
  { id: 'trommel', beschreibung: 'Snare drum roll building suspense, ending with a cymbal crash', sekunden: 2.5 },
  { id: 'stempel', beschreibung: 'Rubber stamp thump on paper, short and crisp', sekunden: 0.5 },
  { id: 'richtig', beschreibung: 'Cheerful correct answer chime, game show ding ding, bright', sekunden: 1.2 },
  { id: 'falsch', beschreibung: 'Comedic wrong answer buzzer, game show, short', sekunden: 1 },
  { id: 'sieg', beschreibung: 'Triumphant short victory fanfare with cheering crowd and applause', sekunden: 4 },
  { id: 'niederlage', beschreibung: 'Sad comedic trombone, wah wah wah waaah', sekunden: 2.5 },
  // Grundlage der Startmelodie (siehe CHOR): ausgelassener Party-Elektro-Beat, eigener Stil.
  {
    id: 'startbeat',
    beschreibung:
      'High-energy electro-punk party anthem intro beat, pounding four-on-the-floor kick drum, distorted squelchy analog synth bass riff, cheeky brass stabs, handclaps, rowdy festival crowd cheering, rave energy, ends with a hard stop',
    sekunden: 8,
  },
]

