export type LiveTreatment = {
  nome: string;
  progresso: string;
  detalhe: string;
  status: string;
};

export type LiveHistory = {
  titulo: string;
  profissional: string;
  data: string;
  status: string;
};

export type LiveDocument = {
  nome: string;
  detalhe: string;
};

export type LiveFinance = {
  totalGasto: string;
  status: string;
  detalhe: string;
  formaPagamento: string;
  convenio: string;
  guia: string;
  autorizacao: string;
  previsaoRecebimento: string;
  observacoes: string;
  lancamentos: LiveFinanceEntry[];
};

export type LiveFinanceEntry = {
  id: number;
  descricao: string;
  tipo: string;
  valor: string;
  vencimento: string;
  status: string;
  origem: string;
};

export type LiveProntuario = {
  tipoRegistro: string;
  statusRegistro: string;
  dataAtendimento: string;
  denteEnvolvido: string;
  procedimento: string;
  queixaPrincipal: string;
  evolucao: string;
  conduta: string;
  proximoRetorno: string;
  valorRelacionado: string;
  observacoesPrivadas: string;
};

export type LivePatientData = {
  treatments: LiveTreatment[];
  history: LiveHistory[];
  documents: LiveDocument[];
  notes: string[];
  info: {
    nome?: string;
    nascimento: string;
    cpf: string;
    telefone?: string;
    email?: string;
    endereco: string;
    convenio?: string;
    observacoes: string;
  };
  prontuario: LiveProntuario;
  finance: LiveFinance;
};

const defaultProntuario: LiveProntuario = {
  tipoRegistro: "Avaliação odontológica",
  statusRegistro: "Em andamento",
  dataAtendimento: "2026-06-24",
  denteEnvolvido: "16",
  procedimento: "Restauração dente 16",
  queixaPrincipal: "Paciente relata sensibilidade em dentes frios.",
  evolucao:
    "Avaliação clínica realizada. Observada necessidade de acompanhamento restaurador e revisão de higiene bucal.",
  conduta:
    "Orientada higiene bucal e uso do fio dental. Próxima avaliação odontológica em 24/06/2026.",
  proximoRetorno: "2026-06-24",
  valorRelacionado: "R$ 280,00",
  observacoesPrivadas: "Alergia à penicilina registrada no prontuário.",
};

