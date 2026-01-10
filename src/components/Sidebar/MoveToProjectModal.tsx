import { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Modal } from '../UI/Modal';
import { Folder } from 'lucide-react';

interface MoveToProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
}

export const MoveToProjectModal = ({ isOpen, onClose, chatId }: MoveToProjectModalProps) => {
    const { projects, moveChat } = useProjectStore();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedProjectId(null); // Reset selection
        }
    }, [isOpen]);

    const handleMove = async () => {
        if (selectedProjectId) {
            await moveChat(chatId, selectedProjectId);
            onClose();
        } else {
            // Move to "No Project" (root) - currently not fully supported by moveChat logic if strictly project based, 
            // but let's assume projectId='' or logic handles it. 
            // Actually, based on logic, let's assume we only move TO projects for now.
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="In Projekt verschieben">
            <div className="space-y-4">
                {projects.length === 0 ? (
                    <p className="text-sm text-text-secondary">Keine Projekte vorhanden.</p>
                ) : (
                    <div className="max-h-60 overflow-y-auto rounded-md border border-border bg-bg-primary">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(project.id)}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-bg-secondary ${selectedProjectId === project.id
                                        ? 'bg-accent/10 text-accent'
                                        : 'text-text-primary'
                                    }`}
                            >
                                <Folder className="h-4 w-4" />
                                <span className="font-medium">{project.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={handleMove}
                        disabled={!selectedProjectId}
                        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Verschieben
                    </button>
                </div>
            </div>
        </Modal>
    );
};
