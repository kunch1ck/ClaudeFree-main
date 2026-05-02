import { useEffect } from 'react';
import type { Memory } from '../types';
import { saveMemory } from '../store';

interface MemoryModalProps {
  memory: Memory;
  onClose: () => void;
  onUpdate: (memory: Memory) => void;
}

export function MemoryModal({ memory, onClose, onUpdate }: MemoryModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleClear = () => {
    const cleared: Memory = { summary: '', updatedAt: Date.now() };
    saveMemory(cleared);
    onUpdate(cleared);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h2 className="text-sm font-semibold text-gray-100">Cross-Chat Memory</h2>
            {memory.updatedAt > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                Updated {new Date(memory.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/8 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-gray-500 mb-3">
            This summary is automatically extracted from your conversations and injected into every new chat's system prompt, so the AI can recall context from previous sessions.
          </p>
          <div className="bg-[#13141c] border border-white/10 rounded-xl px-4 py-3 min-h-[100px]">
            {memory.summary ? (
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {memory.summary}
              </p>
            ) : (
              <p className="text-sm text-gray-600 italic">
                No memory yet. Start chatting and the AI will automatically extract key facts to remember.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-white/8">
          <button
            onClick={handleClear}
            disabled={!memory.summary}
            className="px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Clear Memory
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
