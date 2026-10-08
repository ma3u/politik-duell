-- AUTOMATISCH ERZEUGT aus daten/ (npm run seed) – nicht von Hand bearbeiten.
-- Teil von supabase/seed.sql: Thema 35 „Kosten für den Führerschein“ – Instrumente, Maßnahmen, Prüfeinheiten, Abdeckung.
-- Nach 0-gemeinsam.sql ausführen. Mehrfach ausführbar, gespielte Runden bleiben erhalten.

begin;

delete from public.massnahmen where thema_id = 35;
delete from public.abdeckung where thema_id = 35;
delete from public.pruef_einheiten where thema_id = 35;

-- Lösungswege für die Forderungskarte (ohne Punkte). Upsert, damit gespeicherte Forderungen ihren Verweis behalten.
insert into public.instrumente (id, thema_id, name, begruendung, evidenz, beleg_studie_url, ebene, entspricht, ki_entwurf, entwurf_herkunft) values
  (9478, 35, 'Zuschuss oder steuerfreie Förderung des Führerscheins für Auszubildende und junge Beschäftigte (Bund)', 'Entlastet Auszubildende direkt und ist steuerrechtlich einfach umsetzbar; senkt aber nicht die Preise selbst, erreicht nur Geförderte und birgt Mitnahmeeffekte, wie Erfahrungen mit Führerscheinförderung in Frankreich zeigen.', 'offen', null, 'bund', null, true, 'blind'),
  (9479, 35, 'Reform der Fahrausbildung zur Kostensenkung: digitale Theorie, Simulatoren, weniger Vorgaben (Bund)', 'Setzt an Ausbildungsvorgaben an, die Preise und Prüfungserfolg prägen; der Bund regelt dies per Verordnung. Simulatoren decken laut Forschung viele Lernziele ab, Transfer in den Verkehr und Folgen für die Sicherheit sind aber nicht abschließend geklärt.', 'gemischt', null, 'bund', null, true, 'blind'),
  (9480, 35, 'Begleitetes Fahren bzw. begleitetes Üben ab 16 Jahren (Bund)', 'Mehr begleitete Fahrpraxis senkt laut BASt-Evaluation das Unfallrisiko von Fahranfängern deutlich; Kosten und Durchfallquoten berührt sie nur am Rand. EU-Recht sieht begleitetes Fahren ab 17 vor, ab 16 ginge nur als Übungsphase vor der Prüfung.', 'belegt', 'https://trid.trb.org/View/940676', 'bund', null, true, 'blind')
on conflict (id) do update set thema_id = excluded.thema_id, name = excluded.name, begruendung = excluded.begruendung,
  evidenz = excluded.evidenz, beleg_studie_url = excluded.beleg_studie_url, ebene = excluded.ebene,
  entspricht = excluded.entspricht, ki_entwurf = excluded.ki_entwurf, entwurf_herkunft = excluded.entwurf_herkunft;

delete from public.instrumente where thema_id = 35 and id not in (9478, 9479, 9480);

