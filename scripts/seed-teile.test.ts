// supabase/seed-teile/ (seed.sql je Thema, für den SQL Editor): aktuell und zusammen gleichwertig zu seed.sql.
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pruefeDatenordner } from './katalog-laden'
import { GEMEINSAM_TEIL, seedSql, seedTeile } from './seed-sql'

const { katalog } = pruefeDatenordner()
const teile = seedTeile(katalog)
const ordner = new URL('../supabase/seed-teile/', import.meta.url)

const TABELLEN = [
  'parteien', 'laender', 'landesprogramme', 'themen', 'ursachen', 'instrumente', 'massnahmen',
  'pruef_einheiten', 'abdeckung', 'haltungen', 'haltung_zielkonflikte', 'haltung_positionen',
]

const LAUFENDE_ID = ['haltung_zielkonflikte']

async function leereDatenbank(): Promise<PGlite> {
  const db = new PGlite()
  await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;`)
  for (const datei of readdirSync(new URL('../supabase/migrations/', import.meta.url)).sort())
    await db.exec(readFileSync(new URL(`../supabase/migrations/${datei}`, import.meta.url), 'utf8'))
  return db
}

async function teileAusfuehren(db: PGlite) {
  await db.exec(teile[GEMEINSAM_TEIL])
  for (const [datei, sql] of Object.entries(teile)) if (datei !== GEMEINSAM_TEIL) await db.exec(sql)
}

async function inhalt(db: PGlite): Promise<Record<string, string[]>> {
  const ergebnis: Record<string, string[]> = {}
  for (const t of TABELLEN) {
    // Laufende Nummern (serial), die jeder Lauf neu vergibt – auch seed.sql –, zählen nicht.
    const { rows } = await db.query<{ z: string }>(`select (to_jsonb(x) - ${LAUFENDE_ID.includes(t) ? "'id'" : "''"})::text as z from public.${t} x`)
    ergebnis[t] = rows.map((r) => r.z).sort()
  }
  return ergebnis
}

describe('supabase/seed-teile', () => {
  it('ist aktuell (sonst: npm run seed)', () => {
    expect(readdirSync(ordner).filter((d) => d.endsWith('.sql')).sort()).toEqual(Object.keys(teile).sort())
    for (const [datei, sql] of Object.entries(teile)) expect(readFileSync(new URL(datei, ordner), 'utf8'), datei).toBe(sql)
  })

  it('ergibt denselben Stand wie seed.sql, auch mehrfach und über einen vorhandenen Stand', async () => {
    const ganz = await leereDatenbank()
    await ganz.exec(seedSql(katalog))
    const erwartet = await inhalt(ganz)
    expect(erwartet.massnahmen.length).toBeGreaterThan(0)

    const geteilt = await leereDatenbank()
    await teileAusfuehren(geteilt)
    expect(await inhalt(geteilt)).toEqual(erwartet)

    await teileAusfuehren(ganz)
    expect(await inhalt(ganz)).toEqual(erwartet)
  }, 120_000)
})
