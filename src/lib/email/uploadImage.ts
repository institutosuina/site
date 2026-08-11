// Abre o seletor de arquivo e sobe a imagem para o R2,
// retornando a URL pública (usada pelos blocos do construtor de e-mail).

import { subirParaR2 } from "@/lib/storage/upload";

export async function pickAndUploadImage(bucket = "covers"): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const safeName = file.name.replace(/[^\w.-]+/g, "_");
        const path = `email/${Date.now()}-${safeName}`;
        resolve(await subirParaR2(bucket, path, file));
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}
