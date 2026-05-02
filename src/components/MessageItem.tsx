import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import type { Message } from '../types';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  if (message.role === 'system') return null;

  return (
    <div
      className={`flex gap-3 animate-slide-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-[#2a1f3d] text-purple-300 border border-purple-500/30'
        }`}
      >
        {isUser ? 'U' : 'C'}
      </div>

      {/* Bubble */}
      <div
        className={`relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-[#1e1f2e] text-gray-200 border border-white/8 rounded-tl-sm'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeStr = String(children).replace(/\n$/, '');

                  if (!inline && (match || codeStr.includes('\n'))) {
                    return (
                      <CodeBlock
                        language={match ? match[1] : 'text'}
                        code={codeStr}
                      />
                    );
                  }
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-purple-300 text-[0.85em]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // Custom paragraph to avoid extra wrapping
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Streaming cursor */}
        {isAssistant && isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 rounded-sm animate-pulse" />
        )}
      </div>
    </div>
  );
}

// Typing indicator shown while AI is generating
export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 bg-[#2a1f3d] text-purple-300 border border-purple-500/30">
        C
      </div>
      <div className="bg-[#1e1f2e] border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
      </div>
    </div>
  );
}
