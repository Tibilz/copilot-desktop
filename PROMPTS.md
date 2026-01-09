# KI-Prompts für Copilot Desktop

> Letzte Aktualisierung: Iteration 7 - Bug Fixes & Polish

---

## 🎯 Kontext für die KI

**WICHTIG: Lies zuerst diese Dateien:**
- `SPEC.md` - Komplette technische Spezifikation
- `UI_REFERENCE.md` - UI Design Vorgaben mit ASCII-Mockups
- `TEST_WALKTHROUGH.md` - Aktueller Test-Report mit gefundenen Bugs

**Tech Stack:**
- Tauri 2.0 (Rust Backend)
- React 18 + TypeScript
- Tailwind CSS
- Zustand (State Management)
- SQLite (via @tauri-apps/plugin-sql)

---

# 🚨 Iteration 7: Bug Fixes & Verbesserungen

Der User hat einen umfassenden Test durchgeführt. Hier sind alle gefundenen Bugs und Feature-Requests, **priorisiert nach Wichtigkeit**.

---

## 🔴 KRITISCH (Muss gefixt werden)

### 1. Auth-Token wird nicht persistent gespeichert
**Problem:** Nach App-Neustart muss man sich neu einloggen, obwohl Token im Keychain sein sollte.

**Zu prüfen:**
- `src/stores/authStore.ts` - `checkAuth()` Funktion
- `src-tauri/src/lib.rs` - `get_token` Command
- Token wird beim Login gespeichert mit `save_token`, aber beim Start nicht geladen

**Lösung:**
```typescript
// In App.tsx oder main.tsx beim Start:
useEffect(() => {
  authStore.checkAuth(); // Muss Token aus Keychain laden
}, []);
```

Stelle sicher, dass `checkAuth()` aufgerufen wird UND dass `get_token` den richtigen Token zurückgibt.

---

### 2. Logout funktioniert nicht richtig
**Problem:** Nach Logout bleibt die UI gleich, man kann noch alles sehen. Erst wenn man chattet kommt "[Error: No GitHub accounts connected]".

**Lösung:**
```typescript
// In authStore.ts logout():
logout: () => {
  // Token löschen
  invoke('delete_token', { service: SERVICE, user: USER_KEY });
  // State zurücksetzen
  set({ 
    isAuthenticated: false, 
    user: null, 
    token: null,
    deviceFlow: null 
  });
  // Zur Login-Seite navigieren oder App-State zurücksetzen
}
```

Nach Logout sollte sofort der Login-Screen erscheinen!

---

### 3. Dark Mode funktioniert nicht
**Problem:** Theme-Toggle in Settings ist vorhanden, aber Klick ändert nichts.

**Zu prüfen:**
- `src/stores/settingsStore.ts` - Theme wird gespeichert?
- `src/index.css` - CSS-Variablen für Dark Mode vorhanden?
- `src/App.tsx` - Theme-Class wird auf `<html>` oder `<body>` gesetzt?

**Lösung:**
```typescript
// settingsStore.ts
interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// App.tsx oder Layout-Komponente
useEffect(() => {
  const theme = useSettingsStore.getState().theme;
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  document.documentElement.classList.toggle('dark', isDark);
}, [theme]);
```

```css
/* index.css - Tailwind Dark Mode */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Dark Mode Variables */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f7f7f8;
  --bg-sidebar: #f9f9f9;
  --text-primary: #1a1a1a;
  --text-secondary: #6b6b6b;
  --border: #e5e5e5;
  --accent: #10a37f;
}

.dark {
  --bg-primary: #212121;
  --bg-secondary: #2f2f2f;
  --bg-sidebar: #171717;
  --text-primary: #ececec;
  --text-secondary: #8e8e8e;
  --border: #3d3d3d;
  --accent: #10a37f;
}
```

---

### 4. Projekt erstellen funktioniert nicht
**Problem:** "+" Button bei Projekte macht nichts.

**Zu prüfen:**
- `src/components/Sidebar/` - Gibt es einen ProjectFolder.tsx oder ähnliches?
- Ist der onClick-Handler verbunden?
- Wird ein Modal/Dialog geöffnet?

**Lösung:** Implementiere Projekt-Erstellung:
```typescript
// projectStore.ts
createProject: async (name: string) => {
  const id = crypto.randomUUID();
  await db.execute(
    'INSERT INTO projects (id, name) VALUES (?, ?)',
    [id, name]
  );
  await get().loadProjects();
  return id;
}

// Sidebar - Button muss Modal öffnen für Namenseingabe
```

