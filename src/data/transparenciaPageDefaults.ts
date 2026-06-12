export interface TransparenciaPageContent {
  heroTitle: string;
  heroSubtitle: string;
  cardLgpd: string;
  cardEstatuto: string;
  cardPortfolio: string;
  cardContabeis: string;
  cardResultados: string;
  cardPrestacao: string;
}

export const defaultTransparenciaPageContent: TransparenciaPageContent = {
  heroTitle: "Transparência",
  heroSubtitle: "Resultados e compromissos:",
  cardLgpd: "Política e\nManual de\nBoas práticas\n(LGPD)",
  cardEstatuto: "Estatuto\nsocial",
  cardPortfolio: "Portfólio\nde Atividades",
  cardContabeis: "Demonstrativos\nContábeis",
  cardResultados: "Relatórios\nde Resultados",
  cardPrestacao: "Prestação\nde contas",
};
