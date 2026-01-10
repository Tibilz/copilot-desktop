// src/services/githubAuth.ts
import { fetch } from '@tauri-apps/plugin-http';

const CLIENT_ID = 'Iv1.b507a08c87ecfe98'; // VS Code Copilot Client ID
const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
// const USER_URL = 'https://api.github.com/user';

export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
    interval: number;
}

export interface TokenResponse {
    access_token?: string;
    error?: string;
    error_description?: string;
    token_type?: string;
    scope?: string;
}

export interface GitHubUser {
    login: string;
    avatar_url: string;
    name: string;
}

export const initiateDeviceFlow = async (): Promise<DeviceCodeResponse> => {
    console.log('[GitHubAuth] Starting device flow...');
    console.log('[GitHubAuth] URL:', DEVICE_CODE_URL);
    console.log('[GitHubAuth] Client ID:', CLIENT_ID);

    try {
        const response = await fetch(DEVICE_CODE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'copilot-desktop/0.1.0'
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                scope: 'read:user copilot',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[GitHubAuth] Error response:', errorText);
            throw new Error(`GitHub API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('[GitHubAuth] Device flow initiated:', data);
        return data;
    } catch (error: any) {
        console.error('[GitHubAuth] Fetch failed:', error);
        throw new Error(`Login fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
    }
};

/*
export const initiateDeviceFlow = async (): Promise<DeviceCodeResponse> => {
    console.log('[GitHubAuth] Starting device flow...');
    console.log('[GitHubAuth] URL:', DEVICE_CODE_URL);
    console.log('[GitHubAuth] Client ID:', CLIENT_ID);

    try {
        // Add timeout (10s)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(DEVICE_CODE_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'copilot-desktop/0.1.0'
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                scope: 'read:user copilot', // Basic scopes
            }),
        });

        clearTimeout(timeoutId);

        console.log('[GitHubAuth] Response status:', response.status);
        console.log('[GitHubAuth] Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[GitHubAuth] Error response:', errorText);
            throw new Error(`GitHub API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('[GitHubAuth] Device flow initiated:', data);
        return data;
    } catch (error: any) {
        console.error('[GitHubAuth] Fetch failed:', error);
        console.error('[GitHubAuth] Error name:', error.name);
        console.error('[GitHubAuth] Error message:', error.message);

        // Spezifischer Hinweis für Tauri HTTP Permission Fehler
        if (error.message?.includes('Invalid URL') || error.message?.includes('not allowed')) {
            throw new Error('HTTP Permission Fehler: Tauri blockiert externe Requests. Prüfe capabilities/default.json!');
        }

        throw new Error(`Login fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`);
    }
};
*/

export const pollForToken = async (deviceCode: string): Promise<TokenResponse> => {
    console.log('[GitHubAuth] Polling for token...');

    try {
        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'copilot-desktop/0.1.0'
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                device_code: deviceCode,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[GitHubAuth] Poll error:', errorText);
            throw new Error(`Poll Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('[GitHubAuth] Poll fetch failed:', error);
        throw error;
    }
};

export const fetchUser = async (token: string): Promise<GitHubUser> => {
    console.log('[GitHubAuth] Fetching user info...');

    const response = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'User-Agent': 'copilot-desktop'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user (${response.status})`);
    }

    const user = await response.json();
    console.log('[GitHubAuth] User:', user.login);
    return user;
};

