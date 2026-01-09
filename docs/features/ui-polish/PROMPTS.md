# Arbeitsanweisungen: UI Polish

Hier sind die Implementierungsschritte für den **Code Executor**.
Fokus: CSS, Komponenten-Struktur, Tailwind.

## 💄 Schritt 1: Globales CSS & Fonts

1. Öffne `src/index.css`.
2. Stelle sicher, dass wir `@tailwind base;` etc. haben.
3. Definiere Base-Styles:
   ```css
   @layer base {
     body {
       @apply bg-bg-primary text-text-primary antialiased;
     }
   }
   ```
4. Prüfe `tailwind.config.js`: Erweitere `colors` um semantische Namen (`bg-chat-bubble`, `border-subtle`, etc.), damit DarkMode einfacher wird.

## 💬 Schritt 2: Message Bubbles

1. Bearbeite `src/components/Chat/MessageBubble.tsx`.
2. Layout ändern: Grid oder Flexbox.
   - Avatar links (fest).
   - Content rechts daneben.
3. Syntax Highlighting für Code-Blöcke verbessern (z.B. mit `react-syntax-highlighter` und einem Theme wie `atom-one-dark`).
4. Kopier-Button für Code-Blöcke hinzufügen.

## ⌨️ Schritt 3: Enhanced Input Area

1. Bearbeite `src/components/Chat/MessageInput.tsx`.
2. Nutze eine Library wie `react-textarea-autosize` für das wachsende Textfeld (optional, oder manuell implementieren).
3. Styling:
   - Rounded corners (xl/2xl).
   - Shadow/Border.
   - Send-Button nur aktiv, wenn Text vorhanden.
   - Stop-Button (Quadrat) während Generierung.

## 📱 Schritt 4: Sidebar Feinschliff

1. Bearbeite `src/components/Sidebar/Sidebar.tsx`.
2. Hover-Effekte für Chat-History Items (`bg-gray-100 dark:bg-gray-800`).
3. "New Chat" Button prominent platzieren (oder oben fixiert).

---

**Abschluss:**
- Vergleiche visuell mit Screenshots von ChatGPT/Copilot.
- Schreibe `OUTPUT.md` mit Vorher/Nachher Beschreibung.
