// Modelo de dados do construtor de e-mail (blocos arrastáveis, estilo DOX).
// O e-mail é uma lista ordenada de blocos + configurações globais (molde DOX).

export type BlockAlign = "left" | "center" | "right";

export type BannerBlock = {
  id: string;
  type: "banner";
  src: string;
  alt?: string;
  href?: string;
};

export type HeadingBlock = {
  id: string;
  type: "heading";
  text: string;
  level: 2 | 3;
  align: BlockAlign;
};

export type TextBlock = {
  id: string;
  type: "text";
  /** HTML rico vindo do editor (parágrafos justificados, negrito, links...). */
  html: string;
};

export type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  alt?: string;
  href?: string;
  caption?: string;
  /** Largura em % da coluna (padrão 100). */
  widthPct?: number;
};

export type GalleryBlock = {
  id: string;
  type: "gallery";
  images: { src: string; alt?: string }[];
  caption?: string;
};

export type ButtonBlock = {
  id: string;
  type: "button";
  text: string;
  href: string;
  align: BlockAlign;
};

export type DividerBlock = {
  id: string;
  type: "divider";
  variant: "line" | "space";
};

export type EmailBlock =
  | BannerBlock
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | GalleryBlock
  | ButtonBlock
  | DividerBlock;

export type EmailBlockType = EmailBlock["type"];

export interface EmailDoc {
  /** Texto de pré-cabeçalho (preview na caixa de entrada). */
  preheader?: string;
  blocks: EmailBlock[];
  /** Imagem fixa de rodapé ("Agradecemos sua leitura!"). */
  footerImageUrl?: string;
  footerImageHref?: string;
  /** Link de descadastro/preferências. */
  unsubscribeUrl?: string;
  /** Mostra a linha "Não consegue ver? Veja no navegador". */
  showViewInBrowser?: boolean;
}

let counter = 0;
const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Cria um bloco novo com valores padrão para cada tipo. */
export function createBlock(type: EmailBlockType): EmailBlock {
  switch (type) {
    case "banner":
      return { id: uid("banner"), type, src: "", alt: "" };
    case "heading":
      return { id: uid("heading"), type, text: "Título da seção", level: 2, align: "left" };
    case "text":
      return { id: uid("text"), type, html: "<p>Escreva o texto aqui...</p>" };
    case "image":
      return { id: uid("image"), type, src: "", alt: "", caption: "", widthPct: 100 };
    case "gallery":
      return { id: uid("gallery"), type, images: [], caption: "" };
    case "button":
      return { id: uid("button"), type, text: "Acesse aqui!", href: "", align: "center" };
    case "divider":
      return { id: uid("divider"), type, variant: "space" };
  }
}

export const BLOCK_LABELS: Record<EmailBlockType, string> = {
  banner: "Banner",
  heading: "Título",
  text: "Texto",
  image: "Imagem",
  gallery: "Galeria",
  button: "Botão",
  divider: "Divisor",
};
