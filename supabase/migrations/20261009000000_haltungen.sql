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
