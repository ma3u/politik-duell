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
