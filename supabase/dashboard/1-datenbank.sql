-- AUTOMATISCH ERZEUGT (npm run dashboard) – nicht von Hand bearbeiten.
-- Im Supabase-Dashboard: SQL Editor → New query → alles einfügen → Run.
-- Nur beim ersten Mal ausführen, danach je Datei aus supabase/seed-teile/ (zuerst 0-gemeinsam.sql).
-- Später: neue Migrationen einzeln aus supabase/migrations/, geänderte Daten aus supabase/seed-teile/.

begin;

-- ===== migrations/20260926000000_schema.sql =====
-- „Wer liefert?“ – Grundschema (Meilenstein 3)
--
-- Datenschutz: Es gibt keine Konten, keine IP-Adressen und kein Audio.
-- Gespeichert wird nur die anonyme, neutrale Zusammenfassung eines Problems.
--
-- Zugriff: Die App (Rolle anon) darf nur lesen. Schreiben passiert
-- ausschließlich über die Edge Function `analyse` mit dem Service-Role-Key.

-- ---------------------------------------------------------------------------
-- Kuratierte Daten
-- ---------------------------------------------------------------------------

create table public.parteien (
  id              smallint primary key,
  name            text not null unique,
  kurzname        text not null unique,
  farbe           text not null check (farbe ~ '^#[0-9a-fA-F]{6}$'),
  programm_url    text not null,
  programm_stand  date not null
);

create table public.themen (
  id           smallint primary key,
  name         text not null unique,
  beschreibung text not null
);

create table public.ursachen (
  id           smallint primary key,
  thema_id     smallint not null references public.themen (id) on delete cascade,
  beschreibung text not null,
  quelle_url   text not null
);
create index on public.ursachen (thema_id);

create table public.massnahmen (
  id                 serial primary key,
  thema_id           smallint not null references public.themen (id) on delete cascade,
  partei_id          smallint not null references public.parteien (id) on delete cascade,
  beschreibung       text not null,
  ursachen_ids       smallint[] not null check (cardinality(ursachen_ids) > 0),
  wirksamkeit        smallint not null check (wirksamkeit between 0 and 3),
  umsetzbarkeit      smallint not null check (umsetzbarkeit between 0 and 3),
  -- { "mieter": { "wert": 1, "begruendung": "…" }, … }
  rollen_modifikator jsonb,
  begruendung        text not null,
  beleg_programm_url text not null,   -- mit #page=N wo möglich
  beleg_studie_url   text,
  stand              date not null,
  geprueft           boolean not null default false
);
create index on public.massnahmen (thema_id, partei_id);

-- ---------------------------------------------------------------------------
-- Spieldaten (nur über die Edge Function beschreibbar)
-- ---------------------------------------------------------------------------

create table public.runden (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  thema_id     smallint references public.themen (id) on delete set null,
  problem_text text not null check (char_length(problem_text) <= 200),
  partei_a     smallint references public.parteien (id) on delete set null,
  partei_b     smallint references public.parteien (id) on delete set null,
  punkte_a     smallint,
  punkte_b     smallint,
  status       text not null check (status in ('gewertet', 'ungeprueft', 'wert')),
  freigegeben  boolean not null default false   -- für die Wortwolke (Moderation, Meilenstein 4)
);
create index on public.runden (created_at desc) where freigegeben;

-- Probleme ohne Thema in der Datenbank – zur redaktionellen Prüfung.
create table public.review_warteschlange (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  problem_text    text not null check (char_length(problem_text) <= 200),
  einschaetzung   text check (char_length(einschaetzung) <= 400),
  erledigt        boolean not null default false
);

-- Rate-Limit pro Sitzung. Die Sitzungs-ID ist eine zufällige UUID aus dem
-- Browser (sessionStorage), ohne Bezug zu einer Person.
create table public.rate_limit (
  sitzung       uuid primary key,
  fenster_start timestamptz not null default now(),
  anzahl        integer not null default 0
);

-- Zählt eine Anfrage und gibt true zurück, solange das Limit nicht überschritten ist.
create or replace function public.rate_limit_pruefen(p_sitzung uuid, p_max integer, p_fenster interval)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anzahl integer;
begin
  insert into rate_limit as r (sitzung, fenster_start, anzahl)
  values (p_sitzung, now(), 1)
  on conflict (sitzung) do update
    set anzahl = case when r.fenster_start < now() - p_fenster then 1 else r.anzahl + 1 end,
        fenster_start = case when r.fenster_start < now() - p_fenster then now() else r.fenster_start end
  returning anzahl into v_anzahl;

  -- Alte Einträge nebenbei aufräumen.
  delete from rate_limit where fenster_start < now() - interval '1 day';

  return v_anzahl <= p_max;
end;
$$;

