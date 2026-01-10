# OUTPUT.md

## Iteration: Drag & Drop Fixes

### Durchgeführte Änderungen

#### 1. Drag & Drop Stabilität
- **Datei:** `src/components/Sidebar/ProjectFolder.tsx`
- **Änderung:** 
  - `handleDragLeave` Logik verbessert: Prüft nun mittels `contains(relatedTarget)`, ob der Mauszeiger den Container wirklich verlassen hat oder nur auf ein Kind-Element (Text, Icon) gewechselt ist.
  - `dropEffect = 'move'` in `handleDragOver` explizit gesetzt.
- **Grund:** Behebt das "Flackern" des Highlight-Status (IsDragOver), wenn man über die Textelemente innerhalb des Projektordners zieht. Dadurch war das Droppen bisher unzuverlässig und erforderte präzises Zielen auf den Rand.
- **Status:** ✅ Fertig

### Offene Probleme
- Keine.

### Nächste Schritte
- [ ] Testen ob Chats jetzt flüssig und zuverlässig in Ordner gezogen werden können.
