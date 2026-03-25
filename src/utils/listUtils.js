/**
 * List utility functions for contentEditable editor
 * Handles detection, conversion, and manipulation of lists
 */

/**
 * Check if a list item is empty (no text content)
 * @param {HTMLElement} item - The LI element
 * @returns {boolean} True if empty
 */
export const isListItemEmpty = (item) => {
  if (!item || item.nodeName !== 'LI') return false
  
  // Get text content and trim whitespace
  const text = item.textContent.trim()
  
  // Check if truly empty
  return text.length === 0
}

/**
 * Get text content of a list item (for restoration)
 * @param {HTMLElement} item - The LI element
 * @returns {string} HTML content of the item
 */
export const getListItemContent = (item) => {
  if (!item) return ''
  return item.innerHTML
}

/**
 * Detect the type of list containing the current cursor position
 * @returns {string|null} 'bullet', 'numbered', 'checkbox', or null
 */
export const detectCurrentListType = () => {
  const sel = window.getSelection()
  if (!sel.rangeCount) return null

  const range = sel.getRangeAt(0)
  let node = range.startContainer

  // Traverse up to find list container
  while (node) {
    if (node.nodeName === 'LI') {
      const parent = node.parentNode
      if (parent.nodeName === 'UL') {
        // Check if it's a checkbox list
        if (node.classList.contains('checkbox-list-item')) {
          return 'checkbox'
        }
        return 'bullet'
      }
      if (parent.nodeName === 'OL') {
        return 'numbered'
      }
    }
    node = node.parentNode
  }

  return null
}

/**
 * Find the root list container from current cursor position
 * @returns {HTMLElement|null} The UL or OL element, or null
 */
export const findRootListContainer = () => {
  const sel = window.getSelection()
  if (!sel.rangeCount) return null

  const range = sel.getRangeAt(0)
  let node = range.startContainer

  while (node) {
    if (node.nodeName === 'UL' || node.nodeName === 'OL') {
      return node
    }
    node = node.parentNode
  }

  return null
}

/**
 * Get all list items in a list container
 * @param {HTMLElement} listContainer - The UL or OL element
 * @returns {HTMLElement[]} Array of LI elements
 */
export const getListItems = (listContainer) => {
  if (!listContainer) return []
  return Array.from(listContainer.querySelectorAll(':scope > li'))
}

/**
 * Convert list type IN-PLACE (bullet <-> numbered <-> checkbox)
 * TRANSFORMS existing list, doesn't create new one
 * Preserves cursor position
 * @param {string} targetType - 'bullet', 'numbered', or 'checkbox'
 */
export const convertListType = (targetType) => {
  const sel = window.getSelection()
  if (!sel.rangeCount) return false

  const listContainer = findRootListContainer()
  if (!listContainer) return false

  const currentType = detectCurrentListType()
  if (currentType === targetType) return true // Already correct type

  // Save current cursor position (which item + offset)
  const range = sel.getRangeAt(0)
  let cursorItem = range.startContainer
  while (cursorItem && cursorItem.nodeName !== 'LI') {
    cursorItem = cursorItem.parentNode
  }
  const cursorItemIndex = cursorItem ? Array.from(listContainer.children).indexOf(cursorItem) : 0
  const cursorOffset = range.startOffset

  // Transform list IN-PLACE by changing tag and classes
  let newList
  if (targetType === 'bullet') {
    newList = document.createElement('ul')
  } else if (targetType === 'numbered') {
    newList = document.createElement('ol')
  } else if (targetType === 'checkbox') {
    newList = document.createElement('ul')
  }

  // Move all items to new list, updating classes
  const items = Array.from(listContainer.children)
  items.forEach((item) => {
    // Handle checkbox class
    if (targetType === 'checkbox') {
      item.classList.add('checkbox-list-item')
    } else {
      item.classList.remove('checkbox-list-item', 'checked')
    }

    newList.appendChild(item) // This moves the item (doesn't copy)
  })

  // Replace old list with transformed list
  listContainer.parentNode.replaceChild(newList, listContainer)

  // Restore cursor to exact same position
  if (cursorItemIndex >= 0 && cursorItemIndex < newList.children.length) {
    const restoredItem = newList.children[cursorItemIndex]
    const newRange = document.createRange()
    try {
      newRange.setStart(restoredItem.firstChild || restoredItem, Math.min(cursorOffset, (restoredItem.textContent || '').length))
      newRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(newRange)
    } catch (e) {
      // Fallback: place cursor at end of item
      newRange.selectNodeContents(restoredItem)
      newRange.collapse(false)
      sel.removeAllRanges()
      sel.addRange(newRange)
    }
  }

  return true
}

/**
 * Create a new list from selected text or at cursor position
 * CRITICAL: Always use current selection, insert at exact cursor position
 * @param {string} type - 'bullet', 'numbered', or 'checkbox'
 */
