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

export const Sidebar = () => {
    const { chats, createChat, setActiveChat, activeChatId, loadChats } = useChatStore();
    const { projects, loadProjects, createProject } = useProjectStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        loadChats();
        loadProjects();
    }, [loadChats, loadProjects]);

    const handleCreateProject = async () => {
        const name = prompt("Projekt Name eingeben:");
        if (name && name.trim()) {
            try {
                await createProject(name.trim());
            } catch (e) {
                console.error("Failed to create project", e);
                alert("Fehler beim Erstellen des Projekts");
            }
        }
    };

    const createSwarm = async () => {
        let configs = await swarmService.getAllConfigs();
        let configId = '';
        if (configs.length === 0) {
            configId = await swarmService.createConfig("Default Parallel", "parallel");
            await swarmService.addWorker(configId, "Coder", "You are an expert programmer. Write concise code.", "gpt-4o");
            await swarmService.addWorker(configId, "Reviewer", "You are a code reviewer. Critique the code and suggest improvements.", "gpt-4o");
        } else {
            configId = configs[0].id;
        }
        await createChat(`swarm:${configId}`);
    };

    // Filter Logic
    const filteredChats = chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Only show projects that match search OR contain chats that match search
    // Simplified: Show project if name matches query OR always show if query is empty
    // But usually we want to search chats inside projects too.

    // For now simple filtering of unassigned lists
    const unassignedChats = filteredChats.filter(c => !c.projectId);

    return (
        <>
            <div className="w-64 bg-bg-sidebar border-r border-border h-full flex flex-col transition-all relative z-10">

                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                <div className="px-3 py-2 flex-1 overflow-y-auto">
                    {/* Projects Section */}
                    <div className="flex items-center justify-between px-2 mb-2 group">
                        <div className="text-xs font-semibold text-text-secondary">Projekte</div>
                        <button onClick={handleCreateProject} className="text-text-secondary hover:text-primary">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    {projects.map(project => (
                        <ProjectFolder
                            key={project.id}
                            project={project}
                            chats={filteredChats.filter(c => c.projectId === project.id)}
                            activeChatId={activeChatId}
                            onChatClick={setActiveChat}
                        />
                    ))}

                    {/* Actions */}
                    <div className="my-4 space-y-1">
                        <button
                            onClick={() => createChat()}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-bg-secondary rounded-md flex items-center gap-2 text-text-secondary hover:text-text-primary"
                        >
                            <Plus className="w-4 h-4" />
                            Neuer Chat
                        </button>
                        <button
                            onClick={createSwarm}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-bg-secondary rounded-md flex items-center gap-2 text-text-secondary hover:text-text-primary"
                        >
                            <Users className="w-4 h-4" />
                            Neuer Swarm
                        </button>
                    </div>

                    {/* Unassigned History */}
                    <div className="mt-4">
                        <div className="text-xs font-semibold text-text-secondary mb-2 px-2">Verlauf</div>
                        {unassignedChats.map(chat => (
                            <ChatItem
                                key={chat.id}
                                chat={chat}
                                isActive={activeChatId === chat.id}
                                onClick={() => setActiveChat(chat.id)}
                            />
                        ))}
                    </div>
                </div>

                <SidebarFooter onOpenSettings={() => setIsSettingsOpen(true)} />
            </div>

            {/* Settings Modal Overlay */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" onClick={() => setIsSettingsOpen(false)}>
                    <div className="bg-bg-primary w-[600px] max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl p-6 relative border border-border" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-6 text-text-primary">Einstellungen</h2>
                        <AccountSettings />
                        <button
                            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
                            onClick={() => setIsSettingsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
