// Prüft Migration, Seed-Daten, Row Level Security und Rate-Limit gegen ein
// echtes Postgres (PGlite, läuft im Prozess – kein Supabase nötig).
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { seedSql } from '../scripts/seed-sql'
import { ABDECKUNG, KATALOG, MASSNAHMEN } from '../src/data/mock'
import { tokenHash } from './functions/_shared/pruefung'

const lies = (pfad: string) => readFileSync(new URL(pfad, import.meta.url), 'utf8')
const db = new PGlite()

beforeAll(async () => {
  // Rollen, die Supabase mitbringt.
  await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;`)
  for (const datei of readdirSync(new URL('./migrations', import.meta.url)).sort()) {
    await db.exec(lies(`./migrations/${datei}`))
  }
  // Getestet wird mit den festen Beispieldaten; der echte Katalog (seed.sql) enthält
  // anfangs kaum geprüfte Einträge. Dass seed.sql aktuell ist, prüft scripts/katalog.test.ts.
  await db.exec(seedSql(KATALOG))
}, 30_000)

async function alsRolle<T>(rolle: string, fn: () => Promise<T>, nutzer = ''): Promise<T> {
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [nutzer])
  await db.exec(`set role ${rolle}`)
  try {
    return await fn()
  } finally {
    await db.exec('reset role')
  }
}

const ADMIN = '00000000-0000-4000-8000-00000000a001'
const NUTZER = '00000000-0000-4000-8000-00000000b002'
const alsAdmin = <T>(fn: () => Promise<T>) => alsRolle('authenticated', fn, ADMIN)
const alsNutzer = <T>(fn: () => Promise<T>) => alsRolle('authenticated', fn, NUTZER)

describe('Datenbank', () => {
  it('enthält die Seed-Daten', async () => {
    const r = await db.query<{ n: number }>('select count(*)::int as n from massnahmen')
    expect(r.rows[0].n).toBe(MASSNAHMEN.length)
  })

  it('Seed ist mehrfach ausführbar', async () => {
    await db.exec(seedSql(KATALOG))
    const r = await db.query<{ n: number }>('select count(*)::int as n from parteien')
    expect(r.rows[0].n).toBe(KATALOG.parteien.length)
  })

  it('anon darf Stammdaten lesen', async () => {
    const r = await alsRolle('anon', () => db.query('select * from massnahmen'))
    expect(r.rows.length).toBe(MASSNAHMEN.length)
  })

  it('anon darf die Abdeckung lesen', async () => {
    const r = await alsRolle('anon', () => db.query('select * from abdeckung'))
    expect(r.rows.length).toBe(ABDECKUNG.length)
  })

  it('Abdeckung: Begründung genau bei „keine“, Status „unvollstaendig“ erlaubt', async () => {
    await expect(db.query(`insert into abdeckung values (1, 1, 'keine', null, now())`)).rejects.toThrow()
    await expect(db.query(`update abdeckung set begruendung = 'x' where art = 'massnahmen'`)).rejects.toThrow()
    await expect(db.query(`insert into runden (problem_text, status) values ('x', 'unvollstaendig')`)).resolves.toBeTruthy()
    await expect(db.query(`insert into runden (problem_text, status) values ('x', 'kaputt')`)).rejects.toThrow()
  })

  it('echter Seed ersetzt die Beispielparteien, gespielte Runden bleiben', async () => {
    const pruef = new PGlite()
    await pruef.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
      create schema auth; create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;`)
    for (const datei of readdirSync(new URL('./migrations', import.meta.url)).sort()) await pruef.exec(lies(`./migrations/${datei}`))
    await pruef.exec(seedSql(KATALOG))
    await pruef.exec(`insert into runden (problem_text, status, partei_a, partei_b) values ('alt', 'gewertet', 1, 2)`)
    await pruef.exec(lies('./seed.sql'))
    const alt = await pruef.query<{ n: number }>(`select count(*)::int as n from parteien where id in (${KATALOG.parteien.map((p) => p.id).join(',')})`)
    expect(alt.rows[0].n).toBe(0)
    const runde = await pruef.query<{ partei_a: number | null }>(`select partei_a from runden where problem_text = 'alt'`)
    expect(runde.rows).toEqual([{ partei_a: null }])
    // Länder und Ebenen der Ursachen kommen mit.
    const laender = await pruef.query<{ id: string }>('select id from laender order by id')
    expect(laender.rows.map((l) => l.id)).toEqual(['BE', 'MV', 'ST'])
    const ebene = await pruef.query<{ ebene: string }>('select ebene from ursachen where id = 401')
    expect(ebene.rows).toEqual([{ ebene: 'land' }])
    await pruef.close()
  })

  it('Abdeckung: je Thema, Partei und Programm höchstens ein Eintrag', async () => {
    await db.exec(`insert into laender (id, name, letzte_wahl) values ('ST', 'Sachsen-Anhalt', '2026-09-06')`)
    const a = KATALOG.abdeckung[0]
    const neu = (land: string) =>
      db.exec(`insert into abdeckung (thema_id, partei_id, land, art, begruendung, stand) values (${a.thema_id}, ${a.partei_id}, ${land}, 'keine', 'x', '2026-05-01')`)
    // Bundeseintrag gibt es schon aus dem Seed; ein zweiter (land = null) wird abgelehnt.
    await expect(neu('null')).rejects.toThrow()
    await neu(`'ST'`)
    await expect(neu(`'ST'`)).rejects.toThrow()
    await db.exec(`delete from laender where id = 'ST'`)
    const r = await alsRolle('anon', () => db.query('select * from laender'))
    expect(r.rows).toEqual([])
  })

  it('Testphase: KI-Entwürfe nur mit gültigem, nicht gesperrtem Zugang', async () => {
    const m = MASSNAHMEN[0]
    const a = ABDECKUNG[0]
    await db.exec(`update massnahmen set ki_entwurf = true where id = ${m.id}`)
    await db.exec(`update abdeckung set ki_entwurf = true where thema_id = ${a.thema_id} and partei_id = ${a.partei_id}`)
    try {
      // Öffentlich unsichtbar.
      const oeffentlich = await alsRolle('anon', () => db.query<{ id: number }>('select id from massnahmen'))
      expect(oeffentlich.rows.map((r) => r.id)).not.toContain(m.id)
      const abd = await alsRolle('anon', () => db.query('select * from abdeckung where ki_entwurf'))
      expect(abd.rows).toEqual([])

      const token = 'T'.repeat(43)
      await db.query(`insert into testphase_zugaenge (token_hash, name) values ($1, 'Test')`, [await tokenHash(token)])
      const daten = (t: string) =>
        alsRolle('anon', () => db.query<{ d: { massnahmen: { id: number }[]; abdeckung: unknown[] } | null }>('select testphase_daten($1) as d', [t]))
      const mit = (await daten(token)).rows[0].d
      expect(mit?.massnahmen.map((x) => x.id)).toEqual([m.id])
      expect(mit?.abdeckung).toHaveLength(1)
      expect((await daten('F'.repeat(43))).rows[0].d).toBeNull()
      expect((await daten('kurz')).rows[0].d).toBeNull()
      await db.exec(`update testphase_zugaenge set gesperrt = true`)
      expect((await daten(token)).rows[0].d).toBeNull()

      // Zugänge sieht nur, wer Admin ist; die Prüffunktion ist nicht direkt aufrufbar.
      expect((await alsRolle('anon', () => db.query('select * from testphase_zugaenge'))).rows).toEqual([])
      expect((await alsNutzer(() => db.query('select * from testphase_zugaenge'))).rows).toEqual([])
      await expect(alsRolle('anon', () => db.query('select testphase_zugang_gueltig($1)', [token]))).rejects.toThrow()
    } finally {
      await db.exec(`update massnahmen set ki_entwurf = false; update abdeckung set ki_entwurf = false; delete from testphase_zugaenge`)
    }
  })

  it('anon sieht nur freigegebene Runden', async () => {
    await db.exec(`insert into runden (problem_text, status, freigegeben) values ('offen', 'wert', false), ('frei', 'wert', true)`)
    const r = await alsRolle('anon', () => db.query<{ problem_text: string }>('select problem_text from runden'))
    expect(r.rows.map((x) => x.problem_text)).toEqual(['frei'])
  })

  it('anon darf nicht schreiben', async () => {
    await expect(
      alsRolle('anon', () => db.query(`insert into runden (problem_text, status) values ('x', 'wert')`)),
    ).rejects.toThrow()
    await expect(alsRolle('anon', () => db.query(`update parteien set name = 'x'`))).resolves.toMatchObject({
      affectedRows: 0,
    })
  })

  it('anon sieht Review-Warteschlange und Rate-Limit nicht', async () => {
    await db.exec(`insert into review_warteschlange (problem_text) values ('Bus fährt selten')`)
    const r = await alsRolle('anon', () => db.query('select * from review_warteschlange'))
    expect(r.rows).toHaveLength(0)
    await expect(
      alsRolle('anon', () => db.query(`select rate_limit_pruefen(gen_random_uuid(), 1, '1 minute')`)),
    ).rejects.toThrow()
  })

  it('Rate-Limit sperrt nach der erlaubten Zahl an Anfragen', async () => {
    const id = '00000000-0000-4000-8000-000000000001'
    const pruefe = async () =>
      (await db.query<{ ok: boolean }>(`select rate_limit_pruefen($1, 3, '10 minutes') as ok`, [id])).rows[0].ok
    expect([await pruefe(), await pruefe(), await pruefe(), await pruefe()]).toEqual([true, true, true, false])
  })

  it('prüft Wertebereiche', async () => {
    await expect(
      db.query(`insert into massnahmen (thema_id, partei_id, beschreibung, ursachen_ids, wirksamkeit, umsetzbarkeit,
        begruendung, beleg_programm_url, stand) values (1, 1, 'x', '{101}', 4, 1, 'x', 'https://x', now())`),
    ).rejects.toThrow()
  })
})

