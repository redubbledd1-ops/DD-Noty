# Tiptap Editor Migration Guide

## Overview

Migrating from custom contentEditable editor to Tiptap for stable, reliable text editing with proper list support.

## Installation

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-bullet-list @tiptap/extension-ordered-list @tiptap/extension-list-item @tiptap/extension-task-list @tiptap/extension-task-item
```

## Components Created

### 1. TiptapEditor.jsx
Main editor component that wraps Tiptap editor with:
- StarterKit (basic formatting)
- BulletList extension
- OrderedList extension
- TaskList extension (checkbox lists)
- TaskItem extension

**Props:**
- `content` - HTML content to display
- `onChange` - Callback when content changes
- `onSave` - Callback for save operations
- `theme` - Theme object with colors

**Features:**
- Automatic content updates
- HTML output format
- Theme color support

### 2. TiptapToolbar.jsx
Toolbar component with buttons for:
- Bold, Italic, Underline
- Bullet list toggle
- Ordered list toggle
- Task list toggle

**Features:**
- Active state indication
- Keyboard shortcuts
- Direct Tiptap command integration

## Integration Steps

### Step 1: Update NotePage.jsx

Replace contentEditable editor with TiptapEditor:

```javascript
import TiptapEditor from '../components/TiptapEditor'
import TiptapToolbar from '../components/TiptapToolbar'

// In component:
const [editor, setEditor] = useState(null)
const [content, setContent] = useState('')

// Render:
<TiptapToolbar editor={editor} />
<TiptapEditor 
  content={content}
  onChange={setContent}
  onSave={handleSave}
  theme={themeConfig}
/>
```

### Step 2: Update Content Storage

Tiptap outputs HTML by default. Store as:
- HTML format (compatible with existing storage)
- Or convert to JSON for more control

### Step 3: Update Styling

Add Tiptap-specific CSS to match theme:

```css
.tiptap-editor {
  color: var(--text-color);
  font-size: 16px;
  line-height: 1.6;
}

.tiptap-editor ul {
  list-style-type: disc;
  margin-left: 1.5em;
}

.tiptap-editor ol {
  list-style-type: decimal;
  margin-left: 1.5em;
}

.tiptap-editor ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}

.tiptap-editor li[data-type="taskItem"] {
  display: flex;
  align-items: center;
  margin-bottom: 0.5em;
}

.tiptap-editor input[type="checkbox"] {
  margin-right: 0.5em;
}
```

## List Behavior

### Bullet List
- `- ` → Creates bullet list
- Enter → New item
- 2x Enter → Exit list
- Backspace on first item → Exit list

### Ordered List
- `1. ` → Creates numbered list
- Enter → New item (auto-numbered)
- 2x Enter → Exit list
- Backspace on first item → Exit list

### Task List (Checkbox)
- `[ ] ` → Creates checkbox list
- Enter → New item
- Click checkbox → Toggle state
- 2x Enter → Exit list

## Content Storage

### HTML Format (Default)
```javascript
const html = editor.getHTML()
// Output: <p>Text</p><ul><li>Item 1</li></ul>

// Save to database
await updateDoc(docRef, { content: html })
```

### JSON Format (Optional)
```javascript
const json = editor.getJSON()
// Output: { type: 'doc', content: [...] }

// Save to database
await updateDoc(docRef, { content: JSON.stringify(json) })
```

### Migration from Old Editor
If existing notes use different format:
```javascript
// Convert old format to Tiptap HTML
const convertOldToTiptap = (oldContent) => {
  // Parse old format and convert to HTML
  // Then load into Tiptap
  return convertedHTML
}
```

## Keyboard Shortcuts

### Built-in (Tiptap)
- `Ctrl+B` / `Cmd+B` → Bold
- `Ctrl+I` / `Cmd+I` → Italic
- `Ctrl+U` / `Cmd+U` → Underline
- `Ctrl+Z` / `Cmd+Z` → Undo
- `Ctrl+Y` / `Cmd+Y` → Redo

### Input Rules (Auto-format)
- `- ` at start → Bullet list
- `1. ` at start → Ordered list
- `[ ] ` at start → Task list

## Mobile Support

Tiptap handles mobile correctly:
- ✅ Stable cursor positioning
- ✅ Touch keyboard support
- ✅ No jumping cursor issues
- ✅ Proper text selection

## Advantages Over Custom Editor

1. **Stability** - Tiptap is battle-tested, used by major apps
2. **List Support** - Proper list implementation, no bugs
3. **Mobile** - Works perfectly on mobile devices
4. **Maintenance** - Less code to maintain
5. **Features** - Easy to add new features
6. **Performance** - Optimized rendering
7. **Undo/Redo** - Built-in, works perfectly

## Removing Old Code

After migration, remove:
- `src/utils/listUtils.js` - No longer needed
- Old editor event handlers from NotePage
- Custom contentEditable styling
- Old list-related CSS

## Testing Checklist

- [ ] Bullet lists work (create, edit, exit)
- [ ] Numbered lists work (create, edit, exit)
- [ ] Checkbox lists work (create, edit, toggle)
- [ ] List conversion works (bullet ↔ numbered ↔ checkbox)
- [ ] 2x Enter exits list
- [ ] Backspace works correctly
- [ ] Undo/Redo works
- [ ] Mobile keyboard works
- [ ] Content saves correctly
- [ ] Theme colors apply
- [ ] No cursor jumping
- [ ] No duplicate lists

## Troubleshooting

### Editor not showing
- Ensure Tiptap packages installed
- Check console for errors
- Verify extensions loaded

### Content not updating
- Check onChange callback
- Verify content prop passed correctly
- Check browser console

### Lists not working
- Ensure TaskList/TaskItem extensions installed
- Check Tiptap version compatibility
- Verify list commands in toolbar

### Styling issues
- Check CSS specificity
- Verify theme variables applied
- Check Tiptap default styles override

## Next Steps

1. Install Tiptap packages
2. Create TiptapEditor component
3. Create TiptapToolbar component
4. Update NotePage to use new components
5. Test all features
6. Remove old editor code
7. Deploy