revoke all on function public.rate_limit_pruefen(uuid, integer, interval) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.parteien             enable row level security;
alter table public.themen               enable row level security;
alter table public.ursachen             enable row level security;
alter table public.massnahmen           enable row level security;
alter table public.runden               enable row level security;
alter table public.review_warteschlange enable row level security;
alter table public.rate_limit           enable row level security;

create policy "Parteien lesen"   on public.parteien   for select to anon, authenticated using (true);
create policy "Themen lesen"     on public.themen     for select to anon, authenticated using (true);
create policy "Ursachen lesen"   on public.ursachen   for select to anon, authenticated using (true);
create policy "Maßnahmen lesen"  on public.massnahmen for select to anon, authenticated using (true);
create policy "Freigegebene Probleme lesen" on public.runden for select to anon, authenticated using (freigegeben);

-- review_warteschlange und rate_limit: keine Policies → für anon/authenticated
-- nicht sichtbar. Schreiben auf allen Tabellen nur mit dem Service-Role-Key.

-- ===== migrations/20260927000000_moderation.sql =====
-- „Wer liefert?“ – Meilenstein 4: Wortwolke, Moderation, Admin-Ansicht
--
-- Ablauf: Die Edge Function speichert zu jeder Runde ein kurzes Stichwort und
-- prüft es mit einem automatischen Filter (Beleidigungen, Namen, Hetze,
-- Kontaktdaten). In die Wortwolke kommt ein Eintrag erst, wenn ein Admin ihn
-- freigibt. Admins melden sich über Supabase Auth an und stehen in `admins`.

-- ---------------------------------------------------------------------------
-- Neue Spalten für die Moderation
-- ---------------------------------------------------------------------------

alter table public.runden
  -- 1–3 Wörter für die Wortwolke (von der KI vorgeschlagen, vom Admin änderbar)
  add column stichwort   text check (char_length(stichwort) between 1 and 40),
  -- Grund, falls der automatische Filter angeschlagen hat (dann nicht freigeben)
  add column filter_grund text check (char_length(filter_grund) <= 100),
  add column abgelehnt   boolean not null default false,
  add column moderiert_am timestamptz,
  add constraint runden_frei_oder_abgelehnt check (not (freigegeben and abgelehnt));

-- Offene Einträge für die Admin-Ansicht
create index on public.runden (created_at desc) where not freigegeben and not abgelehnt;

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------

-- Wer hier steht, darf moderieren. Eintragen nur im SQL Editor (siehe EINRICHTEN.md).
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.ist_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

revoke all on function public.ist_admin() from public, anon;
grant execute on function public.ist_admin() to authenticated;

create policy "Admins sehen sich selbst" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Zugriffsregeln für Admins
-- ---------------------------------------------------------------------------

create policy "Admins lesen alle Runden" on public.runden
  for select to authenticated using (public.ist_admin());
create policy "Admins moderieren Runden" on public.runden
  for update to authenticated using (public.ist_admin()) with check (public.ist_admin());
create policy "Admins löschen Runden" on public.runden
  for delete to authenticated using (public.ist_admin());

-- Admins dürfen nur die Moderationsfelder ändern, nicht Punkte oder Parteien.
revoke update on public.runden from anon, authenticated;
grant update (stichwort, freigegeben, abgelehnt, moderiert_am) on public.runden to authenticated;

create policy "Admins lesen Review-Warteschlange" on public.review_warteschlange
  for select to authenticated using (public.ist_admin());
create policy "Admins erledigen Review-Einträge" on public.review_warteschlange
  for update to authenticated using (public.ist_admin()) with check (public.ist_admin());
revoke update on public.review_warteschlange from anon, authenticated;
grant update (erledigt) on public.review_warteschlange to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: Wortwolke und Admin-Ansicht bekommen Änderungen live.
-- Realtime beachtet Row Level Security: anon erhält nur freigegebene Runden.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.runden, public.review_warteschlange;
  end if;
end;
$$;

-- ===== migrations/20260928000000_abdeckung.sql =====
-- „Wer liefert?“ – Abdeckung: „keine Maßnahme im Programm“ vs. „noch nicht erfasst“
--
-- Pro Thema und Partei steht hier, ob das Wahlprogramm vollständig ausgewertet
-- ist: `massnahmen` (alle Maßnahmen erfasst) oder `keine` (nachweislich nichts
-- dazu im Programm). Fehlt der Eintrag, ist das Thema für die Partei noch nicht
-- erfasst – dann wird die Runde nicht gewertet, damit fehlende Daten keiner
-- Partei einen Punkt kosten. Befüllt wird die Tabelle aus daten/ (seed.sql).

create table public.abdeckung (
  thema_id     smallint not null references public.themen (id) on delete cascade,
  partei_id    smallint not null references public.parteien (id) on delete cascade,
  art          text not null check (art in ('massnahmen', 'keine')),
  -- Nur bei `keine`: was im Programm durchsucht wurde.
  begruendung  text check (char_length(begruendung) <= 400),
  stand        date not null,
  primary key (thema_id, partei_id),
  check ((art = 'keine') = (begruendung is not null))
);

