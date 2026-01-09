# Feature: [FEATURE_NAME]

> Branch: `feature/[branch-name]`
> Erstellt: [DATUM]
> Status: 🟡 In Arbeit / ✅ Fertig / ❌ Blockiert

---

## 🎯 Ziel

_Was soll dieses Feature erreichen? Ein Satz._

---

## 📋 Anforderungen

### Funktional
- [ ] Anforderung 1
- [ ] Anforderung 2
- [ ] Anforderung 3

### Nicht-Funktional
- [ ] Performance: ...
- [ ] Sicherheit: ...
- [ ] UX: ...

---

## 🎨 UI/UX Spezifikation

### Betroffene Komponenten
- `src/components/...`
- `src/stores/...`

### UI Mockup (ASCII)

```
┌─────────────────────────────────────┐
│  [Hier ASCII-Mockup einfügen]       │
│                                     │
└─────────────────────────────────────┘
```

### Interaktionen
1. User klickt auf X → Y passiert
2. ...

### Farben/Styles
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `#fff` | `#212121` |
| Text | `#1a1a1a` | `#ececec` |

---

## 🔧 Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── [Component].tsx    # Änderung: ...
├── stores/
│   └── [store].ts         # Änderung: ...
└── services/
    └── [service].ts       # Änderung: ...
```

### API/Daten
```typescript
// Neue/geänderte Interfaces
interface Example {
  id: string;
  // ...
}
```

### State Management
```typescript
// Store-Änderungen
interface StoreChanges {
  // Neue State-Felder
  // Neue Actions
}
```

---

## ✅ Akzeptanzkriterien

- [ ] Kriterium 1
- [ ] Kriterium 2
- [ ] Kriterium 3

---

## 🧪 Test-Szenarien

### Unit Tests
- [ ] Test: [Beschreibung]
- [ ] Test: [Beschreibung]

### Manuelle Tests
- [ ] Szenario 1: ...
- [ ] Szenario 2: ...

---

## 📝 Notizen

_Zusätzliche Informationen, Entscheidungen, offene Fragen..._

---

## 🔗 Referenzen

- Hauptspezifikation: [SPEC.md](../../SPEC.md)
- UI Reference: [UI_REFERENCE.md](../../UI_REFERENCE.md)
- Verwandte Issues: #...
