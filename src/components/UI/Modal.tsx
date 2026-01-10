import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md scale-100 overflow-hidden rounded-lg border border-border bg-bg-primary shadow-xl animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between border-b border-border p-4">
                    <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded p-1 text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 text-text-secondary">
                    {children}
                </div>

                {footer && (
                    <div className="flex justify-end gap-3 border-t border-border bg-bg-secondary/30 p-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
