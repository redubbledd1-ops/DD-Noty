import { Extension } from '@tiptap/core'
import { TextStyle } from '@tiptap/extension-text-style'

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const fontSize = element.style.fontSize
              return fontSize ? fontSize : null
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ commands }) => {
          return commands.setMark('textStyle', { fontSize })
        },
      unsetFontSize:
        () =>
        ({ commands }) => {
          return commands.resetAttributes('textStyle', 'fontSize')
        },
    }
  },
})
