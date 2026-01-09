/* eslint-disable @typescript-eslint/no-explicit-any */
import { initDb } from './database';
import { Chat, Message } from '../types/chat';

export const chatService = {
    async getChats(): Promise<Chat[]> {
        const db = await initDb();
        const rows = await db.select<any[]>('SELECT * FROM chats ORDER BY updated_at DESC');
        return rows.map((row) => ({
            id: row.id,
            title: row.title,
            model: row.model,
            updatedAt: row.updated_at,
            projectId: row.project_id,
        }));
    },

    async getMessages(chatId: string): Promise<Message[]> {
        const db = await initDb();
        return await db.select<Message[]>(
            'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
            [chatId]
        );
    },

    async createChat(chat: Chat): Promise<void> {
        const db = await initDb();
        await db.execute('INSERT INTO chats (id, title, model) VALUES (?, ?, ?)', [
            chat.id,
            chat.title,
            chat.model,
        ]);
    },

    async updateChat(chat: Chat): Promise<void> {
        const db = await initDb();
        await db.execute(
            'UPDATE chats SET title = ?, model = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [chat.title, chat.model, chat.id]
        );
    },

    async addMessage(chatId: string, message: Message): Promise<void> {
        const db = await initDb();
        await db.execute(
            'INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)',
            [message.id, chatId, message.role, message.content, message.createdAt]
        );
        // Update chat timestamp
        await db.execute('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [chatId]);
    },

    async updateMessageContent(messageId: string, content: string): Promise<void> {
        const db = await initDb();
        await db.execute('UPDATE messages SET content = ? WHERE id = ?', [content, messageId]);
    },

    async deleteChat(chatId: string): Promise<void> {
        const db = await initDb();
        await db.execute('DELETE FROM chats WHERE id = ?', [chatId]);
    },
};
