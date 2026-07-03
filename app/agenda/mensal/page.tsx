"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";
import {
  type AgendamentoLocal,
  getAgendamentosLocais,
} from "@/utils/agendaLocal";
import {
  getPacientesLocais,
  type PacienteLocal,
} from "@/utils/localCadastro";

const semana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

type EventoAgenda = {
  id: number;
  data: string;
  hora: string;
  paciente: string;
  tipo: string;
  prioridade: string;
  status: string;
  cor: string;
};

const eventosBase: EventoAgenda[] = [
  {
    id: 1,
    data: "2026-06-24",
    hora: "09:00",
    paciente: "Maria Silva",
    tipo: "Restauração",
    prioridade: "Normal",
    status: "Confirmado",
    cor: "bg-cyan-500",
  },
  {
    id: 2,
    data: "2026-06-24",
    hora: "10:30",
    paciente: "João Almeida",
    tipo: "Tratamento de canal",
    prioridade: "Urgente",
    status: "Aguardando",
    cor: "bg-red-500",
  },
  {
    id: 3,
    data: "2026-06-25",
    hora: "14:00",
    paciente: "Ana Costa",
    tipo: "Clareamento",
    prioridade: "Normal",
    status: "Confirmado",
    cor: "bg-cyan-500",
  },
  {
    id: 4,
    data: "2026-06-24",
    hora: "16:00",
    paciente: "Pedro Lima",
    tipo: "Profilaxia",
    prioridade: "Retorno",
    status: "Pendente",
    cor: "bg-emerald-500",
  },
];

