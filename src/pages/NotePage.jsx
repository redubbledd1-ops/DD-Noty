import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { themeConfig } from '../config/theme'
import TiptapEditorComplete from '../components/TiptapEditorComplete'
import LoadingSpinner from '../components/LoadingSpinner'
import { useCategories } from '../hooks/useCategories'
import { Trash2, Star, Tag } from 'lucide-react'

const NotePage = () => {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { categories } = useCategories()
  const editorRef = useRef(null)

  // Single source of truth for content
  const [noteContent, setNoteContent] = useState(null)
  const [title, setTitle] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [noteCategories, setNoteCategories] = useState([])
  const [noteWidth, setNoteWidth] = useState('normal')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [shortId, setShortId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const isMouseDownInsideEditorRef = useRef(false)
  const isInitialLoadRef = useRef(true)  // Track initial load to prevent auto-save overwriting

  // Calculate optimal note size based on content
  const calculateNoteSize = (title, content) => {
    let lines = 0
    let maxLineLength = 0
    
    // Count title
    if (title && title.trim()) {
      lines = 1
      maxLineLength = title.length
    }
    
    // Process ProseMirror JSON content
    if (content && content.content && Array.isArray(content.content)) {
      content.content.forEach(node => {
        if (node.type === 'paragraph' || node.type === 'heading') {
          lines++
          let lineText = ''
          if (node.content) {
            node.content.forEach(n => {
              if (n.text) lineText += n.text
            })
          }
          maxLineLength = Math.max(maxLineLength, lineText.length)
        } else if (node.type === 'bulletList' || node.type === 'orderedList' || node.type === 'taskList') {
          if (node.content) {
            node.content.forEach(item => {
              lines++
              let lineText = ''
              if (item.content) {
                item.content.forEach(n => {
                  if (n.type === 'paragraph' && n.content) {
                    n.content.forEach(c => {
                      if (c.text) lineText += c.text
                    })
                  } else if (n.text) {
                    lineText += n.text
                  }
                })
              }
              maxLineLength = Math.max(maxLineLength, lineText.length)
            })
          }
        }
      })
    }

    // Ensure at least 1 line
    if (lines === 0 && maxLineLength > 0) lines = 1

    // WIDTH based on longest line: >60=4, >40=3, >20=2, else=1
    let w = 1
    if (maxLineLength > 60) w = 4
    else if (maxLineLength > 40) w = 3
    else if (maxLineLength > 20) w = 2

    // HEIGHT based on lines: >10=4, >6=3, >3=2, else=1
    let h = 1
    if (lines > 10) h = 4
    else if (lines > 6) h = 3
    else if (lines > 3) h = 2

    return { w: Math.max(1, w), h: Math.max(1, h) }
  }

  // Save note to localStorage
  const saveNote = (id, updates) => {
    try {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]')
      const note = notes.find(n => n.id === id)
      
      // Calculate new size based on content
      const newTitle = updates.title !== undefined ? updates.title : (note?.title || '')
      const newContent = updates.content !== undefined ? updates.content : (note?.content || null)
      const { w, h } = calculateNoteSize(newTitle, newContent)
      
      const updated = notes.map(n =>
        n.id === id ? { ...n, ...updates, w, h, updatedAt: new Date().toISOString() } : n
      )
      localStorage.setItem('notes', JSON.stringify(updated))
    } catch (err) {
      console.error('Error saving note to localStorage:', err)
    }
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Load note from localStorage
  useEffect(() => {
    if (!noteId) {
      setLoading(false)
      return
    }

    try {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]')
      const note = notes.find(n => n.id === noteId)

      if (!note) {
        console.warn('Note not found:', noteId)
        setLoading(false)
        return
      }

      // Load note data (content is always JSON object, never string)
      setTitle(note.title || '')
      setNoteContent(note.content || null)
      setIsFavorite(note.isFavorite || false)
      setNoteCategories(note.categories || [])
      setNoteWidth(note.width || 'normal')
      setShortId(note.shortId || null)
      setUpdatedAt(note.updatedAt ? new Date(note.updatedAt) : null)
    } catch (err) {
      console.error('Error loading note from localStorage:', err)
    } finally {
      setLoading(false)
    }
  }, [noteId])

  // Auto-save when content or title changes (but NOT on initial load)
  useEffect(() => {
    if (!noteId) return
    
    // Skip auto-save on initial load to prevent overwriting loaded content
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }

    saveNote(noteId, { title, content: noteContent })
  }, [noteContent, title, noteId])

  // Save note and close
  const handleSaveAndClose = () => {
    // Check if note is empty (no title and no content)
    const isEmpty = !title && (!noteContent || (noteContent.content && noteContent.content.length === 0))
    
    if (isEmpty) {
      // Delete empty note
      const notes = JSON.parse(localStorage.getItem('notes') || '[]')
      const filtered = notes.filter(n => n.id !== noteId)
      localStorage.setItem('notes', JSON.stringify(filtered))
    } else {
      // Save non-empty note
      saveNote(noteId, { title, content: noteContent })
    }
    navigate('/')
  }

  // Toggle favorite
  const toggleFavorite = () => {
    const newFavorite = !isFavorite
    setIsFavorite(newFavorite)
    // Save to localStorage immediately
    saveNote(noteId, { isFavorite: newFavorite })
  }

  // Toggle category
  const toggleCategory = (categoryId) => {
    const newCategories = noteCategories.includes(categoryId)
      ? noteCategories.filter(id => id !== categoryId)
      : [...noteCategories, categoryId]
    setNoteCategories(newCategories)
    // Save to localStorage immediately
    saveNote(noteId, { categories: newCategories })
  }

  // Toggle note width (normal ↔ wide)
  const toggleNoteWidth = () => {
    setNoteWidth(noteWidth === 'normal' ? 'wide' : 'normal')
  }

  // Get width class based on noteWidth state
  const getWidthClass = () => {
    switch (noteWidth) {
      case 'wide':
        return 'w-[80vw]'
      case 'normal':
      default:
        return 'max-w-[900px]'
    }
  }

  // Delete note
  const handleDelete = async () => {
    if (!user || !noteId) return
    if (!window.confirm('Are you sure you want to delete this note?')) return

    try {
      const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
      await deleteDoc(noteRef)
      navigate('/')
    } catch (err) {
      console.error('Error deleting note:', err)
      setError('Failed to delete note')
    }
  }

  // Handle click outside editor to save and close
  const handleBackdropClick = (e) => {
    // Only close if mouse wasn't pressed down inside editor
    if (!isMouseDownInsideEditorRef.current && editorRef.current && !editorRef.current.contains(e.target)) {
      handleSaveAndClose()
    }
  }

  // Track mouse down inside editor
  const handleEditorMouseDown = () => {
    isMouseDownInsideEditorRef.current = true
  }

  // Track mouse up globally
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setTimeout(() => {
        isMouseDownInsideEditorRef.current = false
      }, 0)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Safe check: ensure we have valid noteId before rendering editor
  if (!noteId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No note selected</p>
        </div>
      </div>
    )
  }

  // Check if note exists in localStorage
  const noteExists = (() => {
    try {
      const notes = JSON.parse(localStorage.getItem('notes') || '[]')
      return notes.some(n => n.id === noteId)
    } catch {
      return false
    }
  })()

  if (!noteExists) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Note not found</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-4 sm:pt-12 px-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      {/* Note editor card - responsive width with dynamic width setting */}
      <div 
        ref={editorRef}
        className={`rounded-2xl shadow-xl ${noteWidth === 'wide' ? 'w-[80vw]' : 'w-[95%] sm:w-[90%] lg:w-[80%] max-w-[900px]'} mb-4 sm:mb-12 max-h-[90vh] sm:max-h-none flex flex-col transition-all duration-300`}
        style={{
          backgroundColor: themeConfig.background.note,
          borderColor: themeConfig.border.default,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleEditorMouseDown}
      >
        {/* Header with note ID and action buttons */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border.default }}>
          <div className="text-xs opacity-60 font-mono" style={{ color: themeConfig.text.secondary }}>
            #{shortId || '?'}
          </div>
          
          {/* Top right action buttons */}
          <div className="flex items-center gap-2">
            {/* Width toggle button - desktop only */}
            <button
              onClick={toggleNoteWidth}
              className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors items-center justify-center"
              aria-label="Toggle note width"
              title={`Width: ${noteWidth} (click to change)`}
            >
              <span className="text-lg">⬌</span>
            </button>

            {/* Favorite toggle */}
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-amber-100 dark:bg-amber-900/30' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star 
                className={`w-5 h-5 ${
                  isFavorite 
                    ? 'text-amber-500 fill-amber-500' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} 
              />
            </button>

            {/* Categories dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Manage categories"
                title="Manage categories"
              >
                <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Category dropdown menu */}
              {showCategoryDropdown && (
                <div 
                  className="absolute top-full right-0 mt-2 min-w-[200px] rounded-lg shadow-lg border overflow-hidden z-50"
                  style={{ 
                    backgroundColor: themeConfig.background.note,
                    borderColor: themeConfig.border.default
                  }}
                >
                  {categories.length === 0 ? (
                    <div className="p-3 text-sm" style={{ color: themeConfig.text.secondary }}>
                      No categories yet
                    </div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                        style={{ color: themeConfig.text.primary }}
                      >
                        <input
                          type="checkbox"
                          checked={noteCategories.includes(category.id)}
                          onChange={() => {}}
                          className="w-4 h-4"
                          style={{ accentColor: category.color }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              aria-label="Delete note"
              title="Delete note"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Editor content */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 flex-1 overflow-y-auto flex flex-col">
          {/* Title input */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent outline-none placeholder-gray-400 text-xl sm:text-2xl font-semibold mb-4 sm:mb-6"
            style={{ color: themeConfig.text.primary }}
          />

          {/* Tiptap Editor with padding */}
          <div className="flex-1 flex flex-col">
            <TiptapEditorComplete
              key={noteId}
              content={noteContent}
              onChange={setNoteContent}
              autoFocus={true}
              theme={{
                textColor: themeConfig.text.primary,
                bgColor: themeConfig.background.note,
                borderColor: themeConfig.border.default,
              }}
            />
          </div>
        </div>

        {/* Footer with date and close button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 border-t flex-shrink-0" style={{ borderColor: themeConfig.border.default }}>
          {/* Updated date - bottom left */}
          <span className="text-xs order-2 sm:order-1" style={{ color: themeConfig.text.secondary }}>
            {updatedAt ? `Edited ${formatDate(updatedAt)}` : ''}
          </span>

          {/* Close button (saves and closes) */}
          <button
            onClick={handleSaveAndClose}
            className="w-full sm:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors order-1 sm:order-2"
          >
            Sluiten
          </button>
        </div>
      </div>

    </div>
  )
}

export default NotePage
