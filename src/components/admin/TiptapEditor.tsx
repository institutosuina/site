import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Heading2, Heading3, 
  Link as LinkIcon, Image as ImageIcon, 
  Undo, Redo, Type,
  AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import TextAlign from '@tiptap/extension-text-align'

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  storageBucket?: string;
}

const MenuBar = ({ editor, storageBucket = 'covers' }: { editor: any, storageBucket?: string }) => {
  if (!editor) return null

  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        try {
          const path = `editor/${Date.now()}-${file.name}`
          const { error } = await supabase.storage.from(storageBucket).upload(path, file)
          if (error) throw error
          const { data } = supabase.storage.from(storageBucket).getPublicUrl(path)
          editor.chain().focus().setImage({ src: data.publicUrl }).run()
        } catch (err: any) {
          toast({ title: 'Erro ao subir imagem', description: err.message, variant: 'destructive' })
        }
      }
    }
    input.click()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const setButton = () => {
    const { from, to } = editor.state.selection;
    const isNoSelection = from === to;

    let buttonText = "";
    if (isNoSelection) {
      buttonText = window.prompt('Texto que aparecerá dentro do botão:', 'Clique aqui') || "";
      if (!buttonText) return;
    }

    const url = window.prompt('Para qual site/página o botão deve levar?', '');
    if (!url) return;

    if (isNoSelection) {
      editor.chain().focus().insertContent(`<a href="${url}" class="suina-button-link">${buttonText}</a> `).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url, class: 'suina-button-link' }).run();
    }
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-zinc-50 sticky top-0 z-10 rounded-t-lg">
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-zinc-200' : ''} title="Negrito"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-zinc-200' : ''} title="Itálico"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'bg-zinc-200' : ''} title="Sublinhado"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />
      
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200' : ''} title="Título 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-zinc-200' : ''} title="Título 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />

      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-200' : ''} title="Alinhar à Esquerda"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-200' : ''} title="Centralizar"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-200' : ''} title="Alinhar à Direita"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={editor.isActive({ textAlign: 'justify' }) ? 'bg-zinc-200' : ''} title="Justificar"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />
      
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-zinc-200' : ''} title="Lista de Marcadores"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-zinc-200' : ''} title="Lista Numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />

      <Button variant="ghost" size="sm" onClick={setLink} className={editor.isActive('link') ? 'bg-zinc-200' : ''} title="Inserir Link">
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={setButton} className="text-secondary font-bold" title="Inserir Botão Suinã">
        <Type className="h-4 w-4 mr-1" /> Botão
      </Button>
      <Button variant="ghost" size="sm" onClick={addImage} title="Inserir Imagem">
        <ImageIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-zinc-300 mx-1 self-center" />

      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} title="Refazer">
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

const TiptapEditor = ({ content, onChange, storageBucket }: TiptapEditorProps) => {
  const CustomLink = Link.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        class: {
          default: null,
        },
      }
    },
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto mx-auto my-8 border border-zinc-100 shadow-sm',
        },
      }),
      CustomLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-secondary hover:underline cursor-pointer',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc prose-lg focus:outline-none min-h-[400px] p-4 max-w-none',
      },
    },
  })

  useEffect(() => {
    if (editor && content && editor.getHTML() === '<p></p>' && content !== '<p></p>') {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-zinc-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <MenuBar editor={editor} storageBucket={storageBucket} />
      <EditorContent editor={editor} />
      <style>{`
        .prose .suina-button-link,
        .suina-button-link {
          display: inline-block !important;
          background-color: #3e2723 !important;
          color: white !important;
          padding: 12px 32px !important;
          border-radius: 9999px !important;
          text-decoration: none !important;
          font-weight: bold !important;
          margin: 10px 0 !important;
          transition: all 0.2s !important;
          border: none !important;
        }
        .prose .suina-button-link:hover,
        .suina-button-link:hover {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
        }
        .prose ul, .prose ol {
          padding-left: 1.5rem !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
        }
        .prose ul {
          list-style-type: disc !important;
        }
        .prose ol {
          list-style-type: decimal !important;
        }
        .prose li {
          margin-bottom: 0.5rem !important;
        }
      `}</style>
    </div>
  )
}

export default TiptapEditor
