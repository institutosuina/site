export interface ConselhoMembro {
  cargo: string;
  nome: string;
}

export interface ConselhoContent {
  presidente: string;
  vicePresidente: string;
  fiscal: string[];
  mandato: string;
  diretores: ConselhoMembro[];
}

export const defaultConselhoContent: ConselhoContent = {
  presidente: "Paulo Valladares Soares",
  vicePresidente: "Maria Santini de Castro Morini",
  fiscal: [
    "Lucila Manzatti",
    "Fausto Rodrigues Alves de Camargo",
  ],
  mandato: "09/03/2026 a 08/03/2029",
  diretores: [
    { cargo: "Diretora Técnica", nome: "Maria de Fátima de Oliveira" },
    { cargo: "Diretora Institucional", nome: "Fernanda de Moraes Alvarenga Scalambrino" },
  ],
};
