import { useState } from 'react';
import { Share, MoreHorizontal, ChevronDown, Check } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { SwarmToggle } from '../Swarm/SwarmToggle';

const AVAILABLE_MODELS = [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Neuestes OpenAI Modell' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Schneller, günstiger' },
    // { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic' }, // Unsupported
    { id: 'o1-preview', name: 'o1-preview', description: 'Reasoning Model' },
    { id: 'o1-mini', name: 'o1-mini', description: 'Reasoning (schneller)' },
];

export const Header = () => {
    const { chats, activeChatId, updateChatModel } = useChatStore();
    const activeChat = chats.find(c => c.id === activeChatId);
    const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

    const handleModelChange = async (modelId: string) => {
        if (activeChatId) {
            await updateChatModel(activeChatId, modelId);
        }
        setIsModelMenuOpen(false);
    };

    const currentModelName = AVAILABLE_MODELS.find(m => m.id === activeChat?.model)?.name || activeChat?.model || 'GPT-4o';

    return (
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-bg-primary relative z-20">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        className="flex items-center gap-1 text-lg font-semibold text-text-primary hover:bg-bg-secondary px-2 py-1 rounded-md"
                    >
                        {currentModelName}
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                    </button>

                    {isModelMenuOpen && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-bg-primary border border-border rounded-lg shadow-lg py-1">
                            {AVAILABLE_MODELS.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => handleModelChange(model.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-bg-secondary flex items-start justify-between group"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-text-primary">{model.name}</div>
                                        <div className="text-xs text-text-secondary">{model.description}</div>
                                    </div>
                                    {activeChat?.model === model.id && <Check className="w-4 h-4 text-accent" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <SwarmToggle />
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-bg-secondary rounded-md">
                    <Share className="w-5 h-5 text-text-primary" />
                </button>
                <button className="p-2 hover:bg-bg-secondary rounded-md">
                    <MoreHorizontal className="w-5 h-5 text-text-primary" />
                </button>
            </div>
        </div>
    );
};
