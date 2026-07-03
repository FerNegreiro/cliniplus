export type ProfissaoConfig = {
  nome: string;
  moduloPrincipal: string;
  descricao: string;
  menu: {
    name: string;
    href: string;
  }[];
};

const menuBase = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Perfil", href: "/perfil" },
  { name: "Equipe e Acessos", href: "/equipe" },
  { name: "Agenda", href: "/agenda" },
  { name: "Pacientes", href: "/pacientes" },
  { name: "Prontuário", href: "/prontuario" },
];

const menuFinal = [
  { name: "Financeiro", href: "/financeiro" },
  { name: "Relatórios", href: "/relatorios" },
  { name: "Planos", href: "/planos" },
  { name: "Configurações", href: "/configuracoes" },
];

export const profissoesConfig: ProfissaoConfig[] = [
  {
    nome: "Médicos",
    moduloPrincipal: "Medicina",
    descricao:
      "Gestão médica com consultas, prontuários, prescrições, exames, laudos, atestados e acompanhamento clínico.",
    menu: [
      ...menuBase,
      { name: "Consultas", href: "/consultas" },
      { name: "Prescrições", href: "/prescricoes" },
      { name: "Exames e Laudos", href: "/exames" },
      { name: "Atestados", href: "/atestados" },
      { name: "Procedimentos", href: "/procedimentos" },
      ...menuFinal,
    ],
  },
  {
    nome: "Cardiologista",
    moduloPrincipal: "Cardiologia",
    descricao:
      "Gestão cardiológica com sinais vitais, ECG, exames, laudos, prescrições e acompanhamento cardiovascular.",
    menu: [
      ...menuBase,
      { name: "Cardiologia", href: "/cardiologia" },
      { name: "Sinais Vitais", href: "/sinais-vitais" },
      { name: "ECG", href: "/ecg" },
      { name: "Exames e Laudos", href: "/exames" },
      { name: "Prescrições", href: "/prescricoes" },
      ...menuFinal,
    ],
  },
  {
    nome: "Dentistas",
    moduloPrincipal: "Odontologia",
    descricao:
      "Gestão odontológica com pacientes, prontuários, tratamentos, orçamentos, financeiro e comunicação.",
    menu: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Agenda", href: "/agenda" },
      { name: "Pacientes", href: "/pacientes" },
      { name: "Prontuários", href: "/prontuario" },
      { name: "Tratamentos", href: "/tratamentos" },
      { name: "Financeiro", href: "/financeiro" },
      { name: "Orçamentos", href: "/orcamentos" },
      { name: "Relatórios", href: "/relatorios" },
      { name: "Comunicação", href: "/comunicacao" },
      { name: "Configurações", href: "/configuracoes" },
    ],
  },
  {
    nome: "Psicólogos",
    moduloPrincipal: "Psicologia",
    descricao:
      "Gestão psicológica com sessões, evolução terapêutica, anotações clínicas, plano terapêutico e documentos.",
    menu: [
      ...menuBase,
      { name: "Sessões", href: "/sessoes" },
      { name: "Evoluções", href: "/evolucoes" },
      { name: "Plano Terapêutico", href: "/plano-terapeutico" },
      { name: "Anotações Clínicas", href: "/anotacoes" },
      { name: "Documentos", href: "/documentos" },
      ...menuFinal,
    ],
  },
  {
    nome: "Nutricionistas",
    moduloPrincipal: "Nutrição",
    descricao:
      "Gestão nutricional com avaliação, plano alimentar, medidas corporais, evolução, anamnese e acompanhamento.",
    menu: [
      ...menuBase,
      { name: "Avaliação Nutricional", href: "/avaliacao-nutricional" },
      { name: "Plano Alimentar", href: "/plano-alimentar" },
      { name: "Medidas e Evolução", href: "/medidas-evolucao" },
      { name: "Anamnese", href: "/anamnese" },
      { name: "Receitas e Dietas", href: "/dietas" },
      ...menuFinal,
    ],
  },
  {
    nome: "Fisioterapeutas",
    moduloPrincipal: "Fisioterapia",
    descricao:
      "Gestão fisioterapêutica com avaliações, exercícios, protocolos, evoluções, tratamentos e acompanhamento.",
    menu: [
      ...menuBase,
      { name: "Avaliações", href: "/avaliacoes" },
      { name: "Exercícios", href: "/exercicios" },
      { name: "Protocolos", href: "/protocolos" },
      { name: "Tratamentos", href: "/tratamentos" },
      { name: "Evoluções", href: "/evolucoes" },
      ...menuFinal,
    ],
  },
  {
    nome: "Biomédicos",
    moduloPrincipal: "Biomedicina",
    descricao:
      "Gestão biomédica com procedimentos, exames, laudos, protocolos, estética avançada e acompanhamento.",
    menu: [
      ...menuBase,
      { name: "Procedimentos", href: "/procedimentos" },
      { name: "Exames", href: "/exames" },
      { name: "Laudos", href: "/laudos" },
      { name: "Protocolos", href: "/protocolos" },
      { name: "Estética Avançada", href: "/estetica-avancada" },
      ...menuFinal,
    ],
  },
  {
    nome: "Fonoaudiólogos",
    moduloPrincipal: "Fonoaudiologia",
    descricao:
      "Gestão fonoaudiológica com avaliações, terapias, exercícios, evoluções e plano terapêutico.",
    menu: [
      ...menuBase,
      { name: "Avaliações", href: "/avaliacoes" },
      { name: "Terapias", href: "/terapias" },
      { name: "Exercícios", href: "/exercicios" },
      { name: "Evoluções", href: "/evolucoes" },
      { name: "Plano Terapêutico", href: "/plano-terapeutico" },
      ...menuFinal,
    ],
  },
  {
    nome: "Podólogos",
    moduloPrincipal: "Podologia",
    descricao:
      "Gestão podológica com avaliação dos pés, procedimentos, tratamentos, imagens, anexos e evoluções.",
    menu: [
      ...menuBase,
      { name: "Avaliação dos Pés", href: "/avaliacao-podologica" },
      { name: "Procedimentos", href: "/procedimentos" },
      { name: "Tratamentos", href: "/tratamentos" },
      { name: "Imagens e Anexos", href: "/anexos" },
      { name: "Evoluções", href: "/evolucoes" },
      ...menuFinal,
    ],
  },
  {
    nome: "Esteticistas",
    moduloPrincipal: "Estética",
    descricao:
      "Gestão estética com procedimentos, protocolos, pacotes, evolução visual, antes e depois e acompanhamento.",
    menu: [
      ...menuBase,
      { name: "Procedimentos", href: "/procedimentos" },
      { name: "Protocolos", href: "/protocolos" },
      { name: "Pacotes", href: "/pacotes" },
      { name: "Evolução Visual", href: "/evolucao-visual" },
      { name: "Antes e Depois", href: "/antes-depois" },
      ...menuFinal,
    ],
  },
  {
    nome: "Terapeutas",
    moduloPrincipal: "Terapias",
    descricao:
      "Gestão terapêutica com sessões, plano de cuidado, evoluções, técnicas e acompanhamento.",
    menu: [
      ...menuBase,
      { name: "Sessões", href: "/sessoes" },
      { name: "Plano de Cuidado", href: "/plano-cuidado" },
      { name: "Evoluções", href: "/evolucoes" },
      { name: "Técnicas", href: "/tecnicas" },
      { name: "Acompanhamento", href: "/acompanhamento" },
      ...menuFinal,
    ],
  },
  {
    nome: "Outros",
    moduloPrincipal: "Saúde",
    descricao:
      "Gestão geral para profissionais da saúde com agenda, pacientes, prontuário, atendimentos, documentos e financeiro.",
    menu: [
      ...menuBase,
      { name: "Atendimentos", href: "/atendimentos" },
      { name: "Procedimentos", href: "/procedimentos" },
      { name: "Documentos", href: "/documentos" },
      { name: "Evoluções", href: "/evolucoes" },
      ...menuFinal,
    ],
  },
];

export const profissaoAtual = "Dentistas";

export const configProfissaoAtual =
  profissoesConfig.find((profissao) => profissao.nome === profissaoAtual) ||
  profissoesConfig.find((profissao) => profissao.nome === "Outros")!;
