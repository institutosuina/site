// Edge Function: send-email
// Chamada direto do admin via supabase.functions.invoke("send-email", { body: {...} })
// Envia via Amazon SES e grava histórico em emails_enviados.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

// ---- Helper SES inline (o deploy pelo painel não inclui a pasta _shared) ----
// Secrets: SES_REGION, SES_ACCESS_KEY_ID, SES_SECRET_ACCESS_KEY
const REGION = Deno.env.get("SES_REGION") ?? "us-east-2";
const ACCESS_KEY_ID = Deno.env.get("SES_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = Deno.env.get("SES_SECRET_ACCESS_KEY");

function assertSesConfigured() {
  if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error(
      "Credenciais do Amazon SES não configuradas (defina os secrets SES_ACCESS_KEY_ID e SES_SECRET_ACCESS_KEY)",
    );
  }
}

async function sendEmailViaSes(input: {
  from: string;
  to: string[];
  bcc?: string[];
  replyTo?: string[];
  subject: string;
  html: string;
}): Promise<{ messageId?: string }> {
  assertSesConfigured();
  const aws = new AwsClient({
    accessKeyId: ACCESS_KEY_ID!,
    secretAccessKey: SECRET_ACCESS_KEY!,
    region: REGION,
    service: "ses",
  });
  const destination: Record<string, string[]> = { ToAddresses: input.to };
  if (input.bcc?.length) destination.BccAddresses = input.bcc;
  const requestBody: Record<string, unknown> = {
    FromEmailAddress: input.from,
    Destination: destination,
    Content: {
      Simple: {
        Subject: { Data: input.subject, Charset: "UTF-8" },
        Body: { Html: { Data: input.html, Charset: "UTF-8" } },
      },
    },
  };
  if (input.replyTo?.length) requestBody.ReplyToAddresses = input.replyTo;
  const res = await aws.fetch(`https://email.${REGION}.amazonaws.com/v2/email/outbound-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.Message || data?.error || `Amazon SES retornou status ${res.status}`);
  }
  return { messageId: data?.MessageId };
}
// ---- fim do helper SES ----

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Nome com acento vai codificado (RFC 2047) pra o SES não engasgar com o "ã".
const FROM_NAME_B64 = btoa(String.fromCharCode(...new TextEncoder().encode("Instituto Suinã")));
const FROM_ADDRESS = `=?UTF-8?B?${FROM_NAME_B64}?= <comunicacao@institutosuina.org>`;

// Limpa o endereço (aspas, <>, espaços, vírgula/ponto e vírgula soltos) e valida.
// Uma aspa perdida em UM e-mail da lista derruba o lote inteiro no SES ("Missing '\"'").
const EMAIL_RE = /^[^\s@"'<>(),;:\\]+@[^\s@"'<>(),;:\\]+\.[^\s@"'<>(),;:\\]+$/;
function cleanEmail(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .replace(/^[\s"'<>,;]+|[\s"'<>,;]+$/g, "");
}
const ARCHIVE_TO = "comunicacao@institutosuina.org";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    assertSesConfigured();

    const payload = await req.json().catch(() => ({}));
    const { id, subject, body, emails: rawEmails, target_audience } = payload;

    // O admin gera o id antes de renderizar o HTML (link "Veja no navegador"
    // aponta para /campanha/:id), então ele precisa ser preservado no insert.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const campaignId = typeof id === "string" && UUID_RE.test(id) ? id : undefined;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      throw new Error("Assunto obrigatório");
    }
    if (!body || typeof body !== "string" || !body.trim()) {
      throw new Error("Corpo do e-mail obrigatório");
    }
    if (!Array.isArray(rawEmails) || rawEmails.length === 0) {
      throw new Error("Adicione ao menos um destinatário");
    }

    const emails: string[] = [];
    const skipped: string[] = [];
    const seen = new Set<string>();
    for (const raw of rawEmails) {
      const e = cleanEmail(raw);
      if (!EMAIL_RE.test(e)) {
        skipped.push(String(raw));
        continue;
      }
      const key = e.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      emails.push(e);
    }
    if (skipped.length) console.error("Destinatários inválidos ignorados:", JSON.stringify(skipped));
    if (emails.length === 0) {
      throw new Error(`Nenhum e-mail válido na lista. Inválidos: ${skipped.join(", ")}`);
    }

    // O SES aceita no máximo 50 destinatários (to+cc+bcc) por chamada,
    // então listas maiores precisam ser divididas em lotes.
    const BATCH_SIZE = 45;
    const batches: string[][] = [];
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      batches.push(emails.slice(i, i + BATCH_SIZE));
    }

    let sentCount = 0;
    let lastMessageId: string | undefined;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        const { messageId } = await sendEmailViaSes({
          from: FROM_ADDRESS,
          to: [ARCHIVE_TO],
          bcc: batch,
          subject: subject.trim(),
          html: body,
        });
        lastMessageId = messageId;
      } catch (batchError: any) {
        throw new Error(
          `Falha no lote ${i + 1}/${batches.length}: ${batchError?.message || batchError}. ${sentCount} destinatário(s) já receberam com sucesso antes da falha.`,
        );
      }

      sentCount += batch.length;

      // Espaça as chamadas entre lotes para respeitar o limite de envio do SES.
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 550));
      }
    }

    // Grava histórico (não bloqueia o sucesso do envio se falhar)
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error: insertError } = await supabase.from("emails_enviados").insert({
        ...(campaignId ? { id: campaignId } : {}),
        subject: subject.trim(),
        body: body.trim(),
        target_audience:
          typeof target_audience === "string" && target_audience.trim()
            ? target_audience.trim()
            : "sem-nicho",
      });
      if (insertError) {
        console.error("Falha ao gravar historico:", insertError.message);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        count: emails.length,
        skipped,
        ses_message_id: lastMessageId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Erro na funcao send-email:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro desconhecido" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
