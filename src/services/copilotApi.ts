// src/services/copilotApi.ts
import { fetch } from '@tauri-apps/plugin-http';

const BASE_URL = 'https://api.githubcopilot.com';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatRequest {
    model: string;
    messages: ChatMessage[];
    stream: boolean;
    temperature?: number;
}

// Token Cache: Map<OAuthToken, { token: CopilotToken, expiresAt: number }>
const tokenCache = new Map<string, { token: string, expiresAt: number }>();

export const getCopilotToken = async (oauthToken: string): Promise<string> => {
    // Check cache
    const cached = tokenCache.get(oauthToken);
    if (cached && cached.expiresAt > Date.now() + 60000) { // Buffer 1 min
        return cached.token;
    }

    try {
        const response = await fetch('https://api.github.com/copilot_internal/v2/token', {
            method: 'GET',
            headers: {
                'Authorization': `token ${oauthToken}`,
                'Accept': 'application/json',
                'User-Agent': 'GitHubCopilotChat/0.11.1'
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Failed to get Copilot token:', response.status, text);
            throw new Error(`Failed to get Copilot token: ${response.statusText}`);
        }

        const data = await response.json(); // { token: "tid=...", expires_at: 123... }

        // Cache it
        tokenCache.set(oauthToken, {
            token: data.token,
            expiresAt: data.expires_at * 1000
        });

        return data.token;
    } catch (e) {
        console.error('Error fetching Copilot token:', e);
        throw e;
    }
};

export const streamChatCompletion = async (
    oauthToken: string,
    request: ChatRequest,
    onChunk: (chunk: string) => void
) => {
    // 1. Exchange OAuth Token for Copilot Token
    const copilotToken = await getCopilotToken(oauthToken);

    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${copilotToken}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Editor-Version': 'vscode/1.85.1',
            'Editor-Plugin-Version': 'copilot-chat/0.11.1',
            'User-Agent': 'GitHubCopilotChat/0.11.1',
            'Copilot-Integration-Id': 'vscode-chat'
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Copilot API Error: ${response.statusText} ${text}`);
    }

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data.trim() === '[DONE]') continue;

                try {
                    const json = JSON.parse(data);
                    const delta = json.choices[0]?.delta?.content;
                    if (delta) {
                        onChunk(delta);
                    }
                } catch (e) {
                    // ignore partial json
                }
            }
        }
    }
};
