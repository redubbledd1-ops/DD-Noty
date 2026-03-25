import { List, ListOrdered, CheckSquare, Bold, Italic, Underline } from 'lucide-react'

const TiptapToolbar = ({ editor }) => {
  if (!editor) {
    return null
  }

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run()
  }

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run()
  }

  const toggleTaskList = () => {
    editor.chain().focus().toggleTaskList().run()
  }

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run()
  }

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run()
  }

  const toggleUnderline = () => {
    editor.chain().focus().toggleUnderline().run()
  }

  const isActive = (name) => {
    return editor.isActive(name)
  }

  return (
    <div className="toolbar">
      <button
        onClick={toggleBold}
        className={`toolbar-btn ${isActive('bold') ? 'active' : ''}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={18} />
      </button>

      <button
        onClick={toggleItalic}
        className={`toolbar-btn ${isActive('italic') ? 'active' : ''}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={18} />
      </button>

      <button
        onClick={toggleUnderline}
        className={`toolbar-btn ${isActive('underline') ? 'active' : ''}`}
        title="Underline (Ctrl+U)"
      >
        <Underline size={18} />
      </button>

      <div className="toolbar-divider"></div>

      <button
        onClick={toggleBulletList}
        className={`toolbar-btn ${isActive('bulletList') ? 'active' : ''}`}
        title="Bullet List"
      >
        <List size={18} />
      </button>

      <button
        onClick={toggleOrderedList}
        className={`toolbar-btn ${isActive('orderedList') ? 'active' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>

      <button
        onClick={toggleTaskList}
        className={`toolbar-btn ${isActive('taskList') ? 'active' : ''}`}
        title="Checkbox List"
      >
        <CheckSquare size={18} />
      </button>
    </div>
  )
}

export default TiptapToolbar
