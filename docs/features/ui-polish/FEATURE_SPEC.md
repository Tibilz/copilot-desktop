# Feature: UI Polish & Enhanced Features

> Branch: `feature/ui-polish-fixes`
> Status: ✅ Abgeschlossen
> Update: 10. Januar 2026

---

## 🎯 Ziel

Behebung verbleibender UX/UI Bugs und Implementierung erweiterter Funktionen (Drag & Drop, Project Memory, Input Tools).

---

## 📋 Anforderungen

### 1. 📂 Projekt-Management (Enhanced)
- [x] **Drag & Drop:** Chats können per Drag & Drop in Projekt-Ordner gezogen werden.
- [x] **Modal Fix:** "+" Button nutzt Modal statt `prompt()`.
- [x] **"Haupt-Chat" (Project Memory):**
  - Innerhalb eines Projekts gibt es eine Möglichkeit, mit dem Kontext **aller** enthaltenen Chats zu schreiben. (Implementiert via Drag & Drop und Context Menu)

### 2. ⚙️ Einstellungen & Cleanups
- [x] **Bereinigung:** Fake Limits, "Active" Labels, Multi-Account entfernen.

### 3. ⌨️ Input Features
- [x] **Anhang (Paperclip):** Textdateien (.txt, .md, code) hochladen und als Kontext senden.
- [x] **Reasoning (Lightbulb):** Toggle Button. Wenn aktiv -> Modellwechsel zu `o1-preview` (oder Prompt-Anweisung "Think step by step").
- [x] **Web (Globe):** Toggle Button. Markiert Request für Web-Suche.

### 4. 🎨 Modelle & Fixes
- [x] **Modell-Liste:** Claude 3.5 Sonnet, o1-preview hinzufügen.
- [x] **Swarm:** Button ausblenden.

---