export const createListFromSelection = (type) => {
  const sel = window.getSelection()
  if (!sel.rangeCount) return false

  // Check if already in a list - if so, transform instead of creating new
  const currentListType = detectCurrentListType()
  if (currentListType) {
    // Already in a list - transform it
    return convertListType(type)
  }

  const range = sel.getRangeAt(0)
  let selectedText = sel.toString().trim()

  if (selectedText) {
    // Split selected text by newlines
    const lines = selectedText.split('\n').filter((line) => line.trim())
    if (lines.length === 0) return false

    // Create list container
    const list = type === 'numbered' ? document.createElement('ol') : document.createElement('ul')

    // Add items
    lines.forEach((line) => {
      const item = document.createElement('li')
      item.textContent = line.trim()

      if (type === 'checkbox') {
        item.classList.add('checkbox-list-item')
      }

      list.appendChild(item)
    })

    // Replace selection with list
    range.deleteContents()
    range.insertNode(list)

    // EXPLICITLY move cursor to first item
    const firstItem = list.querySelector('li')
    if (firstItem) {
      const newRange = document.createRange()
      newRange.selectNodeContents(firstItem)
      newRange.collapse(false)
      sel.removeAllRanges()
      sel.addRange(newRange)
    }

    return true
  } else {
    // No selection - check if cursor is on a line with text
    let node = range.startContainer
    let lineText = ''
    let parentBlock = null

    // Find the parent block (paragraph, div, or text node's parent)
    while (node && node.nodeType !== 1) {
      node = node.parentNode
    }

    if (node) {
      parentBlock = node
      lineText = node.textContent.trim()
    }

    // Create list
    const list = type === 'numbered' ? document.createElement('ol') : document.createElement('ul')
    const item = document.createElement('li')

    // If there's text on the current line, use it as first item
    if (lineText) {
      item.innerHTML = parentBlock.innerHTML
    } else {
      item.innerHTML = '<br>'
    }

    if (type === 'checkbox') {
      item.classList.add('checkbox-list-item')
    }

    list.appendChild(item)

    // Replace the current block with the list (if there was a block)
    if (parentBlock && parentBlock.parentNode && lineText) {
      parentBlock.parentNode.replaceChild(list, parentBlock)
    } else {
      // Insert at cursor if no block found
      range.insertNode(list)
    }

    // EXPLICITLY move cursor into the item
    const newRange = document.createRange()
    newRange.selectNodeContents(item)
    newRange.collapse(false)
    sel.removeAllRanges()
    sel.addRange(newRange)

    return true
  }
}

/**
 * Handle Enter key in list - create new item, split list, or exit list if empty
 * CRITICAL: Always explicitly set cursor position
 * Supports: 1x Enter = new item, 2x Enter = split list or exit
 * @returns {boolean} True if handled, false otherwise
 */
export const handleListEnter = () => {
  const sel = window.getSelection()
  if (!sel.rangeCount) return false

  const currentType = detectCurrentListType()
  if (!currentType) return false

  const range = sel.getRangeAt(0)
  let node = range.startContainer

  // Find the LI element - traverse up from current position
  while (node && node.nodeName !== 'LI') {
    node = node.parentNode
  }

  if (!node || node.nodeName !== 'LI') return false

  const list = node.parentNode
  const listParent = list.parentNode
  const allItems = getListItems(list)
  const currentItemIndex = allItems.indexOf(node)

  // Check if current item is empty
  if (isListItemEmpty(node)) {
    // Remove the empty item
    node.remove()
    
    // Check if there are items after this one (split list case)
    const itemsAfter = allItems.slice(currentItemIndex + 1)
    
    if (itemsAfter.length > 0) {
      // SPLIT LIST: Create second list with remaining items
      // cloneNode(false) preserves list type (UL/OL) and all attributes
      const secondList = list.cloneNode(false)
      
      // Move remaining items to second list (preserves all classes and content)
      itemsAfter.forEach((item) => {
        secondList.appendChild(item)  // appendChild moves, doesn't copy
      })
      
      // Insert second list after first list
      if (list.nextSibling) {
        listParent.insertBefore(secondList, list.nextSibling)
      } else {
        listParent.appendChild(secondList)
      }
      
      // Place cursor at beginning of second list
      const firstItemInSecondList = secondList.children[0]
      if (firstItemInSecondList) {
        const newRange = document.createRange()
        newRange.selectNodeContents(firstItemInSecondList)
        newRange.collapse(true)
        sel.removeAllRanges()
        sel.addRange(newRange)
      }
      
      return true
    } else {
      // EXIT LIST: No items after, so exit the list
      // Create a new paragraph element AFTER the list
      const paragraph = document.createElement('p')
      paragraph.innerHTML = '<br>'
      
      // Insert paragraph AFTER the list
      if (list.nextSibling) {
        listParent.insertBefore(paragraph, list.nextSibling)
      } else {
        listParent.appendChild(paragraph)
      }
      
      // EXPLICITLY set cursor into paragraph (below the list)
      const newRange = document.createRange()
      newRange.setStart(paragraph, 0)
      newRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(newRange)
      
      return true
    }
  }

  // Item has content - create new list item
  const newItem = document.createElement('li')
  newItem.innerHTML = '<br>'

  if (currentType === 'checkbox') {
    newItem.classList.add('checkbox-list-item')
  }

  // Insert after current item
  node.parentNode.insertBefore(newItem, node.nextSibling)

  // EXPLICITLY set cursor into new item
  const newRange = document.createRange()
  newRange.selectNodeContents(newItem)
  newRange.collapse(false)
  sel.removeAllRanges()
  sel.addRange(newRange)

  return true
}

