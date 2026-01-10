import React, { useState } from 'react';
import { MessageSquare, Pencil, Trash2, FolderInput } from 'lucide-react';
import { Chat } from '../../types/chat';
import { useChatState } from '../../hooks/useChatState';
import { useChatStore } from '../../stores/chatStore';
import { ContextMenu } from '../UI/ContextMenu';
import { Modal } from '../UI/Modal';
import { MoveToProjectModal } from './MoveToProjectModal';

interface ChatItemProps {
    chat: Chat;
    isActive: boolean;
    onClick: () => void;
}

export const ChatItem = ({ chat, isActive, onClick }: ChatItemProps) => {
    const status = useChatState(chat.id);
    const { deleteChat, renameChat } = useChatStore();

    // States
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(chat.title);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);

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
                return null;
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleConfirmDelete = () => {
        deleteChat(chat.id);
        setShowDeleteModal(false);
    };

    const handleRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (editTitle.trim()) {
            renameChat(chat.id, editTitle.trim());
        } else {
            setEditTitle(chat.title); // Reset if empty
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="px-2 py-1">
                <form onSubmit={handleRename}>
                    <input
                        autoFocus
                        className="w-full rounded border border-accent bg-bg-primary px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-accent"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setEditTitle(chat.title);
                                setIsEditing(false);
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </form>
            </div>
        );
    }

    return (
        <>
            <div
                className="group relative"
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('chatId', chat.id);
                    e.dataTransfer.effectAllowed = 'move';
                }}
                onDoubleClick={() => setIsEditing(true)}
                onContextMenu={handleContextMenu}
            >
                <button
                    onClick={onClick}
                    className={`mb-1 flex w-full items-center gap-3 truncate rounded-md px-3 py-2.5 text-left text-sm transition-all duration-200 border-l-2
                    ${isActive
                            ? 'bg-bg-secondary border-accent font-medium text-text-primary shadow-sm'
                            : 'border-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                        }
                    `}
                    title={chat.title}
                >
                    <MessageSquare className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-accent' : 'opacity-70'}`} />
                    <span className="flex-1 truncate">{chat.title}</span>
                    {getStatusIndicator()}
                </button>

                {/* Always visible delete button on hover, kept for accessibility/ease */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(true);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    title="Löschen"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    items={[
                        {
                            label: 'Umbenennen',
                            icon: <Pencil />,
                            onClick: () => setIsEditing(true)
                        },
                        {
                            label: 'Zu Projekt verschieben',
                            icon: <FolderInput />,
                            onClick: () => setShowMoveModal(true)
                        },
                        {
                            label: 'Löschen',
                            icon: <Trash2 />,
                            onClick: () => setShowDeleteModal(true),
                            danger: true
                        }
                    ]}
                />
            )}

            <MoveToProjectModal
                isOpen={showMoveModal}
                onClose={() => setShowMoveModal(false)}
                chatId={chat.id}
            />

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Chat löschen"
                footer={
                    <>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="rounded px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary"
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                        >
                            Löschen
                        </button>
                    </>
                }
            >
                <p>Möchtest du den Chat "{chat.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </Modal>
        </>
    );
};
