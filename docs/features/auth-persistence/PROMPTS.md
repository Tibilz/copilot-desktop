# Arbeitsanweisungen: Auth Persistence

Hier sind die Implementierungsschritte für den **Code Executor**.
Bitte arbeite diese Schritte der Reihe nach ab und aktualisiere `OUTPUT.md`.

## 📦 Schritt 1: Rust Dependencies (Backend)

Wir müssen sicherstellen, dass wir auf den System-Keyring zugreifen können.

1. Öffne `src-tauri/Cargo.toml`.
2. Füge die dependency `keyring` hinzu:
   ```toml
   [dependencies]
   keyring = "2.3" # Check version
   # ...
   ```
3. Führe `cargo check` im Terminal aus, um zu prüfen, ob es kompiliert.

## 🦀 Schritt 2: Rust Commands implementieren

Wir brauchen 3 Commands in Rust, um das Token zu verwalten.

1. Bearbeite `src-tauri/src/lib.rs`.
2. Implementiere folgende Funktionen und registriere sie im `invoke_handler`:
   
   ```rust
   use keyring::Entry;

   #[tauri::command]
   fn save_token(service: &str, user: &str, token: &str) -> Result<(), String> {
       let entry = Entry::new(service, user).map_err(|e| e.to_string())?;
       entry.set_password(token).map_err(|e| e.to_string())?;
       Ok(())
   }

   #[tauri::command]
   fn get_token(service: &str, user: &str) -> Result<Option<String>, String> {
       let entry = Entry::new(service, user).map_err(|e| e.to_string())?;
       match entry.get_password() {
           Ok(t) => Ok(Some(t)),
           Err(keyring::Error::NoEntry) => Ok(None),
           Err(e) => Err(e.to_string()),
       }
   }

   #[tauri::command]
   fn delete_token(service: &str, user: &str) -> Result<(), String> {
       let entry = Entry::new(service, user).map_err(|e| e.to_string())?;
       // Ignore if not exists
       let _ = entry.delete_password();
       Ok(())
   }
   ```
3. Vergiss nicht das `#[tauri::command]` Makro und die Registrierung in `tauri::Builder`.

## ⚛️ Schritt 3: Auth Store anpassen (Frontend)

Jetzt verbinden wir das Frontend mit den neuen Rust Commands.

1. Bearbeite `src/stores/authStore.ts`.
2. Konstanten definieren (falls noch nicht da):
   ```typescript
   const SERVICE = "copilot-desktop";
   const USER_KEY = "user_token";
   ```
3. Aktualisiere `startLogin` / `confirmLogin`:
   - Wenn Token empfangen wird -> `invoke('save_token', { service: SERVICE, user: USER_KEY, token })`.
4. Aktualisiere `logout`:
   - `invoke('delete_token', ...)`
   - State resetten.
5. Stelle sicher, dass `checkAuth` beim App-Start aufgerufen wird (passiert evtl. schon in `Sidebar` oder `App.tsx`? Prüfen!).

## 🧪 Schritt 4: UI Prüfung

1. Prüfe `src/components/Auth/LoginFlow.tsx`.
2. Zeige einen `Loading...`-Spinner an, solange `loading` true ist (während `checkAuth` läuft), damit der Login-Button nicht kurz sichtbar ist, wenn man eigentlich eingeloggt ist.

---

**Wenn fertig:**
- Starte App: `pnpm tauri dev`
- Teste Login -> Neustart -> Logout -> Neustart.
- Schreibe `OUTPUT.md`.