/**
 * Handle Backspace in list - remove item, exit list, or restore previous list
 * CRITICAL: Always explicitly set cursor position
 * @param {Object} lastListState - State of previous list for restoration
 * @returns {Object} {handled: boolean, newListState: Object|null}
 */
export const handleListBackspace = (lastListState = null) => {
  const sel = window.getSelection()
  if (!sel.rangeCount) return { handled: false, newListState: null }

  const range = sel.getRangeAt(0)

  // Only handle if cursor is at start of item
  if (range.startOffset !== 0) return { handled: false, newListState: null }

  let node = range.startContainer

  // Find the LI element - traverse up from current position
  while (node && node.nodeName !== 'LI') {
    node = node.parentNode
  }

  if (!node || node.nodeName !== 'LI') return { handled: false, newListState: null }

  const list = node.parentNode
  const items = getListItems(list)

  // If only one item, exit list completely
  if (items.length === 1) {
    // Save list state for potential restoration
    const listState = {
      type: detectCurrentListType(),
      items: items.map((item) => ({
        content: getListItemContent(item),
        isCheckbox: item.classList.contains('checkbox-list-item'),
        isChecked: item.classList.contains('checked'),
      })),
    }

    // Create paragraph to place cursor in
    const paragraph = document.createElement('p')
    paragraph.innerHTML = '<br>'
    
    // Insert paragraph BEFORE the list
    list.parentNode.insertBefore(paragraph, list)
    
    // Remove the list
    list.remove()

    // EXPLICITLY set cursor into paragraph
    const newRange = document.createRange()
    newRange.setStart(paragraph, 0)
    newRange.collapse(true)
    sel.removeAllRanges()
    sel.addRange(newRange)

    return { handled: true, newListState: listState }
  }

  // If first item, just delete it
  if (items[0] === node) {
    node.remove()
    return { handled: true, newListState: null }
  }

  // Otherwise, merge with previous item
  const prevItem = node.previousSibling
  if (prevItem) {
    prevItem.innerHTML += node.innerHTML
    node.remove()

    // EXPLICITLY set cursor in previous item
    const newRange = document.createRange()
    newRange.selectNodeContents(prevItem)
    newRange.collapse(false)
    sel.removeAllRanges()
    sel.addRange(newRange)

    return { handled: true, newListState: null }
  }

  return { handled: false, newListState: null }
}

/**
 * Restore a previously exited list (for Backspace recovery)
 * @param {Object} listState - State of list to restore
 * @returns {boolean} True if restored, false otherwise
 */
export const restoreListFromState = (listState) => {
  if (!listState || !listState.type) return false

  const sel = window.getSelection()
  if (!sel.rangeCount) return false

  const range = sel.getRangeAt(0)
  let node = range.startContainer

  // Find the text node or element at cursor
  while (node && node.nodeType !== 3 && node.nodeName !== 'BR') {
    node = node.parentNode
  }

  if (!node) return false

  // Create new list
  const list = listState.type === 'numbered' 
    ? document.createElement('ol')
    : document.createElement('ul')

  // Restore items
  listState.items.forEach((itemState) => {
    const item = document.createElement('li')
    item.innerHTML = itemState.content

    if (itemState.isCheckbox) {
      item.classList.add('checkbox-list-item')
      if (itemState.isChecked) {
        item.classList.add('checked')
      }
    }

    list.appendChild(item)
  })

  // Add new empty item for cursor
  const newItem = document.createElement('li')
  newItem.innerHTML = '<br>'
  if (listState.type === 'checkbox') {
    newItem.classList.add('checkbox-list-item')
  }
  list.appendChild(newItem)

  // Insert list at cursor position
  if (node.nodeName === 'BR') {
    node.parentNode.replaceChild(list, node)
  } else {
    node.parentNode.insertBefore(list, node)
  }

  // Move cursor to new item
  range.selectNodeContents(newItem)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)

  return true
}

/**
 * Toggle checkbox state for current list item
 * @returns {boolean} True if toggled, false otherwise
 */
export const toggleCheckbox = () => {
  const sel = window.getSelection()
  if (!sel.rangeCount) return false

  const range = sel.getRangeAt(0)
  let node = range.startContainer

  // Find the LI element
  while (node && node.nodeName !== 'LI') {
    node = node.parentNode
  }

  if (!node || node.nodeName !== 'LI') return false

  if (!node.classList.contains('checkbox-list-item')) return false

  node.classList.toggle('checked')
  return true
}

/**
 * Get checkbox state for a list item
 * @param {HTMLElement} item - The LI element
 * @returns {boolean} True if checked, false otherwise
 */
export const isCheckboxChecked = (item) => {
  return item.classList.contains('checked')
}
