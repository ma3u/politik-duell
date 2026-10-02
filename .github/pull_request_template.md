## Was ändert sich?

<!-- Kurz beschreiben. -->

## Bei Änderungen im Datenkatalog (`daten/`)

- [ ] Ursachen stammen aus unabhängigen Quellen und wurden **vor** dem Blick in die Wahlprogramme festgelegt
- [ ] Jede neue Maßnahme hat einen Beleg mit Seitenanker (`#page=N`) im Programm der richtigen Partei
- [ ] Für jede Partei ist das Thema abgedeckt: Maßnahmen oder `keine_massnahme` mit Begründung
- [ ] Bewertung nach dem Maßstab in [`daten/README.md`](../daten/README.md), mit neutraler Begründung
- [ ] `geprueft: true` nur mit mindestens zwei Bewertungen durch eingeladene Prüfende (`bewertung.anzahl` ≥ 2) und kontrollierten Belegen (Zitat, Seite)
- [ ] Bei halben Medianen oder Spannweite ≥ 2: Entscheidung bzw. Klärung hier begründet
- [ ] `npm run daten:pruefen` und `npm run seed` ausgeführt

## Freigabe durch die Betreiberin (Ja/Nein, je Punkt ankreuzen oder „nein“ mit Grund)

Bei neuen Ursachen oder neuem Ziel (Phase A):

- [ ] Ziel und jede Ursache beschreiben, was schiefläuft – keinen Lösungsweg und keine Partei
- [ ] Jede Quelle im Original geöffnet, Zahl und Jahr stimmen (Belegstufe A oder B, sonst C mit zweiter Quelle aus A/B)
- [ ] Keine Partei-, Fraktions- oder parteinahe Stiftungsquelle; Stiftungen, Thinktanks, Verbände und Ministerien nur mit eigenen Daten und zweiter Quelle
- [ ] Die Perspektivenprüfung nennt je Ursache die Lösungsrichtungen aus verschiedenen Lagern; Verworfenes mit gleichem Maßstab begründet
- [ ] Ebene je Ursache passt
- [ ] Kein Wahlprogramm angesehen (Phase A mit `npm run phase-a`)
- [ ] `freigabe` mit Datum und bestätigten Quellen eingetragen

Bei Maßnahmen (Phase B–D):

- [ ] `npm run ursachen:freigegeben` lief durch; Ursachen und Ziel sind in diesem Pull Request unverändert
- [ ] Jede Lösungsrichtung hatte eigene Suchbegriffe; Treffermatrix und ihre Hinweise sind erledigt oder begründet
- [ ] Verdächtige Reste der Blindliste sind begründet oder behoben
- [ ] Der Leitfaden (`daten/leitfaeden/<ID>.json`) mit Regeln und Bündeln passt; neue Bündel sind genannt
- [ ] Alle Programme wurden mit demselben Modell erfasst (Modelle hier genannt)
- [ ] Die Zuordnung zu Ursachen hat die Bewertung ohne Parteinamen entschieden; die Bilanz je Programm steht hier, Hinweise zur Mehrfachzuordnung sind für alle Programme gleich erledigt
- [ ] Nicht blind geänderte Werte tragen `entwurf_herkunft: nicht_blind` und sind hier begründet
- [ ] Nicht durchsuchte Programme sind genannt (bleiben „noch nicht erfasst“, nie `keine_massnahme`)
