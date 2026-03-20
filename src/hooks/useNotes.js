import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

// Custom hook for managing notes with Firestore
export const useNotes = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Subscribe to realtime notes updates
  useEffect(() => {
    if (!user) {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Reference to user's notes collection
    const notesRef = collection(db, 'users', user.uid, 'notes')
    const q = query(notesRef)

    // Set up realtime listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        }))

        // Sort: favorites first, then by order, then by updatedAt
        notesData.sort((a, b) => {
          // Favorites always on top
          if (a.isFavorite && !b.isFavorite) return -1
          if (!a.isFavorite && b.isFavorite) return 1

          // If both have order, sort by order ascending
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order
          }
          // If only one has order, prioritize the one with order
          if (a.order !== undefined) return -1
          if (b.order !== undefined) return 1
          // Otherwise sort by updatedAt descending
          return b.updatedAt - a.updatedAt
        })

        setNotes(notesData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching notes:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [user])

  // Create a new note
  const createNote = async (title, content) => {
    if (!user) throw new Error('User must be logged in')

    const notesRef = collection(db, 'users', user.uid, 'notes')
    
    // Calculate next shortId
    let nextShortId = 1
    if (notes.length > 0) {
      const maxShortId = Math.max(...notes.map(n => n.shortId || 0))
      nextShortId = maxShortId + 1
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      order: 0, // New notes go to the top
      isFavorite: false,
      w: 2, // columns wide (1-4)
      h: 2, // rows tall (1-6)
      shortId: nextShortId, // Short incremental ID
    }

    const docRef = await addDoc(notesRef, noteData)
    return docRef.id
  }

  // Update an existing note
  const updateNote = async (noteId, updates) => {
    if (!user) throw new Error('User must be logged in')

    const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(noteRef, updateData)
  }

  // Delete a note
  const deleteNote = async (noteId) => {
    if (!user) throw new Error('User must be logged in')

    const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
    await deleteDoc(noteRef)
  }

  // Reorder notes (batch update order field)
  const reorderNotes = async (reorderedNotes) => {
    if (!user) throw new Error('User must be logged in')

    const batch = writeBatch(db)

    reorderedNotes.forEach((note, index) => {
      const noteRef = doc(db, 'users', user.uid, 'notes', note.id)
      batch.update(noteRef, { order: index })
    })

    await batch.commit()
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