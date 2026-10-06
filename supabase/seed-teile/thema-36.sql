-- AUTOMATISCH ERZEUGT aus daten/ (npm run seed) – nicht von Hand bearbeiten.
-- Teil von supabase/seed.sql: Thema 36 „Leerstand und Geschäftsschließungen in Innenstädten“ – Instrumente, Maßnahmen, Prüfeinheiten, Abdeckung.
-- Nach 0-gemeinsam.sql ausführen. Mehrfach ausführbar, gespielte Runden bleiben erhalten.

begin;

delete from public.massnahmen where thema_id = 36;
delete from public.abdeckung where thema_id = 36;
delete from public.pruef_einheiten where thema_id = 36;

delete from public.instrumente where thema_id = 36 and id not in (0);

commit;
