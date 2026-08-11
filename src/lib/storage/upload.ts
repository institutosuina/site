// Ponto único de entrada para subir arquivo em bucket.
//
// Todo upload do admin passa por aqui: comprime imagem, aplica teto de
// tamanho e devolve a URL pública. O armazenamento é o Cloudflare R2 — o
// arquivo antigo do Supabase Storage foi migrado pra lá (ver
// scripts/migrar-editais-r2.cjs), então uploads novos seguem o mesmo padrão de
// key ("<bucket>/<caminho>") servido em files.institutosuina.org.
//
// O navegador nunca tem a access key do R2: a Edge Function `r2-upload-url`
// devolve uma URL de PUT assinada (só pra quem estiver autenticado) e o
// upload em si vai direto do navegador pro R2.

import { supabase } from "@/integrations/supabase/client";
import {
  comprimirImagem,
  ehImagem,
  formatarMB,
  LIMITE_ARQUIVO_MB,
  LIMITE_IMAGEM_MB,
} from "./compress";

export function nomeSeguro(nome: string) {
  return nome.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/** Monta `<prefixo>/<timestamp>-<nome-seguro>`, o padrão já usado nos buckets. */
export function caminhoComTimestamp(prefixo: string, nome: string) {
  const base = prefixo ? `${prefixo}/` : "";
  return `${base}${Date.now()}-${nomeSeguro(nome)}`;
}

export interface ResultadoUpload {
  publicUrl: string;
  path: string;
  /** Bytes economizados pela compressão — 0 quando o arquivo subiu intacto. */
  economia: number;
}

/**
 * Sobe o arquivo já comprimido e devolve a URL pública.
 * Lança Error com mensagem pronta para exibir ao usuário.
 */
export async function subirArquivo(
  bucket: string,
  path: string,
  file: File
): Promise<ResultadoUpload> {
  const tamanhoOriginal = file.size;
  const imagem = ehImagem(file);

  const limiteMB = imagem ? LIMITE_IMAGEM_MB : LIMITE_ARQUIVO_MB;
  if (file.size > limiteMB * 1024 * 1024) {
    throw new Error(
      `O arquivo tem ${formatarMB(file.size)} e o limite é ${limiteMB} MB. ` +
        (imagem
          ? "Reduza a imagem antes de enviar."
          : "Comprima o PDF (por exemplo em ilovepdf.com/compress_pdf) e envie novamente.")
    );
  }

  const enviar = imagem ? await comprimirImagem(file) : file;

  // A compressão troca a extensão para .webp; o caminho precisa acompanhar,
  // senão a URL pública fica com extensão que não corresponde ao conteúdo.
  const caminhoFinal =
    enviar.name !== file.name
      ? path.replace(/\.[^./]+$/, "") + ".webp"
      : path;

  const publicUrl = await subirParaR2(bucket, caminhoFinal, enviar);

  return {
    publicUrl,
    path: caminhoFinal,
    economia: tamanhoOriginal - enviar.size,
  };
}

/**
 * Pede uma URL de PUT assinada pra Edge Function `r2-upload-url` e sobe o
 * arquivo direto pro R2. Usado tanto por `subirArquivo` quanto pelos poucos
 * lugares que ainda precisam montar o caminho manualmente.
 */
export async function subirParaR2(bucket: string, path: string, file: File | Blob): Promise<string> {
  const contentType = "type" in file ? file.type : "application/octet-stream";

  const { data, error } = await supabase.functions.invoke("r2-upload-url", {
    body: { bucket, path, contentType },
  });
  if (error) throw new Error(error.message || "Falha ao gerar URL de upload");
  if (!data?.uploadUrl) throw new Error(data?.error || "Falha ao gerar URL de upload");

  const resposta = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": data.contentType || contentType },
    body: file,
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao enviar arquivo para o R2 (HTTP ${resposta.status})`);
  }

  return data.publicUrl as string;
}
