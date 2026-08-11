// Edge Function: r2-upload-url
// Chamada do admin via supabase.functions.invoke("r2-upload-url", { body: {...} })
// Devolve uma URL de PUT assinada (SigV4) para o Cloudflare R2, para o navegador
// subir o arquivo direto pro R2 sem expor a access key/secret no client.
//
// Secrets esperados na função:
//   R2_ACCOUNT_ID           (opcional, tem default abaixo)
//   R2_ACCESS_KEY_ID
//   R2_SECRET_ACCESS_KEY
//
// A key no R2 é "<bucket>/<path>", mesmo esquema de prefixo usado na migração
// (scripts/migrar-editais-r2.cjs) — um bucket único no R2 com um prefixo por
// "bucket lógico" antigo do Supabase Storage.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID") ?? "7b663c3edb17727dfdd7351c3c8cfcc9";
const ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY");
const ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_BUCKET = "institutosuina-arquivos";
const PUBLIC_BASE = "https://files.institutosuina.org";

// Os mesmos "buckets lógicos" que existiam no Supabase Storage.
const PREFIXOS_PERMITIDOS = new Set(["reports", "covers", "editais", "parceiros"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
      throw new Error("Credenciais do R2 não configuradas (defina R2_ACCESS_KEY_ID e R2_SECRET_ACCESS_KEY)");
    }

    // Só usuário autenticado (admin) pode pedir uma URL de upload — mesma
    // regra que as policies antigas de storage.objects (bucket_id = ... TO authenticated).
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return json({ error: "Não autenticado" }, 401);
    }

    const payload = await req.json().catch(() => ({}));
    const { bucket, path, contentType } = payload as {
      bucket?: string;
      path?: string;
      contentType?: string;
    };

    if (!bucket || !PREFIXOS_PERMITIDOS.has(bucket)) {
      throw new Error(`bucket inválido: ${bucket}`);
    }
    if (!path || typeof path !== "string" || path.includes("..")) {
      throw new Error("path inválido");
    }

    const key = `${bucket}/${path}`;
    const tipo = contentType || "application/octet-stream";

    const aws = new AwsClient({
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      region: "auto",
      service: "s3",
    });

    const keyCodificada = key.split("/").map(encodeURIComponent).join("/");
    const urlAlvo = `${ENDPOINT}/${R2_BUCKET}/${keyCodificada}`;

    const signed = await aws.sign(
      new Request(urlAlvo, {
        method: "PUT",
        headers: { "Content-Type": tipo },
      }),
      { aws: { signQuery: true } },
    );

    return json({
      uploadUrl: signed.url,
      publicUrl: `${PUBLIC_BASE}/${key}`,
      contentType: tipo,
    });
  } catch (error: any) {
    console.error("Erro na funcao r2-upload-url:", error?.message || error);
    return json({ error: error?.message || "Erro desconhecido" }, 400);
  }
});
