import Markdown from 'react-markdown'

interface ContentViewerProps {
  content: string
}

export default function ContentViewer({ content }: ContentViewerProps) {
  return (
    <div style={{
      padding: '1.5rem',
      height: '100%',
      overflow: 'auto',
      lineHeight: 1.75,
      color: '#e2e8f0',
    }}>
      <Markdown>{content}</Markdown>
    </div>
  )
}
