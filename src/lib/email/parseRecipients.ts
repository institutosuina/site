// Extração de e-mails de arquivos importados (CSV, TXT, XLSX/XLS).
// A abordagem é agnóstica ao layout: lê tudo como texto e capta qualquer
// endereço válido por regex — funciona com listas em coluna, linha, com
// cabeçalho ("Nome,Email"), separado por vírgula/ponto-e-vírgula, etc.
// O parser de planilha (xlsx) é pesado, então é carregado sob demanda.

const EMAIL_RE = /[^\s@,;<>()"']+@[^\s@,;<>()"']+\.[^\s@,;<>()"']+/g;

/** Extrai e-mails únicos (minúsculos) de um texto qualquer. */
export function extractEmails(text: string): string[] {
  const found = text.match(EMAIL_RE) || [];
  return Array.from(new Set(found.map((e) => e.toLowerCase())));
}

/** Lê um arquivo de destinatários e devolve os e-mails únicos encontrados. */
export async function parseRecipientFile(file: File): Promise<string[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    // Concatena o CSV de todas as abas e extrai os e-mails do conjunto.
    const text = workbook.SheetNames.map((sheetName) =>
      XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]),
    ).join("\n");
    return extractEmails(text);
  }

  // CSV, TXT e afins: basta ler como texto.
  const text = await file.text();
  return extractEmails(text);
}

/** Valida um único e-mail (uso no campo de digitação manual). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
