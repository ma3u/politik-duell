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
