# Feature: Dark Mode

> Branch: `feature/dark-mode`
> Erstellt: 10. Januar 2026
> Status: 🟡 In Arbeit

---

## 🎯 Ziel

Vollständige Unterstützung von Light/Dark Mode inklusive Persistierung der User-Einstellung und Erkennung der System-Präferenz.

---

## 📋 Anforderungen

### Funktional
- [ ] Toggle-Button in den Einstellungen.
- [ ] Einstellung wird gespeichert (local storage oder settings backend).
- [ ] Default: System-Einstellung ("Auto").
- [ ] Live-Update der UI ohne Reload.

### Nicht-Funktional
- [ ] Nutzung von Tailwind `dark:` Klassen.
- [ ] Konsistente Farbpalette für beide Modi.

---

## 🏗 Technische Details

### Tailwind Config
- `tailwind.config.js`: `darkMode: 'class'` aktivieren.

### State Management (`settingsStore.ts`)
- Store muss Theme-State halten: `'light' | 'dark' | 'system'`.
- Muss beim init prüfen, was gespeichert ist.
- Wenn 'system': `window.matchMedia('(prefers-color-scheme: dark)')` nutzen.
- Muss `document.documentElement.classList.add('dark')` (oder remove) steuern.

### UI Komponenten
- `Sidebar.tsx` oder `AccountSettings.tsx`: Dropdown/Toggle für Theme.
- Anpassung der Farben:
  - `bg-bg-primary` -> sollte im Darkmode fast schwarz sein, im Lightmode wriß.
  - `text-text-primary` -> entsprechend invertiert.

---

## 🎨 Design Colors (Vorschlag)

| Token | Light (Tailwind/Hex) | Dark (Tailwind/Hex) |
|-------|----------------------|---------------------|
| `bg-primary` | `white` (#FFFFFF) | `gray-900` (#111827) |
| `bg-secondary` | `gray-100` (#F3F4F6) | `gray-800` (#1F2937) |
| `text-primary` | `gray-900` (#111827) | `white` (#FFFFFF) |
| `text-secondary`| `gray-500` (#6B7280) | `gray-400` (#9CA3AF) |

---

## ✅ Akzeptanzkriterien
- [ ] User wählt "Dark" -> App wird sofort dunkel.
- [ ] User wählt "Light" -> App wird sofort hell.
- [ ] User wählt "System" -> App folgt OS Einstellung.
- [ ] Nach Neustart bleibt die Einstellung erhalten.
