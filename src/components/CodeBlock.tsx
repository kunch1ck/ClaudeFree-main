import { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export function CodeBlock({ language = 'text', code }: CodeBlockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [code]);

  const lineCount = code.split('\n').length;

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#1a1b26]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16172080] border-b border-white/10">
        <span className="text-xs font-mono text-purple-400 tracking-wide">
          {language}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{lineCount} lines</span>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-0.5 rounded hover:bg-white/10"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▶ expand' : '▼ collapse'}
          </button>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-0.5 rounded hover:bg-white/10"
            title="Copy code"
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
        </div>
      </div>

      {/* Code content */}
      {!collapsed && (
        <div className="overflow-x-auto text-sm">
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '12px 16px',
              background: 'transparent',
              fontSize: '13px',
              lineHeight: '1.55',
            }}
            showLineNumbers={lineCount > 4}
            lineNumberStyle={{ color: '#4b5563', userSelect: 'none', minWidth: '2.5em' }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
