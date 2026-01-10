/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat } from '../types/chat';
import { sessionManager } from '../services/sessionManager';
import { swarmService } from '../services/swarmService';
import { useSwarmStore } from './swarmStore';
import { chatService } from '../services/chatService';
import { tokenPool } from '../services/tokenPool';
import { fetchChatCompletion, fetchModels } from '../services/copilotApi';
import { useProjectStore } from './projectStore';

interface ChatState {
    chats: Chat[];
    activeChatId: string | null;
    messages: Record<string, Message[]>;
    isLoading: boolean;
    availableModels: Array<{ id: string; name: string; description?: string }>;
    fetchAvailableModels: () => Promise<void>;

    loadChats: () => Promise<void>;
    createChat: (model?: string) => Promise<string>;
    setActiveChat: (chatId: string) => void;
    sendMessage: (content: string) => Promise<void>;
    deleteChat: (chatId: string) => Promise<void>;
    renameChat: (chatId: string, newTitle: string) => Promise<void>;
    updateChatModel: (chatId: string, model: string) => Promise<void>;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    activeChatId: null,
    messages: {},
    isLoading: false,
    availableModels: [],

    fetchAvailableModels: async () => {
        try {
            const accounts = await tokenPool.getAccounts();
            if (accounts.length === 0) return;
            const token = accounts[0].accessToken;
            const models = await fetchModels(token);

            // Map API models to our UI format
            const uiModels = models.map((m: any) => ({
                id: m.id,
                name: m.name || m.id,
                description: m.capabilities?.type || 'GitHub Copilot Model'
            }));

            // Filter for known chat models to avoid junk if needed, or just show all
            // For now, let's trust the API but ensure we have our favorites
            set({ availableModels: uiModels });
        } catch (e) {
            console.error('Failed to fetch models:', e);
        }
    },

    loadChats: async () => {
        try {
            const chats = await chatService.getChats();
            set({ chats });
        } catch (e) {
            console.error('Failed to load chats', e);
        }
    },

    createChat: async (model: string = 'gpt-4o') => {
        const { activeChatId, messages, chats } = get();

        // 1. Reuse existing active chat if it's empty
        if (activeChatId && messages[activeChatId] && messages[activeChatId].length === 0) {
            return activeChatId;
        }

        // 2. Reuse ANY existing empty chat (most recent one)
        const emptyChat = chats.find((c) => {
            const isUntitled = c.title === 'Neuer Chat';
            const msgs = messages[c.id];
            // Assume empty if no messages loaded or length is 0
            return isUntitled && (!msgs || msgs.length === 0);
        });

        if (emptyChat) {
            set({ activeChatId: emptyChat.id });
            return emptyChat.id;
        }

        const newChat: Chat = {
            id: uuidv4(),
            title: 'Neuer Chat',
            model: model,
            updatedAt: new Date().toISOString(),
        };

        await chatService.createChat(newChat);

        set((state) => ({
            chats: [newChat, ...state.chats],
            activeChatId: newChat.id,
            messages: { ...state.messages, [newChat.id]: [] },
        }));
        return newChat.id;
    },

    setActiveChat: async (chatId) => {
        set({ activeChatId: chatId });
        const { messages } = get();
        if (!messages[chatId]) {
            // Load messages properly if not in memory
            try {
                const msgs = await chatService.getMessages(chatId);
                set((state) => ({ messages: { ...state.messages, [chatId]: msgs } }));
            } catch (e) {
                console.error(e);
            }
        }
    },

    sendMessage: async (content) => {
        const { activeChatId, messages, createChat } = get();

        let chatId = activeChatId;
        if (!chatId) {
            chatId = await createChat();
        }

        const currentChatId = chatId!;
        const currentChat = get().chats.find((c) => c.id === currentChatId);

        const userMsg: Message = {
            id: uuidv4(),
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
        };

        await chatService.addMessage(currentChatId, userMsg);

        const assistantMsgId = uuidv4();
        const assistantMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
        };

        // Optimistic update
        const currentMessages = messages[currentChatId] || [];
        const newMessages = [...currentMessages, userMsg, assistantMsg];

        set((state) => ({
            messages: { ...state.messages, [currentChatId]: newMessages },
            isLoading: true,
        }));

