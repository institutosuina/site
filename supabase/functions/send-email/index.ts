// Edge Function: send-email
// Chamada direto do admin via supabase.functions.invoke("send-email", { body: {...} })
// Envia via Amazon SES e grava histórico em emails_enviados.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { assertSesConfigured, sendEmailViaSes } from "../_shared/ses.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const FROM_ADDRESS = "Instituto Suinã <contato@institutosuina.org>";
const ARCHIVE_TO = "contato@institutosuina.org";

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
    const { subject, body, emails, target_audience } = payload;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      throw new Error("Assunto obrigatório");
    }
    if (!body || typeof body !== "string" || !body.trim()) {
      throw new Error("Corpo do e-mail obrigatório");
    }
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new Error("Adicione ao menos um destinatário");
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
