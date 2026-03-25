import { useState, useRef, useEffect, useCallback } from 'react'
import { themeConfig } from '../config/theme'
import { Trash2 } from 'lucide-react'

// Convert ProseMirror JSON to HTML manually
const convertJsonToHtml = (content) => {
  if (!content) return ''
  
  try {
    if (typeof content === 'string') return content
    
    if (!content.content || !Array.isArray(content.content)) return ''
    
    return content.content.map(node => {
      if (node.type === 'paragraph') {
        const text = node.content?.map(n => {
          let html = n.text || ''
          if (n.marks) {
            n.marks.forEach(mark => {
              if (mark.type === 'bold') html = `<strong>${html}</strong>`
              if (mark.type === 'italic') html = `<em>${html}</em>`
              if (mark.type === 'underline') html = `<u>${html}</u>`
              if (mark.type === 'textStyle' && mark.attrs?.fontSize) {
                html = `<span style="font-size: ${mark.attrs.fontSize}">${html}</span>`
              }
              if (mark.type === 'link') {
                const href = mark.attrs?.href || '#'
                html = `<a href="${href}" target="_blank" rel="noopener noreferrer">${html}</a>`
              }
            })
          }
          return html
        }).join('') || ''
        return `<p>${text}</p>`
      }
      if (node.type === 'heading') {
        const level = node.attrs?.level || 1
        const text = node.content?.map(n => {
          let html = n.text || ''
          if (n.marks) {
            n.marks.forEach(mark => {
              if (mark.type === 'bold') html = `<strong>${html}</strong>`
              if (mark.type === 'italic') html = `<em>${html}</em>`
              if (mark.type === 'textStyle' && mark.attrs?.fontSize) {
                html = `<span style="font-size: ${mark.attrs.fontSize}">${html}</span>`
              }
            })
          }
          return html
        }).join('') || ''
        return `<h${level}>${text}</h${level}>`
      }
      if (node.type === 'bulletList') {
        const items = node.content?.map(item => {
          const text = item.content?.map(n => {
            if (n.type === 'paragraph' && n.content) {
              return n.content.map(c => {
                let html = c.text || ''
                if (c.marks) {
                  c.marks.forEach(mark => {
                    if (mark.type === 'bold') html = `<strong>${html}</strong>`
                    if (mark.type === 'italic') html = `<em>${html}</em>`
                    if (mark.type === 'textStyle' && mark.attrs?.fontSize) {
                      html = `<span style="font-size: ${mark.attrs.fontSize}">${html}</span>`
                    }
                  })
                }
                return html
              }).join('')
            }
            return n.text || ''
          }).join('') || ''
          return `<li>${text}</li>`
        }).join('') || ''
        return `<ul>${items}</ul>`
      }
      if (node.type === 'orderedList') {
        const items = node.content?.map(item => {
          const text = item.content?.map(n => {
            if (n.type === 'paragraph' && n.content) {
              return n.content.map(c => {
                let html = c.text || ''
                if (c.marks) {
                  c.marks.forEach(mark => {
                    if (mark.type === 'bold') html = `<strong>${html}</strong>`
                    if (mark.type === 'italic') html = `<em>${html}</em>`
                    if (mark.type === 'textStyle' && mark.attrs?.fontSize) {
                      html = `<span style="font-size: ${mark.attrs.fontSize}">${html}</span>`
                    }
                  })
                }
                return html
              }).join('')
            }
            return n.text || ''
          }).join('') || ''
          return `<li>${text}</li>`
        }).join('') || ''
        return `<ol>${items}</ol>`
      }
      if (node.type === 'taskList') {
        const items = node.content?.map(item => {
          const checked = item.attrs?.checked ? 'checked' : ''
          // Extract text from nested paragraphs with font-size support
          let text = ''
          if (item.content && Array.isArray(item.content)) {
            text = item.content.map(n => {
              if (n.type === 'paragraph' && n.content) {
                return n.content.map(c => {
                  let html = c.text || ''
                  if (c.marks) {
                    c.marks.forEach(mark => {
                      if (mark.type === 'bold') html = `<strong>${html}</strong>`
                      if (mark.type === 'italic') html = `<em>${html}</em>`
                      if (mark.type === 'textStyle' && mark.attrs?.fontSize) {
                        html = `<span style="font-size: ${mark.attrs.fontSize}">${html}</span>`
                      }
                    })
                  }
                  return html
                }).join('')
              }
              return n.text || ''
            }).join('')
          }
          return `<li class="task-item"><input type="checkbox" class="preview-checkbox" data-checked="${checked ? 'true' : 'false'}" ${checked} onclick="event.stopPropagation()"> <span>${text}</span></li>`
        }).join('') || ''
        return `<ul class="task-list">${items}</ul>`
      }
      return ''
    }).join('')
  } catch (err) {
    console.error('Error converting JSON to HTML:', err)
    return ''
  }
}

