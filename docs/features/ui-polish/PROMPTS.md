# Arbeitsanweisungen: UI Polish & Features

Wir packen jetzt die Fixes und die neuen Features in eine Iteration.

## 📂 Schritt 1: Projekte (Modal & Drag-Drop)

1.  **Modal & Sidebar:**
    - Ersetze `prompt()` durch `CreateProjectModal.tsx`.
    - Implementiere `MoveToProjectModal.tsx` für das Kontextmenü (optional, da wir jetzt Drag & Drop machen, aber gut als Fallback).

2.  **Drag & Drop (HTML5 Native):**
    - **Datei:** `src/components/Sidebar/ChatItem.tsx`
      - Add `draggable="true"`.
      - `onDragStart`: Setze `chatId` ins dataTransfer (`e.dataTransfer.setData('chatId', chat.id)`).
    - **Datei:** `src/components/Sidebar/ProjectFolder.tsx`
      - Add `onDragOver` (prevent default).
      - Add `onDrop`:
        - Hole `chatId`.
        - Rufe `useProjectStore().moveChat(chatId, project.id)`.
      - Visuelles Feedback (Highlight border bei DragOver) wäre nice.

## 🧠 Schritt 2: Projekt "Haupt-Chat" (Memory)

1.  **Konzept:** Ein spezieller Chat-Modus, der Kontext aus anderen Chats im Projekt zieht.
2.  **Implementation:**
    - **Datei:** `src/stores/chatStore.ts` / `src/services/chatService.ts`
    - Füge Funktion `createProjectContextMessage(projectId: string)` hinzu:
      - Hole alle Chats des Projekts.
      - Hole jeweils die letzten 3-5 Nachrichten.
      - Baue einen System-Prompt-Header / Kontext-Block: *PROJECT CONTEXT FROM OTHER CHATS: ...*
    - **UI:**
      - Im `ProjectFolder.tsx`: Ein Button "Chat with Project" (neben dem Projektnamen oder als erstes Item).
      - Dieser öffnet einen *neuen* Chat (oder temporären Modus), der beim Senden den Projekt-Kontext mitschickt.

## ⌨️ Schritt 3: Input Features (Anhang, Reasoning, Web)

1.  **Datei:** `src/components/Chat/MessageInput.tsx`
2.  **State:** Füge lokalen State für `attachments`, `isWebEnabled`, `isReasoningEnabled` hinzu.
3.  **Anhang (Paperclip):**
    - Hidden Input `type="file"`.
    - Bei Auswahl: Lies File Content (TextReader).
    - Zeige Dateinamen als Chip über dem Input an.
    - Beim Senden: Füge Inhalt zum Prompt hinzu: `\n\n--- FILE: filename ---\n[content]\n---`.
4.  **Reasoning (Lightbulb):**
    - Toggle State (On/Off). Visuelles Feedback (Button leuchtet).
    - Logik: Wenn ON, wird das Modell für diesen Request temporär auf `o1-preview` (oder `o1-mini`) überschrieben, ODER es wird ein System-Prompt "Think step-by-step" angehängt (wenn Modell das nicht unterstützt). Bevorzugt Modell-Switch.
5.  **Web (Globe):**
    - Toggle State.
    - Logik: Da wir keine echte Such-API haben, füge dem Prompt ein Prefix hinzu `[WEB SEARCH REQUEST]` und instruiere den System-Prompt (in `copilotApi.ts` oder `chatStore`), dass er so tun soll als ob, oder nutze Copilots "Browse" Capability falls vorhanden (meistens nicht via API).
    - *Fallback:* Einfach Toggle UI bauen und Zustand speichern.

## ⚙️ Schritt 4: Settings & Cleanups

1.  **Settings:** fake Limits & "Active" Label entfernen (`AccountSettings.tsx`).
2.  **Copilot API:**
    - Erweitere Modell-Liste in `chatService.ts` (`claude-3.5-sonnet`, etc.).
    - Fixe API Calls, falls Mapping nötig ist.

## 🐝 Schritt 5: Swarm Toggle

- Kommentiere Swarm Toggle in `Header.tsx` aus.

## 📝 OUTPUT.md

Bitte dokumentieren, was funktioniert und was simuliert ist (z.B. Web Search).
