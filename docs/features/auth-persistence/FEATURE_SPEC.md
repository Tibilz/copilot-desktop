# Feature: Auth Token Persistence (Updated)

> Branch: `feature/auth-persistence`
> Status: 🟡 In Arbeit
> Last Update: 10. Januar 2026

---

## 🎯 Ziel

Der Auth-Token soll nach App-Neustart automatisch geladen werden.
**WICHTIG:** Der aktuelle Mock-Modus für Login muss entfernt werden, damit echte Logins möglich sind.

---

## 📋 Anforderungen

### Funktional
- [ ] **MOCK ENTFERNEN:** Echter GitHub Device Flow muss funktionieren.
- [ ] Token wird beim Login im OS Keychain gespeichert (Rust).
- [ ] Token wird beim App-Start automatisch geladen.
- [ ] Login-Button darf nicht auf "Loading..." hängen bleiben wenn User klickt.
- [ ] Logout löscht Token sauber.

### Nicht-Funktional
- [ ] Sicherheit: Token im Keychain (nicht localStorage).
- [ ] UX: Korrektes Loading-Feedback beim Klick auf "Login".

---

## 🔧 Technische Details

### Mock Removal (`src/services/githubAuth.ts`)
- Entferne den `mock_device_code`.
- Nutze `@tauri-apps/plugin-http` für Requests.
- Endpoints:
  - Device Code: `https://github.com/login/device/code`
  - Token Poll: `https://github.com/login/oauth/access_token`
  - User Info: `https://api.github.com/user`

### Fehlerbehebung "Loading..."
- Wenn `checkAuth` fehlschlägt oder kein Token findet -> `loading` = `false`.
- Wenn Login geklickt wird -> `loading` = `true` -> `initiateDeviceFlow`.
- Wenn `initiateDeviceFlow` fehlschlägt -> `loading` = `false` + Error anzeigen.
