import React, { useState, useRef } from 'react';
import { Paperclip, Globe, Lightbulb, Mic, ArrowUp, Square, X, FileText } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

export const MessageInput = () => {
    const [content, setContent] = useState('');
    const [isWebEnabled, setIsWebEnabled] = useState(false);
    const [isReasoningEnabled, setIsReasoningEnabled] = useState(false);
    const [attachments, setAttachments] = useState<{ name: string; content: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { sendMessage, isLoading } = useChatStore();

    const handleSend = () => {
        if ((!content.trim() && attachments.length === 0) || isLoading) return;

        let finalContent = content;

        // 1. Process Attachments
        if (attachments.length > 0) {
            finalContent += '\n\n--- ATTACHMENTS ---\n';
            attachments.forEach(file => {
                finalContent += `\nFile: ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n`;
            });
        }

        // 2. Process Features
        if (isWebEnabled) {
            finalContent = `[WEB SEARCH REQUEST] ${finalContent}`;
        }

        if (isReasoningEnabled) {
            finalContent = `[REASONING MODE: Think step-by-step] ${finalContent}`;
        }

        sendMessage(finalContent);
        setContent('');
        setAttachments([]);
        setIsWebEnabled(false);
        setIsReasoningEnabled(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setAttachments(prev => [...prev, { name: file.name, content: ev.target!.result as string }]);
                }
            };
            reader.readAsText(file);
            e.target.value = ''; // Reset input
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
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
        <div className="mx-auto w-full max-w-3xl px-4 pb-6">
            <div className="relative rounded-3xl border border-border bg-bg-secondary p-3 shadow-sm transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 px-1">
                        {attachments.map((file, i) => (
                            <div key={i} className="flex items-center gap-2 bg-bg-primary border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary">
                                <FileText className="h-3 w-3 text-accent" />
                                <span className="max-w-[150px] truncate">{file.name}</span>
                                <button onClick={() => removeAttachment(i)} className="text-text-secondary hover:text-red-500">
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Frag mich etwas..."
                    className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent py-2 pl-3 pr-10 text-text-primary outline-none placeholder:text-text-secondary/70"
                    rows={1}
                />

                <div className="mt-2 flex items-center justify-between pl-1 pr-1">
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full p-2 text-text-secondary transition-all hover:bg-bg-primary hover:text-text-primary" 
                            title="Anhang hinzufügen"
                        >
                            <Paperclip className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => setIsWebEnabled(!isWebEnabled)}
                            className={`rounded-full p-2 transition-all hover:bg-bg-primary ${isWebEnabled ? 'text-accent bg-accent/10' : 'text-text-secondary hover:text-text-primary'}`}
                            title="Web Suche"
                        >
                            <Globe className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => setIsReasoningEnabled(!isReasoningEnabled)}
                            className={`rounded-full p-2 transition-all hover:bg-bg-primary ${isReasoningEnabled ? 'text-yellow-500 bg-yellow-500/10' : 'text-text-secondary hover:text-text-primary'}`}
                            title="Reasoning"
                        >
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
