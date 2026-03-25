import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontSize } from '../extensions/FontSize'
import { useEffect, useRef, useState } from 'react'

const TiptapEditorComplete = ({ content, onChange, onSave, theme, autoFocus }) => {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const editorRef = useRef(null)
  const isSettingContentRef = useRef(false)  // Prevent onChange during setContent
  const hasInitializedRef = useRef(false)  // Track if content was initialized

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
        heading: {
          levels: [1, 2, 3],
        },
        history: {
          depth: 100,
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      TaskList,
      TaskItem.configure({
        nested: false,
      }),
      TextStyle,
      FontSize,
    ],
    content: '',  // Start empty, load content via useEffect
    onUpdate: ({ editor }) => {
      // Don't trigger onChange during setContent or before initialization
      if (isSettingContentRef.current || !hasInitializedRef.current) return
      
      const json = editor.getJSON()
      if (onChange) {
        onChange(json)
      }
    },
    onBlur: () => {
      if (onSave) {
        onSave()
      }
    },
  })

  // Load content when it becomes available
  useEffect(() => {
    if (!editor) return
    
    // Only set content once when it first becomes available
    if (!hasInitializedRef.current) {
      if (content) {
        isSettingContentRef.current = true
        editor.commands.setContent(content)
        isSettingContentRef.current = false
      }
      hasInitializedRef.current = true
    }
  }, [content, editor])

  // Autofocus editor when component mounts
  useEffect(() => {
    if (editor && autoFocus) {
      // Delay focus slightly to ensure editor is fully rendered
      const timer = setTimeout(() => {
        editor.commands.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [editor, autoFocus])

  const handleAddLink = () => {
    if (!editor) return

    const { from, to } = editor.state.selection
    
    if (from === to) {
      alert('Please select text first')
      return
    }

    setShowLinkModal(true)
  }

  const confirmLink = () => {
    if (!editor || !linkUrl) return

    editor
      .chain()
      .focus()
      .setLink({ href: linkUrl })
      .run()

    setLinkUrl('')
    setShowLinkModal(false)
  }

  const removeLink = () => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }

  if (!editor) {
    return <div className="editor-loading">Loading editor...</div>
  }

  return (
    <div className="tiptap-complete-wrapper">
      <TiptapToolbarComplete 
        editor={editor}
        onAddLink={handleAddLink}
        onRemoveLink={removeLink}
      />
      
      <div 
        className="tiptap-editor-content-wrapper"
      >
        <EditorContent
          editor={editor}
          className="tiptap-editor-complete focus:outline-none focus:ring-0"
          style={{
            color: theme?.textColor || '#000',
            fontSize: '16px',
            lineHeight: '1.6',
            minHeight: '300px',
            padding: '0px',
            outline: 'none',
            boxShadow: 'none',
          }}
        />
      </div>

      {showLinkModal && (
        <div className="link-modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="link-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Link</h3>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') confirmLink()
              }}
              autoFocus
            />
            <div className="link-modal-buttons">
              <button onClick={confirmLink} className="btn-primary">
                Add Link
              </button>
              <button onClick={() => setShowLinkModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TiptapToolbarComplete = ({ editor, onAddLink, onRemoveLink }) => {
  if (!editor) return null

  const [fontSize, setFontSize] = useState('16px')

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']

  const handleFontSizeChange = (size) => {
    setFontSize(size)
    editor.chain().focus().setFontSize(size).run()
  }

  const isActive = (name, attrs = {}) => {
    return editor.isActive(name, attrs)
  }

  return (
    <div className="toolbar-complete">
      {/* Text Formatting */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${isActive('bold') ? 'active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${isActive('italic') ? 'active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-btn ${isActive('underline') ? 'active' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* Headings */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`toolbar-btn ${isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="Heading 1"
        >
          H1
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`toolbar-btn ${isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="Heading 2"
        >
          H2
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`toolbar-btn ${isActive('heading', { level: 3 }) ? 'active' : ''}`}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* Font Size */}
      <div className="toolbar-group">
        <select
          value={fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          className="toolbar-select"
          title="Font Size"
        >
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-divider"></div>

      {/* Lists */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        >
          ●
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${isActive('orderedList') ? 'active' : ''}`}
          title="Numbered List"
        >
          1.
        </button>

        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`toolbar-btn ${isActive('taskList') ? 'active' : ''}`}
          title="Checkbox List"
        >
          ☐
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* Link */}
      <div className="toolbar-group">
        <button
          onClick={onAddLink}
          className={`toolbar-btn ${isActive('link') ? 'active' : ''}`}
          title="Add Link"
        >
          🔗
        </button>

        {isActive('link') && (
          <button
            onClick={onRemoveLink}
            className="toolbar-btn"
            title="Remove Link"
          >
            🔗✕
          </button>
        )}
      </div>

      <div className="toolbar-divider"></div>

      {/* Undo/Redo */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="toolbar-btn"
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
        >
          ↶
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="toolbar-btn"
          title="Redo (Ctrl+Y)"
          disabled={!editor.can().redo()}
        >
          ↷
        </button>
      </div>
    </div>
  )
}

export default TiptapEditorComplete
