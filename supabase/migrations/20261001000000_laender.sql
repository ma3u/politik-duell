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
