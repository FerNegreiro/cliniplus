import {
  demoAgendamentos,
  demoDocumentos,
  demoFinanceiro,
  demoOrcamentos,
  demoPacientes,
  demoProcedimentosHof,
  demoTratamentos,
} from "@/data/demo";
import { hojeIso, dataIsoLocal } from "@/utils/datas";
import { idDaReferencia, removerArquivo, removerArquivosDoPaciente } from "@/utils/arquivos";

export type StoreId = string | number;

export type CliniplusPaciente = {
  id: StoreId;
  codigo?: StoreId;
  pacienteId?: StoreId;
  uuid?: StoreId;
  nome: string;
  nomeSocial?: string;
  area: string;
  tipoAtendimento: "odontologia" | "estetica";
  status: string;
  ultimo: string;
  telefone: string;
  telefoneFixo?: string;
  email: string;
  convenio: string;
  cpf?: string;
  dataNascimento?: string;
  nascimento?: string;
  genero?: string;
  sexo?: string;
  estadoCivil?: string;
  profissao?: string;
  tags?: string[];
  origem?: string;
  whatsapp?: boolean;
  contatoPreferencial?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  alergias?: string;
  condicoesCronicas?: string;
  medicamentosUso?: string;
  tipoSanguineo?: string;
  altoRisco?: boolean;
  observacoesImportantes?: string;
  planoConvenio?: string;
  numeroCarteirinha?: string;
  validadeCarteirinha?: string;
  responsavel?: string;
  parentesco?: string;
  telefoneEmergencia?: string;
  contatoAlternativo?: string;
  consentimentoLGPD?: boolean;
  consentimentoInformado?: boolean;
  autorizaLembretes?: boolean;
  autorizaTeleconsulta?: boolean;
  portalPaciente?: boolean;
  documentosChecklist?: string[];
  observacoesInternas?: string;
  observacoes?: string;
  criadoEm?: string;
};

export type CliniplusAgendamento = {
  id: StoreId;
  pacienteId: StoreId;
  paciente: string;
  pacienteNome?: string;
  tipo: string;
  tipoAtendimento?: string;
  data: string;
  hora: string;
  horario?: string;
  duracao: string;
  profissional?: string;
  especialidade?: string;
  unidade?: string;
  sala: string;
  prioridade: string;
  status: string;
  valor?: string;
  pagamento?: string;
  procedimento: string;
  observacoes?: string;
  recorrencia?: string;
  encaixe?: boolean;
  confirmacaoImediata?: boolean;
  antecedencia?: string;
  lembretes?: {
    whatsapp?: boolean;
    sms?: boolean;
    email?: boolean;
    vinteQuatroHoras?: boolean;
    duasHoras?: boolean;
    formularioDigital?: boolean;
  };
  observacaoPaciente?: string;
  observacaoInterna?: string;
  criadoEm?: string;
};

export type CliniplusProntuario = {
  pacienteId: StoreId;
  dados: Record<string, unknown>;
  atualizadoEm: string;
};

export type CliniplusProcedimentoStatus =
  | "planejado"
  | "agendado"
  | "em_andamento"
  | "concluido"
  | "aguardando"
  | "pendente"
  | "assinado"
  | "cancelado";

export type CliniplusProcedimento = {
  id: string;
  pacienteId: StoreId;
  data: string;
  hora: string;
  procedimento: string;
  dente?: string;
  faceRegiao?: string;
  categoria: string;
  profissional: string;
  status: CliniplusProcedimentoStatus;
  duracao?: string;
  valor?: number;
  diagnosticoIndicacao?: string;
  materiaisUtilizados?: string;
  anestesia?: string;
  observacoes?: string;
  conduta?: string;
  assinadoEm?: string;
  criadoEm: string;
  atualizadoEm?: string;
};

export type CliniplusExameStatus =
  | "solicitado"
  | "pendente"
  | "realizado"
  | "concluido"
  | "alterado"
  | "revisao"
  | "cancelado"
  | "assinado";

export type CliniplusExameOrigem =
  | "clinica"
  | "parceiro"
  | "paciente"
  | "externo";

export type CliniplusExame = {
  id: string;
  pacienteId: StoreId;
  data: string;
  hora: string;
  exame: string;
  dente?: string;
  regiao?: string;
  categoria: string;
  profissional: string;
  status: CliniplusExameStatus;
  origem: CliniplusExameOrigem;
  arquivoNome?: string;
  arquivoTipo?: string;
  arquivoTamanho?: string;
  arquivoObservacao?: string;
  arquivoAnexadoEm?: string;
  arquivoUrl?: string;
  achados?: string;
  observacoes?: string;
  laudo?: string;
  assinadoEm?: string;
  criadoEm: string;
  atualizadoEm?: string;
};

export type CliniplusTratamento = {
  id: StoreId;
  pacienteId: StoreId;
  paciente?: string;
  descricao: string;
  status: string;
  valor: string;
  data: string;
};

export type CliniplusLancamentoFinanceiro = {
  id: StoreId;
  pacienteId?: StoreId;
  paciente?: string;
  descricao: string;
  tipo: "Receita" | "Despesa" | string;
  valor: string;
  status: string;
  data: string;
  origem?: string;
  formaPagamento?: string;
  convenio?: string;
  guia?: string;
  autorizacao?: string;
  observacoes?: string;
};

export type OrcamentoItem = {
  id: string;
  procedimento: string;
  dente?: string;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
  valorFinal: number;
};

export type CliniplusOrcamento = {
  id: string;
  numero: string;
  pacienteId: StoreId;
  origem: "plano" | "manual";
  planoId?: string;
  status: "rascunho" | "enviado" | "aprovado" | "cancelado";
  itens: OrcamentoItem[];
  subtotal: number;
  descontos: number;
  total: number;
  entrada: number;
  valorRestante: number;
  condicaoPagamento: string;
  formasPagamento: string[];
  mensagemPaciente: string;
  criadoEm: string;
  atualizadoEm?: string;
};