describe('Moderation', () => {
  let offen: number

  beforeAll(async () => {
    await db.exec(`insert into auth.users values ('${ADMIN}'), ('${NUTZER}'); insert into admins values ('${ADMIN}');`)
    const r = await db.query<{ id: number }>(
      `insert into runden (problem_text, stichwort, status, punkte_a) values ('Miete steigt', 'Miete', 'gewertet', 4) returning id`,
    )
    offen = r.rows[0].id
  })

  it('nur Admins sind Admins', async () => {
    const frage = () => db.query<{ ok: boolean }>('select ist_admin() as ok')
    expect((await alsAdmin(frage)).rows[0].ok).toBe(true)
    expect((await alsNutzer(frage)).rows[0].ok).toBe(false)
    await expect(alsRolle('anon', frage)).rejects.toThrow()
  })

  it('angemeldete Nicht-Admins sehen nur Freigegebenes und können nichts ändern', async () => {
    const r = await alsNutzer(() => db.query<{ id: number }>('select id from runden where id = $1', [offen]))
    expect(r.rows).toHaveLength(0)
    const u = await alsNutzer(() => db.query('update runden set freigegeben = true where id = $1', [offen]))
    expect(u.affectedRows).toBe(0)
    const a = await alsNutzer(() => db.query('select * from admins'))
    expect(a.rows).toHaveLength(0)
  })

  it('Admins sehen offene Runden und die Review-Warteschlange', async () => {
    const r = await alsAdmin(() => db.query('select id from runden where id = $1', [offen]))
    expect(r.rows).toHaveLength(1)
    const q = await alsAdmin(() => db.query('select * from review_warteschlange'))
    expect(q.rows.length).toBeGreaterThan(0)
  })

  it('Admins geben frei – danach sieht anon das Stichwort', async () => {
    await alsAdmin(() =>
      db.query(`update runden set stichwort = 'Mieterhöhung', freigegeben = true, moderiert_am = now() where id = $1`, [offen]),
    )
    const r = await alsRolle('anon', () =>
      db.query<{ stichwort: string }>('select stichwort from runden where id = $1', [offen]),
    )
    expect(r.rows).toEqual([{ stichwort: 'Mieterhöhung' }])
  })

  it('Admins dürfen Punkte und Texte nicht ändern', async () => {
    await expect(alsAdmin(() => db.query('update runden set punkte_a = 99 where id = $1', [offen]))).rejects.toThrow()
    await expect(alsAdmin(() => db.query(`update runden set problem_text = 'x' where id = $1`, [offen]))).rejects.toThrow()
  })

  it('freigegeben und abgelehnt schließen sich aus', async () => {
    await expect(alsAdmin(() => db.query('update runden set abgelehnt = true where id = $1', [offen]))).rejects.toThrow()
  })

  it('Admins haken Review-Einträge ab und löschen Runden', async () => {
    const u = await alsAdmin(() => db.query('update review_warteschlange set erledigt = true'))
    expect(u.affectedRows).toBeGreaterThan(0)
    const d = await alsAdmin(() => db.query('delete from runden where id = $1', [offen]))
    expect(d.affectedRows).toBe(1)
  })

  it('Stichwörter sind höchstens 40 Zeichen lang', async () => {
    await expect(
      db.query(`insert into runden (problem_text, stichwort, status) values ('x', repeat('a', 41), 'wert')`),
    ).rejects.toThrow()
  })
})

