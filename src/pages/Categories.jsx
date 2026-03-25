import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import { themeConfig } from '../config/theme'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

const Categories = () => {
  const navigate = useNavigate()
  const { categories, createCategory, deleteCategory } = useCategories()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    
    await createCategory(newCategoryName.trim(), selectedColor)
    setNewCategoryName('')
    setSelectedColor(PRESET_COLORS[0])
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category? Notes will not be deleted.')) return
    await deleteCategory(categoryId)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: themeConfig.text.primary }} />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: themeConfig.text.primary }}>
          Categories
        </h1>
      </div>

      {/* Create new category */}
      <div 
        className="p-4 rounded-xl mb-6"
        style={{ 
          backgroundColor: themeConfig.background.note,
          borderColor: themeConfig.border.default,
          borderWidth: '1px'
        }}
      >
        <h2 className="text-sm font-medium mb-3" style={{ color: themeConfig.text.secondary }}>
          New Category
        </h2>
        
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name..."
            className="flex-1 px-3 py-2 rounded-lg border bg-transparent"
            style={{ 
              borderColor: themeConfig.border.default,
              color: themeConfig.text.primary
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
          />
          <button
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim()}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Color picker */}
        <div className="flex gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full transition-transform ${
                selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Categories list */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: themeConfig.text.secondary }}>
              No categories yet. Create one above!
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 rounded-xl group cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/?category=${category.id}`)}
              style={{ 
                backgroundColor: themeConfig.background.note,
                borderColor: themeConfig.border.default,
                borderWidth: '1px'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium" style={{ color: themeConfig.text.primary }}>
                  {category.name}
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCategory(category.id)
                }}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Categories
