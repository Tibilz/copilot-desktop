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
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-secondary"
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt="Profile"
            className="h-6 w-6 rounded-full border border-border"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
            {user?.login?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="flex-1 truncate text-left">{user?.login || 'User'}</span>
        <Settings className="h-4 w-4 text-text-secondary" />
      </button>
    </div>
  );
};