function criarDataLocal(valor: string) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarData(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function getCorEvento(agendamento: Pick<AgendamentoLocal, "prioridade" | "tipo">) {
  const texto = `${agendamento.prioridade} ${agendamento.tipo}`.toLowerCase();

  if (texto.includes("urgent")) {
    return "bg-red-500";
  }

  if (texto.includes("retorno")) {
    return "bg-emerald-500";
  }

  if (texto.includes("proced")) {
    return "bg-amber-500";
  }

  return "bg-cyan-500";
}

function getLinkPaciente(nomePaciente: string, pacientesLocais: PacienteLocal[]) {
  const paciente = [...pacientes, ...pacientesLocais].find(
    (item) => item.nome === nomePaciente
  );

  if (!paciente) {
    return "/pacientes";
  }

  if (paciente.tipoAtendimento === "estetica") {
    return `/estetica-odontologica?paciente=${encodeURIComponent(
      paciente.nome
    )}&pacienteId=${paciente.id}`;
  }

  return `/pacientes/${paciente.id}`;
}

function getDiasDoCalendario(mesAtual: Date) {
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
  const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
  const deslocamentoInicio = (primeiroDia.getDay() + 6) % 7;
  const totalDias = Math.ceil((deslocamentoInicio + ultimoDia.getDate()) / 7) * 7;

  return Array.from({ length: totalDias }, (_, index) => {
    const data = new Date(primeiroDia);
    data.setDate(1 - deslocamentoInicio + index);

    return {
      data,
      chave: formatarData(data),
      outroMes: data.getMonth() !== mesAtual.getMonth(),
    };
  });
}

function pertenceAoFiltro(evento: EventoAgenda, filtro: string) {
  const texto = `${evento.tipo} ${evento.prioridade}`.toLowerCase();

  if (filtro === "Consultas") {
    return texto.includes("consulta") || texto.includes("avalia");
  }

  if (filtro === "Retornos") {
    return texto.includes("retorno");
  }

  if (filtro === "Procedimentos") {
    return !texto.includes("consulta") && !texto.includes("retorno");
  }

  if (filtro === "Urgências") {
    return texto.includes("urgent");
  }

  return true;
}

export default function AgendaMensal() {
  const [mesAtual, setMesAtual] = useState(() => new Date(2026, 5, 1));
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [agendamentosLocais, setAgendamentosLocais] = useState<
    AgendamentoLocal[]
  >([]);
  const [pacientesLocais, setPacientesLocais] = useState<PacienteLocal[]>([]);

  useEffect(() => {
    const atualizarAgenda = () => {
      setAgendamentosLocais(getAgendamentosLocais());
      setPacientesLocais(getPacientesLocais());
    };

    atualizarAgenda();
    window.addEventListener("cliniplus:agenda", atualizarAgenda);
    window.addEventListener("cliniplus:pacientes", atualizarAgenda);
    window.addEventListener("storage", atualizarAgenda);

    return () => {
      window.removeEventListener("cliniplus:agenda", atualizarAgenda);
      window.removeEventListener("cliniplus:pacientes", atualizarAgenda);
      window.removeEventListener("storage", atualizarAgenda);
    };
  }, []);

  const eventos = useMemo(
    () => [
      ...eventosBase,
      ...agendamentosLocais.map((agendamento) => ({
        id: agendamento.id,
        data: agendamento.data,
        hora: agendamento.hora,
        paciente: agendamento.paciente,
        tipo: agendamento.procedimento || agendamento.tipo,
        prioridade: agendamento.prioridade,
        status: agendamento.status,
        cor: getCorEvento(agendamento),
      })),
    ],
    [agendamentosLocais]
  );

  const eventosDoMes = useMemo(
    () =>
      eventos.filter((evento) => {
        const data = criarDataLocal(evento.data);
        return (
          data.getMonth() === mesAtual.getMonth() &&
          data.getFullYear() === mesAtual.getFullYear()
        );
      }),
    [eventos, mesAtual]
  );

  const eventosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return eventosDoMes.filter((evento) => {
      const bateBusca =
        !termo ||
        evento.paciente.toLowerCase().includes(termo) ||
        evento.tipo.toLowerCase().includes(termo);

      return bateBusca && pertenceAoFiltro(evento, filtro);
    });
  }, [busca, eventosDoMes, filtro]);

  const diasCalendario = useMemo(() => getDiasDoCalendario(mesAtual), [mesAtual]);
  const eventosPorDia = useMemo(() => {
    return eventosFiltrados.reduce<Record<string, EventoAgenda[]>>(
      (acc, evento) => {
        acc[evento.data] = [...(acc[evento.data] || []), evento].sort((a, b) =>
          a.hora.localeCompare(b.hora)
        );
        return acc;
      },
      {}
    );
  }, [eventosFiltrados]);

  const consultas = eventosDoMes.filter((evento) =>
    pertenceAoFiltro(evento, "Consultas")
  ).length;
  const retornos = eventosDoMes.filter((evento) =>
    pertenceAoFiltro(evento, "Retornos")
  ).length;
  const urgencias = eventosDoMes.filter((evento) =>
    pertenceAoFiltro(evento, "Urgências")
  ).length;
  const procedimentos = eventosDoMes.length - consultas - retornos;
  const resumoCards = [
    {
      titulo: "Consultas",
      valor: consultas,
      detalhe: "Agendadas no mês",
      filtro: "Consultas",
      cor: "text-cyan-600",
      ativo: "border-cyan-200 bg-cyan-50",
    },
    {
      titulo: "Retornos",
      valor: retornos,
      detalhe: "Acompanhamentos",
      filtro: "Retornos",
      cor: "text-emerald-600",
      ativo: "border-emerald-200 bg-emerald-50",
    },
    {
      titulo: "Procedimentos",
      valor: procedimentos,
      detalhe: "Tratamentos marcados",
      filtro: "Procedimentos",
      cor: "text-amber-600",
      ativo: "border-amber-200 bg-amber-50",
    },
    {
      titulo: "Urgências",
      valor: urgencias,
      detalhe: "Prioridade clínica",
      filtro: "Urgências",
      cor: "text-red-600",
      ativo: "border-red-200 bg-red-50",
    },
  ];

  function mudarMes(direcao: number) {
    setMesAtual(
      new Date(mesAtual.getFullYear(), mesAtual.getMonth() + direcao, 1)
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Agenda" />

        <section className="flex-1 p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Agenda mensal</h2>
              <p className="mt-1 text-sm text-slate-500">
                Calendário mensal da clínica com consultas, retornos e
                procedimentos
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/agenda"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Ver agenda do dia
              </Link>

              <button
                type="button"
                onClick={() => mudarMes(-1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                ← Mês anterior
              </button>

              <button
                type="button"
                onClick={() => mudarMes(1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Próximo mês →
              </button>

              <Link
                href="/agenda/novo"
                className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Novo agendamento
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {resumoCards.map((card) => {
              const ativo = filtro === card.filtro;

              return (
                <button
                  key={card.titulo}
                  type="button"
                  onClick={() =>
                    setFiltro((filtroAtual) =>
                      filtroAtual === card.filtro ? "Todos" : card.filtro
                    )
                  }
                  className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50 ${
                    ativo
                      ? card.ativo
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-500">{card.titulo}</p>
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
                      {ativo ? "Filtrando" : "Clique"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-bold">{card.valor}</h3>
                  <p className={`mt-1 text-xs ${card.cor}`}>{card.detalhe}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-xl font-bold">
                  {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Os novos agendamentos aparecem marcados no dia correto
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar paciente..."
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none"
                />

                <select
                  value={filtro}
                  onChange={(event) => setFiltro(event.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none"
                >
                  <option>Todos</option>
                  <option>Consultas</option>
                  <option>Retornos</option>
                  <option>Procedimentos</option>
                  <option>Urgências</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2">
              {semana.map((dia) => (
                <div
                  key={dia}
                  className="rounded-xl bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-500"
                >
                  {dia}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {diasCalendario.map((dia) => {
                const eventosDoDia = eventosPorDia[dia.chave] || [];
                const hoje = dia.chave === "2026-06-24";

                return (
                  <div
                    key={dia.chave}
                    className={`min-h-28 rounded-2xl border p-3 transition hover:border-cyan-300 hover:shadow-sm ${
                      hoje
                        ? "border-cyan-600 bg-cyan-50"
                        : dia.outroMes
                          ? "border-slate-100 bg-white text-slate-300"
                          : "border-slate-100 bg-slate-50 text-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/agenda?data=${dia.chave}`}
                        className={
                          dia.outroMes
                            ? "text-lg font-bold text-slate-300"
                            : "text-lg font-bold text-slate-800"
                        }
                      >
                        {dia.data.getDate()}
                      </Link>

                      {hoje && (
                        <span className="rounded-full bg-cyan-600 px-2 py-1 text-[9px] font-bold text-white">
                          Hoje
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      {eventosDoDia.slice(0, 3).map((evento) => {
                        const linkPaciente = getLinkPaciente(
                          evento.paciente,
                          pacientesLocais
                        );

                        return (
                          <Link
                            key={`${evento.id}-${evento.hora}`}
                            href={linkPaciente}
                            className="block rounded-xl bg-white p-2 shadow-sm hover:bg-cyan-50"
                          >
                            <div className="flex gap-2">
                              <span
                                className={`mt-1 h-7 w-1 rounded-full ${evento.cor}`}
                              />

                              <div className="min-w-0">
                                <p className="truncate text-[10px] font-bold leading-tight">
                                  {evento.paciente}
                                </p>
                                <p className="mt-1 truncate text-[9px] text-slate-500">
                                  {evento.hora} • {evento.tipo}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}

                      {eventosDoDia.length > 3 && (
                        <Link
                          href={`/agenda?data=${dia.chave}`}
                          className="block rounded-xl bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700"
                        >
                          + {eventosDoDia.length - 3} atendimento(s)
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-bold">Legenda</h3>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-cyan-500" />
                  Consulta
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  Retorno
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  Procedimento
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  Urgência
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <h3 className="text-lg font-bold text-emerald-800">
                Dica Clini+
              </h3>

              <p className="mt-2 text-sm text-emerald-700">
                Ao salvar um novo agendamento, ele aparece nesta agenda mensal e
                também na agenda do dia correspondente.
              </p>

              <Link
                href="/agenda/novo"
                className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                Novo agendamento
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
