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
