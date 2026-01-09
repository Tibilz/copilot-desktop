# UI Referenz - ChatGPT Desktop

> Screenshot-Beschreibung der Ziel-UI

## Layout Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│ [●][●][●]  [📋] [✏️]          ChatGPT >           [↑] [⬡]      │
├──────────────────────┬──────────────────────────────────────────┤
│                      │                                          │
│  🔍 Suche            │                                          │
│                      │                                          │
│  ○ ChatGPT           │         + Plan upgraden                  │
│  ⊞ GPTs              │                                          │
│                      │                                          │
│  ─────────────────   │                                          │
│                      │                                          │
│  📁 Neues Projekt    │                                          │
│  📁 Virtualization   │                                          │
│                      │                                          │
│  ─────────────────   │                                          │
│                      │                                          │
│  Git Compare...      │                                          │
│  Data Warehouse...   │                                          │
│  Multidimensional... │                                          │
│  Datenbankmodelle... │                                          │
│  Accounting im...    │                                          │
│  KVM/ARM Virtual...  │                                          │
│  Günstige Monats...  │                                          │
│  Schnelle Udon...    │                                          │
│  Erste Nutzung...    │                                          │
│  Evaluation Zus...   │                                          │
│  Paper Präsenta...   │                                          │
│  Perfektes Pfan...   │                                          │
│  Kino Popcorn...     │                                          │
│  PCIe und M.2...     │                                          │
│                      │                                          │
│  ─────────────────   │                                          │
│                      │                                          │
│  👤 Wiktor Kozar...  │                                          │
│                      ├──────────────────────────────────────────┤
│                      │  ┌────────────────────────────────────┐  │
│                      │  │ Stelle irgendeine Frage            │  │
│                      │  │                                    │  │
│                      │  │ [+] [🌐] [💡] [🅰️]         [🎤][▶]│  │
│                      │  └────────────────────────────────────┘  │
└──────────────────────┴──────────────────────────────────────────┘
```

## Komponenten-Details

### 1. Sidebar (Links, ~250px breit)

#### Header-Bereich
- **Window Controls**: Rot/Gelb/Grün (macOS)
- **Action Buttons**: Kopieren, Bearbeiten

#### Navigation
- **Suchfeld**: Placeholder "Suche"
- **ChatGPT Button**: Hauptchat-Zugang
- **GPTs Button**: Custom GPTs

#### Projekte
- **"Neues Projekt"**: Erstellt neuen Projekt-Ordner
- **Projekt-Ordner**: Klappbar, enthält Chats
  - Icon: 📁
  - Name des Projekts
  - Pfeil zum Auf-/Zuklappen

#### Chat-Liste
- Chronologisch sortiert (neueste oben)
- Titel wird automatisch generiert
- Hover-Effekt zeigt Optionen (Löschen, Umbenennen)
- Aktiver Chat ist hervorgehoben

#### Footer
- **Benutzer-Avatar + Name**
- Klick öffnet Account-Menü

### 2. Hauptbereich (Rechts)

#### Header
- **Modell-Dropdown**: "ChatGPT >" 
  - Zeigt aktuelles Modell
  - Dropdown mit verfügbaren Modellen
- **Rechts**: Upgrade-Button, Share-Button

#### Chat-Bereich
- **Leerer Zustand**: Zentrierter Willkommenstext
- **Mit Nachrichten**: 
  - User-Bubbles: Rechtsbündig, farbiger Hintergrund
  - Assistant-Bubbles: Linksbündig, neutraler Hintergrund
  - Markdown-Rendering
  - Code-Blöcke mit Syntax-Highlighting

#### Input-Bereich (Unten)
```
┌─────────────────────────────────────────────────────────┐
│ Stelle irgendeine Frage                                 │
│                                                         │
│ [+] [🌐] [💡] [🅰️]                           [🎤] [▶] │
└─────────────────────────────────────────────────────────┘
```

- **Textfeld**: Multi-line, auto-expand
- **Buttons (Links)**:
  - `[+]` Datei anhängen
  - `[🌐]` Web-Suche Toggle
  - `[💡]` Reasoning/Thinking Toggle
  - `[🅰️]` Canvas/Format Options
- **Buttons (Rechts)**:
  - `[🎤]` Spracheingabe
  - `[▶]` Senden

## Interaktionen

### Parallele Chats (Multi-Session)

Mehrere Chats können **gleichzeitig aktiv** sein:

```
┌─────────────────────┬────────────────────────────────────────┐
│                     │  Chat: "Python Frage"                  │
│  📁 Projekt A       │  ┌────────────────────────────────────┐│
│  ├─ Chat 1 ●        │  │ User: Wie funktioniert async?     ││
│  ├─ Chat 2 ◐        │  │                                    ││
│  └─ Chat 3 ○        │  │ Assistant: ▌ (streaming...)       ││
│                     │  └────────────────────────────────────┘│
│  💬 Allgemein       │                                        │
│  ├─ Chat 4 ○        │  ┌────────────────────────────────────┐│
│  └─ Chat 5 ○        │  │ Stelle eine Frage...               ││
│                     │  │ [+] [🌐] [💡]          [🎤] [▶]   ││
│                     │  └────────────────────────────────────┘│
└─────────────────────┴────────────────────────────────────────┘

