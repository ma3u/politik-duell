// Löscht liegen gebliebene Verbindungsnachrichten des Programm-Quiz aus der Firebase Realtime Database
// (docs/plan-quiz.md → „Firebase“). Normalerweise räumen die Geräte selbst auf; Reste entstehen nur, wenn ein
// Gerät hart abbricht. Gelöscht wird alles, was älter als eine Stunde ist.
// Aufruf: FIREBASE_DATABASE_URL=… FIREBASE_DATABASE_SECRET=… npm run quiz:aufraeumen
// Ohne Secret (z. B. in einem Fork ohne Einrichtung) endet das Skript ohne Fehler.

const URL_ = (process.env.FIREBASE_DATABASE_URL ?? process.env.VITE_FIREBASE_DATABASE_URL ?? '').replace(/\/$/, '')
const SECRET = process.env.FIREBASE_DATABASE_SECRET ?? ''
const MAX_ALTER_MS = 60 * 60 * 1000

if (!URL_ || !SECRET) {
  console.log('Kein FIREBASE_DATABASE_URL/FIREBASE_DATABASE_SECRET – nichts zu tun.')
  process.exit(0)
}

type Postfach = Record<string, { t?: number } | null>
type Raeume = Record<string, { an?: Record<string, Postfach> } | null> | null

const auth = `auth=${encodeURIComponent(SECRET)}`
const r = await fetch(`${URL_}/quiz.json?${auth}`)
if (!r.ok) {
  console.error(`Lesen fehlgeschlagen: ${r.status} ${await r.text()}`)
  process.exit(1)
}
const raeume = (await r.json()) as Raeume
const grenze = Date.now() - MAX_ALTER_MS
const loeschen: Record<string, null> = {}
for (const [code, raum] of Object.entries(raeume ?? {})) {
  const postfaecher = Object.entries(raum?.an ?? {})
  const alt = postfaecher.flatMap(([an, nachrichten]) =>
    Object.entries(nachrichten ?? {})
      .filter(([, n]) => typeof n?.t !== 'number' || n.t < grenze)
      .map(([id]) => `quiz/${code}/an/${an}/${id}`),
  )
  const gesamt = postfaecher.reduce((summe, [, n]) => summe + Object.keys(n ?? {}).length, 0)
  if (alt.length === gesamt) loeschen[`quiz/${code}`] = null
  else for (const pfad of alt) loeschen[pfad] = null
}

// Öffentliche Räume: ohne Lebenszeichen seit zehn Minuten löschen (die Liste in der App blendet sie nach 90 s aus).
const o = await fetch(`${URL_}/quiz-oeffentlich.json?${auth}`)
if (o.ok) {
  const oeffentlich = (await o.json()) as Record<string, { t?: number } | null> | null
  for (const [code, r] of Object.entries(oeffentlich ?? {})) {
    if (typeof r?.t !== 'number' || r.t < Date.now() - 10 * 60 * 1000) loeschen[`quiz-oeffentlich/${code}`] = null
  }
}

const anzahl = Object.keys(loeschen).length
if (anzahl) {
  const d = await fetch(`${URL_}/.json?${auth}`, { method: 'PATCH', body: JSON.stringify(loeschen) })
  if (!d.ok) {
    console.error(`Löschen fehlgeschlagen: ${d.status} ${await d.text()}`)
    process.exit(1)
  }
}
console.log(`${anzahl} Einträge gelöscht (Räume oder Nachrichten älter als eine Stunde).`)
