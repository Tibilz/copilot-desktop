import { useState, useEffect } from 'react';
import { Share, MoreHorizontal, ChevronDown, Check } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { SwarmToggle } from '../Swarm/SwarmToggle';

const AVAILABLE_MODELS = [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Neuestes OpenAI Modell' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Schneller, günstiger' },
    { id: 'o1-preview', name: 'o1-preview', description: 'Reasoning Model' },
    { id: 'o1-mini', name: 'o1-mini', description: 'Reasoning (schneller)' },
];

export const Header = () => {
    const { chats, activeChatId, updateChatModel, availableModels, fetchAvailableModels } = useChatStore();
    const activeChat = chats.find((c) => c.id === activeChatId);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

    useEffect(() => {
        fetchAvailableModels(); // Fetch fresh models on mount
    }, []);

    useEffect(() => {
        setIsModelMenuOpen(false);
    }, [activeChatId]);

    const handleModelChange = async (modelId: string) => {
        if (activeChatId) {
            await updateChatModel(activeChatId, modelId);
        }
        setIsModelMenuOpen(false);
    };

    // Use dynamic models from API if available, else static list
    const modelsToList = availableModels.length > 0 ? availableModels : AVAILABLE_MODELS.filter(m => m.id !== 'claude-3.5-sonnet');

    const currentModelName =
        modelsToList.find((m) => m.id === activeChat?.model)?.name || activeChat?.model || 'GPT-4o';

    return (
        <div className="relative z-20 flex h-14 items-center justify-between border-b border-border bg-bg-primary px-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-lg font-semibold text-text-primary hover:bg-bg-secondary"
                    >
                        {currentModelName}
                        <ChevronDown className="h-4 w-4 text-text-secondary" />
                    </button>

                    {isModelMenuOpen && (
                        <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border border-border bg-bg-primary py-1 shadow-lg max-h-96 overflow-y-auto">
                            {modelsToList.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => handleModelChange(model.id)}
                                    className="group flex w-full items-start justify-between px-4 py-3 text-left hover:bg-bg-secondary"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-text-primary">{model.name}</div>
                                        <div className="text-xs text-text-secondary">{model.description}</div>
                                    </div>
                                    {activeChat?.model === model.id && <Check className="h-4 w-4 text-accent" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {/* <SwarmToggle /> */}
            </div>

            <div className="flex items-center gap-2">
                <button className="rounded-md p-2 hover:bg-bg-secondary">
                    <Share className="h-5 w-5 text-text-primary" />
                </button>
                <button className="rounded-md p-2 hover:bg-bg-secondary">
                    <MoreHorizontal className="h-5 w-5 text-text-primary" />
                </button>
            </div>
        </div>
    );
};
