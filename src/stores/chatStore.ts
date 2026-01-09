/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat } from '../types/chat';
import { sessionManager } from '../services/sessionManager';
import { swarmService } from '../services/swarmService';
import { useSwarmStore } from './swarmStore';
import { chatService } from '../services/chatService';

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  isLoading: boolean;

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

  loadChats: async () => {
    try {
      const chats = await chatService.getChats();
      set({ chats });
    } catch (e) {
      console.error('Failed to load chats', e);
    }
  },

  createChat: async (model: string = 'gpt-4o') => {
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
      const newTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');
      await chatService.updateChat({ ...currentChat, title: newTitle });
      set((state) => ({
        chats: state.chats.map((c) => (c.id === currentChatId ? { ...c, title: newTitle } : c)),
      }));
    }

    try {
      await chatService.addMessage(currentChatId, assistantMsg); // Add empty assistant message to DB

      // Use SessionManager for Multi-Session/Token Pool support
      const historyForApi = newMessages.slice(0, -1);

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
          (chunk) => {
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