// Extract text from ProseMirror JSON content for fallback
const getContentPreview = (content) => {
  if (!content) return 'Nieuwe notitie'
  
  // If content is a string, return it as-is
  if (typeof content === 'string') return content
  
  // If content is an object with content array (ProseMirror JSON)
  if (content.content && Array.isArray(content.content)) {
    const firstNode = content.content[0]
    if (!firstNode) return 'Nieuwe notitie'
    
    // Extract text from first node
    if (firstNode.content && Array.isArray(firstNode.content)) {
      const textContent = firstNode.content
        .map(node => node.text || '')
        .join('')
      return textContent || 'Nieuwe notitie'
    }
  }
  
  return 'Nieuwe notitie'
}

const NoteCard = ({ note, onDelete, onResizeEnd, isDragging, onResizingChange, isSelected, isSelectionMode, categories }) => {
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

  return (
    <div
      ref={cardRef}
      className={`
        rounded-xl sm:rounded-2xl
        shadow-sm hover:shadow-md 
        p-1.5 sm:p-3
        flex flex-col 
        group 
        cursor-pointer 
        ${!isResizing ? 'h-full overflow-hidden relative max-h-[80vh] sm:max-h-none' : 'overflow-hidden'}
        ${isDragging ? 'shadow-lg opacity-90' : 'transition-shadow duration-200'}
        ${isResizing ? 'ring-2 ring-blue-400 select-none cursor-se-resize shadow-xl' : ''}
      `}
      style={{
        ...lockedStyle,
        backgroundColor: themeConfig.background.note,
        color: themeConfig.text.primary,
        borderColor: themeConfig.border.default,
        borderWidth: '1px',
      }}
    >
      {/* Selection checkbox - visible in selection mode */}
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-20">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-5 h-5 cursor-pointer"
            style={{ accentColor: themeConfig.text.primary }}
          />
        </div>
      )}

      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl pointer-events-none z-10" />
      )}

      {/* Note title - only show if explicitly set */}
      {note.title && (
        <h3 className={`font-semibold ${getTitleSize(note.h || 2)} mb-0.5 text-xs line-clamp-2 ${isSelectionMode ? 'pl-6' : ''}`} style={{ color: themeConfig.text.primary }}>
          {note.title}
        </h3>
      )}

      {/* Note content - flex-1 fills available space, overflow based on height */}
      <div 
        className={`flex-1 min-h-0 ${(note.h || 2) >= 3 ? 'overflow-auto' : 'overflow-hidden'}`}
      >
        <div 
          className={`note-preview break-words prose prose-invert max-w-none ${isSelectionMode ? 'pointer-events-none' : ''}`}
          style={{ 
            color: themeConfig.text.primary
          }}
          dangerouslySetInnerHTML={{ __html: convertJsonToHtml(note.content) || getContentPreview(note.content) }}
          onClick={(e) => {
            // Block all interactions in selection mode
            if (isSelectionMode) {
              e.stopPropagation()
              return
            }
            // Allow links to be clicked
            if (e.target.tagName === 'A') {
              e.stopPropagation()
              const href = e.target.getAttribute('href')
              if (href) {
                window.open(href, '_blank')
              }
            } 
            // Allow checkboxes to be clicked
            else if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
              e.stopPropagation()
              e.target.checked = !e.target.checked
            }
          }}
        />
      </div>

      {/* Delete button - bottom left, visible on hover (hidden in selection mode) */}
      {!isSelectionMode && (
        <button
          onClick={handleDelete}
          className="absolute bottom-2 left-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 z-10"
          aria-label="Delete note"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      )}

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
