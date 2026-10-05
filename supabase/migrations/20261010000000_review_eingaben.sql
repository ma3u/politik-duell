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
