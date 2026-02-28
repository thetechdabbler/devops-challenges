import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Register only the languages used in DevOps exercises
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import hcl from 'react-syntax-highlighter/dist/esm/languages/prism/hcl'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini'

SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('sh', bash)
SyntaxHighlighter.registerLanguage('shell', bash)
SyntaxHighlighter.registerLanguage('yaml', yaml)
SyntaxHighlighter.registerLanguage('yml', yaml)
SyntaxHighlighter.registerLanguage('dockerfile', docker)
SyntaxHighlighter.registerLanguage('docker', docker)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('js', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('ts', typescript)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('py', python)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('hcl', hcl)
SyntaxHighlighter.registerLanguage('terraform', hcl)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('go', go)
SyntaxHighlighter.registerLanguage('ini', ini)
SyntaxHighlighter.registerLanguage('toml', ini)

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={handleCopy} style={{
      position: 'absolute', top: '0.5rem', right: '0.5rem',
      background: copied ? '#22c55e22' : '#ffffff11',
      border: `1px solid ${copied ? '#22c55e55' : '#ffffff22'}`,
      borderRadius: 4, color: copied ? '#22c55e' : '#94a3b8',
      fontSize: '0.7rem', padding: '0.2rem 0.5rem', cursor: 'pointer',
      transition: 'all 0.15s',
    }}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}

interface ContentViewerProps {
  content: string
}

export default function ContentViewer({ content }: ContentViewerProps) {
  return (
    <div style={{
      padding: '1.5rem 2rem',
      height: '100%',
      overflow: 'auto',
      lineHeight: 1.8,
      color: '#e2e8f0',
      fontSize: '0.9rem',
    }}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '')
            const lang = match?.[1] ?? ''
            const code = String(children).replace(/\n$/, '')
            const isBlock = code.includes('\n') || !!match

            if (!isBlock) {
              return (
                <code style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 3,
                  padding: '0.15em 0.4em',
                  fontSize: '0.85em',
                  color: '#7dd3fc',
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                }} {...props}>
                  {children}
                </code>
              )
            }

            return (
              <div style={{ position: 'relative', margin: '1.25rem 0' }}>
                {/* Header bar */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: '#1e293b',
                  borderRadius: '6px 6px 0 0',
                  border: '1px solid #334155',
                  borderBottom: 'none',
                  padding: '0.3rem 0.75rem',
                  gap: '0.5rem',
                }}>
                  <span style={{
                    fontSize: '0.7rem', color: '#64748b',
                    fontFamily: 'monospace', textTransform: 'lowercase',
                    letterSpacing: '0.05em',
                  }}>
                    {lang || 'text'}
                  </span>
                </div>
                {/* Syntax highlighted block */}
                <div style={{ position: 'relative' }}>
                  <SyntaxHighlighter
                    language={lang || 'text'}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: '0 0 6px 6px',
                      border: '1px solid #334155',
                      fontSize: '0.82rem',
                      lineHeight: 1.6,
                      padding: '1rem 1rem 1rem 0',
                    }}
                    showLineNumbers
                    lineNumberStyle={{
                      minWidth: '2.5em',
                      paddingRight: '1em',
                      color: '#4a5568',
                      userSelect: 'none',
                      borderRight: '1px solid #2d3748',
                      marginRight: '1em',
                    }}
                    wrapLongLines={false}
                  >
                    {code}
                  </SyntaxHighlighter>
                  <CopyButton code={code} />
                </div>
              </div>
            )
          },

          // Headings
          h1: ({ children }) => (
            <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ color: '#38bdf8', fontSize: '1.15rem', fontWeight: 700, margin: '1.75rem 0 0.75rem' }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: 600, margin: '1.25rem 0 0.5rem' }}>{children}</h3>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p style={{ margin: '0.6rem 0', color: '#cbd5e1' }}>{children}</p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: '#cbd5e1' }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: '#cbd5e1' }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: '0.2rem 0' }}>{children}</li>
          ),

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: '3px solid #38bdf8', margin: '1rem 0',
              paddingLeft: '1rem', color: '#94a3b8', fontStyle: 'italic',
            }}>
              {children}
            </blockquote>
          ),

          // Strong / em
          strong: ({ children }) => (
            <strong style={{ color: '#f1f5f9', fontWeight: 600 }}>{children}</strong>
          ),

          // Horizontal rule
          hr: () => (
            <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '1.5rem 0' }} />
          ),

          // Links
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
              {children}
            </a>
          ),

          // Tables (GFM)
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th style={{ background: '#1e293b', border: '1px solid #334155', padding: '0.4rem 0.75rem', color: '#94a3b8', fontWeight: 600, textAlign: 'left' }}>{children}</th>
          ),
          td: ({ children }) => (
            <td style={{ border: '1px solid #334155', padding: '0.4rem 0.75rem', color: '#cbd5e1' }}>{children}</td>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}
