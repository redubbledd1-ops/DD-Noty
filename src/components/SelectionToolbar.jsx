import { useState } from 'react'
import { Trash2, Tag, X, ChevronUp, Check } from 'lucide-react'
import { themeConfig } from '../config/theme'

const SelectionToolbar = ({ selectedCount, onAddToCategory, onDeleteSelected, categories, onClose, selectedNotes, notes }) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Check if all selected notes are in a category
  const allSelectedInCategory = (categoryId) => {
    if (selectedNotes.size === 0) return false
    return Array.from(selectedNotes).every(noteId => {
      const note = notes.find(n => n.id === noteId)
      return note && note.categories && note.categories.includes(categoryId)
    })
  }

  const handleCategorySelect = (categoryId) => {
    const allInCategory = allSelectedInCategory(categoryId)
    if (allInCategory) {
      // Remove from category
      onAddToCategory(categoryId, true) // true = remove
    } else {
      // Add to category
      onAddToCategory(categoryId, false) // false = add
    }
    // Keep dropdown open
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-gray-900 dark:bg-gray-950 border-t border-gray-700 p-4 flex items-center justify-between z-40"
      style={{ borderColor: themeConfig.border.default, backgroundColor: themeConfig.background.note }}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium" style={{ color: themeConfig.text.primary }}>
          {selectedCount} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Add to category dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            style={{ color: themeConfig.text.primary }}
            title="Add to category"
          >
            <Tag className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Category</span>
            <ChevronUp className={`w-4 h-4 transition-transform ${showCategoryDropdown ? '' : 'rotate-180'}`} />
          </button>

          {/* Category dropdown */}
          {showCategoryDropdown && (
            <div 
              className="absolute bottom-full mb-2 right-0 min-w-[200px] rounded-lg shadow-lg border overflow-hidden"
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
                categories.map((category) => {
                  const allInCategory = allSelectedInCategory(category.id)
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                      style={{ color: themeConfig.text.primary }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm flex-1">{category.name}</span>
                      {allInCategory && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={onDeleteSelected}
          className="p-2 rounded-lg hover:bg-red-900/30 transition-colors flex items-center gap-2"
          style={{ color: '#ef4444' }}
          title="Delete selected"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Delete</span>
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
          style={{ color: themeConfig.text.primary }}
          title="Close selection"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default SelectionToolbar