describe('Prüfung durch Eingeladene', () => {
  const HASH = 'a'.repeat(64)
  let einladung: string

  beforeAll(async () => {
    const r = await alsAdmin(() =>
      db.query<{ id: string }>(`insert into pruef_einladungen (token_hash, name, themen) values ($1, 'Erika Beispiel', '{2}') returning id`, [
        HASH,
      ]),
    )
    einladung = r.rows[0].id
    // Wie die Edge Function (Service Role): Einwilligung und Bewertungen.
    await db.query(`update pruef_einladungen set einwilligung_am = now() where id = $1`, [einladung])
    await db.query(
      `insert into pruef_bewertungen (einladung_id, massnahme_id, thema_id, wirksamkeit, umsetzbarkeit, abgesendet)
       values ($1, 2001, 2, 2, 3, true), ($1, 2002, 2, 1, null, false)`,
      [einladung],
    )
  })

  it('anon sieht weder Einladungen noch Bewertungen und kann nichts schreiben', async () => {
    await expect(alsRolle('anon', () => db.query('select * from pruef_einladungen'))).rejects.toThrow()
    await expect(alsRolle('anon', () => db.query('select * from pruef_bewertungen'))).rejects.toThrow()
    await expect(
      alsRolle('anon', () => db.query(`insert into pruef_einladungen (token_hash, name, themen) values ($1, 'x', '{2}')`, ['b'.repeat(64)])),
    ).rejects.toThrow()
  })

  it('angemeldete Nicht-Admins sehen nichts und legen nichts an', async () => {
    const e = await alsNutzer(() => db.query('select * from pruef_einladungen'))
    expect(e.rows).toHaveLength(0)
    const b = await alsNutzer(() => db.query('select * from pruef_bewertungen'))
    expect(b.rows).toHaveLength(0)
    await expect(
      alsNutzer(() => db.query(`insert into pruef_einladungen (token_hash, name, themen) values ($1, 'x', '{2}')`, ['c'.repeat(64)])),
    ).rejects.toThrow()
  })

  it('Admins sehen alles', async () => {
    const e = await alsAdmin(() => db.query<{ name: string }>('select name from pruef_einladungen'))
    expect(e.rows).toEqual([{ name: 'Erika Beispiel' }])
    const b = await alsAdmin(() => db.query('select * from pruef_bewertungen where einladung_id = $1', [einladung]))
    expect(b.rows).toHaveLength(2)
  })

  it('Admins sperren, dürfen aber weder Einwilligung noch Bewertungen ändern', async () => {
    const u = await alsAdmin(() => db.query('update pruef_einladungen set gesperrt = true where id = $1', [einladung]))
    expect(u.affectedRows).toBe(1)
    await alsAdmin(() => db.query('update pruef_einladungen set gesperrt = false where id = $1', [einladung]))
    await expect(
      alsAdmin(() => db.query('update pruef_einladungen set name_oeffentlich = true where id = $1', [einladung])),
    ).rejects.toThrow()
    await expect(alsAdmin(() => db.query('update pruef_bewertungen set wirksamkeit = 0'))).rejects.toThrow()
    await expect(
      alsAdmin(() => db.query(`insert into pruef_bewertungen (einladung_id, massnahme_id, thema_id) values ($1, 1, 2)`, [einladung])),
    ).rejects.toThrow()
  })

  it('prüft Wertebereiche, Token-Format und Pflichtwerte beim Absenden', async () => {
    await expect(db.query(`update pruef_bewertungen set wirksamkeit = 4 where einladung_id = $1`, [einladung])).rejects.toThrow()
    await expect(db.query(`insert into pruef_einladungen (token_hash, name, themen) values ('kurz', 'x', '{2}')`)).rejects.toThrow()
    await expect(db.query(`insert into pruef_einladungen (token_hash, name, themen) values ($1, 'x', '{}')`, ['d'.repeat(64)])).rejects.toThrow()
    await expect(
      db.query(`update pruef_bewertungen set abgesendet = true where einladung_id = $1 and massnahme_id = 2002`, [einladung]),
    ).rejects.toThrow()
  })

  it('öffentlich nur Anzahl und Namen mit Einwilligung', async () => {
    const frage = () =>
      alsRolle('anon', () => db.query<{ thema_id: number; anzahl: number; namen: string[] }>('select thema_id, anzahl, namen from pruefende_oeffentlich()'))
    expect((await frage()).rows).toEqual([{ thema_id: 2, anzahl: 1, namen: [] }])
    await db.query('update pruef_einladungen set name_oeffentlich = true where id = $1', [einladung])
    expect((await frage()).rows).toEqual([{ thema_id: 2, anzahl: 1, namen: ['Erika Beispiel'] }])
    // Gesperrte Einladungen zählen nicht.
    await db.query('update pruef_einladungen set gesperrt = true where id = $1', [einladung])
    expect((await frage()).rows).toEqual([])
    await db.query('update pruef_einladungen set gesperrt = false where id = $1', [einladung])
  })

  it('Löschen einer Einladung löscht ihre Bewertungen', async () => {
    const d = await alsAdmin(() => db.query('delete from pruef_einladungen where id = $1', [einladung]))
    expect(d.affectedRows).toBe(1)
    const b = await db.query<{ n: number }>('select count(*)::int as n from pruef_bewertungen where einladung_id = $1', [einladung])
    expect(b.rows[0].n).toBe(0)
  })
})

