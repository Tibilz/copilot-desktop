import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useProjectStore } from '../../stores/projectStore';
import { swarmService } from '../../services/swarmService';
import { ChatItem } from './ChatItem';
import { ProjectFolder } from './ProjectFolder';
import { AccountSettings } from '../Settings/AccountSettings';
import { SearchBar } from './SearchBar';
import { SidebarFooter } from './SidebarFooter';
import { CreateProjectModal } from './CreateProjectModal';

export const Sidebar = () => {
    // Select specific state to avoid re-renders on 'messages' updates (streaming)
    const chats = useChatStore((s) => s.chats);
    const activeChatId = useChatStore((s) => s.activeChatId);
    const createChat = useChatStore((s) => s.createChat);
    const setActiveChat = useChatStore((s) => s.setActiveChat);
    const loadChats = useChatStore((s) => s.loadChats);

    const { projects, loadProjects } = useProjectStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        loadChats();
        loadProjects();
    }, [loadChats, loadProjects]);

    const handleCreateProject = () => {
        setIsCreateProjectOpen(true);
    };

    const createSwarm = async () => {
        const configs = await swarmService.getAllConfigs();
        let configId = '';
        if (configs.length === 0) {
            configId = await swarmService.createConfig('Default Parallel', 'parallel');
            await swarmService.addWorker(
                configId,
                'Coder',
                'You are an expert programmer. Write concise code.',
                'gpt-4o'
            );
            await swarmService.addWorker(
                configId,
                'Reviewer',
                'You are a code reviewer. Critique the code and suggest improvements.',
                'gpt-4o'
            );
        } else {
            configId = configs[0].id;
        }
        await createChat(`swarm:${configId}`);
    };

    // Filter Logic
    const query = searchQuery.toLowerCase();
    const filteredChats = chats.filter((c) =>
        c.title.toLowerCase().includes(query)
    );

    // Filter Projects
    const filteredProjects = projects.filter((p) => {
        if (!query) return true;
        const nameMatch = p.name.toLowerCase().includes(query);
        const hasMatchingChats = filteredChats.some((c) => c.projectId === p.id);
        return nameMatch || hasMatchingChats;
    });

    const unassignedChats = filteredChats.filter((c) => !c.projectId);

    return (
        <>
            <div className="relative z-10 flex h-full w-64 flex-col border-r border-border bg-bg-sidebar transition-all duration-300">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 scrollbar-default">
                    {/* Projects Section */}
                    <div className="group mb-2 flex items-center justify-between px-2">
                        <div className="text-xs font-semibold text-text-secondary">Projekte</div>
                        <button
                            onClick={handleCreateProject}
                            className="hover:text-primary text-text-secondary"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>

                    {filteredProjects.map((project) => (
                        <ProjectFolder
                            key={project.id}
                            project={project}
                            chats={filteredChats.filter((c) => c.projectId === project.id)}
                            activeChatId={activeChatId}
                            onChatClick={setActiveChat}
                        />
                    ))}

                    {/* Actions */}
                    <div className="my-4 space-y-1">
                        <button
                            onClick={() => createChat()}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                        >
                            <Plus className="h-4 w-4" />
                            Neuer Chat
                        </button>
                        {/* <button
                            onClick={createSwarm}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                        >
                            <Users className="h-4 w-4" />
                            Neuer Swarm
                        </button> */}
                    </div>

                    {/* Unassigned History */}
                    <div className="mt-4">
                        <div className="mb-2 px-2 text-xs font-semibold text-text-secondary">Verlauf</div>
                        {unassignedChats.length === 0 && projects.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-text-secondary">
                                <p>Keine Chats</p>
                                <p className="opacity-50 mt-1">Starte eine neue Konversation</p>
                            </div>
                        ) : (
                            unassignedChats.map((chat) => (
                                <ChatItem
                                    key={chat.id}
                                    chat={chat}
                                    isActive={activeChatId === chat.id}
                                    onClick={() => setActiveChat(chat.id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                <SidebarFooter onOpenSettings={() => setIsSettingsOpen(true)} />
            </div>

            {/* Settings Modal Overlay */}
            {isSettingsOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
                    onClick={() => setIsSettingsOpen(false)}
                >
                    <div
                        className="relative max-h-[80vh] w-[600px] overflow-y-auto rounded-xl border border-border bg-bg-primary p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-6 text-xl font-bold text-text-primary">Einstellungen</h2>
                        <AccountSettings />
                        <button
                            className="absolute right-4 top-4 text-text-secondary hover:text-text-primary"
                            onClick={() => setIsSettingsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <CreateProjectModal
                isOpen={isCreateProjectOpen}
                onClose={() => setIsCreateProjectOpen(false)}
            />
        </>
    );
};
