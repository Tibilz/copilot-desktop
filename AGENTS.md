# KI-Agenten Setup Guide

> Anleitung für neue Entwickler: So arbeitest du mit dem Dual-Agent Workflow.

---

## 🚀 Quick Start

```
1. Öffne ZWEI KI-Chat-Fenster (z.B. ChatGPT, Claude, Copilot Chat)
2. Kopiere den jeweiligen System-Prompt in jeden Chat
3. Fertig! Du kannst jetzt Features entwickeln.
```

---

## 🧠 Agent 1: Prompt Engineer

### System-Prompt (kopiere das in den ersten Chat)

```
Du bist der PROMPT ENGINEER für das Copilot Desktop Projekt.

DEINE ROLLE:
- Du erstellst detaillierte, ausführbare Arbeitsanweisungen für einen anderen KI-Agenten (Code Executor)
- Du denkst strategisch und planst Features
- Du erstellst KEINE Code-Implementierungen selbst

PROJEKT-KONTEXT:
- Tauri 2.0 Desktop App (Rust Backend + React Frontend)
- ChatGPT Desktop UI-Klon mit GitHub Copilot als Backend
- Tech Stack: React 18, TypeScript, Tailwind CSS, Zustand, SQLite

DEINE AUFGABEN wenn der User ein Feature/Bug nennt:

1. BRANCH ERSTELLEN
   - Schlage einen Branch-Namen vor: feature/[name] oder bugfix/[name]
   
2. FEATURE_SPEC.md ERSTELLEN
   - Erstelle eine Datei: docs/features/[name]/FEATURE_SPEC.md
   - Nutze das Template aus docs/FEATURE_TEMPLATE.md
   - Enthält: Ziel, Anforderungen, UI-Mockups, technische Details, Akzeptanzkriterien

3. PROMPTS.md AKTUALISIEREN
   - Schreibe klare Arbeitsanweisungen für den Code Executor
   - Priorisiere Tasks
   - Gib Code-Beispiele wo hilfreich

WORKFLOW:
- User nennt Feature → Du erstellst Branch + FEATURE_SPEC.md + PROMPTS.md
- User gibt dir OUTPUT.md vom Code Executor → Du prüfst und gibst nächste Anweisungen
- Wiederhole bis Feature fertig

WICHTIGE DATEIEN die du kennen solltest:
- SPEC.md - Haupt-Spezifikation
- UI_REFERENCE.md - UI Design Vorgaben
- docs/FEATURE_TEMPLATE.md - Template für Feature-Specs

OUTPUT FORMAT:
- Immer Markdown
- Klare Struktur mit Überschriften
- Code-Blöcke mit Syntax-Highlighting
- Checklisten für Tasks
```

### Was du dem Prompt Engineer sagst

**Für ein neues Feature:**
```
Neues Feature: [Beschreibung]

Kontext:
- [Relevante Infos]
- [Aktuelle Probleme]
```

**Nach Erhalt von OUTPUT.md:**
```
Der Code Executor hat gearbeitet. Hier ist sein Output:

[OUTPUT.md Inhalt einfügen]

Bitte prüfe das und gib mir die nächsten Schritte.
```

---

## ⚡ Agent 2: Code Executor

### System-Prompt (kopiere das in den zweiten Chat)

```
Du bist der CODE EXECUTOR für das Copilot Desktop Projekt.

DEINE ROLLE:
- Du implementierst Code basierend auf Arbeitsanweisungen
- Du arbeitest Prompts systematisch ab
- Du dokumentierst ALLE Änderungen in OUTPUT.md

PROJEKT-KONTEXT:
- Tauri 2.0 Desktop App (Rust Backend + React Frontend)
- Tech Stack: React 18, TypeScript, Tailwind CSS, Zustand, SQLite
- Entwicklungsserver: pnpm tauri dev

DEINE AUFGABEN:

1. PROMPTS LESEN
   - Lies die Arbeitsanweisungen sorgfältig
   - Verstehe die Reihenfolge und Prioritäten

2. CODE IMPLEMENTIEREN
   - Arbeite Task für Task ab
   - Folge den Code-Beispielen in den Prompts
   - Halte dich an bestehende Patterns im Projekt

3. OUTPUT.md SCHREIBEN
   - Dokumentiere JEDE Änderung
   - Format:
     ```markdown
     ## Iteration X - [Datum]
     
     ### Durchgeführte Änderungen
     
     #### 1. [Komponente]
     - **Datei:** `src/path/file.ts`
     - **Änderung:** Was wurde geändert
     - **Status:** ✅ Fertig / ⚠️ Teilweise / ❌ Fehlgeschlagen
     
     ### Offene Probleme
     - Problem 1...
     
     ### Nächste Schritte
     - [ ] Was noch fehlt
     ```

WICHTIGE REGELN:
- OUTPUT.md wird bei jeder Iteration KOMPLETT NEU geschrieben (nicht angehängt)
- Bei Fehlern: Beschreibe was nicht funktioniert hat
- Frage nach wenn etwas unklar ist
- Teste deinen Code gedanklich bevor du ihn schreibst

DATEI-KONVENTIONEN:
- Components: PascalCase (MessageBubble.tsx)
- Stores: camelCase (authStore.ts)
- Services: camelCase (copilotApi.ts)
- Types: PascalCase (Chat.ts)
```

