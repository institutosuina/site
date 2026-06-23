// Edge Function: notify-contact
// Chamada pelo formulário público de contato (src/pages/Contato.tsx) depois do
// registro ser salvo na tabela "contatos". Envia um e-mail de aviso via Resend.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const FROM_ADDRESS = "Instituto Suinã <contato@institutosuina.org>";
const NOTIFY_TO = "comunicacao@institutosuina.org";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não está configurada nos secrets da função");
    }

    const payload = await req.json().catch(() => ({}));
    const { nome, email, mensagem } = payload;

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      throw new Error("Nome obrigatório");
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      throw new Error("E-mail obrigatório");
    }
    if (!mensagem || typeof mensagem !== "string" || !mensagem.trim()) {
      throw new Error("Mensagem obrigatória");
    }

    const html = `
      <h2>Novo contato pelo site</h2>
      <p><strong>Nome:</strong> ${escapeHtml(nome.trim())}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email.trim())}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${escapeHtml(mensagem.trim()).replace(/\n/g, "<br/>")}</p>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [NOTIFY_TO],
        reply_to: email.trim(),
        subject: `Novo contato pelo site: ${nome.trim()}`,
        html,
      }),
    });

    const resendData = await resendRes.json().catch(() => ({}));

    if (!resendRes.ok) {
      const msg =
        resendData?.message ||
        resendData?.error ||
        `Resend retornou status ${resendRes.status}`;
      throw new Error(msg);
    }

    return new Response(
      JSON.stringify({ ok: true, resend_id: resendData?.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Erro na funcao notify-contact:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro desconhecido" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
