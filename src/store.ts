// LocalStorage-backed store for ClaudeFree
import { v4 as uuidv4 } from 'uuid';
import type { Chat, Settings, Preset, Memory, Message } from './types';
import { DEFAULT_SETTINGS, DEFAULT_PRESET, DEFAULT_MEMORY } from './types';

const KEYS = {
  CHATS: 'cf_chats',
  SETTINGS: 'cf_settings',
  PRESETS: 'cf_presets',
  MEMORY: 'cf_memory',
  ACTIVE_CHAT: 'cf_active_chat',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — ignore
  }
}

// ── Chats ──────────────────────────────────────────────────────────────────
export function loadChats(): Chat[] {
  return load<Chat[]>(KEYS.CHATS, []);
}

export function saveChats(chats: Chat[]): void {
  save(KEYS.CHATS, chats);
}

export function createChat(presetId?: string): Chat {
  return {
    id: uuidv4(),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    presetId,
  };
}

export function autoTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New Chat';
  const text = first.content.trim();
  return text.length > 40 ? text.slice(0, 40) + '…' : text;
}

// ── Settings ──────────────────────────────────────────────────────────────
export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(KEYS.SETTINGS, {}) };
}

export function saveSettings(s: Settings): void {
  save(KEYS.SETTINGS, s);
}

// ── Presets ───────────────────────────────────────────────────────────────
export function loadPresets(): Preset[] {
  const stored = load<Preset[]>(KEYS.PRESETS, []);
  if (stored.length === 0) return [DEFAULT_PRESET];
  return stored;
}

export function savePresets(presets: Preset[]): void {
  save(KEYS.PRESETS, presets);
}

export function createPreset(name: string, systemPrompt: string): Preset {
  return { id: uuidv4(), name, systemPrompt };
}

// ── Memory ────────────────────────────────────────────────────────────────
export function loadMemory(): Memory {
  return { ...DEFAULT_MEMORY, ...load<Partial<Memory>>(KEYS.MEMORY, {}) };
}

export function saveMemory(m: Memory): void {
  save(KEYS.MEMORY, m);
}

// ── Active chat ───────────────────────────────────────────────────────────
export function loadActiveChat(): string | null {
  return localStorage.getItem(KEYS.ACTIVE_CHAT);
}

export function saveActiveChat(id: string | null): void {
  if (id) localStorage.setItem(KEYS.ACTIVE_CHAT, id);
  else localStorage.removeItem(KEYS.ACTIVE_CHAT);
}