export type CliniplusDocumento = {
  id: StoreId;
  pacienteId: StoreId;
  paciente?: string;
  nome: string;
  categoria?: string;
  tipo: string;
  observacao?: string;
  observacoes?: string;
  data: string;
  dataEnvio?: string;
  horaEnvio?: string;
  formato?: string;
  extensao?: string;
  tamanho?: string;
  origem?: string;
  enviadoPor?: string;
  urlSimulada?: string;
  arquivoId?: string;
  status?: string;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type CliniplusEvolucao = {
  id: StoreId;
  pacienteId: StoreId;
  data: string;
  hora: string;
  profissional: string;
  tipo: string;
  area: string;
  dentes?: string;
  titulo: string;
  texto: string;
  tags?: string[];
  status: "rascunho" | "assinada";
  criadoEm: string;
  atualizadoEm?: string;
};

export type CliniplusOdontogramaAnotacao = {
  id: StoreId;
  pacienteId: StoreId;
  dente: string;
  face?: string;
  condicao: string;
  status: string;
  observacao?: string;
  profissional: string;
  data: string;
  criadoEm: string;
  atualizadoEm?: string;
};

export type CliniplusOHFAvaliacao = {
  id: StoreId;
  pacienteId: StoreId;
  data: string;
  hora: string;
  profissional: string;
  doencasSistemicas: string;
  alergias: string;
  medicamentosUso: string;
  historicoCirurgias: string;
  internacoesPrevias: string;
  transfusoes: string;
  doencasTransmissiveis: string;
  observacoesMedicas: string;
  ultimaConsultaOdontologica: string;
  motivoUltimaConsulta: string;
  tratamentosPrevios: string;
  cirurgiasOrais: string;
  reacoesAnestesicos: string;
  sensibilidadeMateriais: string;
  habitosParafuncionais: string;
  observacoesOdontologicas: string;
  estadoEmocional: string;
  nivelColaboracao: string;
  compreensaoOrientacoes: string;
  suporteFamiliar: string;
  condicoesHigieneOral: string;
  riscoAsa: string;
  riscoSangramento: string;
  consideracoesEspeciais: string;
  condutasCuidados: string;
  status: "rascunho" | "finalizada";
  criadoEm: string;
  atualizadoEm?: string;
};

export type PlanoTratamentoItem = {
  id: string;
  fase: string;
  procedimento: string;
  dente?: string;
  prioridade: "baixa" | "media" | "alta";
  status:
    | "planejado"
    | "aguardando"
    | "em_andamento"
    | "concluido"
    | "cancelado";
  profissional: string;
  valor: number;
  previsao?: string;
  observacoes?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  concluidoEm?: string;
};

export type CliniplusPlanoTratamento = {
  id: string;
  pacienteId: StoreId;
  titulo: string;
  status: "rascunho" | "em_andamento" | "aprovado" | "concluido" | "cancelado";
  profissional: string;
  dataCriacao: string;
  previsaoInicio?: string;
  previsaoFim?: string;
  observacoes?: string;
  formasPagamento?: string[];
  itens: PlanoTratamentoItem[];
  criadoEm: string;
  atualizadoEm?: string;
  aprovadoEm?: string;
};

export type SessaoPlano = {
  modo?: string;
  plano?: "starter" | "pro" | "premium" | string;
  demo?: string | boolean;
};

const keys = {
  pacientes: "cliniplus-pacientes",
  pacientesLegacy: "cliniplus:pacientes",
  agenda: "cliniplus-agenda",
  prontuarios: "cliniplus-prontuarios",
  tratamentos: "cliniplus-tratamentos",
  financeiro: "cliniplus-financeiro",
  documentos: "cliniplus-documentos",
  procedimentos: "cliniplus-procedimentos",
  exames: "cliniplus-exames",
  evolucoes: "cliniplus-evolucoes",
  odontograma: "cliniplus-odontograma",
  ohf: "cliniplus-ohf",
  planosTratamento: "cliniplus-planos-tratamento",
  orcamentos: "cliniplus-orcamentos",
  hof: "cliniplus-hof",
  sessaoPlano: "cliniplus-sessao-plano",
};

function hasWindow() {
  return typeof window !== "undefined";
}

function sameId(a: StoreId | undefined, b: StoreId | undefined) {
  return String(a) === String(b);
}

function matchesPacienteId(paciente: CliniplusPaciente, id: StoreId) {
  return (
    sameId(paciente.id, id) ||
    sameId(paciente.codigo, id) ||
    sameId(paciente.pacienteId, id) ||
    sameId(paciente.uuid, id)
  );
}

function createId() {
  if (hasWindow() && "crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }

  return String(Date.now());
}

function emitStoreChange() {
  if (hasWindow()) {
    window.dispatchEvent(new Event("cliniplus:store"));
  }
}

function readList<T>(key: string, seed: T[]) {
  if (!hasWindow()) {
    return [];
  }

  const saved = window.localStorage.getItem(key);

  if (!saved) {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(saved) as T[];
  } catch {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
}

function writeList<T>(key: string, value: T[]) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  emitStoreChange();
}

function readValue<T>(key: string, fallback: T): T {
  if (!hasWindow()) {
    return fallback;
  }

  const saved = window.localStorage.getItem(key);

  if (!saved) {
    return fallback;
  }

  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function seedPacientes(): CliniplusPaciente[] {
  return demoPacientes();
}

function seedAgendamentos(): CliniplusAgendamento[] {
  return demoAgendamentos();
}

function seedTratamentos(): CliniplusTratamento[] {
  return demoTratamentos();
}

function seedFinanceiro(): CliniplusLancamentoFinanceiro[] {
  return demoFinanceiro();
}

function seedDocumentos(): CliniplusDocumento[] {
  return demoDocumentos();
}

export function getPacientes() {
  return readList<CliniplusPaciente>(keys.pacientes, seedPacientes());
}

export function addPaciente(paciente: Partial<CliniplusPaciente>) {
  const pacientes = getPacientes();
  const novoPaciente: CliniplusPaciente = {
    id: paciente.id ?? createId(),
    nome: paciente.nome?.trim() || "Paciente sem nome",
    area: paciente.area || "Avaliacao",
    tipoAtendimento: paciente.tipoAtendimento || "odontologia",
    status: paciente.status || "Ativo",
    ultimo: paciente.ultimo || new Date().toLocaleDateString("pt-BR"),
    telefone: paciente.telefone || "Nao informado",
    telefoneFixo: paciente.telefoneFixo,
    email: paciente.email || "Nao informado",
    convenio: paciente.convenio || "Particular",
    cpf: paciente.cpf,
    nomeSocial: paciente.nomeSocial,
    dataNascimento: paciente.dataNascimento || paciente.nascimento,
    nascimento: paciente.nascimento || paciente.dataNascimento,
    genero: paciente.genero || paciente.sexo,
    sexo: paciente.sexo || paciente.genero,
    estadoCivil: paciente.estadoCivil,
    profissao: paciente.profissao,
    tags: paciente.tags,
    origem: paciente.origem,
    whatsapp: paciente.whatsapp,
    contatoPreferencial: paciente.contatoPreferencial,
    cep: paciente.cep,
    endereco: paciente.endereco,
    numero: paciente.numero,
    complemento: paciente.complemento,
    bairro: paciente.bairro,
    cidade: paciente.cidade,
    uf: paciente.uf,
    alergias: paciente.alergias,
    condicoesCronicas: paciente.condicoesCronicas,
    medicamentosUso: paciente.medicamentosUso,
    tipoSanguineo: paciente.tipoSanguineo,
    altoRisco: paciente.altoRisco,
    observacoesImportantes: paciente.observacoesImportantes,
    planoConvenio: paciente.planoConvenio,
    numeroCarteirinha: paciente.numeroCarteirinha,
    validadeCarteirinha: paciente.validadeCarteirinha,
    responsavel: paciente.responsavel,
    parentesco: paciente.parentesco,
    telefoneEmergencia: paciente.telefoneEmergencia,
    contatoAlternativo: paciente.contatoAlternativo,
    consentimentoLGPD: paciente.consentimentoLGPD,
    consentimentoInformado: paciente.consentimentoInformado,
    autorizaLembretes: paciente.autorizaLembretes,
    autorizaTeleconsulta: paciente.autorizaTeleconsulta,
    portalPaciente: paciente.portalPaciente,
    documentosChecklist: paciente.documentosChecklist,
    observacoesInternas: paciente.observacoesInternas,
    observacoes: paciente.observacoes,
    criadoEm: paciente.criadoEm || new Date().toISOString(),
  };

  writeList(keys.pacientes, [...pacientes, novoPaciente]);
  return novoPaciente;
}

export function updatePaciente(id: StoreId, dados: Partial<CliniplusPaciente>) {
  const pacientes = getPacientes().map((paciente) =>
    sameId(paciente.id, id) ? { ...paciente, ...dados } : paciente
  );

  writeList(keys.pacientes, pacientes);
}

const chavesVinculadasAoPaciente = [
  keys.agenda,
  keys.prontuarios,
  keys.tratamentos,
  keys.financeiro,
  keys.documentos,
  keys.procedimentos,
  keys.exames,
  keys.evolucoes,
  keys.odontograma,
  keys.ohf,
  keys.planosTratamento,
  keys.orcamentos,
  keys.hof,
];

export function deletePaciente(id: StoreId) {
  if (!hasWindow()) {
    return;
  }

  const paciente = getPacienteById(id);
  const ids = new Set(
    [id, paciente?.id, paciente?.codigo, paciente?.pacienteId, paciente?.uuid]
      .filter((valor) => valor !== undefined && valor !== null && valor !== "")
      .map(String)
  );
  const pertenceAoPaciente = (item: { pacienteId?: StoreId }) =>
    item.pacienteId !== undefined && ids.has(String(item.pacienteId));

  chavesVinculadasAoPaciente.forEach((chave) => {
    const lista = readValue<Array<{ pacienteId?: StoreId }>>(chave, []);
    window.localStorage.setItem(
      chave,
      JSON.stringify(lista.filter((item) => !pertenceAoPaciente(item)))
    );
  });

  const legado = readValue<CliniplusPaciente[]>(keys.pacientesLegacy, []);
  window.localStorage.setItem(
    keys.pacientesLegacy,
    JSON.stringify(legado.filter((item) => !ids.has(String(item.id))))
  );

  ids.forEach((valor) => {
    removerArquivosDoPaciente(valor).catch(() => undefined);
    window.localStorage.removeItem(`cliniplus:patient-live:${valor}`);
    window.localStorage.removeItem(`cliniplus:hof-live:${valor}`);
  });

  if (paciente?.nome) {
    window.localStorage.removeItem(`cliniplus:hof-live:${paciente.nome}`);
  }

  writeList(
    keys.pacientes,
    getPacientes().filter((item) => !ids.has(String(item.id)))
  );
}

export function getPacienteById(id: StoreId) {
  const paciente =
    getPacientes().find((item) => matchesPacienteId(item, id)) ??
    readValue<CliniplusPaciente[]>(keys.pacientesLegacy, []).find((item) =>
      matchesPacienteId(item, id)
    );

  return paciente ?? null;
}

export function getAgendamentos() {
  return readList<CliniplusAgendamento>(keys.agenda, seedAgendamentos());
}

export function addAgendamento(agendamento: Partial<CliniplusAgendamento>) {
  const agendamentos = getAgendamentos();
  const nomePaciente =
    (agendamento.paciente || agendamento.pacienteNome)?.trim() ||
    "Paciente sem nome";
  const tipoAtendimento =
    agendamento.tipoAtendimento || agendamento.tipo || "Consulta";
  const horario = agendamento.hora || agendamento.horario || "09:00";
  let paciente =
    agendamento.pacienteId !== undefined
      ? getPacienteById(agendamento.pacienteId)
      : getPacientes().find(
          (item) => item.nome.toLowerCase() === nomePaciente.toLowerCase()
        ) ?? null;

  if (!paciente) {
    paciente = addPaciente({
      nome: nomePaciente,
      area: agendamento.procedimento || agendamento.tipo || "Avaliacao",
      status: "Ativo",
    });
  }

  const novoAgendamento: CliniplusAgendamento = {
    id: agendamento.id ?? createId(),
    pacienteId: paciente.id,
    paciente: paciente.nome,
    pacienteNome: paciente.nome,
    tipo: tipoAtendimento,
    tipoAtendimento,
    data: agendamento.data || hojeIso(),
    hora: horario,
    horario,
    duracao: agendamento.duracao || "45 min",
    profissional: agendamento.profissional || nomeExibicaoProfissional(),
    especialidade: agendamento.especialidade || "Clinica geral",
    unidade: agendamento.unidade || "Clinica principal",
    sala: agendamento.sala || "Consultorio 01",
    prioridade: agendamento.prioridade || "Normal",
    status: agendamento.status || "Confirmado",
    valor: agendamento.valor,
    pagamento: agendamento.pagamento,
    procedimento: agendamento.procedimento || agendamento.tipo || "Consulta",
    observacoes: agendamento.observacoes || "",
    recorrencia: agendamento.recorrencia || "Nao repetir",
    encaixe: Boolean(agendamento.encaixe),
    confirmacaoImediata: agendamento.confirmacaoImediata ?? true,
    antecedencia: agendamento.antecedencia || "15 minutos",
    lembretes: agendamento.lembretes,
    observacaoPaciente: agendamento.observacaoPaciente || "",
    observacaoInterna: agendamento.observacaoInterna || "",
    criadoEm: agendamento.criadoEm || new Date().toISOString(),
  };

  writeList(keys.agenda, [...agendamentos, novoAgendamento]);
  return novoAgendamento;
}

export function updateAgendamento(
  id: StoreId,
  dados: Partial<CliniplusAgendamento>
) {
  writeList(
    keys.agenda,
    getAgendamentos().map((agendamento) => {
      if (!sameId(agendamento.id, id)) {
        return agendamento;
      }

      const pacienteNome =
        (dados.paciente || dados.pacienteNome)?.trim() ||
        agendamento.paciente ||
        agendamento.pacienteNome;
      const tipoAtendimento =
        dados.tipoAtendimento || dados.tipo || agendamento.tipoAtendimento;
      const horario = dados.hora || dados.horario || agendamento.hora;

      return {
        ...agendamento,
        ...dados,
        paciente: pacienteNome || agendamento.paciente,
        pacienteNome: pacienteNome || agendamento.pacienteNome,
        tipo: tipoAtendimento || agendamento.tipo,
        tipoAtendimento: tipoAtendimento || agendamento.tipoAtendimento,
        hora: horario,
        horario,
      };
    })
  );
}

export function deleteAgendamento(id: StoreId) {
  writeList(
    keys.agenda,
    getAgendamentos().filter((agendamento) => !sameId(agendamento.id, id))
  );
}

export function getAgendamentosByPacienteId(pacienteId: StoreId) {
  return getAgendamentos().filter((agendamento) =>
    sameId(agendamento.pacienteId, pacienteId)
  );
}

export function getProntuarioByPacienteId(pacienteId: StoreId) {
  return (
    readList<CliniplusProntuario>(keys.prontuarios, []).find((prontuario) =>
      sameId(prontuario.pacienteId, pacienteId)
    ) ?? null
  );
}

export function saveProntuario(pacienteId: StoreId, dados: Record<string, unknown>) {
  const prontuarios = readList<CliniplusProntuario>(keys.prontuarios, []);
  const proximo = [
    ...prontuarios.filter((prontuario) => !sameId(prontuario.pacienteId, pacienteId)),
    { pacienteId, dados, atualizadoEm: new Date().toISOString() },
  ];

  writeList(keys.prontuarios, proximo);
}

export function getProcedimentos() {
  return readList<CliniplusProcedimento>(keys.procedimentos, []);
}

export function getProcedimentosByPacienteId(pacienteId: StoreId) {
  return getProcedimentos()
    .filter((procedimento) => sameId(procedimento.pacienteId, pacienteId))
    .sort((a, b) => {
      const dataA = `${a.data || ""}T${a.hora || "00:00"}`;
      const dataB = `${b.data || ""}T${b.hora || "00:00"}`;
      return dataB.localeCompare(dataA);
    });
}

export function addProcedimento(
  procedimento: Partial<CliniplusProcedimento> &
    Pick<CliniplusProcedimento, "pacienteId" | "procedimento" | "categoria" | "profissional">
) {
  const agora = new Date().toISOString();
  const novoProcedimento: CliniplusProcedimento = {
    id: procedimento.id || String(createId()),
    pacienteId: procedimento.pacienteId,
    data: procedimento.data || agora.slice(0, 10),
    hora: procedimento.hora || agora.slice(11, 16),
    procedimento: procedimento.procedimento || "Procedimento",
    dente: procedimento.dente,
    faceRegiao: procedimento.faceRegiao,
    categoria: procedimento.categoria || "Outra",
    profissional: procedimento.profissional || nomeExibicaoProfissional(),
    status: procedimento.status || "planejado",
    duracao: procedimento.duracao,
    valor: procedimento.valor,
    diagnosticoIndicacao: procedimento.diagnosticoIndicacao,
    materiaisUtilizados: procedimento.materiaisUtilizados,
    anestesia: procedimento.anestesia,
    observacoes: procedimento.observacoes,
    conduta: procedimento.conduta,
    assinadoEm: procedimento.assinadoEm,
    criadoEm: procedimento.criadoEm || agora,
    atualizadoEm: procedimento.atualizadoEm,
  };

  writeList(keys.procedimentos, [...getProcedimentos(), novoProcedimento]);
  return novoProcedimento;
}

export function updateProcedimento(
  id: StoreId,
  dados: Partial<CliniplusProcedimento>
): CliniplusProcedimento | null {
  const atualizadoEm = new Date().toISOString();
  let procedimentoAtualizado: CliniplusProcedimento | null = null;

  const procedimentos = getProcedimentos().map((procedimento) => {
    if (!sameId(procedimento.id, id)) {
      return procedimento;
    }

    procedimentoAtualizado = {
      ...procedimento,
      ...dados,
      atualizadoEm,
    };
    return procedimentoAtualizado;
  });

  writeList(keys.procedimentos, procedimentos);
  return procedimentoAtualizado as CliniplusProcedimento | null;
}

export function deleteProcedimento(id: StoreId) {
  writeList(
    keys.procedimentos,
    getProcedimentos().filter((procedimento) => !sameId(procedimento.id, id))
  );
}

export function getExames() {
  return readList<CliniplusExame>(keys.exames, []);
}

export function getExamesByPacienteId(pacienteId: StoreId) {
  return getExames()
    .filter((exame) => sameId(exame.pacienteId, pacienteId))
    .sort((a, b) => {
      const dataA = `${a.data || ""}T${a.hora || "00:00"}`;
      const dataB = `${b.data || ""}T${b.hora || "00:00"}`;
      return dataB.localeCompare(dataA);
    });
}

export function addExame(
  exame: Partial<CliniplusExame> &
    Pick<CliniplusExame, "pacienteId" | "exame" | "categoria" | "profissional">
) {
  const agora = new Date().toISOString();
  const novoExame: CliniplusExame = {
    id: exame.id || String(createId()),
    pacienteId: exame.pacienteId,
    data: exame.data || agora.slice(0, 10),
    hora: exame.hora || agora.slice(11, 16),
    exame: exame.exame || "Exame",
    dente: exame.dente,
    regiao: exame.regiao,
    categoria: exame.categoria || "Outro",
    profissional: exame.profissional || nomeExibicaoProfissional(),
    status: exame.status || "solicitado",
    origem: exame.origem || "clinica",
    arquivoNome: exame.arquivoNome,
    arquivoTipo: exame.arquivoTipo,
    arquivoTamanho: exame.arquivoTamanho,
    arquivoObservacao: exame.arquivoObservacao,
    arquivoAnexadoEm: exame.arquivoAnexadoEm,
    arquivoUrl: exame.arquivoUrl,
    achados: exame.achados,
    observacoes: exame.observacoes,
    laudo: exame.laudo,
    assinadoEm: exame.assinadoEm,
    criadoEm: exame.criadoEm || agora,
    atualizadoEm: exame.atualizadoEm,
  };

  writeList(keys.exames, [...getExames(), novoExame]);
  return novoExame;
}

export function updateExame(
  id: StoreId,
  dados: Partial<CliniplusExame>
): CliniplusExame | null {
  const atualizadoEm = new Date().toISOString();
  let exameAtualizado: CliniplusExame | null = null;

  const exames = getExames().map((exame) => {
    if (!sameId(exame.id, id)) {
      return exame;
    }

    exameAtualizado = {
      ...exame,
      ...dados,
      atualizadoEm,
    };
    return exameAtualizado;
  });

  writeList(keys.exames, exames);
  return exameAtualizado as CliniplusExame | null;
}

export function deleteExame(id: StoreId) {
  const arquivoId = idDaReferencia(getExames().find((exame) => sameId(exame.id, id))?.arquivoUrl);
  if (arquivoId) {
    removerArquivo(arquivoId).catch(() => undefined);
  }

  writeList(
    keys.exames,
    getExames().filter((exame) => !sameId(exame.id, id))
  );
}

export function getTratamentos() {
  return readList<CliniplusTratamento>(keys.tratamentos, seedTratamentos());
}

export function addTratamento(tratamento: Partial<CliniplusTratamento>) {
  const paciente = tratamento.pacienteId
    ? getPacienteById(tratamento.pacienteId)
    : null;
  const novoTratamento: CliniplusTratamento = {
    id: tratamento.id ?? createId(),
    pacienteId: tratamento.pacienteId ?? "",
    paciente: tratamento.paciente || paciente?.nome,
    descricao: tratamento.descricao || "Tratamento",
    status: tratamento.status || "Planejado",
    valor: tratamento.valor || "",
    data: tratamento.data || "",
  };

  writeList(keys.tratamentos, [...getTratamentos(), novoTratamento]);
  return novoTratamento;
}

export function updateTratamento(id: StoreId, dados: Partial<CliniplusTratamento>) {
  writeList(
    keys.tratamentos,
    getTratamentos().map((tratamento) =>
      sameId(tratamento.id, id) ? { ...tratamento, ...dados } : tratamento
    )
  );
}

export function deleteTratamento(id: StoreId) {
  writeList(
    keys.tratamentos,
    getTratamentos().filter((tratamento) => !sameId(tratamento.id, id))
  );
}

export function getTratamentosByPacienteId(pacienteId: StoreId) {
  return getTratamentos().filter((tratamento) =>
    sameId(tratamento.pacienteId, pacienteId)
  );
}

export function getPlanosTratamento() {
  return readList<CliniplusPlanoTratamento>(keys.planosTratamento, []);
}

export function getPlanosTratamentoByPacienteId(pacienteId: StoreId) {
  return getPlanosTratamento()
    .filter((plano) => sameId(plano.pacienteId, pacienteId))
    .sort((a, b) =>
      (b.atualizadoEm || b.criadoEm || "").localeCompare(
        a.atualizadoEm || a.criadoEm || ""
      )
    );
}

export function addPlanoTratamento(
  plano: Partial<CliniplusPlanoTratamento>
) {
  const agora = new Date().toISOString();
  const novoPlano: CliniplusPlanoTratamento = {
    id: String(plano.id ?? createId()),
    pacienteId: plano.pacienteId ?? "",
    titulo: plano.titulo || "Plano de tratamento odontologico",
    status: plano.status || "rascunho",
    profissional: plano.profissional || nomeExibicaoProfissional(),
    dataCriacao: plano.dataCriacao || agora.slice(0, 10),
    previsaoInicio: plano.previsaoInicio || "",
    previsaoFim: plano.previsaoFim || "",
    observacoes: plano.observacoes || "",
    formasPagamento: plano.formasPagamento || [],
    itens: plano.itens || [],
    criadoEm: plano.criadoEm || agora,
    atualizadoEm: plano.atualizadoEm,
    aprovadoEm: plano.aprovadoEm,
  };

  writeList(keys.planosTratamento, [...getPlanosTratamento(), novoPlano]);
  return novoPlano;
}

export function updatePlanoTratamento(
  id: StoreId,
  dados: Partial<CliniplusPlanoTratamento>
) {
  writeList(
    keys.planosTratamento,
    getPlanosTratamento().map((plano) =>
      sameId(plano.id, id)
        ? { ...plano, ...dados, atualizadoEm: new Date().toISOString() }
        : plano
    )
  );
}

export function deletePlanoTratamento(id: StoreId) {
  writeList(
    keys.planosTratamento,
    getPlanosTratamento().filter((plano) => !sameId(plano.id, id))
  );
}

function createOrcamentoNumero() {
  const sequencial = getOrcamentos().length + 1;
  return `ORC-${String(sequencial).padStart(6, "0")}`;
}

export function getOrcamentos() {
  return readList<CliniplusOrcamento>(keys.orcamentos, demoOrcamentos());
}

export function getOrcamentosByPacienteId(pacienteId: StoreId) {
  return getOrcamentos()
    .filter((orcamento) => sameId(orcamento.pacienteId, pacienteId))
    .sort((a, b) =>
      (b.atualizadoEm || b.criadoEm || "").localeCompare(
        a.atualizadoEm || a.criadoEm || ""
      )
    );
}

export function addOrcamento(orcamento: Partial<CliniplusOrcamento>) {
  const agora = new Date().toISOString();
  const novoOrcamento: CliniplusOrcamento = {
    id: String(orcamento.id ?? createId()),
    numero: orcamento.numero || createOrcamentoNumero(),
    pacienteId: orcamento.pacienteId ?? "",
    origem: orcamento.origem || "manual",
    planoId: orcamento.planoId,
    status: orcamento.status || "rascunho",
    itens: orcamento.itens || [],
    subtotal: orcamento.subtotal || 0,
    descontos: orcamento.descontos || 0,
    total: orcamento.total || 0,
    entrada: orcamento.entrada || 0,
    valorRestante: orcamento.valorRestante || 0,
    condicaoPagamento: orcamento.condicaoPagamento || "A vista com desconto",
    formasPagamento: orcamento.formasPagamento || ["Pix", "Cartao credito"],
    mensagemPaciente: orcamento.mensagemPaciente || "",
    criadoEm: orcamento.criadoEm || agora,
    atualizadoEm: orcamento.atualizadoEm,
  };

  writeList(keys.orcamentos, [...getOrcamentos(), novoOrcamento]);
  return novoOrcamento;
}

export function updateOrcamento(
  id: StoreId,
  dados: Partial<CliniplusOrcamento>
) {
  const atualizadoEm = new Date().toISOString();

  writeList(
    keys.orcamentos,
    getOrcamentos().map((orcamento) =>
      sameId(orcamento.id, id)
        ? { ...orcamento, ...dados, atualizadoEm }
        : orcamento
    )
  );
}

export function deleteOrcamento(id: StoreId) {
  writeList(
    keys.orcamentos,
    getOrcamentos().filter((orcamento) => !sameId(orcamento.id, id))
  );
}

export function getLancamentosFinanceiros() {
  return readList<CliniplusLancamentoFinanceiro>(
    keys.financeiro,
    seedFinanceiro()
  );
}

export function addLancamentoFinanceiro(
  lancamento: Partial<CliniplusLancamentoFinanceiro>
) {
  const paciente = lancamento.pacienteId
    ? getPacienteById(lancamento.pacienteId)
    : null;
  const novoLancamento: CliniplusLancamentoFinanceiro = {
    id: lancamento.id ?? createId(),
    pacienteId: lancamento.pacienteId,
    paciente: lancamento.paciente || paciente?.nome,
    descricao: lancamento.descricao || "Lancamento",
    tipo: lancamento.tipo || "Receita",
    valor: lancamento.valor || "R$ 0",
    status: lancamento.status || "Pendente",
    data: lancamento.data || "",
    origem: lancamento.origem || paciente?.convenio || "Clinica",
    formaPagamento: lancamento.formaPagamento,
    convenio: lancamento.convenio,
    guia: lancamento.guia,
    autorizacao: lancamento.autorizacao,
    observacoes: lancamento.observacoes,
  };

  writeList(keys.financeiro, [...getLancamentosFinanceiros(), novoLancamento]);
  return novoLancamento;
}

export function updateLancamentoFinanceiro(
  id: StoreId,
  dados: Partial<CliniplusLancamentoFinanceiro>
) {
  writeList(
    keys.financeiro,
    getLancamentosFinanceiros().map((lancamento) =>
      sameId(lancamento.id, id) ? { ...lancamento, ...dados } : lancamento
    )
  );
}

export function deleteLancamentoFinanceiro(id: StoreId) {
  writeList(
    keys.financeiro,
    getLancamentosFinanceiros().filter((lancamento) => !sameId(lancamento.id, id))
  );
}

export function getFinanceiroByPacienteId(pacienteId: StoreId) {
  return getLancamentosFinanceiros().filter((lancamento) =>
    sameId(lancamento.pacienteId, pacienteId)
  );
}

export function getDocumentos() {
  return readList<CliniplusDocumento>(keys.documentos, seedDocumentos());
}

export function addDocumento(documento: Partial<CliniplusDocumento>) {
  const paciente = documento.pacienteId ? getPacienteById(documento.pacienteId) : null;
  const agora = new Date().toISOString();
  const momento = new Date();
  const dataEnvio = documento.dataEnvio || documento.data || dataIsoLocal(momento);
  const horaEnvio =
    documento.horaEnvio ||
    `${String(momento.getHours()).padStart(2, "0")}:${String(momento.getMinutes()).padStart(2, "0")}`;
  const extensao = documento.extensao || documento.formato || "";
  const novoDocumento: CliniplusDocumento = {
    id: documento.id ?? createId(),
    pacienteId: documento.pacienteId ?? "",
    paciente: documento.paciente || paciente?.nome,
    nome: documento.nome || "Documento",
    categoria: documento.categoria || documento.origem || "Outros",
    tipo: documento.tipo || "documento",
    observacao: documento.observacao || documento.observacoes || "",
    observacoes: documento.observacoes || documento.observacao || "",
    data: dataEnvio,
    dataEnvio,
    horaEnvio,
    formato: documento.formato || extensao || "Registro",
    extensao,
    tamanho: documento.tamanho || "-",
    origem: documento.origem || "Paciente",
    enviadoPor: documento.enviadoPor || documento.paciente || paciente?.nome || "Clini+",
    urlSimulada: documento.urlSimulada,
    arquivoId: documento.arquivoId,
    status: documento.status || "ativo",
    criadoEm: documento.criadoEm || agora,
    atualizadoEm: documento.atualizadoEm,
  };

  writeList(keys.documentos, [...getDocumentos(), novoDocumento]);
  return novoDocumento;
}

export function getDocumentoById(id: StoreId) {
  return getDocumentos().find((documento) => sameId(documento.id, id)) ?? null;
}

export function updateDocumento(
  id: StoreId,
  dados: Partial<CliniplusDocumento>
) {
  const atualizadoEm = new Date().toISOString();
  let documentoAtualizado: CliniplusDocumento | null = null;

  const documentos = getDocumentos().map((documento) => {
    if (!sameId(documento.id, id)) {
      return documento;
    }

    documentoAtualizado = {
      ...documento,
      ...dados,
      observacao: dados.observacao ?? dados.observacoes ?? documento.observacao,
      observacoes: dados.observacoes ?? dados.observacao ?? documento.observacoes,
      data: dados.dataEnvio || dados.data || documento.data,
      dataEnvio: dados.dataEnvio || dados.data || documento.dataEnvio,
      formato: dados.formato || dados.extensao || documento.formato,
      extensao: dados.extensao || dados.formato || documento.extensao,
      atualizadoEm,
    };
    return documentoAtualizado;
  });

  writeList(keys.documentos, documentos);
  return documentoAtualizado;
}

export function deleteDocumento(id: StoreId) {
  const documentoRemovido = getDocumentos().find((documento) => sameId(documento.id, id));
  const arquivoId =
    documentoRemovido?.arquivoId || idDaReferencia(documentoRemovido?.urlSimulada);
  if (arquivoId) {
    removerArquivo(arquivoId).catch(() => undefined);
  }

  writeList(
    keys.documentos,
    getDocumentos().filter((documento) => !sameId(documento.id, id))
  );
}

export function getDocumentosByPacienteId(pacienteId: StoreId) {
  return getDocumentos().filter((documento) =>
    sameId(documento.pacienteId, pacienteId)
  );
}

export function getEvolucoes() {
  return readList<CliniplusEvolucao>(keys.evolucoes, []);
}

export function getEvolucoesByPacienteId(pacienteId: StoreId) {
  return getEvolucoes()
    .filter((evolucao) => sameId(evolucao.pacienteId, pacienteId))
    .sort((a, b) => {
      const dataA = `${a.data || ""}T${a.hora || "00:00"}`;
      const dataB = `${b.data || ""}T${b.hora || "00:00"}`;

      return dataB.localeCompare(dataA);
    });
}

export function addEvolucao(evolucao: Partial<CliniplusEvolucao>) {
  const novaEvolucao: CliniplusEvolucao = {
    id: evolucao.id ?? createId(),
    pacienteId: evolucao.pacienteId ?? "",
    data: evolucao.data || hojeIso(),
    hora:
      evolucao.hora ||
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    profissional: evolucao.profissional || nomeExibicaoProfissional(),
    tipo: evolucao.tipo || "Consulta",
    area: evolucao.area || "Odontologia",
    dentes: evolucao.dentes || "",
    titulo: evolucao.titulo || "Evolução clínica",
    texto: evolucao.texto || "",
    tags: evolucao.tags || [],
    status: evolucao.status || "rascunho",
    criadoEm: evolucao.criadoEm || new Date().toISOString(),
    atualizadoEm: evolucao.atualizadoEm,
  };

  writeList(keys.evolucoes, [...getEvolucoes(), novaEvolucao]);
  return novaEvolucao;
}

export function updateEvolucao(id: StoreId, dados: Partial<CliniplusEvolucao>) {
  writeList(
    keys.evolucoes,
    getEvolucoes().map((evolucao) =>
      sameId(evolucao.id, id)
        ? { ...evolucao, ...dados, atualizadoEm: new Date().toISOString() }
        : evolucao
    )
  );
}

export function deleteEvolucao(id: StoreId) {
  writeList(
    keys.evolucoes,
    getEvolucoes().filter((evolucao) => !sameId(evolucao.id, id))
  );
}

export function getOdontograma() {
  return readList<CliniplusOdontogramaAnotacao>(keys.odontograma, []);
}

export function getOdontogramaByPacienteId(pacienteId: StoreId) {
  return getOdontograma()
    .filter((anotacao) => sameId(anotacao.pacienteId, pacienteId))
    .sort((a, b) => {
      const dataA = `${a.data || ""}T${a.atualizadoEm || a.criadoEm || ""}`;
      const dataB = `${b.data || ""}T${b.atualizadoEm || b.criadoEm || ""}`;

      return dataB.localeCompare(dataA);
    });
}

export function addOdontogramaAnotacao(
  anotacao: Partial<CliniplusOdontogramaAnotacao>
) {
  const novaAnotacao: CliniplusOdontogramaAnotacao = {
    id: anotacao.id ?? createId(),
    pacienteId: anotacao.pacienteId ?? "",
    dente: anotacao.dente || "",
    face: anotacao.face || "Geral",
    condicao: anotacao.condicao || "Hígido",
    status: anotacao.status || "Observação",
    observacao: anotacao.observacao || "",
    profissional: anotacao.profissional || nomeExibicaoProfissional(),
    data: anotacao.data || hojeIso(),
    criadoEm: anotacao.criadoEm || new Date().toISOString(),
    atualizadoEm: anotacao.atualizadoEm,
  };

  writeList(keys.odontograma, [...getOdontograma(), novaAnotacao]);
  return novaAnotacao;
}

export function updateOdontogramaAnotacao(
  id: StoreId,
  dados: Partial<CliniplusOdontogramaAnotacao>
) {
  writeList(
    keys.odontograma,
    getOdontograma().map((anotacao) =>
      sameId(anotacao.id, id)
        ? { ...anotacao, ...dados, atualizadoEm: new Date().toISOString() }
        : anotacao
    )
  );
}

export function deleteOdontogramaAnotacao(id: StoreId) {
  writeList(
    keys.odontograma,
    getOdontograma().filter((anotacao) => !sameId(anotacao.id, id))
  );
}

export function getOHFAvaliacoes() {
  return readList<CliniplusOHFAvaliacao>(keys.ohf, []);
}

export function getOHFByPacienteId(pacienteId: StoreId) {
  return getOHFAvaliacoes()
    .filter((avaliacao) => sameId(avaliacao.pacienteId, pacienteId))
    .sort((a, b) => {
      const dataA = `${a.data || ""}T${a.hora || "00:00"}-${
        a.atualizadoEm || a.criadoEm || ""
      }`;
      const dataB = `${b.data || ""}T${b.hora || "00:00"}-${
        b.atualizadoEm || b.criadoEm || ""
      }`;

      return dataB.localeCompare(dataA);
    });
}

export function addOHFAvaliacao(avaliacao: Partial<CliniplusOHFAvaliacao>) {
  const agora = new Date();
  const novaAvaliacao: CliniplusOHFAvaliacao = {
    id: avaliacao.id ?? createId(),
    pacienteId: avaliacao.pacienteId ?? "",
    data: avaliacao.data || dataIsoLocal(agora),
    hora:
      avaliacao.hora ||
      agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    profissional: avaliacao.profissional || nomeExibicaoProfissional(),
    doencasSistemicas: avaliacao.doencasSistemicas || "",
    alergias: avaliacao.alergias || "",
    medicamentosUso: avaliacao.medicamentosUso || "",
    historicoCirurgias: avaliacao.historicoCirurgias || "",
    internacoesPrevias: avaliacao.internacoesPrevias || "",
    transfusoes: avaliacao.transfusoes || "",
    doencasTransmissiveis: avaliacao.doencasTransmissiveis || "",
    observacoesMedicas: avaliacao.observacoesMedicas || "",
    ultimaConsultaOdontologica: avaliacao.ultimaConsultaOdontologica || "",
    motivoUltimaConsulta: avaliacao.motivoUltimaConsulta || "",
    tratamentosPrevios: avaliacao.tratamentosPrevios || "",
    cirurgiasOrais: avaliacao.cirurgiasOrais || "",
    reacoesAnestesicos: avaliacao.reacoesAnestesicos || "",
    sensibilidadeMateriais: avaliacao.sensibilidadeMateriais || "",
    habitosParafuncionais: avaliacao.habitosParafuncionais || "",
    observacoesOdontologicas: avaliacao.observacoesOdontologicas || "",
    estadoEmocional: avaliacao.estadoEmocional || "",
    nivelColaboracao: avaliacao.nivelColaboracao || "",
    compreensaoOrientacoes: avaliacao.compreensaoOrientacoes || "",
    suporteFamiliar: avaliacao.suporteFamiliar || "",
    condicoesHigieneOral: avaliacao.condicoesHigieneOral || "",
    riscoAsa: avaliacao.riscoAsa || "",
    riscoSangramento: avaliacao.riscoSangramento || "",
    consideracoesEspeciais: avaliacao.consideracoesEspeciais || "",
    condutasCuidados: avaliacao.condutasCuidados || "",
    status: avaliacao.status || "rascunho",
    criadoEm: avaliacao.criadoEm || agora.toISOString(),
    atualizadoEm: avaliacao.atualizadoEm,
  };

  writeList(keys.ohf, [...getOHFAvaliacoes(), novaAvaliacao]);
  return novaAvaliacao;
}

export function updateOHFAvaliacao(
  id: StoreId,
  dados: Partial<CliniplusOHFAvaliacao>
) {
  writeList(
    keys.ohf,
    getOHFAvaliacoes().map((avaliacao) =>
      sameId(avaliacao.id, id)
        ? { ...avaliacao, ...dados, atualizadoEm: new Date().toISOString() }
        : avaliacao
    )
  );
}

export function deleteOHFAvaliacao(id: StoreId) {
  writeList(
    keys.ohf,
    getOHFAvaliacoes().filter((avaliacao) => !sameId(avaliacao.id, id))
  );
}

export function getHistoricoPaciente(pacienteId: StoreId) {
  const agendamentos = getAgendamentosByPacienteId(pacienteId).map((item) => ({
    id: `agenda-${item.id}`,
    data: item.data,
    titulo: `Agendamento: ${item.procedimento}`,
    descricao: `${item.hora} - ${item.status}`,
  }));
  const prontuario = getProntuarioByPacienteId(pacienteId);
  const prontuarios = prontuario
    ? [
        {
          id: `prontuario-${pacienteId}`,
          data: prontuario.atualizadoEm,
          titulo: "Prontuario salvo",
          descricao: "Registro clinico atualizado.",
        },
      ]
    : [];
  const tratamentos = getTratamentosByPacienteId(pacienteId).map((item) => ({
    id: `tratamento-${item.id}`,
    data: item.data,
    titulo: `Tratamento: ${item.descricao}`,
    descricao: `${item.status}${item.valor ? ` - ${item.valor}` : ""}`,
  }));
  const financeiro = getFinanceiroByPacienteId(pacienteId).map((item) => ({
    id: `financeiro-${item.id}`,
    data: item.data,
    titulo: `Financeiro: ${item.descricao}`,
    descricao: `${item.tipo} - ${item.status} - ${item.valor}`,
  }));
  const documentos = getDocumentosByPacienteId(pacienteId).flatMap((item) => {
    const descricao = [item.categoria, item.tipo || item.formato]
      .filter(Boolean)
      .join(" - ");
    const eventos = [
      {
        id: `documento-${item.id}`,
        data: item.dataEnvio || item.data,
        tipo: "documento",
        titulo: `Documento enviado: ${item.nome}`,
        descricao,
        profissional: item.enviadoPor,
      },
    ];

    if (item.atualizadoEm) {
      eventos.push({
        id: `documento-atualizado-${item.id}`,
        data: item.atualizadoEm,
        tipo: "documento",
        titulo: `Documento atualizado: ${item.nome}`,
        descricao,
        profissional: item.enviadoPor,
      });
    }

    if (item.status === "arquivado") {
      eventos.push({
        id: `documento-arquivado-${item.id}`,
        data: item.atualizadoEm || item.dataEnvio || item.data,
        tipo: "documento",
        titulo: `Documento arquivado: ${item.nome}`,
        descricao,
        profissional: item.enviadoPor,
      });
    }

    return eventos;
  });
  const evolucoes = getEvolucoesByPacienteId(pacienteId).map((item) => ({
    id: `evolucao-${item.id}`,
    data: item.data,
    titulo: `Evolução: ${item.titulo}`,
    descricao: `${item.hora} - ${item.tipo} - ${
      item.status === "assinada" ? "Assinada" : "Rascunho"
    }`,
  }));

  const procedimentos = getProcedimentosByPacienteId(pacienteId).flatMap((item) => {
    const descricao = [item.dente || item.faceRegiao, item.status, item.observacoes]
      .filter(Boolean)
      .join(" - ");
    const eventos = [
      {
        id: `procedimento-criado-${item.id}`,
        data: item.criadoEm || item.data,
        tipo: "procedimento",
        titulo: item.procedimento,
        descricao,
        profissional: item.profissional,
      },
    ];

    if (item.status === "concluido") {
      eventos.push({
        id: `procedimento-concluido-${item.id}`,
        data: item.atualizadoEm || item.data,
        tipo: "procedimento",
        titulo: `Procedimento concluido: ${item.procedimento}`,
        descricao,
        profissional: item.profissional,
      });
    }

    if (item.status === "assinado" || item.assinadoEm) {
      eventos.push({
        id: `procedimento-assinado-${item.id}`,
        data: item.assinadoEm || item.atualizadoEm || item.data,
        tipo: "procedimento",
        titulo: `Procedimento assinado: ${item.procedimento}`,
        descricao,
        profissional: item.profissional,
      });
    }

    return eventos;
  });

  const exames = getExamesByPacienteId(pacienteId).flatMap((item) => {
    const descricao = [item.dente || item.regiao, item.status, item.observacoes]
      .filter(Boolean)
      .join(" - ");
    const eventos = [
      {
        id: `exame-solicitado-${item.id}`,
        data: item.criadoEm || item.data,
        tipo: "exame",
        titulo: item.exame,
        descricao,
        profissional: item.profissional,
      },
    ];

    if (item.arquivoNome) {
      eventos.push({
        id: `exame-anexado-${item.id}`,
        data: item.atualizadoEm || item.data,
        tipo: "exame",
        titulo: `Exame anexado: ${item.exame}`,
        descricao: item.arquivoNome,
        profissional: item.profissional,
      });
    }

    if (item.status === "concluido") {
      eventos.push({
        id: `exame-concluido-${item.id}`,
        data: item.atualizadoEm || item.data,
        tipo: "exame",
        titulo: `Exame concluido: ${item.exame}`,
        descricao,
        profissional: item.profissional,
      });
    }

    if (item.status === "assinado" || item.assinadoEm) {
      eventos.push({
        id: `exame-assinado-${item.id}`,
        data: item.assinadoEm || item.atualizadoEm || item.data,
        tipo: "exame",
        titulo: `Laudo assinado: ${item.exame}`,
        descricao,
        profissional: item.profissional,
      });
    }

    return eventos;
  });

  const odontograma = getOdontogramaByPacienteId(pacienteId).map((item) => ({
    id: `odontograma-${item.id}`,
    data: item.data,
    tipo: "odontograma",
    titulo: `Anotação no dente ${item.dente}`,
    descricao: [item.condicao, item.observacao].filter(Boolean).join(" - "),
  }));

  const ohf = getOHFByPacienteId(pacienteId).map((item) => ({
    id: `ohf-${item.id}`,
    data: item.data,
    tipo: "ohf",
    titulo: "Avaliacao OHF",
    descricao: [
      item.status === "finalizada" ? "Finalizada" : "Rascunho",
      item.riscoAsa ? `ASA ${item.riscoAsa}` : "",
      item.riscoSangramento ? `Risco de sangramento: ${item.riscoSangramento}` : "",
      item.condutasCuidados,
    ]
      .filter(Boolean)
      .join(" - "),
    profissional: item.profissional,
  }));
  const planosTratamento = getPlanosTratamentoByPacienteId(pacienteId).flatMap(
    (plano) => {
      const eventos = [
        {
          id: `plano-${plano.id}`,
          data: plano.dataCriacao || plano.criadoEm,
          tipo: "plano",
          titulo: "Plano de tratamento criado",
          descricao: `${plano.titulo} - ${plano.status}`,
          profissional: plano.profissional,
        },
        ...plano.itens.map((item) => ({
          id: `plano-item-${plano.id}-${item.id}`,
          data: item.criadoEm || item.previsao || plano.dataCriacao,
          tipo: "plano",
          titulo:
            item.status === "concluido"
              ? `Item concluido: ${item.procedimento}`
              : `Item adicionado: ${item.procedimento}`,
          descricao: [item.fase, item.dente, item.status]
            .filter(Boolean)
            .join(" - "),
          profissional: item.profissional,
        })),
      ];

      if (plano.status === "aprovado") {
        eventos.push({
          id: `plano-aprovado-${plano.id}`,
          data: plano.aprovadoEm || plano.atualizadoEm || plano.dataCriacao,
          tipo: "plano",
          titulo: "Plano de tratamento aprovado",
          descricao: plano.titulo,
          profissional: plano.profissional,
        });
      }

      return eventos;
    }
  );
  const orcamentos = getOrcamentosByPacienteId(pacienteId).flatMap((orcamento) => {
    const eventos = [
      {
        id: `orcamento-criado-${orcamento.id}`,
        data: orcamento.criadoEm,
        tipo: "orcamento",
        titulo: "Orcamento criado",
        descricao: `${orcamento.numero} - ${orcamento.status}`,
      },
    ];

    if (orcamento.status === "rascunho") {
      eventos.push({
        id: `orcamento-rascunho-${orcamento.id}`,
        data: orcamento.atualizadoEm || orcamento.criadoEm,
        tipo: "orcamento",
        titulo: "Orcamento salvo como rascunho",
        descricao: `${orcamento.numero} - ${orcamento.total}`,
      });
    }

    if (orcamento.status === "enviado") {
      eventos.push({
        id: `orcamento-enviado-${orcamento.id}`,
        data: orcamento.atualizadoEm || orcamento.criadoEm,
        tipo: "orcamento",
        titulo: "Orcamento enviado",
        descricao: `${orcamento.numero} enviado ao paciente`,
      });
    }

    if (orcamento.status === "aprovado") {
      eventos.push(
        {
          id: `orcamento-aprovado-${orcamento.id}`,
          data: orcamento.atualizadoEm || orcamento.criadoEm,
          tipo: "orcamento",
          titulo: "Orcamento aprovado",
          descricao: `${orcamento.numero} - cobranca autorizada`,
        },
        {
          id: `orcamento-cobranca-${orcamento.id}`,
          data: orcamento.atualizadoEm || orcamento.criadoEm,
          tipo: "financeiro",
          titulo: "Cobranca criada/preparada",
          descricao: `Cobranca gerada a partir do ${orcamento.numero}`,
        }
      );
    }

    return eventos;
  });

  return [
    ...agendamentos,
    ...prontuarios,
    ...tratamentos,
    ...financeiro,
    ...documentos,
    ...evolucoes,
    ...procedimentos,
    ...exames,
    ...odontograma,
    ...ohf,
    ...planosTratamento,
    ...orcamentos,
  ];
}

export function getSessaoPlano() {
  return readValue<SessaoPlano | null>(keys.sessaoPlano, null);
}

export function setSessaoPlano(sessao: SessaoPlano) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(keys.sessaoPlano, JSON.stringify(sessao));
  emitStoreChange();
}

export type PerfilUsuario = {
  nome: string;
  tratamento: string;
  email: string;
  telefone: string;
  cro: string;
  especialidade: string;
};

const perfilKey = "cliniplus-perfil";

export const perfilPadrao: PerfilUsuario = {
  nome: "Rafael Oliveira",
  tratamento: "Dr.",
  email: "rafael@cliniplus.demo",
  telefone: "(85) 99999-0000",
  cro: "CRO-CE 12345",
  especialidade: "Clinica geral",
};

export function getPerfil(): PerfilUsuario {
  return { ...perfilPadrao, ...readValue<Partial<PerfilUsuario>>(perfilKey, {}) };
}

export function savePerfil(perfil: PerfilUsuario) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(perfilKey, JSON.stringify(perfil));
  emitStoreChange();
}

export function nomeExibicaoProfissional(perfil: PerfilUsuario = getPerfil()) {
  return [perfil.tratamento, perfil.nome].filter(Boolean).join(" ");
}

export type StatusProcedimentoHof = "Planejado" | "Realizado" | "Retorno" | "Cancelado";

export type CliniplusProcedimentoHof = {
  id: StoreId;
  pacienteId: StoreId;
  data: string;
  procedimento: string;
  regiao: string;
  produto: string;
  lote: string;
  validade: string;
  quantidade: string;
  valor: string;
  status: StatusProcedimentoHof;
  retorno: string;
  observacoes: string;
  profissional: string;
  criadoEm: string;
};

export function getProcedimentosHof(pacienteId?: StoreId) {
  const lista = readList<CliniplusProcedimentoHof>(keys.hof, demoProcedimentosHof());
  return pacienteId === undefined ? lista : lista.filter((item) => sameId(item.pacienteId, pacienteId));
}

export function addProcedimentoHof(dados: Partial<CliniplusProcedimentoHof> & { pacienteId: StoreId }) {
  const novo: CliniplusProcedimentoHof = {
    id: createId(),
    pacienteId: dados.pacienteId,
    data: dados.data || hojeIso(),
    procedimento: dados.procedimento || "Procedimento HOF",
    regiao: dados.regiao || "",
    produto: dados.produto || "",
    lote: dados.lote || "",
    validade: dados.validade || "",
    quantidade: dados.quantidade || "",
    valor: dados.valor || "",
    status: dados.status || "Planejado",
    retorno: dados.retorno || "",
    observacoes: dados.observacoes || "",
    profissional: dados.profissional || nomeExibicaoProfissional(),
    criadoEm: new Date().toISOString(),
  };
  writeList(keys.hof, [...readList<CliniplusProcedimentoHof>(keys.hof, []), novo]);
  return novo;
}

export function updateProcedimentoHof(id: StoreId, dados: Partial<CliniplusProcedimentoHof>) {
  writeList(
    keys.hof,
    readList<CliniplusProcedimentoHof>(keys.hof, []).map((item) => (sameId(item.id, id) ? { ...item, ...dados } : item))
  );
}

export function deleteProcedimentoHof(id: StoreId) {
  writeList(
    keys.hof,
    readList<CliniplusProcedimentoHof>(keys.hof, []).filter((item) => !sameId(item.id, id))
  );
}

export type ConfigClinica = {
  nomeClinica: string;
  documento: string;
  telefone: string;
  email: string;
  endereco: string;
  areaAtuacao: string;
  horaAbertura: string;
  horaFechamento: string;
  duracaoConsulta: string;
};

const configClinicaKey = "configuracoes-cliniplus";

export const configClinicaPadrao: ConfigClinica = {
  nomeClinica: "Clini+ Odontologia",
  documento: "",
  telefone: "",
  email: "",
  endereco: "",
  areaAtuacao: "Odontologia e HOF",
  horaAbertura: "07:00",
  horaFechamento: "19:00",
  duracaoConsulta: "30 min",
};

export function getConfigClinica(): ConfigClinica {
  return { ...configClinicaPadrao, ...readValue<Partial<ConfigClinica>>(configClinicaKey, {}) };
}

export function saveConfigClinica(config: ConfigClinica) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(configClinicaKey, JSON.stringify(config));
  emitStoreChange();
}

export function horariosDeAtendimento(config: ConfigClinica = getConfigClinica()) {
  const inicio = Number(config.horaAbertura.slice(0, 2)) || 7;
  const fim = Number(config.horaFechamento.slice(0, 2)) || 19;
  const horas: string[] = [];
  for (let hora = inicio; hora <= Math.max(inicio, fim); hora += 1) {
    horas.push(`${String(hora).padStart(2, "0")}:00`);
  }
  return horas;
}
