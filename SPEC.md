# Copilot Desktop - Spezifikation

> Ein ChatGPT Desktop UI-Klon, der GitHub Copilot als Backend verwendet.

---

## 🎯 Projektziel

Erstelle eine Desktop-Anwendung, die die ChatGPT Desktop-Oberfläche nachbildet, aber GitHub Copilot als KI-Engine nutzt. Der Benutzer authentifiziert sich mit seinem GitHub-Account und erhält Zugriff auf alle von GitHub Copilot unterstützten Modelle.

---

## 📸 UI-Referenz (Ziel)

Die Benutzeroberfläche orientiert sich am ChatGPT Desktop Layout:

### Sidebar (Links)
- **Suchfeld** oben
- **Projekt-Ordner** (klappbar, enthalten mehrere Chats)
- **Chat-Liste** (einzelne Gespräche, chronologisch sortiert)
- **Benutzer-Bereich** unten (Account-Info, Einstellungen)

### Hauptbereich (Rechts)
- **Header**: Modellauswahl-Dropdown
- **Chat-Verlauf**: Nachrichten mit User/Assistant Bubbles
- **Input-Bereich** unten:
  - Textfeld für Nachrichten
  - Button für Datei-Anhänge
  - Web-Suche Toggle
  - Reasoning/Thinking Toggle
  - Senden-Button

---

## 🛠️ Tech Stack

### Framework & UI
| Komponente | Technologie | Begründung |
|------------|-------------|------------|
| **Desktop Framework** | **Tauri 2.0** | Leichtgewichtig, Rust-Backend, native Performance |
| **Frontend** | **React 18 + TypeScript** | Moderne Komponenten, Type-Safety |
| **Styling** | **Tailwind CSS** | Schnelles, konsistentes Design |
| **State Management** | **Zustand** | Einfach, performant, minimaler Boilerplate |
| **Icons** | **Lucide React** | Moderne, konsistente Icons |

### Backend & Daten
| Komponente | Technologie | Begründung |
|------------|-------------|------------|
| **Lokale Datenbank** | **SQLite (via Tauri)** | Persistent, schnell, kein Server nötig |
| **API Client** | **GitHub Copilot Chat API** | Offizielle API für Copilot-Zugriff |
| **Auth** | **GitHub OAuth Device Flow** | Sicherer Login ohne Secret im Client |
| **Concurrency** | **Tokio (Rust) + Web Workers** | Parallele Chat-Sessions ohne Blocking |
| **Multi-Agent** | **Custom Swarm Controller** | Orchestrierung mehrerer Modelle |

### Build & Dev
| Komponente | Technologie |
|------------|-------------|
| **Package Manager** | pnpm |
| **Bundler** | Vite |
| **Linting** | ESLint + Prettier |

---

## 🔐 GitHub Copilot Integration

### Authentifizierung (Device Flow)

```
1. App fordert Device Code von GitHub an
2. User öffnet github.com/login/device
3. User gibt Code ein und autorisiert
4. App erhält Access Token
5. Access Token wird sicher im OS Keychain gespeichert (Tauri)
```

### API Endpoints

**GitHub Copilot Chat API:**
```
Base URL: https://api.githubcopilot.com
```

**Wichtige Endpoints:**
- `POST /chat/completions` - Chat-Nachrichten senden
- `GET /models` - Verfügbare Modelle abrufen

### Unterstützte Modelle (Stand 2024/2025)
- `gpt-4o`
- `gpt-4o-mini`
- `claude-3.5-sonnet`
- `o1-preview`
- `o1-mini`
- Weitere je nach Copilot-Subscription

### Request Format
```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "stream": true
}
```

---

## � Multi-Session Architecture (Parallele Chats)

### Konzept

User können in mehreren Chats **gleichzeitig** arbeiten. Während ein Chat auf eine Antwort wartet, kann der User in anderen Chats weiter tippen und Anfragen senden.

### Technische Umsetzung

