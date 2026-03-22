import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Trash2, Star, Type, Link2, List, ListOrdered, CheckSquare } from 'lucide-react'

const NotePage = () => {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const editorRef = useRef(null)

  const [title, setTitle] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [shortId, setShortId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [fontSize, setFontSize] = useState(16)
  const contentRef = useRef(null)
  const savedSelectionRef = useRef(null)
  const isMouseDownInsideEditorRef = useRef(false)

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

  // Focus editor helper
  const focusEditor = () => {
    contentRef.current?.focus()
  }

  // Fetch note data on mount
  useEffect(() => {
    const fetchNote = async () => {
      if (!user || !noteId) return

      try {
        const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
        const noteSnap = await getDoc(noteRef)

        if (noteSnap.exists()) {
          const data = noteSnap.data()
          console.log('NOTE LOADED:', data)
          setTitle(data.title || '')
          setIsFavorite(data.isFavorite || false)
          setShortId(data.shortId || null)
          setUpdatedAt(data.updatedAt?.toDate?.() || null)
          // Set content in ref only - never in state
          if (contentRef.current) {
            contentRef.current.innerHTML = data.content || ''
          }
        } else {
          console.error('Note not found:', noteId)
          setError('Note not found')
        }
      } catch (err) {
        console.error('Error fetching note:', err)
        setError('Failed to load note')
      } finally {
        setLoading(false)
      }
    }

    fetchNote()
  }, [user, noteId])

  // Save note changes and close
  const handleSaveAndClose = async () => {
    if (!user || !noteId) return

    // Get content from ref, not state
    const contentValue = contentRef.current?.innerHTML || ''
    
    // Only save if there's content
    if (title.trim() || contentValue.trim()) {
      setSaving(true)
      try {
        const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
        await updateDoc(noteRef, {
          title: title.trim(),
          content: contentValue.trim(),
          isFavorite,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('Error saving note:', err)
        setError('Failed to save note')
        setSaving(false)
        return
      }
      setSaving(false)
    }
    navigate('/')
  }

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev)
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

  // Handle keyboard shortcuts for rich text formatting
  const handleContentKeyDown = (e) => {
    // Handle "- " for bullet lists
    if (e.key === ' ') {
      const sel = window.getSelection()
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        if (range.startContainer.nodeType === 3) {
          const text = range.startContainer.textContent
          const offset = range.startOffset
          
          // Check for "- " pattern
          if (offset >= 2 && text.substring(offset - 2, offset) === '- ') {
            e.preventDefault()
            
            // Delete the "- " characters
            range.setStart(range.startContainer, offset - 2)
            range.setEnd(range.startContainer, offset)
            range.deleteContents()
            
            // Apply bullet list
            contentRef.current?.focus()
            document.execCommand('insertUnorderedList')
            return
          }
          
          // Check for "1. " pattern
          if (offset >= 3 && text.substring(offset - 3, offset) === '1. ') {
            e.preventDefault()
            
            // Delete the "1. " characters
            range.setStart(range.startContainer, offset - 3)
            range.setEnd(range.startContainer, offset)
            range.deleteContents()
            
            // Apply numbered list
            contentRef.current?.focus()
            document.execCommand('insertOrderedList')
            return
          }
        }
      }
    }
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          document.execCommand('bold', false, null)
          break
        case 'i':
          e.preventDefault()
          document.execCommand('italic', false, null)
          break
        case 'u':
          e.preventDefault()
          document.execCommand('underline', false, null)
          break
        case 'z':
          if (!e.shiftKey) {
            e.preventDefault()
            document.execCommand('undo', false, null)
          }
          break
        case 'y':
          e.preventDefault()
          document.execCommand('redo', false, null)
          break
        default:
          break
      }
    }
  }

  // Save current text selection
  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0)
    }
  }

  // Restore saved text selection
  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(savedSelectionRef.current)
    }
  }

  // Apply precise font size to selected text
  const applyFontSize = (size) => {
    focusEditor()
    const selection = window.getSelection()
    if (selection.toString().length > 0) {
      const span = document.createElement('span')
      span.style.fontSize = `${size}px`
      
      const range = selection.getRangeAt(0)
      range.surroundContents(span)
      console.log('COMMAND FIRED: applyFontSize')
    }
  }

  // Apply list formatting (works with or without selection)
  const applyList = (type) => {
    contentRef.current?.focus()
    console.log('COMMAND FIRED:', type)
    if (type === 'bullet') {
      document.execCommand('insertUnorderedList')
    } else if (type === 'numbered') {
      document.execCommand('insertOrderedList')
    } else if (type === 'checkbox') {
      // Create checkbox list by inserting unordered list then converting to checkboxes
      document.execCommand('insertUnorderedList')
      
      // Get the newly created list item and add checkbox styling
      const sel = window.getSelection()
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        let node = range.startContainer
        
        // Find the li element
        while (node && node.nodeName !== 'LI') {
          node = node.parentNode
        }
        
        if (node && node.nodeName === 'LI') {
          // Add checkbox class to the list item
          node.classList.add('checkbox-list-item')
        }
      }
    }
  }

  // Create button from selected text
  const createButton = () => {
    focusEditor()
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      alert('Please select text first')
      return
    }
    
    const text = sel.toString()
    const url = prompt('Enter URL or #noteId')
    
    if (!url) return
    
    let finalUrl = url
    
    if (url.startsWith('#')) {
      const id = url.replace('#', '')
      finalUrl = `/note/${id}`
    }
    
    console.log('COMMAND FIRED: insertHTML')
    console.log('Selected text:', text)
    console.log('Final URL:', finalUrl)
    console.log('Before insert, editor HTML:', contentRef.current?.innerHTML)
    
    // Create button element
    const buttonEl = document.createElement('a')
    buttonEl.href = finalUrl
    buttonEl.className = 'note-button'
    buttonEl.textContent = text
    
    // Get range and insert button
    const range = sel.getRangeAt(0)
    range.deleteContents()
    range.insertNode(buttonEl)
    
    // Move cursor after button
    range.setStartAfter(buttonEl)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    
    // Verify button was inserted
    console.log('Immediately after insert, editor HTML:', contentRef.current?.innerHTML)
    setTimeout(() => {
      console.log('After 100ms, editor HTML:', contentRef.current?.innerHTML)
      if (!contentRef.current?.innerHTML.includes('note-button')) {
        console.warn('WARNING: Button may not have been inserted!')
      } else {
        console.log('SUCCESS: Button found in editor')
      }
    }, 100)
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-amber-500 hover:text-amber-600"
          >
            Go back to notes
          </button>
        </div>
      </div>
    )
  }

  // Safe check: ensure we have valid data before rendering editor
  if (!noteId || title === undefined) {
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
      {/* Note editor card */}
      <div 
        ref={editorRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mb-4 sm:mb-12 max-h-[90vh] sm:max-h-none flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleEditorMouseDown}
      >
        {/* Header with note ID */}
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-xs opacity-60 font-mono">
            #{shortId || '?'}
          </div>
        </div>

        {/* Toolbar with actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
          {/* Text formatting controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {/* Font size control */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Type className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <input
                type="number"
                min="10"
                max="72"
                step="1"
                value={fontSize}
                onMouseDown={(e) => {
                  e.preventDefault()
                  saveSelection()
                }}
                onChange={(e) => {
                  const size = parseInt(e.target.value)
                  setFontSize(size)
                  applyFontSize(size)
                }}
                className="w-14 sm:w-16 px-2 py-1 text-xs sm:text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                title="Font size in pixels"
              />
              <span className="text-xs text-gray-500 flex-shrink-0">px</span>
            </div>

            {/* Make button */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={createButton}
              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex-shrink-0"
              title="Create clickable button from selected text"
            >
              <Link2 className="w-4 h-4 text-blue-500" />
            </button>

            {/* Bullet list button */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyList('bullet')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              title="Create bullet list"
            >
              <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Numbered list button */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyList('numbered')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              title="Create numbered list"
            >
              <ListOrdered className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Checkbox list button */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyList('checkbox')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              title="Create checkbox list"
            >
              <CheckSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Favorite toggle */}
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-amber-100 dark:bg-amber-900/30' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star 
                className={`w-5 h-5 ${
                  isFavorite 
                    ? 'text-amber-500 fill-amber-500' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} 
              />
            </button>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              aria-label="Delete note"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Editor content */}
        <div className="p-3 sm:p-6 flex-1 overflow-y-auto flex flex-col">
          {/* Title input */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 text-xl sm:text-2xl font-semibold mb-3 sm:mb-4"
          />

          {/* Content editor with rich text support */}
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onKeyDown={handleContentKeyDown}
            onMouseUp={saveSelection}
            onClick={(e) => {
              // Handle checkbox clicks
              if (e.target.tagName === 'LI' && e.target.classList.contains('checkbox-list-item')) {
                e.target.classList.toggle('checked')
              }
            }}
            className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 min-h-[150px] sm:min-h-[300px] focus:outline-none flex-1 overflow-y-auto text-sm sm:text-base"
            style={{ color: 'var(--text-color)' }}
          />
          
          {/* Formatting hints */}
          <div className="mt-3 sm:mt-4 text-xs text-gray-400 space-y-1 flex-shrink-0">
            <p>💡 Keyboard shortcuts:</p>
            <p className="hidden sm:block">Ctrl+B = Bold | Ctrl+I = Italic | Ctrl+U = Underline | Ctrl+Z = Undo | Ctrl+Y = Redo</p>
            <p className="sm:hidden">Ctrl+B/I/U = Format | Ctrl+Z/Y = Undo/Redo</p>
          </div>
        </div>

        {/* Footer with date and close button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
          {/* Updated date - bottom left */}
          <span className="text-xs text-gray-400 order-2 sm:order-1">
            {updatedAt ? `Edited ${formatDate(updatedAt)}` : ''}
          </span>

          {/* Close button (saves and closes) */}
          <button
            onClick={handleSaveAndClose}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {saving ? 'Saving...' : 'Sluiten'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default NotePage
