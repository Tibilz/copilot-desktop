/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
// src/stores/authStore.ts
import { create } from 'zustand';
import {
  initiateDeviceFlow,
  pollForToken,
  fetchUser,
  DeviceCodeResponse,
  GitHubUser,
} from '../services/githubAuth';
import { invoke } from '@tauri-apps/api/core';
import { tokenPool } from '../services/tokenPool';

interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  deviceFlow: DeviceCodeResponse | null;

  startLogin: () => Promise<void>;
  confirmLogin: () => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  cancelLogin: () => void;
}

const SERVICE = 'copilot-desktop';
const USER_KEY = 'default';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // Start loading to check auth
  error: null,
  deviceFlow: null,

  checkAuth: async () => {
    console.log('[AuthStore] Checking auth...');
    try {
      const token = await invoke<string | null>('get_token', { service: SERVICE, user: USER_KEY });
      console.log('[AuthStore] Token from keyring:', token ? 'Found' : 'Not Found');

      if (token && token.length > 0) {
        try {
          const user = await fetchUser(token);
          console.log('[AuthStore] Valid session for:', user.login);
          set({ token, user, isAuthenticated: true, loading: false });
        } catch (userError: any) {
          console.error('[AuthStore] Token validation failed:', userError);
          // Only delete if explicitly unauthorized (401), not on network error
          if (
            userError.message?.includes('401') ||
            userError.message?.includes('Bad credentials')
          ) {
            console.warn('[AuthStore] Invalid token, clearing...');
            await invoke('delete_token', { service: SERVICE, user: USER_KEY }).catch(() => {});
            set({ loading: false, isAuthenticated: false, token: null });
          } else {
            // Network error? Keep token but set error state or retry
            console.warn('[AuthStore] Validation error (network?), keeping token.');
            // For now, fail soft -> we have token but can't verify.
            // Maybe let them in? Or stay in loading?
            // Safe bet: Assume unauthed but don't delete token yet.
            set({ loading: false, isAuthenticated: false, error: 'Verbindung fehlgeschlagen' });
          }
        }
      } else {
        set({ loading: false, isAuthenticated: false });
      }
    } catch (e) {
      console.error('[AuthStore] Keyring access failed:', e);
      set({ loading: false, isAuthenticated: false });
    }
  },

  startLogin: async () => {
    console.log('[AuthStore] startLogin called');
    set({ loading: true, error: null, deviceFlow: null });

    try {
      console.log('[AuthStore] Calling initiateDeviceFlow...');
      const data = await initiateDeviceFlow();
      console.log('[AuthStore] Device flow data received:', data);
      set({ deviceFlow: data, loading: false });
    } catch (e: any) {
      console.error('[AuthStore] startLogin error:', e);
      const errorMessage = e.message || 'Unbekannter Fehler beim Login';
      set({ error: errorMessage, loading: false });
    }
  },

  cancelLogin: () => {
    set({ loading: false, error: null });
  },

  confirmLogin: async () => {
    const { deviceFlow } = get();
    if (!deviceFlow) return;

    set({ loading: true });
    // This is a simplified poll - in reality we should poll in a loop with interval
    try {
      // Implement polling loop
      // Safety: Fallback to 5s if interval is missing to prevent NaN infinite loop
      const safeInterval = deviceFlow.interval || 5;
      const intervalMs = (safeInterval + 1) * 1000;
      const maxAttempts = deviceFlow.expires_in / (safeInterval + 1);

      let attempts = 0;
      const pollLoop = async () => {
        if (attempts >= maxAttempts) {
          set({ error: 'Timeout', loading: false });
          return;
        }

        try {
          const result = await pollForToken(deviceFlow.device_code);

          if (result.error === 'authorization_pending') {
            attempts++;
            console.log(`[AuthStore] Polling pending... (${attempts}/${maxAttempts})`);
            setTimeout(pollLoop, intervalMs);
          } else if (result.access_token) {
            const token = result.access_token;
            await invoke('save_token', { service: SERVICE, user: USER_KEY, token });
            const user = await fetchUser(token);

            // Add to TokenPool (Database)
            // Note: For now we default is_primary to true if it's the first one,
            // but logic here just adds it.
            // We also need to get the user's login.
            await tokenPool
              .addAccount({
                username: user.login,
                access_token: token,
                avatar_url: user.avatar_url,
                is_primary: true, // simplified
              })
              .catch((err) => console.error('Failed to add to token pool DB:', err));

            set({
              token,
              user,
              isAuthenticated: true,
              loading: false,
              deviceFlow: null,
            });
          } else {
            set({ error: result.error_description || 'Unknown error', loading: false });
          }
        } catch (e) {
          // Ignore network errors during poll or handle them
          setTimeout(pollLoop, intervalMs);
        }
      };

      pollLoop();
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  logout: async () => {
    try {
      await invoke('delete_token', { service: SERVICE, user: USER_KEY });
    } catch (e) {
      console.error(e);
    }
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      deviceFlow: null,
      error: null,
    });
  },
}));
