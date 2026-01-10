# KI-Prompts für Copilot Desktop

> Letzte Aktualisierung: Iteration 8 - UI Polish

---

## 📤 OUTPUT-DOKUMENTATION (WICHTIG!)

**Nach jeder Änderung musst du die Datei `OUTPUT.md` aktualisieren!**

```markdown
# OUTPUT.md Format

## Iteration X - [Datum]

### Durchgeführte Änderungen

#### 1. [Komponente/Feature Name]
- **Datei(en):** `src/path/to/file.ts`
- **Änderung:** Kurze Beschreibung was geändert wurde
- **Grund:** Warum die Änderung nötig war
- **Status:** ✅ Fertig / ⚠️ Teilweise / ❌ Fehlgeschlagen

### Offene Probleme
- Problem 1...

### Nächste Schritte
- [ ] Task 1
```

**WICHTIG:** 
- `OUTPUT.md` wird bei jeder neuen Iteration **komplett überschrieben** (nicht angehängt!)
- Dokumentiere ALLE Änderungen die du machst.

---

# 🚨 Iteration 8: UI Polish

**Status:**
- ✅ Dark Mode (Fertig)
- ✅ Auth Persistence (Fertig)
- ✅ Logout (Fertig)
- 🟡 UI Polish (Jetzt dran)

Wir wollen, dass die App sich weniger wie eine Webseite anfühlt.

## 🎨 Schritt 1: Global Styles (Scrollbars & Selection)

1. Öffne `src/index.css`.
2. Füge Custom Scrollbar Styles hinzu:
   ```css
   @layer utilities {
     /* Chrome, Edge, Safari */
     .scrollbar-hide::-webkit-scrollbar {
       display: none;
     }
     
     .scrollbar-default::-webkit-scrollbar {
       width: 8px;
       height: 8px;
     }

     .scrollbar-default::-webkit-scrollbar-track {
       background: transparent;
     }

     .scrollbar-default::-webkit-scrollbar-thumb {
       @apply bg-border rounded-full hover:bg-text-secondary/50 transition-colors;
     }
   }
   ```
3. Wende die Klasse `scrollbar-default` auf den Chat-Container und die Sidebar an.

## 💅 Schritt 2: Sidebar Polish

Die Sidebar ist das Haupt-Navigationsinstrument.

1. **Datei:** `src/components/Sidebar/Sidebar.tsx`
2. **Hover & Active:**
   - Stelle sicher, dass `ChatItem` einen deutlichen Hover-Effekt hat (`hover:bg-bg-secondary`).
   - Der *aktive* Chat sollte eine Akzent-Farbe oder einen deutlichen Hintergrund haben (`bg-bg-secondary` + `border-l-2 border-accent`).
3. **Empty State:**
   - Wenn keine Chats da sind, zeige einen kurzen Hilfetext oder "New Chat" Button anstelle von nichts.
4. **Transition:**
   - Sidebar sollte `transition-all duration-300` nutzen (falls Collapsible).

## 💬 Schritt 3: Chat Area Polish

Der Chat muss angenehm zu lesen sein.

1. **Datei:** `src/components/Chat/MessageBubble.tsx`
2. **User vs. AI:**
   - User Bubble: Leicht anderer Hintergrund (`bg-bg-secondary`) oder nur Alignment? GitHub Copilot nutzt meist flaches Design.
   - Stelle sicher, dass Avatare oben ausgerichtet sind (`items-start`), auch bei langen Texten.
3. **Spacing:**
   - Mehr Padding zwischen Nachrichten (`gap-6` im Container).

## ⌨️ Schritt 4: Input Area Polish

1. **Datei:** `src/components/Chat/MessageInput.tsx`
2. **Focus:**
   - Entferne den Standard-Browser-Outline (`outline-none`).
   - Füge einen subtilen Ring hinzu: `focus-within:ring-1 focus-within:ring-accent`.
3. **Layout:**
   - Input Area sollte etwas "schweben" oder klar vom Chat getrennt sein (Border Top oder eigener Container).

## 📝 OUTPUT.md Update

Dokumentiere deine visuellen Änderungen. Vergleiche visuell mit Screenshots von ChatGPT/Copilot (gedanklich).
