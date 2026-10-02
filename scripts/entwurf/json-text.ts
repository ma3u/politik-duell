// Das erste vollständige JSON-Objekt aus einem Text – etwa der Antwort eines Agenten, die vor oder
// nach dem JSON Text enthält. Gemeinsam für entwurf:json und entwurf:programm-pruefen.

export function erstesJsonObjekt(text: string): { objekt: unknown; rest: string } {
  const start = text.indexOf('{')
  if (start < 0) throw new Error('Kein JSON-Objekt gefunden.')
  let tiefe = 0
  let inText = false
  let maskiert = false
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (inText) {
      if (maskiert) maskiert = false
      else if (c === '\\') maskiert = true
      else if (c === '"') inText = false
      continue
    }
    if (c === '"') inText = true
    else if (c === '{') tiefe++
    else if (c === '}' && --tiefe === 0) {
      try {
        return { objekt: JSON.parse(text.slice(start, i + 1)), rest: text.slice(i + 1).trim() }
      } catch (e) {
        throw new Error(`Kein gültiges JSON: ${e instanceof Error ? e.message : e}`)
      }
    }
  }
  throw new Error('JSON-Objekt nicht abgeschlossen (Antwort abgeschnitten?).')
}