---

### 5. Suche funktioniert nicht
**Problem:** Suchfeld in Sidebar macht nichts.

**Lösung:**
```typescript
// In Sidebar oder ChatList:
const [searchQuery, setSearchQuery] = useState('');

const filteredChats = chats.filter(chat => 
  chat.title.toLowerCase().includes(searchQuery.toLowerCase())
);

// Render filteredChats statt chats
```

---

## 🟠 WICHTIG (Sollte gefixt werden)

### 6. Links öffnen sich IN der App
**Problem:** Wenn man einen Link anklickt, öffnet er sich im App-Fenster und man kommt nicht mehr zurück.

**Lösung:** Links in externem Browser öffnen:
```typescript
// In MessageBubble.tsx oder wo Markdown gerendert wird:
import { openUrl } from '@tauri-apps/plugin-opener';

// Bei Markdown-Rendering:
<ReactMarkdown
  components={{
    a: ({ href, children }) => (
      <a 
        href={href}
        onClick={(e) => {
          e.preventDefault();
          if (href) openUrl(href);
        }}
        className="text-accent hover:underline cursor-pointer"
      >
        {children}
      </a>
    ),
    // ... andere components
  }}
>
```

---

### 7. Code-Blöcke ohne Kopier-Button
**Problem:** Code-Blöcke haben keinen Kopier-Button.

**Lösung:**
```tsx
// In MessageBubble.tsx beim code-Block:
code({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');
  
  if (!inline && match) {
    return (
      <div className="relative group">
        <button
          onClick={() => navigator.clipboard.writeText(codeString)}
          className="absolute top-2 right-2 p-1 bg-bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Kopieren"
        >
          <Copy size={14} />
        </button>
        <SyntaxHighlighter style={oneDark} language={match[1]}>
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }
  return <code className={className} {...props}>{children}</code>;
}
```

---

### 8. Chat-Titel nicht änderbar + Auto-Generierung
**Problem:** 
- Chats können nicht umbenannt werden
- Titel wird nicht automatisch vom ersten Thema generiert

**Lösung 1 - Umbenennen:**
```typescript
// chatStore.ts
renameChat: async (chatId: string, newTitle: string) => {
  await db.execute('UPDATE chats SET title = ? WHERE id = ?', [newTitle, chatId]);
  set(state => ({
    chats: state.chats.map(c => c.id === chatId ? { ...c, title: newTitle } : c)
  }));
}

// ChatItem.tsx - Doppelklick zum Umbenennen oder Kontextmenü
```

**Lösung 2 - Auto-Generierung:**
Nach der ersten User-Nachricht, frage die KI nach einem Titel:
```typescript
// Nach erster Antwort:
if (messages.length === 2 && chat.title === 'Neuer Chat') {
  const titlePrompt = `Generiere einen kurzen Titel (max 5 Wörter) für diesen Chat basierend auf: "${messages[0].content}". Antworte NUR mit dem Titel, ohne Anführungszeichen.`;
  const title = await copilotApi.chat(model, [{ role: 'user', content: titlePrompt }]);
  await chatStore.renameChat(chatId, title.trim());
}
```

---

### 9. Löschen ohne Bestätigung
**Problem:** Chats werden ohne Bestätigung gelöscht.

**Lösung:**
```tsx
// Entweder Browser-Confirm:
const handleDelete = (chatId: string) => {
  if (window.confirm('Chat wirklich löschen?')) {
    chatStore.deleteChat(chatId);
  }
};

// Oder schönes Modal:
const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
// Render ConfirmModal wenn deleteConfirmId gesetzt
```

---

### 10. Username wird nicht richtig angezeigt
**Problem:** Unten links steht nur "user" statt der echte GitHub-Username.

**Zu prüfen:**
- `authStore.ts` - Wird `user.login` gespeichert?
- Sidebar Footer - Wird `user.login` angezeigt?

**Lösung:**
```tsx
// SidebarFooter.tsx
const { user } = useAuthStore();
// ...
<span>{user?.login || user?.name || 'User'}</span>
```

---

### 11. Modelle die nicht funktionieren
**Problem:** Claude 3.5 Sonnet gibt Error "model_not_supported".

**Lösung:** Nur unterstützte Modelle anzeigen:
```typescript
// Dynamisch von API laden oder nur bekannte:
const AVAILABLE_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'o1-preview', name: 'o1 Preview' },
  { id: 'o1-mini', name: 'o1 Mini' },
  // Claude scheint nicht unterstützt - entfernen oder testen
];

// Besser: GET /models von API abrufen und nur die anzeigen
```

