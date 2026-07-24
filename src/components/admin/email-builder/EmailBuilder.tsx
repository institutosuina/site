// Construtor de e-mail arrasta-e-solta (estilo Wix "Elementos") no molde DOX.
// - Esquerda: paleta de elementos (arraste para o canvas).
// - Centro: canvas com os blocos (reordenáveis por arraste, editáveis inline).
// - Direita: preview ao vivo do e-mail (iframe).

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  GripVertical, Trash2, Copy, ChevronDown, ChevronUp, Upload, X,
  Image as ImageIcon, Heading as HeadingIcon, Type, Images,
  MousePointerClick, Minus, LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlockEditor from "./BlockEditor";
import { renderEmailHtml } from "@/lib/email/render";
import { pickAndUploadImage } from "@/lib/email/uploadImage";
import {
  BLOCK_LABELS, createBlock, type EmailBlock, type EmailBlockType, type EmailDoc,
} from "@/lib/email/types";

const PALETTE: { type: EmailBlockType; icon: React.ElementType }[] = [
  { type: "banner", icon: LayoutTemplate },
  { type: "heading", icon: HeadingIcon },
  { type: "text", icon: Type },
  { type: "image", icon: ImageIcon },
  { type: "gallery", icon: Images },
  { type: "button", icon: MousePointerClick },
  { type: "divider", icon: Minus },
];

const blockSummary = (block: EmailBlock): string => {
  switch (block.type) {
    case "banner": return block.src ? "imagem definida" : "sem imagem";
    case "heading": return block.text || "(vazio)";
    case "text": return block.html.replace(/<[^>]+>/g, " ").trim().slice(0, 48) || "(vazio)";
    case "image": return block.src ? (block.caption || "imagem") : "sem imagem";
    case "gallery": return `${block.images.length} imagem(ns)`;
    case "button": return block.text || "(vazio)";
    case "divider": return block.variant === "line" ? "linha" : "espaço";
  }
};

