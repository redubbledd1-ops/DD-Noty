import { useState } from 'react'
import { Plus } from 'lucide-react'

const NoteInput = ({ onCreateNote }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // Handle creating a quick note
  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) {
      setIsExpanded(false)
      return
    }

    try {
      await onCreateNote(title.trim(), content.trim())
      setTitle('')
      setContent('')
      setIsExpanded(false)
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  // Handle blur - save if there's content
  const handleBlur = (e) => {
    // Don't close if clicking within the input area
    if (e.currentTarget.contains(e.relatedTarget)) {
      return
    }
    handleSubmit()
  }

  if (!isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 p-3 sm:p-4 cursor-text flex items-center gap-3 transition-all duration-200 w-full max-w-2xl mx-auto"
        style={{ color: 'var(--text-color)', backgroundColor: 'var(--note-bg)' }}
      >
        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Take a note...</span>
      </div>
    )
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-3 sm:p-4 w-full max-w-2xl mx-auto transition-all duration-200"
      onBlur={handleBlur}
      style={{ backgroundColor: 'var(--note-bg)' }}
    >
      {/* Title input */}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 font-medium mb-2 text-base sm:text-lg"
        style={{ color: 'var(--text-color)' }}
        autoFocus
      />

      {/* Content textarea */}
      <textarea
        placeholder="Take a note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 resize-none text-sm sm:text-base"
        style={{ color: 'var(--text-color)' }}
      />

      {/* Actions */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default NoteInput
