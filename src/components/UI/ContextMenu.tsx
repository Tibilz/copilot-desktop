import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        // Adjust position if it goes off-screen
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let finalX = x;
            let finalY = y;

            if (x + rect.width > viewportWidth) {
                finalX = x - rect.width;
            }
            if (y + rect.height > viewportHeight) {
                finalY = y - rect.height;
            }

            menuRef.current.style.left = `${finalX}px`;
            menuRef.current.style.top = `${finalY}px`;
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, x, y]);

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-50 min-w-[160px] overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-lg animate-in fade-in zoom-in-95 duration-100"
            style={{ left: x, top: y }}
        >
            <div className="p-1">
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            item.onClick();
                            onClose();
                        }}
                        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors
              ${item.danger
                                ? 'text-red-500 hover:bg-red-500/10'
                                : 'text-text-primary hover:bg-bg-tertiary'
                            }`}
                    >
                        {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                        {item.label}
                    </button>
                ))}
            </div>
        </div>,
        document.body
    );
};
