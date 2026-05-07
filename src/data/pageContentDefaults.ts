export interface TimelineItem {
  year: string;
  text: string;
}

export interface HomePageContent {
  quemSomos: string;
  mission: string;
  vision: string;
  values: string;
  timeline: TimelineItem[];
}

export const defaultHomePageContent: HomePageContent = {
  quemSomos:
    "O Instituto Suinã é uma organização da sociedade civil fundada em 2014, fruto do sonho de cinco biólogas comprometidas em transformar a relação entre pessoas, fauna, flora e território. Inspiradas pelo Suinã, árvore que simboliza força e resiliência, atuamos na conservação e restauração da sociobiodiversidade nas bacias hidrográficas de Alto e Médio Tietê e do Rio Paraíba do Sul. Desde a nossa origem, desenvolvemos projetos que articulam ciência, educação, mobilização social e políticas públicas, porque acreditamos que a conservação só é eficaz quando é feita coletivamente. Hoje somos uma rede de profissionais que fortalece territórios, restaura ecossistemas e valoriza saberes e culturas locais, contribuindo para a transição a uma sociedade mais justa e sustentável.",
  mission:
    "Conectar e mobilizar pessoas, ideias e ações para conservar e restaurar a sociobiodiversidade.",
  vision:
    "Consolidar-se como uma organização de referência em conservação e transformação territorial, contribuindo para o desenvolvimento sustentável e a valorização dos territórios.",
  values: "Em breve.",
  timeline: [
    { year: "2013", text: "Concepção do Instituto Suinã e início da estruturação institucional." },
    { year: "2014", text: "Formalização da instituição e primeiras ações públicas de educação ambiental." },
    { year: "2015", text: "Primeira parceria com poder público (Prefeitura de Mogi das Cruzes) e ingresso no Conselho Municipal de Meio Ambiente de Guararema-SP." },
    { year: "2016", text: "Primeiro contrato socioambiental com empresa do setor florestal, em mobilização social e educação ambiental." },
    { year: "2017", text: "Cooperação com o Centro Paula Souza para formação de educadores da rede pública." },
    { year: "2018", text: "Reconhecimento público com o prêmio \"Escola Amiga do Verde\" (Câmara de Jacareí)." },
    { year: "2019", text: "Expansão das parcerias institucionais e primeiros projetos estruturantes em diagnóstico socioambiental e tecnologias sociais." },
    { year: "2020", text: "Participação em programa nacional de aceleração (Instituto EDP/Phomenta), premiação Capital Semente, certificação internacional de transparência e ingresso no Comitê de Bacias do Paraíba do Sul." },
    { year: "2021", text: "Consolidação de parcerias com o setor florestal em projetos de caracterização e diagnóstico social." },
    { year: "2022", text: "Aprovação do primeiro projeto FEHIDRO em restauração ecológica, reestruturação da governança e instalação da nova sede em Jacareí-SP." },
    { year: "2023", text: "Parcerias com SOS Mata Atlântica e Suzano para Planos Municipais, SAVE Brasil para Plano de Manejo em Guararema e início do projeto Viver o Viveiro." },
    { year: "2024", text: "Ampliação de contratos e lançamento do programa Jovens Observadores, voltado ao emprego verde e turismo sustentável." },
    { year: "2025", text: "Nova identidade visual, participação no programa BTG Soma Meio Ambiente e expansão de projetos de restauração ecológica e mobilização social." },
  ],
};