```
┌─────────────────────────────────────────────────────────┐
│                    Main Thread (UI)                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Chat 1  │  │ Chat 2  │  │ Chat 3  │  │ Chat N  │    │
│  │ (idle)  │  │(typing) │  │(waiting)│  │ (idle)  │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
└───────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────┐
│              Session Manager (Rust/Tauri)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Token Pool (GitHub Auths)            │   │
│  │  [Token 1] [Token 2] [Token 3] ... [Token N]     │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Async Request Queue (Tokio)             │   │
│  │  Queue: [Req Chat3] [Req Chat7] [Req Chat2]      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────┐
            │   GitHub Copilot API    │
            │   (Parallel Requests)   │
            └─────────────────────────┘
```

### Multi-Auth Token Pool

```typescript
interface TokenPool {
  tokens: GitHubToken[];        // Mehrere Auth Tokens
  activeRequests: Map<string, string>;  // chatId -> tokenId
  
  acquireToken(): Promise<GitHubToken>;  // Holt freien Token
  releaseToken(tokenId: string): void;   // Gibt Token frei
  addToken(token: GitHubToken): void;    // Neuen Account hinzufügen
}

interface GitHubToken {
  id: string;
  accessToken: string;
  username: string;             // GitHub Username für Anzeige
  inUse: boolean;
  lastUsed: Date;
  rateLimitRemaining: number;
}
```

### UI States pro Chat

```typescript
type ChatState = 
  | 'idle'           // Bereit für Input
  | 'typing'         // User tippt gerade
  | 'pending'        // Warte auf freien Token
  | 'streaming'      // Empfange Antwort
  | 'error';         // Fehler aufgetreten
```

### Token Management UI

- Settings zeigt alle verbundenen GitHub Accounts
- "+ Account hinzufügen" Button für weitere Logins
- Anzeige: Welcher Account ist gerade in welchem Chat aktiv
- Automatische Token-Rotation bei Rate Limits

---

## 🐝 Swarm Mode (Multi-Agent Orchestration)

### Konzept

Ein **Controller-Modell** (z.B. GPT-4o) koordiniert mehrere **Worker-Modelle** (z.B. Claude, Mistral, Phi), um komplexe Aufgaben zu lösen. Die Ergebnisse werden aggregiert und dem User präsentiert.

### Use Cases

1. **Consensus**: Mehrere Modelle beantworten dieselbe Frage → Controller wählt/kombiniert beste Antwort
2. **Spezialisierung**: Verschiedene Modelle für verschiedene Teilaufgaben (Code: GPT-4o, Analyse: Claude, etc.)
3. **Verification**: Ein Modell prüft die Ausgabe eines anderen
4. **Brainstorming**: Mehrere Modelle generieren Ideen → Controller aggregiert

### Architektur

```
                    User Query
                        │
                        ▼
            ┌───────────────────────┐
            │   Controller Model    │
            │      (GPT-4o)         │
            │                       │
            │  - Analysiert Query   │
            │  - Plant Subtasks     │
            │  - Aggregiert Results │
            └───────────┬───────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Worker 1 │  │ Worker 2 │  │ Worker 3 │
    │ Claude   │  │ Mistral  │  │  Phi-3   │
    │          │  │          │  │          │
    │ Subtask  │  │ Subtask  │  │ Subtask  │
    │    A     │  │    B     │  │    C     │
    └────┬─────┘  └────┬─────┘  └────┬─────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
                       ▼
            ┌───────────────────────┐
            │   Controller Model    │
            │   (Aggregation)       │
            │                       │
            │  - Kombiniert Results │
            │  - Quality Check      │
            │  - Final Response     │
            └───────────────────────┘
                       │
                       ▼
                 Final Answer
```

### Swarm Configuration

```typescript
interface SwarmConfig {
  enabled: boolean;
  controllerModel: string;      // z.B. "gpt-4o"
  workers: SwarmWorker[];
  strategy: SwarmStrategy;
}

interface SwarmWorker {
  model: string;                // z.B. "claude-3.5-sonnet"
  role: string;                 // z.B. "code-expert", "analyst"
  weight: number;               // Gewichtung bei Aggregation
}

type SwarmStrategy = 
  | 'consensus'      // Alle beantworten, bestes wird gewählt
  | 'parallel'       // Aufgabe wird aufgeteilt
  | 'sequential'     // Chain: Output von A → Input für B
  | 'verification';  // Model B prüft Output von A
```

### Swarm Prompt Templates

