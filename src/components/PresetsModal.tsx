import { useState, useEffect } from 'react';
import type { Preset } from '../types';
import { createPreset, savePresets } from '../store';

interface PresetsModalProps {
  presets: Preset[];
  activePresetId?: string;
  onClose: () => void;
  onSave: (presets: Preset[], activeId: string) => void;
}

export function PresetsModal({
  presets,
  activePresetId,
  onClose,
  onSave,
}: PresetsModalProps) {
  const [list, setList] = useState<Preset[]>(presets);
  const [selectedId, setSelectedId] = useState<string>(
    activePresetId ?? presets[0]?.id ?? ''
  );
  const [editing, setEditing] = useState<Preset | null>(null);
  const [editForm, setEditForm] = useState({ name: '', systemPrompt: '' });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editing) setEditing(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, editing]);

  const startEdit = (preset: Preset) => {
    setEditing(preset);
    setEditForm({ name: preset.name, systemPrompt: preset.systemPrompt });
  };

  const startNew = () => {
    const p = createPreset('New Preset', '');
    setEditing(p);
    setEditForm({ name: p.name, systemPrompt: p.systemPrompt });
  };

  const saveEdit = () => {
    if (!editing) return;
    const updated: Preset = {
      ...editing,
      name: editForm.name.trim() || 'Preset',
      systemPrompt: editForm.systemPrompt,
    };
    setList((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      return exists ? prev.map((p) => (p.id === updated.id ? updated : p)) : [...prev, updated];
    });
    setEditing(null);
  };

  const deletePreset = (id: string) => {
    if (list.length <= 1) return; // keep at least one
    setList((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(list.find((p) => p.id !== id)?.id ?? '');
  };

  const handleSave = () => {
    savePresets(list);
    const finalId = list.some((p) => p.id === selectedId)
      ? selectedId
      : list[0]?.id ?? '';
    onSave(list, finalId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl animate-slide-in flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-100">
            {editing ? 'Edit Preset' : 'System Prompt Presets'}
          </h2>
          <button
            onClick={editing ? () => setEditing(null) : onClose}
            className="p-1.5 rounded-lg hover:bg-white/8 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {editing ? (
          /* Edit form */
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-[#13141c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500/60 transition-colors"
                placeholder="Preset name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">System Prompt</label>
              <textarea
                value={editForm.systemPrompt}
                onChange={(e) => setEditForm({ ...editForm, systemPrompt: e.target.value })}
                rows={8}
                className="w-full bg-[#13141c] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-brand-500/60 transition-colors resize-none leading-relaxed"
                placeholder="You are a helpful assistant…"
              />
            </div>
          </div>
        ) : (
          /* Preset list */
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {list.map((preset) => (
              <div
                key={preset.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  preset.id === selectedId
                    ? 'bg-brand-600/20 border border-brand-500/30'
                    : 'border border-transparent hover:bg-white/5'
                }`}
                onClick={() => setSelectedId(preset.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{preset.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{preset.systemPrompt.slice(0, 80)}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(preset); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {list.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-white/8 flex-shrink-0">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all active:scale-95"
              >
                Save Preset
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startNew}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Preset
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all active:scale-95"
              >
                Apply
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
