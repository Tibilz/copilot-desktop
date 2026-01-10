# Copilot Desktop

> Ein ChatGPT Desktop UI-Klon, der GitHub Copilot als Backend verwendet.

![Status](https://img.shields.io/badge/Status-Beta-green)
![Tech](https://img.shields.io/badge/Tech-Tauri%202.0%20%7C%20React%20%7C%20TypeScript-blue)

---

## 🎯 Projektziel

Eine Desktop-Anwendung, die die ChatGPT Desktop-Oberfläche nachbildet, aber GitHub Copilot als KI-Engine nutzt.

**Aktuelle Features:**
*   **Parallele Chats:** Organisiere deine Konversationen in Projekten.
*   **Drag & Drop:** Verschiebe Chats einfach in Projekt-Ordner.
*   **Multi-Model:** Unterstützt GPT-4o, Claude 3.5 Sonnet, o1-preview (sofern verfügbar).
*   **Token Pool:** Verwalte mehrere GitHub Accounts für erhöhte Rate Limits.
*   **Input Tools:** Datei-Anhänge, Reasoning Mode und Web-Search-Simulation.
*   **Persistenz:** Chats und Auth-Tokens werden sicher lokal gespeichert (SQLite + System Keyring).

---

## 🚀 Quick Start für neue Entwickler

```bash
# 1. Repository klonen
git clone https://github.com/Tibilz/copilot-desktop.git
cd copilot-desktop

# 2. Dependencies installieren
pnpm install

# 3. AGENTS.md lesen und zwei KI-Chats starten
# 4. Los geht's!
```

**👉 Lies [AGENTS.md](AGENTS.md) für den kompletten KI-Agenten Setup Guide!**

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
| `docs/features/*/FEATURE_SPEC.md` | Feature-spezifische Specs | Agent 1 |

---

## 🌿 Feature-Branch Workflow

Für jedes Feature wird ein eigener Branch mit eigener Spezifikation erstellt:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FEATURE-BRANCH WORKFLOW                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. NEUER FEATURE-BRANCH                                           │
│      ┌─────────────────────────────────────────────────────────┐    │
│      │  git checkout -b feature/[name]                         │    │
│      └─────────────────────────────────────────────────────────┘    │
│                             │                                       │
│                             ▼                                       │
│   2. FEATURE-SPEC ERSTELLEN (Agent 1)                               │
│      ┌─────────────────────────────────────────────────────────┐    │
│      │  docs/features/[name]/FEATURE_SPEC.md                   │    │
│      │                                                         │    │
│      │  Enthält NUR:                                           │    │
│      │  • Ziel des Features                                    │    │
│      │  • Betroffene Dateien                                   │    │
│      │  • UI-Änderungen (ASCII-Mockup)                         │    │
│      │  • Technische Details                                   │    │
│      │  • Akzeptanzkriterien                                   │    │
│      └─────────────────────────────────────────────────────────┘    │
│                             │                                       │
│                             ▼                                       │
│   3. IMPLEMENTATION (Agent 2)                                       │
│      ┌─────────────────────────────────────────────────────────┐    │
│      │  Agent 2 bekommt als Kontext:                           │    │
│      │  • docs/features/[name]/FEATURE_SPEC.md (PRIMÄR)        │    │
│      │  • SPEC.md (als Referenz)                               │    │
│      │  • UI_REFERENCE.md (als Referenz)                       │    │
│      │                                                         │    │
│      │  Agent 2 dokumentiert in OUTPUT.md                      │    │
│      └─────────────────────────────────────────────────────────┘    │
│                             │                                       │
│                             ▼                                       │
│   4. REVIEW & MERGE                                                 │
│      ┌─────────────────────────────────────────────────────────┐    │
│      │  • CI/CD läuft (Linting, Tests, Build)                  │    │
│      │  • PR in dev Branch                                     │    │
│      │  • Nach Tests: PR in main                               │    │
│      └─────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Wann bekommt Agent 2 welchen Kontext?

| Situation | Kontext für Agent 2 |
|-----------|---------------------|
| **Neues Feature implementieren** | `FEATURE_SPEC.md` + relevante Source-Files |
| **Bug in bestehendem Feature** | `FEATURE_SPEC.md` + `OUTPUT.md` vom letzten Run |
| **Übergreifende Änderung** | `SPEC.md` + `UI_REFERENCE.md` + betroffene Files |
| **Refactoring** | `SPEC.md` + alle betroffenen Source-Files |

### Feature-Spec Template

Siehe [docs/FEATURE_TEMPLATE.md](docs/FEATURE_TEMPLATE.md) für das Standard-Template.

**Beispiel:** [docs/features/auth-persistence/FEATURE_SPEC.md](docs/features/auth-persistence/FEATURE_SPEC.md)

---

## 📁 Projekt-Struktur

```
copilot-desktop/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD Pipeline
├── docs/
│   ├── FEATURE_TEMPLATE.md # Template für Feature-Specs
│   └── features/           # Feature-spezifische Specs
│       ├── auth-persistence/
│       │   └── FEATURE_SPEC.md
│       ├── dark-mode/
│       └── ui-polish/
├── src/                    # React Frontend
│   ├── components/         # UI-Komponenten
│   ├── stores/             # Zustand State Management
│   ├── services/           # API & Business Logic
│   ├── test/               # Test Setup & Utilities
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
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions

---

## 🔄 CI/CD Pipeline

Bei jedem Push/PR auf `main` oder `dev` läuft automatisch:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GITHUB ACTIONS CI                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐     ┌─────────────────────┐               │
│  │  🔍 Frontend Lint   │     │  🦀 Rust Lint       │               │
│  │  • ESLint           │     │  • cargo fmt        │               │
│  │  • Prettier         │     │  • cargo clippy     │               │
│  │  • TypeScript       │     │                     │               │
│  └──────────┬──────────┘     └──────────┬──────────┘               │
│             │                           │                           │
│             └───────────┬───────────────┘                           │
│                         │                                           │
│                         ▼                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    🧪 Tests                                  │   │
│  │  • Vitest (Frontend Unit Tests)                             │   │
│  │  • cargo test (Rust Tests)                                  │   │
│  │  • Coverage Report                                          │   │
│  └─────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    🏗️ Build Check                            │   │
│  │  • vite build                                               │   │
│  │  • cargo check                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Lokale Checks (vor dem Commit)

```bash
# Linting
pnpm lint              # ESLint
pnpm lint:fix          # ESLint mit Auto-Fix

# Formatting
pnpm format            # Prettier (schreibt Dateien)
pnpm format:check      # Prettier (nur prüfen)

# Type Checking
pnpm typecheck         # TypeScript ohne Build

# Tests
pnpm test              # Vitest im Watch-Mode
pnpm test:unit         # Einmaliger Test-Run
pnpm test:coverage     # Mit Coverage-Report

# Rust (im src-tauri Ordner)
cargo fmt              # Formatierung
cargo clippy           # Linting
cargo test             # Tests
```

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

### Für Entwickler
- **[AGENTS.md](AGENTS.md)** - 🚀 **START HIER!** KI-Agenten Setup Guide
- [SPEC.md](SPEC.md) - Vollständige technische Spezifikation
- [UI_REFERENCE.md](UI_REFERENCE.md) - UI Design mit ASCII-Mockups

### Workflow-Dateien
- [PROMPTS.md](PROMPTS.md) - Aktuelle Arbeitsanweisungen (für Code Executor)
- [OUTPUT.md](OUTPUT.md) - Letzte Änderungen (vom Code Executor)
- [TEST_WALKTHROUGH.md](TEST_WALKTHROUGH.md) - Manuelle Test-Checkliste

### Feature-Specs
- [docs/features/](docs/features/) - Feature-spezifische Spezifikationen
- [docs/FEATURE_TEMPLATE.md](docs/FEATURE_TEMPLATE.md) - Template für neue Features

---

## 📝 Lizenz

MIT
