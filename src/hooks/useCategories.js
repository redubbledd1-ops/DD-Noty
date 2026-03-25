import { useState, useEffect } from 'react'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load categories from localStorage on mount
  useEffect(() => {
    try {
      const storedCategories = JSON.parse(localStorage.getItem('categories') || '[]')
      setCategories(storedCategories)
      setLoading(false)
    } catch (err) {
      console.error('Error loading categories from localStorage:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [])

  // Create a new category
  const createCategory = async (name, color = '#3b82f6') => {
    try {
      const newCategory = {
        id: Date.now().toString(),
        name: name.trim(),
        color: color,
        createdAt: new Date().toISOString(),
      }

      const storedCategories = JSON.parse(localStorage.getItem('categories') || '[]')
      storedCategories.push(newCategory)
      localStorage.setItem('categories', JSON.stringify(storedCategories))

      setCategories(storedCategories)
      return newCategory.id
    } catch (err) {
      console.error('Error creating category:', err)
      throw err
    }
  }

  // Update a category
  const updateCategory = async (categoryId, updates) => {
    try {
      const storedCategories = JSON.parse(localStorage.getItem('categories') || '[]')
      const updated = storedCategories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
      localStorage.setItem('categories', JSON.stringify(updated))
      setCategories(updated)
    } catch (err) {
      console.error('Error updating category:', err)
      throw err
    }
  }

  // Delete a category
  const deleteCategory = async (categoryId) => {
    try {
      const storedCategories = JSON.parse(localStorage.getItem('categories') || '[]')
      const updated = storedCategories.filter(cat => cat.id !== categoryId)
      localStorage.setItem('categories', JSON.stringify(updated))
      
      // Remove category from all notes
      const notes = JSON.parse(localStorage.getItem('notes') || '[]')
      const updatedNotes = notes.map(note => ({
        ...note,
        categories: note.categories ? note.categories.filter(id => id !== categoryId) : []
      }))
      localStorage.setItem('notes', JSON.stringify(updatedNotes))

      setCategories(updated)
    } catch (err) {
      console.error('Error deleting category:', err)
      throw err
    }
  }

  return {
    categories,
    setCategories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
