import React, { useState } from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
// import { Edit2 } from 'lucide-react'; // Unused?
import { Chat } from '../../types/chat';
import { useChatState } from '../../hooks/useChatState';
import { useChatStore } from '../../stores/chatStore';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ChatItem = ({ chat, isActive, onClick }: ChatItemProps) => {
  const status = useChatState(chat.id);
  const { deleteChat, renameChat } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);

  const getStatusIndicator = () => {
    switch (status) {
      case 'streaming':
        return (
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" title="Streaming" />
        );
      case 'pending':
        return (
          <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" title="Pending" />
        );
      case 'error':
        return <span className="h-2 w-2 rounded-full bg-red-500" title="Error" />;
      case 'idle':
      default:
        return (
          <span className="h-2 w-2 rounded-full bg-gray-500 opacity-0 transition-opacity group-hover:opacity-50" />
        );
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Chat wirklich löschen?')) {
      deleteChat(chat.id);
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    renameChat(chat.id, editTitle);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleRename} className="px-2 py-1">
        <input
          autoFocus
          className="w-full rounded border border-accent bg-bg-primary px-2 py-1 text-sm outline-none"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onClick={(e) => e.stopPropagation()}
        />
      </form>
    );
  }

  return (
    <div className="group relative" onDoubleClick={() => setIsEditing(true)}>
      <button
        onClick={onClick}
        className={`mb-1 block flex w-full items-center gap-2 truncate rounded-md px-2 py-2 text-left text-sm
                ${isActive ? 'bg-bg-secondary font-medium text-text-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}
                `}
        title={chat.title}
      >
        <MessageSquare className="h-3 w-3 flex-shrink-0" />
        <span className="flex-1 truncate">{chat.title}</span>
        {getStatusIndicator()}
      </button>
      <button
        onClick={handleDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
        title="Löschen"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};
