import { useRef, useState, useEffect, useCallback } from 'react';
import type { Chat, Message, Settings, Preset, Memory } from '../types';
import { useChat } from '../hooks/useChat';
import { MessageItem, TypingIndicator } from './MessageItem';

interface ChatAreaProps {
  chat: Chat;
  chats: Chat[];
  settings: Settings;
  presets: Preset[];
  memory: Memory;
  onChatsUpdate: (chats: Chat[]) => void;
  onMemoryUpdate: (memory: Memory) => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
}

export function ChatArea({
  chat,
  chats,
  settings,
  presets,
  memory,
  onChatsUpdate,
  onMemoryUpdate,
  onOpenSettings,
  onToggleSidebar,
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isStreaming, streamingContent, sendMessage } = useChat({
    chat,
    chats,
    settings,
    presets,
    memory,
    onChatsUpdate,
    onMemoryUpdate,
  });

  // Auto-scroll to bottom when messages change or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, streamingContent]);

  // Auto-resize textarea
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const el = e.target;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    },
    []
  );

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    const content = input;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(content);
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Build display messages — replace last assistant message with streaming content
  const displayMessages: Message[] = chat.messages;

  const activePreset =
    presets.find((p) => p.id === chat.presetId) ?? presets[0];

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-[#13141c]">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-[#13141c]/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-white/8 text-gray-400 hover:text-gray-200 transition-colors lg:hidden"
          title="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium text-gray-200 truncate">{chat.title}</h1>
          {activePreset && (
            <p className="text-xs text-gray-500 truncate">
              Preset: {activePreset.name}
            </p>
          )}
        </div>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg hover:bg-white/8 text-gray-400 hover:text-gray-200 transition-colors"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {displayMessages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-16 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Start a conversation. Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">Shift+Enter</kbd> for new line.
            </p>
          </div>
        )}

        {displayMessages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <MessageItem
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              timestamp: Date.now(),
            }}
            isStreaming
          />
        )}

        {/* Show typing dots only when streaming has no content yet */}
        {isStreaming && !streamingContent && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 bg-[#1e1f2e] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-brand-500/60 transition-colors">
            {/* Image attachment button — DISABLED (vision support planned) */}
            <button
              disabled
              title="Image attachments coming soon"
              className="flex-shrink-0 p-1.5 rounded-lg text-gray-600 cursor-not-allowed opacity-40 mb-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 text-sm resize-none outline-none leading-relaxed min-h-[24px] max-h-[200px] py-0.5"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all active:scale-95 mb-0.5"
              title="Send message (Enter)"
            >
              {isStreaming ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-700 mt-2">
            {settings.model} · {settings.baseURL.replace(/^https?:\/\//, '')}
          </p>
        </div>
      </div>
    </div>
  );
}
