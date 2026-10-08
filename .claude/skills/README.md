# Ablauf der Skills und Agenten

Die Skills bauen den Katalog für die **geschlossene Testphase** auf: alles als KI-Entwurf mit KI-Freigabe (`"freigabe": { "art": "ki" }`), ohne menschliche Prüfschritte unterwegs. Menschen prüfen danach (Bewertung in der App, Belegprüfung, blinde Einordnung der Haltungen – `daten/README.md` → „Prüfung“); erst dann wird etwas öffentlich.

```mermaid
flowchart TD
    L["/liste-einordnen<br/>Liste sortieren: Haltung, Forderung, Thema,<br/>Grenze, Pauschal, Tatsache, Meta, doppelt"]
    LB["Betreiberin hakt ab (oder --direkt)"]
    L --> LB
    LB -->|Haltungen| H1
    LB -->|Themen| T1
    LB -->|Forderungen| F1
    LB -->|alle| EV["docs/prompt-evaluation.md"]
    subgraph T["Themen"]
        T1["/thema-anlegen<br/>Programme gesperrt · Agent ursachen-recherche<br/>Ursachen, Leitfaden, Suchbegriffe"]
        T2["KI-Freigabe · eigener Commit"]
        T3["/thema-erfassen<br/>je Programm Agent programm-erfassung (Zitat, Seite)<br/>Skripte prüfen, Rückfragen nur bei Skriptfehlern"]
        T4["entwurf:blind → Agent blind-bewertung<br/>ohne Parteinamen: Werte, Instrumente, Zuordnung"]
        T5["entwurf:eintragen · Prüfungen · Archiv · Pull Request"]
        T1 --> T2 --> T3 --> T4 --> T5
    end
    subgraph F["Forderungen"]
        F1["/forderung-erfassen<br/>npm run instrumente: schon vorhanden?"]
        F2["neue Suchbegriffe im Leitfaden<br/>Nachtrag nur in erfassten Programmen<br/>mehrere Themen: ein Agent je Programm (entwurf:sammelauftrag)"]
        F1 --> F2 --> T4
    end
    subgraph H["Haltungen"]
        H1["/haltung-anlegen<br/>Programme gesperrt · je Haltung Agent haltung-recherche (parallel)<br/>Frage, Zielkonflikte, Einordnung, Suchbegriffe · KI-Freigabe · Commit"]
        H2["/haltung-erfassen (alle Haltungen in einem Lauf)<br/>je Programm ein Agent haltung-erfassung für alle Fragen"]
        H3["haltung:blind → ein Agent haltung-einordnung<br/>ohne Parteinamen: ja/nein/teils, Kurzfassung"]
        H4["haltung:eintragen (mind. 3 erkennbare Positionen)"]
        H1 --> H2 --> H3 --> H4
    end
    T5 --> P["Später: menschliche Prüfung ersetzt KI-Freigabe und KI-Entwurf"]
    H4 --> P
```

## Was die Neutralität sichert (auch ohne menschliche Prüfung)

| Sicherung | Wie |
|---|---|
| Ursachen und Fragen vor den Programmen | Phase A mit Programmsperre (`npm run phase-a`, Hook `.claude/hooks/sperre.mjs`); eigener Commit mit KI-Freigabe, bevor erfasst wird – `daten:id --gegen` prüft das am Commit-Verlauf |
| Gleiche Suche für alle | Suchbegriffe und Leitfaden je Thema bzw. Haltung, für alle Programme gleich, von Skripten gezählt |
| Belegte Zitate | Jeder Erfassungs-Agent prüft sein Zitat gegen die PDF-Seite (`entwurf:programm-pruefen`, `haltung:programm-pruefen`); `zitate:pruefen` in der CI |
| Urteil ohne Parteinamen | `blind-bewertung` und `haltung-einordnung` sehen nur neutralisierte Listen; der Hook sperrt ihnen alles andere |
| Keine Eingriffe der Koordination | Sie liest keine Programme und vergibt keine Werte; Rückfragen nur bei Skriptfehlern und im Protokoll |
| Fehlende Daten kosten nichts | Nicht durchsuchte Programme bleiben „noch nicht erfasst“, nie „keine Maßnahme“ |

## Sparsam

- Skripte statt Agenten, wo es geht (zählen, Fundstellen, Zitate, Zusammenführen, Bericht).
- Keine inhaltlichen Rückfragen, keine Nachrecherche der Koordination, eine Runde für die Suchbegriffe.
- Bund und Länder in einem Durchgang, mehrere Themen oder Haltungen je Aufruf.
- Modelle fest in den Agentenbeschreibungen: Erfassung `sonnet`, Recherche, Bewertung und Einordnung `opus`. Die Koordination startet vor allem Skripte und kann deshalb mit `sonnet` laufen, ohne dass sich Urteile ändern.
- Kurze Überblicke: `themen:ueberblick -- --kurz` (eine Zeile je Thema) und `-- --haltungen` (ID und Frage) statt ganzer Dateien.
- Forderungen gebündelt: mehrere Themen in einem `/forderung-erfassen`, ein Erfassungs-Agent je Programm für alle Themen (`entwurf:sammelauftrag`); bewertet wird weiter je Thema.
- Haltungen gebündelt: sieben Erfassungs-Agenten und ein Einordnungs-Agent je Lauf, gleich wie viele Haltungen (bis 15); jedes Programm wird einmal gelesen.
- Lange Listen erst sortieren (`/liste-einordnen`), dann nur das Bestätigte anlegen – ein Block je Aufruf, mit `/clear` dazwischen.
- Keine Dokumentpflege außer dem Abschnitt in `docs/perspektiven-ursachen.md` bzw. `docs/haltungen.md`; der Rest steht in Protokoll und Pull Request.

## Grundlage

- Skills: [liste-einordnen](liste-einordnen/SKILL.md), [thema-anlegen](thema-anlegen/SKILL.md), [thema-erfassen](thema-erfassen/SKILL.md), [forderung-erfassen](forderung-erfassen/SKILL.md), [haltung-anlegen](haltung-anlegen/SKILL.md), [haltung-erfassen](haltung-erfassen/SKILL.md)
- Agenten: [ursachen-recherche](../agents/ursachen-recherche.md), [programm-erfassung](../agents/programm-erfassung.md), [blind-bewertung](../agents/blind-bewertung.md), [haltung-recherche](../agents/haltung-recherche.md), [haltung-erfassung](../agents/haltung-erfassung.md), [haltung-einordnung](../agents/haltung-einordnung.md)
- Evaluationen der Erfassung: [thema-erfassen/evals/](thema-erfassen/evals/)
