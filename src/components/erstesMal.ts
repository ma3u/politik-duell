import { useEffect, useState } from 'react'

const gezeigt = new Set<string>()

/**
 * true nur beim ersten Anzeigen je Besuch (z. B. Startseite) – kehrt man zurück, steht alles still.
 * Der Merker wird erst nach dem Anzeigen gesetzt, damit der doppelte Aufruf im StrictMode dasselbe ergibt.
 */
export function useErstesMal(schluessel: string): boolean {
  const [erstes] = useState(() => !gezeigt.has(schluessel))
  useEffect(() => {
    gezeigt.add(schluessel)
  }, [schluessel])
  return erstes
}
