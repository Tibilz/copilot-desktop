# Feature: Auth Token Persistence

> Branch: `feature/auth-persistence`
> Erstellt: 10. Januar 2026
> Status: 🟡 In Arbeit

---

## 🎯 Ziel

Der Auth-Token soll nach App-Neustart im OS Keychain persistiert und automatisch geladen werden.

---

## 📋 Anforderungen

### Funktional
- [ ] Token wird beim Login im OS Keychain gespeichert
- [ ] Token wird beim App-Start automatisch aus Keychain geladen
- [ ] Bei gültigem Token: Direkt zum Chat, kein Login-Screen
- [ ] Bei ungültigem/fehlendem Token: Login-Screen zeigen
- [ ] Logout löscht Token aus Keychain UND State

### Nicht-Funktional
- [ ] Sicherheit: Token nie im localStorage oder unverschlüsselt
- [ ] UX: Kein Flackern beim Start (Loading State)
- [ ] Performance: Keychain-Zugriff < 100ms

---

## 🎨 UI/UX Spezifikation

### Betroffene Komponenten
- `src/App.tsx` - Auth-Check beim Start
- `src/stores/authStore.ts` - Token laden/speichern
- `src/components/Auth/LoginFlow.tsx` - Login-Logik

### App-Start Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        APP START                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │   Loading Screen    │
                │   "Laden..."        │
                └──────────┬──────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  checkAuth() aufrufen  │
              │  → get_token (Tauri)   │
              └───────────┬────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    ┌───────────────┐          ┌───────────────┐
    │ Token gefunden│          │ Kein Token    │
    │ & gültig      │          │ oder ungültig │
    └───────┬───────┘          └───────┬───────┘
            │                          │
            ▼                          ▼
    ┌───────────────┐          ┌───────────────┐
    │  Chat-View    │          │  Login-Flow   │
    │  anzeigen     │          │  anzeigen     │
    └───────────────┘          └───────────────┘
```

### Loading State UI

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                         ⟳                                   │
│                   Laden...                                  │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technische Details

### Betroffene Dateien

```
src/
├── App.tsx                    # useEffect für checkAuth beim Mount
├── stores/
│   └── authStore.ts           # checkAuth, logout Logik
└── components/
    └── Auth/
        └── LoginFlow.tsx      # Debug-Button entfernen

src-tauri/
└── src/
    └── lib.rs                 # get_token, save_token, delete_token
```

### authStore.ts Änderungen

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;        // NEU: Für Loading-State
  user: GitHubUser | null;
  token: string | null;
  
  // Actions
  checkAuth: () => Promise<void>;   // FIXEN: Token aus Keychain laden
  logout: () => Promise<void>;      // FIXEN: Token löschen + State reset
  // ...
}

// checkAuth Implementation
checkAuth: async () => {
  set({ isLoading: true });
  try {
    const token = await invoke<string>('get_token', { 
      service: 'copilot-desktop', 
      user: 'github-token' 
    });
    
    if (token) {
      // Token validieren (optional: API Call)
      const user = await fetchGitHubUser(token);
      set({ isAuthenticated: true, user, token, isLoading: false });
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }
  } catch (error) {
    set({ isAuthenticated: false, isLoading: false });
  }
}

// logout Implementation  
logout: async () => {
  try {
    await invoke('delete_token', { 
      service: 'copilot-desktop', 
      user: 'github-token' 
    });
  } catch (e) {
    console.error('Token deletion failed:', e);
  }
  
  set({ 
    isAuthenticated: false, 
    user: null, 
    token: null,
    deviceFlow: null 
  });
}
```

### App.tsx Änderungen

```typescript
function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <LoginFlow />;
  }
  
  return <MainLayout />;
}
```

---

## ✅ Akzeptanzkriterien

- [ ] Nach Login → App schließen → App öffnen → Direkt im Chat (kein Login)
- [ ] Logout → App schließen → App öffnen → Login-Screen erscheint
- [ ] Kein Flackern beim App-Start
- [ ] Token ist NICHT in localStorage sichtbar (DevTools)
- [ ] Debug-Button "Test HTTP Fetch" ist entfernt

---

## 🧪 Test-Szenarien

### Manuelle Tests
- [ ] Fresh Install: Login-Flow wird angezeigt
- [ ] Nach Login: Chat ist sichtbar
- [ ] App-Neustart nach Login: Direkt im Chat
- [ ] Logout klicken: Login-Flow erscheint sofort
- [ ] App-Neustart nach Logout: Login-Flow erscheint

### Unit Tests
- [ ] `authStore.checkAuth()` setzt `isAuthenticated: true` wenn Token vorhanden
- [ ] `authStore.checkAuth()` setzt `isAuthenticated: false` wenn kein Token
- [ ] `authStore.logout()` ruft `delete_token` auf und resettet State

---

## 📝 Notizen

- Der Rust-Backend-Code für Keychain sollte bereits funktionieren (`keyring` crate)
- Problem war wahrscheinlich, dass `checkAuth()` nicht beim App-Start aufgerufen wurde
- `isLoading` State verhindert UI-Flackern

---

## 🔗 Referenzen

- Hauptspezifikation: [SPEC.md](../../SPEC.md#-github-copilot-integration)
- Auth API Notes: [SPEC.md](../../SPEC.md#-api-notizen)
