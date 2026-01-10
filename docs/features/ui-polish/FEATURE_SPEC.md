# Feature: UI Polish & Enhanced Features

> Branch: `feature/ui-polish-fixes`
> Status: 🟡 In Arbeit
> Update: 10. Januar 2026 (Updated)

---

## 🎯 Ziel

Behebung verbleibender UX/UI Bugs und Implementierung erweiterter Funktionen (Drag & Drop, Project Memory, Input Tools).

---

## 📋 Anforderungen

### 1. 📂 Projekt-Management (Enhanced)
- [ ] **Drag & Drop:** Chats können per Drag & Drop in Projekt-Ordner gezogen werden.
- [ ] **Modal Fix:** "+" Button nutzt Modal statt `prompt()`.
- [ ] **"Haupt-Chat" (Project Memory):**
  - Innerhalb eines Projekts gibt es eine Möglichkeit, mit dem Kontext **aller** enthaltenen Chats zu schreiben.
  - Der "Haupt-Chat" kennt den Inhalt der anderen Chats im Projekt.

### 2. ⚙️ Einstellungen & Cleanups
- [ ] **Bereinigung:** Fake Limits, "Active" Labels, Multi-Account entfernen.

### 3. ⌨️ Input Features (Funktional machen)
- [ ] **Anhang (Paperclip):** Textdateien (.txt, .md, code) hochladen und als Kontext senden.
- [ ] **Reasoning (Lightbulb):** Toggle Button. Wenn aktiv -> Modellwechsel zu `o1-preview` (oder Prompt-Anweisung "Think step by step").
- [ ] **Web (Globe):** Toggle Button. Markiert Request für Web-Suche (Mock/System Prompt Flag vorerst, da keine Such-API).

### 4. 🎨 Modelle & Fixes
- [ ] **Modell-Liste:** Claude 3.5 Sonnet, o1-preview hinzufügen.
- [ ] **Swarm:** Button ausblenden.

---
