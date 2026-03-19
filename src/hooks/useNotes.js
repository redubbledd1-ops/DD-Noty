import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
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
    const q = query(notesRef, orderBy('createdAt', 'desc'))

    // Set up realtime listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          reminder: doc.data().reminder?.toDate?.() || null,
        }))
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
  const createNote = async (title, content, reminder = null) => {
    if (!user) throw new Error('User must be logged in')

    const notesRef = collection(db, 'users', user.uid, 'notes')
    const noteData = {
      title: title.trim(),
      content: content.trim(),
      createdAt: serverTimestamp(),
      reminder: reminder ? new Date(reminder) : null,
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
      // Convert reminder string to Date if provided
      ...(updates.reminder !== undefined && {
        reminder: updates.reminder ? new Date(updates.reminder) : null,
      }),
    }

    await updateDoc(noteRef, updateData)
  }

  // Delete a note
  const deleteNote = async (noteId) => {
    if (!user) throw new Error('User must be logged in')

    const noteRef = doc(db, 'users', user.uid, 'notes', noteId)
    await deleteDoc(noteRef)
  }

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
  }
}