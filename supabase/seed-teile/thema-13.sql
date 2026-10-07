-- AUTOMATISCH ERZEUGT aus daten/ (npm run seed) – nicht von Hand bearbeiten.
-- Teil von supabase/seed.sql: Thema 13 „Internet und Mobilfunk“ – Instrumente, Maßnahmen, Prüfeinheiten, Abdeckung.
-- Nach 0-gemeinsam.sql ausführen. Mehrfach ausführbar, gespielte Runden bleiben erhalten.

begin;

delete from public.massnahmen where thema_id = 13;
delete from public.abdeckung where thema_id = 13;
delete from public.pruef_einheiten where thema_id = 13;

-- Lösungswege für die Forderungskarte (ohne Punkte). Upsert, damit gespeicherte Forderungen ihren Verweis behalten.
insert into public.instrumente (id, thema_id, name, begruendung, evidenz, beleg_studie_url, ebene, entspricht, ki_entwurf, entwurf_herkunft) values
  (6966, 13, 'Genehmigungen beschleunigen, Netzausbau im überragenden öffentlichen Interesse, alternative Verlegemethoden', 'Verkürzt Genehmigungen für Masten und Leitungen und senkt Tiefbaukosten; wo sich der Ausbau wirtschaftlich nicht lohnt oder das Gelände schwierig ist, ändert das allein wenig.', 'gemischt', null, 'bund', null, true, null),
  (6967, 13, 'Staatliche Förderung gezielt dort, wo sich der private Ausbau nicht lohnt', 'Schließt Lücken, die der Markt nicht schließt; laut WIK ist die heutige Förderung aber teuer, anfällig für Überförderung und verdrängt teils privaten Ausbau – es kommt auf die Ausgestaltung an.', 'gemischt', 'https://www.wik.org/fileadmin/user_upload/Unternehmen/Veroeffentlichungen/Kurzstudien/2026/WIK_Kurzstudie_Anreizwirkung_der_derzeitigen_Gigabitfoerderung_auf_den_eigenwirtschaftlichen_Glasfaserausbau_in_Deutschland.pdf', 'bund', null, true, null),
  (6968, 13, 'Recht auf schnelles Internet: Mindestbandbreite erhöhen', 'Ein höherer Anspruch verpflichtet die Anbieter, auch unversorgte Haushalte anzuschließen; bei deutlich höheren Bandbreiten wird das teuer und langwierig, die Kosten tragen Anbieter oder Staat.', 'gemischt', null, 'bund', null, true, null),
  (6969, 13, 'Breitband- und Netzausbau auf dem Land voranbringen (ohne nähere Angaben)', 'Nennt das Ziel, aber keinen Weg, wie die Lücken geschlossen werden sollen.', 'offen', null, 'bund', null, true, null)
on conflict (id) do update set thema_id = excluded.thema_id, name = excluded.name, begruendung = excluded.begruendung,
  evidenz = excluded.evidenz, beleg_studie_url = excluded.beleg_studie_url, ebene = excluded.ebene,
  entspricht = excluded.entspricht, ki_entwurf = excluded.ki_entwurf, entwurf_herkunft = excluded.entwurf_herkunft;

delete from public.instrumente where thema_id = 13 and id not in (6966, 6967, 6968, 6969);

