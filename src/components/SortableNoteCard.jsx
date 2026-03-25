import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import NoteCard from './NoteCard'

// Column span classes - col-span-1 is always the base (true 1-column support)
const colSpanMap = {
  1: 'col-span-1',
  2: 'col-span-1 sm:col-span-2',
  3: 'col-span-1 sm:col-span-2 md:col-span-3',
  4: 'col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4',
}

// Row span classes
const rowSpanMap = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6',
}

const getSpanClasses = (w, h) => {
  const colClass = colSpanMap[Math.min(w || 1, 4)] || 'col-span-1'
  const rowClass = rowSpanMap[Math.min(h || 1, 6)] || 'row-span-1'
  return `${colClass} ${rowClass}`
}

const SortableNoteCard = ({ note, onDelete, onResizeEnd, isSelected, onMouseDown, onMouseUp, onNoteClick, isSelectionMode, categories }) => {
  const [isResizing, setIsResizing] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: note.id,
    disabled: isResizing || isSelectionMode,
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (!isDragging && !isResizing) {
      onNoteClick(note.id)
    }
  }

  const handleMouseDown = (e) => {
    if (!isSelectionMode) {
      onMouseDown(note.id)
    }
  }

  const handleMouseUp = () => {
    onMouseUp()
  }

  const handleResizingChange = (resizing) => {
    setIsResizing(resizing)
  }

  // During resize: NO drag props, NO transform, NO grid influence
  // The NoteCard itself uses position:fixed to stay in place
  const dragProps = isResizing ? {} : { ...attributes, ...listeners }
  const wrapperStyle = isResizing ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef}
      style={wrapperStyle}
      className={`${getSpanClasses(note.w || 2, note.h || 2)} relative h-full`}
      {...dragProps}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      <NoteCard
        note={note}
        onDelete={onDelete}
        onResizeEnd={onResizeEnd}
        isDragging={isDragging}
        onResizingChange={handleResizingChange}
        isSelected={isSelected}
        isSelectionMode={isSelectionMode}
        categories={categories}
      />
    </div>
  )
}

export default SortableNoteCard