---

### 12. Debug-Button entfernen
**Problem:** "Test HTTP Fetch" Debug-Button ist noch da.

**Lösung:** In `LoginFlow.tsx` den Test-Button und Debug-Output entfernen.

---

## 🟡 NICE TO HAVE (Wenn Zeit bleibt)

### 13. Kopier-Animation beim Device Code
Button sollte kurz Feedback geben (z.B. "✓ Kopiert" für 2 Sekunden).

### 14. Text geht über den Rand
Prüfe `max-width` und `overflow-wrap: break-word` in Chat-Bubbles.

### 15. Worker löschen in Swarm Config
Delete-Button für Worker implementieren falls fehlend.

### 16. Swarm Execution View schließt nicht bei Error
Nach Error sollte das Panel schließbar sein oder automatisch nach Timeout verschwinden.

### 17. Mehr Modelle in Swarm
Alle verfügbaren Modelle auch in Swarm-Config anbieten.

### 18. App-Icon statt grauer Kreis
In leerem Chat-Zustand ein schönes Icon statt grauem Kreis.

### 19. Weiteren Account verbinden
Button in Settings muss den Login-Flow erneut starten für zweiten Account.

---

## 📋 CHECKLISTE

### Kritisch (Blocker)
- [ ] Auth-Token Persistenz fixen
- [ ] Logout richtig implementieren
- [ ] Dark Mode zum Laufen bringen
- [ ] Projekt erstellen implementieren
- [ ] Suche implementieren

### Wichtig
- [ ] Links extern öffnen
- [ ] Code-Kopier-Button
- [ ] Chat umbenennen
- [ ] Chat-Titel Auto-Generierung
- [ ] Lösch-Bestätigung
- [ ] Echter Username anzeigen
- [ ] Nicht-unterstützte Modelle entfernen
- [ ] Debug-Button entfernen

### Nice to Have
- [ ] Kopier-Animation
- [ ] Text-Overflow fixen
- [ ] Worker löschen
- [ ] Swarm Error Handling
- [ ] Mehr Swarm-Modelle
- [ ] App-Icon
- [ ] Multi-Account

---

## 🔧 Dateien die bearbeitet werden müssen

### Kritisch
- `src/stores/authStore.ts` - Token Persistenz, Logout
- `src/stores/settingsStore.ts` - Theme speichern
- `src/App.tsx` - checkAuth beim Start, Dark Mode Class
- `src/index.css` - Dark Mode CSS Variablen
- `src/components/Sidebar/` - Projekt erstellen, Suche

### Wichtig
- `src/components/Chat/MessageBubble.tsx` - Links extern, Code-Button
- `src/components/Sidebar/ChatItem.tsx` - Umbenennen, Löschen
- `src/stores/chatStore.ts` - renameChat, Titel-Generierung
- `src/components/Auth/LoginFlow.tsx` - Debug entfernen
- `src/services/copilotApi.ts` oder Konstanten - Modell-Liste

### Nice to Have
- `src/components/Swarm/` - Error Handling, Worker löschen
- Verschiedene UI-Verbesserungen

---

## 🎯 Arbeitsreihenfolge

1. **Auth-Token Persistenz** - Wichtigster Bug
2. **Logout fixen**
3. **Debug-Button entfernen**
4. **Dark Mode**
5. **Links extern öffnen**
6. **Suche implementieren**
7. **Projekt erstellen**
8. **Chat umbenennen + Auto-Titel**
9. **Code-Kopier-Button**
10. **Lösch-Bestätigung**
11. Rest nach Priorität

---

**START MIT AUTH-TOKEN PERSISTENZ!**

---

## 📝 Vorherige Iterationen (Referenz)

<details>
<summary>Klicken für alte Iteration-Details</summary>

### Iteration 1-5: Grundaufbau
- Tauri 2.0 Setup
- React Frontend
- Login Flow (Device Code)
- Chat-Funktionalität
- SQLite Datenbank
- Swarm UI Grundstruktur

### Iteration 6: Login-Bug Fix
- HTTP Permissions in Tauri Capabilities
- `@tauri-apps/plugin-http` Integration
- `fetch` zu `tauriFetch` Umstellung

</details>

---

## 🎯 JETZT STARTEN

Die KI soll mit **Bug #1 (Auth-Token Persistenz)** beginnen und dann systematisch durch die Liste arbeiten.

**Wichtig:** Nach jedem Fix kurz testen ob es funktioniert!
