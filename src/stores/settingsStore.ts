/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { initDb } from '../services/database';

type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: Theme;
  loadSettings: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',

  loadSettings: async () => {
    const db = await initDb();
    const result = await db.select<any[]>('SELECT value FROM settings WHERE key = ?', ['theme']);
    if (result.length > 0) {
      set({ theme: result[0].value as Theme });
    }
  },

  setTheme: async (theme: Theme) => {
    const db = await initDb();
    // Use upsert logic or simple check
    const existing = await db.select<any[]>('SELECT key FROM settings WHERE key = ?', ['theme']);
    if (existing.length > 0) {
      await db.execute('UPDATE settings SET value = ? WHERE key = ?', [theme, 'theme']);
    } else {
      await db.execute('INSERT INTO settings (key, value) VALUES (?, ?)', ['theme', theme]);
    }
    set({ theme });
  },
}));
