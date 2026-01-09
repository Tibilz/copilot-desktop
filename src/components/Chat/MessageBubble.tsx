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

const CodeBlock = ({ language, children }: { language: string; children: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative my-4 overflow-hidden rounded-lg">
            <div className="absolute right-2 top-2 z-10 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded bg-black/50 px-2 py-1 text-xs text-gray-400">{language}</span>
                <button
                    onClick={handleCopy}
                    className="rounded border border-border bg-bg-secondary p-1.5 text-text-secondary transition-colors hover:bg-bg-primary hover:text-text-primary"
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
                        ? 'rounded-tr-sm bg-bg-secondary text-text-primary'
                        : 'prose w-full max-w-none bg-transparent text-left text-text-primary dark:prose-invert'
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
                                    className="cursor-pointer text-accent hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {children}
                                </a>
                            ),
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            code({ inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');

                                return !inline && match ? (
                                    <CodeBlock language={match[1]}>{codeString}</CodeBlock>
                                ) : (
                                    <code
                                        className={`${className} rounded bg-bg-secondary px-1.5 py-0.5 text-sm`}
                                        {...props}
                                    >
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
