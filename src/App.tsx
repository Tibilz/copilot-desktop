import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { ChatView } from './components/Chat/ChatView';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { LoginFlow } from './components/Auth/LoginFlow';

function App() {
  const { isAuthenticated, token, checkAuth, loading } = useAuthStore();
  const { theme, loadSettings } = useSettingsStore();

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, [checkAuth, loadSettings]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  if (loading && !isAuthenticated && !token && !useAuthStore.getState().deviceFlow) {
    return <div className="h-screen w-screen bg-bg-primary flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated && !token) {
    return (
      <div className="h-screen w-screen bg-bg-primary flex items-center justify-center">
        <LoginFlow />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-bg-primary text-text-primary font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <ChatView />
      </div>
    </div>
  );
}

export default App;