export function getDefaultPatientData(pacienteId: number): LivePatientData {
  const isSyntheticHofId = pacienteId >= 900000 && pacienteId < 1000000;

  if (
    pacienteId === 3 ||
    pacienteId === 4 ||
    pacienteId === 6 ||
    isSyntheticHofId
  ) {
    return {
      treatments: [
        {
          nome:
            pacienteId === 3
              ? "Preenchimento labial"
              : pacienteId === 4
                ? "Toxina botulínica"
                : "Harmonização orofacial",
          progresso: pacienteId === 4 ? "100%" : "40%",
          detalhe: "Acompanhamento estético registrado no prontuário.",
          status: pacienteId === 4 ? "Concluído" : "Em tratamento",
        },
      ],
      history: [
        {
          titulo: "Avaliação inicial",
          profissional: "Dr. Fernando Silva",
          data: "08/06/2026",
          status: "Registrado",
        },
      ],
      documents: [
        { nome: "Registro fotográfico", detalhe: "Adicionar ou editar arquivo" },
        { nome: "Termo de consentimento", detalhe: "Adicionar ou editar arquivo" },
      ],
      notes: [
        "Paciente em acompanhamento de Estética / HOF.",
        "Registrar evolução, produtos utilizados e retorno.",
      ],
      info: {
        nascimento: "15/03/1990",
        cpf: "123.456.789-00",
        endereco: "Não informado",
        observacoes: "Sem observações",
      },
      prontuario: {
        ...defaultProntuario,
        tipoRegistro: "Avaliação HOF",
        denteEnvolvido: "",
        procedimento:
          pacienteId === 3
            ? "Preenchimento labial"
            : pacienteId === 4
              ? "Toxina botulínica"
              : "Harmonização orofacial",
        queixaPrincipal:
          "Paciente compareceu para avaliação e planejamento de Estética / HOF.",
        evolucao:
          "Avaliação clínica registrada com queixas, áreas de interesse e planejamento.",
        conduta:
          "Registrar produtos utilizados, orientações, cuidados e retorno do paciente.",
        valorRelacionado:
          pacienteId === 3
            ? "R$ 900,00"
            : pacienteId === 4
              ? "R$ 1.200,00"
              : "R$ 2.500,00",
        observacoesPrivadas:
          "Anotar contraindicações, alergias, medicamentos e observações internas.",
      },
      finance: {
        totalGasto:
          pacienteId === 3
            ? "R$ 900,00"
            : pacienteId === 4
              ? "R$ 1.200,00"
              : "R$ 2.500,00",
        status: pacienteId === 4 ? "Em dia" : "Pendente",
        detalhe: pacienteId === 4 ? "Pagamento recebido" : "Orçamento estético",
        formaPagamento: "Particular",
        convenio: "Particular",
        guia: "",
        autorizacao: "",
        previsaoRecebimento: "Não informado",
        observacoes: "Financeiro vinculado ao procedimento estético.",
        lancamentos: [
          {
            id: 1,
            descricao:
              pacienteId === 3
                ? "Preenchimento labial"
                : pacienteId === 4
                  ? "Toxina botulínica"
                  : "Harmonização orofacial",
            tipo: "Receita",
            valor:
              pacienteId === 3
                ? "R$ 900,00"
                : pacienteId === 4
                  ? "R$ 1.200,00"
                  : "R$ 2.500,00",
            vencimento: "2026-06-28",
            status: pacienteId === 4 ? "Pago" : "Pendente",
            origem: "Particular",
          },
        ],
      },
    };
  }

  if (pacienteId === 2) {
    return {
      treatments: [
        {
          nome: "Restauração dente 16",
          progresso: "60%",
          detalhe: "Próxima sessão em 24/06/2026",
          status: "Em tratamento",
        },
        {
          nome: "Tratamento de canal",
          progresso: "25%",
          detalhe: "Dente 36 marcado para revisão",
          status: "Urgente",
        },
        {
          nome: "Clareamento dental",
          progresso: "10%",
          detalhe: "Iniciado recentemente",
          status: "Planejado",
        },
      ],
      history: [
        {
          titulo: "Profilaxia + Polimento",
          profissional: "Dr. Fernando Silva",
          data: "10/05/2026",
          status: "Concluído",
        },
        {
          titulo: "Restauração dente 16",
          profissional: "Dr. Fernando Silva",
          data: "20/04/2026",
          status: "Concluído",
        },
        {
          titulo: "Avaliação inicial",
          profissional: "Dr. Fernando Silva",
          data: "15/03/2026",
          status: "Concluído",
        },
      ],
      documents: [
        { nome: "Radiografia Panorâmica", detalhe: "PDF • 2.4 MB" },
        { nome: "Foto intraoral inicial", detalhe: "JPG • 1.8 MB" },
        { nome: "Orçamento odontológico", detalhe: "PDF • 0.9 MB" },
      ],
      notes: [
        "Paciente relata sensibilidade em dentes frios.",
        "Orientada sobre higiene bucal e uso do fio dental.",
        "Próxima avaliação odontológica em 24/06/2026.",
      ],
      info: {
        nascimento: "15/03/1990",
        cpf: "123.456.789-00",
        endereco: "Rua das Flores, 123",
        observacoes: "Alergia à penicilina",
      },
      prontuario: {
        ...defaultProntuario,
        procedimento: "Tratamento de canal",
        denteEnvolvido: "36",
        queixaPrincipal: "Paciente relata dor ao mastigar e sensibilidade.",
        evolucao:
          "Avaliação endodôntica iniciada. Dente 36 marcado para revisão clínica.",
        conduta:
          "Manter acompanhamento, revisar resposta ao tratamento e agendar retorno.",
      },
      finance: {
        totalGasto: "R$ 2.450,00",
        status: "Aguardando",
        detalhe: "Repasse pendente",
        formaPagamento: "Convênio",
        convenio: "Unimed",
        guia: "GUIA-10245",
        autorizacao: "AUT-8891",
        previsaoRecebimento: "30 dias",
        observacoes: "Repasse aguardando confirmação do convênio.",
        lancamentos: [
          {
            id: 1,
            descricao: "Consulta convênio Unimed",
            tipo: "Receita",
            valor: "R$ 120,00",
            vencimento: "2026-06-30",
            status: "Aguardando convênio",
            origem: "Plano de saúde",
          },
        ],
      },
    };
  }

  return {
    treatments: [
      {
        nome: "Restauração dente 16",
        progresso: "60%",
        detalhe: "Próxima sessão em 24/06/2026",
        status: "Em tratamento",
      },
      {
        nome: "Tratamento de canal",
        progresso: "25%",
        detalhe: "Dente 36 marcado para revisão",
        status: "Urgente",
      },
      {
        nome: "Clareamento dental",
        progresso: "10%",
        detalhe: "Iniciado recentemente",
        status: "Planejado",
      },
    ],
    history: [
      {
        titulo: "Profilaxia + Polimento",
        profissional: "Dr. Fernando Silva",
        data: "10/05/2026",
        status: "Concluído",
      },
      {
        titulo: "Restauração dente 16",
        profissional: "Dr. Fernando Silva",
        data: "20/04/2026",
        status: "Concluído",
      },
      {
        titulo: "Avaliação inicial",
        profissional: "Dr. Fernando Silva",
        data: "15/03/2026",
        status: "Concluído",
      },
    ],
    documents: [
      { nome: "Radiografia Panorâmica", detalhe: "PDF • 2.4 MB" },
      { nome: "Foto intraoral inicial", detalhe: "JPG • 1.8 MB" },
      { nome: "Orçamento odontológico", detalhe: "PDF • 0.9 MB" },
    ],
    notes: [
      "Paciente relata sensibilidade em dentes frios.",
      "Orientada sobre higiene bucal e uso do fio dental.",
      "Próxima avaliação odontológica em 24/06/2026.",
    ],
    info: {
      nascimento: "15/03/1990",
      cpf: "123.456.789-00",
      endereco: "Rua das Flores, 123",
      observacoes: "Alergia à penicilina",
    },
    prontuario: defaultProntuario,
    finance: {
      totalGasto: "R$ 2.450,00",
      status: "Em dia",
      detalhe: "Nenhuma pendência",
      formaPagamento: "Particular",
      convenio: "Particular",
      guia: "",
      autorizacao: "",
      previsaoRecebimento: "Recebido",
      observacoes: "Sem pendências financeiras no momento.",
      lancamentos: [
        {
          id: 1,
          descricao: "Consulta particular",
          tipo: "Receita",
          valor: "R$ 250,00",
          vencimento: "2026-06-12",
          status: "Pago",
          origem: "Particular",
        },
      ],
    },
  };
}

export function getPatientLiveKey(pacienteId: number) {
  return `cliniplus:patient-live:${pacienteId}`;
}

export function readPatientLiveData(pacienteId: number) {
  const fallback = getDefaultPatientData(pacienteId);

  if (typeof window === "undefined") {
    return fallback;
  }

  const saved = window.localStorage.getItem(getPatientLiveKey(pacienteId));

  if (!saved) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<LivePatientData>;

    return {
      ...fallback,
      ...parsed,
      info: { ...fallback.info, ...parsed.info },
      prontuario: { ...fallback.prontuario, ...parsed.prontuario },
      finance: { ...fallback.finance, ...parsed.finance },
    };
  } catch {
    return fallback;
  }
}

export function writePatientLiveData(
  pacienteId: number,
  data: LivePatientData
) {
  window.localStorage.setItem(getPatientLiveKey(pacienteId), JSON.stringify(data));
  window.dispatchEvent(new Event("cliniplus:patient-live"));
}
