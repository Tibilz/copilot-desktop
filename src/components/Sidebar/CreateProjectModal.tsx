import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Modal } from '../UI/Modal';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
    const [name, setName] = useState('');
    const { createProject } = useProjectStore();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            await createProject(name.trim());
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Neues Projekt erstellen">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">
                        Projektname
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="z.B. Backend API"
                        className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        maxLength={50}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Erstellen
                    </button>
                </div>
            </form>
        </Modal>
    );
};
