import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import hcl from 'react-syntax-highlighter/dist/esm/languages/prism/hcl'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'

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

type Props = {
  content: string
  color?: string
}

export default function InterviewMarkdown({ content, color = '#e2e8f0' }: Props) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
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
                borderRadius: 4,
                padding: '0.1rem 0.35rem',
                color: '#7dd3fc',
                fontSize: '0.85em',
              }} {...props}>
                {children}
              </code>
            )
          }

          return (
            <div style={{ margin: '0.65rem 0', border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                background: '#1e293b',
                borderBottom: '1px solid #334155',
                color: '#94a3b8',
                fontSize: '0.72rem',
                padding: '0.28rem 0.55rem',
                textTransform: 'lowercase',
                letterSpacing: '0.04em',
                fontFamily: 'monospace',
              }}>
                {lang || 'text'}
              </div>
              <SyntaxHighlighter
                language={lang || 'text'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: '0.81rem',
                  lineHeight: 1.55,
                  padding: '0.85rem',
                }}
                wrapLongLines={false}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          )
        },
        p: ({ children }) => (
          <p style={{ margin: '0.4rem 0', color }}>{children}</p>
        ),
        ul: ({ children }) => (
          <ul style={{ margin: '0.35rem 0', paddingLeft: '1.2rem', color }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol style={{ margin: '0.35rem 0', paddingLeft: '1.2rem', color }}>{children}</ol>
        ),
        li: ({ children }) => (
          <li style={{ margin: '0.15rem 0' }}>{children}</li>
        ),
        strong: ({ children }) => (
          <strong style={{ color: '#f8fafc' }}>{children}</strong>
        ),
      }}
    >
      {content}
    </Markdown>
  )
}
