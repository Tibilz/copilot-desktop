// src/components/Auth/LoginFlow.tsx
import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Copy, ExternalLink, Loader2 } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';

export const LoginFlow = () => {
    const { startLogin, confirmLogin, deviceFlow, loading, error, cancelLogin } = useAuthStore();

    // Auto-confirm login when device flow is active
    useEffect(() => {
        if (deviceFlow && !loading) {
            confirmLogin();
        }
    }, [deviceFlow, loading, confirmLogin]);

    // 1. Loading state (only if no device flow yet)
    if (loading && !deviceFlow) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-bg-secondary p-8 shadow-sm">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-accent" />
                <p className="mb-4 text-text-primary">Verbinde mit GitHub...</p>
                <button onClick={cancelLogin} className="text-xs text-red-400 underline hover:text-red-500">
                    Abbrechen
                </button>
            </div>
        );
    }

    // 2. Device Flow UI
    if (deviceFlow) {
        return (
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border border-border bg-bg-secondary p-8 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-text-primary">Anmelden bei GitHub Copilot</h2>
                <p className="mb-6 text-center text-text-secondary">
                    Kopiere den Code und füge ihn auf der GitHub-Seite ein.
                </p>
                <div className="mb-6 flex w-full items-center justify-between rounded-md border border-border bg-bg-primary p-4">
                    <span className="font-mono text-2xl font-bold tracking-widest text-text-primary">
                        {deviceFlow.user_code}
                    </span>
                    <button
                        onClick={() => navigator.clipboard.writeText(deviceFlow.user_code)}
                        className="rounded p-2 transition-colors hover:bg-bg-secondary"
                        title="Code kopieren"
                    >
                        <Copy className="h-5 w-5 text-accent" />
                    </button>
                </div>
                <button
                    onClick={() => openUrl(deviceFlow.verification_uri)}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 font-medium text-white hover:opacity-90"
                >
                    Code eingeben auf GitHub
                    <ExternalLink className="h-4 w-4" />
                </button>
                <div className="mt-6 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
                    <span className="text-xs text-text-secondary">Warte auf Bestätigung...</span>
                </div>
            </div>
        );
    }

    // 3. Error state
    if (error) {
        return (
            <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border border-red-500 bg-bg-secondary p-8 shadow-sm">
                <p className="mb-4 text-red-500">Fehler: {error}</p>
                <button onClick={() => startLogin()} className="rounded-md bg-accent px-4 py-2 text-white">
                    Erneut versuchen
                </button>
            </div>
        );
    }

    // 4. Default Login Button
    return (
        <div className="flex w-full max-w-md flex-col items-center justify-center rounded-lg border border-border bg-bg-secondary p-8 shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <div className="h-10 w-10 rounded-full bg-black"></div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-text-primary">Copilot Desktop</h1>
            <p className="mb-6 text-center text-text-secondary">
                Melde dich mit GitHub an, um zu starten
            </p>
            <button
                onClick={() => {
                    startLogin();
                }}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#24292F] px-4 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>🔐 Login with GitHub</>}
            </button>
        </div>
    );
};
