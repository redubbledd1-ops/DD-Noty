import { useState, useEffect } from 'react'
import { X, Bell, BellOff } from 'lucide-react'

const NoteEditor = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [reminder, setReminder] = useState('')
  const [showReminder, setShowReminder] = useState(false)
  const [saving, setSaving] = useState(false)

  // Populate form when editing existing note
  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      if (note.reminder) {
        // Format date for datetime-local input
        const date = new Date(note.reminder)
        const formatted = date.toISOString().slice(0, 16)
        setReminder(formatted)
        setShowReminder(true)
      }
    }
  }, [note])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate that at least title or content is provided
    if (!title.trim() && !content.trim()) {
      return
    }

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        reminder: showReminder && reminder ? reminder : null,
      })
      onClose()
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSaving(false)
    }
  }

  // Get minimum datetime for reminder (now)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title input */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-gray-800 dark:text-white placeholder-gray-400 text-lg font-medium"
            autoFocus
          />

          {/* Content textarea */}
          <textarea
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg focus:border-amber-500 dark:focus:border-amber-400 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 resize-none"
          />

          {/* Reminder section */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowReminder(!showReminder)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showReminder
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {showReminder ? (
                <>
                  <BellOff className="w-4 h-4" />
                  Remove reminder
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Add reminder
                </>
              )}
            </button>

            {showReminder && (
              <input
                type="datetime-local"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                min={getMinDateTime()}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 outline-none focus:border-amber-500"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!title.trim() && !content.trim())}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : note ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NoteEditor
