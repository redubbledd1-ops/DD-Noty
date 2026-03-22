import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

const NoteCard = ({ note, onDelete, onResizeEnd, onClick, isDragging, onResizingChange }) => {
  const navigate = useNavigate()
  const [isResizing, setIsResizing] = useState(false)
  const [previewSize, setPreviewSize] = useState(null) // null = not resizing
  const [lockedStyle, setLockedStyle] = useState(null) // locked position during resize
  const startPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ w: 1, h: 1 })
  const startRect = useRef(null) // store initial bounding rect
  const finalSize = useRef(null)
  const cardRef = useRef(null)
  const resizeJustEnded = useRef(false)

  // Grid unit sizes
  const COL_WIDTH = 200
  const ROW_HEIGHT = 120
  const SNAP_THRESHOLD = 0.45

  // Title size based on height
  const getTitleSize = (h) => {
    if (h >= 3) return 'text-lg'
    return 'text-base'
  }

  // Prevent card click when clicking buttons
  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(note.id)
  }

  // Start resize on mouse down (desktop only)
  const handleResizeStart = (e) => {
    // Disable resize on mobile devices
    if (window.innerWidth < 768) {
      return
    }

    e.stopPropagation()
    e.preventDefault()

    // Get current position and LOCK it
    const rect = cardRef.current.getBoundingClientRect()
    startRect.current = rect
    
    // Lock position with fixed positioning
    setLockedStyle({
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 9999,
      margin: 0,
    })

    const w = note.w || 2
    const h = note.h || 2

    setIsResizing(true)
    setPreviewSize({ w, h })
    startPos.current = { x: e.clientX, y: e.clientY }
    startSize.current = { w, h }
    finalSize.current = { w, h }

    if (onResizingChange) onResizingChange(true)
  }

  // Calculate new size with threshold-based snapping
  const calculateNewSize = useCallback((deltaX, deltaY) => {
    const rawW = startSize.current.w + (deltaX / COL_WIDTH)
    const rawH = startSize.current.h + (deltaY / ROW_HEIGHT)
    
    const snapW = Math.floor(rawW) + (rawW % 1 > SNAP_THRESHOLD ? 1 : 0)
    const snapH = Math.floor(rawH) + (rawH % 1 > SNAP_THRESHOLD ? 1 : 0)
    
    // Clamp: min 1, max 4 width, max 6 height (or 4 on mobile)
    const isMobile = window.innerWidth < 640
    const maxH = isMobile ? 4 : 6
    
    const newW = Math.max(1, Math.min(4, snapW))
    const newH = Math.max(1, Math.min(maxH, snapH))
    
    return { w: newW, h: newH }
  }, [])

  // Mouse move / mouse up during resize
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startPos.current.x
      const deltaY = e.clientY - startPos.current.y
      const newSize = calculateNewSize(deltaX, deltaY)
      finalSize.current = newSize
      setPreviewSize({ ...newSize })
      
      // Update locked style with new width/height (top/left stay FIXED)
      if (startRect.current) {
        setLockedStyle(prev => ({
          ...prev,
          width: startRect.current.width + deltaX,
          height: startRect.current.height + deltaY,
        }))
      }
    }

    const handleMouseUp = () => {
      const size = finalSize.current
      const origW = note.w || 2
      const origH = note.h || 2

      // Clear locked style FIRST
      setLockedStyle(null)
      setIsResizing(false)
      setPreviewSize(null)
      resizeJustEnded.current = true
      setTimeout(() => { resizeJustEnded.current = false }, 200)

      if (onResizingChange) onResizingChange(false)

      // Only persist if size actually changed
      if (size && (size.w !== origW || size.h !== origH)) {
        if (onResizeEnd) onResizeEnd(note.id, size.w, size.h)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, note.id, note.w, note.h, onResizeEnd, onResizingChange, calculateNewSize])

  // Handle click - don't open if resizing or just finished resizing
  const handleClick = () => {
    if (!isResizing && !resizeJustEnded.current && onClick) {
      onClick()
    }
  }

  // Handle link clicks in content
  const handleContentClick = (e) => {
    const target = e.target.closest('a')
    
    if (!target) return
    
    const noteId = target.dataset.noteId
    
    if (noteId && noteId.trim()) {
      e.preventDefault()
      navigate(`/note/${noteId}`)
    }
  }

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className={`
        rounded-2xl 
        shadow-sm hover:shadow-md 
        p-2 sm:p-3
        flex flex-col 
        group 
        cursor-pointer 
        ${!isResizing ? 'h-full overflow-hidden relative max-h-[80vh] sm:max-h-none' : 'overflow-hidden'}
        ${isDragging ? 'shadow-lg opacity-90' : 'transition-shadow duration-200'}
        ${isResizing ? 'ring-2 ring-blue-400 select-none cursor-se-resize shadow-xl' : ''}
      `}
      style={{
        ...lockedStyle,
        backgroundColor: 'var(--note-bg)',
        color: 'var(--text-color)',
        borderColor: 'var(--border-color)',
        borderWidth: '1px',
      }}
    >
      {/* Note title - scale based on height */}
      {note.title && (
        <h3 className={`font-semibold ${getTitleSize(note.h || 2)} text-gray-800 dark:text-white mb-1 text-xs sm:text-sm line-clamp-2`}>
          {note.title}
        </h3>
      )}

      {/* Note content - flex-1 fills available space, overflow based on height */}
      <div 
        className={`flex-1 min-h-0 ${(note.h || 2) >= 3 ? 'overflow-auto' : 'overflow-hidden'}`}
        onClick={handleContentClick}
      >
        <div 
          className="text-xs sm:text-sm break-words prose prose-invert max-w-none"
          style={{ color: 'var(--text-color)' }}
          dangerouslySetInnerHTML={{ __html: note.content || '' }}
        />
      </div>

      {/* Delete button - bottom left, visible on hover */}
      <button
        onClick={handleDelete}
        className="absolute bottom-2 left-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 z-10"
        aria-label="Delete note"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>

      {/* Resize handle - bottom right, drag to resize (desktop only) */}
      {window.innerWidth >= 768 && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-1 right-1 w-6 h-6 cursor-se-resize opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
          aria-label="Resize note"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-3.5 h-3.5 text-gray-400"
          >
            <path d="M22 22L12 22M22 22L22 12M22 22L16 16" />
          </svg>
        </div>
      )}

      {/* Size indicator while resizing */}
      {isResizing && previewSize && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded shadow">
          {previewSize.w}×{previewSize.h}
        </div>
      )}
    </div>
  )
}

export default NoteCard
