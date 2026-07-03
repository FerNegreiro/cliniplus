import type { Paciente } from "@/types";

export type PacienteLocal = Paciente & {
  cpf: string;
  nascimento: string;
  sexo: string;
  endereco: string;
  observacoes: string;
  responsavel: string;
  retorno?: string;
  valor?: string;
};

export type ProcedimentoEsteticoLocal = {
  paciente: string;
  procedimento: string;
  area: string;
  status: string;
  valor: string;
  retorno: string;
};

export type HofLiveDataLocal = {
  prontuario: {
    avaliacao: string;
    plano: string;
    anamnese: string;
  };
  info: {
    nascimento: string;
    telefone: string;
    email: string;
    convenio: string;
    tipo: string;
  };
  procedures: ProcedimentoEsteticoLocal[];
  products: {
    nome: string;
    lote: string;
    validade: string;
    uso: string;
  }[];
  finance: {
    valor: string;
    status: string;
  };
  documents: {
    nome: string;
    detalhe: string;
  }[];
  history: {
    titulo: string;
    descricao: string;
    status: string;
    data: string;
  }[];
};

const pacientesKey = "cliniplus:pacientes";
const procedimentosKey = "cliniplus:procedimentos-esteticos";
const pacientesExcluidosKey = "cliniplus:pacientes-excluidos";

export type PacienteExcluido = {
  id: number;
  nome: string;
};

function safeParse<T>(valor: string | null, fallback: T): T {
  if (!valor) {
    return fallback;
  }

  try {
    return JSON.parse(valor) as T;
  } catch {
    return fallback;
  }
}

export function getPacientesLocais() {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse<PacienteLocal[]>(
    window.localStorage.getItem(pacientesKey),
    []
  );
}

export function salvarPacienteLocal(paciente: PacienteLocal) {
  const pacientes = getPacientesLocais();
  const proximosPacientes = [
    ...pacientes.filter((item) => item.id !== paciente.id),
    paciente,
  ];

  window.localStorage.setItem(pacientesKey, JSON.stringify(proximosPacientes));
  window.dispatchEvent(new Event("cliniplus:pacientes"));
}

export function getPacientesExcluidos() {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse<PacienteExcluido[]>(
    window.localStorage.getItem(pacientesExcluidosKey),
    []
  );
}

export function excluirPaciente(paciente: PacienteExcluido) {
  const pacientes = getPacientesLocais();
  const excluidos = getPacientesExcluidos();
  const proximosPacientes = pacientes.filter(
    (item) => item.id !== paciente.id && item.nome !== paciente.nome
  );
  const proximosExcluidos = [
    ...excluidos.filter((item) => item.id !== paciente.id),
    paciente,
  ];

  window.localStorage.setItem(pacientesKey, JSON.stringify(proximosPacientes));
  window.localStorage.setItem(
    pacientesExcluidosKey,
    JSON.stringify(proximosExcluidos)
  );
  window.localStorage.removeItem(`cliniplus:patient-live:${paciente.id}`);
  window.localStorage.removeItem(`cliniplus:hof-live:${paciente.nome}`);
  window.dispatchEvent(new Event("cliniplus:pacientes"));
  window.dispatchEvent(new Event("cliniplus:patient-live"));
  window.dispatchEvent(new Event("cliniplus:hof-live"));
}

export function getProcedimentosEsteticosLocais() {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse<ProcedimentoEsteticoLocal[]>(
    window.localStorage.getItem(procedimentosKey),
    []
  );
}

export function salvarProcedimentoEsteticoLocal(
  procedimento: ProcedimentoEsteticoLocal
) {
  const procedimentos = getProcedimentosEsteticosLocais();
  const proximosProcedimentos = [
    ...procedimentos.filter(
      (item) =>
        item.paciente !== procedimento.paciente ||
        item.procedimento !== procedimento.procedimento
    ),
    procedimento,
  ];

  window.localStorage.setItem(
    procedimentosKey,
    JSON.stringify(proximosProcedimentos)
  );
  window.dispatchEvent(new Event("cliniplus:procedimentos-esteticos"));
}

export function salvarHofLiveDataLocal(
  nomePaciente: string,
  dados: HofLiveDataLocal
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    `cliniplus:hof-live:${nomePaciente}`,
    JSON.stringify(dados)
  );
  window.dispatchEvent(new Event("cliniplus:hof-live"));
}
