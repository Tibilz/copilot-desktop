/* eslint-disable @typescript-eslint/no-explicit-any */
import { initDb } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface GitHubToken {
    id: string; // Database ID
    accessToken: string;
    username: string;
    avatarUrl: string;
    isPrimary: boolean;
    rateLimitRemaining: number;
    lastUsed: Date | null;
}

export interface TokenStatus {
    id: string;
    username: string;
    inUse: number; // Count of active requests
    rateLimit: number;
    isPrimary: boolean;
}

class TokenPoolService {
    private activeRequests: Map<string, string> = new Map(); // chatId -> tokenId

    async getAccounts(): Promise<GitHubToken[]> {
        const db = await initDb();
        const rows = await db.select<any[]>('SELECT * FROM github_accounts ORDER BY is_primary DESC, last_used_at ASC');
        return rows.map(row => ({
            id: row.id,
            accessToken: row.access_token,
            username: row.username,
            avatarUrl: row.avatar_url,
            isPrimary: Boolean(row.is_primary),
            rateLimitRemaining: row.rate_limit_remaining,
            lastUsed: row.last_used_at ? new Date(row.last_used_at) : null
        }));
    }

    async acquireToken(chatId: string): Promise<GitHubToken> {
        const tokens = await this.getAccounts();
        if (tokens.length === 0) throw new Error('No GitHub accounts connected');

        // Strategy:
        // 1. Check local load
        const loadMap = new Map<string, number>();
        tokens.forEach(t => loadMap.set(t.id, 0));
        this.activeRequests.forEach((tokenId) => {
            loadMap.set(tokenId, (loadMap.get(tokenId) || 0) + 1);
        });

        // 2. Choose best token (least loaded -> Round Robin via DB sort)
        // We pick the first one that is "healthy"
        const bestToken = tokens.sort((a, b) => {
            const loadA = loadMap.get(a.id) || 0;
            const loadB = loadMap.get(b.id) || 0;
            if (loadA !== loadB) return loadA - loadB; // Least loaded first
            return 0; // Maintain DB order (Time based)
        })[0];

        this.activeRequests.set(chatId, bestToken.id);
        await this.updateLastUsed(bestToken.id);

        return bestToken;
    }

    async releaseToken(chatId: string): Promise<void> {
        this.activeRequests.delete(chatId);
    }

    async addAccount(account: { username: string; access_token: string; avatar_url: string; is_primary?: boolean }): Promise<void> {
        const db = await initDb();

        // Check if exists
        const existing = await db.select<any[]>('SELECT id FROM github_accounts WHERE username = ?', [account.username]);
        if (existing.length > 0) {
            // Update
            await db.execute('UPDATE github_accounts SET access_token = ?, avatar_url = ? WHERE username = ?',
                [account.access_token, account.avatar_url, account.username]);
            return;
        }

        const id = uuidv4();
        const isPrimary = account.is_primary || (await this.getAccounts()).length === 0;

        await db.execute(
            'INSERT INTO github_accounts (id, username, access_token, avatar_url, is_primary, rate_limit_remaining) VALUES (?, ?, ?, ?, ?, ?)',
            [id, account.username, account.access_token, account.avatar_url, isPrimary, 5000]
        );
    }

    async removeAccount(id: string): Promise<void> {
        const db = await initDb();
        await db.execute('DELETE FROM github_accounts WHERE id = ?', [id]);
    }

    async setPrimary(id: string): Promise<void> {
        const db = await initDb();
        await db.execute('UPDATE github_accounts SET is_primary = FALSE');
        await db.execute('UPDATE github_accounts SET is_primary = TRUE WHERE id = ?', [id]);
    }

    async updateRateLimit(id: string, remaining: number): Promise<void> {
        const db = await initDb();
        await db.execute('UPDATE github_accounts SET rate_limit_remaining = ? WHERE id = ?', [remaining, id]);
    }

    async updateLastUsed(accountId: string): Promise<void> {
        const db = await initDb();
        await db.execute('UPDATE github_accounts SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?', [accountId]);
    }

    async getTokenStatus(): Promise<TokenStatus[]> {
        const tokens = await this.getAccounts();
        const loadMap = new Map<string, number>();
        this.activeRequests.forEach((tokenId) => {
            loadMap.set(tokenId, (loadMap.get(tokenId) || 0) + 1);
        });

        return tokens.map(t => ({
            id: t.id,
            username: t.username,
            inUse: loadMap.get(t.id) || 0,
            rateLimit: t.rateLimitRemaining,
            isPrimary: t.isPrimary
        }));
    }
}

export const tokenPool = new TokenPoolService();
