// Compressão de imagem no navegador, antes de qualquer upload.
// Usa canvas puro — sem dependência nova — e devolve um File pronto para envio.
//
// Motivo: o bucket do Supabase estourou 1 GB porque as imagens subiam no
// tamanho original de câmera (3-8 MB cada). Redimensionadas para 1600px e
// reencodadas em WebP, as mesmas imagens ficam entre 80 e 250 KB, sem
// diferença visível nas telas onde o site as exibe.

export const LIMITE_IMAGEM_MB = 15;
export const LIMITE_ARQUIVO_MB = 10;

const DIMENSAO_MAXIMA = 1600;
const QUALIDADE = 0.82;

// GIF perde a animação ao passar pelo canvas e SVG é vetor (já é leve):
// os dois seguem intactos.
const FORMATOS_PRESERVADOS = ["image/gif", "image/svg+xml"];

export function ehImagem(file: File) {
  return file.type.startsWith("image/");
}

function carregarBitmap(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}

/**
 * Reduz a imagem para no máximo 1600px no maior lado e reencoda em WebP.
 * Devolve o arquivo original quando a compressão não compensa (formato
 * preservado, imagem já pequena, ou resultado maior que a entrada).
 */
export async function comprimirImagem(file: File): Promise<File> {
  if (!ehImagem(file) || FORMATOS_PRESERVADOS.includes(file.type)) return file;

  let img: HTMLImageElement;
  try {
    img = await carregarBitmap(file);
  } catch {
    return file; // arquivo ilegível como imagem: deixa o upload decidir
  }

  const maiorLado = Math.max(img.width, img.height);
  const escala = maiorLado > DIMENSAO_MAXIMA ? DIMENSAO_MAXIMA / maiorLado : 1;

  // Já está pequena em dimensão e em bytes: não há o que ganhar.
  if (escala === 1 && file.size <= 300 * 1024) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALIDADE)
  );
  if (!blob || blob.size >= file.size) return file;

  const nomeBase = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${nomeBase}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

export function formatarMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
