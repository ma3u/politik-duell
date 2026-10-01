// Baut den Inhalt von supabase/seed.sql aus dem geprüften Datenkatalog.
import { pruefEinheiten, spielbareAbdeckung, spielbareLandesprogramme, spielbareMassnahmen, type Katalog } from '../src/data/katalog.ts'

const q = (v: string | null | undefined) => (v == null ? 'null' : `'${v.replace(/'/g, "''")}'`)
const zeilen = (werte: string[]) => werte.join(',\n  ')

export function seedSql(k: Katalog): string {
  // Mit KI-Entwürfen: Die Datenbank zeigt sie nur mit Zugang zur Testphase (Row Level Security).
  const massnahmen = spielbareMassnahmen(k, true)
  const abdeckung = spielbareAbdeckung(k, true)
  const landesprogramme = spielbareLandesprogramme(k)
  const einheiten = pruefEinheiten(k)
  const kopf = k.fiktiv
    ? '-- FIKTIVE Platzhalterdaten: Parteien, Maßnahmen, Punkte und Links sind erfunden.'
    : '-- Nur vollständig geprüfte Einträge je Thema und Partei; alles andere gilt als „noch nicht erfasst“.\n' +
      '-- Ausnahme: KI-Entwürfe (ki_entwurf = true), nur mit Zugang zur geschlossenen Testphase sichtbar.'
  return `-- AUTOMATISCH ERZEUGT aus daten/ (npm run seed) – nicht von Hand bearbeiten.
${kopf}

-- Mehrfach ausführbar: Stammdaten per Upsert, Maßnahmen und Abdeckung werden neu geschrieben.
-- Gespielte Runden bleiben erhalten.
delete from public.massnahmen;
delete from public.abdeckung;
delete from public.landesprogramme;
delete from public.pruef_einheiten;

insert into public.parteien (id, name, kurzname, farbe, programm_url, programm_stand) values
  ${zeilen(k.parteien.map((p) => `(${p.id}, ${q(p.name)}, ${q(p.kurzname)}, ${q(p.farbe)}, ${q(p.programm_url)}, ${q(p.programm_stand)})`))}
on conflict (id) do update set name = excluded.name, kurzname = excluded.kurzname, farbe = excluded.farbe,
  programm_url = excluded.programm_url, programm_stand = excluded.programm_stand;

-- Parteien, die nicht mehr im Katalog stehen (z. B. fiktive nach dem Umstieg), entfernen.
-- Gespielte Runden bleiben erhalten, ihr Parteiverweis wird leer.
delete from public.parteien where id not in (${k.parteien.map((p) => p.id).join(', ')});
${
  k.laender.length
    ? `
insert into public.laender (id, name, letzte_wahl) values
  ${zeilen(k.laender.map((l) => `(${q(l.id)}, ${q(l.name)}, ${q(l.letzte_wahl)})`))}
on conflict (id) do update set name = excluded.name, letzte_wahl = excluded.letzte_wahl;
delete from public.laender where id not in (${k.laender.map((l) => q(l.id)).join(', ')});
`
    : `
delete from public.laender;
`
}${
  landesprogramme.length
    ? `
-- Nur Programme der laufenden Wahlperiode.
insert into public.landesprogramme (partei_id, land, url, stand, kein_programm) values
  ${zeilen(landesprogramme.map((p) => `(${p.partei_id}, ${q(p.land)}, ${q(p.url)}, ${q(p.stand)}, ${q(p.kein_programm)})`))};
`
    : ''
}
insert into public.themen (id, name, beschreibung) values
  ${zeilen(k.themen.map((t) => `(${t.id}, ${q(t.name)}, ${q(t.beschreibung)})`))}
on conflict (id) do update set name = excluded.name, beschreibung = excluded.beschreibung;

insert into public.ursachen (id, thema_id, beschreibung, quelle_url, ebene) values
  ${zeilen(k.ursachen.map((u) => `(${u.id}, ${u.thema_id}, ${q(u.beschreibung)}, ${q(u.quelle_url)}, ${q(u.ebene ?? 'bund')})`))}
on conflict (id) do update set thema_id = excluded.thema_id, beschreibung = excluded.beschreibung,
  quelle_url = excluded.quelle_url, ebene = excluded.ebene;
${
  massnahmen.length
    ? `
insert into public.massnahmen (id, thema_id, partei_id, land, beschreibung, ursachen_ids, wirksamkeit, umsetzbarkeit,
  rollen_modifikator, begruendung, beleg_programm_url, beleg_studie_url, evidenz, stand, geprueft, ki_entwurf) values
  ${zeilen(
    massnahmen.map(
      (m) =>
        `(${m.id}, ${m.thema_id}, ${m.partei_id}, ${q(m.land)}, ${q(m.beschreibung)}, '{${m.ursachen_ids.join(',')}}', ${m.wirksamkeit}, ${m.umsetzbarkeit}, ` +
        `${m.rollen_modifikator ? `${q(JSON.stringify(m.rollen_modifikator))}::jsonb` : 'null'}, ${q(m.begruendung)}, ` +
        `${q(m.beleg_programm_url)}, ${q(m.beleg_studie_url)}, ${q(m.evidenz)}, ${q(m.stand)}, ${m.geprueft}, ${m.ki_entwurf ?? false})`,
    ),
  )};

select setval(pg_get_serial_sequence('public.massnahmen', 'id'), (select max(id) from public.massnahmen));
`
    : ''
}${
  einheiten.length
    ? `
-- Was Prüfende je Thema bewerten (auch ungeprüfte Einträge): Instrumente und Maßnahmen ohne Instrument.
insert into public.pruef_einheiten (id, thema_id) values
  ${zeilen(einheiten.map((e) => `(${e.id}, ${e.thema_id})`))};
`
    : ''
}${
  abdeckung.length
    ? `
insert into public.abdeckung (thema_id, partei_id, land, art, begruendung, stand, ki_entwurf, durchsucht_fuer) values
  ${zeilen(abdeckung.map((a) => `(${a.thema_id}, ${a.partei_id}, ${q(a.land)}, ${q(a.art)}, ${q(a.begruendung)}, ${q(a.stand)}, ${a.ki_entwurf ?? false}, ${a.durchsucht_fuer ? `'{${a.durchsucht_fuer.join(',')}}'` : 'null'})`))};
`
    : ''
}`
}
