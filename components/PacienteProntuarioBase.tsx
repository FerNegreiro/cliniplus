"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Archive,
  Bell,
  Bone,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  HeartPulse,
  History,
  Info,
  Lock,
  MoreHorizontal,
  Paperclip,
  Pill,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Send,
  Smile,
  SmilePlus,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  addDocumento,
  addEvolucao,
  addExame,
  addOdontogramaAnotacao,
  addOHFAvaliacao,
  addPlanoTratamento,
  addProcedimento,
  type CliniplusAgendamento,
  type CliniplusDocumento,
  type CliniplusEvolucao,
  type CliniplusExame,
  type CliniplusExameOrigem,
  type CliniplusExameStatus,
  type CliniplusOdontogramaAnotacao,
  type CliniplusOHFAvaliacao,
  type CliniplusPaciente,
  type CliniplusPlanoTratamento,
  type CliniplusProcedimento,
  type CliniplusProcedimentoStatus,
  type CliniplusProntuario,
  type CliniplusTratamento,
  deleteDocumento,
  deleteEvolucao,
  deleteExame,
  deleteOdontogramaAnotacao,
  deleteOHFAvaliacao,
  deleteProcedimento,
  getAgendamentosByPacienteId,
  getDocumentosByPacienteId,
  getEvolucoesByPacienteId,
  getExamesByPacienteId,
  getHistoricoPaciente,
  getOdontogramaByPacienteId,
  getOHFByPacienteId,
  getPacienteById,
  getPlanosTratamentoByPacienteId,
  getProcedimentosByPacienteId,
  getProntuarioByPacienteId,
  getSessaoPlano,
  getTratamentosByPacienteId,
  nomeExibicaoProfissional,
  type PlanoTratamentoItem,
  saveProntuario,
  type SessaoPlano,
  updateDocumento,
  updateEvolucao,
  updateExame,
  updateOdontogramaAnotacao,
  updateOHFAvaliacao,
  updatePlanoTratamento,
  updateProcedimento,
} from "@/utils/cliniplusStore";
import { OdontogramaTooth } from "@/components/OdontogramaTooth";
import PacientePlanoOrcamento from "@/components/PacientePlanoOrcamento";
import PacientePlanoImpressao from "@/components/PacientePlanoImpressao";
import { hojeIso, dataIsoLocal } from "@/utils/datas";
import ArquivoImagem from "@/components/ArquivoImagem";
import {
  TAMANHO_MAXIMO,
  baixarPorUrl,
  idDaReferencia,
  referenciaArquivo,
  salvarArquivo,
} from "@/utils/arquivos";

type PacienteProntuarioBaseProps = {
  pacienteId: number;
  pacienteNome: string;
  telefone: string;
  email: string;
  convenio: string;
  ultimo: string;
};

type ResumoDados = {
  queixaPrincipal: string;
  historicoMedico: string;
  alergias: string;
  medicamentosUso: string;
  diagnosticos: string;
  observacoesImportantes: string;
};

type AnamneseDados = {
  identificacaoQueixaPrincipal: string;
  historiaDoencaAtual: string;
  historicoMedico: string;
  historicoOdontologico: string;
  alergias: string;
  medicamentosUso: string;
  habitosVicios: string;
  antecedentesFamiliares: string;
  observacoesComplementares: string;
};

type ProntuarioDados = Partial<ResumoDados> & {
  historiaClinica?: string;
  observacoes?: string;
  conduta?: string;
  prescricaoOrientacao?: string;
  resumo?: Partial<ResumoDados>;
  anamnese?: Partial<AnamneseDados>;
};

const resumoVazio: ResumoDados = {
  queixaPrincipal: "",
  historicoMedico: "",
  alergias: "",
  medicamentosUso: "",
  diagnosticos: "",
  observacoesImportantes: "",
};

const anamneseVazia: AnamneseDados = {
  identificacaoQueixaPrincipal: "",
  historiaDoencaAtual: "",
  historicoMedico: "",
  historicoOdontologico: "",
  alergias: "",
  medicamentosUso: "",
  habitosVicios: "",
  antecedentesFamiliares: "",
  observacoesComplementares: "",
};

const secoes = [
  { key: "resumo", label: "Resumo", icon: ClipboardList },
  { key: "anamnese", label: "Anamnese", icon: FileText },
  { key: "evolucoes", label: "Evolucoes", icon: History },
  { key: "odontograma", label: "Odontograma", icon: Smile },
  { key: "ohf", label: "OHF", icon: SmilePlus },
  { key: "plano", label: "Plano de tratamento", icon: ClipboardList },
  { key: "procedimentos", label: "Procedimentos", icon: Bone },
  { key: "exames", label: "Exames", icon: FileText },
  { key: "documentos", label: "Documentos", icon: Send },
];

const chavesSecoes = secoes.map((secao) => secao.key);

type EvolucaoDraft = {
  id: string;
  data: string;
  hora: string;
  profissional: string;
  tipo: string;
  area: string;
  dentes: string;
  titulo: string;
  texto: string;
  tags: string;
  status: "rascunho" | "assinada";
};

type OdontogramaDraft = {
  id: string;
  dente: string;
  face: string;
  condicao: string;
  status: string;
  profissional: string;
  observacao: string;
};

type OHFDraft = Omit<
  CliniplusOHFAvaliacao,
  "pacienteId" | "criadoEm" | "atualizadoEm"
>;

type PlanoItemDraft = {
  id: string;
  fase: string;
  procedimento: string;
  dente: string;
  prioridade: PlanoTratamentoItem["prioridade"];
  status: PlanoTratamentoItem["status"];
  profissional: string;
  valor: string;
  previsao: string;
  observacoes: string;
};

type ProcedimentoDraft = {
  id: string;
  data: string;
  hora: string;
  procedimento: string;
  dente: string;
  faceRegiao: string;
  categoria: string;
  profissional: string;
  status: CliniplusProcedimentoStatus;
  duracao: string;
  valor: string;
  diagnosticoIndicacao: string;
  materiaisUtilizados: string;
  anestesia: string;
  observacoes: string;
  conduta: string;
};

type ExameDraft = {
  id: string;
  data: string;
  hora: string;
  exame: string;
  dente: string;
  regiao: string;
  categoria: string;
  profissional: string;
  status: CliniplusExameStatus;
  origem: CliniplusExameOrigem;
  arquivoNome: string;
  arquivoTipo: string;
  arquivoTamanho: string;
  arquivoObservacao: string;
  arquivoAnexadoEm: string;
  arquivoUrl: string;
  achados: string;
  observacoes: string;
  laudo: string;
};

type ArquivoExameDraft = {
  exameId: string;
  arquivoNome: string;
  arquivoTipo: string;
  arquivoTamanho: string;
  arquivoObservacao: string;
  arquivoUrl: string;
};

type DocumentoDraft = {
  id: string;
  nome: string;
  categoria: string;
  tipo: string;
  extensao: string;
  tamanho: string;
  enviadoPor: string;
  dataEnvio: string;
  horaEnvio: string;
  observacoes: string;
  status: string;
  urlSimulada: string;
  arquivoId: string;
};

const tiposEvolucao = [
  "Consulta",
  "Retorno",
  "Procedimento",
  "Intercorrência",
  "Orientação",
  "Observação clínica",
  "Outro",
];

const tagsSugeridas = [
  "Dor",
  "Retorno",
  "Procedimento",
  "Urgência",
  "Orientação",
  "Acompanhamento",
];

const dentesSuperiores = [
  "18",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
];

const dentesInferiores = [
  "48",
  "47",
  "46",
  "45",
  "44",
  "43",
  "42",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
];

const facesOdontograma = [
  "Oclusal",
  "Mesial",
  "Distal",
  "Vestibular",
  "Lingual/Palatina",
  "Raiz",
  "Geral",
];

const statusOdontograma = [
  "Planejado",
  "Em andamento",
  "Executado",
  "Observação",
];

const condicoesOdontograma = [
  {
    label: "Hígido",
    dot: "bg-emerald-300",
    tooth: "border-emerald-200 bg-emerald-50 text-emerald-800",
    fill: "#f8fafc",
    stroke: "#94a3b8",
    accent: "#86efac",
    mark: "dot",
  },
  {
    label: "Cárie",
    dot: "bg-red-500",
    tooth: "border-red-200 bg-red-50 text-red-700",
    fill: "#fff1f2",
    stroke: "#ef4444",
    accent: "#dc2626",
    mark: "carie",
  },
  {
    label: "Restauração",
    dot: "bg-blue-500",
    tooth: "border-blue-200 bg-blue-50 text-blue-700",
    fill: "#eff6ff",
    stroke: "#3b82f6",
    accent: "#2563eb",
    mark: "fill",
  },
  {
    label: "Tratamento de canal",
    dot: "bg-amber-500",
    tooth: "border-amber-200 bg-amber-50 text-amber-700",
    fill: "#fff7ed",
    stroke: "#f59e0b",
    accent: "#d97706",
    mark: "canal",
  },
  {
    label: "Extração indicada",
    dot: "bg-violet-600",
    tooth: "border-violet-200 bg-violet-50 text-violet-700",
    fill: "#f5f3ff",
    stroke: "#6d28d9",
    accent: "#6d28d9",
    mark: "x",
  },
  {
    label: "Extraído",
    dot: "bg-slate-600",
    tooth: "border-slate-300 bg-slate-100 text-slate-700",
    fill: "#e2e8f0",
    stroke: "#475569",
    accent: "#334155",
    mark: "absent",
  },
  {
    label: "Implante",
    dot: "bg-emerald-600",
    tooth: "border-emerald-300 bg-emerald-100 text-emerald-800",
    fill: "#ecfdf5",
    stroke: "#10b981",
    accent: "#059669",
    mark: "implant",
  },
  {
    label: "Prótese",
    dot: "bg-cyan-500",
    tooth: "border-cyan-200 bg-cyan-50 text-cyan-700",
    fill: "#ecfeff",
    stroke: "#06b6d4",
    accent: "#0891b2",
    mark: "crown",
  },
  {
    label: "Ausente",
    dot: "bg-slate-500",
    tooth: "border-slate-300 bg-slate-200 text-slate-700",
    fill: "#cbd5e1",
    stroke: "#475569",
    accent: "#334155",
    mark: "absent",
  },
  {
    label: "Observação",
    dot: "bg-amber-400",
    tooth: "border-amber-200 bg-amber-50 text-amber-700",
    fill: "#fffbeb",
    stroke: "#f59e0b",
    accent: "#d97706",
    mark: "note",
  },
];

const fasesPlanoTratamento = [
  { id: "1. Diagnostico", label: "1. Diagnostico", icon: ClipboardList },
  { id: "2. Adequacao do meio bucal", label: "2. Adequacao do meio bucal", icon: Smile },
  { id: "3. Reabilitacao", label: "3. Reabilitacao", icon: Bone },
  { id: "4. Estetica", label: "4. Estetica", icon: Sparkles },
  { id: "5. Manutencao", label: "5. Manutencao", icon: CheckCircle2 },
];

const prioridadesPlano = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
] as const;

const statusItensPlano = [
  { value: "planejado", label: "Planejado" },
  { value: "aguardando", label: "Aguardando" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluido" },
  { value: "cancelado", label: "Cancelado" },
] as const;

const formasPagamentoPlano = [
  "Cartao de credito",
  "Pix",
  "Transferencia bancaria",
  "Dinheiro",
  "Parcelamento",
];

const categoriasProcedimento = [
  "Preventiva",
  "Restauradora",
  "Endodontica",
  "Cirurgica",
  "Diagnostica",
  "Estetica",
  "Protetica",
  "Periodontal",
  "Ortodontica",
  "Outra",
];

const statusProcedimentoOptions: Array<{
  value: CliniplusProcedimentoStatus;
  label: string;
}> = [
  { value: "planejado", label: "Planejado" },
  { value: "agendado", label: "Agendado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluido" },
  { value: "aguardando", label: "Aguardando" },
  { value: "pendente", label: "Pendente" },
  { value: "assinado", label: "Assinado" },
  { value: "cancelado", label: "Cancelado" },
];

const categoriasExame = [
  "Radiografia",
  "Imagem 3D",
  "Fotografia",
  "Clínico",
  "Laboratorial",
  "Digital",
  "Outro",
];

const statusExameOptions: Array<{
  value: CliniplusExameStatus;
  label: string;
}> = [
  { value: "solicitado", label: "Solicitado" },
  { value: "pendente", label: "Pendente" },
  { value: "realizado", label: "Realizado" },
  { value: "concluido", label: "Concluído" },
  { value: "alterado", label: "Alterado" },
  { value: "revisao", label: "Revisão" },
  { value: "assinado", label: "Assinado" },
  { value: "cancelado", label: "Cancelado" },
];

const origemExameOptions: Array<{
  value: CliniplusExameOrigem;
  label: string;
}> = [
  { value: "clinica", label: "Clínica" },
  { value: "parceiro", label: "Parceiro" },
  { value: "paciente", label: "Paciente" },
  { value: "externo", label: "Externo" },
];

const tiposDocumento = [
  { value: "documento", label: "Documento" },
  { value: "pdf", label: "PDF" },
  { value: "imagem", label: "Imagem" },
  { value: "planilha", label: "Planilha" },
  { value: "outro", label: "Outro" },
];

const categoriasDocumento = [
  "Consentimentos",
  "Financeiro",
  "Exames de imagem",
  "Laudos",
  "Documentos pessoais",
  "Tratamento",
  "Anamnese",
  "Outros",
];

const statusDocumentoOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "arquivado", label: "Arquivado" },
  { value: "pendente", label: "Pendente" },
  { value: "assinado", label: "Assinado" },
];

