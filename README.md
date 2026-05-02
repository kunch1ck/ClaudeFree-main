# ClaudeFree

A modern, minimalistic chat interface for Claude AI (and any OpenAI-compatible API) built with **Vite + React + TypeScript + Tailwind CSS**.

## Features

- **Multiple Chats** — Create, switch between, and delete separate conversations. All chats are persisted in `localStorage`.
- **Streaming Responses** — Real-time streaming output from the AI, with a typing indicator while waiting.
- **AI Cross-Chat Memory** — After each conversation, key facts are automatically extracted and injected into every future system prompt so the AI can recall context from past sessions.
- **System Prompt Presets** — Create, edit, and switch between multiple named system prompt presets per chat.
- **Settings** — Configure Base URL, API Key, Model, and streaming toggle via a clean modal. Settings are saved to `localStorage`.
- **Markdown & Code Formatting** — Full Markdown rendering (bold, tables, lists, blockquotes) via `react-markdown`. Code blocks are syntax-highlighted with `react-syntax-highlighter` and can be **collapsed/expanded** and copied with one click.
- **Responsive Layout** — The sidebar auto-hides on mobile with a hamburger toggle, and the chat area adapts to any screen size.
- **Image Attachment (Coming Soon)** — UI placeholder for vision/image input is present but temporarily disabled.

## Getting Started

### Prerequisites

- Node.js ≥ 18
- An OpenAI-compatible API endpoint (e.g. the default `http://206.189.12.112:20128/v1`)

### Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Configure

1. Click the **Settings** (⚙) icon to open the Settings modal.
2. Enter your **Base URL** (defaults to `http://206.189.12.112:20128/v1`).
3. Enter your **API Key**.
4. Set your preferred **Model** (default: `kr/claude-sonnet-4.5`).
5. Click **Save**.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Project Structure

```
src/
├── App.tsx                 # Root component, global state
├── api.ts                  # OpenAI SDK client factory
├── store.ts                # localStorage helpers
├── types.ts                # TypeScript types & defaults
├── hooks/
│   └── useChat.ts          # Chat logic, streaming, memory extraction
└── components/
    ├── ChatArea.tsx        # Main chat panel with input
    ├── CodeBlock.tsx       # Syntax-highlighted, collapsible code blocks
    ├── MemoryModal.tsx     # Cross-chat memory viewer/editor
    ├── MessageItem.tsx     # Single message bubble with Markdown
    ├── PresetsModal.tsx    # System prompt preset manager
    ├── SettingsModal.tsx   # API settings panel
    └── Sidebar.tsx         # Chat list + navigation
```

## Roadmap / Agentic Capabilities

- [ ] Image/vision attachment support (UI ready, needs enabling)
- [ ] Kiro agent integration for richer memory and tool use
- [ ] Web search tool call support
- [ ] Export/import chat history
