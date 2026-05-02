// Core types for ClaudeFree

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  presetId?: string; // which system prompt preset is active
}

export interface Preset {
  id: string;
  name: string;
  systemPrompt: string;
  isDefault?: boolean;
}

export interface Settings {
  baseURL: string;
  apiKey: string;
  model: string;
  streamEnabled: boolean;
}

export interface Memory {
  // Global cross-chat memory summary injected into every system prompt
  summary: string;
  updatedAt: number;
}

// Default values
export const DEFAULT_SETTINGS: Settings = {
  baseURL: '/v1',
  apiKey: 'sk-1eaf7325d93638df-4ac7da-94b3d57c',
  model: 'kr/claude-sonnet-4.5',
  streamEnabled: true,
};

export const DEFAULT_PRESET: Preset = {
  id: 'default',
  name: 'Expert',
  systemPrompt:
    'You are a multidisciplinary expert. Analyze tasks step by step, verify facts and logic before answering, provide only accurate and reasoned information, do not invent things, indicate uncertainties and clarify the question when necessary. Priority — maximum reliability.',
  isDefault: true,
};

export const DEFAULT_MEMORY: Memory = {
  summary: '',
  updatedAt: 0,
};
