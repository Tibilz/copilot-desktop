// src/stores/authStore.ts
import { create } from 'zustand';
import { initiateDeviceFlow, pollForToken, fetchUser, DeviceCodeResponse, GitHubUser } from '../services/githubAuth';
import { invoke } from '@tauri-apps/api/core';
import { tokenPool } from '../services/tokenPool';

interface AuthState {
    isAuthenticated: boolean;
    user: GitHubUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    deviceFlow: DeviceCodeResponse | null;
    isPolling: boolean;

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
    isPolling: false,

    checkAuth: async () => {
        console.log('[AuthStore] Checking auth...');
        try {
            // Priority 1: Check Keyring (most secure)
            let token = await invoke<string | null>('get_token', { service: SERVICE, user: USER_KEY });
            console.log('[AuthStore] Token from keyring:', token ? 'Found' : 'Not Found');

            // Priority 2: Check TokenPool (SQLite Persistence for dev/backup)
            if ((!token || token.length === 0)) {
                console.log('[AuthStore] Checking TokenPool fallback...');
                try {
                    const accounts = await tokenPool.getAccounts();
                    const primary = accounts.find(a => a.isPrimary) || accounts[0];
                    if (primary) {
                        console.log('[AuthStore] Restoring token from TokenPool for:', primary.username);
                        token = primary.accessToken;
                        // Sync back to Keyring for consistency
                        await invoke('save_token', { service: SERVICE, user: USER_KEY, token }).catch(console.error);
                    }
                } catch (dbErr) {
                    console.error('[AuthStore] TokenPool check failed:', dbErr);
                }
            }

            if (token && token.length > 0) {
                // Optimistically set token
                set({ token });

                try {
                    const user = await fetchUser(token);
                    console.log('[AuthStore] Valid session for:', user.login);
                    set({ token, user, isAuthenticated: true, loading: false });
                } catch (userError: any) {
                    console.error('[AuthStore] Token validation failed:', userError);
                    // Only delete if explicitly unauthorized (401)
                    if (userError.message?.includes('401') || userError.message?.includes('Bad credentials')) {
                        console.warn('[AuthStore] Invalid token, clearing...');
                        await invoke('delete_token', { service: SERVICE, user: USER_KEY }).catch(() => { });
                        // Also clean from DB if possible? We don't have ID here easily without querying.
                        // Ideally we should remove invalid tokens from Pool too.
                        set({ loading: false, isAuthenticated: false, token: null });
                    } else {
                        // Network error? Keep token (Offline Mode)
                        console.warn('[AuthStore] Validation error (network?), keeping token.');
                        set({
                            loading: false,
                            isAuthenticated: true,
                            user: { login: 'Offline', name: 'Offline', avatar_url: '' },
                            error: 'Verbindung fehlgeschlagen (Offline Modus)'
                        });
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
        set({ loading: true, error: null, deviceFlow: null, isPolling: false });

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
        set({ loading: false, error: null, deviceFlow: null, isPolling: false });
    },

    confirmLogin: async () => {
        const { deviceFlow, isPolling } = get();
        if (!deviceFlow || isPolling) return;

        set({ isPolling: true });

        // This is a simplified poll - in reality we should poll in a loop with interval
        try {
            // Implement polling loop
            // Safety: Fallback to 5s if interval is missing
            let currentInterval = (deviceFlow.interval || 5) + 1; // Seconds
            const maxAttempts = deviceFlow.expires_in / currentInterval;

            let attempts = 0;
            const pollLoop = async () => {
                // Check if cancelled (e.g. by cancelLogin or successful login)
                const currentState = get();
                if (!currentState.deviceFlow || !currentState.isPolling) {
                    console.log('[AuthStore] Polling stopped (cancelled or finished)');
                    return;
                }

                if (attempts >= maxAttempts) {
                    set({ error: 'Timeout: Login nicht abgeschlossen', loading: false, isPolling: false });
                    return;
                }

                try {
                    const result = await pollForToken(deviceFlow.device_code);
                    console.log('[AuthStore] Poll result:', result.error ? `Error: ${result.error}` : 'Success (Token received)');

                    if (result.error === 'authorization_pending') {
                        attempts++;
                        console.log(`[AuthStore] Polling pending... (${attempts}/${maxAttempts})`);
                        setTimeout(pollLoop, currentInterval * 1000);
                    } else if (result.error === 'slow_down') {
                        // GitHub requests us to slow down
                        console.warn('[AuthStore] Received slow_down, increasing interval');
                        currentInterval += 5;
                        setTimeout(pollLoop, currentInterval * 1000);
                    } else if (result.access_token) {
                        try {
                            const token = result.access_token;
                            await invoke('save_token', { service: SERVICE, user: USER_KEY, token });

                            let user: GitHubUser;
                            try {
                                user = await fetchUser(token);
                            } catch (err: any) {
                                console.error('[AuthStore] Failed to fetch user profile:', err);
                                // Fallback user if fetch fails, but we have token
                                user = { login: 'Unknown User', name: 'Unknown', avatar_url: '' };
                            }

                            // Add to TokenPool (Database)
                            await tokenPool.addAccount({
                                username: user.login,
                                access_token: token,
                                avatar_url: user.avatar_url,
                                is_primary: true
                            }).catch(err => console.error("Failed to add to token pool DB:", err));

                            set({
                                token,
                                user,
                                isAuthenticated: true,
                                loading: false,
                                deviceFlow: null,
                                error: null,
                                isPolling: false
                            });
                        } catch (innerError: any) {
                            console.error('[AuthStore] Post-token setup failed:', innerError);
                            set({
                                error: `Login Setup fehlgeschlagen: ${innerError.message}`,
                                loading: false,
                                deviceFlow: null,
                                isPolling: false
                            });
                        }
                    } else {
                        // Other errors (e.g. expired_token, access_denied)
                        set({
                            error: result.error_description || result.error || 'Unknown error during polling',
                            loading: false,
                            deviceFlow: null,
                            isPolling: false
                        });
                    }
                } catch (e: any) {
                    console.error('[AuthStore] Polling network/unexpected error:', e);
                    // Ignore network errors during poll or handle them
                    setTimeout(pollLoop, currentInterval * 1000);
                }
            };

            pollLoop();

        } catch (e: any) {
            set({ error: e.message, loading: false, isPolling: false });
        }
    },

    logout: async () => {
        const { user, token } = get();
        console.log('[AuthStore] Logging out...');

        // 1. Keyring Cleanup
        try {
            await invoke('delete_token', { service: SERVICE, user: USER_KEY });
            console.log('[AuthStore] Keyring cleared');
        } catch (e) {
            console.warn('[AuthStore] Keyring delete warning (ignoring):', e);
        }

        // 2. DB Cleanup (Robustness)
        try {
            const accounts = await tokenPool.getAccounts();
            let targetAccount = null;

            if (user?.login) {
                targetAccount = accounts.find(a => a.username === user.login);
            } else if (token) {
                targetAccount = accounts.find(a => a.accessToken === token);
            }

            if (targetAccount) {
                await tokenPool.removeAccount(targetAccount.id);
                console.log('[AuthStore] Removed account from DB:', targetAccount.username);
            }
        } catch (e) {
            console.error('[AuthStore] DB cleanup failed:', e);
        }

        // 3. Reset State
        set({
            isAuthenticated: false,
            user: null,
            token: null,
            deviceFlow: null,
            error: null,
            isPolling: false
        });
    },
}));
