# Arbeitsanweisungen: Mock entfernen & Login Fixen

Status: **DRINGEND**
Der User meldet, dass der Login im "Loading..." State hängen bleibt und der Mock-Modus noch aktiv ist.

## 📦 Schritt 1: Mock entfernen & Echten Auth aktivieren

Wir müssen den Mock-Code in `src/services/githubAuth.ts` durch die echte Implementierung ersetzen.

1. Öffne `src/services/githubAuth.ts`.
2. **Import aktivieren:**
   ```typescript
   import { fetch } from '@tauri-apps/plugin-http';
   ```
3. **Konstanten aktivieren:**
   ```typescript
   const CLIENT_ID = 'Iv1.b507a08c87ecfe98'; // VS Code Copilot Client ID
   const DEVICE_CODE_URL = 'https://github.com/login/device/code';
   const TOKEN_URL = 'https://github.com/login/oauth/access_token';
   const USER_URL = 'https://api.github.com/user';
   ```
4. **`initiateDeviceFlow` implementieren:**
   - Entferne den Mock-Code (setTimeout etc.).
   - Mache einen echten POST Request an `DEVICE_CODE_URL`.
   - Body: `{ client_id: CLIENT_ID, scope: 'read:user copilot' }`.
   - Header: `Accept: application/json`.
   - Returniere die echten Daten (`device_code`, `user_code` etc.).

5. **`pollForToken` implementieren:**
   - Diese Funktion fehlt oder ist gemockt? Sie muss exportiert werden!
   - POST an `TOKEN_URL`.
   - Body: `{ client_id: CLIENT_ID, device_code, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' }`.
   - Returniere JSON.

6. **`fetchUser` implementieren:**
   - GET an `USER_URL`.
   - Header: `Authorization: Bearer <token>`, `User-Agent: copilot-desktop`.

## 🐛 Schritt 2: Loading State Bug beheben

Wenn der Click auf "Login" in "Loading..." hängen bleibt, wird `loading` nie auf `false` gesetzt bei Fehler.

1. Öffne `src/stores/authStore.ts`.
2. Prüfe `startLogin`:
   - Stelle sicher, dass im `catch`-Block `loading: false` gesetzt wird (sollte schon sein, aber bitte prüfen).
   - Logge den genauen Fehler, falls `initiateDeviceFlow` rejected.
3. Prüfe `checkAuth`:
   - Stelle sicher, dass auch im Fehlerfall (z.B. network error beim User-Fetch) `loading: false` gesetzt wird.

## 🧪 Schritt 3: Verifikation

1. Starte `pnpm tauri dev`.
2. Klicke "Login with GitHub".
   - **Erwartung:** Es sollte KEIN 1-Sekunden Mock-Delay sein, sondern ein echter Network-Request.
   - **Erwartung:** Code und Link sollten erscheinen.
3. Klicke NICHT auf den Link, warte kurz -> Sollte nicht abstürzen.
4. Klicke "Abbrechen" -> Sollte Loading beenden.

## 📝 OUTPUT.md Update

Dokumentiere genau, dass der Mock entfernt wurde und welche Dateien geändert wurden.
