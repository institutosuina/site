// Helper compartilhado: envio de e-mail via Amazon SES (API v2).
// Usa assinatura AWS SigV4 através do aws4fetch (leve e compatível com Deno).
//
// Secrets esperados na função:
//   SES_REGION             (ex.: "sa-east-1", "us-east-1")
//   SES_ACCESS_KEY_ID      (Access Key ID de um usuário IAM com permissão ses:SendEmail)
//   SES_SECRET_ACCESS_KEY  (Secret Access Key correspondente)

import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const REGION = Deno.env.get("SES_REGION") ?? "us-east-1";
const ACCESS_KEY_ID = Deno.env.get("SES_ACCESS_KEY_ID");
const SECRET_ACCESS_KEY = Deno.env.get("SES_SECRET_ACCESS_KEY");

export interface SendEmailInput {
  /** Ex.: "Instituto Suinã <contato@institutosuina.org>" (o domínio precisa estar verificado no SES). */
  from: string;
  to: string[];
  bcc?: string[];
  replyTo?: string[];
  subject: string;
  html: string;
}

/** Lança se as credenciais do SES não estiverem configuradas nos secrets da função. */
export function assertSesConfigured() {
  if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error(
      "Credenciais do Amazon SES não configuradas (defina os secrets SES_ACCESS_KEY_ID e SES_SECRET_ACCESS_KEY)",
    );
  }
}

/** Envia um e-mail HTML via Amazon SES v2. Retorna o MessageId gerado pelo SES. */
export async function sendEmailViaSes(input: SendEmailInput): Promise<{ messageId?: string }> {
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

  const res = await aws.fetch(
    `https://email.${REGION}.amazonaws.com/v2/email/outbound-emails`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    },
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.Message ||
      data?.error ||
      `Amazon SES retornou status ${res.status}`;
    throw new Error(msg);
  }

  return { messageId: data?.MessageId };
}