function subscribeStore(onStoreChange: () => void) {
  window.addEventListener("cliniplus:store", onStoreChange);
  window.addEventListener("cliniplus:paciente-ficha", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("cliniplus:store", onStoreChange);
    window.removeEventListener("cliniplus:paciente-ficha", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function asText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = asText(value);

    if (text) {
      return text;
    }
  }

  return "";
}

function splitList(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueList(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = value.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function formatDate(value?: string) {
  if (!value) {
    return "Nao informado";
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }

  return value;
}

function formatTime(value?: string) {
  if (!value) {
    return "";
  }

  const time = value.includes("T") ? value.slice(11, 16) : "";

  return /^\d{2}:\d{2}$/.test(time) ? time : "";
}

function getAge(value?: string) {
  if (!value) {
    return "";
  }

  const parts = value.includes("/")
    ? value.split("/").reverse()
    : value.slice(0, 10).split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hadBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  if (!hadBirthday) {
    age -= 1;
  }

  return age > 0 ? `${age} anos` : "";
}

function getDateTimeValue(item: CliniplusAgendamento) {
  return new Date(`${item.data}T${item.hora || item.horario || "00:00"}`);
}

function getNowTime() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createEmptyEvolucaoDraft(): EvolucaoDraft {
  return {
    id: "",
    data: hojeIso(),
    hora: getNowTime(),
    profissional: nomeExibicaoProfissional(),
    tipo: "Consulta",
    area: "Odontologia",
    dentes: "",
    titulo: "",
    texto: "",
    tags: "",
    status: "rascunho",
  };
}

function evolucaoToDraft(evolucao: CliniplusEvolucao): EvolucaoDraft {
  return {
    id: String(evolucao.id),
    data: evolucao.data,
    hora: evolucao.hora,
    profissional: evolucao.profissional,
    tipo: evolucao.tipo,
    area: evolucao.area,
    dentes: evolucao.dentes || "",
    titulo: evolucao.titulo,
    texto: evolucao.texto,
    tags: evolucao.tags?.join(", ") || "",
    status: evolucao.status,
  };
}

function draftToEvolucao(
  draft: EvolucaoDraft,
  pacienteId: number,
  status: "rascunho" | "assinada"
) {
  return {
    pacienteId,
    data: draft.data,
    hora: draft.hora,
    profissional: draft.profissional,
    tipo: draft.tipo,
    area: draft.area,
    dentes: draft.dentes,
    titulo: draft.titulo.trim() || "Evolução clínica",
    texto: draft.texto,
    tags: splitList(draft.tags),
    status,
    atualizadoEm: new Date().toISOString(),
  };
}

function createOdontogramaDraft(dente = "16"): OdontogramaDraft {
  return {
    id: "",
    dente,
    face: "Geral",
    condicao: "Hígido",
    status: "Observação",
    profissional: nomeExibicaoProfissional(),
    observacao: "",
  };
}

function odontogramaToDraft(
  anotacao: CliniplusOdontogramaAnotacao
): OdontogramaDraft {
  return {
    id: String(anotacao.id),
    dente: anotacao.dente,
    face: anotacao.face || "Geral",
    condicao: anotacao.condicao,
    status: anotacao.status,
    profissional: anotacao.profissional,
    observacao: anotacao.observacao || "",
  };
}

function createOHFDraft(): OHFDraft {
  return {
    id: "",
    data: hojeIso(),
    hora: getNowTime(),
    profissional: nomeExibicaoProfissional(),
    doencasSistemicas: "",
    alergias: "",
    medicamentosUso: "",
    historicoCirurgias: "",
    internacoesPrevias: "",
    transfusoes: "",
    doencasTransmissiveis: "",
    observacoesMedicas: "",
    ultimaConsultaOdontologica: "",
    motivoUltimaConsulta: "",
    tratamentosPrevios: "",
    cirurgiasOrais: "",
    reacoesAnestesicos: "",
    sensibilidadeMateriais: "",
    habitosParafuncionais: "",
    observacoesOdontologicas: "",
    estadoEmocional: "",
    nivelColaboracao: "",
    compreensaoOrientacoes: "",
    suporteFamiliar: "",
    condicoesHigieneOral: "",
    riscoAsa: "",
    riscoSangramento: "",
    consideracoesEspeciais: "",
    condutasCuidados: "",
    status: "rascunho",
  };
}

function ohfToDraft(avaliacao: CliniplusOHFAvaliacao): OHFDraft {
  return {
    id: String(avaliacao.id),
    data: avaliacao.data,
    hora: avaliacao.hora,
    profissional: avaliacao.profissional,
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
    status: avaliacao.status,
  };
}

const ohfContentFields: Array<keyof OHFDraft> = [
  "doencasSistemicas",
  "alergias",
  "medicamentosUso",
  "historicoCirurgias",
  "internacoesPrevias",
  "transfusoes",
  "doencasTransmissiveis",
  "observacoesMedicas",
  "ultimaConsultaOdontologica",
  "motivoUltimaConsulta",
  "tratamentosPrevios",
  "cirurgiasOrais",
  "reacoesAnestesicos",
  "sensibilidadeMateriais",
  "habitosParafuncionais",
  "observacoesOdontologicas",
  "estadoEmocional",
  "nivelColaboracao",
  "compreensaoOrientacoes",
  "suporteFamiliar",
  "condicoesHigieneOral",
  "riscoAsa",
  "riscoSangramento",
  "consideracoesEspeciais",
  "condutasCuidados",
];

function hasOHFContent(draft: OHFDraft) {
  return ohfContentFields.some((field) => String(draft[field] || "").trim());
}

function resumoOHF(avaliacao?: CliniplusOHFAvaliacao) {
  if (!avaliacao) {
    return "Sem avaliacao OHF registrada.";
  }

  return (
    [
      avaliacao.doencasSistemicas,
      avaliacao.alergias ? `Alergias: ${avaliacao.alergias}` : "",
      avaliacao.riscoAsa ? `ASA ${avaliacao.riscoAsa}` : "",
      avaliacao.riscoSangramento
        ? `Sangramento: ${avaliacao.riscoSangramento}`
        : "",
      avaliacao.condutasCuidados,
    ]
      .filter(Boolean)
      .join(" - ") || "Avaliacao OHF sem resumo clinico."
  );
}

function parseMoney(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function createPlanoItemDraft(fase = fasesPlanoTratamento[0].id): PlanoItemDraft {
  return {
    id: "",
    fase,
    procedimento: "",
    dente: "",
    prioridade: "media",
    status: "planejado",
    profissional: nomeExibicaoProfissional(),
    valor: "",
    previsao: "",
    observacoes: "",
  };
}

function planoItemToDraft(item: PlanoTratamentoItem): PlanoItemDraft {
  return {
    id: item.id,
    fase: item.fase,
    procedimento: item.procedimento,
    dente: item.dente || "",
    prioridade: item.prioridade,
    status: item.status,
    profissional: item.profissional,
    valor: String(item.valor || ""),
    previsao: item.previsao || "",
    observacoes: item.observacoes || "",
  };
}

function draftToPlanoItem(draft: PlanoItemDraft): PlanoTratamentoItem {
  const agora = new Date().toISOString();

  return {
    id: draft.id || String(Date.now()),
    fase: draft.fase,
    procedimento: draft.procedimento.trim(),
    dente: draft.dente.trim(),
    prioridade: draft.prioridade,
    status: draft.status,
    profissional: draft.profissional.trim() || nomeExibicaoProfissional(),
    valor: parseMoney(draft.valor),
    previsao: draft.previsao,
    observacoes: draft.observacoes.trim(),
    criadoEm: draft.id ? undefined : agora,
    atualizadoEm: agora,
    concluidoEm: draft.status === "concluido" ? agora : undefined,
  };
}

function createProcedimentoDraft(): ProcedimentoDraft {
  const agora = new Date();

  return {
    id: "",
    data: dataIsoLocal(agora),
    hora: agora.toTimeString().slice(0, 5),
    procedimento: "",
    dente: "",
    faceRegiao: "",
    categoria: "Preventiva",
    profissional: nomeExibicaoProfissional(),
    status: "planejado",
    duracao: "",
    valor: "",
    diagnosticoIndicacao: "",
    materiaisUtilizados: "",
    anestesia: "",
    observacoes: "",
    conduta: "",
  };
}

function procedimentoToDraft(item: CliniplusProcedimento): ProcedimentoDraft {
  return {
    id: item.id,
    data: item.data || "",
    hora: item.hora || "",
    procedimento: item.procedimento || "",
    dente: item.dente || "",
    faceRegiao: item.faceRegiao || "",
    categoria: item.categoria || "Outra",
    profissional: item.profissional || nomeExibicaoProfissional(),
    status: item.status || "planejado",
    duracao: item.duracao || "",
    valor: item.valor ? String(item.valor) : "",
    diagnosticoIndicacao: item.diagnosticoIndicacao || "",
    materiaisUtilizados: item.materiaisUtilizados || "",
    anestesia: item.anestesia || "",
    observacoes: item.observacoes || "",
    conduta: item.conduta || "",
  };
}

function draftToProcedimento(
  draft: ProcedimentoDraft,
  pacienteId: number
): Partial<CliniplusProcedimento> &
  Pick<CliniplusProcedimento, "pacienteId" | "procedimento" | "categoria" | "profissional"> {
  const valor = draft.valor.trim() ? parseMoney(draft.valor) : undefined;

  return {
    pacienteId,
    data: draft.data,
    hora: draft.hora,
    procedimento: draft.procedimento.trim(),
    dente: draft.dente.trim(),
    faceRegiao: draft.faceRegiao.trim(),
    categoria: draft.categoria,
    profissional: draft.profissional.trim() || nomeExibicaoProfissional(),
    status: draft.status,
    duracao: draft.duracao.trim(),
    valor,
    diagnosticoIndicacao: draft.diagnosticoIndicacao.trim(),
    materiaisUtilizados: draft.materiaisUtilizados.trim(),
    anestesia: draft.anestesia.trim(),
    observacoes: draft.observacoes.trim(),
    conduta: draft.conduta.trim(),
  };
}

function statusProcedimentoLabel(status: CliniplusProcedimentoStatus) {
  return (
    statusProcedimentoOptions.find((item) => item.value === status)?.label ||
    "Planejado"
  );
}

function createExameDraft(): ExameDraft {
  const agora = new Date();

  return {
    id: "",
    data: dataIsoLocal(agora),
    hora: agora.toTimeString().slice(0, 5),
    exame: "",
    dente: "",
    regiao: "",
    categoria: "Radiografia",
    profissional: nomeExibicaoProfissional(),
    status: "solicitado",
    origem: "clinica",
    arquivoNome: "",
    arquivoTipo: "",
    arquivoTamanho: "",
    arquivoObservacao: "",
    arquivoAnexadoEm: "",
    arquivoUrl: "",
    achados: "",
    observacoes: "",
    laudo: "",
  };
}

function exameToDraft(item: CliniplusExame): ExameDraft {
  return {
    id: item.id,
    data: item.data || "",
    hora: item.hora || "",
    exame: item.exame || "",
    dente: item.dente || "",
    regiao: item.regiao || "",
    categoria: item.categoria || "Outro",
    profissional: item.profissional || nomeExibicaoProfissional(),
    status: item.status || "solicitado",
    origem: item.origem || "clinica",
    arquivoNome: item.arquivoNome || "",
    arquivoTipo: item.arquivoTipo || "",
    arquivoTamanho: item.arquivoTamanho || "",
    arquivoObservacao: item.arquivoObservacao || "",
    arquivoAnexadoEm: item.arquivoAnexadoEm || "",
    arquivoUrl: item.arquivoUrl || "",
    achados: item.achados || "",
    observacoes: item.observacoes || "",
    laudo: item.laudo || "",
  };
}

function draftToExame(
  draft: ExameDraft,
  pacienteId: number
): Partial<CliniplusExame> &
  Pick<CliniplusExame, "pacienteId" | "exame" | "categoria" | "profissional"> {
  return {
    pacienteId,
    data: draft.data,
    hora: draft.hora,
    exame: draft.exame.trim(),
    dente: draft.dente.trim(),
    regiao: draft.regiao.trim(),
    categoria: draft.categoria,
    profissional: draft.profissional.trim() || nomeExibicaoProfissional(),
    status: draft.status,
    origem: draft.origem,
    arquivoNome: draft.arquivoNome.trim(),
    arquivoTipo: draft.arquivoTipo.trim(),
    arquivoTamanho: draft.arquivoTamanho.trim(),
    arquivoObservacao: draft.arquivoObservacao.trim(),
    arquivoAnexadoEm: draft.arquivoNome.trim()
      ? draft.arquivoAnexadoEm || new Date().toISOString()
      : undefined,
    arquivoUrl: draft.arquivoUrl,
    achados: draft.achados.trim(),
    observacoes: draft.observacoes.trim(),
    laudo: draft.laudo.trim(),
  };
}

function statusExameLabel(status: CliniplusExameStatus) {
  return (
    statusExameOptions.find((item) => item.value === status)?.label ||
    "Solicitado"
  );
}

function origemExameLabel(origem: CliniplusExameOrigem) {
  return origemExameOptions.find((item) => item.value === origem)?.label || origem;
}

function createArquivoExameDraft(exame?: CliniplusExame): ArquivoExameDraft {
  return {
    exameId: exame?.id || "",
    arquivoNome: exame?.arquivoNome || "",
    arquivoTipo: exame?.arquivoTipo || "",
    arquivoTamanho: exame?.arquivoTamanho || "",
    arquivoObservacao: exame?.arquivoObservacao || "",
    arquivoUrl: exame?.arquivoUrl || "",
  };
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(exame: Pick<CliniplusExame, "arquivoTipo" | "arquivoUrl">) {
  return Boolean(
    exame.arquivoUrl?.startsWith("data:image/") ||
      exame.arquivoTipo?.toLowerCase().startsWith("image/")
  );
}

function isPdfFile(exame: Pick<CliniplusExame, "arquivoTipo" | "arquivoNome">) {
  const tipo = exame.arquivoTipo?.toLowerCase() || "";
  const nome = exame.arquivoNome?.toLowerCase() || "";

  return tipo.includes("pdf") || nome.endsWith(".pdf");
}

function normalizarTipoDocumento(tipo?: string, extensao?: string) {
  const value = `${tipo || ""} ${extensao || ""}`.toLowerCase();

  if (value.includes("pdf")) {
    return "pdf";
  }

  if (/(jpg|jpeg|png|imagem|image|foto)/.test(value)) {
    return "imagem";
  }

  if (/(xls|xlsx|csv|planilha|sheet)/.test(value)) {
    return "planilha";
  }

  if (/(doc|documento|termo|registro)/.test(value)) {
    return "documento";
  }

  return "outro";
}

function documentoTipoLabel(tipo?: string) {
  const normalized = normalizarTipoDocumento(tipo);

  return tiposDocumento.find((item) => item.value === normalized)?.label || "Outro";
}

function createDocumentoDraft(documento?: CliniplusDocumento): DocumentoDraft {
  const agora = new Date();
  const tipo = normalizarTipoDocumento(documento?.tipo, documento?.extensao || documento?.formato);

  return {
    id: documento?.id ? String(documento.id) : "",
    nome: documento?.nome || "",
    categoria: documento?.categoria || documento?.origem || "Outros",
    tipo,
    extensao: documento?.extensao || documento?.formato || "",
    tamanho: documento?.tamanho || "",
    enviadoPor: documento?.enviadoPor || nomeExibicaoProfissional(),
    dataEnvio: documento?.dataEnvio || documento?.data || dataIsoLocal(agora),
    horaEnvio: documento?.horaEnvio || agora.toTimeString().slice(0, 5),
    observacoes: documento?.observacoes || documento?.observacao || "",
    status: documento?.status?.toLowerCase() || "ativo",
    urlSimulada: documento?.urlSimulada || "",
    arquivoId: documento?.arquivoId || "",
  };
}

function getDocumentoDateValue(documento: CliniplusDocumento) {
  const data = documento.dataEnvio || documento.data || "";
  const normalized = data.includes("/")
    ? data.split("/").reverse().join("-")
    : data.slice(0, 10);
  const hora = documento.horaEnvio || "00:00";
  const value = new Date(`${normalized}T${hora}`).getTime();

  return Number.isNaN(value) ? 0 : value;
}

function draftToDocumento(
  draft: DocumentoDraft,
  pacienteId: number,
  pacienteNome: string
): Partial<CliniplusDocumento> {
  return {
    pacienteId,
    paciente: pacienteNome,
    nome: draft.nome.trim(),
    categoria: draft.categoria,
    tipo: draft.tipo,
    extensao: draft.extensao.trim(),
    formato: draft.extensao.trim(),
    tamanho: draft.tamanho.trim(),
    enviadoPor: draft.enviadoPor.trim() || nomeExibicaoProfissional(),
    data: draft.dataEnvio,
    dataEnvio: draft.dataEnvio,
    horaEnvio: draft.horaEnvio,
    observacao: draft.observacoes.trim(),
    observacoes: draft.observacoes.trim(),
    status: draft.status,
    origem: draft.categoria,
    urlSimulada: draft.urlSimulada,
    arquivoId: draft.arquivoId || undefined,
  };
}

function statusPlanoLabel(status?: CliniplusPlanoTratamento["status"]) {
  const labels = {
    rascunho: "Rascunho",
    em_andamento: "Em andamento",
    aprovado: "Aprovado",
    concluido: "Concluido",
    cancelado: "Cancelado",
  };

  return status ? labels[status] : "Sem plano";
}

function statusItemLabel(status: PlanoTratamentoItem["status"]) {
  return statusItensPlano.find((item) => item.value === status)?.label || status;
}

function prioridadeLabel(prioridade: PlanoTratamentoItem["prioridade"]) {
  return (
    prioridadesPlano.find((item) => item.value === prioridade)?.label ||
    prioridade
  );
}

function getCondicaoOdontograma(condicao?: string) {
  return (
    condicoesOdontograma.find((item) => item.label === condicao) ??
    condicoesOdontograma[0]
  );
}

function getPlanoFromParams(
  searchParams: { get(name: string): string | null },
  sessao: SessaoPlano | null
) {
  if (searchParams.get("modo") === "teste" || sessao?.modo === "teste") {
    return "starter";
  }

  return (searchParams.get("plano") || sessao?.plano || "starter").toLowerCase();
}

function EmptyState({ text = "Nenhum dado registrado ainda." }: { text?: string }) {
  return <p className="text-sm font-semibold text-slate-400">{text}</p>;
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="min-h-40 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-indigo-600">{icon}</span>
        <h3 className="font-black text-slate-950">{title}</h3>
      </div>
      <div className="mt-4 text-sm font-semibold leading-relaxed text-slate-700">
        {children}
      </div>
    </article>
  );
}

function AnamneseBlock({
  title,
  icon,
  value,
}: {
  title: string;
  icon: ReactNode;
  value: string;
}) {
  return (
    <article className="min-h-44 border-b border-r border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="text-indigo-600">{icon}</span>
        <h3 className="font-black text-slate-950">{title}</h3>
      </div>
      <div className="mt-4 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-700">
        {value ? value : <EmptyState />}
      </div>
    </article>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function DetailLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-black text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-800">
        {value && value.trim() ? value : "Nao informado"}
      </p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm font-black text-slate-950">{label}</p>
      <p className="mt-2 whitespace-pre-line rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm font-semibold leading-relaxed text-slate-600">
        {value && value.trim() ? value : "Nao informado"}
      </p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "primary"
          ? "h-11 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700"
          : "h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
      }
    >
      {children}
    </button>
  );
}

function joinPieces(values: Array<string | undefined>) {
  const visible = values.filter(Boolean);
  return visible.length ? visible.join(" - ") : "Nao informado";
}

function getPatientSnapshot(pacienteId: number, fallback: CliniplusPaciente) {
  const paciente = getPacienteById(pacienteId) as CliniplusPaciente | null;
  const prontuario = getProntuarioByPacienteId(pacienteId);

  return JSON.stringify({
    paciente: paciente ?? fallback,
    prontuario,
    agendamentos: getAgendamentosByPacienteId(pacienteId),
    tratamentos: getTratamentosByPacienteId(pacienteId),
    documentos: getDocumentosByPacienteId(pacienteId),
    exames: getExamesByPacienteId(pacienteId),
    evolucoes: getEvolucoesByPacienteId(pacienteId),
    procedimentos: getProcedimentosByPacienteId(pacienteId),
    odontograma: getOdontogramaByPacienteId(pacienteId),
    ohf: getOHFByPacienteId(pacienteId),
    planosTratamento: getPlanosTratamentoByPacienteId(pacienteId),
    historico: getHistoricoPaciente(pacienteId),
    sessaoPlano: getSessaoPlano(),
  });
}

function buildResumoValues(
  dados: ProntuarioDados,
  paciente: CliniplusPaciente
): ResumoDados {
  return {
    queixaPrincipal: firstText(
      dados.resumo?.queixaPrincipal,
      dados.queixaPrincipal,
      dados.anamnese?.identificacaoQueixaPrincipal
    ),
    historicoMedico: firstText(
      dados.resumo?.historicoMedico,
      dados.historicoMedico,
      dados.historiaClinica,
      dados.anamnese?.historicoMedico
    ),
    alergias: firstText(
      dados.resumo?.alergias,
      dados.alergias,
      dados.anamnese?.alergias,
      paciente.alergias
    ),
    medicamentosUso: firstText(
      dados.resumo?.medicamentosUso,
      dados.medicamentosUso,
      dados.anamnese?.medicamentosUso,
      paciente.medicamentosUso
    ),
    diagnosticos: firstText(dados.resumo?.diagnosticos, dados.diagnosticos),
    observacoesImportantes: firstText(
      dados.resumo?.observacoesImportantes,
      dados.observacoesImportantes,
      dados.observacoes,
      dados.anamnese?.observacoesComplementares,
      paciente.observacoesImportantes,
      paciente.observacoes
    ),
  };
}

function buildAnamneseValues(dados: ProntuarioDados): AnamneseDados {
  return {
    identificacaoQueixaPrincipal: firstText(
      dados.anamnese?.identificacaoQueixaPrincipal,
      dados.queixaPrincipal,
      dados.resumo?.queixaPrincipal
    ),
    historiaDoencaAtual: firstText(dados.anamnese?.historiaDoencaAtual),
    historicoMedico: firstText(
      dados.anamnese?.historicoMedico,
      dados.historicoMedico,
      dados.historiaClinica,
      dados.resumo?.historicoMedico
    ),
    historicoOdontologico: firstText(dados.anamnese?.historicoOdontologico),
    alergias: firstText(
      dados.anamnese?.alergias,
      dados.alergias,
      dados.resumo?.alergias
    ),
    medicamentosUso: firstText(
      dados.anamnese?.medicamentosUso,
      dados.medicamentosUso,
      dados.resumo?.medicamentosUso
    ),
    habitosVicios: firstText(dados.anamnese?.habitosVicios),
    antecedentesFamiliares: firstText(dados.anamnese?.antecedentesFamiliares),
    observacoesComplementares: firstText(
      dados.anamnese?.observacoesComplementares,
      dados.observacoes,
      dados.resumo?.observacoesImportantes
    ),
  };
}

export default function PacienteProntuarioBase({
  pacienteId,
  pacienteNome,
  telefone,
  email,
  convenio,
  ultimo,
}: PacienteProntuarioBaseProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [editandoResumo, setEditandoResumo] = useState(false);
  const [editandoAnamnese, setEditandoAnamnese] = useState(false);
  const [editandoEvolucao, setEditandoEvolucao] = useState(
    searchParams.get("acao") === "nova"
  );
  const [resumoDraft, setResumoDraft] = useState<ResumoDados>(resumoVazio);
  const [anamneseDraft, setAnamneseDraft] =
    useState<AnamneseDados>(anamneseVazia);
  const [evolucaoDraft, setEvolucaoDraft] = useState<EvolucaoDraft>(() =>
    createEmptyEvolucaoDraft()
  );
  const [periodoEvolucao, setPeriodoEvolucao] = useState("Todos");
  const [tipoEvolucaoFiltro, setTipoEvolucaoFiltro] = useState("Todos");
  const [profissionalFiltro, setProfissionalFiltro] = useState("Todos");
  const [buscaEvolucao, setBuscaEvolucao] = useState("");
  const [arcadaOdontograma, setArcadaOdontograma] = useState("Todas");
  const [visualizacaoOdontograma, setVisualizacaoOdontograma] =
    useState("Completa");
  const [mostrarLegendaOdontograma, setMostrarLegendaOdontograma] =
    useState(false);
  const [mostrarHistoricoOdontograma, setMostrarHistoricoOdontograma] =
    useState(false);
  const [odontogramaDraft, setOdontogramaDraft] =
    useState<OdontogramaDraft>(() => createOdontogramaDraft());
  const [ohfDraft, setOhfDraft] = useState<OHFDraft>(() => createOHFDraft());
  const [editandoOHF, setEditandoOHF] = useState(false);
  const [planoItemDraft, setPlanoItemDraft] = useState<PlanoItemDraft>(() =>
    createPlanoItemDraft()
  );
  const [editandoPlanoItem, setEditandoPlanoItem] = useState(false);
  const [fasePlanoFiltro, setFasePlanoFiltro] = useState("Todas");
  const [editandoNotasPlano, setEditandoNotasPlano] = useState(false);
  const [notasPlanoDraft, setNotasPlanoDraft] = useState("");
  const [procedimentoDraft, setProcedimentoDraft] =
    useState<ProcedimentoDraft>(() => createProcedimentoDraft());
  const [editandoProcedimento, setEditandoProcedimento] = useState(false);
  const [procedimentoSelecionadoId, setProcedimentoSelecionadoId] =
    useState("");
  const [mostrarFiltrosProcedimentos, setMostrarFiltrosProcedimentos] =
    useState(false);
  const [statusProcedimentoFiltro, setStatusProcedimentoFiltro] =
    useState<CliniplusProcedimentoStatus | "todos">("todos");
  const [categoriaProcedimentoFiltro, setCategoriaProcedimentoFiltro] =
    useState("Todas");
  const [profissionalProcedimentoFiltro, setProfissionalProcedimentoFiltro] =
    useState("Todos");
  const [periodoProcedimentoFiltro, setPeriodoProcedimentoFiltro] =
    useState("Todos");
  const [buscaProcedimento, setBuscaProcedimento] = useState("");
  const [exameDraft, setExameDraft] =
    useState<ExameDraft>(() => createExameDraft());
  const [editandoExame, setEditandoExame] = useState(false);
  const [exameSelecionadoId, setExameSelecionadoId] = useState("");
  const [menuExameAbertoId, setMenuExameAbertoId] = useState("");
  const [arquivoExameDraft, setArquivoExameDraft] =
    useState<ArquivoExameDraft>(() => createArquivoExameDraft());
  const [anexandoArquivoExameId, setAnexandoArquivoExameId] = useState("");
  const [visualizandoArquivoExameId, setVisualizandoArquivoExameId] =
    useState("");
  const [mostrarFiltrosExames, setMostrarFiltrosExames] = useState(false);
  const [statusExameFiltro, setStatusExameFiltro] =
    useState<CliniplusExameStatus | "todos">("todos");
  const [categoriaExameFiltro, setCategoriaExameFiltro] = useState("Todas");
  const [profissionalExameFiltro, setProfissionalExameFiltro] =
    useState("Todos");
  const [origemExameFiltro, setOrigemExameFiltro] = useState<
    CliniplusExameOrigem | "todos"
  >("todos");
  const [periodoExameFiltro, setPeriodoExameFiltro] = useState("Todos");
  const [buscaExame, setBuscaExame] = useState("");
  const [documentoDraft, setDocumentoDraft] =
    useState<DocumentoDraft>(() => createDocumentoDraft());
  const [editandoDocumento, setEditandoDocumento] = useState(false);
  const [visualizandoDocumentoId, setVisualizandoDocumentoId] = useState("");
  const [menuDocumentoAbertoId, setMenuDocumentoAbertoId] = useState("");
  const [buscaDocumento, setBuscaDocumento] = useState("");
  const [tipoDocumentoFiltro, setTipoDocumentoFiltro] = useState("todos");
  const [categoriaDocumentoFiltro, setCategoriaDocumentoFiltro] =
    useState("Todas");
  const [ordenacaoDocumento, setOrdenacaoDocumento] = useState("Mais recentes");
  const [paginaDocumentos, setPaginaDocumentos] = useState(1);
  const secaoParam = searchParams.get("secao") || "resumo";
  const secaoAtual = chavesSecoes.includes(secaoParam) ? secaoParam : "resumo";
  const acaoAtual = searchParams.get("acao");

  useEffect(() => {
    setMounted(true);
  }, []);

  const snapshot = useSyncExternalStore(
    subscribeStore,
    () =>
      mounted
        ? getPatientSnapshot(pacienteId, {
            id: pacienteId,
            nome: pacienteNome,
            area: "",
            status: "Ativo",
            tipoAtendimento: "odontologia",
            telefone,
            email,
            convenio,
            ultimo,
          })
        : "{}",
    () => "{}"
  );

  const data = useMemo(() => {
    try {
      return JSON.parse(snapshot) as {
        paciente?: CliniplusPaciente;
        prontuario?: CliniplusProntuario | null;
        agendamentos?: CliniplusAgendamento[];
        tratamentos?: CliniplusTratamento[];
        documentos?: CliniplusDocumento[];
        exames?: CliniplusExame[];
        evolucoes?: CliniplusEvolucao[];
        procedimentos?: CliniplusProcedimento[];
        odontograma?: CliniplusOdontogramaAnotacao[];
        ohf?: CliniplusOHFAvaliacao[];
        planosTratamento?: CliniplusPlanoTratamento[];
        sessaoPlano?: SessaoPlano | null;
      };
    } catch {
      return {};
    }
  }, [snapshot]);

  const paciente = data.paciente ?? {
    id: pacienteId,
    nome: pacienteNome,
    telefone,
    email,
    convenio,
    ultimo,
    area: "",
    status: "Ativo",
    tipoAtendimento: "odontologia" as const,
  };
  const dados = (data.prontuario?.dados ?? {}) as ProntuarioDados;
  const resumo = buildResumoValues(dados, paciente);
  const anamnese = buildAnamneseValues(dados);
  const agendamentos = data.agendamentos ?? [];
  const tratamentos = data.tratamentos ?? [];
  const documentos = data.documentos ?? [];
  const exames = data.exames ?? [];
  const evolucoes = data.evolucoes ?? [];
  const procedimentos = data.procedimentos ?? [];
  const odontograma = data.odontograma ?? [];
  const ohfAvaliacoes = data.ohf ?? [];
  const ohfFinalizada = ohfAvaliacoes.find(
    (avaliacao) => avaliacao.status === "finalizada"
  );
  const ohfAtual = ohfFinalizada ?? ohfAvaliacoes[0];
  const planosTratamento = data.planosTratamento ?? [];
  const planoTratamento = planosTratamento[0];
  const planoItens = planoTratamento?.itens ?? [];
  const itensPlanoFiltrados =
    fasePlanoFiltro === "Todas"
      ? planoItens
      : planoItens.filter((item) => item.fase === fasePlanoFiltro);
  const valorEstimadoPlano = planoItens.reduce(
    (total, item) => total + (Number(item.valor) || 0),
    0
  );
  const valorAprovadoPlano =
    planoTratamento?.status === "aprovado" ||
    planoTratamento?.status === "concluido"
      ? valorEstimadoPlano
      : 0;
  const valorExecutadoPlano = planoItens
    .filter((item) => item.status === "concluido")
    .reduce((total, item) => total + (Number(item.valor) || 0), 0);
  const saldoPlano = valorEstimadoPlano - valorExecutadoPlano;
  const itensConcluidosPlano = planoItens.filter(
    (item) => item.status === "concluido"
  ).length;
  const progressoPlano = planoItens.length
    ? Math.round((itensConcluidosPlano / planoItens.length) * 100)
    : 0;
  const proximoItemPlano = [...planoItens]
    .filter((item) => item.status !== "concluido" && item.status !== "cancelado")
    .sort((a, b) => (a.previsao || "").localeCompare(b.previsao || ""))[0];
  const sessaoPlano = data.sessaoPlano ?? null;
  const planoAtual = getPlanoFromParams(searchParams, sessaoPlano);
  const odontogramaLiberado =
    planoAtual === "pro" || planoAtual === "premium";
  const nascimento = paciente.dataNascimento || paciente.nascimento;
  const idade = getAge(nascimento);
  const genero = paciente.genero || paciente.sexo;
  const condicoes = splitList(paciente.condicoesCronicas);
  const alergias = uniqueList([
    ...splitList(resumo.alergias),
    ...splitList(anamnese.alergias),
    ...splitList(paciente.alergias),
    ...splitList(ohfAtual?.alergias),
  ]);
  const medicamentos = uniqueList([
    ...splitList(resumo.medicamentosUso),
    ...splitList(anamnese.medicamentosUso),
    ...splitList(paciente.medicamentosUso),
    ...splitList(ohfAtual?.medicamentosUso),
  ]);
  const observacoesAlerta = uniqueList([
    ...splitList(resumo.observacoesImportantes),
    ...splitList(anamnese.observacoesComplementares),
    ...splitList(paciente.observacoesImportantes),
    ...(ohfAtual?.riscoAsa ? [`Risco ASA: ${ohfAtual.riscoAsa}`] : []),
    ...(ohfAtual?.riscoSangramento
      ? [`Risco de sangramento: ${ohfAtual.riscoSangramento}`]
      : []),
    ...splitList(ohfAtual?.consideracoesEspeciais),
    ...splitList(ohfAtual?.condutasCuidados),
  ]);
  const documentosImportantes = documentos.filter((documento) =>
    `${documento.nome} ${documento.tipo}`
      .toLowerCase()
      .match(/exame|radio|laudo|panoram/)
  );
  const documentosFiltrados = [...documentos]
    .filter((documento) => {
      const tipo = normalizarTipoDocumento(documento.tipo, documento.extensao || documento.formato);
      const categoria = documento.categoria || documento.origem || "Outros";
      const termo = buscaDocumento.trim().toLowerCase();
      const matchBusca =
        !termo ||
        [
          documento.nome,
          categoria,
          tipo,
          documento.extensao,
          documento.formato,
          documento.enviadoPor,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(termo));
      const matchTipo = tipoDocumentoFiltro === "todos" || tipo === tipoDocumentoFiltro;
      const matchCategoria =
        categoriaDocumentoFiltro === "Todas" || categoria === categoriaDocumentoFiltro;

      return matchBusca && matchTipo && matchCategoria;
    })
    .sort((a, b) => {
      if (ordenacaoDocumento === "Mais antigos") {
        return getDocumentoDateValue(a) - getDocumentoDateValue(b);
      }

      if (ordenacaoDocumento === "Nome A-Z") {
        return a.nome.localeCompare(b.nome);
      }

      if (ordenacaoDocumento === "Nome Z-A") {
        return b.nome.localeCompare(a.nome);
      }

      return getDocumentoDateValue(b) - getDocumentoDateValue(a);
    });
  const totalPaginasDocumentos = Math.max(
    1,
    Math.ceil(documentosFiltrados.length / 8)
  );
  const paginaDocumentosAtual = Math.min(paginaDocumentos, totalPaginasDocumentos);
  const documentosPaginados = documentosFiltrados.slice(
    (paginaDocumentosAtual - 1) * 8,
    paginaDocumentosAtual * 8
  );
  const documentoVisualizado =
    documentos.find((documento) => String(documento.id) === visualizandoDocumentoId) ||
    null;
  const documentosResumo = {
    total: documentos.length,
    pendentes: documentos.filter((documento) => documento.status === "pendente")
      .length,
    ultimo: [...documentos].sort(
      (a, b) => getDocumentoDateValue(b) - getDocumentoDateValue(a)
    )[0],
  };
  const agora = new Date();
  const agendamentosOrdenados = [...agendamentos].sort(
    (a, b) => getDateTimeValue(a).getTime() - getDateTimeValue(b).getTime()
  );
  const proximos = agendamentosOrdenados.filter(
    (item) => getDateTimeValue(item).getTime() >= agora.getTime()
  );
  const anteriores = agendamentosOrdenados.filter(
    (item) => getDateTimeValue(item).getTime() < agora.getTime()
  );
  const ultimaConsulta = anteriores.at(-1) ?? agendamentosOrdenados.at(-1);
  const proximaConsulta = proximos[0];
  const diagnosticos = uniqueList([
    ...splitList(resumo.diagnosticos),
    ...tratamentos.map((tratamento) =>
      [tratamento.descricao, tratamento.status].filter(Boolean).join(" - ")
    ),
  ]);
  const ultimaEvolucaoAssinada = evolucoes.find(
    (evolucao) => evolucao.status === "assinada"
  );
  const profissionaisEvolucao = uniqueList([
    nomeExibicaoProfissional(),
    ...evolucoes.map((evolucao) => evolucao.profissional).filter(Boolean),
  ]);
  const evolucoesFiltradas = evolucoes.filter((evolucao) => {
    const termo = buscaEvolucao.trim().toLowerCase();
    const matchBusca =
      !termo ||
      [
        evolucao.titulo,
        evolucao.texto,
        evolucao.profissional,
        evolucao.tipo,
        evolucao.dentes,
        evolucao.tags?.join(" "),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(termo));
    const matchTipo =
      tipoEvolucaoFiltro === "Todos" || evolucao.tipo === tipoEvolucaoFiltro;
    const matchProfissional =
      profissionalFiltro === "Todos" ||
      evolucao.profissional === profissionalFiltro;
    const dataEvolucao = new Date(`${evolucao.data}T${evolucao.hora || "00:00"}`);
    const limite = new Date();

    if (periodoEvolucao === "Últimos 30 dias") {
      limite.setDate(limite.getDate() - 30);
    } else if (periodoEvolucao === "Últimos 90 dias") {
      limite.setDate(limite.getDate() - 90);
    } else {
      limite.setFullYear(1900);
    }

    return matchBusca && matchTipo && matchProfissional && dataEvolucao >= limite;
  });
  const profissionaisProcedimentos = uniqueList([
    nomeExibicaoProfissional(),
    ...procedimentos
      .map((procedimento) => procedimento.profissional)
      .filter(Boolean),
  ]);
  const procedimentosFiltrados = procedimentos.filter((procedimento) => {
    const termo = buscaProcedimento.trim().toLowerCase();
    const matchBusca =
      !termo ||
      [
        procedimento.procedimento,
        procedimento.dente,
        procedimento.faceRegiao,
        procedimento.categoria,
        procedimento.profissional,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(termo));
    const matchStatus =
      statusProcedimentoFiltro === "todos" ||
      procedimento.status === statusProcedimentoFiltro;
    const matchCategoria =
      categoriaProcedimentoFiltro === "Todas" ||
      procedimento.categoria === categoriaProcedimentoFiltro;
    const matchProfissional =
      profissionalProcedimentoFiltro === "Todos" ||
      procedimento.profissional === profissionalProcedimentoFiltro;
    const dataProcedimento = new Date(
      `${procedimento.data || ""}T${procedimento.hora || "00:00"}`
    );
    const limite = new Date();

    if (periodoProcedimentoFiltro === "Ultimos 30 dias") {
      limite.setDate(limite.getDate() - 30);
    } else if (periodoProcedimentoFiltro === "Ultimos 90 dias") {
      limite.setDate(limite.getDate() - 90);
    } else {
      limite.setFullYear(1900);
    }

    return (
      matchBusca &&
      matchStatus &&
      matchCategoria &&
      matchProfissional &&
      dataProcedimento >= limite
    );
  });
  const procedimentoSelecionado =
    procedimentos.find((item) => item.id === procedimentoSelecionadoId) || null;
  const procedimentoResumo = {
    realizados: procedimentos.filter((item) =>
      ["concluido", "assinado"].includes(item.status)
    ).length,
    emAndamento: procedimentos.filter((item) => item.status === "em_andamento")
      .length,
    planejados: procedimentos.filter((item) => item.status === "planejado")
      .length,
    pendentes: procedimentos.filter((item) =>
      ["pendente", "aguardando"].includes(item.status)
    ).length,
  };
  const ultimoProcedimentoRealizado = procedimentos.find((item) =>
    ["concluido", "assinado"].includes(item.status)
  );
  const profissionaisExames = uniqueList([
    nomeExibicaoProfissional(),
    ...exames.map((exame) => exame.profissional).filter(Boolean),
  ]);
  const examesFiltrados = exames.filter((exame) => {
    const termo = buscaExame.trim().toLowerCase();
    const matchBusca =
      !termo ||
      [exame.exame, exame.dente, exame.regiao, exame.categoria, exame.profissional]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(termo));
    const matchStatus =
      statusExameFiltro === "todos" || exame.status === statusExameFiltro;
    const matchCategoria =
      categoriaExameFiltro === "Todas" || exame.categoria === categoriaExameFiltro;
    const matchProfissional =
      profissionalExameFiltro === "Todos" ||
      exame.profissional === profissionalExameFiltro;
    const matchOrigem =
      origemExameFiltro === "todos" || exame.origem === origemExameFiltro;
    const dataExame = new Date(`${exame.data || ""}T${exame.hora || "00:00"}`);
    const limite = new Date();

    if (periodoExameFiltro === "Ultimos 30 dias") {
      limite.setDate(limite.getDate() - 30);
    } else if (periodoExameFiltro === "Ultimos 90 dias") {
      limite.setDate(limite.getDate() - 90);
    } else {
      limite.setFullYear(1900);
    }

    return (
      matchBusca &&
      matchStatus &&
      matchCategoria &&
      matchProfissional &&
      matchOrigem &&
      dataExame >= limite
    );
  });
  const exameSelecionado =
    exames.find((item) => item.id === exameSelecionadoId) || null;
  const exameParaAnexar =
    exames.find((item) => item.id === anexandoArquivoExameId) || null;
  const exameParaVisualizar =
    exames.find((item) => item.id === visualizandoArquivoExameId) || null;
  const exameResumo = {
    realizados: exames.filter((item) =>
      ["realizado", "concluido", "assinado"].includes(item.status)
    ).length,
    pendentes: exames.filter((item) =>
      ["solicitado", "pendente"].includes(item.status)
    ).length,
    alterados: exames.filter((item) => item.status === "alterado").length,
    anexados: exames.filter((item) => Boolean(item.arquivoNome)).length,
  };
  const ultimoExameRealizado = exames.find((item) =>
    ["realizado", "concluido", "assinado"].includes(item.status)
  );
  const odontogramaPorDente = new Map(
    odontograma.map((anotacao) => [anotacao.dente, anotacao])
  );
  const ultimaAnotacaoOdontograma = odontograma[0];
  const odontogramaFiltrado = odontograma.filter((anotacao) => {
    if (visualizacaoOdontograma === "Planejamento") {
      return ["Planejado", "Em andamento"].includes(anotacao.status);
    }

    if (visualizacaoOdontograma === "Executado") {
      return anotacao.status === "Executado";
    }

    return true;
  });
  const dentesVisiveisSuperiores =
    arcadaOdontograma === "Inferior" ? [] : dentesSuperiores;
  const dentesVisiveisInferiores =
    arcadaOdontograma === "Superior" ? [] : dentesInferiores;

  useEffect(() => {
    if (secaoAtual === "evolucoes" && acaoAtual === "nova") {
      setEvolucaoDraft(createEmptyEvolucaoDraft());
      setEditandoEvolucao(true);
      setMensagem("");
    }
  }, [acaoAtual, secaoAtual]);

  useEffect(() => {
    setPaginaDocumentos(1);
  }, [buscaDocumento, tipoDocumentoFiltro, categoriaDocumentoFiltro, ordenacaoDocumento]);

  useEffect(() => {
    if (!editandoNotasPlano) {
      setNotasPlanoDraft(planoTratamento?.observacoes || "");
    }
  }, [editandoNotasPlano, planoTratamento?.observacoes]);

  if (!mounted) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-slate-500">
          Carregando prontuario...
        </p>
      </section>
    );
  }

  function secaoHref(secao: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("aba", "prontuario");
    params.set("secao", secao);
    return `/pacientes/${pacienteId}?${params.toString()}`;
  }

  function abrirEdicaoResumo() {
    setResumoDraft(resumo);
    setEditandoResumo(true);
    setMensagem("");
  }

  function abrirEdicaoAnamnese() {
    setAnamneseDraft(anamnese);
    setEditandoAnamnese(true);
    setMensagem("");
  }

  function salvarResumo() {
    saveProntuario(pacienteId, {
      ...dados,
      resumo: resumoDraft,
      queixaPrincipal: resumoDraft.queixaPrincipal,
      historicoMedico: resumoDraft.historicoMedico,
      alergias: resumoDraft.alergias,
      medicamentosUso: resumoDraft.medicamentosUso,
      diagnosticos: resumoDraft.diagnosticos,
      observacoesImportantes: resumoDraft.observacoesImportantes,
    });
    setEditandoResumo(false);
    setMensagem("Resumo salvo no prontuario do paciente.");
  }

  function salvarAnamnese() {
    saveProntuario(pacienteId, {
      ...dados,
      anamnese: anamneseDraft,
    });
    setEditandoAnamnese(false);
    setMensagem("Anamnese salva no prontuario do paciente.");
  }

  function updateResumoField(key: keyof ResumoDados, value: string) {
    setResumoDraft((current) => ({ ...current, [key]: value }));
  }

  function updateAnamneseField(key: keyof AnamneseDados, value: string) {
    setAnamneseDraft((current) => ({ ...current, [key]: value }));
  }

  function updateEvolucaoField(key: keyof EvolucaoDraft, value: string) {
    setEvolucaoDraft((current) => ({ ...current, [key]: value }));
  }

  function novaEvolucao() {
    setEvolucaoDraft(createEmptyEvolucaoDraft());
    setEditandoEvolucao(true);
    setMensagem("");
  }

  function selecionarEvolucao(evolucao: CliniplusEvolucao) {
    setEvolucaoDraft(evolucaoToDraft(evolucao));
    setEditandoEvolucao(true);
    setMensagem("");
  }

  function salvarEvolucao(status: "rascunho" | "assinada") {
    const titulo = evolucaoDraft.titulo.trim();
    const texto = evolucaoDraft.texto.trim();

    if (status === "rascunho" && !titulo && !texto) {
      setMensagem("Informe pelo menos título ou texto para salvar rascunho.");
      return;
    }

    if (status === "assinada" && !texto) {
      setMensagem("Informe o texto da evolução antes de assinar.");
      return;
    }

    const dadosEvolucao = draftToEvolucao(evolucaoDraft, pacienteId, status);

    if (evolucaoDraft.id) {
      updateEvolucao(evolucaoDraft.id, dadosEvolucao);
      setEvolucaoDraft((current) => ({ ...current, status }));
    } else {
      const criada = addEvolucao({
        ...dadosEvolucao,
        criadoEm: new Date().toISOString(),
      });
      setEvolucaoDraft(evolucaoToDraft(criada));
    }

    setEditandoEvolucao(true);
    setMensagem(
      status === "assinada"
        ? "Evolução assinada e salva no prontuário."
        : "Rascunho de evolução salvo no prontuário."
    );
  }

  function excluirEvolucao(id: string) {
    deleteEvolucao(id);
    if (evolucaoDraft.id === id) {
      setEvolucaoDraft(createEmptyEvolucaoDraft());
      setEditandoEvolucao(false);
    }
    setMensagem("Evolução excluída do prontuário.");
  }

  function selecionarDente(dente: string) {
    const anotacao = odontogramaPorDente.get(dente);

    setOdontogramaDraft(
      anotacao ? odontogramaToDraft(anotacao) : createOdontogramaDraft(dente)
    );
    setMensagem("");
  }

  function updateOdontogramaField(
    key: keyof OdontogramaDraft,
    value: string
  ) {
    setOdontogramaDraft((current) => ({ ...current, [key]: value }));
  }

  function salvarOdontograma() {
    if (!odontogramaDraft.dente) {
      setMensagem("Selecione um dente antes de salvar a anotação.");
      return;
    }

    const dados = {
      pacienteId,
      dente: odontogramaDraft.dente,
      face: odontogramaDraft.face,
      condicao: odontogramaDraft.condicao,
      status: odontogramaDraft.status,
      observacao: odontogramaDraft.observacao,
      profissional: odontogramaDraft.profissional,
      data: hojeIso(),
    };

    if (odontogramaDraft.id) {
      updateOdontogramaAnotacao(odontogramaDraft.id, dados);
      setMensagem(`Anotação do dente ${odontogramaDraft.dente} atualizada.`);
      return;
    }

    const existente = odontogramaPorDente.get(odontogramaDraft.dente);

    if (existente) {
      updateOdontogramaAnotacao(existente.id, dados);
      setOdontogramaDraft({ ...odontogramaDraft, id: String(existente.id) });
      setMensagem(`Anotação do dente ${odontogramaDraft.dente} atualizada.`);
      return;
    }

    const criada = addOdontogramaAnotacao({
      ...dados,
      criadoEm: new Date().toISOString(),
    });
    setOdontogramaDraft(odontogramaToDraft(criada));
    setMensagem(`Anotação do dente ${odontogramaDraft.dente} salva.`);
  }

  function limparOdontograma() {
    setOdontogramaDraft(createOdontogramaDraft(odontogramaDraft.dente));
    setMensagem("");
  }

  function excluirOdontograma(id?: string) {
    const alvo = id || odontogramaDraft.id;

    if (!alvo) {
      limparOdontograma();
      return;
    }

    deleteOdontogramaAnotacao(alvo);
    setOdontogramaDraft(createOdontogramaDraft(odontogramaDraft.dente));
    setMensagem("Anotação removida do odontograma.");
  }

  function updateOHFField(key: keyof OHFDraft, value: string) {
    setOhfDraft((current) => ({ ...current, [key]: value }));
  }

  function abrirNovaOHF() {
    setOhfDraft(createOHFDraft());
    setEditandoOHF(true);
    setMensagem("");
  }

  function abrirOHF(avaliacao: CliniplusOHFAvaliacao) {
    setOhfDraft(ohfToDraft(avaliacao));
    setEditandoOHF(true);
    setMensagem("");
  }

  function cancelarOHF() {
    setOhfDraft(createOHFDraft());
    setEditandoOHF(false);
    setMensagem("");
  }

  function salvarOHF(status: "rascunho" | "finalizada") {
    if (!hasOHFContent(ohfDraft)) {
      setMensagem("Preencha pelo menos um campo da avaliacao OHF.");
      return;
    }

    if (status === "finalizada" && !ohfDraft.profissional.trim()) {
      setMensagem("Informe o profissional antes de finalizar a avaliacao OHF.");
      return;
    }

    const dadosOHF = {
      ...ohfDraft,
      pacienteId,
      profissional: ohfDraft.profissional.trim() || nomeExibicaoProfissional(),
      status,
    };

    if (ohfDraft.id) {
      updateOHFAvaliacao(ohfDraft.id, dadosOHF);
    } else {
      addOHFAvaliacao({
        ...dadosOHF,
        criadoEm: new Date().toISOString(),
      });
    }

    setOhfDraft(createOHFDraft());
    setEditandoOHF(false);
    setMensagem(
      status === "finalizada"
        ? "Avaliacao OHF finalizada e salva."
        : "Rascunho da avaliacao OHF salvo."
    );
  }

  function excluirOHF(id: string) {
    deleteOHFAvaliacao(id);

    if (ohfDraft.id === id) {
      setOhfDraft(createOHFDraft());
      setEditandoOHF(false);
    }

    setMensagem("Avaliacao OHF removida.");
  }

  function criarPlanoTratamento() {
    const plano = addPlanoTratamento({
      pacienteId,
      titulo: "Plano de tratamento odontologico",
      status: "rascunho",
      profissional: nomeExibicaoProfissional(),
      dataCriacao: hojeIso(),
      observacoes: "",
      formasPagamento: ["Pix", "Cartao de credito"],
      itens: [],
      criadoEm: new Date().toISOString(),
    });

    setNotasPlanoDraft(plano.observacoes || "");
    setMensagem("Plano de tratamento criado.");
    return plano;
  }

  function getPlanoAtualOuCriar() {
    return planoTratamento ?? criarPlanoTratamento();
  }

  function updatePlanoItemField(key: keyof PlanoItemDraft, value: string) {
    setPlanoItemDraft((current) => ({ ...current, [key]: value }));
  }

  function abrirNovoItemPlano(fase?: string) {
    const faseInicial =
      fase || (fasePlanoFiltro !== "Todas" ? fasePlanoFiltro : undefined);
    setPlanoItemDraft(createPlanoItemDraft(faseInicial));
    setEditandoPlanoItem(true);
    setMensagem("");
  }

  function editarItemPlano(item: PlanoTratamentoItem) {
    setPlanoItemDraft(planoItemToDraft(item));
    setEditandoPlanoItem(true);
    setMensagem("");
  }

  function cancelarItemPlano() {
    setPlanoItemDraft(createPlanoItemDraft());
    setEditandoPlanoItem(false);
    setMensagem("");
  }

  function salvarItemPlano() {
    const procedimento = planoItemDraft.procedimento.trim();

    if (!procedimento) {
      setMensagem("Informe o procedimento do item do plano.");
      return;
    }

    const plano = getPlanoAtualOuCriar();
    const item = draftToPlanoItem(planoItemDraft);
    const itens = planoItemDraft.id
      ? plano.itens.map((atual) =>
          atual.id === planoItemDraft.id
            ? {
                ...atual,
                ...item,
                criadoEm: atual.criadoEm,
                concluidoEm:
                  item.status === "concluido"
                    ? atual.concluidoEm || item.concluidoEm
                    : undefined,
              }
            : atual
        )
      : [...plano.itens, item];

    updatePlanoTratamento(plano.id, {
      itens,
      status: plano.status === "rascunho" ? "em_andamento" : plano.status,
    });
    setPlanoItemDraft(createPlanoItemDraft());
    setEditandoPlanoItem(false);
    setMensagem(
      planoItemDraft.id
        ? "Item do plano atualizado."
        : "Item adicionado ao plano de tratamento."
    );
  }

  function updateProcedimentoField(
    key: keyof ProcedimentoDraft,
    value: string
  ) {
    setProcedimentoDraft((current) => ({ ...current, [key]: value }));
  }

  function novoProcedimento() {
    setProcedimentoDraft(createProcedimentoDraft());
    setEditandoProcedimento(true);
    setMensagem("");
  }

  function editarProcedimento(procedimento: CliniplusProcedimento) {
    setProcedimentoDraft(procedimentoToDraft(procedimento));
    setProcedimentoSelecionadoId(procedimento.id);
    setEditandoProcedimento(true);
    setMensagem("");
  }

  function salvarProcedimento() {
    if (!procedimentoDraft.procedimento.trim()) {
      setMensagem("Informe o nome do procedimento.");
      return;
    }

    const dadosProcedimento = draftToProcedimento(
      procedimentoDraft,
      pacienteId
    );

    if (procedimentoDraft.id) {
      const atualizado = updateProcedimento(
        procedimentoDraft.id,
        dadosProcedimento
      );
      setProcedimentoSelecionadoId(atualizado?.id || procedimentoDraft.id);
      setMensagem("Procedimento atualizado com sucesso.");
    } else {
      const novo = addProcedimento(dadosProcedimento);
      setProcedimentoSelecionadoId(novo.id);
      setMensagem("Procedimento salvo com sucesso.");
    }

    setEditandoProcedimento(false);
    setProcedimentoDraft(createProcedimentoDraft());
  }

  function concluirProcedimento(procedimento: CliniplusProcedimento) {
    const atualizado = updateProcedimento(procedimento.id, {
      status: "concluido",
    });
    setProcedimentoSelecionadoId(atualizado?.id || procedimento.id);
    setMensagem("Procedimento concluido.");
  }

  function assinarProcedimento() {
    if (!procedimentoSelecionado) {
      setMensagem("Selecione um procedimento para assinar.");
      return;
    }

    const atualizado = updateProcedimento(procedimentoSelecionado.id, {
      status: "assinado",
      assinadoEm: new Date().toISOString(),
    });
    setProcedimentoSelecionadoId(atualizado?.id || procedimentoSelecionado.id);
    setMensagem("Procedimento assinado com sucesso.");
  }

  function excluirProcedimento(procedimento: CliniplusProcedimento) {
    deleteProcedimento(procedimento.id);

    if (procedimentoSelecionadoId === procedimento.id) {
      setProcedimentoSelecionadoId("");
    }

    setMensagem("Procedimento excluido.");
  }

  function updateExameField(key: keyof ExameDraft, value: string) {
    setExameDraft((current) => ({ ...current, [key]: value }));
  }

  function updateArquivoExameField(
    key: keyof ArquivoExameDraft,
    value: string
  ) {
    setArquivoExameDraft((current) => ({ ...current, [key]: value }));
  }

  function novoExame() {
    setExameDraft(createExameDraft());
    setEditandoExame(true);
    setMensagem("");
  }

  function editarExame(exame: CliniplusExame) {
    setExameDraft(exameToDraft(exame));
    setExameSelecionadoId(exame.id);
    setEditandoExame(true);
    setMensagem("");
  }

  function anexarArquivoExame(exame: CliniplusExame) {
    setExameSelecionadoId(exame.id);
    setArquivoExameDraft(createArquivoExameDraft(exame));
    setAnexandoArquivoExameId(exame.id);
    setMenuExameAbertoId("");
    setMensagem("");
  }

  function salvarArquivoExame() {
    if (!arquivoExameDraft.exameId) {
      setMensagem("Selecione um exame para anexar arquivo.");
      return;
    }

    if (!arquivoExameDraft.arquivoNome.trim()) {
      setMensagem("Selecione um arquivo para anexar ao exame.");
      return;
    }

    const atualizado = updateExame(arquivoExameDraft.exameId, {
      arquivoNome: arquivoExameDraft.arquivoNome.trim(),
      arquivoTipo: arquivoExameDraft.arquivoTipo.trim(),
      arquivoTamanho: arquivoExameDraft.arquivoTamanho.trim(),
      arquivoObservacao: arquivoExameDraft.arquivoObservacao.trim(),
      arquivoUrl: arquivoExameDraft.arquivoUrl,
      arquivoAnexadoEm: new Date().toISOString(),
    });

    setExameSelecionadoId(atualizado?.id || arquivoExameDraft.exameId);
    setAnexandoArquivoExameId("");
    setArquivoExameDraft(createArquivoExameDraft());
    setMensagem("Arquivo anexado ao exame.");
  }

  function guardarArquivo(file: File, aoSalvar: (referencia: string) => void) {
    if (file.size > TAMANHO_MAXIMO) {
      setMensagem("O arquivo passa de 15 MB.");
      return;
    }

    salvarArquivo(file, pacienteId)
      .then((salvo) => aoSalvar(referenciaArquivo(salvo.id)))
      .catch(() => setMensagem("Nao foi possivel guardar o arquivo neste navegador."));
  }

  function selecionarArquivoExame(file: File | null) {
    if (!file) {
      return;
    }

    setArquivoExameDraft((current) => ({
      ...current,
      arquivoNome: file.name,
      arquivoTipo: file.type || "Arquivo",
      arquivoTamanho: formatFileSize(file.size),
    }));

    guardarArquivo(file, (referencia) =>
      setArquivoExameDraft((current) => ({ ...current, arquivoUrl: referencia }))
    );
  }

  function selecionarArquivoNovoExame(file: File | null) {
    if (!file) {
      return;
    }

    setExameDraft((current) => ({
      ...current,
      arquivoNome: file.name,
      arquivoTipo: file.type || "Arquivo",
      arquivoTamanho: formatFileSize(file.size),
    }));

    guardarArquivo(file, (referencia) =>
      setExameDraft((current) => ({ ...current, arquivoUrl: referencia }))
    );
  }

  function assinarExame(exame: CliniplusExame) {
    const atualizado = updateExame(exame.id, {
      status: "assinado",
      assinadoEm: new Date().toISOString(),
    });

    setExameSelecionadoId(atualizado?.id || exame.id);
    setMenuExameAbertoId("");
    setMensagem("Laudo assinado com sucesso.");
  }

  function visualizarArquivoExame(exame: CliniplusExame) {
    if (!exame.arquivoNome) {
      setMensagem("Nenhum arquivo anexado a este exame.");
      return;
    }

    setVisualizandoArquivoExameId(exame.id);
    setMensagem("");
  }

  function baixarArquivoExame(exame: CliniplusExame) {
    if (!exame.arquivoNome) {
      setMensagem("Nenhum arquivo anexado a este exame.");
      return;
    }

    baixarPorUrl(exame.arquivoUrl, exame.arquivoNome).then((ok) => {
      if (!ok) setMensagem("O arquivo nao esta disponivel neste navegador.");
    });
    setMensagem("Download do arquivo iniciado.");
  }

  function salvarExame() {
    if (!exameDraft.exame.trim()) {
      setMensagem("Informe o nome do exame.");
      return;
    }

    const dadosExame = draftToExame(exameDraft, pacienteId);

    if (exameDraft.id) {
      const atualizado = updateExame(exameDraft.id, dadosExame);
      setExameSelecionadoId(atualizado?.id || exameDraft.id);
      setMensagem("Exame atualizado com sucesso.");
    } else {
      const novo = addExame(dadosExame);
      setExameSelecionadoId(novo.id);
      setMensagem("Exame salvo com sucesso.");
    }

    setEditandoExame(false);
    setExameDraft(createExameDraft());
  }

  function concluirExame(exame: CliniplusExame) {
    const atualizado = updateExame(exame.id, { status: "concluido" });
    setExameSelecionadoId(atualizado?.id || exame.id);
    setMensagem("Exame concluido.");
  }

  function assinarLaudo() {
    if (!exameSelecionado) {
      setMensagem("Selecione um exame para assinar o laudo.");
      return;
    }

    assinarExame(exameSelecionado);
  }

  function excluirExame(exame: CliniplusExame) {
    deleteExame(exame.id);

    if (exameSelecionadoId === exame.id) {
      setExameSelecionadoId("");
    }

    setMensagem("Exame excluido.");
  }

  function updateDocumentoDraftField(key: keyof DocumentoDraft, value: string) {
    setDocumentoDraft((current) => ({ ...current, [key]: value }));
  }

  function novoDocumento() {
    setDocumentoDraft(createDocumentoDraft());
    setEditandoDocumento(true);
    setMenuDocumentoAbertoId("");
    setMensagem("");
  }

  function editarDocumento(documento: CliniplusDocumento) {
    setDocumentoDraft(createDocumentoDraft(documento));
    setEditandoDocumento(true);
    setMenuDocumentoAbertoId("");
    setMensagem("");
  }

  function selecionarArquivoDocumento(file: File | null) {
    if (!file) {
      return;
    }

    const extensao = file.name.includes(".")
      ? file.name.split(".").pop()?.toUpperCase() || ""
      : "";
    const tipo = normalizarTipoDocumento(file.type, extensao);

    setDocumentoDraft((current) => ({
      ...current,
      nome: file.name,
      tipo,
      extensao,
      tamanho: formatFileSize(file.size),
    }));

    guardarArquivo(file, (referencia) =>
      setDocumentoDraft((current) => ({
        ...current,
        urlSimulada: referencia,
        arquivoId: idDaReferencia(referencia),
      }))
    );
  }

  function salvarDocumento() {
    if (!documentoDraft.nome.trim()) {
      setMensagem("Selecione um arquivo ou informe o nome do documento.");
      return;
    }

    const dadosDocumento = draftToDocumento(
      documentoDraft,
      pacienteId,
      paciente.nome
    );

    if (documentoDraft.id) {
      updateDocumento(documentoDraft.id, dadosDocumento);
      setMensagem("Documento atualizado com sucesso.");
    } else {
      addDocumento(dadosDocumento);
      setMensagem("Documento salvo no prontuario do paciente.");
    }

    setDocumentoDraft(createDocumentoDraft());
    setEditandoDocumento(false);
    setMenuDocumentoAbertoId("");
  }

  function baixarDocumento(documento: CliniplusDocumento) {
    setMenuDocumentoAbertoId("");
    const url = documento.urlSimulada || (documento.arquivoId ? referenciaArquivo(documento.arquivoId) : "");
    baixarPorUrl(url, documento.nome).then((ok) =>
      setMensagem(ok ? "Download do documento iniciado." : "Este documento nao tem arquivo anexado.")
    );
  }

  function arquivarDocumento(documento: CliniplusDocumento) {
    updateDocumento(documento.id, { status: "arquivado" });
    setMenuDocumentoAbertoId("");
    setMensagem("Documento arquivado.");
  }

  function excluirDocumento(documento: CliniplusDocumento) {
    deleteDocumento(documento.id);

    if (visualizandoDocumentoId === String(documento.id)) {
      setVisualizandoDocumentoId("");
    }

    if (documentoDraft.id === String(documento.id)) {
      setDocumentoDraft(createDocumentoDraft());
      setEditandoDocumento(false);
    }

    setMenuDocumentoAbertoId("");
    setMensagem("Documento excluido.");
  }

  function concluirItemPlano(id: string) {
    if (!planoTratamento) {
      return;
    }

    updatePlanoTratamento(planoTratamento.id, {
      itens: planoTratamento.itens.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "concluido",
              concluidoEm: item.concluidoEm || new Date().toISOString(),
              atualizadoEm: new Date().toISOString(),
            }
          : item
      ),
    });
    setMensagem("Item concluido no plano de tratamento.");
  }

  function excluirItemPlano(id: string) {
    if (!planoTratamento) {
      return;
    }

    updatePlanoTratamento(planoTratamento.id, {
      itens: planoTratamento.itens.filter((item) => item.id !== id),
    });

    if (planoItemDraft.id === id) {
      cancelarItemPlano();
    }

    setMensagem("Item removido do plano de tratamento.");
  }

  function aprovarPlanoTratamento() {
    const plano = getPlanoAtualOuCriar();

    updatePlanoTratamento(plano.id, {
      status: "aprovado",
      aprovadoEm: new Date().toISOString(),
    });
    setMensagem("Plano de tratamento aprovado.");
  }

  function gerarOrcamentoPlano() {
    getPlanoAtualOuCriar();
    const params = new URLSearchParams(searchParams.toString());
    params.set("aba", "prontuario");
    params.set("secao", "plano");
    params.set("modo", "orcamento");
    router.push(`/pacientes/${pacienteId}?${params.toString()}`);
  }

  function imprimirPlanoTratamento() {
    getPlanoAtualOuCriar();
    const params = new URLSearchParams(searchParams.toString());
    params.set("aba", "prontuario");
    params.set("secao", "plano");
    params.set("modo", "impressao");
    router.push(`/pacientes/${pacienteId}?${params.toString()}`);
  }

  function salvarNotasPlano() {
    const plano = getPlanoAtualOuCriar();

    updatePlanoTratamento(plano.id, {
      observacoes: notasPlanoDraft,
    });
    setEditandoNotasPlano(false);
    setMensagem("Notas e condutas salvas no plano.");
  }

  function toggleFormaPagamento(forma: string) {
    const plano = getPlanoAtualOuCriar();
    const formasAtuais = plano.formasPagamento || [];
    const formasPagamento = formasAtuais.includes(forma)
      ? formasAtuais.filter((item) => item !== forma)
      : [...formasAtuais, forma];

    updatePlanoTratamento(plano.id, { formasPagamento });
  }

  function renderResumo() {
    if (editandoResumo) {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Editar resumo
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Os dados serao salvos na store central do prontuario.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton
                variant="secondary"
                onClick={() => setEditandoResumo(false)}
              >
                Cancelar
              </ActionButton>
              <ActionButton onClick={salvarResumo}>Salvar resumo</ActionButton>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <TextAreaField
              label="Queixa principal"
              value={resumoDraft.queixaPrincipal}
              onChange={(value) => updateResumoField("queixaPrincipal", value)}
            />
            <TextAreaField
              label="Historico medico"
              value={resumoDraft.historicoMedico}
              onChange={(value) => updateResumoField("historicoMedico", value)}
            />
            <TextAreaField
              label="Alergias"
              value={resumoDraft.alergias}
              onChange={(value) => updateResumoField("alergias", value)}
            />
            <TextAreaField
              label="Medicacoes em uso"
              value={resumoDraft.medicamentosUso}
              onChange={(value) => updateResumoField("medicamentosUso", value)}
            />
            <TextAreaField
              label="Diagnosticos"
              value={resumoDraft.diagnosticos}
              onChange={(value) => updateResumoField("diagnosticos", value)}
            />
            <TextAreaField
              label="Observacoes importantes"
              value={resumoDraft.observacoesImportantes}
              onChange={(value) =>
                updateResumoField("observacoesImportantes", value)
              }
            />
          </div>
        </section>
      );
    }

    return (
      <>
        <div className="flex justify-end">
          <ActionButton onClick={abrirEdicaoResumo}>Editar resumo</ActionButton>
        </div>
        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          <InfoCard title="Queixa principal" icon={<Bell size={20} />}>
            {resumo.queixaPrincipal ? (
              <p className="whitespace-pre-line">{resumo.queixaPrincipal}</p>
            ) : (
              <EmptyState />
            )}
          </InfoCard>
          <InfoCard title="Historico medico" icon={<HeartPulse size={20} />}>
            {resumo.historicoMedico || condicoes.length ? (
              <div className="space-y-2">
                {resumo.historicoMedico && (
                  <p className="whitespace-pre-line">{resumo.historicoMedico}</p>
                )}
                {condicoes.map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </InfoCard>
          <InfoCard title="Alergias" icon={<AlertTriangle size={20} />}>
            {alergias.length ? (
              <ul className="space-y-2">
                {alergias.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : (
              <EmptyState text="Nenhuma alergia registrada." />
            )}
          </InfoCard>
          <InfoCard title="Medicacoes em uso" icon={<Pill size={20} />}>
            {medicamentos.length ? (
              <ul className="space-y-2">
                {medicamentos.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : (
              <EmptyState />
            )}
          </InfoCard>
          <InfoCard title="Ultima consulta" icon={<CalendarClock size={20} />}>
            {ultimaConsulta ? (
              <div>
                <p>
                  {formatDate(ultimaConsulta.data)} as{" "}
                  {ultimaConsulta.hora || ultimaConsulta.horario}
                </p>
                <p className="mt-2 text-slate-500">
                  {ultimaConsulta.procedimento || ultimaConsulta.tipo}
                </p>
              </div>
            ) : (
              <EmptyState text={ultimo ? `Ultimo registro: ${ultimo}` : undefined} />
            )}
          </InfoCard>
          <InfoCard title="Proxima consulta" icon={<Clock3 size={20} />}>
            {proximaConsulta ? (
              <div>
                <p>
                  {formatDate(proximaConsulta.data)} as{" "}
                  {proximaConsulta.hora || proximaConsulta.horario}
                </p>
                <p className="mt-2 text-slate-500">
                  {proximaConsulta.procedimento || proximaConsulta.tipo}
                </p>
              </div>
            ) : (
              <EmptyState />
            )}
          </InfoCard>
          <InfoCard title="Diagnosticos" icon={<ClipboardList size={20} />}>
            {diagnosticos.length ? (
              <ul className="space-y-2">
                {diagnosticos.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : (
              <EmptyState />
            )}
          </InfoCard>
          {planoTratamento && (
            <InfoCard
              title="Plano de tratamento"
              icon={<ClipboardList size={20} />}
            >
              <div className="space-y-2">
                <p>Status: {statusPlanoLabel(planoTratamento.status)}</p>
                <p>Total estimado: {formatMoney(valorEstimadoPlano)}</p>
                <p>
                  Progresso: {itensConcluidosPlano} de {planoItens.length} itens
                  concluidos ({progressoPlano}%)
                </p>
                <p>
                  Proximo item:{" "}
                  {proximoItemPlano
                    ? `${proximoItemPlano.procedimento} - ${formatDate(
                        proximoItemPlano.previsao
                      )}`
                    : "Nao informado"}
                </p>
              </div>
            </InfoCard>
          )}
          {procedimentos.length > 0 && (
            <InfoCard title="Procedimentos" icon={<Bone size={20} />}>
              <div className="space-y-2">
                <p>
                  Ultimo realizado:{" "}
                  {ultimoProcedimentoRealizado
                    ? `${ultimoProcedimentoRealizado.procedimento} - ${formatDate(
                        ultimoProcedimentoRealizado.data
                      )}`
                    : "Nenhum procedimento concluido."}
                </p>
                <p>
                  Concluidos/assinados: {procedimentoResumo.realizados}
                </p>
                <p>
                  Pendentes/em andamento:{" "}
                  {procedimentoResumo.pendentes +
                    procedimentoResumo.emAndamento}
                </p>
              </div>
            </InfoCard>
          )}
          {exames.length > 0 && (
            <InfoCard title="Exames" icon={<FileText size={20} />}>
              <div className="space-y-2">
                <p>
                  Ultimo realizado:{" "}
                  {ultimoExameRealizado
                    ? `${ultimoExameRealizado.exame} - ${formatDate(
                        ultimoExameRealizado.data
                      )}`
                    : "Nenhum exame concluido."}
                </p>
                <p>Anexados: {exameResumo.anexados}</p>
                <p>
                  Pendentes/alterados:{" "}
                  {exameResumo.pendentes + exameResumo.alterados}
                </p>
              </div>
            </InfoCard>
          )}
          {documentos.length > 0 && (
            <InfoCard title="Documentos" icon={<FileText size={20} />}>
              <div className="space-y-2">
                <p>Total no prontuario: {documentosResumo.total}</p>
                <p>Pendentes: {documentosResumo.pendentes}</p>
                <p>
                  Ultimo envio:{" "}
                  {documentosResumo.ultimo
                    ? `${documentosResumo.ultimo.nome} - ${formatDate(
                        documentosResumo.ultimo.dataEnvio ||
                          documentosResumo.ultimo.data
                      )}`
                    : "Nenhum documento enviado."}
                </p>
              </div>
            </InfoCard>
          )}
          <InfoCard title="Observacoes importantes" icon={<FileText size={20} />}>
            {resumo.observacoesImportantes ||
            ultimaEvolucaoAssinada ||
            ultimaAnotacaoOdontograma ||
            ohfFinalizada ? (
              <div className="space-y-3">
                {resumo.observacoesImportantes && (
                  <p className="whitespace-pre-line">
                    {resumo.observacoesImportantes}
                  </p>
                )}
                {ultimaEvolucaoAssinada && (
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                    <p className="text-xs font-black text-indigo-700">
                      Última evolução assinada
                    </p>
                    <p className="mt-1 text-slate-700">
                      {ultimaEvolucaoAssinada.titulo}
                    </p>
                    <p className="mt-1 line-clamp-3 text-xs text-slate-500">
                      {ultimaEvolucaoAssinada.texto}
                    </p>
                  </div>
                )}
                {ultimaAnotacaoOdontograma && (
                  <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-3">
                    <p className="text-xs font-black text-cyan-700">
                      Resumo do odontograma
                    </p>
                    <p className="mt-1 text-slate-700">
                      {odontograma.length} dente(s) com anotação.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Última: dente {ultimaAnotacaoOdontograma.dente} -{" "}
                      {ultimaAnotacaoOdontograma.condicao}
                    </p>
                  </div>
                )}
                {ohfFinalizada && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs font-black text-emerald-700">
                      Resumo OHF
                    </p>
                    <p className="mt-1 text-slate-700">
                      {formatDate(ohfFinalizada.data)} -{" "}
                      {ohfFinalizada.profissional}
                    </p>
                    <p className="mt-1 line-clamp-3 text-xs text-slate-500">
                      {resumoOHF(ohfFinalizada)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </InfoCard>
        </section>
      </>
    );
  }

  function renderProcedimentos() {
    const statusClasses: Record<CliniplusProcedimentoStatus, string> = {
      planejado: "border-indigo-100 bg-indigo-50 text-indigo-700",
      agendado: "border-blue-100 bg-blue-50 text-blue-700",
      em_andamento: "border-cyan-100 bg-cyan-50 text-cyan-700",
      concluido: "border-emerald-100 bg-emerald-50 text-emerald-700",
      aguardando: "border-amber-100 bg-amber-50 text-amber-700",
      pendente: "border-rose-100 bg-rose-50 text-rose-700",
      assinado: "border-violet-100 bg-violet-50 text-violet-700",
      cancelado: "border-slate-200 bg-slate-100 text-slate-600",
    };
    const etapasRelacionadas = procedimentoSelecionado
      ? planoItens.filter((item) => {
          const procedimentoAtual =
            procedimentoSelecionado.procedimento.toLowerCase();
          const planoProcedimento = item.procedimento.toLowerCase();
          const mesmoProcedimento =
            procedimentoAtual.includes(planoProcedimento) ||
            planoProcedimento.includes(procedimentoAtual);
          const mesmoDente =
            procedimentoSelecionado.dente &&
            item.dente &&
            procedimentoSelecionado.dente === item.dente;

          return mesmoProcedimento || mesmoDente;
        })
      : [];
    const contadorCards = [
      {
        label: "Realizados",
        value: procedimentoResumo.realizados,
        icon: CheckCircle2,
        color: "text-emerald-700 bg-emerald-50",
      },
      {
        label: "Em andamento",
        value: procedimentoResumo.emAndamento,
        icon: Clock3,
        color: "text-blue-700 bg-blue-50",
      },
      {
        label: "Planejados",
        value: procedimentoResumo.planejados,
        icon: CalendarClock,
        color: "text-indigo-700 bg-indigo-50",
      },
      {
        label: "Pendentes",
        value: procedimentoResumo.pendentes,
        icon: AlertTriangle,
        color: "text-amber-700 bg-amber-50",
      },
    ];
    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Procedimentos odontologicos
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Registre, acompanhe e assine os procedimentos do paciente.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={novoProcedimento}>
                <span className="inline-flex items-center gap-2">
                  <Plus size={17} />
                  Novo procedimento
                </span>
              </ActionButton>
              <ActionButton variant="secondary" onClick={assinarProcedimento}>
                <span className="inline-flex items-center gap-2">
                  <Save size={17} />
                  Assinar procedimento
                </span>
              </ActionButton>
              <button
                type="button"
                onClick={() =>
                  setMostrarFiltrosProcedimentos((current) => !current)
                }
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-700 transition hover:bg-indigo-50"
                aria-label="Filtros de procedimentos"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {contadorCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-2xl font-black text-slate-950">
                      {card.value}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      {card.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {mostrarFiltrosProcedimentos && (
            <div className="mt-5 grid gap-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="text-xs font-black text-slate-700">
                Status
                <select
                  value={statusProcedimentoFiltro}
                  onChange={(event) =>
                    setStatusProcedimentoFiltro(
                      event.target.value as CliniplusProcedimentoStatus | "todos"
                    )
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option value="todos">Todos</option>
                  {statusProcedimentoOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Categoria
                <select
                  value={categoriaProcedimentoFiltro}
                  onChange={(event) =>
                    setCategoriaProcedimentoFiltro(event.target.value)
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todas</option>
                  {categoriasProcedimento.map((categoria) => (
                    <option key={categoria}>{categoria}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Profissional
                <select
                  value={profissionalProcedimentoFiltro}
                  onChange={(event) =>
                    setProfissionalProcedimentoFiltro(event.target.value)
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todos</option>
                  {profissionaisProcedimentos.map((profissional) => (
                    <option key={profissional}>{profissional}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Periodo
                <select
                  value={periodoProcedimentoFiltro}
                  onChange={(event) =>
                    setPeriodoProcedimentoFiltro(event.target.value)
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todos</option>
                  <option>Ultimos 30 dias</option>
                  <option>Ultimos 90 dias</option>
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Busca
                <input
                  value={buscaProcedimento}
                  onChange={(event) => setBuscaProcedimento(event.target.value)}
                  placeholder="Procedimento ou dente"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                />
              </label>
            </div>
          )}
        </div>

        {editandoProcedimento && (
          <section className="rounded-lg border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {procedimentoDraft.id
                    ? "Editar procedimento"
                    : "Novo procedimento"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Preencha os dados clinicos do procedimento.
                </p>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  variant="secondary"
                  onClick={() => setEditandoProcedimento(false)}
                >
                  Cancelar
                </ActionButton>
                <ActionButton onClick={salvarProcedimento}>
                  Salvar procedimento
                </ActionButton>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InputField
                label="Data"
                type="date"
                value={procedimentoDraft.data}
                onChange={(value) => updateProcedimentoField("data", value)}
              />
              <InputField
                label="Hora"
                type="time"
                value={procedimentoDraft.hora}
                onChange={(value) => updateProcedimentoField("hora", value)}
              />
              <InputField
                label="Procedimento"
                value={procedimentoDraft.procedimento}
                onChange={(value) =>
                  updateProcedimentoField("procedimento", value)
                }
              />
              <InputField
                label="Dente"
                value={procedimentoDraft.dente}
                onChange={(value) => updateProcedimentoField("dente", value)}
              />
              <InputField
                label="Face/Regiao"
                value={procedimentoDraft.faceRegiao}
                onChange={(value) =>
                  updateProcedimentoField("faceRegiao", value)
                }
              />
              <label className="text-sm font-black text-slate-700">
                Categoria
                <select
                  value={procedimentoDraft.categoria}
                  onChange={(event) =>
                    updateProcedimentoField("categoria", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                >
                  {categoriasProcedimento.map((categoria) => (
                    <option key={categoria}>{categoria}</option>
                  ))}
                </select>
              </label>
              <InputField
                label="Profissional"
                value={procedimentoDraft.profissional}
                onChange={(value) =>
                  updateProcedimentoField("profissional", value)
                }
              />
              <label className="text-sm font-black text-slate-700">
                Status
                <select
                  value={procedimentoDraft.status}
                  onChange={(event) =>
                    updateProcedimentoField("status", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                >
                  {statusProcedimentoOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <InputField
                label="Duracao"
                value={procedimentoDraft.duracao}
                onChange={(value) => updateProcedimentoField("duracao", value)}
              />
              <InputField
                label="Valor"
                value={procedimentoDraft.valor}
                onChange={(value) => updateProcedimentoField("valor", value)}
              />
              <div className="md:col-span-2">
                <TextAreaField
                  label="Diagnostico/Indicacao"
                  value={procedimentoDraft.diagnosticoIndicacao}
                  onChange={(value) =>
                    updateProcedimentoField("diagnosticoIndicacao", value)
                  }
                />
              </div>
              <div className="md:col-span-2">
                <TextAreaField
                  label="Materiais utilizados"
                  value={procedimentoDraft.materiaisUtilizados}
                  onChange={(value) =>
                    updateProcedimentoField("materiaisUtilizados", value)
                  }
                />
              </div>
              <TextAreaField
                label="Anestesia"
                value={procedimentoDraft.anestesia}
                onChange={(value) => updateProcedimentoField("anestesia", value)}
              />
              <TextAreaField
                label="Observacoes"
                value={procedimentoDraft.observacoes}
                onChange={(value) =>
                  updateProcedimentoField("observacoes", value)
                }
              />
              <div className="md:col-span-2">
                <TextAreaField
                  label="Conduta"
                  value={procedimentoDraft.conduta}
                  onChange={(value) => updateProcedimentoField("conduta", value)}
                />
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Procedimento</th>
                    <th className="px-4 py-3">Dente</th>
                    <th className="px-4 py-3">Face/Regiao</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Profissional</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Duracao</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {procedimentosFiltrados.map((procedimento) => {
                    const selecionado =
                      procedimentoSelecionado?.id === procedimento.id;

                    return (
                      <tr
                        key={procedimento.id}
                        className={selecionado ? "bg-indigo-50/60" : ""}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {formatDate(procedimento.data)}
                          <span className="block text-xs text-slate-400">
                            {procedimento.hora || "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900">
                          {procedimento.procedimento}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {procedimento.dente || "--"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {procedimento.faceRegiao || "--"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-600">
                            {procedimento.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {procedimento.profissional}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-lg border px-2 py-1 text-xs font-black ${
                              statusClasses[procedimento.status]
                            }`}
                          >
                            {statusProcedimentoLabel(procedimento.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {procedimento.duracao || "--"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {procedimento.valor
                            ? formatMoney(procedimento.valor)
                            : "--"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setProcedimentoSelecionadoId(procedimento.id)
                              }
                              className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"
                              aria-label="Selecionar procedimento"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => editarProcedimento(procedimento)}
                              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                              aria-label="Editar procedimento"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => concluirProcedimento(procedimento)}
                              className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"
                              aria-label="Concluir procedimento"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setProcedimentoSelecionadoId(procedimento.id);
                                const atualizado = updateProcedimento(
                                  procedimento.id,
                                  {
                                    status: "assinado",
                                    assinadoEm: new Date().toISOString(),
                                  }
                                );
                                setProcedimentoSelecionadoId(
                                  atualizado?.id || procedimento.id
                                );
                                setMensagem(
                                  "Procedimento assinado com sucesso."
                                );
                              }}
                              className="rounded-lg p-2 text-violet-700 hover:bg-violet-50"
                              aria-label="Assinar procedimento"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => excluirProcedimento(procedimento)}
                              className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                              aria-label="Excluir procedimento"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!procedimentosFiltrados.length && (
              <div className="p-8 text-center">
                <EmptyState text="Nenhum procedimento encontrado." />
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-950">
                  Detalhes do procedimento
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Selecione um item da tabela para visualizar.
                </p>
              </div>
              {procedimentoSelecionado && (
                <span
                  className={`rounded-lg border px-2 py-1 text-xs font-black ${
                    statusClasses[procedimentoSelecionado.status]
                  }`}
                >
                  {statusProcedimentoLabel(procedimentoSelecionado.status)}
                </span>
              )}
            </div>

            {procedimentoSelecionado ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="font-black text-slate-950">
                    {procedimentoSelecionado.procedimento}
                  </h4>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {formatDate(procedimentoSelecionado.data)} as{" "}
                    {procedimentoSelecionado.hora || "--"}
                  </p>
                  {procedimentoSelecionado.assinadoEm && (
                    <p className="mt-2 text-xs font-black text-violet-700">
                      Assinado em {formatDate(procedimentoSelecionado.assinadoEm)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <DetailLine
                    label="Dente/Regiao"
                    value={joinPieces([
                      procedimentoSelecionado.dente,
                      procedimentoSelecionado.faceRegiao,
                    ])}
                  />
                  <DetailLine
                    label="Categoria"
                    value={procedimentoSelecionado.categoria}
                  />
                  <DetailLine
                    label="Profissional"
                    value={procedimentoSelecionado.profissional}
                  />
                  <DetailLine
                    label="Valor"
                    value={
                      procedimentoSelecionado.valor
                        ? formatMoney(procedimentoSelecionado.valor)
                        : "Nao informado"
                    }
                  />
                </div>

                <DetailBlock
                  label="Diagnostico / Indicacao"
                  value={procedimentoSelecionado.diagnosticoIndicacao}
                />
                <DetailBlock
                  label="Materiais utilizados"
                  value={procedimentoSelecionado.materiaisUtilizados}
                />
                <DetailBlock
                  label="Anestesia"
                  value={procedimentoSelecionado.anestesia}
                />
                <DetailBlock
                  label="Observacoes"
                  value={procedimentoSelecionado.observacoes}
                />
                <DetailBlock
                  label="Conduta"
                  value={procedimentoSelecionado.conduta}
                />

                <div>
                  <p className="text-sm font-black text-slate-950">
                    Etapas relacionadas
                  </p>
                  <div className="mt-3 space-y-2">
                    {etapasRelacionadas.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-xs font-semibold text-indigo-800"
                      >
                        <p className="font-black">{item.procedimento}</p>
                        <p className="mt-1">
                          {[item.fase, item.dente, statusItemLabel(item.status)]
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
                      </div>
                    ))}
                    {!etapasRelacionadas.length && (
                      <EmptyState text="Nenhuma etapa relacionada encontrada." />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState text="Selecione um procedimento para visualizar os detalhes." />
              </div>
            )}
          </aside>
        </div>

      </section>
    );
  }

  function renderExames() {
    const statusClasses: Record<CliniplusExameStatus, string> = {
      solicitado: "border-indigo-100 bg-indigo-50 text-indigo-700",
      pendente: "border-amber-100 bg-amber-50 text-amber-700",
      realizado: "border-emerald-100 bg-emerald-50 text-emerald-700",
      concluido: "border-emerald-100 bg-emerald-50 text-emerald-700",
      alterado: "border-blue-100 bg-blue-50 text-blue-700",
      revisao: "border-violet-100 bg-violet-50 text-violet-700",
      assinado: "border-cyan-100 bg-cyan-50 text-cyan-700",
      cancelado: "border-slate-200 bg-slate-100 text-slate-600",
    };
    const contadorCards = [
      {
        label: "Realizados",
        value: exameResumo.realizados,
        icon: CheckCircle2,
        color: "text-emerald-700 bg-emerald-50",
      },
      {
        label: "Pendentes",
        value: exameResumo.pendentes,
        icon: Clock3,
        color: "text-blue-700 bg-blue-50",
      },
      {
        label: "Alterados",
        value: exameResumo.alterados,
        icon: AlertTriangle,
        color: "text-amber-700 bg-amber-50",
      },
      {
        label: "Anexados",
        value: exameResumo.anexados,
        icon: FileText,
        color: "text-indigo-700 bg-indigo-50",
      },
    ];
    const renderPreVisualizacaoArquivo = (exame: CliniplusExame) => {
      if (!exame.arquivoNome) {
        return <EmptyState text="Nenhum arquivo anexado." />;
      }

      if (isImageFile(exame) && exame.arquivoUrl) {
        return (
          <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
            <ArquivoImagem
              url={exame.arquivoUrl}
              alt={`Pre-visualizacao de ${exame.arquivoNome}`}
              className="max-h-64 w-full object-contain"
            />
          </div>
        );
      }

      const pdf = isPdfFile(exame);

      return (
        <div className="mt-2 flex h-44 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-800 p-4 text-center text-xs font-bold text-slate-100">
          <div>
            <FileText className="mx-auto mb-3" size={30} />
            <p className="font-black">
              {pdf ? "PDF anexado" : exame.arquivoNome}
            </p>
            {pdf && <p className="mt-1 text-slate-300">{exame.arquivoNome}</p>}
            <p className="mt-2 text-slate-300">Pre-visualizacao do arquivo</p>
          </div>
        </div>
      );
    };

    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Exames odontológicos
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Solicite, anexe, acompanhe e assine laudos do paciente.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={novoExame}>
                <span className="inline-flex items-center gap-2">
                  <Plus size={17} />
                  + Novo exame
                </span>
              </ActionButton>
              <ActionButton variant="secondary" onClick={assinarLaudo}>
                Assinar laudo
              </ActionButton>
              <button
                type="button"
                onClick={() => setMostrarFiltrosExames((current) => !current)}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-700 transition hover:bg-indigo-50"
                aria-label="Filtros de exames"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {contadorCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color}`}
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="text-2xl font-black text-slate-950">
                      {card.value}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      {card.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {mostrarFiltrosExames && (
            <div className="mt-5 grid gap-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 md:grid-cols-2 xl:grid-cols-6">
              <label className="text-xs font-black text-slate-700">
                Status
                <select
                  value={statusExameFiltro}
                  onChange={(event) =>
                    setStatusExameFiltro(
                      event.target.value as CliniplusExameStatus | "todos"
                    )
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option value="todos">Todos</option>
                  {statusExameOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Categoria
                <select
                  value={categoriaExameFiltro}
                  onChange={(event) => setCategoriaExameFiltro(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todas</option>
                  {categoriasExame.map((categoria) => (
                    <option key={categoria}>{categoria}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Profissional
                <select
                  value={profissionalExameFiltro}
                  onChange={(event) =>
                    setProfissionalExameFiltro(event.target.value)
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todos</option>
                  {profissionaisExames.map((profissional) => (
                    <option key={profissional}>{profissional}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Origem
                <select
                  value={origemExameFiltro}
                  onChange={(event) =>
                    setOrigemExameFiltro(
                      event.target.value as CliniplusExameOrigem | "todos"
                    )
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option value="todos">Todas</option>
                  {origemExameOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Periodo
                <select
                  value={periodoExameFiltro}
                  onChange={(event) => setPeriodoExameFiltro(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todos</option>
                  <option>Ultimos 30 dias</option>
                  <option>Ultimos 90 dias</option>
                </select>
              </label>
              <label className="text-xs font-black text-slate-700">
                Busca
                <input
                  value={buscaExame}
                  onChange={(event) => setBuscaExame(event.target.value)}
                  placeholder="Exame, dente ou região"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                />
              </label>
            </div>
          )}
        </div>

        {editandoExame && (
          <section className="rounded-lg border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {exameDraft.id ? "Editar exame" : "Novo exame"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Preencha os dados do exame odontológico.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Para solicitar um exame, cadastre como Novo exame e selecione o status Solicitado.
                </p>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  variant="secondary"
                  onClick={() => setEditandoExame(false)}
                >
                  Cancelar
                </ActionButton>
                <ActionButton onClick={salvarExame}>Salvar exame</ActionButton>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InputField
                label="Data"
                type="date"
                value={exameDraft.data}
                onChange={(value) => updateExameField("data", value)}
              />
              <InputField
                label="Hora"
                type="time"
                value={exameDraft.hora}
                onChange={(value) => updateExameField("hora", value)}
              />
              <InputField
                label="Exame"
                value={exameDraft.exame}
                onChange={(value) => updateExameField("exame", value)}
              />
              <InputField
                label="Dente"
                value={exameDraft.dente}
                onChange={(value) => updateExameField("dente", value)}
              />
              <InputField
                label="Região"
                value={exameDraft.regiao}
                onChange={(value) => updateExameField("regiao", value)}
              />
              <label className="text-sm font-black text-slate-700">
                Categoria
                <select
                  value={exameDraft.categoria}
                  onChange={(event) =>
                    updateExameField("categoria", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                >
                  {categoriasExame.map((categoria) => (
                    <option key={categoria}>{categoria}</option>
                  ))}
                </select>
              </label>
              <InputField
                label="Profissional solicitante/responsável"
                value={exameDraft.profissional}
                onChange={(value) => updateExameField("profissional", value)}
              />
              <label className="text-sm font-black text-slate-700">
                Status
                <select
                  value={exameDraft.status}
                  onChange={(event) =>
                    updateExameField("status", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                >
                  {statusExameOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-black text-slate-700">
                Origem
                <select
                  value={exameDraft.origem}
                  onChange={(event) =>
                    updateExameField("origem", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                >
                  {origemExameOptions.map((origem) => (
                    <option key={origem.value} value={origem.value}>
                      {origem.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2 xl:col-span-4">
                <p className="text-sm font-black text-slate-950">
                  Arquivo do exame
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                  <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-white text-center text-sm font-black text-indigo-700 transition hover:bg-indigo-50">
                    <Upload size={20} />
                    <span className="mt-2">Adicionar arquivo</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(event) =>
                        selecionarArquivoNovoExame(
                          event.target.files?.[0] ?? null
                        )
                      }
                    />
                  </label>
                  <div className="flex min-h-24 items-center rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600">
                    {exameDraft.arquivoNome ? (
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-950">
                          {exameDraft.arquivoNome}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {joinPieces([
                            exameDraft.arquivoTipo,
                            exameDraft.arquivoTamanho,
                          ])}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Nenhum arquivo selecionado.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <TextAreaField
                  label="Achados/Observações"
                  value={exameDraft.achados || exameDraft.observacoes}
                  onChange={(value) => {
                    updateExameField("achados", value);
                    updateExameField("observacoes", value);
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <TextAreaField
                  label="Laudo"
                  value={exameDraft.laudo}
                  onChange={(value) => updateExameField("laudo", value)}
                />
              </div>
            </div>
          </section>
        )}

        {anexandoArquivoExameId && (
          <section className="rounded-lg border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Anexar arquivo
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {exameParaAnexar
                    ? `Arquivo vinculado a ${exameParaAnexar.exame}.`
                    : "Informe os dados do arquivo do exame."}
                </p>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  variant="secondary"
                  onClick={() => {
                    setAnexandoArquivoExameId("");
                    setArquivoExameDraft(createArquivoExameDraft());
                  }}
                >
                  Cancelar
                </ActionButton>
                <ActionButton onClick={salvarArquivoExame}>
                  Salvar arquivo
                </ActionButton>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 p-4 text-center text-sm font-black text-indigo-700 transition hover:bg-indigo-50 md:col-span-2">
                <Upload size={22} />
                <span className="mt-2">Adicionar arquivo</span>
                <span className="mt-1 text-xs font-semibold text-indigo-500">
                  Selecione o arquivo do exame.
                </span>
                <input
                  type="file"
                  className="sr-only"
                  onChange={(event) =>
                    selecionarArquivoExame(event.target.files?.[0] ?? null)
                  }
                />
              </label>

              <div className="flex min-h-28 items-center rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600 md:col-span-2">
                {arquivoExameDraft.arquivoNome ? (
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">
                      {arquivoExameDraft.arquivoNome}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {joinPieces([
                        arquivoExameDraft.arquivoTipo,
                        arquivoExameDraft.arquivoTamanho,
                      ])}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Nenhum arquivo selecionado.
                  </p>
                )}
              </div>
              <div className="md:col-span-2 xl:col-span-4">
                <TextAreaField
                  label="Observacao do arquivo"
                  value={arquivoExameDraft.arquivoObservacao}
                  onChange={(value) =>
                    updateArquivoExameField("arquivoObservacao", value)
                  }
                />
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Exame</th>
                    <th className="px-4 py-3">Dente/Região</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Profissional</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Origem</th>
                    <th className="px-4 py-3">Arquivo</th>
                    <th className="px-4 py-3">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {examesFiltrados.map((exame) => {
                    const selecionado = exameSelecionado?.id === exame.id;

                    return (
                      <tr key={exame.id} className={selecionado ? "bg-indigo-50/60" : ""}>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {formatDate(exame.data)}
                          <span className="block text-xs text-slate-400">
                            {exame.hora || "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900">
                          {exame.exame}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {joinPieces([exame.dente, exame.regiao])}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-600">
                            {exame.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {exame.profissional}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-lg border px-2 py-1 text-xs font-black ${statusClasses[exame.status]}`}
                          >
                            {statusExameLabel(exame.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {origemExameLabel(exame.origem)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">
                          {exame.arquivoNome ? (
                            <span className="inline-flex max-w-36 items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-700">
                              <Paperclip size={14} />
                              <span className="truncate">
                                {exame.arquivoNome.length > 18
                                  ? `${exame.arquivoNome.slice(0, 18)}...`
                                  : exame.arquivoNome || "Anexado"}
                              </span>
                            </span>
                          ) : (
                            "--"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuExameAbertoId((current) =>
                                  current === exame.id ? "" : exame.id
                                );
                              }}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                              aria-label="Acoes do exame"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            {menuExameAbertoId === exame.id && (
                              <div className="mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 text-xs font-black text-slate-700 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExameSelecionadoId(exame.id);
                                    setMenuExameAbertoId("");
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                  <Eye size={14} />
                                  Ver detalhes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    editarExame(exame);
                                    setMenuExameAbertoId("");
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-50"
                                >
                                  <Edit3 size={14} />
                                  Editar exame
                                </button>
                                <button
                                  type="button"
                                  onClick={() => anexarArquivoExame(exame)}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <Paperclip size={14} />
                                  Anexar arquivo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    concluirExame(exame);
                                    setMenuExameAbertoId("");
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-700"
                                >
                                  <CheckCircle2 size={14} />
                                  Concluir exame
                                </button>
                                <button
                                  type="button"
                                  onClick={() => assinarExame(exame)}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-violet-50 hover:text-violet-700"
                                >
                                  <Save size={14} />
                                  Assinar laudo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    excluirExame(exame);
                                    setMenuExameAbertoId("");
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-rose-50 hover:text-rose-700"
                                >
                                  <Trash2 size={14} />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!examesFiltrados.length && (
              <div className="p-8 text-center">
                <EmptyState text="Nenhum exame encontrado." />
              </div>
            )}

            <div className="border-t border-slate-100 p-5">
              <h3 className="font-black text-slate-950">
                Histórico recente de exames
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {exames.slice(0, 4).map((exame) => (
                  <div
                    key={`hist-${exame.id}`}
                    className="rounded-lg border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-600"
                  >
                    <p className="font-black text-slate-950">
                      {formatDate(exame.data)} - {exame.hora || "--"}
                    </p>
                    <p className="mt-2 font-black text-indigo-700">{exame.exame}</p>
                    <p className="mt-1">{joinPieces([exame.dente, exame.regiao])}</p>
                    <p className="mt-1">{statusExameLabel(exame.status)}</p>
                  </div>
                ))}
                {!exames.length && (
                  <EmptyState text="Nenhum exame no historico recente." />
                )}
              </div>
            </div>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-950">Detalhes do exame</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Selecione um item da tabela para visualizar.
                </p>
              </div>
              {exameSelecionado && (
                <span
                  className={`rounded-lg border px-2 py-1 text-xs font-black ${statusClasses[exameSelecionado.status]}`}
                >
                  {statusExameLabel(exameSelecionado.status)}
                </span>
              )}
            </div>

            {exameSelecionado ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <h4 className="font-black text-slate-950">
                    {exameSelecionado.exame}
                  </h4>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {formatDate(exameSelecionado.data)} as{" "}
                    {exameSelecionado.hora || "--"}
                  </p>
                  {exameSelecionado.assinadoEm && (
                    <p className="mt-2 text-xs font-black text-violet-700">
                      Laudo assinado em {formatDate(exameSelecionado.assinadoEm)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <DetailLine
                    label="Dente/Região"
                    value={joinPieces([exameSelecionado.dente, exameSelecionado.regiao])}
                  />
                  <DetailLine label="Categoria" value={exameSelecionado.categoria} />
                  <DetailLine
                    label="Profissional"
                    value={exameSelecionado.profissional}
                  />
                  <DetailLine
                    label="Origem"
                    value={origemExameLabel(exameSelecionado.origem)}
                  />
                </div>

                <DetailBlock
                  label="Achados / Observações"
                  value={exameSelecionado.achados || exameSelecionado.observacoes}
                />
                <DetailBlock label="Laudo" value={exameSelecionado.laudo} />

                <div>
                  <p className="text-sm font-black text-slate-950">
                    Arquivo anexado
                  </p>
                  {exameSelecionado.arquivoNome ? (
                    <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">
                      <p className="font-black">{exameSelecionado.arquivoNome}</p>
                      <p className="mt-1">
                        {joinPieces([
                          exameSelecionado.arquivoTipo,
                          exameSelecionado.arquivoTamanho,
                        ])}
                      </p>
                      {exameSelecionado.arquivoAnexadoEm && (
                        <p className="mt-1 text-xs text-indigo-600">
                          Anexado em {formatDate(exameSelecionado.arquivoAnexadoEm)}
                        </p>
                      )}
                      {exameSelecionado.arquivoObservacao && (
                        <p className="mt-2 text-xs text-indigo-700">
                          {exameSelecionado.arquivoObservacao}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => baixarArquivoExame(exameSelecionado)}
                          className="rounded-lg bg-white px-3 py-2 text-xs font-black text-indigo-700"
                        >
                          Baixar
                        </button>
                        <button
                          type="button"
                          onClick={() => visualizarArquivoExame(exameSelecionado)}
                          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-black text-white"
                        >
                          Visualizar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState text="Nenhum arquivo anexado." />
                  )}
                </div>

                <div>
                  <p className="text-sm font-black text-slate-950">
                    Pre-visualizacao
                  </p>
                  {renderPreVisualizacaoArquivo(exameSelecionado)}
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState text="Selecione um exame para visualizar os detalhes." />
              </div>
            )}
          </aside>
        </div>

        {exameParaVisualizar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Visualizar arquivo
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {exameParaVisualizar.arquivoNome}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVisualizandoArquivoExameId("")}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Fechar visualizacao"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <DetailLine
                  label="Tipo"
                  value={exameParaVisualizar.arquivoTipo}
                />
                <DetailLine
                  label="Tamanho"
                  value={exameParaVisualizar.arquivoTamanho}
                />
                <DetailLine
                  label="Anexado em"
                  value={
                    exameParaVisualizar.arquivoAnexadoEm
                      ? formatDate(exameParaVisualizar.arquivoAnexadoEm)
                      : ""
                  }
                />
              </div>

              <div className="mt-4">
                <DetailBlock
                  label="Observacao"
                  value={exameParaVisualizar.arquivoObservacao}
                />
              </div>

              <div className="mt-4">
                <p className="text-sm font-black text-slate-950">
                  Pre-visualizacao
                </p>
                {renderPreVisualizacaoArquivo(exameParaVisualizar)}
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  function renderDocumentos() {
    const statusClasses: Record<string, string> = {
      ativo: "border-emerald-100 bg-emerald-50 text-emerald-700",
      arquivado: "border-slate-200 bg-slate-100 text-slate-600",
      pendente: "border-amber-100 bg-amber-50 text-amber-700",
      assinado: "border-violet-100 bg-violet-50 text-violet-700",
    };
    const categoriaClasses: Record<string, string> = {
      Consentimentos: "border-violet-100 bg-violet-50 text-violet-700",
      Financeiro: "border-cyan-100 bg-cyan-50 text-cyan-700",
      "Exames de imagem": "border-blue-100 bg-blue-50 text-blue-700",
      Laudos: "border-indigo-100 bg-indigo-50 text-indigo-700",
      "Documentos pessoais": "border-amber-100 bg-amber-50 text-amber-700",
      Tratamento: "border-emerald-100 bg-emerald-50 text-emerald-700",
      Anamnese: "border-slate-200 bg-slate-50 text-slate-700",
      Outros: "border-slate-200 bg-slate-50 text-slate-700",
    };
    const tipoClasses: Record<string, string> = {
      pdf: "border-rose-100 bg-rose-50 text-rose-700",
      imagem: "border-blue-100 bg-blue-50 text-blue-700",
      planilha: "border-emerald-100 bg-emerald-50 text-emerald-700",
      documento: "border-indigo-100 bg-indigo-50 text-indigo-700",
      outro: "border-amber-100 bg-amber-50 text-amber-700",
    };
    const inicioPagina = documentosFiltrados.length
      ? (paginaDocumentosAtual - 1) * 8 + 1
      : 0;
    const fimPagina = Math.min(
      paginaDocumentosAtual * 8,
      documentosFiltrados.length
    );

    function documentoIconLabel(documento: CliniplusDocumento) {
      const tipo = normalizarTipoDocumento(
        documento.tipo,
        documento.extensao || documento.formato
      );

      if (tipo === "pdf") return "PDF";
      if (tipo === "imagem") return "IMG";
      if (tipo === "planilha") return "XLS";
      if (tipo === "documento") return "DOC";
      return "ARQ";
    }

    function renderPreVisualizacaoDocumento(documento: CliniplusDocumento) {
      const tipo = normalizarTipoDocumento(
        documento.tipo,
        documento.extensao || documento.formato
      );

      const urlDocumento =
        documento.urlSimulada || (documento.arquivoId ? referenciaArquivo(documento.arquivoId) : "");

      if (tipo === "imagem" && urlDocumento) {
        return (
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
            <ArquivoImagem
              url={urlDocumento}
              alt={`Pre-visualizacao de ${documento.nome}`}
              className="max-h-80 w-full object-contain"
            />
          </div>
        );
      }

      return (
        <div className="mt-3 flex min-h-56 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-600">
          <div>
            <FileText className="mx-auto mb-3 text-indigo-700" size={34} />
            <p className="font-black text-slate-950">{documento.nome}</p>
            <p className="mt-1 text-xs text-slate-500">
              {joinPieces([
                documentoTipoLabel(documento.tipo),
                documento.extensao || documento.formato,
                documento.tamanho,
              ])}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Pre-visualizacao registrada para o prontuario.
            </p>
          </div>
        </div>
      );
    }

    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Documentos do paciente
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Armazene e gerencie documentos importantes do paciente de forma segura.
              </p>
            </div>
            <ActionButton onClick={novoDocumento}>
              <span className="inline-flex items-center gap-2">
                <Plus size={17} />
                + Novo documento
              </span>
            </ActionButton>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_200px_240px_220px]">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={buscaDocumento}
                onChange={(event) => setBuscaDocumento(event.target.value)}
                placeholder="Buscar documento..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block">
              <span className="sr-only">Tipo</span>
              <select
                value={tipoDocumentoFiltro}
                onChange={(event) => setTipoDocumentoFiltro(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="todos">Tipo: Todos</option>
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    Tipo: {tipo.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Categoria</span>
              <select
                value={categoriaDocumentoFiltro}
                onChange={(event) => setCategoriaDocumentoFiltro(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Todas">Categoria: Todas</option>
                {categoriasDocumento.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    Categoria: {categoria}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Ordenar por</span>
              <select
                value={ordenacaoDocumento}
                onChange={(event) => setOrdenacaoDocumento(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                <option>Mais recentes</option>
                <option>Mais antigos</option>
                <option>Nome A-Z</option>
                <option>Nome Z-A</option>
              </select>
            </label>
          </div>
        </div>

        {editandoDocumento && (
          <section className="rounded-lg border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {documentoDraft.id ? "Editar documento" : "Novo documento"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Selecione um arquivo e revise as informacoes antes de salvar.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  variant="secondary"
                  onClick={() => {
                    setEditandoDocumento(false);
                    setDocumentoDraft(createDocumentoDraft());
                  }}
                >
                  Cancelar
                </ActionButton>
                <ActionButton onClick={salvarDocumento}>
                  Salvar documento
                </ActionButton>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 p-5 text-center text-sm font-black text-indigo-700 transition hover:bg-indigo-50">
                <Upload size={24} />
                <span className="mt-2">Adicionar arquivo</span>
                <span className="mt-1 text-xs font-semibold text-indigo-500">
                  PDF, imagem, planilha ou documento.
                </span>
                <input
                  type="file"
                  className="sr-only"
                  onChange={(event) =>
                    selecionarArquivoDocumento(event.target.files?.[0] ?? null)
                  }
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InputField
                  label="Nome do documento"
                  value={documentoDraft.nome}
                  onChange={(value) => updateDocumentoDraftField("nome", value)}
                />
                <label className="text-sm font-black text-slate-700">
                  Categoria
                  <select
                    value={documentoDraft.categoria}
                    onChange={(event) =>
                      updateDocumentoDraftField("categoria", event.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                  >
                    {categoriasDocumento.map((categoria) => (
                      <option key={categoria}>{categoria}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-black text-slate-700">
                  Tipo do arquivo
                  <select
                    value={documentoDraft.tipo}
                    onChange={(event) =>
                      updateDocumentoDraftField("tipo", event.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                  >
                    {tiposDocumento.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </label>
                <InputField
                  label="Extensao"
                  value={documentoDraft.extensao}
                  onChange={(value) =>
                    updateDocumentoDraftField("extensao", value)
                  }
                />
                <InputField
                  label="Tamanho do arquivo"
                  value={documentoDraft.tamanho}
                  onChange={(value) =>
                    updateDocumentoDraftField("tamanho", value)
                  }
                />
                <InputField
                  label="Enviado por"
                  value={documentoDraft.enviadoPor}
                  onChange={(value) =>
                    updateDocumentoDraftField("enviadoPor", value)
                  }
                />
                <InputField
                  label="Data de envio"
                  type="date"
                  value={documentoDraft.dataEnvio}
                  onChange={(value) =>
                    updateDocumentoDraftField("dataEnvio", value)
                  }
                />
                <InputField
                  label="Hora de envio"
                  type="time"
                  value={documentoDraft.horaEnvio}
                  onChange={(value) =>
                    updateDocumentoDraftField("horaEnvio", value)
                  }
                />
                <label className="text-sm font-black text-slate-700">
                  Status
                  <select
                    value={documentoDraft.status}
                    onChange={(event) =>
                      updateDocumentoDraftField("status", event.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                  >
                    {statusDocumentoOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="md:col-span-2 xl:col-span-3">
                  <TextAreaField
                    label="Observacoes"
                    value={documentoDraft.observacoes}
                    rows={3}
                    onChange={(value) =>
                      updateDocumentoDraftField("observacoes", value)
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Data de envio</th>
                  <th className="px-4 py-3">Enviado por</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentosPaginados.map((documento) => {
                  const categoria = documento.categoria || documento.origem || "Outros";
                  const tipo = normalizarTipoDocumento(
                    documento.tipo,
                    documento.extensao || documento.formato
                  );
                  const status = documento.status || "ativo";

                  return (
                    <tr key={String(documento.id)} className="align-top">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${tipoClasses[tipo] || tipoClasses.outro}`}
                          >
                            {documentoIconLabel(documento)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-black text-slate-950">
                              {documento.nome}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {joinPieces([
                                documento.extensao || documento.formato,
                                documento.tamanho,
                              ])}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg border px-2 py-1 text-xs font-black ${categoriaClasses[categoria] || categoriaClasses.Outros}`}
                        >
                          {categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {documentoTipoLabel(tipo)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {formatDate(documento.dataEnvio || documento.data)}
                        <span className="block text-xs text-slate-400">
                          {documento.horaEnvio || "--"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">
                        {documento.enviadoPor || "Nao informado"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg border px-2 py-1 text-xs font-black ${statusClasses[status] || statusClasses.ativo}`}
                        >
                          {statusDocumentoOptions.find((item) => item.value === status)
                            ?.label || status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => baixarDocumento(documento)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-indigo-700 hover:bg-indigo-50"
                            aria-label="Baixar documento"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setMenuDocumentoAbertoId((current) =>
                                current === String(documento.id)
                                  ? ""
                                  : String(documento.id)
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            aria-label="Acoes do documento"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {menuDocumentoAbertoId === String(documento.id) && (
                            <div className="absolute right-0 top-9 z-20 w-52 rounded-lg border border-slate-200 bg-white p-1 text-xs font-black text-slate-700 shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setVisualizandoDocumentoId(String(documento.id));
                                  setMenuDocumentoAbertoId("");
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                <Eye size={14} />
                                Visualizar
                              </button>
                              <button
                                type="button"
                                onClick={() => editarDocumento(documento)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-50"
                              >
                                <Edit3 size={14} />
                                Editar informacoes
                              </button>
                              <button
                                type="button"
                                onClick={() => baixarDocumento(documento)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Download size={14} />
                                Baixar
                              </button>
                              <button
                                type="button"
                                onClick={() => arquivarDocumento(documento)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-700"
                              >
                                <Archive size={14} />
                                Arquivar
                              </button>
                              <button
                                type="button"
                                onClick={() => excluirDocumento(documento)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 size={14} />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!documentosPaginados.length && (
                  <tr>
                    <td className="px-4 py-8 text-center" colSpan={7}>
                      <EmptyState text="Nenhum documento encontrado." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 md:flex-row md:items-center">
            <span>
              Mostrando {inicioPagina} a {fimPagina} de{" "}
              {documentosFiltrados.length} documentos
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPaginaDocumentos((current) => Math.max(1, current - 1))
                }
                disabled={paginaDocumentosAtual === 1}
                className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              {Array.from({ length: totalPaginasDocumentos }).map((_, index) => {
                const pagina = index + 1;

                return (
                  <button
                    key={pagina}
                    type="button"
                    onClick={() => setPaginaDocumentos(pagina)}
                    className={
                      pagina === paginaDocumentosAtual
                        ? "h-9 min-w-9 rounded-lg bg-indigo-600 px-3 text-xs font-black text-white"
                        : "h-9 min-w-9 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700"
                    }
                  >
                    {pagina}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setPaginaDocumentos((current) =>
                    Math.min(totalPaginasDocumentos, current + 1)
                  )
                }
                disabled={paginaDocumentosAtual === totalPaginasDocumentos}
                className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Proxima
              </button>
            </div>
          </div>
        </section>

        {documentoVisualizado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-3xl rounded-lg bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Visualizar documento
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {documentoVisualizado.nome}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVisualizandoDocumentoId("")}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Fechar visualizacao"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                <DetailLine
                  label="Categoria"
                  value={documentoVisualizado.categoria || documentoVisualizado.origem}
                />
                <DetailLine
                  label="Tipo"
                  value={documentoTipoLabel(documentoVisualizado.tipo)}
                />
                <DetailLine
                  label="Data"
                  value={formatDate(
                    documentoVisualizado.dataEnvio || documentoVisualizado.data
                  )}
                />
                <DetailLine
                  label="Enviado por"
                  value={documentoVisualizado.enviadoPor}
                />
              </div>

              <div className="mt-4">
                <DetailBlock
                  label="Observacoes"
                  value={
                    documentoVisualizado.observacoes ||
                    documentoVisualizado.observacao
                  }
                />
              </div>

              {renderPreVisualizacaoDocumento(documentoVisualizado)}

              <div className="mt-4 flex justify-end gap-2">
                <ActionButton
                  variant="secondary"
                  onClick={() => baixarDocumento(documentoVisualizado)}
                >
                  Baixar
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    editarDocumento(documentoVisualizado);
                    setVisualizandoDocumentoId("");
                  }}
                >
                  Editar informacoes
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  function renderAnamnese() {
    if (editandoAnamnese) {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Editar anamnese
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Preencha os campos clinicos desta etapa do prontuario.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton
                variant="secondary"
                onClick={() => setEditandoAnamnese(false)}
              >
                Cancelar
              </ActionButton>
              <ActionButton onClick={salvarAnamnese}>Salvar anamnese</ActionButton>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <TextAreaField
              label="Identificacao da queixa principal"
              value={anamneseDraft.identificacaoQueixaPrincipal}
              onChange={(value) =>
                updateAnamneseField("identificacaoQueixaPrincipal", value)
              }
            />
            <TextAreaField
              label="Historia da doenca atual"
              value={anamneseDraft.historiaDoencaAtual}
              onChange={(value) =>
                updateAnamneseField("historiaDoencaAtual", value)
              }
            />
            <TextAreaField
              label="Historico medico"
              value={anamneseDraft.historicoMedico}
              onChange={(value) => updateAnamneseField("historicoMedico", value)}
            />
            <TextAreaField
              label="Historico odontologico"
              value={anamneseDraft.historicoOdontologico}
              onChange={(value) =>
                updateAnamneseField("historicoOdontologico", value)
              }
            />
            <TextAreaField
              label="Alergias"
              value={anamneseDraft.alergias}
              onChange={(value) => updateAnamneseField("alergias", value)}
            />
            <TextAreaField
              label="Medicamentos em uso"
              value={anamneseDraft.medicamentosUso}
              onChange={(value) => updateAnamneseField("medicamentosUso", value)}
            />
            <TextAreaField
              label="Habitos e vicios"
              value={anamneseDraft.habitosVicios}
              onChange={(value) => updateAnamneseField("habitosVicios", value)}
            />
            <TextAreaField
              label="Antecedentes familiares"
              value={anamneseDraft.antecedentesFamiliares}
              onChange={(value) =>
                updateAnamneseField("antecedentesFamiliares", value)
              }
            />
            <div className="lg:col-span-2">
              <TextAreaField
                label="Observacoes complementares"
                value={anamneseDraft.observacoesComplementares}
                onChange={(value) =>
                  updateAnamneseField("observacoesComplementares", value)
                }
              />
            </div>
          </div>
        </section>
      );
    }

    const preenchida = Object.values(anamnese).some((value) => value.trim());

    return (
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-black text-slate-950">Anamnese</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Dados clinicos estruturados do atendimento odontologico.
            </p>
          </div>
          <ActionButton onClick={abrirEdicaoAnamnese}>
            {preenchida ? "Editar anamnese" : "Preencher anamnese"}
          </ActionButton>
        </div>

        <div className="grid overflow-hidden lg:grid-cols-3">
          <AnamneseBlock
            title="Identificacao da queixa principal"
            icon={<Bell size={20} />}
            value={anamnese.identificacaoQueixaPrincipal}
          />
          <AnamneseBlock
            title="Historia da doenca atual"
            icon={<ClipboardList size={20} />}
            value={anamnese.historiaDoencaAtual}
          />
          <AnamneseBlock
            title="Historico medico"
            icon={<Stethoscope size={20} />}
            value={anamnese.historicoMedico}
          />
          <AnamneseBlock
            title="Historico odontologico"
            icon={<Smile size={20} />}
            value={anamnese.historicoOdontologico}
          />
          <AnamneseBlock
            title="Alergias"
            icon={<AlertTriangle size={20} />}
            value={anamnese.alergias}
          />
          <AnamneseBlock
            title="Medicamentos em uso"
            icon={<Pill size={20} />}
            value={anamnese.medicamentosUso}
          />
          <AnamneseBlock
            title="Habitos e vicios"
            icon={<Activity size={20} />}
            value={anamnese.habitosVicios}
          />
          <AnamneseBlock
            title="Antecedentes familiares"
            icon={<UsersRound size={20} />}
            value={anamnese.antecedentesFamiliares}
          />
          <AnamneseBlock
            title="Observacoes complementares"
            icon={<FileText size={20} />}
            value={anamnese.observacoesComplementares}
          />
        </div>
      </section>
    );
  }

  function renderPlanoTratamento() {
    const planoExiste = Boolean(planoTratamento);
    const statusBadge =
      planoTratamento?.status === "aprovado"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-indigo-200 bg-indigo-50 text-indigo-700";

    function StatusPill({ status }: { status: PlanoTratamentoItem["status"] }) {
      const classes = {
        planejado: "border-indigo-100 bg-indigo-50 text-indigo-700",
        aguardando: "border-amber-100 bg-amber-50 text-amber-700",
        em_andamento: "border-blue-100 bg-blue-50 text-blue-700",
        concluido: "border-emerald-100 bg-emerald-50 text-emerald-700",
        cancelado: "border-slate-200 bg-slate-100 text-slate-600",
      };

      return (
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${classes[status]}`}
        >
          {statusItemLabel(status)}
        </span>
      );
    }

    function PrioridadePill({
      prioridade,
    }: {
      prioridade: PlanoTratamentoItem["prioridade"];
    }) {
      const classes = {
        baixa: "bg-emerald-500",
        media: "bg-amber-500",
        alta: "bg-red-500",
      };

      return (
        <span className="inline-flex items-center gap-2 font-black text-slate-700">
          <span className={`h-2 w-2 rounded-full ${classes[prioridade]}`} />
          {prioridadeLabel(prioridade)}
        </span>
      );
    }

    if (!planoExiste) {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-black text-slate-950">
            Plano de tratamento odontologico
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-500">
            Nenhum plano foi criado para este paciente. Crie um plano para
            organizar fases, valores, previsoes e progresso do tratamento.
          </p>
          <div className="mt-6 flex justify-center">
            <ActionButton onClick={criarPlanoTratamento}>
              Criar plano de tratamento
            </ActionButton>
          </div>
        </section>
      );
    }

    if (searchParams.get("modo") === "orcamento") {
      return (
        <PacientePlanoOrcamento
          paciente={paciente}
          planoTratamento={planoTratamento}
          voltarHref={`/pacientes/${pacienteId}?aba=prontuario&secao=plano`}
        />
      );
    }

    if (searchParams.get("modo") === "impressao") {
      return (
        <PacientePlanoImpressao
          paciente={paciente}
          planoTratamento={planoTratamento}
          voltarHref={`/pacientes/${pacienteId}?aba=prontuario&secao=plano`}
          observacoesClinicas={[
            planoTratamento.observacoes,
            resumo.observacoesImportantes,
            ...planoItens.map((item) => item.observacoes),
          ]}
        />
      );
    }

    return (
      <section className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black text-slate-950">
                  Plano de tratamento odontologico
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${statusBadge}`}
                >
                  {statusPlanoLabel(planoTratamento.status)}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Fases, procedimentos, valores e progresso do plano clinico.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton onClick={() => abrirNovoItemPlano()}>
                + Novo item
              </ActionButton>
              <ActionButton variant="secondary" onClick={gerarOrcamentoPlano}>
                Gerar orcamento
              </ActionButton>
              <ActionButton variant="secondary" onClick={imprimirPlanoTratamento}>
                Imprimir plano
              </ActionButton>
              <ActionButton onClick={aprovarPlanoTratamento}>Aprovar</ActionButton>
            </div>
          </div>
        </div>

        {editandoPlanoItem && (
          <section className="rounded-lg border border-indigo-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {planoItemDraft.id ? "Editar item" : "Novo item do plano"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Informe os dados do procedimento e salve para recalcular o
                  plano.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ActionButton variant="secondary" onClick={cancelarItemPlano}>
                  Cancelar
                </ActionButton>
                <ActionButton onClick={salvarItemPlano}>Salvar item</ActionButton>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-black text-slate-800">Fase</span>
                <select
                  value={planoItemDraft.fase}
                  onChange={(event) =>
                    updatePlanoItemField("fase", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
                >
                  {fasesPlanoTratamento.map((fase) => (
                    <option key={fase.id} value={fase.id}>
                      {fase.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block lg:col-span-2">
                <span className="text-sm font-black text-slate-800">
                  Procedimento
                </span>
                <input
                  value={planoItemDraft.procedimento}
                  onChange={(event) =>
                    updatePlanoItemField("procedimento", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-800">
                  Dente/regiao
                </span>
                <input
                  value={planoItemDraft.dente}
                  onChange={(event) =>
                    updatePlanoItemField("dente", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-800">
                  Prioridade
                </span>
                <select
                  value={planoItemDraft.prioridade}
                  onChange={(event) =>
                    updatePlanoItemField("prioridade", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
                >
                  {prioridadesPlano.map((prioridade) => (
                    <option key={prioridade.value} value={prioridade.value}>
                      {prioridade.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-800">Status</span>
                <select
                  value={planoItemDraft.status}
                  onChange={(event) =>
                    updatePlanoItemField("status", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
                >
                  {statusItensPlano.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-800">
                  Profissional
                </span>
                <input
                  value={planoItemDraft.profissional}
                  onChange={(event) =>
                    updatePlanoItemField("profissional", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-800">Valor</span>
                <input
                  value={planoItemDraft.valor}
                  onChange={(event) =>
                    updatePlanoItemField("valor", event.target.value)
                  }
                  placeholder="650,00"
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-800">
                  Previsao
                </span>
                <input
                  type="date"
                  value={planoItemDraft.previsao}
                  onChange={(event) =>
                    updatePlanoItemField("previsao", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none"
                />
              </label>
              <div className="lg:col-span-3">
                <TextAreaField
                  label="Observacoes"
                  value={planoItemDraft.observacoes}
                  rows={3}
                  onChange={(value) =>
                    updatePlanoItemField("observacoes", value)
                  }
                />
              </div>
            </div>
          </section>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-black text-slate-950">Fases do tratamento</h3>
            <button
              type="button"
              onClick={() => setFasePlanoFiltro("Todas")}
              className={
                fasePlanoFiltro === "Todas"
                  ? "h-9 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white"
                  : "h-9 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700"
              }
            >
              Todas
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {fasesPlanoTratamento.map((fase) => {
              const Icon = fase.icon;
              const total = planoItens.filter((item) => item.fase === fase.id).length;
              const selected = fasePlanoFiltro === fase.id;

              return (
                <button
                  key={fase.id}
                  type="button"
                  onClick={() =>
                    setFasePlanoFiltro(selected ? "Todas" : fase.id)
                  }
                  className={
                    selected
                      ? "rounded-lg border border-indigo-400 bg-indigo-50 p-4 text-left shadow-sm"
                      : "rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200"
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className="font-black text-slate-900">{fase.label}</p>
                      <p className="mt-1 text-xs font-black text-slate-500">
                        {total} {total === 1 ? "item" : "itens"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">
              Resumo financeiro do plano
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                ["Valor estimado", formatMoney(valorEstimadoPlano)],
                ["Valor aprovado", formatMoney(valorAprovadoPlano)],
                ["Valor executado", formatMoney(valorExecutadoPlano)],
                ["Saldo", formatMoney(saldoPlano)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs font-black text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-black text-indigo-700">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-950">Progresso do plano</h3>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${progressoPlano}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between gap-3 text-sm font-black text-slate-700">
              <span>
                {itensConcluidosPlano} de {planoItens.length} itens concluidos
              </span>
              <span>{progressoPlano}%</span>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fase / Etapa</th>
                  <th className="px-4 py-3">Procedimento</th>
                  <th className="px-4 py-3">Dente</th>
                  <th className="px-4 py-3">Prioridade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Profissional</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Previsao</th>
                  <th className="px-4 py-3">Observacoes</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itensPlanoFiltrados.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3 font-black text-slate-700">
                      {item.fase}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {item.procedimento}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {item.dente || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <PrioridadePill prioridade={item.prioridade} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {item.profissional}
                    </td>
                    <td className="px-4 py-3 font-black text-slate-800">
                      {formatMoney(item.valor)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {formatDate(item.previsao)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {item.observacoes || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editarItemPlano(item)}
                          className="h-8 rounded-lg border border-indigo-100 px-3 text-xs font-black text-indigo-700"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => concluirItemPlano(item.id)}
                          className="h-8 rounded-lg border border-emerald-100 px-3 text-xs font-black text-emerald-700"
                        >
                          Concluir
                        </button>
                        <button
                          type="button"
                          onClick={() => excluirItemPlano(item.id)}
                          className="h-8 rounded-lg border border-red-100 px-3 text-xs font-black text-red-600"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!itensPlanoFiltrados.length && (
                  <tr>
                    <td className="px-4 py-8 text-center" colSpan={10}>
                      <EmptyState text="Nenhum item nesta fase do plano." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-5">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black text-slate-950">Notas e condutas</h3>
                <button
                  type="button"
                  onClick={() => {
                    setNotasPlanoDraft(planoTratamento.observacoes || "");
                    setEditandoNotasPlano(true);
                  }}
                  className="text-xs font-black text-indigo-700"
                >
                  Editar
                </button>
              </div>
              {editandoNotasPlano ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={notasPlanoDraft}
                    rows={6}
                    onChange={(event) => setNotasPlanoDraft(event.target.value)}
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditandoNotasPlano(false)}
                      className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={salvarNotasPlano}
                      className="h-9 rounded-lg bg-indigo-600 px-3 text-xs font-black text-white"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-600">
                  {planoTratamento.observacoes ||
                    "Nenhuma nota ou conduta registrada."}
                </p>
              )}
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-black text-slate-950">Formas de pagamento</h3>
              <div className="mt-4 space-y-3">
                {formasPagamentoPlano.map((forma) => (
                  <label
                    key={forma}
                    className="flex items-center gap-3 text-sm font-black text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={(planoTratamento.formasPagamento || []).includes(
                        forma
                      )}
                      onChange={() => toggleFormaPagamento(forma)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                    {forma}
                  </label>
                ))}
              </div>
            </article>
          </div>
        </section>
      </section>
    );
  }

  function renderOHF() {
    const medicoRows = [
      ["Doencas sistemicas", firstText(ohfAtual?.doencasSistemicas, resumo.historicoMedico, anamnese.historicoMedico)],
      ["Alergias", firstText(ohfAtual?.alergias, resumo.alergias, anamnese.alergias, paciente.alergias)],
      ["Medicamentos em uso", firstText(ohfAtual?.medicamentosUso, resumo.medicamentosUso, anamnese.medicamentosUso, paciente.medicamentosUso)],
      ["Historico de cirurgias", ohfAtual?.historicoCirurgias || ""],
      ["Internacoes previas", ohfAtual?.internacoesPrevias || ""],
      ["Transfusoes", ohfAtual?.transfusoes || ""],
      ["Doencas transmissiveis", ohfAtual?.doencasTransmissiveis || ""],
      ["Observacoes", ohfAtual?.observacoesMedicas || ""],
    ];
    const odontologicoRows = [
      ["Ultima consulta odontologica", ohfAtual?.ultimaConsultaOdontologica || ""],
      ["Motivo da ultima consulta", ohfAtual?.motivoUltimaConsulta || ""],
      ["Tratamentos previos", firstText(ohfAtual?.tratamentosPrevios, anamnese.historicoOdontologico)],
      ["Cirurgias orais", ohfAtual?.cirurgiasOrais || ""],
      ["Reacoes a anestesicos", ohfAtual?.reacoesAnestesicos || ""],
      ["Sensibilidade a materiais", ohfAtual?.sensibilidadeMateriais || ""],
      ["Habitos parafuncionais", ohfAtual?.habitosParafuncionais || ""],
      ["Observacoes", ohfAtual?.observacoesOdontologicas || ""],
    ];
    const riscoRows = [
      ["Estado emocional", ohfAtual?.estadoEmocional || ""],
      ["Nivel de colaboracao", ohfAtual?.nivelColaboracao || ""],
      ["Compreensao das orientacoes", ohfAtual?.compreensaoOrientacoes || ""],
      ["Suporte familiar", ohfAtual?.suporteFamiliar || ""],
      ["Condicoes de higiene oral", ohfAtual?.condicoesHigieneOral || ""],
      ["Risco cirurgico (ASA)", ohfAtual?.riscoAsa || ""],
      ["Risco de sangramento", ohfAtual?.riscoSangramento || ""],
      ["Consideracoes especiais", ohfAtual?.consideracoesEspeciais || ""],
    ];

    function DetailRows({ rows }: { rows: string[][] }) {
      return (
        <div className="divide-y divide-slate-100 text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-2 py-2 md:grid-cols-[170px_minmax(0,1fr)]"
            >
              <p className="font-black text-slate-500">{label}</p>
              <p className="whitespace-pre-line font-semibold text-slate-800">
                {value || "Nao informado"}
              </p>
            </div>
          ))}
        </div>
      );
    }

    function FormField({
      label,
      field,
      rows = 3,
    }: {
      label: string;
      field: keyof OHFDraft;
      rows?: number;
    }) {
      return (
        <TextAreaField
          label={label}
          value={String(ohfDraft[field] || "")}
          rows={rows}
          onChange={(value) => updateOHFField(field, value)}
        />
      );
    }

    if (editandoOHF) {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Avaliacao OHF
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Registro hospitalar e facilitador do atendimento odontologico.
              </p>
              {ohfDraft.status === "finalizada" && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-black text-amber-800">
                  Esta avaliacao ja foi finalizada. Revise com cuidado antes de
                  salvar alteracoes.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton variant="secondary" onClick={cancelarOHF}>
                Cancelar
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={() => salvarOHF("rascunho")}
              >
                Salvar rascunho
              </ActionButton>
              <ActionButton onClick={() => salvarOHF("finalizada")}>
                Finalizar avaliacao
              </ActionButton>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <label className="block">
              <span className="text-sm font-black text-slate-800">Data</span>
              <input
                type="date"
                value={ohfDraft.data}
                onChange={(event) => updateOHFField("data", event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-800">Hora</span>
              <input
                type="time"
                value={ohfDraft.hora}
                onChange={(event) => updateOHFField("hora", event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-800">
                Profissional
              </span>
              <input
                value={ohfDraft.profissional}
                onChange={(event) =>
                  updateOHFField("profissional", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="space-y-4">
              <h3 className="font-black text-slate-950">Historico medico</h3>
              <FormField label="Doencas sistemicas" field="doencasSistemicas" />
              <FormField label="Alergias" field="alergias" />
              <FormField label="Medicamentos em uso" field="medicamentosUso" />
              <FormField label="Historico de cirurgias" field="historicoCirurgias" />
              <FormField label="Internacoes previas" field="internacoesPrevias" />
              <FormField label="Transfusoes" field="transfusoes" />
              <FormField label="Doencas transmissiveis" field="doencasTransmissiveis" />
              <FormField label="Observacoes medicas" field="observacoesMedicas" />
            </div>
            <div className="space-y-4">
              <h3 className="font-black text-slate-950">
                Historico odontologico
              </h3>
              <FormField label="Ultima consulta odontologica" field="ultimaConsultaOdontologica" />
              <FormField label="Motivo da ultima consulta" field="motivoUltimaConsulta" />
              <FormField label="Tratamentos previos" field="tratamentosPrevios" />
              <FormField label="Cirurgias orais" field="cirurgiasOrais" />
              <FormField label="Reacoes a anestesicos" field="reacoesAnestesicos" />
              <FormField label="Sensibilidade a materiais" field="sensibilidadeMateriais" />
              <FormField label="Habitos parafuncionais" field="habitosParafuncionais" />
              <FormField label="Observacoes odontologicas" field="observacoesOdontologicas" />
            </div>
            <div className="space-y-4">
              <h3 className="font-black text-slate-950">
                Fatores facilitadores / riscos
              </h3>
              <FormField label="Estado emocional" field="estadoEmocional" />
              <FormField label="Nivel de colaboracao" field="nivelColaboracao" />
              <FormField label="Compreensao das orientacoes" field="compreensaoOrientacoes" />
              <FormField label="Suporte familiar" field="suporteFamiliar" />
              <FormField label="Condicoes de higiene oral" field="condicoesHigieneOral" />
              <FormField label="Risco cirurgico (ASA)" field="riscoAsa" />
              <FormField label="Risco de sangramento" field="riscoSangramento" />
              <FormField label="Consideracoes especiais" field="consideracoesEspeciais" />
            </div>
          </div>

          <div className="mt-6">
            <TextAreaField
              label="Condutas e cuidados especiais"
              value={ohfDraft.condutasCuidados}
              rows={5}
              onChange={(value) => updateOHFField("condutasCuidados", value)}
            />
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                OHF - Odontologia Hospitalar e Facilitadora
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Registro da historia medica e odontologica com enfoque
                hospitalar e fatores facilitadores.
              </p>
            </div>
            <ActionButton onClick={abrirNovaOHF}>+ Nova avaliacao OHF</ActionButton>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-lg border border-emerald-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-emerald-50 px-4 py-3">
              <h3 className="font-black text-slate-950">Historico medico</h3>
              {ohfAtual && (
                <button
                  type="button"
                  onClick={() => abrirOHF(ohfAtual)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-black text-emerald-700"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
              )}
            </div>
            <div className="p-4">
              <DetailRows rows={medicoRows} />
            </div>
          </article>

          <article className="rounded-lg border border-indigo-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-indigo-50 px-4 py-3">
              <h3 className="font-black text-slate-950">
                Historico odontologico
              </h3>
              {ohfAtual && (
                <button
                  type="button"
                  onClick={() => abrirOHF(ohfAtual)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-indigo-200 bg-white px-3 text-xs font-black text-indigo-700"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
              )}
            </div>
            <div className="p-4">
              <DetailRows rows={odontologicoRows} />
            </div>
          </article>

          <article className="rounded-lg border border-amber-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-amber-50 px-4 py-3">
              <h3 className="font-black text-slate-950">
                Fatores facilitadores / riscos
              </h3>
              {ohfAtual && (
                <button
                  type="button"
                  onClick={() => abrirOHF(ohfAtual)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 text-xs font-black text-amber-700"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
              )}
            </div>
            <div className="p-4">
              <DetailRows rows={riscoRows} />
            </div>
          </article>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black text-slate-950">
                Condutas e cuidados especiais
              </h3>
              {ohfAtual && (
                <button
                  type="button"
                  onClick={() => abrirOHF(ohfAtual)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-indigo-700"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
              )}
            </div>
            <div className="mt-4 text-sm font-semibold leading-relaxed text-slate-700">
              {splitList(ohfAtual?.condutasCuidados).length ? (
                <ul className="space-y-2">
                  {splitList(ohfAtual?.condutasCuidados).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              ) : (
                <EmptyState />
              )}
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-black text-slate-950">
                Avaliacoes OHF anteriores
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {ohfAvaliacoes.map((avaliacao) => (
                <div
                  key={String(avaliacao.id)}
                  className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[120px_1fr_70px_150px]"
                >
                  <div>
                    <p className="font-black text-slate-900">
                      {formatDate(avaliacao.data)}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {avaliacao.hora}
                    </p>
                  </div>
                  <div>
                    <p className="font-black text-slate-900">
                      {avaliacao.profissional || "Nao informado"}
                    </p>
                    <p className="mt-1 line-clamp-2 font-semibold text-slate-500">
                      {resumoOHF(avaliacao)}
                    </p>
                  </div>
                  <p className="font-black text-indigo-700">
                    {avaliacao.riscoAsa || "-"}
                  </p>
                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => abrirOHF(avaliacao)}
                      className="h-8 rounded-lg border border-indigo-100 px-3 text-xs font-black text-indigo-700"
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirOHF(avaliacao)}
                      className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => excluirOHF(String(avaliacao.id))}
                      className="h-8 rounded-lg border border-red-100 px-3 text-xs font-black text-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
              {!ohfAvaliacoes.length && (
                <div className="p-5">
                  <EmptyState text="Nenhuma avaliacao OHF registrada." />
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    );
  }

  function renderOdontogramaVisual() {
    const legendaPrincipalOdontograma = new Set([
      "Hígido",
      "Cárie",
      "Restauração",
      "Tratamento de canal",
      "Extração indicada",
      "Implante",
      "Prótese",
    ]);

    function renderDenteClinico(
      dente: string,
      arcada: "superior" | "inferior"
    ) {
      const anotacao = odontogramaPorDente.get(dente);
      const selected = odontogramaDraft.dente === dente;

      return (
        <OdontogramaTooth
          key={dente}
          numero={dente}
          selecionado={selected}
          condicao={anotacao?.condicao}
          arcada={arcada}
          onClick={() => selecionarDente(dente)}
        />
      );
    }

    function renderArcadaClinica(
      dentes: string[],
      arcada: "superior" | "inferior"
    ) {
      if (!dentes.length) {
        return null;
      }

      const metade = Math.ceil(dentes.length / 2);
      const dentesDireita = dentes.slice(0, metade);
      const dentesEsquerda = dentes.slice(metade);

      return (
        <div className="space-y-1.5">
          {arcada === "superior" && (
            <div className="text-center text-[11px] font-black uppercase text-indigo-700">
              MAXILA
            </div>
          )}

          <div className="flex items-center justify-center gap-1">
            <div className="flex items-center justify-center gap-1">
              {dentesDireita.map((dente) => renderDenteClinico(dente, arcada))}
            </div>
            <div className="flex items-center justify-center gap-1">
              {dentesEsquerda.map((dente) => renderDenteClinico(dente, arcada))}
            </div>
          </div>

          {arcada === "inferior" && (
            <div className="text-center text-[11px] font-black uppercase text-indigo-700">
              MANDÍBULA
            </div>
          )}
        </div>
      );
    }

    function renderLegendaOdontograma(showAll = false) {
      const items = showAll
        ? condicoesOdontograma
        : condicoesOdontograma.filter((item) =>
            legendaPrincipalOdontograma.has(item.label)
          );

      return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-xs font-black text-slate-700"
            >
              <span
                className={["h-2.5 w-2.5 rounded-full", item.dot].join(" ")}
              />
              {item.label}
            </div>
          ))}
        </div>
      );
    }

    return (
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Odontograma
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Registre condições, procedimentos e observações por dente.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setMostrarHistoricoOdontograma((current) => !current)
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 transition hover:bg-indigo-50"
          >
            <History size={16} />
            Histórico de alterações
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 lg:grid-cols-[minmax(130px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_auto] lg:items-end">
                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Arcada
                  </span>
                  <select
                    value={arcadaOdontograma}
                    onChange={(event) =>
                      setArcadaOdontograma(event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>Todas</option>
                    <option>Superior</option>
                    <option>Inferior</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Exibir
                  </span>
                  <select
                    value="Numeração FDI"
                    disabled
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600 outline-none"
                  >
                    <option>Numeração FDI</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Visualização
                  </span>
                  <select
                    value={visualizacaoOdontograma}
                    onChange={(event) =>
                      setVisualizacaoOdontograma(event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>Completa</option>
                    <option>Planejamento</option>
                    <option>Executado</option>
                  </select>
                </label>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      selecionarDente(odontogramaDraft.dente || "16")
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700"
                  >
                    <Plus size={16} />
                    Adicionar anotação
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarLegendaOdontograma((current) => !current)
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 transition hover:bg-indigo-50"
                  >
                    <Info size={16} />
                    Legenda
                  </button>
                </div>
              </div>

              {mostrarHistoricoOdontograma && (
                <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                  <h3 className="text-sm font-black text-slate-900">
                    Histórico de alterações
                  </h3>
                  <div className="mt-3 space-y-2">
                    {odontograma.length ? (
                      odontograma.map((anotacao) => (
                        <div
                          key={String(anotacao.id)}
                          className="flex flex-col gap-1 rounded-lg border border-white bg-white/80 p-3 text-sm font-semibold text-slate-600 md:flex-row md:items-center md:justify-between"
                        >
                          <span>
                            {formatDate(anotacao.data)} - dente{" "}
                            {anotacao.dente} - {anotacao.condicao}
                          </span>
                          <span className="text-xs text-slate-500">
                            {anotacao.profissional} registrou alteração
                          </span>
                        </div>
                      ))
                    ) : (
                      <EmptyState text="Nenhuma alteração registrada." />
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-100 bg-slate-50 px-2 py-3 sm:px-4">
                <div className="relative min-w-[480px] px-2">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase text-indigo-400">
                    DIREITA
                  </div>
                  <div className="space-y-4">
                    {renderArcadaClinica(dentesVisiveisSuperiores, "superior")}
                    {renderArcadaClinica(dentesVisiveisInferiores, "inferior")}
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase text-indigo-400">
                    ESQUERDA
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-100 bg-white px-4 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    Legenda
                  </h3>
                </div>
                {mostrarLegendaOdontograma && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    {renderLegendaOdontograma(true)}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-black uppercase text-indigo-700">
                    Dente selecionado
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    Dente {odontogramaDraft.dente}
                  </h3>
                </div>
                {odontogramaDraft.id && (
                  <span className="inline-flex h-7 items-center rounded-full bg-emerald-50 px-3 text-xs font-black text-emerald-700">
                    Com anotação
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-4">
                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Condição
                  </span>
                  <select
                    value={odontogramaDraft.condicao}
                    onChange={(event) =>
                      updateOdontogramaField("condicao", event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    {condicoesOdontograma.map((item) => (
                      <option key={item.label}>{item.label}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black text-slate-500">Face</span>
                  <select
                    value={odontogramaDraft.face}
                    onChange={(event) =>
                      updateOdontogramaField("face", event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    {facesOdontograma.map((face) => (
                      <option key={face}>{face}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Status
                  </span>
                  <select
                    value={odontogramaDraft.status}
                    onChange={(event) =>
                      updateOdontogramaField("status", event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    {statusOdontograma.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Profissional
                  </span>
                  <input
                    value={odontogramaDraft.profissional}
                    onChange={(event) =>
                      updateOdontogramaField("profissional", event.target.value)
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Observação
                  </span>
                  <textarea
                    value={odontogramaDraft.observacao}
                    rows={3}
                    onChange={(event) =>
                      updateOdontogramaField("observacao", event.target.value)
                    }
                    placeholder="Descreva a condição, procedimento ou observação clínica."
                    className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={salvarOdontograma}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700"
                  >
                    <CheckCircle2 size={16} />
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={limparOdontograma}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    <RotateCcw size={16} />
                    Limpar
                  </button>
                  {odontogramaDraft.id && (
                    <button
                      type="button"
                      onClick={() => excluirOdontograma()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-black text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white shadow-sm xl:self-start">
            <div className="border-b border-slate-100 px-4 py-4">
              <h3 className="text-base font-black text-slate-950">
                Anotações do odontograma
              </h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {odontogramaFiltrado.length} registro(s) exibido(s)
              </p>
            </div>

            <div className="max-h-[760px] space-y-0 overflow-y-auto px-4">
              {odontogramaFiltrado.map((anotacao) => {
                const condicao = getCondicaoOdontograma(anotacao.condicao);
                const hora = formatTime(anotacao.criadoEm);

                return (
                  <article
                    key={String(anotacao.id)}
                    className="border-b border-slate-100 py-4 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={[
                          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                          condicao.dot,
                        ].join(" ")}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black text-slate-700">
                              {formatDate(anotacao.data)}
                              {hora ? ` - ${hora}` : ""}
                            </p>
                            <p className="mt-1 text-xs font-black text-indigo-700">
                              {anotacao.profissional}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setOdontogramaDraft(
                                  odontogramaToDraft(anotacao)
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-indigo-700 transition hover:bg-indigo-50"
                              title="Editar"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                excluirOdontograma(String(anotacao.id))
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm font-black leading-relaxed text-slate-800">
                          {anotacao.condicao} em {anotacao.dente}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">
                          {anotacao.observacao || anotacao.face || "Geral"}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-slate-400">
                          {anotacao.status} · {anotacao.face || "Geral"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}

              {!odontogramaFiltrado.length && (
                <div className="py-10 text-center">
                  <EmptyState text="Nenhuma anotação registrada ainda." />
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setVisualizacaoOdontograma("Completa")}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-black text-indigo-700 transition hover:bg-indigo-50"
              >
                Ver todas as anotações
              </button>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  function renderOdontograma() {
    if (!odontogramaLiberado) {
      return (
        <section className="rounded-lg border border-indigo-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
            <Lock size={24} />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Odontograma disponível no Plano Pro
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
            O Plano Starter inclui prontuário eletrônico básico. Para usar o
            odontograma completo, escolha o Plano Pro ou Premium.
          </p>
          <Link
            href="/planos"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-black text-white transition hover:bg-indigo-700"
          >
            Ver planos
          </Link>
        </section>
      );
    }

    return renderOdontogramaVisual();

    function renderDente(dente: string, arcada: "superior" | "inferior") {
      const anotacao = odontogramaPorDente.get(dente);
      const condicao = getCondicaoOdontograma(anotacao?.condicao);
      const selected = odontogramaDraft.dente === dente;

      return (
        <OdontogramaTooth
          key={dente}
          numero={dente}
          selecionado={selected}
          condicao={anotacao?.condicao}
          arcada={arcada}
          onClick={() => selecionarDente(dente)}
        />
      );

      const label = `${dente} ${anotacao?.condicao || "Sem anotação"}`;
      const numero = (
        <span
          className={[
            "text-[11px] font-black leading-none",
            selected ? "text-indigo-700" : "text-slate-700",
          ].join(" ")}
        >
          {dente}
        </span>
      );

      return (
        <button
          key={dente}
          type="button"
          aria-label={label}
          title={label}
          onClick={() => selecionarDente(dente)}
          className={[
            "group relative flex w-[56px] shrink-0 flex-col items-center justify-center rounded-xl border bg-white px-1.5 py-2 text-center transition duration-200",
            "hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/60 hover:shadow-sm",
            selected
              ? "border-indigo-500 bg-indigo-50 shadow-[0_10px_24px_rgba(79,70,229,0.14)]"
              : "border-transparent",
          ].join(" ")}
        >
          {arcada === "superior" && numero}
          <OdontogramaTooth
            numero={dente}
            selecionado={selected}
            condicao={anotacao?.condicao}
            arcada={arcada}
            onClick={() => selecionarDente(dente)}
          />
          {arcada === "inferior" && numero}
          {anotacao && (
            <span
              className={[
                "absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                condicao.dot,
              ].join(" ")}
            />
          )}
        </button>
      );
    }

    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Odontograma
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Registre condições, procedimentos e observações por dente.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => selecionarDente(odontogramaDraft.dente || "16")}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700"
              >
                <Plus size={16} />
                Adicionar anotação
              </button>
              <button
                type="button"
                onClick={() => setMostrarLegendaOdontograma((current) => !current)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700"
              >
                <Info size={16} />
                Legenda
              </button>
              <button
                type="button"
                onClick={() =>
                  setMostrarHistoricoOdontograma((current) => !current)
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700"
              >
                <History size={16} />
                Histórico de alterações
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="text-xs font-black text-slate-500">Arcada</span>
              <select
                value={arcadaOdontograma}
                onChange={(event) => setArcadaOdontograma(event.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
              >
                <option>Todas</option>
                <option>Superior</option>
                <option>Inferior</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">
                Numeração
              </span>
              <select
                value="FDI"
                disabled
                className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600 outline-none"
              >
                <option>FDI</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">
                Visualização
              </span>
              <select
                value={visualizacaoOdontograma}
                onChange={(event) =>
                  setVisualizacaoOdontograma(event.target.value)
                }
                className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
              >
                <option>Completa</option>
                <option>Planejamento</option>
                <option>Executado</option>
              </select>
            </label>
          </div>

          {mostrarLegendaOdontograma && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-black text-slate-900">Legenda</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {condicoesOdontograma.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm"
                  >
                    <span
                      className="relative h-8 w-7 rounded-[45%_45%_48%_48%] border-2"
                      style={{
                        backgroundColor: item.fill,
                        borderColor: item.stroke,
                      }}
                    >
                      <span
                        className={["absolute right-0.5 top-0.5 h-2 w-2 rounded-full", item.dot].join(
                          " "
                        )}
                      />
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mostrarHistoricoOdontograma && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-black text-slate-900">
                Histórico de alterações
              </h3>
              <div className="mt-3 space-y-2">
                {odontograma.length ? (
                  odontograma.map((anotacao) => (
                    <div
                      key={String(anotacao.id)}
                      className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm font-semibold text-slate-600 md:flex-row md:items-center md:justify-between"
                    >
                      <span>
                        {formatDate(anotacao.data)} - dente {anotacao.dente} -{" "}
                        {anotacao.condicao}
                      </span>
                      <span className="text-xs text-slate-500">
                        {anotacao.profissional} registrou alteração
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Nenhuma alteração registrada." />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="overflow-x-auto rounded-lg border border-slate-100 bg-gradient-to-b from-white to-slate-50 px-4 py-5">
              <div className="min-w-[480px] space-y-7">
              {dentesVisiveisSuperiores.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-indigo-700">
                    <span className="h-px w-24 bg-indigo-100" />
                    MAXILA
                    <span className="h-px w-24 bg-indigo-100" />
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {dentesVisiveisSuperiores.map((dente) =>
                      renderDente(dente, "superior")
                    )}
                  </div>
                </div>
              )}

              {dentesVisiveisInferiores.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-indigo-700">
                    <span className="h-px w-24 bg-indigo-100" />
                    MANDÍBULA
                    <span className="h-px w-24 bg-indigo-100" />
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {dentesVisiveisInferiores.map((dente) =>
                      renderDente(dente, "inferior")
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-indigo-700">
                  Dente selecionado
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">
                  Dente {odontogramaDraft.dente}
                </h3>
              </div>
              {odontogramaDraft.id && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  Com anotação
                </span>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  Condição
                </span>
                <select
                  value={odontogramaDraft.condicao}
                  onChange={(event) =>
                    updateOdontogramaField("condicao", event.target.value)
                  }
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  {condicoesOdontograma.map((item) => (
                    <option key={item.label}>{item.label}</option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <label className="block">
                  <span className="text-xs font-black text-slate-500">Face</span>
                  <select
                    value={odontogramaDraft.face}
                    onChange={(event) =>
                      updateOdontogramaField("face", event.target.value)
                    }
                    className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                  >
                    {facesOdontograma.map((face) => (
                      <option key={face}>{face}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Status
                  </span>
                  <select
                    value={odontogramaDraft.status}
                    onChange={(event) =>
                      updateOdontogramaField("status", event.target.value)
                    }
                    className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                  >
                    {statusOdontograma.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  Profissional
                </span>
                <input
                  value={odontogramaDraft.profissional}
                  onChange={(event) =>
                    updateOdontogramaField("profissional", event.target.value)
                  }
                  className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  Observação
                </span>
                <textarea
                  value={odontogramaDraft.observacao}
                  rows={5}
                  onChange={(event) =>
                    updateOdontogramaField("observacao", event.target.value)
                  }
                  placeholder="Descreva a condição, procedimento ou observação clínica."
                  className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={salvarOdontograma}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700"
                >
                  <CheckCircle2 size={16} />
                  Salvar anotação
                </button>
                <button
                  type="button"
                  onClick={limparOdontograma}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700"
                >
                  <RotateCcw size={16} />
                  Limpar
                </button>
                {odontogramaDraft.id && (
                  <button
                    type="button"
                    onClick={() => excluirOdontograma()}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-black text-red-600"
                  >
                    <Trash2 size={16} />
                    Excluir anotação
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Anotações do odontograma
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                {odontogramaFiltrado.length} registro(s) exibido(s)
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs font-black uppercase text-slate-500">
                  <th className="border-b border-slate-200 px-3 py-3">Data</th>
                  <th className="border-b border-slate-200 px-3 py-3">Dente</th>
                  <th className="border-b border-slate-200 px-3 py-3">Face</th>
                  <th className="border-b border-slate-200 px-3 py-3">
                    Condição
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3">Status</th>
                  <th className="border-b border-slate-200 px-3 py-3">
                    Profissional
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3">
                    Observação
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {odontogramaFiltrado.map((anotacao) => {
                  const condicao = getCondicaoOdontograma(anotacao.condicao);

                  return (
                    <tr key={String(anotacao.id)} className="align-top">
                      <td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-600">
                        {formatDate(anotacao.data)}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 font-black text-slate-900">
                        {anotacao.dente}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-600">
                        {anotacao.face || "Geral"}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3">
                        <span
                          className={[
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black",
                            condicao.tooth,
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-2 w-2 rounded-full",
                              condicao.dot,
                            ].join(" ")}
                          />
                          {anotacao.condicao}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-600">
                        {anotacao.status}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-600">
                        {anotacao.profissional}
                      </td>
                      <td className="max-w-[280px] border-b border-slate-100 px-3 py-3 font-semibold text-slate-600">
                        {anotacao.observacao || "-"}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setOdontogramaDraft(odontogramaToDraft(anotacao))
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 text-indigo-700"
                            title="Editar"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              excluirOdontograma(String(anotacao.id))
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!odontogramaFiltrado.length && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <EmptyState text="Nenhuma anotação registrada para esta visualização." />
              </div>
            )}
          </div>
        </section>
      </section>
    );
  }

  function renderEvolucoes() {
    return (
      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <h2 className="font-black text-slate-950">
                Histórico de evoluções
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {evolucoes.length} registro(s) do paciente
              </p>
            </div>
            <button
              type="button"
              onClick={novaEvolucao}
              className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-black text-indigo-700"
            >
              +
            </button>
          </div>

          <div className="max-h-[620px] overflow-y-auto p-3">
            {evolucoesFiltradas.map((evolucao) => {
              const selected = String(evolucao.id) === evolucaoDraft.id;

              return (
                <article
                  key={String(evolucao.id)}
                  className={
                    selected
                      ? "mb-3 rounded-lg border border-indigo-300 bg-indigo-50 p-3"
                      : "mb-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                  }
                >
                  <button
                    type="button"
                    onClick={() => selecionarEvolucao(evolucao)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {formatDate(evolucao.data)} - {evolucao.hora}
                        </p>
                        <h3 className="mt-2 text-sm font-black text-slate-950">
                          {evolucao.titulo}
                        </h3>
                      </div>
                      <span
                        className={
                          evolucao.status === "assinada"
                            ? "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-black text-emerald-700"
                            : "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-700"
                        }
                      >
                        {evolucao.status === "assinada"
                          ? "Assinada"
                          : "Rascunho"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {evolucao.profissional}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => excluirEvolucao(String(evolucao.id))}
                    className="mt-3 text-xs font-black text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </article>
              );
            })}

            {evolucoesFiltradas.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="text-sm font-black text-slate-700">
                  Nenhuma evolução encontrada
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Crie uma nova evolução para iniciar o histórico.
                </p>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[150px_180px_180px_minmax(0,1fr)_44px]">
              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  Período
                </span>
                <select
                  value={periodoEvolucao}
                  onChange={(event) => setPeriodoEvolucao(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todos</option>
                  <option>Últimos 30 dias</option>
                  <option>Últimos 90 dias</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  Tipo de evolução
                </span>
                <select
                  value={tipoEvolucaoFiltro}
                  onChange={(event) =>
                    setTipoEvolucaoFiltro(event.target.value)
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todos</option>
                  {tiposEvolucao.map((tipo) => (
                    <option key={tipo}>{tipo}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  Profissional
                </span>
                <select
                  value={profissionalFiltro}
                  onChange={(event) => setProfissionalFiltro(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                >
                  <option>Todos</option>
                  {profissionaisEvolucao.map((profissional) => (
                    <option key={profissional}>{profissional}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  Buscar em evoluções
                </span>
                <input
                  value={buscaEvolucao}
                  onChange={(event) => setBuscaEvolucao(event.target.value)}
                  placeholder="Buscar em evolucoes..."
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setPeriodoEvolucao("Todos");
                  setTipoEvolucaoFiltro("Todos");
                  setProfissionalFiltro("Todos");
                  setBuscaEvolucao("");
                }}
                className="mt-5 h-10 rounded-lg border border-slate-200 text-sm font-black text-indigo-700"
              >
                <Search size={16} className="mx-auto" />
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Evolução clínica
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Registre conduta, orientações e próximos passos do atendimento.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={novaEvolucao}
                  className="h-11 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700"
                >
                  + Nova evolução
                </button>
                <button
                  type="button"
                  onClick={() => salvarEvolucao("rascunho")}
                  className="h-11 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700"
                >
                  Salvar rascunho
                </button>
                <button
                  type="button"
                  onClick={() => salvarEvolucao("assinada")}
                  className="h-11 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700"
                >
                  Assinar evolução
                </button>
              </div>
            </div>

            {evolucaoDraft.status === "assinada" && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
                Evolução assinada. Alterações serão registradas como atualização.
              </div>
            )}

            {!editandoEvolucao && evolucoes.length === 0 && (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-lg font-black text-slate-900">
                  Nenhuma evolução registrada
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Clique em Nova evolução para criar o primeiro registro.
                </p>
              </div>
            )}

            {(editandoEvolucao || evolucaoDraft.id) && (
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 lg:grid-cols-4">
                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Data
                    </span>
                    <input
                      type="date"
                      value={evolucaoDraft.data}
                      onChange={(event) =>
                        updateEvolucaoField("data", event.target.value)
                      }
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Hora
                    </span>
                    <input
                      type="time"
                      value={evolucaoDraft.hora}
                      onChange={(event) =>
                        updateEvolucaoField("hora", event.target.value)
                      }
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Profissional
                    </span>
                    <input
                      value={evolucaoDraft.profissional}
                      onChange={(event) =>
                        updateEvolucaoField("profissional", event.target.value)
                      }
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Tipo de evolução
                    </span>
                    <select
                      value={evolucaoDraft.tipo}
                      onChange={(event) =>
                        updateEvolucaoField("tipo", event.target.value)
                      }
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                    >
                      {tiposEvolucao.map((tipo) => (
                        <option key={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Dentes ou região envolvidos
                    </span>
                    <input
                      value={evolucaoDraft.dentes}
                      onChange={(event) =>
                        updateEvolucaoField("dentes", event.target.value)
                      }
                      placeholder="Ex.: Dente 26, arcada superior, mandibula"
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Título
                    </span>
                    <input
                      value={evolucaoDraft.titulo}
                      onChange={(event) =>
                        updateEvolucaoField("titulo", event.target.value)
                      }
                      placeholder="Resumo do registro clinico"
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-black text-slate-500">
                    Texto da evolução
                  </span>
                  <textarea
                    value={evolucaoDraft.texto}
                    rows={10}
                    onChange={(event) =>
                      updateEvolucaoField("texto", event.target.value)
                    }
                    placeholder="Descreva a evolução clínica, conduta, orientação e próximos passos..."
                    className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-relaxed text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <div>
                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Tags
                    </span>
                    <input
                      value={evolucaoDraft.tags}
                      onChange={(event) =>
                        updateEvolucaoField("tags", event.target.value)
                      }
                      placeholder="Separe por vírgula"
                      className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
                    />
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagsSugeridas.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const tags = splitList(evolucaoDraft.tags);
                          if (!tags.includes(tag)) {
                            updateEvolucaoField(
                              "tags",
                              [...tags, tag].join(", ")
                            );
                          }
                        }}
                        className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    );
  }

  return (
    <div className="mt-0">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-indigo-700">
            <Link href="/prontuario">Prontuarios</Link>
            <span>&gt;</span>
            <span className="text-slate-700">{paciente.nome}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-950">Prontuario</h1>
            <span className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-black text-indigo-700">
              Ativo
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-96">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Buscar paciente, prontuario, atendimento..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none shadow-sm"
            />
          </div>
          <Link
            href="/prontuario"
            className="text-sm font-black text-indigo-700 hover:text-indigo-900"
          >
            Voltar para a lista de prontuarios
          </Link>
        </div>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-2xl font-black text-indigo-700">
              {getInitials(paciente.nome)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black text-slate-950">
                {paciente.nome}
              </h2>
              <p className="mt-2 text-sm font-bold text-slate-600">
                {joinPieces([idade, genero, formatDate(nascimento)])}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-500">
                {joinPieces([paciente.telefone, paciente.email])}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 flex-1 gap-4 text-sm md:grid-cols-4">
            <div className="border-slate-200 md:border-l md:pl-5">
              <p className="text-xs font-black text-slate-400">Codigo</p>
              <p className="mt-1 font-black text-slate-900">#{paciente.id}</p>
            </div>
            <div className="border-slate-200 md:border-l md:pl-5">
              <p className="text-xs font-black text-slate-400">Convenio</p>
              <p className="mt-1 font-black text-slate-900">
                {paciente.convenio || "Particular"}
              </p>
            </div>
            <div className="border-slate-200 md:border-l md:pl-5">
              <p className="text-xs font-black text-slate-400">Plano</p>
              <p className="mt-1 font-black text-slate-900">
                {paciente.planoConvenio || "Nao informado"}
              </p>
            </div>
            <div className="border-slate-200 md:border-l md:pl-5">
              <p className="text-xs font-black text-slate-400">
                Profissional responsavel
              </p>
              <p className="mt-1 font-black text-slate-900">
                {nomeExibicaoProfissional()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/pacientes/${pacienteId}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700"
            >
              <UserRound size={17} />
              Ver cadastro do paciente
            </Link>
            <Link
              href={`/pacientes/${pacienteId}?aba=historico`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700"
            >
              <History size={17} />
              Historico geral
            </Link>
          </div>
        </div>
      </section>

      <div
        className={[
          "mt-5 grid gap-5",
          secaoAtual === "odontograma"
            ? "xl:grid-cols-1"
            : "xl:grid-cols-[minmax(0,1fr)_350px]",
        ].join(" ")}
      >
        <div className="min-w-0 space-y-5">
          {mensagem && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-800">
              {mensagem}
            </div>
          )}

          <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <nav className="flex min-w-max gap-2 px-4 pt-3">
              {secoes.map((secao) => {
                const Icon = secao.icon;
                const active = secaoAtual === secao.key;

                return (
                  <Link
                    key={secao.key}
                    href={secaoHref(secao.key)}
                    className={
                      active
                        ? "inline-flex h-11 items-center gap-2 border-b-2 border-indigo-600 px-3 text-sm font-black text-indigo-700"
                        : "inline-flex h-11 items-center gap-2 px-3 text-sm font-black text-slate-600 hover:text-indigo-700"
                    }
                  >
                    <Icon size={16} />
                    {secao.label}
                  </Link>
                );
              })}
            </nav>
          </section>

          {secaoAtual === "resumo" && renderResumo()}
          {secaoAtual === "anamnese" && renderAnamnese()}
          {secaoAtual === "evolucoes" && renderEvolucoes()}
          {secaoAtual === "odontograma" && renderOdontograma()}
          {secaoAtual === "ohf" && renderOHF()}
          {secaoAtual === "plano" && renderPlanoTratamento()}
          {secaoAtual === "procedimentos" && renderProcedimentos()}
          {secaoAtual === "exames" && renderExames()}
          {secaoAtual === "documentos" && renderDocumentos()}
        </div>

        <aside
          className={[
            "space-y-5",
            secaoAtual === "odontograma" ? "hidden" : "",
          ].join(" ")}
        >
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">Alertas do paciente</h2>
            <div className="mt-4 space-y-3">
              {alergias.map((item) => (
                <div
                  key={`alergia-${item}`}
                  className="rounded-lg border border-red-100 bg-red-50 p-3"
                >
                  <p className="font-black text-red-700">Alergia</p>
                  <p className="mt-1 text-sm font-semibold text-red-700">
                    {item}
                  </p>
                </div>
              ))}
              {condicoes.map((item) => (
                <div
                  key={`condicao-${item}`}
                  className="rounded-lg border border-amber-100 bg-amber-50 p-3"
                >
                  <p className="font-black text-amber-800">Condicao cronica</p>
                  <p className="mt-1 text-sm font-semibold text-amber-800">
                    {item}
                  </p>
                </div>
              ))}
              {medicamentos.map((item) => (
                <div
                  key={`medicamento-${item}`}
                  className="rounded-lg border border-indigo-100 bg-indigo-50 p-3"
                >
                  <p className="font-black text-indigo-700">
                    Medicamento em uso
                  </p>
                  <p className="mt-1 text-sm font-semibold text-indigo-700">
                    {item}
                  </p>
                </div>
              ))}
              {observacoesAlerta.map((item) => (
                <div
                  key={`observacao-${item}`}
                  className="rounded-lg border border-blue-100 bg-blue-50 p-3"
                >
                  <p className="font-black text-blue-700">
                    Observacao importante
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {item}
                  </p>
                </div>
              ))}
              {documentosImportantes.map((documento) => (
                <div
                  key={`doc-${documento.id}`}
                  className="rounded-lg border border-blue-100 bg-blue-50 p-3"
                >
                  <p className="font-black text-blue-700">{documento.tipo}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {documento.nome}
                  </p>
                </div>
              ))}
              {!alergias.length &&
                !condicoes.length &&
                !medicamentos.length &&
                !observacoesAlerta.length &&
                !documentosImportantes.length && <EmptyState />}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black text-slate-950">
                Proximos atendimentos
              </h2>
              <Link href="/agenda" className="text-xs font-black text-indigo-700">
                Ver agenda
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {proximos.slice(0, 3).map((item) => (
                <div
                  key={String(item.id)}
                  className="rounded-lg border border-emerald-100 bg-emerald-50 p-3"
                >
                  <p className="font-black text-slate-900">
                    {item.procedimento || item.tipo}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {formatDate(item.data)} - {item.hora || item.horario}
                  </p>
                </div>
              ))}
              {!proximos.length && (
                <EmptyState text="Nenhum atendimento futuro agendado." />
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">Acoes rapidas</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href={`/agenda/novo?pacienteId=${pacienteId}`}
                className="rounded-lg border border-slate-200 p-3 text-center text-xs font-black text-indigo-700"
              >
                Novo atendimento
              </Link>
              <Link
                href={`/pacientes/${pacienteId}?aba=prontuario&secao=evolucoes&acao=nova`}
                className="rounded-lg border border-slate-200 p-3 text-center text-xs font-black text-indigo-700"
              >
                Nova evolução
              </Link>
              <Link
                href={`/pacientes/${pacienteId}?aba=prontuario&secao=documentos`}
                className="rounded-lg border border-slate-200 p-3 text-center text-xs font-black text-indigo-700"
              >
                Enviar documento
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 p-3 text-center text-xs font-black text-indigo-700"
              >
                <Printer size={15} />
                Imprimir
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
