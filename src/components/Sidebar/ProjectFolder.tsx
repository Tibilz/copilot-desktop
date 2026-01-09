import { useState } from 'react';
import { Project } from '../../services/projectService';
import { Chat } from '../../types/chat';
import { ChevronRight, ChevronDown, Folder, Trash2 } from 'lucide-react';
import { ChatItem } from './ChatItem';
import { useProjectStore } from '../../stores/projectStore';

interface ProjectFolderProps {
    project: Project;
    chats: Chat[];
    activeChatId: string | null;
    onChatClick: (id: string) => void;
}

export const ProjectFolder = ({ project, chats, activeChatId, onChatClick }: ProjectFolderProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const { deleteProject } = useProjectStore();

    return (
        <div className="mb-2">
            <div
                className="flex items-center group px-2 py-1 text-sm text-text-secondary hover:text-text-primary cursor-pointer select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                <Folder className="w-4 h-4 mr-2" />
                <span className="flex-1 truncate font-medium">{project.name}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                    title="Projekt löschen"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            {isOpen && (
                <div className="pl-2 mt-1 border-l border-border ml-2 space-y-1">
                    {chats.map(chat => (
                        <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={activeChatId === chat.id}
                            onClick={() => onChatClick(chat.id)}
                        />
                    ))}
                    {chats.length === 0 && (
                        <div className="text-xs text-text-secondary pl-2 py-1 italic">Leer</div>
                    )}
                </div>
            )}
        </div>
    );
};