alter table public.abdeckung enable row level security;
create policy "Abdeckung lesen" on public.abdeckung for select to anon, authenticated using (true);

-- Neuer Rundenstatus: Thema bekannt, aber für eine der beiden Parteien noch
-- nicht erfasst → keine Wertung, keine Punkte.
alter table public.runden drop constraint runden_status_check;
alter table public.runden add constraint runden_status_check
  check (status in ('gewertet', 'ungeprueft', 'unvollstaendig', 'wert'));

-- ===== migrations/20260929000000_pruefung.sql =====
-- „Wer liefert?“ – Bewertung durch eingeladene Prüfende (Plan: docs/plan-pruefung.md)
--
-- Die Betreiberin lädt Personen mit Fachwissen über einen persönlichen Link ein.
-- Sie bewerten die Maßnahmen eines Themas; die Admin-Ansicht bildet daraus je
-- Maßnahme den Median. Namen stehen nur hier (nie im Repo).
--
-- Datenschutz: Bewertungen von Parteimaßnahmen können politische Haltungen
-- erkennen lassen (Art. 9 DSGVO). Deshalb: Einwilligung vor der ersten
-- Bewertung, keine IP-Adressen, keine Konten, Löschen einer Einladung löscht
-- alle Bewertungen der Person.
--
-- Zugriff: anon hat keinen Zugriff. Prüfende arbeiten nur über die Edge
-- Function `pruefung` (Service Role), die den Token-Hash prüft. Admins lesen
-- alles und verwalten Einladungen.

create table public.pruef_einladungen (
  id               uuid primary key default gen_random_uuid(),
  -- SHA-256 (hex) des Tokens. Der Token selbst wird nur einmal angezeigt.
  token_hash       text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  -- Nur intern (Admin-Ansicht).
  name             text not null check (char_length(name) between 1 and 80),
  -- Welche Themen die Person bewerten soll.
  themen           smallint[] not null check (cardinality(themen) > 0),
  erstellt         timestamptz not null default now(),
  gesperrt         boolean not null default false,
  -- Einwilligung zur Verarbeitung (Pflicht vor dem Bewerten).
  einwilligung_am  timestamptz,
  -- Einwilligung zur öffentlichen Nennung (freiwillig).
  name_oeffentlich boolean not null default false,
  check (not name_oeffentlich or einwilligung_am is not null)
);

