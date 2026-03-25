import { useState, useRef, useEffect } from 'react'
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
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useNotes } from '../hooks/useNotes'
import { useCategories } from '../hooks/useCategories'
import SortableNoteCard from '../components/SortableNoteCard'
import NoteInput from '../components/NoteInput'
import LoadingSpinner from '../components/LoadingSpinner'
import SelectionToolbar from '../components/SelectionToolbar'
import { StickyNote, Pin } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { notes, setNotes, loading, error, createNote, updateNote, deleteNote, reorderNotes } = useNotes()
  const { categories } = useCategories()
  
  // Multi-select state
  const [selectedNotes, setSelectedNotes] = useState(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const longPressTimerRef = useRef(null)
  const longPressDurationRef = useRef(500) // 500ms for long press

  // Read category filter from URL
  useEffect(() => {
    const categoryId = searchParams.get('category')
    setSelectedCategoryId(categoryId)
  }, [searchParams])

  // Filter notes by category if selected
  const filteredNotes = selectedCategoryId
    ? notes.filter(n => n.categories && n.categories.includes(selectedCategoryId))
    : notes

  // Split notes into favorites and others
  const favorites = filteredNotes.filter((n) => n.isFavorite)
  const others = filteredNotes.filter((n) => !n.isFavorite)

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
    try {
      const newNoteId = await createNote(title, content)
      // Navigate directly to the new note in editor
      navigate(`/note/${newNoteId}`)
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  // Handle deleting a note
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId)
    }
  }

  // Handle resize end - update layout only after mouse up (keeps position stable)
  const handleResizeEnd = async (noteId, w, h) => {
    // Persist to database first
    try {
      await updateNote(noteId, { w, h })
    } catch (err) {
      console.error('Error resizing note:', err)
    }
  }

  // Track if long press was triggered
  const longPressTriggeredRef = useRef(false)

  // Handle long press on note card
  const handleNoteMouseDown = (noteId) => {
    longPressTriggeredRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      setIsSelectionMode(true)
      setSelectedNotes(new Set([noteId]))
    }, longPressDurationRef.current)
  }

  // Handle mouse up - only clear timer, don't exit selection mode
  const handleNoteMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Handle note click - in selection mode, toggle selection; otherwise open note
  const handleNoteClick = (noteId) => {
    // If long press just triggered, don't do anything
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }
    
    if (isSelectionMode) {
      // Toggle selection
      const newSelected = new Set(selectedNotes)
      if (newSelected.has(noteId)) {
        newSelected.delete(noteId)
      } else {
        newSelected.add(noteId)
      }
      setSelectedNotes(newSelected)
    } else {
      // Open note
      navigate(`/note/${noteId}`)
    }
  }

  // Toggle note selection (for checkbox click)
  const toggleNoteSelection = (noteId) => {
    const newSelected = new Set(selectedNotes)
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId)
    } else {
      newSelected.add(noteId)
    }
    setSelectedNotes(newSelected)
  }

  // Delete selected notes
  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedNotes.size} note(s)?`)) return
    
    for (const noteId of selectedNotes) {
      await deleteNote(noteId)
    }
    setSelectedNotes(new Set())
    setIsSelectionMode(false)
  }

  // Add or remove selected notes from category
  const handleAddToCategory = async (categoryId, isRemove = false) => {
    for (const noteId of selectedNotes) {
      const note = notes.find(n => n.id === noteId)
      const currentCategories = note.categories || []
      
      if (isRemove) {
        // Remove from category
        const updatedCategories = currentCategories.filter(id => id !== categoryId)
        await updateNote(noteId, { categories: updatedCategories })
      } else {
        // Add to category
        if (!currentCategories.includes(categoryId)) {
          currentCategories.push(categoryId)
          await updateNote(noteId, { categories: currentCategories })
        }
      }
    }
    // Keep selection mode active - don't close
  }

  // Close selection mode
  const handleCloseSelection = () => {
    setSelectedNotes(new Set())
    setIsSelectionMode(false)
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

  // Grid class for notes - responsive columns with better mobile layout
  const gridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 auto-rows-[100px] sm:auto-rows-[120px]"

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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
      {/* Note input */}
      <div className="mb-6 sm:mb-8">
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
                        isSelected={selectedNotes.has(note.id)}
                        onMouseDown={handleNoteMouseDown}
                        onMouseUp={handleNoteMouseUp}
                        onNoteClick={handleNoteClick}
                        isSelectionMode={isSelectionMode}
                        categories={categories}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Other notes section */}
          {others.length > 0 && (
            <div className={isSelectionMode ? 'pb-24' : ''}>
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
                        isSelected={selectedNotes.has(note.id)}
                        onMouseDown={handleNoteMouseDown}
                        onMouseUp={handleNoteMouseUp}
                        onNoteClick={handleNoteClick}
                        isSelectionMode={isSelectionMode}
                        categories={categories}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Selection toolbar */}
          {isSelectionMode && (
            <SelectionToolbar
              selectedCount={selectedNotes.size}
              onAddToCategory={handleAddToCategory}
              onDeleteSelected={handleDeleteSelected}
              categories={categories}
              onClose={handleCloseSelection}
              selectedNotes={selectedNotes}
              notes={notes}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Home