describe('Prüfung: neuer Link', () => {
  it('Admins ersetzen den Token-Hash, Bewertungen bleiben; Nicht-Admins nicht', async () => {
    const r = await alsAdmin(() =>
      db.query<{ id: string }>(`insert into pruef_einladungen (token_hash, name, themen) values ($1, 'Link Test', '{2}') returning id`, [
        'e'.repeat(64),
      ]),
    )
    const id = r.rows[0].id
    await db.query(`insert into pruef_bewertungen (einladung_id, massnahme_id, thema_id, wirksamkeit) values ($1, 2001, 2, 1)`, [id])
    const n = await alsNutzer(() => db.query('update pruef_einladungen set token_hash = $1 where id = $2', ['f'.repeat(64), id]))
    expect(n.affectedRows).toBe(0)
    const u = await alsAdmin(() => db.query('update pruef_einladungen set token_hash = $1 where id = $2', ['f'.repeat(64), id]))
    expect(u.affectedRows).toBe(1)
    const b = await db.query<{ n: number }>('select count(*)::int as n from pruef_bewertungen where einladung_id = $1', [id])
    expect(b.rows[0].n).toBe(1)
    await expect(alsAdmin(() => db.query(`update pruef_einladungen set token_hash = 'kurz' where id = $1`, [id]))).rejects.toThrow()
  })
})
