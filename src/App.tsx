import { useState, useEffect, useCallback } from 'react';
import type { Chat, Settings, Preset, Memory } from './types';
import {
  loadChats,
  loadSettings,
  loadPresets,
  loadMemory,
  loadActiveChat,
  saveChats,
  saveActiveChat,
  createChat,
} from './store';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';
import { PresetsModal } from './components/PresetsModal';
import { MemoryModal } from './components/MemoryModal';

/*
 * ClaudeFree — Minimalist AI Chat UI
 *
 * Architecture overview:
 * - App.tsx manages global state (chats, settings, presets, memory)
 * - State is persisted to localStorage via src/store.ts
 * - Streaming is handled in src/hooks/useChat.ts via the OpenAI SDK
 * - Cross-chat memory (AI recall) is auto-extracted after each conversation
 *   and injected into every system prompt — see hooks/useChat.ts
 *
 * Agentic / Kiro integration notes:
 * TODO: Replace the simple memory extraction in useChat.ts with a proper
 *   Kiro agent call that can maintain richer structured memory, run web
 *   searches, or execute code on the user's behalf.
 * TODO: Add an "Agent mode" toggle that enables multi-step tool calls
 *   (file read/write, browser, etc.) once the Kiro SDK is available.
 */

export default function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const stored = loadChats();
    if (stored.length === 0) {
      const presets = loadPresets();
      const fresh = createChat(presets[0]?.id);
      saveChats([fresh]);
      saveActiveChat(fresh.id);
      return [fresh];
    }
    return stored;
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const stored = loadActiveChat();
    const initialChats = loadChats();
    if (stored && initialChats.some((c) => c.id === stored)) return stored;
    return initialChats[0]?.id ?? '';
  });

  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [presets, setPresets] = useState<Preset[]>(loadPresets);
  const [memory, setMemory] = useState<Memory>(loadMemory);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

  // Keep activeChatId in sync if chats change
  useEffect(() => {
    if (!chats.some((c) => c.id === activeChatId) && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  // Open sidebar by default on desktop
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0];

  const handleSelectChat = useCallback((id: string) => {
    setActiveChatId(id);
    saveActiveChat(id);
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const handleNewChat = useCallback((chat: Chat) => {
    setActiveChatId(chat.id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const handleChatsUpdate = useCallback((updated: Chat[]) => {
    setChats(updated);
  }, []);

  const handlePresetsApply = useCallback(
    (updatedPresets: Preset[], activeId: string) => {
      setPresets(updatedPresets);
      // Update the active chat's presetId
      setChats((prev) => {
        const updated = prev.map((c) =>
          c.id === activeChatId ? { ...c, presetId: activeId } : c
        );
        saveChats(updated);
        return updated;
      });
    },
    [activeChatId]
  );

  if (!activeChat) return null;

  return (
    <div className="flex h-full bg-[#13141c] text-gray-200">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        presets={presets}
        isOpen={sidebarOpen}
        memoryUpdatedAt={memory.updatedAt}
        onSelectChat={handleSelectChat}
        onChatsUpdate={handleChatsUpdate}
        onNewChat={handleNewChat}
        onOpenSettings={() => setShowSettings(true)}
        onOpenPresets={() => setShowPresets(true)}
        onOpenMemory={() => setShowMemory(true)}
      />

      <ChatArea
        chat={activeChat}
        chats={chats}
        settings={settings}
        presets={presets}
        memory={memory}
        onChatsUpdate={handleChatsUpdate}
        onMemoryUpdate={setMemory}
        onOpenSettings={() => setShowSettings(true)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={setSettings}
        />
      )}

      {showPresets && (
        <PresetsModal
          presets={presets}
          activePresetId={activeChat.presetId}
          onClose={() => setShowPresets(false)}
          onSave={handlePresetsApply}
        />
      )}

      {showMemory && (
        <MemoryModal
          memory={memory}
          onClose={() => setShowMemory(false)}
          onUpdate={setMemory}
        />
      )}
    </div>
  );
}
