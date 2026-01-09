import { create } from 'zustand';
import { Project, projectService } from '../services/projectService';
import { useChatStore } from './chatStore';

interface ProjectState {
  projects: Project[];
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  moveChat: (chatId: string, projectId: string | null) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],

  loadProjects: async () => {
    const projects = await projectService.getProjects();
    set({ projects });
  },

  createProject: async (name: string) => {
    const id = await projectService.createProject(name);
    await get().loadProjects();
    return id;
  },

  deleteProject: async (id: string) => {
    await projectService.deleteProject(id);
    await get().loadProjects();
    // Reload chats to update their structure if we were grouping
    useChatStore.getState().loadChats();
  },

  moveChat: async (chatId: string, projectId: string | null) => {
    await projectService.moveChatToProject(chatId, projectId);
    useChatStore.getState().loadChats();
  },
}));
