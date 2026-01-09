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
            <div className="flex flex-col items-center justify-center p-8 bg-bg-secondary rounded-lg shadow-sm border border-border">
                <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                <p className="text-text-primary mb-4">Verbinde mit GitHub...</p>
                <button 
                    onClick={cancelLogin}
                    className="text-xs text-red-400 hover:text-red-500 underline"
                >
                    Abbrechen
                </button>
            </div>
        );
    }

    // 2. Device Flow UI
    if (deviceFlow) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-bg-secondary rounded-lg shadow-sm border border-border max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 text-text-primary">Anmelden bei GitHub Copilot</h2>
                <p className="text-text-secondary mb-6 text-center">
                    Kopiere den Code und füge ihn auf der GitHub-Seite ein.
                </p>
                <div className="bg-bg-primary p-4 rounded-md border border-border mb-6 flex items-center justify-between w-full">
                    <span className="text-2xl font-mono font-bold tracking-widest text-text-primary">
                        {deviceFlow.user_code}
                    </span>
                    <button
                        onClick={() => navigator.clipboard.writeText(deviceFlow.user_code)}
                        className="p-2 hover:bg-bg-secondary rounded transition-colors"
                        title="Code kopieren"
                    >
                        <Copy className="w-5 h-5 text-accent" />
                    </button>
                </div>
                <button
                    onClick={() => openUrl(deviceFlow.verification_uri)}
                    className="w-full bg-accent text-white py-3 px-4 rounded-md font-medium hover:opacity-90 flex items-center justify-center gap-2"
                >
                    Code eingeben auf GitHub
                    <ExternalLink className="w-4 h-4" />
                </button>
                <div className="mt-6 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
                    <span className="text-xs text-text-secondary">Warte auf Bestätigung...</span>
                </div>
            </div>
        );
    }

    // 3. Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-bg-secondary rounded-lg shadow-sm border border-red-500 max-w-md w-full">
                <p className="text-red-500 mb-4">Fehler: {error}</p>
                <button
                    onClick={() => startLogin()}
                    className="bg-accent text-white py-2 px-4 rounded-md"
                >
                    Erneut versuchen
                </button>
            </div>
        );
    }

    // 4. Default Login Button
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-bg-secondary rounded-lg shadow-sm border border-border max-w-md w-full">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <div className="w-10 h-10 rounded-full bg-black"></div>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-text-primary">Copilot Desktop</h1>
            <p className="text-text-secondary text-center mb-6">
                Melde dich mit GitHub an, um zu starten
            </p>
            <button
                onClick={() => {
                    startLogin();
                }}
                disabled={loading}
                className="w-full bg-[#24292F] text-white py-3 px-4 rounded-md font-medium hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>🔐 Login with GitHub</>
                )}
            </button>

        </div>
    );
};
