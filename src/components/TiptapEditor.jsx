import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect, useRef } from 'react'

const TiptapEditor = ({ content, onChange, onSave, theme }) => {
  const contentLoadedRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: false,
        codeBlock: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      TaskList.configure({
        nested: false,
      }),
      TaskItem.configure({
        nested: false,
      }),
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (onChange) {
        onChange(html)
      }
    },
    onBlur: () => {
      if (onSave) {
        onSave()
      }
    },
  })

  // Load content when component mounts or content prop changes
  useEffect(() => {
    if (editor && content && !contentLoadedRef.current) {
      contentLoadedRef.current = true
      editor.commands.setContent(content)
    }
  }, [editor, content])

  if (!editor) {
    return <div className="editor-loading">Loading editor...</div>
  }

  return (
    <div className="tiptap-editor-wrapper">
      <EditorContent 
        editor={editor} 
        className="tiptap-editor"
        style={{
          color: theme?.textColor || '#000',
          fontSize: '16px',
          lineHeight: '1.6',
          minHeight: '400px',
          padding: '16px',
          outline: 'none',
        }}
      />
    </div>
  )
}

export default TiptapEditor
