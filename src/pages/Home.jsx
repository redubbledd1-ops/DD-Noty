import { useState } from 'react'
import { useNotes } from '../hooks/useNotes'
import NoteCard from '../components/NoteCard'
import NoteInput from '../components/NoteInput'
import NoteEditor from '../components/NoteEditor'
import LoadingSpinner from '../components/LoadingSpinner'
import { StickyNote } from 'lucide-react'

const Home = () => {
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes()
  const [editingNote, setEditingNote] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  // Handle creating a new note
  const handleCreateNote = async (title, content, reminder = null) => {
    await createNote(title, content, reminder)
  }

  // Handle editing a note
  const handleEditNote = (note) => {
    setEditingNote(note)
    setShowEditor(true)
  }

  // Handle saving edited note
  const handleSaveNote = async (noteData) => {
    if (editingNote) {
      await updateNote(editingNote.id, noteData)
    } else {
      await createNote(noteData.title, noteData.content, noteData.reminder)
    }
  }

  // Handle deleting a note
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId)
    }
  }

  // Close editor modal
  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingNote(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <p className="text-red-500 dark:text-red-400 mb-2">Error loading notes</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Note input */}
      <div className="mb-8">
        <NoteInput onCreateNote={handleCreateNote} />
      </div>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <StickyNote className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
            No notes yet
          </h2>
          <p className="text-gray-400 dark:text-gray-500">
            Click above to create your first note
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      {/* Note editor modal */}
      {showEditor && (
        <NoteEditor
          note={editingNote}
          onSave={handleSaveNote}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}

export default Home
