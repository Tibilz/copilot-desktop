import { useEffect, useRef, useMemo } from 'react';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../../stores/chatStore';
import { MessageBubble } from './MessageBubble';
import { SwarmExecutionView } from '../Swarm/SwarmExecutionView';

export const ChatView = () => {
    const { messages, activeChatId } = useChatStore();
    const currentMessages = useMemo(
        () => (activeChatId ? messages[activeChatId] || [] : []),
        [activeChatId, messages]
    );
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollContainerRef.current) {
            const { scrollHeight, clientHeight } = scrollContainerRef.current;
            scrollContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior
            });
        }
    };

    useEffect(() => {
        // Use 'auto' behavior for chat switching to prevent dizzying scroll
        // Use 'smooth' for new messages
        scrollToBottom(activeChatId ? 'auto' : 'smooth');
    }, [activeChatId]);

    useEffect(() => {
        // When messages change (typing), keep scrolling to bottom gently
        if (currentMessages.length > 0) {
           scrollToBottom('smooth');
        }
    }, [currentMessages]);

    return (
        <div className="relative flex h-full flex-1 flex-col bg-bg-primary">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 pb-48 scrollbar-default">
                <div className="mx-auto max-w-3xl space-y-6">
                    {currentMessages.length === 0 ? (
                        <div className="mt-20 flex h-full flex-col items-center justify-center text-center">
                            <div className="mb-4 h-16 w-16 overflow-hidden rounded-full bg-bg-secondary p-1">
                                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
                            </div>
                            <h2 className="text-2xl font-semibold text-text-primary">Wie kann ich helfen?</h2>
                        </div>
                    ) : (
                        currentMessages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            <div className="absolute bottom-0 w-full bg-gradient-to-t from-bg-primary via-bg-primary to-transparent pb-2 pt-10">
                <MessageInput />
            </div>
            <SwarmExecutionView />
        </div>
    );
};
