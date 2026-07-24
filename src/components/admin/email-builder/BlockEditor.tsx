// Formulário de edição de um bloco do construtor de e-mail.
// Renderiza os campos conforme o tipo do bloco.

import { Image as ImageIcon, Upload, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TiptapEditor from "@/components/admin/TiptapEditor";
import { pickAndUploadImage } from "@/lib/email/uploadImage";
import type { BlockAlign, EmailBlock } from "@/lib/email/types";

const alignOptions: { value: BlockAlign; label: string }[] = [
  { value: "left", label: "Esq." },
  { value: "center", label: "Centro" },
  { value: "right", label: "Dir." },
];

function AlignPicker({ value, onChange }: { value: BlockAlign; onChange: (v: BlockAlign) => void }) {
  return (
    <div className="flex gap-1">
      {alignOptions.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
            value === o.value
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ImageField({
  src,
  onChange,
  label = "Imagem",
}: {
  src?: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      {src ? (
        <div className="relative inline-block">
          <img src={src} alt="" className="max-h-32 rounded-lg border border-zinc-200" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-zinc-200 text-zinc-400">
          <ImageIcon className="h-6 w-6" />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="!text-xs gap-1.5"
        onClick={async () => {
          const url = await pickAndUploadImage();
          if (url) onChange(url);
        }}
      >
        <Upload className="h-3.5 w-3.5" /> {src ? `Trocar ${label.toLowerCase()}` : `Enviar ${label.toLowerCase()}`}
      </Button>
    </div>
  );
}

const fieldLabel = "text-xs font-medium text-zinc-500";

export default function BlockEditor({
  block,
  onChange,
}: {
  block: EmailBlock;
  onChange: (block: EmailBlock) => void;
}) {
  switch (block.type) {
    case "banner":
      return (
        <div className="space-y-3">
          <ImageField src={block.src} label="banner" onChange={(src) => onChange({ ...block, src })} />
          <div className="space-y-1">
            <label className={fieldLabel}>Link ao clicar (opcional)</label>
            <Input
              value={block.href ?? ""}
              onChange={(e) => onChange({ ...block, href: e.target.value })}
              placeholder="https://..."
              className="!text-sm"
            />
          </div>
        </div>
      );

    case "heading":
      return (
        <div className="space-y-3">
          <Input
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Título da seção"
            className="!text-sm font-semibold"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1">
              {([2, 3] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChange({ ...block, level: lvl })}
                  className={`px-2.5 py-1 rounded-md text-xs border ${
                    block.level === lvl
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-zinc-600 border-zinc-200"
                  }`}
                >
                  {lvl === 2 ? "Grande" : "Médio"}
                </button>
              ))}
            </div>
            <AlignPicker value={block.align} onChange={(align) => onChange({ ...block, align })} />
          </div>
        </div>
      );

    case "text":
      return (
        <TiptapEditor
          content={block.html}
          onChange={(html) => onChange({ ...block, html })}
          storageBucket="covers"
        />
      );

    case "image":
      return (
        <div className="space-y-3">
          <ImageField src={block.src} onChange={(src) => onChange({ ...block, src })} />
          <div className="space-y-1">
            <label className={fieldLabel}>Legenda (opcional)</label>
            <Input
              value={block.caption ?? ""}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="Ex: Fotos - Equipe Instituto Suinã"
              className="!text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className={fieldLabel}>Link ao clicar (opcional)</label>
            <Input
              value={block.href ?? ""}
              onChange={(e) => onChange({ ...block, href: e.target.value })}
              placeholder="https://..."
              className="!text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className={fieldLabel}>Largura</label>
            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={block.widthPct ?? 100}
              onChange={(e) => onChange({ ...block, widthPct: Number(e.target.value) })}
              className="flex-1 accent-emerald-500"
            />
            <span className="text-xs text-zinc-500 w-10 text-right">{block.widthPct ?? 100}%</span>
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {block.images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img.src} alt="" className="h-20 w-20 object-cover rounded-lg border border-zinc-200" />
                <button
                  type="button"
                  onClick={() => onChange({ ...block, images: block.images.filter((_, j) => j !== i) })}
                  className="absolute -top-1.5 -right-1.5 bg-white rounded-full border border-zinc-200 text-zinc-400 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {block.images.length < 3 && (
              <button
                type="button"
                onClick={async () => {
                  const url = await pickAndUploadImage();
                  if (url) onChange({ ...block, images: [...block.images, { src: url, alt: "" }] });
                }}
                className="h-20 w-20 rounded-lg border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-emerald-300 flex items-center justify-center"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="space-y-1">
            <label className={fieldLabel}>Legenda (opcional)</label>
            <Input
              value={block.caption ?? ""}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="Ex: Fotos - Equipe SOS Mata Atlântica"
              className="!text-sm"
            />
          </div>
          <p className="text-[11px] text-zinc-400">As imagens ficam lado a lado (até 3).</p>
        </div>
      );

    case "button":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className={fieldLabel}>Texto do botão</label>
            <Input
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Acesse aqui!"
              className="!text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className={fieldLabel}>Link</label>
            <Input
              value={block.href}
              onChange={(e) => onChange({ ...block, href: e.target.value })}
              placeholder="https://..."
              className="!text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className={fieldLabel}>Alinhamento</label>
            <AlignPicker value={block.align} onChange={(align) => onChange({ ...block, align })} />
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="flex gap-1">
          {(["space", "line"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ ...block, variant: v })}
              className={`px-3 py-1.5 rounded-md text-xs border ${
                block.variant === v
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-white text-zinc-600 border-zinc-200"
              }`}
            >
              {v === "space" ? "Espaço" : "Linha"}
            </button>
          ))}
        </div>
      );
  }
}
