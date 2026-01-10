import { useEffect, useState } from 'react';
import { tokenPool, GitHubToken, TokenStatus } from '../../services/tokenPool';
import { useAuthStore } from '../../stores/authStore';
import { LoginFlow } from '../Auth/LoginFlow';
import { LogOut, Plus, Trash2, Star, Moon, Sun, Monitor } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

export const AccountSettings = () => {
    const [accounts, setAccounts] = useState<GitHubToken[]>([]);
    const [statusMap, setStatusMap] = useState<Record<string, TokenStatus>>({});
    const { startLogin, deviceFlow, logout, user, loading } = useAuthStore();
    const [isAdding, setIsAdding] = useState(false);
    const { theme, setTheme } = useSettingsStore();

    const loadAccounts = async () => {
        const accs = await tokenPool.getAccounts();
        const stats = await tokenPool.getTokenStatus();
        const sMap: Record<string, TokenStatus> = {};
        stats.forEach(s => sMap[s.id] = s);

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

    const handleRemove = async (id: string, username: string) => {
        await tokenPool.removeAccount(id);
        
        // If we removed the currently active user, we must logout
        if (user?.login === username) {
            logout();
        } else {
            loadAccounts();
        }
    };

    const handleSetPrimary = async (id: string) => {
        await tokenPool.setPrimary(id);
        loadAccounts();
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                <h3 className="text-lg font-medium text-text-primary mb-4">Erscheinungsbild</h3>
                <div className="flex items-center gap-2 bg-bg-primary p-1 rounded-lg border border-border w-fit">
                    <button
                        onClick={() => setTheme('light')}
                        className={`p-2 rounded ${theme === 'light' ? 'bg-bg-secondary text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        title="Light Mode"
                    >
                        <Sun size={20} />
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`p-2 rounded ${theme === 'dark' ? 'bg-bg-secondary text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        title="Dark Mode"
                    >
                        <Moon size={20} />
                    </button>
                    <button
                        onClick={() => setTheme('system')}
                        className={`p-2 rounded ${theme === 'system' ? 'bg-bg-secondary text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                        title="System Theme"
                    >
                        <Monitor size={20} />
                    </button>
                </div>
            </div>

            <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                <h3 className="text-lg font-medium text-text-primary mb-4">Verbundene Accounts</h3>

                <div className="space-y-3 mb-4">
                    {accounts.map(acc => {
                        const status = statusMap[acc.id];
                        return (
                            <div key={acc.id} className="flex items-center justify-between p-3 bg-bg-primary rounded border border-border">
                                <div className="flex items-center gap-3">
                                    {acc.avatarUrl && <img src={acc.avatarUrl} className="w-8 h-8 rounded-full" alt="" />}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-text-primary">{acc.username}</span>
                                            {acc.isPrimary && <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">Primary</span>}
                                        </div>
                                        <div className="text-xs text-text-secondary">
                                            Limit: {status?.rateLimit}/5000 • Active: {status?.inUse}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!acc.isPrimary && (
                                        <button onClick={() => handleSetPrimary(acc.id)} className="p-1.5 text-text-secondary hover:text-accent" title="Als Primary setzen">
                                            <Star className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => handleRemove(acc.id, acc.username)} className="p-1.5 text-text-secondary hover:text-red-500" title="Entfernen">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {isAdding && loading && !deviceFlow ? (
                    <div className="flex items-center justify-center p-4 text-text-secondary">
                        <span className="animate-pulse">Verbinde mit GitHub...</span>
                    </div>
                ) : isAdding && deviceFlow ? (
                    <div className="mb-4">
                        <LoginFlow />
                    </div>
                ) : (
                    <button
                        onClick={handleAddAccount}
                        className="w-full py-2 border border-dashed border-border rounded text-text-secondary hover:text-text-primary hover:bg-bg-primary flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Weiteren Account verbinden
                    </button>
                )}
            </div>

            <div className="p-4 bg-bg-secondary rounded-lg border border-border">
                <h3 className="text-lg font-medium text-text-primary mb-4">Aktionen</h3>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors w-full justify-center font-medium"
                >
                    <LogOut size={16} />
                    Abmelden (Logout)
                </button>
            </div>
        </div>
    );
};
