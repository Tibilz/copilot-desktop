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
        console.log("Stop requested (not implemented yet)");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="max-w-3xl mx-auto w-full p-4">
            <div className="bg-bg-secondary rounded-3xl border border-border p-3 focus-within:border-accent shadow-sm relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Stelle irgendeine Frage"
                    className="w-full bg-transparent outline-none resize-none min-h-[44px] max-h-[200px] pl-2 pr-10 py-2 text-text-primary placeholder:text-text-secondary"
                    rows={1}
                />

                <div className="flex items-center justify-between mt-2 pl-1 pr-1">
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-text-secondary hover:bg-bg-primary hover:text-text-primary rounded-full transition-colors">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-text-secondary hover:bg-bg-primary hover:text-text-primary rounded-full transition-colors">
                            <Globe className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-text-secondary hover:bg-bg-primary hover:text-text-primary rounded-full transition-colors">
                            <Lightbulb className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 text-text-primary hover:bg-bg-primary rounded-full bg-transparent">
                            <Mic className="w-5 h-5" />
                        </button>

                        {isLoading ? (
                            <button
                                onClick={handleStop}
                                className="p-2 bg-red-500 text-white rounded-full hover:opacity-90 transition-opacity"
                                title="Stop generation"
                            >
                                <Square className="w-5 h-5 fill-current" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={!content.trim()}
                                className="p-2 bg-text-primary text-bg-primary rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                title="Send message"
                            >
                                <ArrowUp className="w-5 h-5 stroke-[3px]" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-center text-xs text-text-secondary mt-2">
                Copilot Desktop can make mistakes. Check important info.
            </div>
        </div>
    );
};

