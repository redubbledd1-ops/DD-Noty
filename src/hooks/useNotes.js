import { useState, useEffect } from 'react'

// Calculate optimal note size based on content
const calculateNoteSize = (title, content) => {
  // Count lines and find longest line length
  let lines = 0
  let maxLineLength = 0
  
  // Count title as first line if it exists
  if (title && title.trim()) {
    lines = 1
    maxLineLength = title.length
  }
  
  // Parse content if it's a string
  let parsedContent = content
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content)
    } catch (e) {
      // If it's plain text, count lines directly
      const textLines = content.split('\n').filter(l => l.trim())
      lines += textLines.length
      const lineLengths = textLines.map(l => l.length)
      if (lineLengths.length > 0) {
        maxLineLength = Math.max(maxLineLength, Math.max(...lineLengths))
      }
    }
  }
  
  // Process ProseMirror JSON content
  if (parsedContent && parsedContent.content && Array.isArray(parsedContent.content)) {
    parsedContent.content.forEach(node => {
      // Count all block-level nodes as lines
      if (node.type === 'paragraph' || node.type === 'heading' || 
          node.type === 'bulletList' || node.type === 'orderedList' || 
          node.type === 'taskList') {
        
        if (node.type === 'paragraph' || node.type === 'heading') {
          lines++
          let lineText = ''
          if (node.content) {
            node.content.forEach(n => {
              if (n.text) lineText += n.text
            })
          }
          maxLineLength = Math.max(maxLineLength, lineText.length)
        } else {
          // Lists - count each item as a line
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
      }
    })
  }

  // Ensure at least 1 line if there's any content
  if (lines === 0 && maxLineLength > 0) lines = 1

  // Calculate WIDTH based on longest line length
  // Every 20 chars = 1 width unit, max 4
  // 1-20 chars = 1, 21-40 = 2, 41-60 = 3, 61+ = 4
  let w = 1
  if (maxLineLength > 60) {
    w = 4
  } else if (maxLineLength > 40) {
    w = 3
  } else if (maxLineLength > 20) {
    w = 2
  } else {
    w = 1
  }

  // Calculate HEIGHT based on number of lines
  // 1-3 lines = 1, 4-6 = 2, 7-10 = 3, 11+ = 4
  let h = 1
  if (lines > 10) {
    h = 4
  } else if (lines > 6) {
    h = 3
  } else if (lines > 3) {
    h = 2
  }

  // Minimum size 1x1
  return { w: Math.max(1, w), h: Math.max(1, h) }
}

// Custom hook for managing notes with localStorage
export const useNotes = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const storedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
      setNotes(storedNotes)
      setLoading(false)
    } catch (err) {
      console.error('Error loading notes from localStorage:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [])

  // Create a new note
  const createNote = async (title, content) => {
    try {
      // Generate unique ID using timestamp
      const newId = Date.now().toString()

      // Calculate optimal size based on content
      const { w, h } = calculateNoteSize(title, content)

      const newNote = {
        id: newId,
        title: title.trim(),
        content: content || null,  // Content is JSON object (from editor.getJSON()), not string
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 0,
        isFavorite: false,
        w: w,
        h: h,
        shortId: notes.length + 1,
      }

      // Add to localStorage - new notes at the beginning (top-right)
      const storedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
      storedNotes.unshift(newNote)
      localStorage.setItem('notes', JSON.stringify(storedNotes))

      // Update state
      setNotes(storedNotes)

      return newId
    } catch (err) {
      console.error('Error creating note:', err)
      throw err
    }
  }

  // Update an existing note
  const updateNote = async (noteId, updates) => {
    try {
      const storedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
      const updated = storedNotes.map(note =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
      localStorage.setItem('notes', JSON.stringify(updated))
      setNotes(updated)
    } catch (err) {
      console.error('Error updating note:', err)
      throw err
    }
  }

  // Delete a note
  const deleteNote = async (noteId) => {
    try {
      const storedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
      const updated = storedNotes.filter(note => note.id !== noteId)
      localStorage.setItem('notes', JSON.stringify(updated))
      setNotes(updated)
    } catch (err) {
      console.error('Error deleting note:', err)
      throw err
    }
  }

  // Reorder notes
  const reorderNotes = async (reorderedNotes) => {
    try {
      const updated = reorderedNotes.map((note, index) => ({
        ...note,
        order: index,
      }))
      localStorage.setItem('notes', JSON.stringify(updated))
      setNotes(updated)
    } catch (err) {
      console.error('Error reordering notes:', err)
      throw err
    }
  }

  return {
    notes,
    setNotes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
  }
}