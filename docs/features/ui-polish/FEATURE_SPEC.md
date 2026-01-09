# Feature: UI Polish

> Branch: `feature/ui-polish`
> Erstellt: 10. Januar 2026
> Status: 🟡 Geplant

---

## 🎯 Ziel

Visuelles Aufwerten der App, um näher an das originale ChatGPT Desktop Feeling zu kommen. Fokus auf Layout, Spacing, Icons und Animationen.

---

## 📋 Anforderungen

### Layout
- [ ] Sidebar Breite anpassbar oder fixe saubere Breite (260px).
- [ ] Chat-Area zentriert mit `max-width` (ähnlich wie ChatGPT "text container").
- [ ] Message Bubbles Styling verbessern (Avatar oben/links, Markdown sauber rendern).

### Typografie & Icons
- [ ] Schriftart: Inter oder System-Font (SF Pro auf Mac).
- [ ] Lucide Icons durchgängig nutzen.
- [ ] Font-Sizes anpassen (14px/16px Standard).

### Animationen
- [ ] Smooth transitions für Sidebar (Hover/Collapse).
- [ ] Message Streaming Effekt (Cursor blinkt beim Generieren).

---

## 🎨 UI/UX Details

### Chat Message
```
[Avatar]  User Name
          Message Content...
          ...Markdown...
          
          [Copy] [Regenerate] (Hover Actions)
```

### Input Area
- Sollte "sticky" unten schweben, aber mit Abstand zum Rand.
- "Pill Shape" oder "Rounded Rectangle" wie im Original.

---

## ✅ Akzeptanzkriterien
- [ ] App wirkt nicht mehr wie ein "Wireframe".
- [ ] Markdown (Code-Blöcke) sieht sauber aus (Syntax Highlighting).
- [ ] Input Field wächst mit Text (Auto-resize textarea).
