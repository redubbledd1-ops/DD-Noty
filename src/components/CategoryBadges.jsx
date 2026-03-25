const CategoryBadges = ({ categoryIds, categories, onRemove }) => {
  if (!categoryIds || categoryIds.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {categoryIds.map(catId => {
        const category = categories.find(c => c.id === catId)
        if (!category) return null

        return (
          <div
            key={catId}
            className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
            style={{
              backgroundColor: category.color + '20',
              color: category.color,
              border: `1px solid ${category.color}40`,
            }}
          >
            {category.name}
            {onRemove && (
              <button
                onClick={() => onRemove(catId)}
                className="ml-1 hover:opacity-70"
              >
                ×
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CategoryBadges
