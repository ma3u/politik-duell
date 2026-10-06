-- AUTOMATISCH ERZEUGT aus daten/ (npm run seed) – nicht von Hand bearbeiten.
-- Teil von supabase/seed.sql: Thema 37 „Finanzierung von Sportvereinen und Sportstätten“ – Instrumente, Maßnahmen, Prüfeinheiten, Abdeckung.
-- Nach 0-gemeinsam.sql ausführen. Mehrfach ausführbar, gespielte Runden bleiben erhalten.

begin;

delete from public.massnahmen where thema_id = 37;
delete from public.abdeckung where thema_id = 37;
delete from public.pruef_einheiten where thema_id = 37;

delete from public.instrumente where thema_id = 37 and id not in (0);

commit;
