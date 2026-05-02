import type { Chat, Preset } from '../types';
import { createChat, saveChats, saveActiveChat } from '../store';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  presets: Preset[];
  isOpen: boolean;
  memoryUpdatedAt: number;
  onSelectChat: (id: string) => void;
  onChatsUpdate: (chats: Chat[]) => void;
  onNewChat: (chat: Chat) => void;
  onOpenSettings: () => void;
  onOpenPresets: () => void;
  onOpenMemory: () => void;
}

export function Sidebar({
  chats,
  activeChatId,
  presets,
  isOpen,
  memoryUpdatedAt,
  onSelectChat,
  onChatsUpdate,
  onNewChat,
  onOpenSettings,
  onOpenPresets,
  onOpenMemory,
}: SidebarProps) {
  const handleNewChat = () => {
    const defaultPreset = presets[0];
    const chat = createChat(defaultPreset?.id);
    const newChats = [chat, ...chats];
    onChatsUpdate(newChats);
    saveChats(newChats);
    saveActiveChat(chat.id);
    onNewChat(chat);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = chats.filter((c) => c.id !== id);
    onChatsUpdate(filtered);
    saveChats(filtered);
    if (activeChatId === id) {
      const next = filtered[0];
      if (next) {
        saveActiveChat(next.id);
        onSelectChat(next.id);
      } else {
        saveActiveChat(null);
        // create a fresh chat if all deleted
        const fresh = createChat(presets[0]?.id);
        const freshChats = [fresh];
        onChatsUpdate(freshChats);
        saveChats(freshChats);
        saveActiveChat(fresh.id);
        onNewChat(fresh);
      }
    }
  };

  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          flex flex-col h-full bg-[#0f1017] border-r border-white/8 flex-shrink-0 z-30
          transition-all duration-200 ease-out
          ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
          lg:relative lg:z-auto
          fixed lg:static inset-y-0 left-0
        `}
      >
        <div className="flex flex-col h-full w-64">
          {/* Logo / header */}
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/8">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-100">ClaudeFree</span>
          </div>

          {/* New chat button */}
          <div className="px-3 py-3">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-300 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
            {sortedChats.length === 0 && (
              <p className="text-xs text-gray-600 px-3 py-2">No chats yet</p>
            )}
            {sortedChats.map((chat) => {
              const preset = presets.find((p) => p.id === chat.presetId);
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full group flex items-center cursor-pointer gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                    chat.id === activeChatId
                      ? 'bg-brand-600/20 text-gray-100 border border-brand-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{chat.title}</p>
                    {preset && (
                      <p className="text-[10px] text-gray-600 truncate">{preset.name}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 transition-all flex-shrink-0"
                    title="Delete chat"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom nav */}
          <div className="border-t border-white/8 p-3 space-y-1">
            <NavButton icon="memory" label="Memory" badge={memoryUpdatedAt > 0} onClick={onOpenMemory} />
            <NavButton icon="presets" label="Presets" onClick={onOpenPresets} />
            <NavButton icon="settings" label="Settings" onClick={onOpenSettings} />
          </div>
        </div>
      </aside>
    </>
  );
}

function NavButton({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: string;
  label: string;
  badge?: boolean;
  onClick: () => void;
}) {
  const icons: Record<string, React.ReactNode> = {
    memory: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    presets: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    settings: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/5 text-sm transition-all text-left"
    >
      <span className="flex-shrink-0 relative">
        {icons[icon]}
        {badge && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
        )}
      </span>
      {label}
    </button>
  );
}
