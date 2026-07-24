// Abre o seletor de arquivo e sobe a imagem para o Supabase Storage,
// retornando a URL pública (usada pelos blocos do construtor de e-mail).

import { supabase } from "@/integrations/supabase/client";

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
        const { error } = await supabase.storage.from(bucket).upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        resolve(data.publicUrl);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}
