/* eslint-disable @typescript-eslint/no-explicit-any */
import { initDb } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    sortOrder: number;
}

export const projectService = {
    async getProjects(): Promise<Project[]> {
        const db = await initDb();
        const rows = await db.select<any[]>(
            'SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC'
        );
        return rows.map((r) => ({
            id: r.id,
            name: r.name,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            sortOrder: r.sort_order,
        }));
    },

    async createProject(name: string): Promise<string> {
        const db = await initDb();
        const id = uuidv4();
        await db.execute('INSERT INTO projects (id, name) VALUES (?, ?)', [id, name]);
        return id;
    },

    async deleteProject(id: string): Promise<void> {
        const db = await initDb();
        // Set chats project_id to NULL
        await db.execute('UPDATE chats SET project_id = NULL WHERE project_id = ?', [id]);
        await db.execute('DELETE FROM projects WHERE id = ?', [id]);
    },

    async moveChatToProject(chatId: string, projectId: string | null): Promise<void> {
        const db = await initDb();
        await db.execute('UPDATE chats SET project_id = ? WHERE id = ?', [projectId, chatId]);
    },
};
