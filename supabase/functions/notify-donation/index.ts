// Edge Function: notify-donation
// Chamada pelo formulário "Que tal contribuir..." (src/pages/Participe.tsx) quando
// a pessoa clica em DOAR. Avisa a comunicação por e-mail (Amazon SES) com os dados do doador.
// O pagamento em si é feito por PIX fora do site, então este e-mail é só o registro da intenção.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  const requestBody: Record<string, unknown> = {
    FromEmailAddress: input.from,
    Destination: { ToAddresses: input.to },
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

// Nome com acento vai codificado (RFC 2047) pra o SES não engasgar com o "ã".
const FROM_NAME_B64 = btoa(String.fromCharCode(...new TextEncoder().encode("Instituto Suinã")));
const FROM_ADDRESS = `=?UTF-8?B?${FROM_NAME_B64}?= <comunicacao@institutosuina.org>`;
const NOTIFY_TO = "comunicacao@institutosuina.org";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@"'<>(),;:\\]+@[^\s@"'<>(),;:\\]+\.[^\s@"'<>(),;:\\]+$/;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    assertSesConfigured();

    const payload = await req.json().catch(() => ({}));
    const { nome, email, website } = payload;

    // Honeypot: só bot preenche. Finge sucesso sem enviar.
    if (typeof website === "string" && website.trim()) {
      return json({ ok: true });
    }

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      throw new Error("Nome obrigatório");
    }
    if (nome.length > 200) {
      throw new Error("Nome muito longo");
    }
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      throw new Error("E-mail inválido");
    }

    const quando = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const html = `
      <h2>Nova intenção de doação pelo site</h2>
      <p><strong>Nome:</strong> ${escapeHtml(nome.trim())}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email.trim())}</p>
      <p><strong>Data:</strong> ${quando}</p>
      <p style="color:#666;font-size:13px">
        A pessoa aceitou as condições de doação e viu o QR Code / chave PIX.
        O pagamento é feito por PIX fora do site: confira na conta se o valor entrou.
      </p>
    `;

    const { messageId } = await sendEmailViaSes({
      from: FROM_ADDRESS,
      to: [NOTIFY_TO],
      replyTo: [email.trim()],
      subject: `Nova intenção de doação: ${nome.trim()}`,
      html,
    });

    return json({ ok: true, ses_message_id: messageId });
  } catch (error: any) {
    console.error("Erro na funcao notify-donation:", error?.message || error);
    return json({ error: error?.message || "Erro desconhecido" }, 400);
  }
});