**Controller - Task Analysis:**
```
Analyze this user request and break it down into subtasks.
Available workers: {workers}
User Query: {query}

Respond with JSON:
{
  "subtasks": [
    {"worker": "claude", "task": "..."},
    {"worker": "mistral", "task": "..."}
  ]
}
```

**Controller - Aggregation:**
```
Combine these worker responses into a final answer.
Original Query: {query}
Worker Responses:
{responses}

Create a comprehensive, coherent final response.
```

### UI für Swarm Mode

```
┌─────────────────────────────────────────────────────────┐
│  🐝 Swarm Mode: ON                    [Configure]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Controller: GPT-4o                                     │
│  Strategy: Consensus                                    │
│                                                         │
│  Workers:                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Claude 3.5  │ │  Mistral    │ │   Phi-3     │       │
│  │ ● Running   │ │ ● Running   │ │ ✓ Done      │       │
│  │ "analyzing..│ │ "thinking...│ │ 847 tokens  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  [Show Individual Responses]  [Show Aggregation Log]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## �📁 Projektstruktur

```
copilot-desktop/
├── src/
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ProjectFolder.tsx
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatItem.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── Chat/
│   │   │   ├── ChatView.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── FileAttachment.tsx
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── ModelSelector.tsx
│   │   ├── Settings/
│   │   │   ├── SettingsModal.tsx
│   │   │   └── AccountSettings.tsx
│   │   └── Auth/
│   │       ├── LoginFlow.tsx
│   │       └── DeviceCodeDisplay.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useProjects.ts
│   │   ├── useAuth.ts
│   │   └── useCopilotAPI.ts
│   ├── stores/
│   │   ├── chatStore.ts
│   │   ├── projectStore.ts
│   │   ├── authStore.ts
│   │   └── settingsStore.ts
│   ├── services/
│   │   ├── copilotApi.ts
│   │   ├── githubAuth.ts
│   │   ├── database.ts
│   │   ├── tokenPool.ts          # Multi-Auth Token Management
│   │   ├── sessionManager.ts     # Parallele Chat Sessions
│   │   └── swarmController.ts    # Multi-Agent Orchestration
│   ├── types/
│   │   ├── chat.ts
│   │   ├── project.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── fileHandlers.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── db.rs
│   │   ├── auth.rs
│   │   └── commands.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── SPEC.md
```

---

## 💾 Datenmodell (SQLite)

### Tabellen

```sql
-- Projekte (Ordner für Chats)
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sort_order INTEGER DEFAULT 0
);

-- Chats
CREATE TABLE chats (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Neuer Chat',
    model TEXT NOT NULL DEFAULT 'gpt-4o',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_pinned BOOLEAN DEFAULT FALSE
);

-- Nachrichten
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    tokens_used INTEGER
);

-- Datei-Anhänge
CREATE TABLE attachments (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    content TEXT, -- Base64 oder Pfad
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Einstellungen
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- GitHub Accounts (Token Pool)
CREATE TABLE github_accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    access_token TEXT NOT NULL,  -- Encrypted
    avatar_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    rate_limit_remaining INTEGER DEFAULT 5000,
    rate_limit_reset DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME
);

