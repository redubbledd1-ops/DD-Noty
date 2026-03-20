import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useNotes } from '../hooks/useNotes'
import SortableNoteCard from '../components/SortableNoteCard'
import NoteInput from '../components/NoteInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { StickyNote, Pin } from 'lucide-react'

const Home = () => {
  const { notes, setNotes, loading, error, createNote, updateNote, deleteNote, reorderNotes } = useNotes()

  // Split notes into favorites and others
  const favorites = notes.filter((n) => n.isFavorite)
  const others = notes.filter((n) => !n.isFavorite)

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle creating a new note
  const handleCreateNote = async (title, content) => {
    await createNote(title, content)
  }

  // Handle deleting a note
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId)
    }
  }

  // Handle resize end - update layout only after mouse up (keeps position stable)
  const handleResizeEnd = async (noteId, w, h) => {
    // Optimistic update for instant feedback
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId ? { ...note, w, h } : note
      )
    )
    
    // Persist to database
    try {
      await updateNote(noteId, { w, h })
    } catch (err) {
      console.error('Error resizing note:', err)
    }
  }

  // Handle drag end - reorder notes within same section
  const handleDragEnd = async (event, isFavoriteSection) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const sectionNotes = isFavoriteSection ? favorites : others
      const oldIndex = sectionNotes.findIndex((note) => note.id === active.id)
      const newIndex = sectionNotes.findIndex((note) => note.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      // Optimistically update local state
      const reorderedSection = arrayMove(sectionNotes, oldIndex, newIndex)
      const newNotes = isFavoriteSection 
        ? [...reorderedSection, ...others]
        : [...favorites, ...reorderedSection]
      setNotes(newNotes)

      // Persist to database
      try {
        await reorderNotes(reorderedSection)
      } catch (err) {
        console.error('Error reordering notes:', err)
      }
    }
  }

  // Grid class for notes - 8 columns so col-span-1 is much smaller
  const gridClass = "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-[120px]"

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
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Note input */}
      <div className="mb-8">
        <NoteInput onCreateNote={handleCreateNote} />
      </div>

      {/* Notes */}
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
        <>
          {/* Pinned/Favorites section */}
          {favorites.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Pinned
                </h2>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, true)}
              >
                <SortableContext
                  items={favorites.map((note) => note.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className={gridClass}>
                    {favorites.map((note) => (
                      <SortableNoteCard
                        key={note.id}
                        note={note}
                        onDelete={handleDeleteNote}
                        onResizeEnd={handleResizeEnd}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Other notes section */}
          {others.length > 0 && (
            <div>
              {favorites.length > 0 && (
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Others
                </h2>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, false)}
              >
                <SortableContext
                  items={others.map((note) => note.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className={gridClass}>
                    {others.map((note) => (
                      <SortableNoteCard
                        key={note.id}
                        note={note}
                        onDelete={handleDeleteNote}
                        onResizeEnd={handleResizeEnd}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Home