insert into public.massnahmen (id, thema_id, partei_id, land, beschreibung, ursachen_ids, instrument_id, wirksamkeit, umsetzbarkeit,
  rollen_modifikator, begruendung, beleg_programm_url, beleg_studie_url, evidenz, stand, geprueft, ki_entwurf, entwurf_herkunft) values
  (9481, 35, 11, null, 'Führerschein für junge Menschen bezahlbar machen, indem Bürokratie abgebaut und die Fahrausbildung effizienter gestaltet wird', '{3501,3502}', 9479, 2, 3, null, 'Setzt an Ausbildungsvorgaben an, die Preise und Prüfungserfolg prägen; der Bund regelt dies per Verordnung. Simulatoren decken laut Forschung viele Lernziele ab, Transfer in den Verkehr und Folgen für die Sicherheit sind aber nicht abschließend geklärt.', 'https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf#page=74', null, 'gemischt', '2026-10-08', false, true, 'blind'),
  (9482, 35, 12, null, 'Fahrausbildung samt Theorieunterricht reformieren, im Sinne von Verkehrssicherheit und Effizienz und mit dem Ziel spürbar geringerer Kosten', '{3502,3501}', 9479, 2, 3, null, 'Setzt an Ausbildungsvorgaben an, die Preise und Prüfungserfolg prägen; der Bund regelt dies per Verordnung. Simulatoren decken laut Forschung viele Lernziele ab, Transfer in den Verkehr und Folgen für die Sicherheit sind aber nicht abschließend geklärt.', 'https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf#page=36', null, 'gemischt', '2026-10-08', false, true, 'blind'),
  (9483, 35, 12, null, 'Mobilitätspass mit 500 Euro Guthaben für alle jungen Menschen im 17. Lebensjahr, nutzbar u. a. für Führerscheinkosten', '{3501}', null, 1, 2, null, 'Ein Guthaben von 500 Euro lindert die Kosten für alle Jugendlichen, senkt aber nicht die Preise und ist auf mehrere Zwecke verteilt; jährliche Kosten von mehreren hundert Millionen Euro sind nicht gegenfinanziert.', 'https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf#page=36', null, 'offen', '2026-10-08', false, true, 'blind'),
  (9484, 35, 12, null, 'Arbeitgeber sollen Auszubildenden und jungen Beschäftigten einen Führerscheinzuschuss bis 2.000 Euro steuer- und abgabenfrei zahlen können', '{3501}', 9478, 1, 3, null, 'Entlastet Auszubildende direkt und ist steuerrechtlich einfach umsetzbar; senkt aber nicht die Preise selbst, erreicht nur Geförderte und birgt Mitnahmeeffekte, wie Erfahrungen mit Führerscheinförderung in Frankreich zeigen.', 'https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf#page=36', null, 'offen', '2026-10-08', false, true, 'blind'),
  (9485, 35, 13, null, 'Führerscheinerwerb für Menschen in Ausbildung finanziell fördern', '{3501}', 9478, 1, 3, null, 'Entlastet Auszubildende direkt und ist steuerrechtlich einfach umsetzbar; senkt aber nicht die Preise selbst, erreicht nur Geförderte und birgt Mitnahmeeffekte, wie Erfahrungen mit Führerscheinförderung in Frankreich zeigen.', 'https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf#page=78', null, 'offen', '2026-10-08', false, true, 'blind'),
  (9486, 35, 14, null, 'Führerschein und Lkw-/Bus-Führerschein günstiger machen: keine Tagesobergrenze für Theorieunterricht, Theorie digital, Fahrsimulatoren in der Ausbildung', '{3502,3501}', 9479, 2, 3, null, 'Setzt an Ausbildungsvorgaben an, die Preise und Prüfungserfolg prägen; der Bund regelt dies per Verordnung. Simulatoren decken laut Forschung viele Lernziele ab, Transfer in den Verkehr und Folgen für die Sicherheit sind aber nicht abschließend geklärt.', 'https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf#page=42', null, 'gemischt', '2026-10-08', false, true, 'blind'),
  (9487, 35, 14, null, 'Prüfungsmarkt für weitere Anbieter öffnen und Fahrprüfer-Weiterbildung ohne Ingenieursstudium, um mehr Prüftermine und kürzere Wartezeiten zu erreichen', '{3501}', null, 1, 2, null, 'Mehr Prüfanbieter und Prüfer können Wartezeiten und dadurch nötige Zusatzstunden verringern; die Prüfgebühren sind aber staatlich festgesetzt, Kostenwirkung und Folgen für die Prüfqualität sind kaum untersucht, die Prüferausbildung braucht Zeit.', 'https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf#page=42', null, 'offen', '2026-10-08', false, true, 'blind'),
  (9488, 35, 14, null, 'Begleitetes Fahren schon ab 16 Jahren ermöglichen, damit frühe Fahrpraxis die Verkehrssicherheit erhöht', '{3502}', 9480, 1, 2, null, 'Mehr begleitete Fahrpraxis senkt laut BASt-Evaluation das Unfallrisiko von Fahranfängern deutlich; Kosten und Durchfallquoten berührt sie nur am Rand. EU-Recht sieht begleitetes Fahren ab 17 vor, ab 16 ginge nur als Übungsphase vor der Prüfung.', 'https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf#page=42', 'https://trid.trb.org/View/940676', 'belegt', '2026-10-08', false, true, 'blind'),
  (9489, 35, 15, null, 'Begleitetes Fahren schon ab 16 Jahren ermöglichen', '{3502}', 9480, 1, 2, null, 'Mehr begleitete Fahrpraxis senkt laut BASt-Evaluation das Unfallrisiko von Fahranfängern deutlich; Kosten und Durchfallquoten berührt sie nur am Rand. EU-Recht sieht begleitetes Fahren ab 17 vor, ab 16 ginge nur als Übungsphase vor der Prüfung.', 'https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf#page=43', 'https://trid.trb.org/View/940676', 'belegt', '2026-10-08', false, true, 'blind');

