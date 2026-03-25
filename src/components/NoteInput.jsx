import { Plus } from 'lucide-react'
import { themeConfig } from '../config/theme'

const NoteInput = ({ onCreateNote }) => {
  // Handle creating a new note - opens directly in Tiptap editor
  const handleCreateNote = async () => {
    try {
      await onCreateNote('', '')
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  return (
    <div
      onClick={handleCreateNote}
      className="rounded-2xl shadow-sm hover:shadow-md border p-3 sm:p-4 cursor-text flex items-center gap-3 transition-all duration-200 w-full max-w-2xl mx-auto"
      style={{
        backgroundColor: themeConfig.background.note,
        borderColor: themeConfig.border.default,
        color: themeConfig.text.primary,
      }}
    >
      <Plus className="w-5 h-5 flex-shrink-0" style={{ color: themeConfig.text.secondary }} />
      <span className="text-sm sm:text-base" style={{ color: themeConfig.text.secondary }}>Take a note...</span>
    </div>
  )
}

export default NoteInput