Legende: ● = streaming  ◐ = pending  ○ = idle
```

**Chat Status Indikatoren:**
- `●` Grüner Punkt = Antwort wird gerade gestreamt
- `◐` Gelber Halb-Punkt = Wartet auf freien Token
- `○` Grauer Punkt = Idle, bereit für Input
- `!` Roter Punkt = Fehler aufgetreten

### Token Pool Management

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Einstellungen > GitHub Accounts                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Verbundene Accounts:                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 wiktork (Primary)                     [Aktiv: 2] │   │
│  │    Rate Limit: 4832/5000   Reset: 14:32            │   │
│  │                                          [Entfernen]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 work-account                          [Aktiv: 1] │   │
│  │    Rate Limit: 5000/5000   Reset: --               │   │
│  │                                          [Entfernen]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Weiteren Account verbinden]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐝 Swarm Mode UI

### Swarm Toggle im Header

```
┌─────────────────────────────────────────────────────────────┐
│  [GPT-4o ▼]   [🌐 Search]  [🤔 Think]  [🐝 Swarm: ON ▼]    │
└─────────────────────────────────────────────────────────────┘
```

### Swarm Konfiguration Modal

```
┌─────────────────────────────────────────────────────────────┐
│ 🐝 Swarm Konfiguration                              [✕]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Name: [Standard Swarm                              ]       │
│                                                             │
│  Controller Model: [GPT-4o                         ▼]       │
│                                                             │
│  Strategie:                                                 │
│  ○ Consensus   - Alle antworten, beste wird gewählt        │
│  ● Parallel    - Aufgabe wird aufgeteilt                   │
│  ○ Sequential  - Chain: A → B → C                          │
│  ○ Verification - Model B prüft Output von A               │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Worker Models:                                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Claude 3.5 Sonnet ▼]  Role: [Analyst    ]  W: 1.0 │   │
│  │                                          [🗑️]      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Mistral Large    ▼]  Role: [Code Expert ]  W: 1.2 │   │
│  │                                          [🗑️]      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Phi-3 Mini       ▼]  Role: [Quick Draft ]  W: 0.8 │   │
│  │                                          [🗑️]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Worker hinzufügen]                                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                              [Abbrechen]  [💾 Speichern]   │
└─────────────────────────────────────────────────────────────┘
```

### Swarm Execution Ansicht

Während der Ausführung wird der Swarm-Status inline im Chat angezeigt:

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 User                                                     │
│ Erkläre mir, wie ich eine REST API in Python baue.         │
├─────────────────────────────────────────────────────────────┤
│ 🐝 Swarm Processing...                                      │
│                                                             │
│ Controller: GPT-4o                                          │
│ ├─ Analyzing query... ✓                                    │
│ └─ Dispatching to 3 workers...                             │
│                                                             │
│ Workers:                                                    │
│ ┌───────────────┬───────────────┬───────────────┐          │
│ │ Claude 3.5    │ Mistral       │ Phi-3         │          │
│ │ ● Streaming   │ ◐ Thinking    │ ✓ Done        │          │
│ │ "Flask ist..."│ "..."         │ 423 tokens    │          │
│ │ ▓▓▓▓▓░░░ 62%  │ ▓▓░░░░░░ 25%  │ ▓▓▓▓▓▓▓▓ 100% │          │
│ └───────────────┴───────────────┴───────────────┘          │
│                                                             │
│ [Show Details]  [Cancel]                                    │
└─────────────────────────────────────────────────────────────┘
```

### Swarm Result mit Expandable Details

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Assistant (via Swarm)                        [⋮ Details] │
│                                                             │
│ Um eine REST API in Python zu bauen, empfehle ich Flask    │
│ oder FastAPI. Hier ist ein Beispiel mit FastAPI:           │
│                                                             │
│ ```python                                                   │
│ from fastapi import FastAPI                                 │
│ app = FastAPI()                                             │
│ ...                                                         │
│ ```                                                         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🐝 Swarm Summary                              [Collapse]│ │
│ │ Strategy: Parallel | Duration: 4.2s | Tokens: 2,847    │ │
│ │                                                         │ │
│ │ Claude: Framework-Vergleich (892 tokens)               │ │
│ │ Mistral: Code-Beispiele (1,203 tokens)                 │ │
│ │ Phi-3: Quick Summary (752 tokens)                      │ │
│ │                                                         │ │
│ │ [View Individual Responses]                             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### Chat erstellen
1. Klick auf "+ New Chat" oder einfach tippen
2. Neuer Chat erscheint in Liste
3. Titel wird nach erster Nachricht generiert

### Projekt erstellen
1. Klick auf "Neues Projekt"
2. Name eingeben
3. Projekt erscheint in Sidebar
4. Chats können per Drag&Drop verschoben werden

### Modell wechseln
1. Klick auf Modell-Dropdown im Header
2. Verfügbare Modelle werden angezeigt
3. Auswahl ändert Modell für aktuellen Chat

### Datei anhängen
1. Klick auf `[+]` Button
2. Dateiauswahl-Dialog öffnet sich
3. Datei wird als Vorschau angezeigt
4. Mit Nachricht zusammen gesendet

## Farben (Light Mode)

| Element | Farbe |
|---------|-------|
| Sidebar Background | `#f9f9f9` |
| Main Background | `#ffffff` |
| Text Primary | `#1a1a1a` |
| Text Secondary | `#6b6b6b` |
| Border | `#e5e5e5` |
| Accent (Buttons) | `#10a37f` |
| User Bubble | `#f4f4f4` |
| Hover | `#ececec` |
| Status: Streaming | `#22c55e` (green) |
| Status: Pending | `#eab308` (yellow) |
| Status: Error | `#ef4444` (red) |
| Swarm Accent | `#f59e0b` (amber) |

## Farben (Dark Mode)

| Element | Farbe |
|---------|-------|
| Sidebar Background | `#171717` |
| Main Background | `#212121` |
| Text Primary | `#ececec` |
| Text Secondary | `#8e8e8e` |
| Border | `#3d3d3d` |
| Accent (Buttons) | `#10a37f` |
| User Bubble | `#2f2f2f` |
| Hover | `#3d3d3d` |
| Status: Streaming | `#4ade80` (green) |
| Status: Pending | `#facc15` (yellow) |
| Status: Error | `#f87171` (red) |
| Swarm Accent | `#fbbf24` (amber) |

## Typografie

- **Font Family**: System UI / -apple-system / Segoe UI
- **Chat Title**: 14px, medium weight
- **Message Text**: 15px, regular
- **Input Text**: 15px, regular
- **Timestamps**: 12px, light, muted color
