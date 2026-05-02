import { useState, useCallback } from 'react';
import type { Chat, Message, Settings, Preset, Memory } from '../types';
import { getClient } from '../api';
import { autoTitle, saveChats, saveMemory } from '../store';
import { v4 as uuidv4 } from 'uuid';

interface UseChatOptions {
  chat: Chat;
  chats: Chat[];
  settings: Settings;
  presets: Preset[];
  memory: Memory;
  onChatsUpdate: (chats: Chat[]) => void;
  onMemoryUpdate: (memory: Memory) => void;
}

export function useChat({
  chat,
  chats,
  settings,
  presets,
  memory,
  onChatsUpdate,
  onMemoryUpdate,
}: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const getSystemPrompt = useCallback(
    (presetId?: string): string => {
      const preset = presets.find((p) => p.id === presetId) ?? presets[0];
      let prompt = preset?.systemPrompt ?? '';

      // Inject cross-chat memory if available
      if (memory.summary.trim()) {
        prompt +=
          '\n\n---\n**Cross-chat memory (things the user mentioned in past sessions):**\n' +
          memory.summary;
      }
      return prompt;
    },
    [presets, memory]
  );

  const updateMemory = useCallback(
    async (newMessages: Message[]) => {
      // Simple memory: extract key facts from recent user messages and update summary
      // In a real agentic setup (e.g. Kiro), this would call a dedicated summarization agent
      const userMessages = newMessages
        .filter((m) => m.role === 'user')
        .slice(-5)
        .map((m) => m.content)
        .join('\n');
      if (!userMessages.trim()) return;

      try {
        const client = getClient(settings);
        const resp = await client.chat.completions.create({
          model: settings.model,
          messages: [
            {
              role: 'system',
              content:
                'You are a memory extractor. Given the last few user messages, extract only the key personal facts, preferences, topics, or context worth remembering across future chats. Be concise — one short paragraph maximum. If nothing meaningful, output an empty string.',
            },
            { role: 'user', content: userMessages },
          ],
          stream: false,
        });
        const extracted =
          (resp.choices[0]?.message?.content ?? '').trim();
        if (!extracted) return;

        const updated: Memory = {
          summary: extracted,
          updatedAt: Date.now(),
        };
        saveMemory(updated);
        onMemoryUpdate(updated);
      } catch {
        // Memory update failure is non-critical
      }
    },
    [settings, onMemoryUpdate]
  );

  const sendMessage = useCallback(
    async (userContent: string) => {
      if (isStreaming || !userContent.trim()) return;

      const userMsg: Message = {
        id: uuidv4(),
        role: 'user',
        content: userContent.trim(),
        timestamp: Date.now(),
      };

      // Build updated messages list including new user message
      const updatedMessages = [...chat.messages, userMsg];

      // Optimistically update chat with user message
      const updatedChat: Chat = {
        ...chat,
        messages: updatedMessages,
        title:
          chat.messages.length === 0
            ? autoTitle(updatedMessages)
            : chat.title,
        updatedAt: Date.now(),
      };

      const newChats = chats.map((c) =>
        c.id === chat.id ? updatedChat : c
      );
      onChatsUpdate(newChats);
      saveChats(newChats);

      setIsStreaming(true);
      setStreamingContent('');

      try {
        const client = getClient(settings);
        const systemPrompt = getSystemPrompt(chat.presetId);

        const apiMessages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemPrompt },
          ...updatedMessages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role, content: m.content })),
        ];

        let fullResponse = '';

        if (settings.streamEnabled) {
          const stream = await client.chat.completions.create({
            model: settings.model,
            messages: apiMessages as Parameters<
              typeof client.chat.completions.create
            >[0]['messages'],
            stream: true,
          });

          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            fullResponse += delta;
            setStreamingContent(fullResponse);
          }
        } else {
          const resp = await client.chat.completions.create({
            model: settings.model,
            messages: apiMessages as Parameters<
              typeof client.chat.completions.create
            >[0]['messages'],
            stream: false,
          });
          fullResponse = resp.choices[0]?.message?.content ?? '';
          setStreamingContent(fullResponse);
        }

        const assistantMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        };

        const finalMessages = [...updatedMessages, assistantMsg];
        const finalChat: Chat = {
          ...updatedChat,
          messages: finalMessages,
          updatedAt: Date.now(),
        };

        const finalChats = chats.map((c) =>
          c.id === chat.id ? finalChat : c
        );
        onChatsUpdate(finalChats);
        saveChats(finalChats);

        // Async memory update (non-blocking)
        updateMemory(finalMessages);
      } catch (err) {
        const errMsg: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `⚠️ Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: Date.now(),
        };
        const errMessages = [...updatedMessages, errMsg];
        const errChat: Chat = {
          ...updatedChat,
          messages: errMessages,
          updatedAt: Date.now(),
        };
        const errChats = chats.map((c) =>
          c.id === chat.id ? errChat : c
        );
        onChatsUpdate(errChats);
        saveChats(errChats);
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
      }
    },
    [
      chat,
      chats,
      settings,
      isStreaming,
      getSystemPrompt,
      onChatsUpdate,
      updateMemory,
    ]
  );

  return { isStreaming, streamingContent, sendMessage };
}
