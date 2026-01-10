/* eslint-disable @typescript-eslint/no-explicit-any */
import { tokenPool } from './tokenPool';
import { streamChatCompletion } from './copilotApi';
import { Message } from '../types/chat';

export type ChatState = 'idle' | 'typing' | 'pending' | 'streaming' | 'error';

type StateListener = (chatId: string, state: ChatState) => void;

export class SessionManager {
    // private activeStreams: Map<string, AbortController> = new Map();
    private chatStates: Map<string, ChatState> = new Map();
    private listeners: Set<StateListener> = new Set();

    // Minimal queue placeholder
    // private queue: Array<{ chatId: string, task: () => Promise<void> }> = [];

    constructor() {
        // In a real app we might process queue here or on releaseToken event
    }

    subscribe(listener: StateListener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private setState(chatId: string, state: ChatState) {
        this.chatStates.set(chatId, state);
        this.listeners.forEach((l) => l(chatId, state));
    }

    getState(chatId: string): ChatState {
        return this.chatStates.get(chatId) || 'idle';
    }

    async sendMessage(
        chatId: string,
        model: string,
        history: Message[],
        onDelta: (chunk: string) => void
    ): Promise<string> {
        this.setState(chatId, 'pending');

        try {
            // 1. Acquire Token
            const tokenObj = await tokenPool.acquireToken(chatId);
            const token = tokenObj.accessToken;

            this.setState(chatId, 'streaming');

            // 2. Prepare Request
            const apiMessages = history.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const isO1 = model.startsWith('o1');
            const request = {
                model,
                messages: apiMessages,
                stream: true,
                ...(isO1 ? {} : { temperature: 0.1 }),
            };

            let fullResponse = '';

            // 3. Execute Stream
            await streamChatCompletion(token, request, (chunk) => {
                fullResponse += chunk;
                onDelta(chunk);
            });

            this.setState(chatId, 'idle');
            return fullResponse;
        } catch (error: any) {
            console.error(`SessionManager Error for Chat ${chatId}:`, error);
            this.setState(chatId, 'error');
            throw error;
        } finally {
            // 4. Release Token
            await tokenPool.releaseToken(chatId);
        }
    }
}

export const sessionManager = new SessionManager();
