## Iteration 8.1 - 10. Januar 2026

### Durchgeführte Änderungen

#### 1. Settings (Account Management)
- **Datei:** `src/components/Settings/AccountSettings.tsx`
- **Problem:** "Mülleimer" löschte nur den DB-Eintrag, loggte den aktiven User aber nicht aus. "Account hinzufügen" funktionierte nicht, weil das globale Loading-Overlay die UI blockierte.
- **Lösung:**
    - `handleRemove`: Prüft nun, ob der gelöschte Account dem aktuellen User entspricht. Wenn ja -> `logout()`.
    - `Add Account`: UI zeigt nun einen "Verbinde mit GitHub..." Spinner anstelle von gar nichts.
- **Datei:** `src/App.tsx`
- **Lösung:** Globales Loading-Overlay wird nun **nur** angezeigt, wenn der User noch NICHT eingeloggt ist. Wenn man eingeloggt ist (z.B. in Settings), darf `authStore.loading` nicht die gesamte App blockieren.
- **Status:** ✅ Fertig

### Offene Probleme
- Keine.

### Nächste Schritte
- [ ] Testen: Mülleimer bei aktivem User -> Logout.
- [ ] Testen: "Weiteren Account verbinden" -> Flow läuft durch ohne Blocking.
