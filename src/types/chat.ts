export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
  projectId?: string | null;
}