export default function EmailBuilder({
  doc,
  onChange,
}: {
  doc: EmailDoc;
  onChange: (doc: EmailDoc) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const setBlocks = (blocks: EmailBlock[]) => onChange({ ...doc, blocks });

  const updateBlock = (id: string, next: EmailBlock) =>
    setBlocks(doc.blocks.map((b) => (b.id === id ? next : b)));

  const removeBlock = (id: string) => setBlocks(doc.blocks.filter((b) => b.id !== id));

  const duplicateBlock = (id: string) => {
    const idx = doc.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const copy = { ...doc.blocks[idx], id: `${doc.blocks[idx].type}-${Date.now().toString(36)}` } as EmailBlock;
    const next = [...doc.blocks];
    next.splice(idx + 1, 0, copy);
    setBlocks(next);
  };

  const addBlock = (type: EmailBlockType, index?: number) => {
    const block = createBlock(type);
    const next = [...doc.blocks];
    next.splice(index ?? next.length, 0, block);
    setBlocks(next);
    setSelectedId(block.id);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // Arrastou um elemento da paleta para o canvas -> cria bloco novo.
    if (source.droppableId === "palette" && destination.droppableId === "canvas") {
      const type = PALETTE[source.index].type;
      const block = createBlock(type);
      const next = [...doc.blocks];
      next.splice(destination.index, 0, block);
      setBlocks(next);
      setSelectedId(block.id);
      return;
    }

    // Reordenou dentro do canvas.
    if (source.droppableId === "canvas" && destination.droppableId === "canvas") {
      const next = [...doc.blocks];
      const [moved] = next.splice(source.index, 1);
      next.splice(destination.index, 0, moved);
      setBlocks(next);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr_minmax(0,340px)] gap-4">
        {/* Paleta de elementos */}
        <Droppable droppableId="palette" isDropDisabled renderClone={(provided, _snapshot, rubric) => {
          const item = PALETTE[rubric.source.index];
          const Icon = item.icon;
          return (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-300 bg-white shadow-lg text-sm text-zinc-700">
              <Icon className="h-4 w-4 text-emerald-600" /> {BLOCK_LABELS[item.type]}
            </div>
          );
        }}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5 h-fit">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 px-1 mb-1">Elementos</p>
              {PALETTE.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Draggable key={item.type} draggableId={`palette-${item.type}`} index={index}>
                    {(prov) => (
                      <>
                        <div
                          ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                          onClick={() => addBlock(item.type)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-600 hover:border-emerald-300 hover:text-emerald-700 cursor-grab active:cursor-grabbing transition-colors"
                          title="Arraste para o e-mail ou clique para adicionar"
                        >
                          <Icon className="h-4 w-4" /> {BLOCK_LABELS[item.type]}
                        </div>
                      </>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              <button
                type="button"
                onClick={() => setShowSettings((v) => !v)}
                className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-zinc-200 text-xs text-zinc-500 hover:text-emerald-600"
              >
                Configurações {showSettings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </Droppable>

        {/* Canvas */}
        <div className="min-w-0">
          {showSettings && <SettingsPanel doc={doc} onChange={onChange} />}
          <Droppable droppableId="canvas">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef} {...provided.droppableProps}
                className={`space-y-2 rounded-xl border-2 border-dashed p-3 min-h-[240px] transition-colors ${
                  snapshot.isDraggingOver ? "border-emerald-400 bg-emerald-50/40" : "border-zinc-200 bg-zinc-50/60"
                }`}
              >
                {doc.blocks.length === 0 && !snapshot.isDraggingOver && (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-zinc-400 text-sm">
                    <LayoutTemplate className="h-8 w-8 mb-2" />
                    Arraste os elementos aqui<br />ou clique num elemento à esquerda.
                  </div>
                )}
                {doc.blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef} {...prov.draggableProps}
                        className={`rounded-lg border bg-white ${
                          snap.isDragging ? "shadow-lg border-emerald-300" : "border-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 px-3 py-2">
                          <span {...prov.dragHandleProps} className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-4 w-4" />
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedId(selectedId === block.id ? null : block.id)}
                            className="flex-1 flex items-center gap-2 text-left min-w-0"
                          >
                            <span className="text-xs font-semibold text-emerald-700 shrink-0">{BLOCK_LABELS[block.type]}</span>
                            <span className="text-xs text-zinc-400 truncate">{blockSummary(block)}</span>
                          </button>
                          <button type="button" onClick={() => duplicateBlock(block.id)} title="Duplicar"
                            className="text-zinc-300 hover:text-zinc-600">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => removeBlock(block.id)} title="Remover"
                            className="text-zinc-300 hover:text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => setSelectedId(selectedId === block.id ? null : block.id)}
                            className="text-zinc-300 hover:text-zinc-600">
                            {selectedId === block.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                        {selectedId === block.id && (
                          <div className="px-3 pb-3 pt-1 border-t border-zinc-100">
                            <BlockEditor block={block} onChange={(next) => updateBlock(block.id, next)} />
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Preview ao vivo */}
        <div className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 px-1 mb-1">Pré-visualização</p>
          <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-100 sticky top-2">
            <iframe
              title="Pré-visualização do e-mail"
              srcDoc={renderEmailHtml(doc)}
              className="w-full h-[540px] bg-white"
            />
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

function SettingsPanel({ doc, onChange }: { doc: EmailDoc; onChange: (doc: EmailDoc) => void }) {
  return (
    <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">Rodapé fixo ("Agradecemos sua leitura!")</label>
        <div className="flex items-center gap-3">
          {doc.footerImageUrl ? (
            <img src={doc.footerImageUrl} alt="" className="h-16 rounded-lg border border-zinc-200" />
          ) : (
            <div className="h-16 w-28 rounded-lg border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-300">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Button type="button" variant="outline" size="sm" className="!text-xs gap-1.5"
              onClick={async () => {
                const url = await pickAndUploadImage();
                if (url) onChange({ ...doc, footerImageUrl: url });
              }}>
              <Upload className="h-3.5 w-3.5" /> {doc.footerImageUrl ? "Trocar" : "Enviar"} imagem
            </Button>
            {doc.footerImageUrl && (
              <button type="button" onClick={() => onChange({ ...doc, footerImageUrl: undefined })}
                className="text-[11px] text-zinc-400 hover:text-red-500 inline-flex items-center gap-1">
                <X className="h-3 w-3" /> remover
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">Pré-cabeçalho (preview na caixa de entrada)</label>
        <Input value={doc.preheader ?? ""} onChange={(e) => onChange({ ...doc, preheader: e.target.value })}
          placeholder="Resumo curto que aparece antes de abrir o e-mail" className="!text-sm" />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">Link de descadastro / preferências</label>
        <Input value={doc.unsubscribeUrl ?? ""} onChange={(e) => onChange({ ...doc, unsubscribeUrl: e.target.value })}
          placeholder="https://institutosuina.org/preferencias" className="!text-sm" />
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
        <input type="checkbox" checked={doc.showViewInBrowser ?? false}
          onChange={(e) => onChange({ ...doc, showViewInBrowser: e.target.checked })}
          className="accent-emerald-500" />
        Mostrar "Não consegue ver? Veja no navegador"
      </label>
    </div>
  );
}
