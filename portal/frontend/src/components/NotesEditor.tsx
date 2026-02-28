import { useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { upsertNote } from '../api/notes.api'

interface NotesEditorProps {
  unit: string
  exercise: string
  initialContent: string
}

export default function NotesEditor({ unit, exercise, initialContent }: NotesEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      upsertNote(unit, exercise, value).catch(console.error)
    }, 1000)
  }

  return (
    <CodeMirror
      value={initialContent}
      extensions={[markdown()]}
      onChange={handleChange}
      theme="dark"
      style={{ height: '100%', fontSize: '0.875rem' }}
      basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
    />
  )
}