create table public.pruef_bewertungen (
  einladung_id  uuid not null references public.pruef_einladungen (id) on delete cascade,
  -- ID aus daten/themen/*.json (ungeprüfte Maßnahmen stehen nicht in der Datenbank).
  massnahme_id  integer not null,
  thema_id      smallint not null,
  wirksamkeit   smallint check (wirksamkeit between 0 and 3),
  umsetzbarkeit smallint check (umsetzbarkeit between 0 and 3),
  notiz         text check (char_length(notiz) <= 1000),
  -- Die Empfehlung (Entwurfswerte) wird erst nach der eigenen Bewertung sichtbar.
  empfehlung_gesehen        boolean not null default false,
  -- Werte nach dem Ansehen der Empfehlung geändert? Nur zur Einordnung.
  nach_empfehlung_geaendert boolean not null default false,
  aktualisiert  timestamptz not null default now(),
  abgesendet    boolean not null default false,
  primary key (einladung_id, massnahme_id),
  check (not empfehlung_gesehen or (wirksamkeit is not null and umsetzbarkeit is not null)),
  check (not abgesendet or (wirksamkeit is not null and umsetzbarkeit is not null))
);
create index on public.pruef_bewertungen (thema_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.pruef_einladungen enable row level security;
alter table public.pruef_bewertungen enable row level security;

-- anon: keine Rechte, auch nicht über Standardrechte des Schemas.
revoke all on public.pruef_einladungen, public.pruef_bewertungen from anon;

create policy "Admins lesen Einladungen" on public.pruef_einladungen
  for select to authenticated using (public.ist_admin());
create policy "Admins legen Einladungen an" on public.pruef_einladungen
  for insert to authenticated with check (public.ist_admin());
create policy "Admins sperren Einladungen" on public.pruef_einladungen
  for update to authenticated using (public.ist_admin()) with check (public.ist_admin());
create policy "Admins löschen Einladungen" on public.pruef_einladungen
  for delete to authenticated using (public.ist_admin());

-- Admins dürfen nur sperren – Einwilligungen gibt nur die Person selbst.
revoke insert, update on public.pruef_einladungen from authenticated;
grant insert (token_hash, name, themen) on public.pruef_einladungen to authenticated;
grant update (gesperrt) on public.pruef_einladungen to authenticated;

-- Bewertungen schreibt nur die Edge Function; Admins lesen.
create policy "Admins lesen Bewertungen" on public.pruef_bewertungen
  for select to authenticated using (public.ist_admin());
revoke insert, update, delete on public.pruef_bewertungen from authenticated;

-- ---------------------------------------------------------------------------
-- Öffentliche Nennung (Methodenseite): je Thema die Zahl der Personen, die
-- abgesendet haben, und die Namen derer, die der Nennung zugestimmt haben.
-- ---------------------------------------------------------------------------

create or replace function public.pruefende_oeffentlich()
returns table (thema_id smallint, thema text, anzahl integer, namen text[])
language sql
stable
security definer
set search_path = public
as $$
  select b.thema_id,
         coalesce(t.name, 'Thema ' || b.thema_id),
         count(distinct e.id)::integer,
         coalesce(array_agg(distinct e.name order by e.name) filter (where e.name_oeffentlich), '{}')
  from pruef_bewertungen b
  join pruef_einladungen e on e.id = b.einladung_id
  left join themen t on t.id = b.thema_id
  where b.abgesendet and not e.gesperrt and e.einwilligung_am is not null
  group by b.thema_id, t.name
  order by b.thema_id;
$$;

revoke all on function public.pruefende_oeffentlich() from public;
grant execute on function public.pruefende_oeffentlich() to anon, authenticated;

-- ===== migrations/20260930000000_pruefung_neuer_link.sql =====
-- „Wer liefert?“ – Prüfung: neuen Link für eine bestehende Einladung erzeugen
--
-- Geht ein Einladungslink verloren, erzeugt die Admin-Ansicht einen neuen
-- Token und ersetzt den gespeicherten Hash. Der alte Link funktioniert dann
-- nicht mehr; Einwilligung und Bewertungen bleiben erhalten.

grant update (token_hash) on public.pruef_einladungen to authenticated;

-- ===== migrations/20261001000000_laender.sql =====
-- Politik-Duell – Bund und Länder, Stand der Forschung
--
-- Jede Ursache ist einer Ebene zugeordnet: `bund` oder `land`. Wählen Spielende
-- ein Bundesland, zählt bei Ursachen in Länderzuständigkeit das Wahlprogramm
-- der Partei zur letzten Landtagswahl (laufende Wahlperiode), sonst das
-- Bundesprogramm. Das gewählte Bundesland wird nicht gespeichert.
-- Befüllt werden die Tabellen aus daten/ (seed.sql); nur aktuelle Programme.

alter table public.ursachen
  add column ebene text not null default 'bund' check (ebene in ('bund', 'land'));

create table public.laender (
  id           text primary key check (id ~ '^[A-Z]{2}$'),
  name         text not null unique,
  letzte_wahl  date not null
);

-- Ohne `url` gibt es nachweislich kein Programm (z. B. nicht angetreten), dann steht in `kein_programm`, warum.
create table public.landesprogramme (
  partei_id      smallint not null references public.parteien (id) on delete cascade,
  land           text not null references public.laender (id) on delete cascade,
  url            text,
  stand          date,
  kein_programm  text check (char_length(kein_programm) <= 300),
  primary key (partei_id, land),
  check ((url is null) = (kein_programm is not null)),
  check ((url is null) = (stand is null))
);

-- Maßnahmen und Abdeckung aus Landesprogrammen: `land` gesetzt; null = Bundesprogramm.
alter table public.massnahmen
  add column land text references public.laender (id) on delete cascade,
  add column evidenz text check (evidenz in ('belegt', 'gemischt', 'offen'));

alter table public.abdeckung
  add column land text references public.laender (id) on delete cascade;
alter table public.abdeckung drop constraint abdeckung_pkey;
alter table public.abdeckung add constraint abdeckung_eindeutig unique nulls not distinct (thema_id, partei_id, land);

alter table public.laender         enable row level security;
alter table public.landesprogramme enable row level security;
create policy "Länder lesen"          on public.laender         for select to anon, authenticated using (true);
create policy "Landesprogramme lesen" on public.landesprogramme for select to anon, authenticated using (true);

-- ===== migrations/20261002000000_testphase.sql =====
-- Politik-Duell – geschlossene Testphase mit KI-Entwürfen
--
-- KI-Entwürfe (noch nicht von Menschen geprüfte Maßnahmen und Einträge) stehen
-- mit `ki_entwurf = true` in der Datenbank. Öffentlich (anon) sind sie nicht
-- lesbar. Wer einen Zugangslink zur Testphase hat (#/testphase/<token>), bekommt
-- sie über die Funktion `testphase_daten`. Wie bei den Prüf-Einladungen liegt
-- nur der SHA-256-Hash des Tokens in der Datenbank.

alter table public.massnahmen add column ki_entwurf boolean not null default false;
alter table public.abdeckung  add column ki_entwurf boolean not null default false;

-- Öffentlich nur geprüfte Einträge.
drop policy "Maßnahmen lesen" on public.massnahmen;
create policy "Maßnahmen lesen" on public.massnahmen for select to anon, authenticated using (not ki_entwurf);
drop policy "Abdeckung lesen" on public.abdeckung;
create policy "Abdeckung lesen" on public.abdeckung for select to anon, authenticated using (not ki_entwurf);

-- Runden aus der Testphase getrennt auswertbar.
alter table public.runden add column testphase boolean not null default false;

create table public.testphase_zugaenge (
  id          uuid primary key default gen_random_uuid(),
  token_hash  text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  name        text not null check (char_length(name) between 1 and 80),   -- nur intern, für die Übersicht
  erstellt    timestamptz not null default now(),
  gesperrt    boolean not null default false
);
alter table public.testphase_zugaenge enable row level security;

create policy "Admins lesen Testzugänge"   on public.testphase_zugaenge for select to authenticated using (public.ist_admin());
create policy "Admins legen Testzugänge an" on public.testphase_zugaenge for insert to authenticated with check (public.ist_admin());
create policy "Admins ändern Testzugänge"  on public.testphase_zugaenge for update to authenticated using (public.ist_admin()) with check (public.ist_admin());
create policy "Admins löschen Testzugänge" on public.testphase_zugaenge for delete to authenticated using (public.ist_admin());
revoke update on public.testphase_zugaenge from anon, authenticated;
grant update (gesperrt) on public.testphase_zugaenge to authenticated;

-- Gültiger, nicht gesperrter Zugang? (Token-Format wie bei den Prüf-Einladungen: 43 Zeichen base64url.)
create or replace function public.testphase_zugang_gueltig(p_token text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_token ~ '^[A-Za-z0-9_-]{43}$' and exists (
    select 1 from testphase_zugaenge
    where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex') and not gesperrt
  );
$$;

-- KI-Entwürfe für die App – nur mit gültigem Zugang, sonst null.
create or replace function public.testphase_daten(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not testphase_zugang_gueltig(p_token) then
    return null;
  end if;
  return jsonb_build_object(
    'massnahmen', coalesce((select jsonb_agg(to_jsonb(m) order by m.id) from massnahmen m where m.ki_entwurf), '[]'::jsonb),
    'abdeckung',  coalesce((select jsonb_agg(to_jsonb(a)) from abdeckung a where a.ki_entwurf), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.testphase_zugang_gueltig(text) from public, anon, authenticated;
revoke all on function public.testphase_daten(text) from public;
grant execute on function public.testphase_daten(text) to anon, authenticated;

-- ===== migrations/20261003000000_pruef_einheiten.sql =====
-- Politik-Duell – Prüfeinheiten in der Datenbank
--
-- Welche Instrumente und Maßnahmen (ohne Instrument) Prüfende je Thema bewerten,
-- schreibt der Seed hierher – auch ungeprüfte, die nicht in `massnahmen` stehen.
-- Die Edge Function `pruefung` liest die Liste von hier. So muss sie nach neuen
-- Daten nicht neu deployt werden; es reicht, seed.sql auszuführen.

create table public.pruef_einheiten (
  id        integer primary key,   -- ID des Instruments bzw. der Maßnahme (ein Nummernkreis)
  thema_id  smallint not null references public.themen (id) on delete cascade
);
create index on public.pruef_einheiten (thema_id);

-- Nur die Edge Function (service_role) liest die Liste.
alter table public.pruef_einheiten enable row level security;
revoke all on public.pruef_einheiten from anon, authenticated;

-- ===== migrations/20261004000000_abdeckung_ursachen.sql =====
-- Politik-Duell – Abdeckung je Ursache
--
-- Ein Abdeckungseintrag sagt, dass ein Programm zu einem Thema ausgewertet ist. Kommt später
-- eine Ursache hinzu, ist das Programm danach aber nicht unbedingt durchsucht. `durchsucht_fuer`
-- nennt die Ursachen, für die es durchsucht wurde; fehlt eine Ursache darin, wird die Runde für
-- die Partei nicht gewertet („noch nicht erfasst“) statt mit 0 Punkten. null = ältere Einträge,
-- für alle Ursachen des Themas durchsucht. Befüllt aus daten/ (seed.sql).

alter table public.abdeckung add column durchsucht_fuer integer[];

-- ===== migrations/20261005000000_entwurf_herkunft.sql =====
-- Politik-Duell – Herkunft der Entwurfswerte
--
-- KI-Entwürfe sind seit 1. 10. 2026 ohne Parteinamen bewertet (`blind`). Werte, die jemand mit Kenntnis
-- der Partei vergeben oder geändert hat, und ältere Entwürfe (null) zeigt das Spiel in der Testphase
-- als „vorläufige Bewertung, nicht blind“ statt als „KI-Entwurf“. Bei geprüften Maßnahmen bleibt die
-- Spalte leer: Ihre Werte stammen aus der Bewertung durch die Prüfenden. Befüllt aus daten/ (seed.sql).

alter table public.massnahmen add column entwurf_herkunft text check (entwurf_herkunft in ('blind', 'nicht_blind'));

-- ===== migrations/20261006000000_runden_forderung.sql =====
-- Politik-Duell – Forderungen ohne Umdeutung (docs/plan-haltungen.md, Schritt 1)
--
-- Bleibt es nach zwei Nachfragen bei einer Forderung ohne Alltagsproblem, wird sie nicht mehr
-- zum Problem umgedeutet (und landet nicht mehr in der Warteschlange für neue Themen), sondern
-- als eigene Runde ohne Wertung gespeichert – mit dem erkannten Thema, falls vorhanden.

alter table public.runden drop constraint runden_status_check;
alter table public.runden add constraint runden_status_check
  check (status in ('gewertet', 'ungeprueft', 'unvollstaendig', 'wert', 'forderung'));

-- ===== migrations/20261007000000_instrumente.sql =====
-- Politik-Duell – Forderungskarte (docs/plan-haltungen.md, Schritt 2)
--
-- Instrumente: gleiche Lösungswege, die mehrere Programme vorschlagen. Die Forderungskarte zeigt daran,
-- welche Parteien ihn im Programm haben und was die Forschung sagt – ohne Punkte (Wirksamkeit und
-- Umsetzbarkeit bleiben im Datenkatalog und an den Maßnahmen). Wie Maßnahmen: Entwürfe nur mit Zugang
-- zur Testphase.

create table public.instrumente (
  id               integer primary key,
  thema_id         smallint not null references public.themen (id) on delete cascade,
  name             text not null,
  begruendung      text,
  evidenz          text check (evidenz in ('belegt', 'gemischt', 'offen')),
  beleg_studie_url text,
  ebene            text not null default 'bund' check (ebene in ('bund', 'land')),
  -- Der gleiche Lösungsweg auf der anderen Ebene (Bund ↔ Land); das Gegenstück verweist zurück.
  entspricht       integer references public.instrumente (id) on delete set null,
  ki_entwurf       boolean not null default false,
  entwurf_herkunft text check (entwurf_herkunft in ('blind', 'nicht_blind'))
);
create index on public.instrumente (thema_id);

alter table public.instrumente enable row level security;
create policy "Instrumente lesen" on public.instrumente for select to anon, authenticated using (not ki_entwurf);

alter table public.massnahmen add column instrument_id integer references public.instrumente (id) on delete set null;
create index on public.massnahmen (instrument_id);

-- Eine Forderung ohne Alltagsproblem merkt sich den erkannten Lösungsweg (nur die ID, kein Text der Person).
alter table public.runden add column instrument_id integer references public.instrumente (id) on delete set null;

-- Testphase: Entwürfe der Instrumente gehören zu den KI-Entwürfen.
create or replace function public.testphase_daten(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not testphase_zugang_gueltig(p_token) then
    return null;
  end if;
  return jsonb_build_object(
    'massnahmen',   coalesce((select jsonb_agg(to_jsonb(m) order by m.id) from massnahmen m where m.ki_entwurf), '[]'::jsonb),
    'abdeckung',    coalesce((select jsonb_agg(to_jsonb(a)) from abdeckung a where a.ki_entwurf), '[]'::jsonb),
    'instrumente',  coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from instrumente i where i.ki_entwurf), '[]'::jsonb)
  );
end;
$$;

-- ===== migrations/20261008000000_runden_grenze.sql =====
-- Politik-Duell – Grenze (docs/plan-haltungen.md, Schritt 3; docs/methode.md → „Grenze“)
--
-- Äußerungen, die einer Gruppe die Menschenwürde oder gleiche Rechte absprechen, zu Gewalt aufrufen oder
-- Personen beleidigen, ordnet die KI als `grenze` ein. Das Spiel geht darauf nicht ein. Gespeichert wird nur,
-- dass es eine solche Runde gab – ohne Zusammenfassung, Stichwort, Thema oder Filtergrund. Die Prüfung unten
-- sichert das auch gegen Fehler in der Edge Function oder eine spätere Bearbeitung in der Admin-Ansicht ab.

alter table public.runden drop constraint runden_status_check;
alter table public.runden add constraint runden_status_check
  check (status in ('gewertet', 'ungeprueft', 'unvollstaendig', 'wert', 'forderung', 'grenze'));

alter table public.runden add constraint runden_grenze_ohne_inhalt check (
  status <> 'grenze' or (
    problem_text = '' and stichwort is null and filter_grund is null
    and thema_id is null and instrument_id is null
    and punkte_a is null and punkte_b is null
    and not freigegeben
  )
);

-- ===== migrations/20261009000000_haltungen.sql =====
-- Politik-Duell – Haltungskarte (docs/plan-haltungen.md, Schritt 4, Teil B)
--
-- Haltungen: Wertfragen, über die man verschieden denken kann („Soll es ein generelles Tempolimit auf
-- Autobahnen geben?“). Die Haltungskarte zeigt dazu die Position jeder Partei mit wörtlichem Zitat und
-- Beleg sowie die Zielkonflikte – ohne Punkte und ohne Einordnung als richtig oder falsch. Eine Karte gibt
-- es nur, wenn alle Parteien eine Position haben („Alle sieben oder keine“, View `haltungen_vollstaendig`).
-- Wie Maßnahmen: Entwürfe nur mit Zugang zur Testphase.

create table public.haltungen (
  id               smallint primary key,
  frage            text not null check (frage like '%?'),
  beschreibung     text not null,
  verwandte_themen smallint[] not null check (cardinality(verwandte_themen) > 0)
);

create table public.haltung_positionen (
  haltung_id         smallint not null references public.haltungen (id) on delete cascade,
  partei_id          smallint not null references public.parteien (id) on delete cascade,
  -- null = Bundesprogramm (zunächst nur Bund).
  land               text references public.laender (id) on delete cascade,
  position           text not null check (position in ('ja', 'nein', 'teils', 'keine_aussage')),
  kurzfassung        text,
  -- Bei Haltungen ist der Wortlaut der eigentliche Beleg – deshalb steht das Zitat (anders als bei Maßnahmen) hier.
  zitat              text,
  beleg_programm_url text,
  -- Nur bei „keine_aussage“: was durchsucht wurde.
  begruendung        text,
  stand              date not null,
  ki_entwurf         boolean not null default false,
  check (
    (position = 'keine_aussage' and begruendung is not null and kurzfassung is null and zitat is null and beleg_programm_url is null)
    or (position <> 'keine_aussage' and kurzfassung is not null and zitat is not null and beleg_programm_url is not null)
  ),
  unique nulls not distinct (haltung_id, partei_id, land)
);

create table public.haltung_zielkonflikte (
  id         serial primary key,
  haltung_id smallint not null references public.haltungen (id) on delete cascade,
  seite      text not null check (seite in ('ja', 'nein')),
  text       text not null,
  quelle_url text not null
);
create index on public.haltung_zielkonflikte (haltung_id);

alter table public.haltungen enable row level security;
alter table public.haltung_positionen enable row level security;
alter table public.haltung_zielkonflikte enable row level security;
create policy "Haltungen lesen"     on public.haltungen             for select to anon, authenticated using (true);
create policy "Positionen lesen"    on public.haltung_positionen    for select to anon, authenticated using (not ki_entwurf);
create policy "Zielkonflikte lesen" on public.haltung_zielkonflikte for select to anon, authenticated using (true);

-- „Alle sieben oder keine“: Haltungen, zu denen jede Partei eine Position im Bundesprogramm hat. Läuft mit den
-- Rechten der Abfragenden (security_invoker): Öffentlich zählen nur geprüfte Positionen. Die Edge Function
-- (Service-Rolle, sieht alles) nimmt ohne Zugang zur Testphase nur Zeilen mit `geprueft`.
-- Dieselbe Regel nutzt die App: supabase/functions/_shared/haltung.ts → vollstaendigeHaltungen.
create view public.haltungen_vollstaendig with (security_invoker = true) as
select h.id as haltung_id,
  not exists (
    select 1 from public.parteien p
    where not exists (
      select 1 from public.haltung_positionen x
      where x.haltung_id = h.id and x.partei_id = p.id and x.land is null and not x.ki_entwurf
    )
  ) as geprueft
from public.haltungen h
where exists (select 1 from public.parteien)
  and not exists (
    select 1 from public.parteien p
    where not exists (
      select 1 from public.haltung_positionen x
      where x.haltung_id = h.id and x.partei_id = p.id and x.land is null
    )
  );
grant select on public.haltungen_vollstaendig to anon, authenticated;

-- Eine Haltung ohne Problem merkt sich die erkannte Wertfrage (nur die ID, kein Text der Person).
alter table public.runden add column haltung_id smallint references public.haltungen (id) on delete set null;
alter table public.runden add constraint runden_haltung_nur_wert check (haltung_id is null or status = 'wert');

-- Testphase: Entwürfe der Positionen gehören zu den KI-Entwürfen.
create or replace function public.testphase_daten(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not testphase_zugang_gueltig(p_token) then
    return null;
  end if;
  return jsonb_build_object(
    'massnahmen',         coalesce((select jsonb_agg(to_jsonb(m) order by m.id) from massnahmen m where m.ki_entwurf), '[]'::jsonb),
    'abdeckung',          coalesce((select jsonb_agg(to_jsonb(a)) from abdeckung a where a.ki_entwurf), '[]'::jsonb),
    'instrumente',        coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from instrumente i where i.ki_entwurf), '[]'::jsonb),
    'haltung_positionen', coalesce((select jsonb_agg(to_jsonb(p) order by p.haltung_id, p.partei_id) from haltung_positionen p where p.ki_entwurf), '[]'::jsonb)
  );
end;
$$;

-- ===== migrations/20261010000000_review_eingaben.sql =====
-- Politik-Duell – Eingaben ohne Wertung zur Durchsicht
--
-- Endet eine Runde ohne Wertung (Grenze, Haltung, Forderung, Thema unbekannt oder ohne erkennbare Ursache,
-- Partei noch nicht erfasst), speichert die Edge Function die Eingaben der Spielenden im Wortlaut, damit die
-- Betreiberin prüfen kann, ob die KI richtig eingeordnet hat. Anders als `runden` enthält die Tabelle den
-- Originaltext – deshalb:
--   - nur Admins lesen und löschen, die App (anon) sieht nichts;
--   - keine Verbindung zu `runden`, keine Parteien, keine Rolle, kein Bundesland;
--   - nach 30 Tagen automatisch gelöscht (bei jedem neuen Eintrag und, falls pg_cron aktiv ist, täglich);
--   - „Gesichtet“ in der Admin-Ansicht löscht den Eintrag sofort.

create table public.review_eingaben (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  -- Warum die Runde ohne Wertung blieb (Rundenstatus bzw. Typ der KI-Einordnung)
  grund           text not null check (grund in ('grenze', 'wert', 'forderung', 'ungeprueft', 'unvollstaendig')),
  -- Die Eingaben der Runde im Wortlaut: erste Schilderung und Antworten auf höchstens zwei Nachfragen
  eingaben        text[] not null check (
    cardinality(eingaben) between 1 and 3 and char_length(array_to_string(eingaben, '')) <= 6000
  ),
  -- Einordnung der KI, soweit vorhanden (bei Grenze beides leer)
  thema_id        smallint references public.themen (id) on delete set null,
  zusammenfassung text check (char_length(zusammenfassung) <= 200),
  constraint review_eingaben_grenze_ohne_einordnung check (
    grund <> 'grenze' or (thema_id is null and zusammenfassung is null)
  )
);

create index on public.review_eingaben (created_at desc);

alter table public.review_eingaben enable row level security;

create policy "Admins lesen Eingaben ohne Wertung" on public.review_eingaben
  for select to authenticated using (public.ist_admin());
create policy "Admins löschen Eingaben ohne Wertung" on public.review_eingaben
  for delete to authenticated using (public.ist_admin());

-- Schreiben nur mit dem Service-Role-Key (Edge Function); Ändern gar nicht.
revoke insert, update on public.review_eingaben from anon, authenticated;
revoke all on public.review_eingaben from anon;

-- ---------------------------------------------------------------------------
-- Speicherfrist: 30 Tage
-- ---------------------------------------------------------------------------

create or replace function public.review_eingaben_aufraeumen()
returns void
language sql
security definer
set search_path = public
as $$
  delete from review_eingaben where created_at < now() - interval '30 days';
$$;

revoke all on function public.review_eingaben_aufraeumen() from public, anon, authenticated;

create or replace function public.review_eingaben_nach_einfuegen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform review_eingaben_aufraeumen();
  return null;
end;
$$;

create trigger review_eingaben_frist
  after insert on public.review_eingaben
  for each statement execute function public.review_eingaben_nach_einfuegen();

-- Zusätzlich täglich, damit die Frist auch gilt, wenn länger niemand spielt – nur wenn pg_cron aktiv ist
-- (Supabase-Dashboard → Database → Extensions). Später aktiviert: Auftrag einzeln anlegen, siehe EINRICHTEN.md.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('review_eingaben_aufraeumen', '17 3 * * *', 'select public.review_eingaben_aufraeumen()');
  end if;
end;
$$;

-- Admin-Ansicht bekommt neue Einträge live (Realtime beachtet Row Level Security).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.review_eingaben;
  end if;
end;
$$;

-- ===== migrations/20261011000000_ursachen_alltag.sql =====
-- Ursachen in der Sprache der Betroffenen für die Auswahl zum Antippen (nur Anzeige, keine Wertung).
alter table public.ursachen add column if not exists alltag text;

-- ===== migrations/20261012000000_runden_punkte_dezimal.sql =====
-- Politik-Duell – Rundenpunkte mit einer Nachkommastelle (docs/methode.md → „Mehrere Maßnahmen je Ursache“)
--
-- Je Ursache zählen mehrere Lösungswege einer Partei mit abnehmendem Gewicht (voll, ½, ¼ …), höchstens 9.
-- Die Summe kann daher halbe oder Viertelpunkte enthalten; sie wird auf eine Nachkommastelle gerundet.

alter table public.runden
  alter column punkte_a type numeric(5, 1),
  alter column punkte_b type numeric(5, 1);

commit;
