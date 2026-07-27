// Motor de renderização: transforma o EmailDoc (blocos) em HTML compatível com
// e-mail (tabelas + estilos inline), no molde visual "DOX" do Instituto Suinã.
// O mesmo HTML é usado no preview do admin e no envio via Amazon SES.

import type { EmailBlock, EmailDoc } from "./types";

// Paleta da marca (ver src/index.css: --suina-green-dark, cream, secondary).
export const EMAIL_COLORS = {
  green: "#2f5741", // verde escuro Suinã (títulos, botões, rodapé)
  cream: "#f7f4ec", // fundo externo
  card: "#ffffff", // fundo do conteúdo
  text: "#3a3a3a", // texto do corpo
  muted: "#8a8a8a", // legendas / rodapé
  border: "#e7e1d3",
} as const;

const CONTAINER_WIDTH = 600;
const SIDE_PADDING = 32;

/** Domínio público do site (usado no link "Veja no navegador"). */
export const SITE_URL = "https://institutosuina.org";

/** URL pública da versão web de uma campanha (rota /campanha/:id). */
export const campaignUrl = (id: string) => `${SITE_URL}/campanha/${id}`;

export type RenderOptions = {
  /**
   * Id da campanha em emails_enviados. Quando informado, o "Veja no navegador"
   * vira um link real para /campanha/:id; sem ele (preview do admin) o texto
   * aparece sem link, para não enviar âncora morta.
   */
  campaignId?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeAttr = (value: string) => escapeHtml(value).replace(/'/g, "&#39;");

/** Envolve o conteúdo de um bloco numa linha de tabela com respiro lateral. */
const contentRow = (inner: string, extra = "") =>
  `<tr><td style="padding:0 ${SIDE_PADDING}px;${extra}">${inner}</td></tr>`;

/** Linha sem respiro lateral (banner/rodapé sangram até a borda). */
const fullRow = (inner: string) => `<tr><td style="padding:0;">${inner}</td></tr>`;

function renderBlock(block: EmailBlock): string {
  switch (block.type) {
    case "banner": {
      if (!block.src) return "";
      const img = `<img src="${escapeAttr(block.src)}" alt="${escapeAttr(block.alt ?? "")}" width="${CONTAINER_WIDTH}" style="display:block;width:100%;max-width:${CONTAINER_WIDTH}px;height:auto;border:0;" />`;
      const inner = block.href
        ? `<a href="${escapeAttr(block.href)}" target="_blank" style="text-decoration:none;">${img}</a>`
        : img;
      return fullRow(inner);
    }

    case "heading": {
      const size = block.level === 2 ? 24 : 19;
      return contentRow(
        `<h${block.level} style="margin:26px 0 10px;color:${EMAIL_COLORS.green};font-family:Arial,Helvetica,sans-serif;font-size:${size}px;line-height:1.3;font-weight:bold;text-align:${block.align};">${escapeHtml(block.text)}</h${block.level}>`,
      );
    }

    case "text": {
      return contentRow(
        `<div class="dox-text" style="color:${EMAIL_COLORS.text};font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;text-align:justify;">${block.html}</div>`,
      );
    }

    case "image": {
      if (!block.src) return "";
      const w = Math.min(Math.max(block.widthPct ?? 100, 10), 100);
      const img = `<img src="${escapeAttr(block.src)}" alt="${escapeAttr(block.alt ?? "")}" style="display:block;width:${w}%;height:auto;border:0;border-radius:8px;margin:0 auto;" />`;
      const linked = block.href
        ? `<a href="${escapeAttr(block.href)}" target="_blank" style="text-decoration:none;">${img}</a>`
        : img;
      const caption = block.caption
        ? `<p style="margin:8px 0 0;color:${EMAIL_COLORS.muted};font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;text-align:center;font-style:italic;">${escapeHtml(block.caption)}</p>`
        : "";
      return contentRow(`<div style="margin:18px 0;">${linked}${caption}</div>`);
    }

    case "gallery": {
      const imgs = block.images.filter((i) => i.src);
      if (!imgs.length) return "";
      const cells = imgs
        .map(
          (i) =>
            `<td width="${Math.floor(100 / imgs.length)}%" style="padding:0 4px;vertical-align:top;"><img src="${escapeAttr(i.src)}" alt="${escapeAttr(i.alt ?? "")}" style="display:block;width:100%;height:auto;border:0;border-radius:8px;" /></td>`,
        )
        .join("");
      const caption = block.caption
        ? `<p style="margin:8px 0 0;color:${EMAIL_COLORS.muted};font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;text-align:center;font-style:italic;">${escapeHtml(block.caption)}</p>`
        : "";
      return contentRow(
        `<div style="margin:18px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>${cells}</tr></table>${caption}</div>`,
      );
    }

    case "button": {
      if (!block.text) return "";
      const href = block.href || "#";
      return contentRow(
        `<div style="text-align:${block.align};margin:22px 0;"><a href="${escapeAttr(href)}" target="_blank" style="display:inline-block;background-color:${EMAIL_COLORS.green};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:13px 34px;border-radius:9999px;">${escapeHtml(block.text)}</a></div>`,
      );
    }

    case "divider": {
      if (block.variant === "line") {
        return contentRow(
          `<div style="border-top:1px solid ${EMAIL_COLORS.border};margin:26px 0;line-height:1px;font-size:1px;">&nbsp;</div>`,
        );
      }
      return contentRow(`<div style="height:24px;line-height:24px;font-size:1px;">&nbsp;</div>`);
    }
  }
}

function renderViewInBrowser(campaignId?: string): string {
  const label = campaignId
    ? `<a href="${escapeAttr(campaignUrl(campaignId))}" target="_blank" style="color:${EMAIL_COLORS.green};">Veja no navegador</a>`
    : `<span style="color:${EMAIL_COLORS.green};">Veja no navegador</span>`;
  return `<tr><td style="padding:14px ${SIDE_PADDING}px 0;text-align:center;">
    <span style="color:${EMAIL_COLORS.muted};font-family:Arial,Helvetica,sans-serif;font-size:12px;">Não consegue ver essa mensagem? ${label}</span>
  </td></tr>`;
}

function renderFooter(doc: EmailDoc): string {
  const parts: string[] = [];
  if (doc.footerImageUrl) {
    const img = `<img src="${escapeAttr(doc.footerImageUrl)}" alt="Agradecemos sua leitura!" width="${CONTAINER_WIDTH}" style="display:block;width:100%;max-width:${CONTAINER_WIDTH}px;height:auto;border:0;" />`;
    parts.push(
      fullRow(
        doc.footerImageHref
          ? `<a href="${escapeAttr(doc.footerImageHref)}" target="_blank" style="text-decoration:none;">${img}</a>`
          : img,
      ),
    );
  }
  const unsub = doc.unsubscribeUrl
    ? ` Se não deseja mais receber este email, <a href="${escapeAttr(doc.unsubscribeUrl)}" style="color:${EMAIL_COLORS.muted};text-decoration:underline;">altere suas preferências de email aqui</a>.`
    : "";
  parts.push(
    `<tr><td style="padding:18px ${SIDE_PADDING}px 28px;text-align:center;">
      <p style="margin:0;color:${EMAIL_COLORS.muted};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;">Este email foi enviado pelo Instituto Suinã.${unsub}</p>
    </td></tr>`,
  );
  return parts.join("");
}

/** Renderiza o e-mail completo (documento HTML) a partir do EmailDoc. */
export function renderEmailHtml(doc: EmailDoc, options: RenderOptions = {}): string {
  const preheader = doc.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(doc.preheader)}</div>`
    : "";

  const body = doc.blocks.map(renderBlock).join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { margin:0; padding:0; background:${EMAIL_COLORS.cream}; }
  img { -ms-interpolation-mode:bicubic; }
  a { color:${EMAIL_COLORS.green}; }
  .dox-text p { margin:0 0 14px; }
  .dox-text a { color:${EMAIL_COLORS.green}; }
  .dox-text img { max-width:100%; height:auto; border-radius:8px; }
  .suina-button-link {
    display:inline-block; background-color:${EMAIL_COLORS.green}; color:#ffffff !important;
    padding:12px 32px; border-radius:9999px; text-decoration:none; font-weight:bold;
  }
  .suina-doc-link {
    display:inline-block; background-color:#f4f4f5; color:#18181b !important;
    padding:8px 16px; border-radius:9999px; text-decoration:none; font-weight:600;
    border:1px solid #e4e4e7;
  }
</style>
</head>
<body>
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_COLORS.cream};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="${CONTAINER_WIDTH}" cellpadding="0" cellspacing="0" style="width:100%;max-width:${CONTAINER_WIDTH}px;background:${EMAIL_COLORS.card};border-radius:12px;overflow:hidden;">
        ${doc.showViewInBrowser ? renderViewInBrowser(options.campaignId) : ""}
        ${body}
        ${renderFooter(doc)}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
