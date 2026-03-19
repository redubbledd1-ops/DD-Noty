import { Trash2, Edit2, Bell, Clock } from 'lucide-react'

const NoteCard = ({ note, onEdit, onDelete }) => {
  // Format date for display
  const formatDate = (date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Check if reminder is in the past
  const isReminderPast = note.reminder && new Date(note.reminder) < new Date()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col group border border-gray-200 dark:border-gray-700">
      {/* Note title */}
      {note.title && (
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {note.title}
        </h3>
      )}

      {/* Note content */}
      <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow whitespace-pre-wrap line-clamp-6">
        {note.content}
      </p>

      {/* Reminder badge */}
      {note.reminder && (
        <div
          className={`flex items-center gap-1 mt-3 text-xs px-2 py-1 rounded-full w-fit ${
            isReminderPast
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
          }`}
        >
          <Bell className="w-3 h-3" />
          <span>{formatDate(note.reminder)}</span>
        </div>
      )}

      {/* Footer with date and actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {/* Created date */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{formatDate(note.createdAt)}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Edit note"
          >
            <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            aria-label="Delete note"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoteCard
