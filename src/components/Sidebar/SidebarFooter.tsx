import { Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SidebarFooterProps {
    onOpenSettings: () => void;
}

export const SidebarFooter = ({ onOpenSettings }: SidebarFooterProps) => {
    const { user } = useAuthStore();

    return (
        <div className="mt-auto border-t border-border p-3">
            <button
                onClick={onOpenSettings}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-bg-secondary rounded-md text-text-primary"
            >
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-6 h-6 rounded-full border border-border" />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-xs">
                        {user?.login?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
                <span className="truncate flex-1 text-left">{user?.login || 'User'}</span>
                <Settings className="w-4 h-4 text-text-secondary" />
            </button>
        </div>
    );
};