select setval(pg_get_serial_sequence('public.massnahmen', 'id'), (select max(id) from public.massnahmen));

-- Was Prüfende je Thema bewerten (auch ungeprüfte Einträge): Instrumente und Maßnahmen ohne Instrument.
insert into public.pruef_einheiten (id, thema_id) values
  (9478, 35),
  (9479, 35),
  (9480, 35),
  (9483, 35),
  (9487, 35);

insert into public.abdeckung (thema_id, partei_id, land, art, begruendung, stand, ki_entwurf, durchsucht_fuer) values
  (35, 11, null, 'massnahmen', null, '2026-10-08', true, '{3501,3502}'),
  (35, 12, null, 'massnahmen', null, '2026-10-08', true, '{3501,3502}'),
  (35, 13, null, 'massnahmen', null, '2026-10-08', true, '{3501,3502}'),
  (35, 14, null, 'massnahmen', null, '2026-10-08', true, '{3501,3502}'),
  (35, 15, null, 'massnahmen', null, '2026-10-08', true, '{3501,3502}'),
  (35, 16, null, 'keine', 'Inhaltsverzeichnis (S. 2–3), Kapitel 9 ‚Mobilität für alle‘ (S. 36–37), Kapitel 10 ‚Ausbilden, sonst wird umgelegt‘ (S. 39–40), Preisaufsicht (S. 7) und Fundstellen S. 10, 14, 38 gelesen; nichts zu Fahrschulkosten, Führerscheingebühren oder Fahrausbildung und -prüfung.', '2026-10-08', true, '{3501,3502}'),
  (35, 17, null, 'keine', 'Kapitel ''Verkehrspolitik für alle statt Bevormundung und Verbote'' (S. 28–30), Bildungskapitel mit Berufsausbildung (S. 24–25) und Familien-/Jugendpolitik (S. 31–32) gelesen; nichts zu Fahrschul- oder Prüfungskosten, Führerscheinförderung oder Fahrausbildung und -prüfung. Suche nach Führerschein, Fahrschule, Prüfung u. a. ohne Treffer.', '2026-10-08', true, '{3501,3502}'),
  (35, 18, null, 'keine', 'Inhaltsverzeichnis (S. 2–4), Kapitel ‚Nachhaltige Mobilität‘ (S. 68–71) und ‚Berufsbildung und lebenslanges Lernen‘ inkl. ‚Finanzierung von Studium und Ausbildung‘ (S. 116–117) sowie Fundstelle S. 69 gelesen; nichts zu Kosten, Gebühren, Ausbildung oder Prüfung für die Fahrerlaubnis.', '2026-10-08', true, '{3501,3502}');

commit;
