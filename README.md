# Copilot Desktop

> Ein ChatGPT Desktop UI-Klon, der GitHub Copilot als Backend verwendet.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Tech](https://img.shields.io/badge/Tech-Tauri%202.0%20%7C%20React%20%7C%20TypeScript-blue)

---

## 🎯 Projektziel

Eine Desktop-Anwendung, die die ChatGPT Desktop-Oberfläche nachbildet, aber GitHub Copilot als KI-Engine nutzt. Features wie parallele Chats, Multi-Account Token Pool und Swarm Mode (Multi-Agent Orchestration) sind geplant.

---

## 🤖 Entwicklungs-Workflow: Dual-Agent Architektur

Dieses Projekt verwendet einen innovativen **Zwei-KI-Agenten-Workflow** für maximale Effizienz und Qualität:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ENTWICKLUNGS-WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   👨‍💻 ENTWICKLER                                                     │
│      │                                                              │
│      │ Beschreibt Feature/Bug                                       │
│      ▼                                                              │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              🧠 AGENT 1: PROMPT-ARCHITECT                    │   │
│   │                   (z.B. GitHub Copilot)                      │   │
│   │                                                              │   │
│   │  Aufgaben:                                                   │   │
│   │  • Analysiert den aktuellen Codebase-Zustand                │   │
│   │  • Schreibt detaillierte, ausführbare Prompts               │   │
│   │  • Erstellt Kontext aus SPEC.md, UI_REFERENCE.md            │   │
│   │  • Priorisiert Tasks und definiert Reihenfolge              │   │
│   │  • Dokumentiert erwartetes Verhalten                        │   │
│   │                                                              │   │
│   │  Output: PROMPTS.md (strukturierte Arbeitsanweisungen)      │   │
│   └─────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
│                             │ Übergibt PROMPTS.md                   │
│                             ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              ⚡ AGENT 2: CODE-EXECUTOR                       │   │
│   │                (z.B. Claude, GPT-4, Cursor)                  │   │
│   │                                                              │   │
│   │  Aufgaben:                                                   │   │
│   │  • Liest PROMPTS.md als Arbeitsanweisung                    │   │
│   │  • Implementiert Code-Änderungen                            │   │
│   │  • Folgt der vorgegebenen Reihenfolge                       │   │
│   │  • Dokumentiert alle Änderungen in OUTPUT.md                │   │
│   │  • Testet und validiert Implementierung                     │   │
│   │                                                              │   │
│   │  Output: Code-Änderungen + OUTPUT.md (Dokumentation)        │   │
│   └─────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
│                             │ Ergebnis                              │
│                             ▼                                       │
│   👨‍💻 ENTWICKLER                                                     │
│      • Prüft OUTPUT.md                                              │
│      • Testet App (TEST_WALKTHROUGH.md)                             │
│      • Meldet Bugs/nächste Features an Agent 1                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Warum dieser Workflow?

| Vorteil | Beschreibung |
|---------|--------------|
| **Separation of Concerns** | Agent 1 denkt strategisch, Agent 2 implementiert taktisch |
| **Bessere Prompts** | Spezialisierter Agent erstellt präzisere Arbeitsanweisungen |
| **Reproduzierbarkeit** | PROMPTS.md ist versioniert und nachvollziehbar |
| **Fehlerreduktion** | Zwei Perspektiven finden mehr Probleme |
| **Parallelisierbar** | Mehrere Executor-Agents könnten parallel arbeiten |

### Dateien im Workflow

| Datei | Zweck | Erstellt von |
|-------|-------|--------------|
| `SPEC.md` | Technische Spezifikation, Architektur | Mensch + Agent 1 |
| `UI_REFERENCE.md` | UI/UX Design, ASCII-Mockups | Mensch + Agent 1 |
| `PROMPTS.md` | Aktuelle Arbeitsanweisungen für Agent 2 | Agent 1 |
| `OUTPUT.md` | Dokumentation der Änderungen | Agent 2 |
| `TEST_WALKTHROUGH.md` | Manuelle Test-Checkliste | Mensch |

---

## 📁 Projekt-Struktur

```
copilot-desktop/
├── src/                    # React Frontend
│   ├── components/         # UI-Komponenten
│   ├── stores/             # Zustand State Management
│   ├── services/           # API & Business Logic
│   └── types/              # TypeScript Types
├── src-tauri/              # Rust Backend (Tauri)
│   └── src/                # Tauri Commands
├── SPEC.md                 # Technische Spezifikation
├── UI_REFERENCE.md         # UI Design Reference
├── PROMPTS.md              # Aktuelle KI-Arbeitsanweisungen
├── OUTPUT.md               # Änderungs-Dokumentation
└── TEST_WALKTHROUGH.md     # Test-Checkliste
```

---

## 🌿 Git Branch-Strategie

```
main                    # Stabile Releases
  │
  └── dev               # Entwicklungs-Branch (Integration)
       │
       ├── feature/auth-persistence    # Token-Speicherung fixen
       ├── feature/dark-mode           # Dark Mode implementieren
       └── feature/ui-polish           # UI-Verbesserungen
```

### Workflow

1. Neue Features werden in `feature/*` Branches entwickelt
2. Nach Fertigstellung: PR in `dev`
3. Nach Testing: PR von `dev` in `main`

---

## 🛠️ Tech Stack

- **Desktop Framework**: Tauri 2.0 (Rust Backend)
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Datenbank**: SQLite (via @tauri-apps/plugin-sql)
- **Auth**: GitHub OAuth Device Flow

---

## 🚀 Entwicklung starten

```bash
# Dependencies installieren
pnpm install

# Entwicklungsserver starten
pnpm tauri dev

# Produktions-Build
pnpm tauri build
```

---

## 📋 Aktueller Status

Siehe [PROMPTS.md](PROMPTS.md) für die aktuelle Iteration und offene Tasks.

### ✅ Funktioniert
- GitHub OAuth Login (Device Flow)
- Chat mit Copilot API
- Streaming Responses
- Markdown Rendering
- Modellauswahl
- SQLite Persistenz

### 🔧 In Arbeit (Iteration 7)
- Token Persistenz (Neustart-Bug)
- Logout Funktionalität
- Dark Mode
- Projekt-Erstellung
- Such-Funktionalität

---

## 📚 Dokumentation

- [SPEC.md](SPEC.md) - Vollständige technische Spezifikation
- [UI_REFERENCE.md](UI_REFERENCE.md) - UI Design mit ASCII-Mockups
- [PROMPTS.md](PROMPTS.md) - Aktuelle Arbeitsanweisungen
- [TEST_WALKTHROUGH.md](TEST_WALKTHROUGH.md) - Manuelle Tests

---

## 📝 Lizenz

MIT