-- Swarm Configurations
CREATE TABLE swarm_configs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    controller_model TEXT NOT NULL,
    strategy TEXT NOT NULL CHECK(strategy IN ('consensus', 'parallel', 'sequential', 'verification')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Swarm Workers
CREATE TABLE swarm_workers (
    id TEXT PRIMARY KEY,
    config_id TEXT NOT NULL REFERENCES swarm_configs(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    role TEXT,
    weight REAL DEFAULT 1.0,
    sort_order INTEGER DEFAULT 0
);

-- Swarm Execution Logs
CREATE TABLE swarm_logs (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    worker_model TEXT NOT NULL,
    worker_response TEXT,
    tokens_used INTEGER,
    duration_ms INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✨ Features (Priorisiert)

### Phase 1: MVP
- [x] GitHub OAuth Login (Device Flow)
- [ ] Einfacher Chat mit Copilot API
- [ ] Modellauswahl
- [ ] Chat-Verlauf speichern
- [ ] Neue Chats erstellen
- [ ] Chats löschen

### Phase 2: Core Features
- [ ] Projekt-Ordner erstellen/verwalten
- [ ] Chats in Projekte verschieben
- [ ] Chat-Suche
- [ ] Markdown-Rendering in Nachrichten
- [ ] Code-Highlighting
- [ ] Streaming-Responses

### Phase 3: Advanced
- [ ] Datei-Anhänge (Text, Code, Bilder)
- [ ] Web-Suche Integration
- [ ] Reasoning/Thinking Mode
- [ ] Chat exportieren (JSON, Markdown)
- [ ] Keyboard Shortcuts
- [ ] Dark/Light Mode
- [ ] **Parallele Chats** (Multi-Session)
- [ ] **Multi-Account Token Pool**

### Phase 4: Swarm Mode
- [ ] Swarm Controller Architektur
- [ ] Worker Model Management
- [ ] Consensus Strategy
- [ ] Parallel Task Strategy
- [ ] Sequential Chain Strategy
- [ ] Verification Strategy
- [ ] Swarm UI (Worker Status, Logs)

### Phase 5: Polish
- [ ] Drag & Drop für Chats/Projekte
- [ ] Chat-Titel automatisch generieren
- [ ] Token-Zähler
- [ ] Einstellungen (Schriftgröße, etc.)
- [ ] Auto-Updates

---

## 🎨 UI/UX Anforderungen

### Farbschema
```css
/* Light Mode */
--bg-primary: #ffffff;
--bg-secondary: #f7f7f8;
--bg-sidebar: #f9f9f9;
--text-primary: #1a1a1a;
--text-secondary: #6b6b6b;
--border: #e5e5e5;
--accent: #10a37f; /* Copilot Grün */

/* Dark Mode */
--bg-primary: #212121;
--bg-secondary: #2f2f2f;
--bg-sidebar: #171717;
--text-primary: #ececec;
--text-secondary: #8e8e8e;
--border: #3d3d3d;
--accent: #10a37f;
```

### Responsives Verhalten
- Sidebar kollapierbar (Toggle-Button)
- Minimum Window-Größe: 800x600px
- Optimiert für: 1280x800px und größer

### Animationen
- Smooth Transitions für Sidebar
- Typing-Indikator während Response
- Fade-In für neue Nachrichten

---

## 🔧 Entwicklungs-Setup

### Voraussetzungen
- Node.js 18+
- Rust (für Tauri)
- pnpm

### Installation
```bash
# Repository klonen
git clone <repo>
cd copilot-desktop

# Dependencies installieren
pnpm install

# Entwicklung starten
pnpm tauri dev

# Produktion bauen
pnpm tauri build
```

---

## 📝 API Notizen

### GitHub Device Flow
```typescript
// 1. Device Code anfordern
POST https://github.com/login/device/code
Content-Type: application/json
{
  "client_id": "Iv1.XXXXXXXXXXXX",
  "scope": "copilot"
}

// Response
{
  "device_code": "xxx",
  "user_code": "ABCD-1234",
  "verification_uri": "https://github.com/login/device",
  "expires_in": 899,
  "interval": 5
}

// 2. Token polling
POST https://github.com/login/oauth/access_token
{
  "client_id": "Iv1.XXXXXXXXXXXX",
  "device_code": "xxx",
  "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
}
```

### Copilot Chat API
```typescript
// Chat Completion
POST https://api.githubcopilot.com/chat/completions
Authorization: Bearer <github_token>
Content-Type: application/json
{
  "model": "gpt-4o",
  "messages": [...],
  "stream": true,
  "temperature": 0.7
}
```

---

## ⚠️ Wichtige Hinweise

1. **Kein Client Secret**: Device Flow benötigt kein Secret, ideal für Desktop-Apps
2. **Token sicher speichern**: Tauri's Keychain-Integration nutzen
3. **Rate Limits beachten**: GitHub Copilot hat Usage-Limits je nach Plan
4. **Offline-Modus**: Alte Chats sollten auch offline lesbar sein

---

## 📚 Ressourcen

- [Tauri Documentation](https://tauri.app/v2/guide/)
- [GitHub OAuth Device Flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
- [GitHub Copilot API](https://docs.github.com/en/copilot)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
