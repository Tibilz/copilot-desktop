# Arbeitsanweisungen: Dark Mode

Hier sind die Implementierungsschritte für den **Code Executor**.

## 🎨 Schritt 1: Tailwind Konfiguration

1. Öffne `tailwind.config.js`.
2. Setze `darkMode`:
   ```javascript
   module.exports = {
     darkMode: 'class',
     // ...
   }
   ```
3. Definiere die CSS-Variablen oder Tailwind-Farben in `src/index.css` oder der Config, falls wir Custom Colors nutzen (empfohlen: Semantic Names wie `bg-bg-primary` etc.).

## ⚙️ Schritt 2: Settings Store erweitern

1. Öffne `src/stores/settingsStore.ts`.
2. Füge `theme` State hinzu:
   ```typescript
   export type ThemeOption = 'light' | 'dark' | 'system';
   
   interface SettingsState {
       theme: ThemeOption;
       setTheme: (theme: ThemeOption) => void;
       // ...
   }
   ```
3. Implementiere `setTheme`:
   - Speichere Wert (z.B. `tauri-plugin-store` oder `localStorage` als einfacher Start).
   - Aktualisiere nicht nur den State, sondern Trigger auch den DOM-Change:
     ```typescript
     setTheme: (theme) => {
         set({ theme });
         applyTheme(theme);
     }
     ```

## 🖥️ Schritt 3: Globaler Theme Effect

Wir brauchen eine Funktion, die das Theme im DOM anwendet.

1. Erstelle evtl. `src/utils/themeUtils.ts` oder direkt im Store.
2. Logik:
   - Wenn `dark`: `document.documentElement.classList.add('dark')`
   - Wenn `light`: `document.documentElement.classList.remove('dark')`
   - Wenn `system`: Check `matchMedia`.
3. Wichtig: Listener für System-Changes hinzufügen, wenn mode == 'system'.

## 🔘 Schritt 4: UI Toggle

1. Bearbeite `src/components/Settings/AccountSettings.tsx` (oder wo der Toggle hinsoll).
2. Füge eine Select-Box oder Buttons hinzu, die `setTheme` aufrufen.
3. Teste alle 3 Zustände.

---

**Prüfung:**
- Schalte OS Dark Mode an/aus -> Reagiert App bei "System"?
- Force Dark Mode -> Bleibt dunkel nach Reload?
