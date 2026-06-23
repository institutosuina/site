import { useRef, useState } from 'react'
import Image from '@tiptap/extension-image'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'

const ResizableImageComponent = (props: any) => {
  const { node, updateAttributes, selected } = props
  const { src, alt, width } = node.attrs
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [resizing, setResizing] = useState(false)

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = wrapperRef.current?.offsetWidth || 0
    setResizing(true)

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX
      const newWidth = Math.max(80, Math.round(startWidth + delta))
      updateAttributes({ width: newWidth })
    }

    const onMouseUp = () => {
      setResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <NodeViewWrapper as="span" className="inline-block">
      <span
        ref={wrapperRef}
        className="relative inline-block"
        style={{ width: width ? `${width}px` : undefined, maxWidth: '100%' }}
      >
        <img
          src={src}
          alt={alt}
          className={`rounded-2xl max-w-full h-auto border border-zinc-100 shadow-sm block ${selected ? 'ring-2 ring-emerald-400' : ''}`}
          style={{ width: '100%' }}
        />
        {selected && (
          <span
            onMouseDown={startResize}
            className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full cursor-se-resize shadow"
            title="Arraste para redimensionar"
          />
        )}
      </span>
    </NodeViewWrapper>
  )
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => (attributes.width ? { width: attributes.width } : {}),
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
})

export default ResizableImage