insert into public.massnahmen (id, thema_id, partei_id, land, beschreibung, ursachen_ids, instrument_id, wirksamkeit, umsetzbarkeit,
  rollen_modifikator, begruendung, beleg_programm_url, beleg_studie_url, evidenz, stand, geprueft, ki_entwurf, entwurf_herkunft) values
  (6970, 13, 11, null, 'Ausbau in die Fläche mit Wettbewerb, Kooperationsmodellen und verlässlicher Förderung', '{1301,1302}', 6967, 2, 3, null, 'Schließt Lücken, die der Markt nicht schließt; laut WIK ist die heutige Förderung aber teuer, anfällig für Überförderung und verdrängt teils privaten Ausbau – es kommt auf die Ausgestaltung an.', 'https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf#page=30', 'https://www.wik.org/fileadmin/user_upload/Unternehmen/Veroeffentlichungen/Kurzstudien/2026/WIK_Kurzstudie_Anreizwirkung_der_derzeitigen_Gigabitfoerderung_auf_den_eigenwirtschaftlichen_Glasfaserausbau_in_Deutschland.pdf', 'gemischt', '2026-09-30', false, true, null),
  (6971, 13, 11, null, 'Mobilfunk- und Glasfaserausbau ins überragende öffentliche Interesse stellen, Genehmigungsturbo', '{1301,1302}', 6966, 1, 3, null, 'Verkürzt Genehmigungen für Masten und Leitungen und senkt Tiefbaukosten; wo sich der Ausbau wirtschaftlich nicht lohnt oder das Gelände schwierig ist, ändert das allein wenig.', 'https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf#page=30', null, 'gemischt', '2026-09-30', false, true, null),
  (6972, 13, 12, null, 'Breitbandinternet in ländlichen Räumen ausbauen', '{1301}', 6969, 1, 3, null, 'Nennt das Ziel, aber keinen Weg, wie die Lücken geschlossen werden sollen.', 'https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf#page=52', null, 'offen', '2026-09-30', false, true, null),
  (6973, 13, 13, null, 'Genehmigungen beschleunigen, alternative Verlegemethoden, Open Access', '{1301,1302}', 6966, 1, 3, null, 'Verkürzt Genehmigungen für Masten und Leitungen und senkt Tiefbaukosten; wo sich der Ausbau wirtschaftlich nicht lohnt oder das Gelände schwierig ist, ändert das allein wenig.', 'https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf#page=35', null, 'gemischt', '2026-09-30', false, true, null),
  (6974, 13, 13, null, 'Gigabitförderung für ländliche und strukturschwache Regionen bedarfsorientiert erhöhen', '{1301}', 6967, 2, 3, null, 'Schließt Lücken, die der Markt nicht schließt; laut WIK ist die heutige Förderung aber teuer, anfällig für Überförderung und verdrängt teils privaten Ausbau – es kommt auf die Ausgestaltung an.', 'https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf#page=35', 'https://www.wik.org/fileadmin/user_upload/Unternehmen/Veroeffentlichungen/Kurzstudien/2026/WIK_Kurzstudie_Anreizwirkung_der_derzeitigen_Gigabitfoerderung_auf_den_eigenwirtschaftlichen_Glasfaserausbau_in_Deutschland.pdf', 'gemischt', '2026-09-30', false, true, null),
  (6975, 13, 13, null, 'Mindestbandbreite schrittweise erhöhen', '{1301}', 6968, 1, 2, null, 'Ein höherer Anspruch verpflichtet die Anbieter, auch unversorgte Haushalte anzuschließen; bei deutlich höheren Bandbreiten wird das teuer und langwierig, die Kosten tragen Anbieter oder Staat.', 'https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf#page=35', null, 'gemischt', '2026-09-30', false, true, null),
  (6976, 13, 14, null, 'Passgenaue Förderung nur, wo sich privater Ausbau nicht rechnet', '{1301,1302}', 6967, 2, 3, null, 'Schließt Lücken, die der Markt nicht schließt; laut WIK ist die heutige Förderung aber teuer, anfällig für Überförderung und verdrängt teils privaten Ausbau – es kommt auf die Ausgestaltung an.', 'https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf#page=38', 'https://www.wik.org/fileadmin/user_upload/Unternehmen/Veroeffentlichungen/Kurzstudien/2026/WIK_Kurzstudie_Anreizwirkung_der_derzeitigen_Gigabitfoerderung_auf_den_eigenwirtschaftlichen_Glasfaserausbau_in_Deutschland.pdf', 'gemischt', '2026-09-30', false, true, null),
  (6977, 13, 14, null, 'Mobilfunk- und Glasfaserausbau als überragendes öffentliches Interesse', '{1301,1302}', 6966, 1, 3, null, 'Verkürzt Genehmigungen für Masten und Leitungen und senkt Tiefbaukosten; wo sich der Ausbau wirtschaftlich nicht lohnt oder das Gelände schwierig ist, ändert das allein wenig.', 'https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf#page=41', null, 'gemischt', '2026-09-30', false, true, null),
  (6978, 13, 15, null, 'Ausbau der digitalen Infrastruktur beschleunigen', '{1301}', 6969, 1, 3, null, 'Nennt das Ziel, aber keinen Weg, wie die Lücken geschlossen werden sollen.', 'https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf#page=15', null, 'offen', '2026-09-30', false, true, null),
  (6979, 13, 16, null, 'Kommunalen und gemeinnützigen Glasfaserausbau fördern, Doppelausbau verhindern', '{1301}', null, 2, 2, null, 'Kommunale Netzgesellschaften haben in manchen Regionen Lücken geschlossen, die private Anbieter ließen; sie brauchen Kapital und Fachpersonal. Doppelausbau zu verhindern, kann Mittel für unversorgte Gebiete frei machen, schränkt aber Wettbewerb ein.', 'https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf#page=57', null, 'gemischt', '2026-09-30', false, true, null),
  (6980, 13, 16, null, 'Recht auf Internetzugang mit 100 Mbit/s', '{1301}', 6968, 1, 2, null, 'Ein höherer Anspruch verpflichtet die Anbieter, auch unversorgte Haushalte anzuschließen; bei deutlich höheren Bandbreiten wird das teuer und langwierig, die Kosten tragen Anbieter oder Staat.', 'https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf#page=57', null, 'gemischt', '2026-09-30', false, true, null),
  (6981, 13, 16, null, 'Ein gemeinsames Mobilfunk- und Glasfasernetz für alle Anbieter', '{1301,1302}', null, 1, 1, null, 'Ein gemeinsames Netz spart Doppelinvestitionen und kann Lücken schließen; laut Grundgesetz (Art. 87f) erbringen aber private Anbieter die Telekommunikation, ein Umbau der bestehenden Netze wäre rechtlich und finanziell sehr aufwendig.', 'https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf#page=57', null, 'offen', '2026-09-30', false, true, null),
  (6982, 13, 17, null, 'Schnelles Internet als staatliche Aufgabe gewährleisten', '{1301}', 6969, 1, 3, null, 'Nennt das Ziel, aber keinen Weg, wie die Lücken geschlossen werden sollen.', 'https://bsw-vg.de/wp-content/themes/bsw/assets/downloads/BSW%20Wahlprogramm%202025.pdf#page=16', null, 'offen', '2026-09-30', false, true, null),
  (8545, 13, 18, null, 'Gezielte Förderung und Subventionen für den Internetausbau in ländlichen Regionen.', '{1301}', 6967, 2, 3, null, 'Schließt Lücken, die der Markt nicht schließt; laut WIK ist die heutige Förderung aber teuer, anfällig für Überförderung und verdrängt teils privaten Ausbau – es kommt auf die Ausgestaltung an.', 'https://voltdeutschland.org/storage/assets-btw25/volt-programm-bundestagswahl-2025.pdf#page=72', 'https://www.wik.org/fileadmin/user_upload/Unternehmen/Veroeffentlichungen/Kurzstudien/2026/WIK_Kurzstudie_Anreizwirkung_der_derzeitigen_Gigabitfoerderung_auf_den_eigenwirtschaftlichen_Glasfaserausbau_in_Deutschland.pdf', 'gemischt', '2026-10-07', false, true, null),
  (8546, 13, 18, null, 'Glasfaserausbau beschleunigen: Hürden und Genehmigungsverfahren abbauen, Koordination von Bund, Ländern und Kommunen verbessern.', '{1301}', 6966, 1, 3, null, 'Verkürzt Genehmigungen für Masten und Leitungen und senkt Tiefbaukosten; wo sich der Ausbau wirtschaftlich nicht lohnt oder das Gelände schwierig ist, ändert das allein wenig.', 'https://voltdeutschland.org/storage/assets-btw25/volt-programm-bundestagswahl-2025.pdf#page=72', null, 'gemischt', '2026-10-07', false, true, null),
  (8547, 13, 18, null, 'Anbieter sollen Netzinfrastruktur stärker gemeinsam nutzen.', '{1302}', null, 1, 3, null, 'Gemeinsam genutzte Masten senken Kosten und können Funklöcher schließen (Großbritannien: Shared Rural Network); dort wirkte Sharing aber mit Versorgungsauflagen und Staatsgeld zusammen, hier bleibt es unverbindlich und zielt auf Nachhaltigkeit.', 'https://voltdeutschland.org/storage/assets-btw25/volt-programm-bundestagswahl-2025.pdf#page=72', 'https://www.gov.uk/government/publications/shared-rural-network-srn-progress-update-september-2024/shared-rural-network-srn-progress-update-september-2024', 'gemischt', '2026-10-07', false, true, 'blind');

select setval(pg_get_serial_sequence('public.massnahmen', 'id'), (select max(id) from public.massnahmen));

-- Was Prüfende je Thema bewerten (auch ungeprüfte Einträge): Instrumente und Maßnahmen ohne Instrument.
insert into public.pruef_einheiten (id, thema_id) values
  (6966, 13),
  (6967, 13),
  (6968, 13),
  (6969, 13),
  (6979, 13),
  (6981, 13),
  (8547, 13);

insert into public.abdeckung (thema_id, partei_id, land, art, begruendung, stand, ki_entwurf, durchsucht_fuer) values
  (13, 11, null, 'massnahmen', null, '2026-09-30', true, null),
  (13, 12, null, 'massnahmen', null, '2026-09-30', true, null),
  (13, 13, null, 'massnahmen', null, '2026-09-30', true, null),
  (13, 14, null, 'massnahmen', null, '2026-09-30', true, null),
  (13, 15, null, 'massnahmen', null, '2026-09-30', true, null),
  (13, 16, null, 'massnahmen', null, '2026-09-30', true, null),
  (13, 17, null, 'massnahmen', null, '2026-09-30', true, null),
  (13, 18, null, 'massnahmen', null, '2026-10-07', true, '{1301,1302}');

commit;
