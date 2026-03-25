import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useAutoSave = (isDirty, onSave) => {
  const navigate = useNavigate()
  const saveInProgressRef = useRef(false)
  const hasAttemptedSaveRef = useRef(false)

  // Perform save with error handling
  const performSave = useCallback(async () => {
    if (saveInProgressRef.current || !isDirty) {
      return true
    }

    saveInProgressRef.current = true
    try {
      await onSave()
      hasAttemptedSaveRef.current = true
      return true
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Fallback: attempt to save to localStorage as backup
      try {
        const backupData = {
          timestamp: new Date().toISOString(),
          error: error.message,
        }
        localStorage.setItem('noty_autosave_backup', JSON.stringify(backupData))
        console.log('Backup saved to localStorage')
      } catch (backupError) {
        console.error('Backup save also failed:', backupError)
      }
      return false
    } finally {
      saveInProgressRef.current = false
    }
  }, [isDirty, onSave])

  // Handle beforeunload (browser tab close, refresh, etc.)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !hasAttemptedSaveRef.current) {
        // Show browser warning
        e.preventDefault()
        e.returnValue = ''
        // Attempt to save
        performSave()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, performSave])

  // Handle popstate (browser back button, mobile back gesture)
  useEffect(() => {
    const handlePopState = async (e) => {
      if (isDirty) {
        // Prevent default navigation
        e.preventDefault()
        // Save before navigating
        const saved = await performSave()
        if (saved || !isDirty) {
          // Navigate back after save
          window.history.back()
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isDirty, performSave])

  return { performSave }
}
