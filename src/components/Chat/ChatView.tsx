import { useEffect, useRef } from 'react';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../../stores/chatStore';
import { MessageBubble } from './MessageBubble';
import { SwarmExecutionView } from '../Swarm/SwarmExecutionView';

export const ChatView = () => {
    const { messages, activeChatId } = useChatStore();
    const currentMessages = activeChatId ? messages[activeChatId] || [] : [];
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages, activeChatId]);

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-primary relative">
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="max-w-3xl mx-auto space-y-6">
                    {currentMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center mt-20">
                            <div className="w-12 h-12 bg-bg-secondary rounded-full mb-4"></div>
                            <h2 className="text-2xl font-semibold text-text-primary">Wie kann ich helfen?</h2>
                        </div>
                    ) : (
                        currentMessages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            <div className="absolute bottom-0 w-full bg-gradient-to-t from-bg-primary via-bg-primary to-transparent pt-10 pb-2">
                <MessageInput />
            </div>
            <SwarmExecutionView />
        </div>
    );
};
