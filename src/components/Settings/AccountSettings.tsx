import { useEffect, useState } from 'react';
import { tokenPool, GitHubToken, TokenStatus } from '../../services/tokenPool';
import { useAuthStore } from '../../stores/authStore';
import { LoginFlow } from '../Auth/LoginFlow';
import { Plus, Trash2, Star, Moon, Sun, Monitor } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

export const AccountSettings = () => {
  const [accounts, setAccounts] = useState<GitHubToken[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, TokenStatus>>({});
  const { startLogin, deviceFlow } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const { theme, setTheme } = useSettingsStore();

  const loadAccounts = async () => {
    const accs = await tokenPool.getAccounts();
    const stats = await tokenPool.getTokenStatus();
    const sMap: Record<string, TokenStatus> = {};
    stats.forEach((s) => (sMap[s.id] = s));

    setAccounts(accs);
    setStatusMap(sMap);
  };

  useEffect(() => {
    loadAccounts();
    const interval = setInterval(loadAccounts, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [deviceFlow]); // Reload when flow changes (login completes)

  const handleAddAccount = () => {
    setIsAdding(true);
    startLogin();
  };

  const handleRemove = async (id: string) => {
    await tokenPool.removeAccount(id);
    loadAccounts();
  };

  const handleSetPrimary = async (id: string) => {
    await tokenPool.setPrimary(id);
    loadAccounts();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-bg-secondary p-4">
        <h3 className="mb-4 text-lg font-medium text-text-primary">Erscheinungsbild</h3>
        <div className="flex w-fit items-center gap-2 rounded-lg border border-border bg-bg-primary p-1">
          <button
            onClick={() => setTheme('light')}
            className={`rounded p-2 ${theme === 'light' ? 'bg-bg-secondary text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            title="Light Mode"
          >
            <Sun size={20} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`rounded p-2 ${theme === 'dark' ? 'bg-bg-secondary text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            title="Dark Mode"
          >
            <Moon size={20} />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`rounded p-2 ${theme === 'system' ? 'bg-bg-secondary text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
            title="System Theme"
          >
            <Monitor size={20} />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-bg-secondary p-4">
        <h3 className="mb-4 text-lg font-medium text-text-primary">Verbundene Accounts</h3>

        <div className="mb-4 space-y-3">
          {accounts.map((acc) => {
            const status = statusMap[acc.id];
            return (
              <div
                key={acc.id}
                className="flex items-center justify-between rounded border border-border bg-bg-primary p-3"
              >
                <div className="flex items-center gap-3">
                  {acc.avatarUrl && (
                    <img src={acc.avatarUrl} className="h-8 w-8 rounded-full" alt="" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{acc.username}</span>
                      {acc.isPrimary && (
                        <span className="bg-accent/20 rounded px-1.5 py-0.5 text-xs text-accent">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Limit: {status?.rateLimit}/5000 • Active: {status?.inUse}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!acc.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(acc.id)}
                      className="p-1.5 text-text-secondary hover:text-accent"
                      title="Als Primary setzen"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(acc.id)}
                    className="p-1.5 text-text-secondary hover:text-red-500"
                    title="Entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {isAdding && deviceFlow ? (
          <div className="mb-4">
            <LoginFlow />
          </div>
        ) : (
          <button
            onClick={handleAddAccount}
            className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-border py-2 text-text-secondary hover:bg-bg-primary hover:text-text-primary"
          >
            <Plus className="h-4 w-4" />
            Weiteren Account verbinden
          </button>
        )}
      </div>
    </div>
  );
};
