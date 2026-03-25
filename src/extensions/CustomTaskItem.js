import TaskItem from '@tiptap/extension-task-item'

export const CustomTaskItem = TaskItem.extend({
  renderHTML({ HTMLAttributes }) {
    const isChecked = HTMLAttributes['data-checked']
    
    return [
      'li',
      {
        'data-type': 'taskItem',
        'data-checked': isChecked,
        class: 'task-item-custom',
        style: 'display: flex; align-items: center; gap: 8px; list-style: none; margin: 0.25em 0; padding: 0;',
      },
      [
        'input',
        {
          type: 'checkbox',
          checked: isChecked ? true : undefined,
          contenteditable: false,
          style: 'width: 18px; height: 18px; margin: 0; flex-shrink: 0; cursor: pointer;',
        },
      ],
      [
        'div',
        {
          style: 'flex: 1; display: inline;',
        },
        0,
      ],
    ]
  },
})