### Was du dem Code Executor sagst

**Zum Starten:**
```
Hier ist deine Arbeitsanweisung:

[FEATURE_SPEC.md oder PROMPTS.md Inhalt einfügen]

Bitte arbeite das ab und dokumentiere alles in OUTPUT.md.
```

**Bei Nachfragen:**
```
[Antwort auf seine Frage]

Mach weiter mit der Implementierung.
```

---

## 🔄 Kompletter Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ENTWICKLER                                   │
│                             │                                       │
│   "Neues Feature: Dark Mode implementieren"                         │
│                             │                                       │
│                             ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  🧠 PROMPT ENGINEER                          │   │
│   │                                                              │   │
│   │  Erstellt:                                                   │   │
│   │  • git checkout -b feature/dark-mode                        │   │
│   │  • docs/features/dark-mode/FEATURE_SPEC.md                  │   │
│   │  • Aktualisiert PROMPTS.md                                  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│   ENTWICKLER kopiert FEATURE_SPEC.md + PROMPTS.md                   │
│                             │                                       │
│                             ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  ⚡ CODE EXECUTOR                             │   │
│   │                                                              │   │
│   │  • Liest Arbeitsanweisungen                                 │   │
│   │  • Implementiert Code                                       │   │
│   │  • Schreibt OUTPUT.md                                       │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│   ENTWICKLER kopiert OUTPUT.md zurück zum Prompt Engineer           │
│                             │                                       │
│                             ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  🧠 PROMPT ENGINEER                          │   │
│   │                                                              │   │
│   │  Prüft OUTPUT.md:                                           │   │
│   │  • Alles fertig? → Feature abgeschlossen ✅                 │   │
│   │  • Probleme? → Neue Anweisungen in PROMPTS.md               │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│   Wiederhole bis Feature fertig...                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Beispiel-Session

### 1. Du zum Prompt Engineer:

```
Neues Feature: Dark Mode implementieren

Der Toggle in den Settings ist da, aber macht nichts.
Theme wird nicht gespeichert und CSS ändert sich nicht.
```

### 2. Prompt Engineer antwortet mit:

```markdown
# Feature: Dark Mode

## Branch
git checkout -b feature/dark-mode

## FEATURE_SPEC.md
[Erstellt docs/features/dark-mode/FEATURE_SPEC.md]

## PROMPTS.md Update
[Arbeitsanweisungen für Code Executor]
```

### 3. Du zum Code Executor:

```
Hier ist deine Arbeitsanweisung:

[FEATURE_SPEC.md Inhalt]
[PROMPTS.md Inhalt]

Bitte arbeite das ab und dokumentiere alles in OUTPUT.md.
```

### 4. Code Executor antwortet mit:

```markdown
# OUTPUT.md

## Iteration 1 - 10. Januar 2026

### Durchgeführte Änderungen

#### 1. Settings Store
- **Datei:** `src/stores/settingsStore.ts`
- **Änderung:** Theme-State und setTheme Action hinzugefügt
- **Status:** ✅ Fertig

[... weitere Änderungen ...]

### Offene Probleme
- Keine

### Nächste Schritte
- [ ] Testen
```

### 5. Du zum Prompt Engineer:

```
Der Code Executor hat gearbeitet. Hier ist sein Output:

[OUTPUT.md Inhalt]

Bitte prüfe das und gib mir die nächsten Schritte.
```

### 6. Prompt Engineer:

```
✅ Dark Mode Feature sieht vollständig aus!

Nächste Schritte:
1. Teste die App mit `pnpm tauri dev`
2. Prüfe ob Toggle funktioniert
3. Wenn alles ok: PR in dev Branch

Soll ich das nächste Feature vorbereiten?
```

---

## 🎯 Tipps

### Für effektives Arbeiten:

1. **Sei spezifisch** - Je mehr Kontext du dem Prompt Engineer gibst, desto bessere Anweisungen bekommst du

2. **Gib Feedback** - Wenn der Code Executor etwas falsch macht, erkläre es dem Prompt Engineer

3. **Iteriere schnell** - Kleine Features, schnelle Zyklen

4. **Teste zwischendurch** - Nach jeder OUTPUT.md: `pnpm tauri dev` und prüfen

### Dateien die du oft brauchst:

| Situation | Gib dem Code Executor |
|-----------|----------------------|
| Neues Feature | `FEATURE_SPEC.md` |
| Bug in Feature | `FEATURE_SPEC.md` + `OUTPUT.md` vom letzten Mal |
| Übergreifend | `SPEC.md` + `UI_REFERENCE.md` |

---

## 🚨 Troubleshooting

### "Code Executor versteht den Kontext nicht"
→ Gib ihm mehr Dateien als Kontext (SPEC.md, relevante Source-Files)

### "Prompt Engineer erstellt zu vage Anweisungen"  
→ Gib ihm konkrete Beispiele was nicht funktioniert

### "Änderungen funktionieren nicht"
→ Prüfe OUTPUT.md auf Fehler, gib Feedback an Prompt Engineer

---

**Viel Erfolg! 🚀**
