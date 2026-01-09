import React, { useState } from 'react';
import { Paperclip, Globe, Lightbulb, Mic, ArrowUp, Square } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

export const MessageInput = () => {
  const [content, setContent] = useState('');
  const { sendMessage, isLoading } = useChatStore();

  const handleSend = () => {
    if (!content.trim() || isLoading) return;
    sendMessage(content);
    setContent('');
  };

  const handleStop = () => {
    // TODO: Implement stop functionality in chatStore/sessionManager
    // console.log("Stop requested (not implemented yet)");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <div className="relative rounded-3xl border border-border bg-bg-secondary p-3 shadow-sm focus-within:border-accent">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stelle irgendeine Frage"
          className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent py-2 pl-2 pr-10 text-text-primary outline-none placeholder:text-text-secondary"
          rows={1}
        />

        <div className="mt-2 flex items-center justify-between pl-1 pr-1">
          <div className="flex items-center gap-1">
            <button className="rounded-full p-2 text-text-secondary transition-colors hover:bg-bg-primary hover:text-text-primary">
              <Paperclip className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 text-text-secondary transition-colors hover:bg-bg-primary hover:text-text-primary">
              <Globe className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 text-text-secondary transition-colors hover:bg-bg-primary hover:text-text-primary">
              <Lightbulb className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-full bg-transparent p-2 text-text-primary hover:bg-bg-primary">
              <Mic className="h-5 w-5" />
            </button>

            {isLoading ? (
              <button
                onClick={handleStop}
                className="rounded-full bg-red-500 p-2 text-white transition-opacity hover:opacity-90"
                title="Stop generation"
              >
                <Square className="h-5 w-5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!content.trim()}
                className="rounded-full bg-text-primary p-2 text-bg-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                title="Send message"
              >
                <ArrowUp className="h-5 w-5 stroke-[3px]" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-text-secondary">
        Copilot Desktop can make mistakes. Check important info.
      </div>
    </div>
  );
};
