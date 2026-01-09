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
            case 'streaming': return <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Streaming" />;
            case 'pending': return <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Pending" />;
            case 'error': return <span className="w-2 h-2 rounded-full bg-red-500" title="Error" />;
            case 'idle': default: return <span className="w-2 h-2 rounded-full bg-gray-500 opacity-0 group-hover:opacity-50 transition-opacity" />;
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
                    className="w-full bg-bg-primary border border-accent rounded px-2 py-1 text-sm outline-none"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    onClick={e => e.stopPropagation()}
                />
            </form>
        );
    }

    return (
        <div className="group relative" onDoubleClick={() => setIsEditing(true)}>
            <button
                onClick={onClick}
                className={`w-full text-left px-2 py-2 text-sm rounded-md truncate flex items-center gap-2 block mb-1
                ${isActive ? 'bg-bg-secondary text-text-primary font-medium' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}
                `}
                title={chat.title}
            >
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <span className="truncate flex-1">{chat.title}</span>
                {getStatusIndicator()}
            </button>
            <button
                onClick={handleDelete}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Löschen"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );
};
