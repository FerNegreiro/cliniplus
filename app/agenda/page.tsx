"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  Lock,
  MessageSquare,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  type CliniplusAgendamento,
  deleteAgendamento,
  getAgendamentos,
  updateAgendamento,
} from "@/utils/cliniplusStore";

type StatusAgenda =
  | "confirmado"
  | "em_atendimento"
  | "aguardando"
  | "cancelado"
  | "bloqueio"
  | "outro";

const horarios = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const statusOptions = [
  { value: "todos", label: "Todos" },
  { value: "confirmado", label: "Confirmado" },
  { value: "em_atendimento", label: "Em atendimento" },
  { value: "aguardando", label: "Aguardando" },
  { value: "cancelado", label: "Cancelado" },
  { value: "bloqueio", label: "Bloqueio" },
];

function criarDataLocal(valor: string) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarIso(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function hojeIso() {
  return formatarIso(new Date());
}

function adicionarDias(valor: string, quantidade: number) {
  const data = criarDataLocal(valor);
  data.setDate(data.getDate() + quantidade);
  return formatarIso(data);
}

function adicionarMeses(valor: string, quantidade: number) {
  const data = criarDataLocal(valor);
  data.setMonth(data.getMonth() + quantidade);
  return formatarIso(data);
}

function getInicioSemana(valor: string) {
  const data = criarDataLocal(valor);
  const dia = data.getDay();
  const deslocamento = dia === 0 ? -6 : 1 - dia;
  data.setDate(data.getDate() + deslocamento);
  return data;
}

function getDiasMesCalendario(valor: string) {
  const dataBase = criarDataLocal(valor);
  const primeiroDia = new Date(dataBase.getFullYear(), dataBase.getMonth(), 1);
  const deslocamentoInicio = primeiroDia.getDay();

  return Array.from({ length: 42 }, (_, index) => {
    const data = new Date(primeiroDia);
    data.setDate(1 - deslocamentoInicio + index);

    return {
      data,
      iso: formatarIso(data),
      foraDoMes: data.getMonth() !== dataBase.getMonth(),
    };
  });
}

function getDiasVisiveis(dataSelecionada: string, visualizacao: string) {
  if (visualizacao === "Dia") {
    const data = criarDataLocal(dataSelecionada);
    return [{ data, iso: formatarIso(data) }];
  }

  if (visualizacao === "Mes") {
    return getDiasMesCalendario(dataSelecionada).map(({ data, iso }) => ({
      data,
      iso,
    }));
  }

  const inicio = getInicioSemana(dataSelecionada);
  return Array.from({ length: 6 }, (_, index) => {
    const data = new Date(inicio);
    data.setDate(inicio.getDate() + index);
    return { data, iso: formatarIso(data) };
  });
}

function formatarDataCurta(valor: string) {
  return criarDataLocal(valor).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatarDataLonga(valor: string) {
  return criarDataLocal(valor).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarMesAno(valor: string) {
  return criarDataLocal(valor).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function normalizarVisualizacao(valor?: string | null) {
  const texto = normalizarTexto(valor || "");

  if (texto === "dia") return "Dia";
  if (texto === "mes" || texto === "mês") return "Mes";
  return "Semana";
}

function normalizarTexto(valor?: string) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function normalizarStatus(status?: string): StatusAgenda {
  const texto = normalizarTexto(status);

  if (texto.includes("confirm")) {
    return "confirmado";
  }

  if (texto.includes("atendimento")) {
    return "em_atendimento";
  }

  if (texto.includes("aguard") || texto.includes("pendente")) {
    return "aguardando";
  }

  if (texto.includes("cancel") || texto.includes("falta")) {
    return "cancelado";
  }

  if (texto.includes("bloque")) {
    return "bloqueio";
  }

  return "outro";
}

function labelStatus(status?: string) {
  const normalizado = normalizarStatus(status);

  if (normalizado === "confirmado") return "Confirmado";
  if (normalizado === "em_atendimento") return "Em atendimento";
  if (normalizado === "aguardando") return "Aguardando";
  if (normalizado === "cancelado") return "Cancelado";
  if (normalizado === "bloqueio") return "Bloqueio";
  return status || "Sem status";
}

function getPacienteNome(agendamento: CliniplusAgendamento) {
  return agendamento.pacienteNome || agendamento.paciente || "Paciente";
}

function getTipoAtendimento(agendamento: CliniplusAgendamento) {
  return (
    agendamento.tipoAtendimento ||
    agendamento.procedimento ||
    agendamento.tipo ||
    "Atendimento"
  );
}

function getHorario(agendamento: CliniplusAgendamento) {
  return agendamento.horario || agendamento.hora || "";
}

function getHoraBase(horario: string) {
  return `${horario.slice(0, 2)}:00`;
}

function getProfissional(agendamento: CliniplusAgendamento) {
  return agendamento.profissional || "Dr. Rafael Oliveira";
}

function getUnidade(agendamento: CliniplusAgendamento) {
  return agendamento.pagamento === "Convenio" ? "Clini+ Convenios" : "Clini+ Centro";
}

function getEspecialidade(agendamento: CliniplusAgendamento) {
  const texto = getTipoAtendimento(agendamento).toLowerCase();

  if (texto.includes("fisioterapia")) return "Fisioterapia";
  if (texto.includes("nutri")) return "Nutricao";
  if (texto.includes("psic")) return "Psicologia";
  if (texto.includes("estet") || texto.includes("hof")) return "Estetica / HOF";
  return "Odontologia";
}

function statusCardClasses(status?: string) {
  const normalizado = normalizarStatus(status);

  if (normalizado === "confirmado") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  if (normalizado === "em_atendimento") {
    return "border-violet-200 bg-violet-50 text-violet-950";
  }

  if (normalizado === "aguardando") {
    return "border-orange-200 bg-orange-50 text-orange-950";
  }

  if (normalizado === "cancelado") {
    return "border-rose-200 bg-rose-50 text-rose-950";
  }

  if (normalizado === "bloqueio") {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-950";
}

function statusDotClasses(status?: string) {
  const normalizado = normalizarStatus(status);

  if (normalizado === "confirmado") return "bg-emerald-500";
  if (normalizado === "em_atendimento") return "bg-violet-500";
  if (normalizado === "aguardando") return "bg-orange-500";
  if (normalizado === "cancelado") return "bg-rose-500";
  if (normalizado === "bloqueio") return "bg-slate-500";
  return "bg-blue-500";
}

function getLinkPaciente(agendamento: CliniplusAgendamento) {
  return agendamento.pacienteId ? `/pacientes/${agendamento.pacienteId}` : "/pacientes";
}

function valoresUnicos(valores: string[]) {
  return Array.from(new Set(valores.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export default function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState(hojeIso);
  const [visualizacao, setVisualizacao] = useState("Semana");
  const [busca, setBusca] = useState("");
  const [profissional, setProfissional] = useState("Todos");
  const [unidade, setUnidade] = useState("Todas");
  const [sala, setSala] = useState("Todas");
  const [especialidade, setEspecialidade] = useState("Todas");
  const [status, setStatus] = useState("todos");
  const [agendamentos, setAgendamentos] = useState<CliniplusAgendamento[]>([]);
  const [selecionadoId, setSelecionadoId] = useState<string | number | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [destacarLivres, setDestacarLivres] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const dataQuery = query.get("data");
    const visualizacaoQuery = query.get("visualizacao");

    if (dataQuery) {
      setDataSelecionada(dataQuery);
    }

    if (visualizacaoQuery) {
      setVisualizacao(normalizarVisualizacao(visualizacaoQuery));
    }
  }, []);

  useEffect(() => {
    const carregar = () => setAgendamentos(getAgendamentos());

    carregar();
    window.addEventListener("cliniplus:store", carregar);
    window.addEventListener("storage", carregar);

    return () => {
      window.removeEventListener("cliniplus:store", carregar);
      window.removeEventListener("storage", carregar);
    };
  }, []);

  useEffect(() => {
    if (mensagem) {
      const timeout = window.setTimeout(() => setMensagem(""), 3200);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [mensagem]);

  const diasVisiveis = useMemo(
    () => getDiasVisiveis(dataSelecionada, visualizacao),
    [dataSelecionada, visualizacao]
  );
  const diasDoMes = useMemo(
    () => getDiasMesCalendario(dataSelecionada),
    [dataSelecionada]
  );
  const primeiraData = diasVisiveis[0]?.iso || dataSelecionada;
  const ultimaData = diasVisiveis[diasVisiveis.length - 1]?.iso || dataSelecionada;
  const hoje = hojeIso();

  const opcoesProfissionais = useMemo(
    () => valoresUnicos(agendamentos.map(getProfissional)),
    [agendamentos]
  );
  const opcoesUnidades = useMemo(
    () => valoresUnicos(agendamentos.map(getUnidade)),
    [agendamentos]
  );
  const opcoesSalas = useMemo(
    () => valoresUnicos(agendamentos.map((item) => item.sala || "Sala 01")),
    [agendamentos]
  );
  const opcoesEspecialidades = useMemo(
    () => valoresUnicos(agendamentos.map(getEspecialidade)),
    [agendamentos]
  );

  const agendamentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const datas = new Set(diasVisiveis.map((dia) => dia.iso));

    return agendamentos
      .filter((agendamento) => datas.has(agendamento.data))
      .filter((agendamento) => {
        const textoBusca = [
          getPacienteNome(agendamento),
          getProfissional(agendamento),
          agendamento.sala,
          getTipoAtendimento(agendamento),
          agendamento.observacoes,
        ]
          .join(" ")
          .toLowerCase();

        if (termo && !textoBusca.includes(termo)) return false;
        if (profissional !== "Todos" && getProfissional(agendamento) !== profissional) {
          return false;
        }
        if (unidade !== "Todas" && getUnidade(agendamento) !== unidade) return false;
        if (sala !== "Todas" && agendamento.sala !== sala) return false;
        if (
          especialidade !== "Todas" &&
          getEspecialidade(agendamento) !== especialidade
        ) {
          return false;
        }
        if (status !== "todos" && normalizarStatus(agendamento.status) !== status) {
          return false;
        }

        return true;
      })
      .sort((a, b) => getHorario(a).localeCompare(getHorario(b)));
  }, [
    agendamentos,
    busca,
    diasVisiveis,
    especialidade,
    profissional,
    sala,
    status,
    unidade,
  ]);

  const agendamentosPorDia = useMemo(
    () =>
      agendamentosFiltrados.reduce<Record<string, CliniplusAgendamento[]>>(
        (acc, agendamento) => {
          acc[agendamento.data] = [...(acc[agendamento.data] || []), agendamento].sort(
            (a, b) => getHorario(a).localeCompare(getHorario(b))
          );
          return acc;
        },
        {}
      ),
    [agendamentosFiltrados]
  );

  const agendamentosHoje = agendamentos.filter((item) => item.data === hoje);
  const resumo = {
    hoje: agendamentosHoje.length,
    confirmados: agendamentosHoje.filter(
      (item) => normalizarStatus(item.status) === "confirmado"
    ).length,
    aguardando: agendamentosHoje.filter(
      (item) => normalizarStatus(item.status) === "aguardando"
    ).length,
    cancelados: agendamentosHoje.filter(
      (item) => normalizarStatus(item.status) === "cancelado"
    ).length,
    profissionais: valoresUnicos(
      agendamentosHoje
        .filter((item) => normalizarStatus(item.status) !== "cancelado")
        .map(getProfissional)
    ).length,
  };

  const selecionado = useMemo(
    () =>
      agendamentos.find((item) => String(item.id) === String(selecionadoId)) ||
      null,
    [agendamentos, selecionadoId]
  );

  const aguardando = agendamentosFiltrados.filter(
    (item) => normalizarStatus(item.status) === "aguardando"
  );
  const encaixes = agendamentosFiltrados.filter(
    (item) =>
      normalizarStatus(item.status) === "aguardando" ||
      normalizarTexto(item.prioridade).includes("encaixe") ||
      !getHorario(item)
  );

  function atualizarStatus(agendamento: CliniplusAgendamento, novoStatus: string) {
    updateAgendamento(agendamento.id, { status: novoStatus });
    setSelecionadoId(agendamento.id);
    setMensagem(`Status de ${getPacienteNome(agendamento)} atualizado.`);
  }

  function excluirAgendamento(agendamento: CliniplusAgendamento) {
    const confirmar = window.confirm(
      `Excluir o agendamento de ${getPacienteNome(agendamento)}?`
    );

    if (!confirmar) return;

    deleteAgendamento(agendamento.id);
    if (String(selecionadoId) === String(agendamento.id)) {
      setSelecionadoId(null);
    }
    setMensagem("Agendamento excluido da agenda.");
  }

  function irParaVisualizacao(modo: string) {
    setVisualizacao(modo);

    const query = new URLSearchParams(window.location.search);
    query.set("visualizacao", modo.toLowerCase());
    query.set("data", dataSelecionada);
    const destino = `/agenda?${query.toString()}`;

    if (window.location.pathname === "/agenda") {
      window.history.replaceState(null, "", destino);
    }
  }

  const periodo =
    visualizacao === "Mes"
      ? formatarMesAno(dataSelecionada)
      : primeiraData === ultimaData
      ? formatarDataLonga(primeiraData)
      : `${formatarDataCurta(primeiraData)} - ${formatarDataCurta(ultimaData)}`;

  return (
    <main className="min-h-screen bg-[#f6f8ff] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar active="Agenda" />

        <section className="min-w-0 flex-1 px-5 py-5 lg:px-7">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                Agenda Inteligente
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Organize atendimentos, profissionais, salas e confirmacoes em um so lugar
              </p>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar paciente, profissional, sala ou agendamento..."
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-700 shadow-sm"
                  aria-label="Notificacoes"
                >
                  <Bell size={19} />
                  {aguardando.length > 0 && (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-700 shadow-sm"
                  aria-label="Mensagens"
                  onClick={() => setMensagem("Central de mensagens aberta para esta agenda.")}
                >
                  <MessageSquare size={19} />
                </button>
                <Link
                  href="/agenda/novo"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Plus size={18} />
                  Novo agendamento
                  <ChevronDown size={16} />
                </Link>
              </div>
            </div>
          </div>

          {mensagem && (
            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
              {mensagem}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
              >
                <CalendarDays size={18} className="text-indigo-600" />
                {periodo}
                <ChevronDown size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDataSelecionada(hoje)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() =>
                  setDataSelecionada(
                    visualizacao === "Mes"
                      ? adicionarMeses(dataSelecionada, -1)
                      : adicionarDias(dataSelecionada, visualizacao === "Dia" ? -1 : -7)
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
                aria-label="Periodo anterior"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setDataSelecionada(
                    visualizacao === "Mes"
                      ? adicionarMeses(dataSelecionada, 1)
                      : adicionarDias(dataSelecionada, visualizacao === "Dia" ? 1 : 7)
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
                aria-label="Proximo periodo"
              >
                <ChevronRight size={19} />
              </button>

              <div className="ml-0 flex h-11 rounded-lg border border-slate-200 bg-slate-50 p-1 xl:ml-3">
                {["Dia", "Semana", "Mes"].map((modo) => (
                  <button
                    key={modo}
                    type="button"
                    onClick={() => irParaVisualizacao(modo)}
                    className={`rounded-md px-4 text-sm font-extrabold transition ${
                      visualizacao === modo
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-indigo-700"
                    }`}
                  >
                    {modo === "Mes" ? "Mes" : modo}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6 xl:min-w-[720px]">
              <select
                value={profissional}
                onChange={(event) => setProfissional(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none"
              >
                <option>Todos</option>
                {opcoesProfissionais.map((opcao) => (
                  <option key={opcao}>{opcao}</option>
                ))}
              </select>
              <select
                value={unidade}
                onChange={(event) => setUnidade(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none"
              >
                <option>Todas</option>
                {opcoesUnidades.map((opcao) => (
                  <option key={opcao}>{opcao}</option>
                ))}
              </select>
              <select
                value={sala}
                onChange={(event) => setSala(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none"
              >
                <option>Todas</option>
                {opcoesSalas.map((opcao) => (
                  <option key={opcao}>{opcao}</option>
                ))}
              </select>
              <select
                value={especialidade}
                onChange={(event) => setEspecialidade(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none"
              >
                <option>Todas</option>
                {opcoesEspecialidades.map((opcao) => (
                  <option key={opcao}>{opcao}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none"
              >
                {statusOptions.map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setBusca("");
                  setProfissional("Todos");
                  setUnidade("Todas");
                  setSala("Todas");
                  setEspecialidade("Todas");
                  setStatus("todos");
                  setMensagem("Filtros limpos.");
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-extrabold text-indigo-700"
              >
                <Filter size={17} />
                Filtros
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              {
                titulo: "Atendimentos hoje",
                valor: resumo.hoje,
                detalhe: "Agenda real do dia",
                icon: CalendarDays,
                classe: "bg-indigo-600 text-white",
              },
              {
                titulo: "Confirmados",
                valor: resumo.confirmados,
                detalhe: "Prontos para atender",
                icon: CheckCircle2,
                classe: "bg-emerald-500 text-white",
              },
              {
                titulo: "Aguardando confirmacao",
                valor: resumo.aguardando,
                detalhe: "Pendentes de retorno",
                icon: Clock3,
                classe: "bg-orange-400 text-white",
              },
              {
                titulo: "Cancelados / Faltas",
                valor: resumo.cancelados,
                detalhe: "No dia de hoje",
                icon: XCircle,
                classe: "bg-rose-500 text-white",
              },
              {
                titulo: "Profissionais ativos",
                valor: resumo.profissionais,
                detalhe: "Com agenda hoje",
                icon: Users,
                classe: "bg-blue-600 text-white",
              },
            ].map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.titulo}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.classe}`}>
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-500">
                        {card.titulo}
                      </p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        {card.valor}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {card.detalhe}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
              {visualizacao === "Mes" ? (
                <div className="p-4">
                  <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-black capitalize text-slate-950">
                        {formatarMesAno(dataSelecionada)}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Visao mensal com agendamentos salvos na agenda central.
                      </p>
                    </div>
                    <Link
                      href={`/agenda/novo?data=${dataSelecionada}`}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-black text-white"
                    >
                      Novo agendamento
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {diasSemana.map((dia) => (
                      <div
                        key={dia}
                        className="rounded-lg bg-slate-100 px-2 py-2 text-center text-xs font-black text-slate-500"
                      >
                        {dia}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 overflow-x-auto">
                    <div className="grid min-w-[780px] grid-cols-7 gap-2 lg:min-w-0">
                      {diasDoMes.map((dia) => {
                        const itens = agendamentosPorDia[dia.iso] || [];
                        const ativo = dia.iso === hoje;

                        return (
                          <div
                            key={dia.iso}
                            className={`min-h-32 rounded-lg border p-3 transition ${
                              ativo
                                ? "border-indigo-300 bg-indigo-50"
                                : dia.foraDoMes
                                  ? "border-slate-100 bg-slate-50 text-slate-400"
                                  : "border-slate-200 bg-white text-slate-900"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setDataSelecionada(dia.iso);
                                  setVisualizacao("Dia");
                                }}
                                className={`text-sm font-black ${
                                  dia.foraDoMes ? "text-slate-400" : "text-slate-900"
                                }`}
                              >
                                {dia.data.getDate()}
                              </button>
                              {ativo && (
                                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white">
                                  Hoje
                                </span>
                              )}
                            </div>

                            <div className="mt-3 space-y-1.5">
                              {itens.slice(0, 3).map((agendamento) => (
                                <button
                                  key={String(agendamento.id)}
                                  type="button"
                                  onClick={() => setSelecionadoId(agendamento.id)}
                                  className={`block w-full rounded-md border px-2 py-1.5 text-left text-[11px] font-bold ${statusCardClasses(
                                    agendamento.status
                                  )}`}
                                >
                                  <span className="block truncate">
                                    {getHorario(agendamento)} - {getPacienteNome(agendamento)}
                                  </span>
                                  <span className="mt-0.5 block truncate opacity-80">
                                    {getTipoAtendimento(agendamento)}
                                  </span>
                                </button>
                              ))}

                              {itens.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDataSelecionada(dia.iso);
                                    setVisualizacao("Dia");
                                  }}
                                  className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-black text-indigo-700"
                                >
                                  + {itens.length - 3} atendimentos
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <div
                  className="min-w-[980px] grid"
                  style={{
                    gridTemplateColumns: `64px repeat(${diasVisiveis.length}, minmax(150px, 1fr))`,
                  }}
                >
                  <div className="sticky left-0 z-20 border-b border-r border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-500">
                    GMT-03
                  </div>
                  {diasVisiveis.map((dia) => {
                    const ativo = dia.iso === hoje;

                    return (
                      <div
                        key={dia.iso}
                        className="border-b border-r border-slate-200 bg-white px-3 py-3 text-center"
                      >
                        <p className="text-sm font-black text-slate-800">
                          {diasSemana[dia.data.getDay()]} {formatarDataCurta(dia.iso)}
                        </p>
                        {ativo && (
                          <span className="mt-1 inline-flex rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white">
                            Hoje
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {horarios.map((hora) => (
                    <Fragment key={hora}>
                      <div
                        key={`${hora}-label`}
                        className="sticky left-0 z-10 min-h-[88px] border-b border-r border-slate-200 bg-white px-2 py-3 text-right text-xs font-bold text-slate-500"
                      >
                        {hora}
                      </div>
                      {diasVisiveis.map((dia) => {
                        const itens = agendamentosFiltrados.filter(
                          (item) =>
                            item.data === dia.iso && getHoraBase(getHorario(item)) === hora
                        );
                        const livreDestacado = destacarLivres && itens.length === 0;

                        return (
                          <div
                            key={`${dia.iso}-${hora}`}
                            className={`min-h-[88px] border-b border-r border-slate-200 p-2 ${
                              livreDestacado ? "bg-indigo-50" : "bg-white"
                            }`}
                          >
                            <div className="space-y-2">
                              {itens.map((agendamento) => (
                                <div
                                  key={agendamento.id}
                                  onClick={() => setSelecionadoId(agendamento.id)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      setSelecionadoId(agendamento.id);
                                    }
                                  }}
                                  className={`w-full rounded-md border p-2 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${statusCardClasses(
                                    agendamento.status
                                  )}`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="font-black leading-tight">
                                        {getHorario(agendamento)}
                                      </p>
                                      <p className="mt-1 truncate font-black">
                                        {getPacienteNome(agendamento)}
                                      </p>
                                    </div>
                                    {normalizarStatus(agendamento.status) === "bloqueio" ? (
                                      <Lock size={14} className="shrink-0" />
                                    ) : null}
                                  </div>
                                  <p className="mt-1 truncate font-semibold">
                                    {getTipoAtendimento(agendamento)}
                                  </p>
                                  <p className="mt-1 truncate text-[11px] opacity-80">
                                    {getProfissional(agendamento)}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-black">
                                      {labelStatus(agendamento.status)}
                                    </span>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    <button
                                      type="button"
                                      aria-label={`Ver detalhes de ${getPacienteNome(agendamento)}`}
                                      title="Ver detalhes"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setSelecionadoId(agendamento.id);
                                      }}
                                      className="inline-flex h-7 items-center justify-center rounded-md bg-white/75 px-2 font-black text-indigo-700"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    <Link
                                      href={getLinkPaciente(agendamento)}
                                      aria-label={`Abrir paciente ${getPacienteNome(agendamento)}`}
                                      title="Abrir paciente"
                                      onClick={(event) => event.stopPropagation()}
                                      className="inline-flex h-7 items-center justify-center rounded-md bg-white/75 px-2 font-black text-indigo-700"
                                    >
                                      <UserRound size={13} />
                                    </Link>
                                    <button
                                      type="button"
                                      aria-label={`Confirmar ${getPacienteNome(agendamento)}`}
                                      title="Confirmar"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        atualizarStatus(agendamento, "confirmado");
                                      }}
                                      className="inline-flex h-7 items-center justify-center rounded-md bg-white/75 px-2 font-black text-emerald-700"
                                    >
                                      <CheckCircle2 size={13} />
                                    </button>
                                    <Link
                                      href={`/agenda/novo?agendamentoId=${agendamento.id}&paciente=${encodeURIComponent(
                                        getPacienteNome(agendamento)
                                      )}&data=${agendamento.data}&hora=${getHorario(agendamento)}`}
                                      aria-label={`Reagendar ${getPacienteNome(agendamento)}`}
                                      title="Reagendar"
                                      onClick={(event) => event.stopPropagation()}
                                      className="inline-flex h-7 items-center justify-center rounded-md bg-white/75 px-2 font-black text-orange-700"
                                    >
                                      <RotateCcw size={13} />
                                    </Link>
                                    <button
                                      type="button"
                                      aria-label={`Cancelar ${getPacienteNome(agendamento)}`}
                                      title="Cancelar"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        atualizarStatus(agendamento, "cancelado");
                                      }}
                                      className="inline-flex h-7 items-center justify-center rounded-md bg-white/75 px-2 font-black text-rose-700"
                                    >
                                      <XCircle size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Excluir ${getPacienteNome(agendamento)}`}
                                      title="Excluir"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        excluirAgendamento(agendamento);
                                      }}
                                      className="inline-flex h-7 items-center justify-center rounded-md bg-white/75 px-2 font-black text-slate-700"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {livreDestacado && (
                                <Link
                                  href={`/agenda/novo?data=${dia.iso}&hora=${hora}`}
                                  className="flex h-12 items-center justify-center rounded-md border border-dashed border-indigo-300 bg-white text-[11px] font-black text-indigo-700"
                                >
                                  Horario livre
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-600">
                  {statusOptions.slice(1).map((opcao) => (
                    <span key={opcao.value} className="inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusDotClasses(opcao.value)}`} />
                      {opcao.label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setMensagem("Horario bloqueado deve ser criado como status Bloqueio em novo agendamento.")}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-indigo-700"
                  >
                    <Lock size={15} />
                    Bloquear horario
                  </button>
                  <Link
                    href="/agenda/novo?tipo=Teleconsulta"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-indigo-700"
                  >
                    <Video size={15} />
                    Teleconsulta
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMensagem("Agenda repetida preparada para a proxima semana.")}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-indigo-700"
                  >
                    <RotateCcw size={15} />
                    Repetir agenda
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-indigo-700"
                  >
                    <Printer size={15} />
                    Imprimir agenda
                  </button>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-950">
                    Fila de espera / Encaixes
                  </h2>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-black text-indigo-700">
                    {encaixes.length}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {encaixes.slice(0, 5).map((item) => (
                    <button
                      key={`encaixe-${item.id}`}
                      type="button"
                      onClick={() => setSelecionadoId(item.id)}
                      className="flex w-full items-center justify-between rounded-md bg-slate-50 p-3 text-left transition hover:bg-indigo-50"
                    >
                      <span>
                        <span className="block text-sm font-black text-slate-800">
                          {getHorario(item) || "Sem horario"}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                          {getPacienteNome(item)}
                        </span>
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
                        Encaixe
                      </span>
                    </button>
                  ))}
                  {encaixes.length === 0 && (
                    <div className="rounded-md border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">
                      Nenhum encaixe aguardando neste periodo.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-950">
                    Confirmacoes pendentes
                  </h2>
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-700">
                    {aguardando.length}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {aguardando.slice(0, 4).map((item) => (
                    <div
                      key={`pendente-${item.id}`}
                      className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-800">
                          {getPacienteNome(item)}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                          {formatarDataCurta(item.data)} as {getHorario(item)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMensagem("Lembrete marcado como enviado.")}
                        className="shrink-0 text-xs font-black text-indigo-700"
                      >
                        Enviar
                      </button>
                    </div>
                  ))}
                  {aguardando.length === 0 && (
                    <div className="rounded-md border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">
                      Tudo confirmado por enquanto.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-950">
                    Detalhes do agendamento
                  </h2>
                  {selecionado && (
                    <Link
                      href={`/agenda/novo?agendamentoId=${selecionado.id}&paciente=${encodeURIComponent(
                        getPacienteNome(selecionado)
                      )}&data=${selecionado.data}&hora=${getHorario(selecionado)}`}
                      className="rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-black text-indigo-700"
                    >
                      Editar
                    </Link>
                  )}
                </div>

                {selecionado ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">
                        {getPacienteNome(selecionado)
                          .split(" ")
                          .map((nome) => nome[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-950">
                          {getPacienteNome(selecionado)}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                          {getTipoAtendimento(selecionado)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      {[
                        ["Profissional", getProfissional(selecionado)],
                        ["Data e hora", `${formatarDataCurta(selecionado.data)} as ${getHorario(selecionado)}`],
                        ["Sala / Canal", selecionado.sala || "Nao informado"],
                        ["Status", labelStatus(selecionado.status)],
                        ["Observacoes", selecionado.observacoes || "Sem observacoes"],
                      ].map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[104px_1fr] gap-3">
                          <span className="font-bold text-slate-500">{label}</span>
                          <strong className="min-w-0 break-words text-slate-800">
                            {value}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => atualizarStatus(selecionado, "em_atendimento")}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 text-xs font-black text-white"
                      >
                        <CheckCircle2 size={15} />
                        Check-in
                      </button>
                      <Link
                        href={`/agenda/novo?agendamentoId=${selecionado.id}&paciente=${encodeURIComponent(
                          getPacienteNome(selecionado)
                        )}&data=${selecionado.data}&hora=${getHorario(selecionado)}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-black text-indigo-700"
                      >
                        <RotateCcw size={15} />
                        Reagendar
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMensagem("Lembrete marcado como enviado.")}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-black text-indigo-700"
                      >
                        <Send size={15} />
                        Lembrete
                      </button>
                      <Link
                        href={getLinkPaciente(selecionado)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700"
                      >
                        <UserRound size={15} />
                        Paciente
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => atualizarStatus(selecionado, "cancelado")}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 text-xs font-black text-rose-700"
                    >
                      <XCircle size={15} />
                      Cancelar agendamento
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-md border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">
                    Clique em um atendimento da grade para ver paciente, sala,
                    profissional, observacoes e acoes rapidas.
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-700">
                <Sparkles size={18} />
              </span>
              <p className="min-w-0 text-sm font-bold text-indigo-900">
                <strong>IA do Clini+:</strong> Existem horarios livres que podem receber encaixes hoje.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDestacarLivres((valor) => !valor);
                setMensagem("Horarios livres destacados na grade.");
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-indigo-700"
            >
              Ver sugestoes
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
