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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeChatId]);

  return (
    <div className="relative flex h-full flex-1 flex-col bg-bg-primary">
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="mx-auto max-w-3xl space-y-6">
          {currentMessages.length === 0 ? (
            <div className="mt-20 flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 h-12 w-12 rounded-full bg-bg-secondary"></div>
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
