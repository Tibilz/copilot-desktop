import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../../types/chat';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
}

const CodeBlock = ({ language, children }: { language: string, children: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4 rounded-lg overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <span className="text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">{language}</span>
                <button
                    onClick={handleCopy}
                    className="p-1.5 bg-bg-secondary hover:bg-bg-primary rounded text-text-secondary hover:text-text-primary transition-colors border border-border"
                    title="Kopieren"
                >
                    {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                </button>
            </div>
            <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.9em' }}
            >
                {children}
            </SyntaxHighlighter>
        </div>
    );
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
    return (
        <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${message.role === 'user'
                    ? 'bg-bg-secondary text-text-primary rounded-tr-sm'
                    : 'bg-transparent text-text-primary text-left prose dark:prose-invert max-w-none w-full'
                    }`}
            >
                {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ href, children }) => (
                                <a
                                    href={href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (href) openUrl(href);
                                    }}
                                    className="text-accent hover:underline cursor-pointer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {children}
                                </a>
                            ),
                            code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');

                                return !inline && match ? (
                                    <CodeBlock language={match[1]}>
                                        {codeString}
                                    </CodeBlock>
                                ) : (
                                    <code className={`${className} bg-bg-secondary px-1.5 py-0.5 rounded text-sm`} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
};
