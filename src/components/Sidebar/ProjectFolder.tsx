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

export const ProjectFolder = ({
  project,
  chats,
  activeChatId,
  onChatClick,
}: ProjectFolderProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const { deleteProject, moveChat } = useProjectStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Prevent flickering when dragging over child elements
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const chatId = e.dataTransfer.getData('chatId');
    if (chatId) {
      await moveChat(chatId, project.id);
    }
  };

  return (
    <div 
      className={`mb-2 rounded-lg transition-colors ${isDragOver ? 'bg-accent/10 border-accent border-dashed border' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="group flex cursor-pointer select-none items-center px-2 py-1 text-sm text-text-secondary hover:text-text-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="mr-1 h-3 w-3" />
        ) : (
          <ChevronRight className="mr-1 h-3 w-3" />
        )}
        <Folder className="mr-2 h-4 w-4" />
        <span className="flex-1 truncate font-medium">{project.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteProject(project.id);
          }}
          className="p-1 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
          title="Projekt löschen"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {isOpen && (
        <div className="ml-2 mt-1 space-y-1 border-l border-border pl-2">
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              onClick={() => onChatClick(chat.id)}
            />
          ))}
          {chats.length === 0 && (
            <div className="py-1 pl-2 text-xs italic text-text-secondary">Leer</div>
          )}
        </div>
      )}
    </div>
  );
};
