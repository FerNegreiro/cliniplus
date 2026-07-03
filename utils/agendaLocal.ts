export type AgendamentoLocal = {
  id: number;
  paciente: string;
  tipo: string;
  data: string;
  hora: string;
  duracao: string;
  sala: string;
  prioridade: string;
  status: string;
  valor: string;
  pagamento: string;
  procedimento: string;
  observacoes: string;
};

const agendaKey = "cliniplus:agenda";

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

export function getAgendamentosLocais() {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse<AgendamentoLocal[]>(
    window.localStorage.getItem(agendaKey),
    []
  );
}

export function salvarAgendamentoLocal(agendamento: AgendamentoLocal) {
  const agendamentos = getAgendamentosLocais();
  const proximosAgendamentos = [
    ...agendamentos.filter((item) => item.id !== agendamento.id),
    agendamento,
  ];

  window.localStorage.setItem(
    agendaKey,
    JSON.stringify(proximosAgendamentos)
  );
  window.dispatchEvent(new Event("cliniplus:agenda"));
}

export function excluirAgendamentoLocal(id: number) {
  const agendamentos = getAgendamentosLocais();
  const proximosAgendamentos = agendamentos.filter((item) => item.id !== id);

  window.localStorage.setItem(
    agendaKey,
    JSON.stringify(proximosAgendamentos)
  );
  window.dispatchEvent(new Event("cliniplus:agenda"));
}