        // Auto-update title if it's the first message
        if (currentChat && currentChat.title === 'Neuer Chat' && currentMessages.length === 0) {
            // Background async title generation
            (async () => {
                try {
                    // Get a token (just grab first available for this background task)
                    const accounts = await tokenPool.getAccounts();
                    if (accounts.length > 0) {
                        const token = accounts[0].accessToken;
                        const titlePrompt = `Generate a very short, concise title (max 4-5 words) for a chat conversation that starts with this message:
"${content.slice(0, 500)}"
Respond ONLY with the title text. Do not use quotes or markdown.`;

                        const newTitle = await fetchChatCompletion(token, {
                            messages: [{ role: 'user', content: titlePrompt }],
                            model: 'gpt-4o-mini',
                            temperature: 0.7
                        });

                        if (newTitle && newTitle.trim()) {
                            const finalTitle = newTitle.trim().replace(/^["']|["']$/g, ''); // Remove quotes if any
                            await chatService.updateChat({ ...currentChat, title: finalTitle });
                            set((state) => ({
                                chats: state.chats.map((c) => (c.id === currentChatId ? { ...c, title: finalTitle } : c)),
                            }));
                        }
                    }
                } catch (e) {
                    console.warn('Failed to auto-generate title:', e);
                }
            })();

            // Local fallback immediate update (optional, but maybe better to keep "Neuer Chat" until AI loads?)
            // Let's stick with AI only, users prefer "New Chat" over "Hello..." usually
        }

        try {
            await chatService.addMessage(currentChatId, assistantMsg); // Add empty assistant message to DB

            // Project Context Injection
            let historyForApi = newMessages.slice(0, -1);

            if (currentChat?.projectId) {
                const projectChats = get().chats.filter(c => c.projectId === currentChat.projectId && c.id !== currentChatId);
                let contextText = "";

                for (const pChat of projectChats) {
                    try {
                        const pMsgs = await chatService.getMessages(pChat.id);
                        if (pMsgs.length > 0) {
                            // Take last 4 messages (approx 2 turns) to keep context relevant but concise
                            const recent = pMsgs.slice(-4);
                            contextText += `\n--- Context from chat "${pChat.title}" ---\n`;
                            contextText += recent.map(m => `${m.role.toUpperCase()}: ${m.content.slice(0, 1000)}`).join('\n');
                        }
                    } catch (e) {
                        console.warn("Failed to load project context chat", e);
                    }
                }

                if (contextText) {
                     const projectContextMsg: Message = {
                        id: `system-context-${uuidv4()}`,
                        role: 'system',
                        content: `You are helping the user in the project "${useProjectStore.getState().projects.find(p => p.id === currentChat.projectId)?.name}".\nHere is context from other chats in this project:\n${contextText}\n\nUse this context to inform your answers if relevant.`,
                        createdAt: new Date().toISOString()
                    };
                    // Prepend to history
                    historyForApi = [projectContextMsg, ...historyForApi];
                }
            }

            let fullResponse = '';

            if (useSwarmStore.getState().isSwarmEnabled && useSwarmStore.getState().activeConfigId) {
                const configId = useSwarmStore.getState().activeConfigId!;
                const workerBuffers = new Map<string, string>();

                useSwarmStore.getState().startExecution(configId, content);

                fullResponse = await swarmService.runSwarm(
                    configId,
                    currentChatId,
                    historyForApi,
                    (workerId, chunk) => {
                        const prev = workerBuffers.get(workerId) || '';
                        workerBuffers.set(workerId, prev + chunk);

                        useSwarmStore.getState().updateWorkerResponse(workerId, chunk);

                        const liveText = Array.from(workerBuffers.entries())
                            .map(([wId, content]) => `### Worker ${wId.slice(0, 4)}\n${content}`)
                            .join('\n\n---\n\n');

                        set((state) => {
                            const chatMsgs = state.messages[currentChatId] || [];
                            const updatedMsgs = chatMsgs.map((m) =>
                                m.id === assistantMsgId ? { ...m, content: liveText } : m
                            );
                            return { messages: { ...state.messages, [currentChatId]: updatedMsgs } };
                        });
                    }
                );

                useSwarmStore.getState().completeExecution(fullResponse);
            } else {
                await sessionManager.sendMessage(
                    currentChatId,
                    currentChat?.model || 'gpt-4o',
                    historyForApi,
                    (chunk: string) => {
                        fullResponse += chunk;
                        set((state) => {
                            const chatMsgs = state.messages[currentChatId] || [];
                            const updatedMsgs = chatMsgs.map((m) =>
                                m.id === assistantMsgId ? { ...m, content: fullResponse } : m
                            );
                            return { messages: { ...state.messages, [currentChatId]: updatedMsgs } };
                        });
                    }
                );
            }

            // Save final response to DB
            await chatService.updateMessageContent(assistantMsgId, fullResponse);
        } catch (e: any) {
            set((state) => {
                const chatMsgs = state.messages[currentChatId] || [];
                const updatedMsgs = chatMsgs.map((m) =>
                    m.id === assistantMsgId
                        ? { ...m, content: m.content + '\n[Error: ' + e.message + ']' }
                        : m
                );
                return { messages: { ...state.messages, [currentChatId]: updatedMsgs } };
            });
        } finally {
            set({ isLoading: false });
        }
    },

    clearChat: () => {
        // Clear current chat messages logic
        set((state) => {
            if (!state.activeChatId) return {};
            return { messages: { ...state.messages, [state.activeChatId]: [] } };
        });
    },

    deleteChat: async (chatId: string) => {
        try {
            await chatService.deleteChat(chatId);
            set((state) => {
                const newChats = state.chats.filter((c) => c.id !== chatId);
                const newActiveId =
                    state.activeChatId === chatId
                        ? newChats.length > 0
                            ? newChats[0].id
                            : null
                        : state.activeChatId;
                return {
                    chats: newChats,
                    activeChatId: newActiveId,
                };
            });
        } catch (e) {
            console.error('Failed to delete chat', e);
        }
    },

    renameChat: async (chatId: string, newTitle: string) => {
        const chat = get().chats.find((c) => c.id === chatId);
        if (!chat) return;

        const updatedChat = { ...chat, title: newTitle };
        try {
            await chatService.updateChat(updatedChat);
            set((state) => ({
                chats: state.chats.map((c) => (c.id === chatId ? updatedChat : c)),
            }));
        } catch (e) {
            console.error('Failed to rename chat', e);
        }
    },

    updateChatModel: async (chatId: string, model: string) => {
        // Find chat
        const chat = get().chats.find((c) => c.id === chatId);
        if (!chat) return;

        const updatedChat = { ...chat, model };
        try {
            await chatService.updateChat(updatedChat);
            set((state) => ({
                chats: state.chats.map((c) => (c.id === chatId ? updatedChat : c)),
            }));
        } catch (e) {
            console.error('Failed to update chat model', e);
        }
    },
}));
