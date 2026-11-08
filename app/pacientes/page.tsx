"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Folder,
  HeartPulse,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Sparkles,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  type CliniplusAgendamento,
  type CliniplusDocumento,
  type CliniplusLancamentoFinanceiro,
  type CliniplusPaciente,
  type CliniplusProntuario,
  type CliniplusTratamento,
  getAgendamentosByPacienteId,
  getDocumentos,
  getDocumentosByPacienteId,
  getFinanceiroByPacienteId,
  getHistoricoPaciente,
  getPacientes,
  getProntuarioByPacienteId,
  getTratamentos,
  getTratamentosByPacienteId,
  type StoreId,
} from "@/utils/cliniplusStore";
import { normalizarTexto } from "@/utils/format";

type PacienteCompleto = CliniplusPaciente & {
  cpf?: string;
  nascimento?: string;
  sexo?: string;
  responsavel?: string;
  observacoes?: string;
  tags?: string[];
  tipoSanguineo?: string;
  alergias?: string;
  unidade?: string;
  criadoEm?: string;
};

type PacienteInsights = {
  ultimaConsulta?: CliniplusAgendamento;
  proximaConsulta?: CliniplusAgendamento;
  agendamentos: CliniplusAgendamento[];
  documentos: CliniplusDocumento[];
  tratamentos: CliniplusTratamento[];
  financeiro: CliniplusLancamentoFinanceiro[];
  prontuario: CliniplusProntuario | null;
  pendente: boolean;
  altoRisco: boolean;
  profissional: string;
  especialidade: string;
  tags: string[];
};

const statusFiltros = ["Todos", "Ativo", "Em tratamento", "Retorno pendente", "Inativo"];
const ultimaConsultaFiltros = ["Todas", "Com consulta", "Sem consulta"];
const pendenciasFiltros = ["Todas", "Com pendencias", "Sem pendencias"];
const abas = ["Todos", "Ativos", "Novos", "Pendentes", "Alto risco"];

function sameId(a?: StoreId | null, b?: StoreId | null) {
  return String(a) === String(b);
}

function hojeIso() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarData(valor?: string) {
  if (!valor) return "-";

  if (valor.includes("/")) return valor;

  const [ano, mes, dia] = valor.split("-").map(Number);
  if (!ano || !mes || !dia) return valor;

  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}

function getIniciais(nome: string) {
  return nome
    .split(" ")
    .map((parte) => parte[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getCodigoPaciente(id: StoreId) {
  const numero = String(id).replace(/\D/g, "").slice(-6).padStart(6, "0");
  return `#P${numero || String(id).slice(0, 6)}`;
}

function getIdade(paciente: PacienteCompleto) {
  if (paciente.nascimento) {
    const nascimento = paciente.nascimento.includes("/")
      ? paciente.nascimento.split("/").reverse().join("-")
      : paciente.nascimento;
    const dataNascimento = new Date(nascimento);

    if (!Number.isNaN(dataNascimento.getTime())) {
      const hoje = new Date();
      let idade = hoje.getFullYear() - dataNascimento.getFullYear();
      const mes = hoje.getMonth() - dataNascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
        idade -= 1;
      }
      return `${idade} anos`;
    }
  }

  return "-";
}

function statusClasse(status: string) {
  const texto = normalizarTexto(status);

  if (texto.includes("ativo")) return "bg-emerald-100 text-emerald-700";
  if (texto.includes("tratamento")) return "bg-blue-100 text-blue-700";
  if (texto.includes("retorno")) return "bg-orange-100 text-orange-700";
  if (texto.includes("inativo")) return "bg-slate-100 text-slate-600";
  return "bg-slate-100 text-slate-700";
}

function tagClasse(tag: string) {
  const texto = normalizarTexto(tag);

  if (texto.includes("alerg")) return "bg-rose-100 text-rose-700";
  if (texto.includes("vip")) return "bg-amber-100 text-amber-700";
  if (texto.includes("tele")) return "bg-blue-100 text-blue-700";
  if (texto.includes("risco")) return "bg-red-100 text-red-700";
  return "bg-violet-100 text-violet-700";
}

function getTagsPaciente(
  paciente: PacienteCompleto,
  documentos: CliniplusDocumento[],
  financeiro: CliniplusLancamentoFinanceiro[]
) {
  const tags = [...(paciente.tags || [])];
  const observacoes = normalizarTexto(paciente.observacoes);

  if (observacoes.includes("alerg") || paciente.alergias) tags.push("Alergia");
  if (financeiro.some((item) => normalizarTexto(item.status).includes("pendente"))) {
    tags.push("Financeiro");
  }
  if (documentos.some((item) => normalizarTexto(item.status).includes("pendente"))) {
    tags.push("Documento");
  }

  return Array.from(new Set(tags));
}

function getProfissionalPaciente(agendamentos: CliniplusAgendamento[]) {
  return agendamentos[0]?.profissional || "Nao definido";
}

function getEspecialidadePaciente(
  paciente: PacienteCompleto,
  agendamentos: CliniplusAgendamento[],
  tratamentos: CliniplusTratamento[]
) {
  return agendamentos[0]?.especialidade || tratamentos[0]?.descricao || paciente.area || "-";
}

function montarInsights(paciente: PacienteCompleto, hoje: string): PacienteInsights {
  const agendamentos = getAgendamentosByPacienteId(paciente.id).sort((a, b) =>
    `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`)
  );
  const documentos = getDocumentosByPacienteId(paciente.id);
  const tratamentos = getTratamentosByPacienteId(paciente.id);
  const financeiro = getFinanceiroByPacienteId(paciente.id);
  const prontuario = getProntuarioByPacienteId(paciente.id);
  const ultimaConsulta = [...agendamentos]
    .reverse()
    .find((item) => item.data <= hoje);
  const proximaConsulta = agendamentos.find((item) => item.data > hoje);
  const documentosPendentes = documentos.some((item) =>
    normalizarTexto(item.status).includes("pendente")
  );
  const financeiroPendente = financeiro.some((item) =>
    normalizarTexto(item.status).includes("pendente")
  );
  const retornoPendente =
    normalizarTexto(paciente.status).includes("retorno") ||
    agendamentos.some((item) => normalizarTexto(item.status).includes("aguard"));
  const tags = getTagsPaciente(paciente, documentos, financeiro);
  const altoRisco =
    tags.some((tag) => normalizarTexto(tag).includes("risco")) ||
    normalizarTexto(paciente.observacoes).includes("risco") ||
    normalizarTexto(paciente.alergias).includes("grave");

  return {
    ultimaConsulta,
    proximaConsulta,
    agendamentos,
    documentos,
    tratamentos,
    financeiro,
    prontuario,
    pendente: documentosPendentes || financeiroPendente || retornoPendente,
    altoRisco,
    profissional: getProfissionalPaciente(agendamentos),
    especialidade: getEspecialidadePaciente(paciente, agendamentos, tratamentos),
    tags,
  };
}

function getResumoProntuario(prontuario: CliniplusProntuario | null) {
  const dados = prontuario?.dados || {};
  const getTexto = (...chaves: string[]) => {
    for (const chave of chaves) {
      const valor = dados[chave];
      if (typeof valor === "string" && valor.trim()) return valor;
    }
    return "-";
  };

  return {
    diagnosticos: getTexto("diagnosticos", "diagnostico", "hipoteseDiagnostica"),
    queixas: getTexto("queixaPrincipal", "queixas", "queixa"),
    medicamentos: getTexto("medicamentos", "medicacao"),
    ultimaAnotacao: getTexto("evolucao", "ultimaAnotacao", "observacoes"),
  };
}

export default function Pacientes() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<PacienteCompleto[]>([]);
  const [documentos, setDocumentos] = useState<CliniplusDocumento[]>([]);
  const [tratamentos, setTratamentos] = useState<CliniplusTratamento[]>([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("Todos");
  const [profissional, setProfissional] = useState("Todos");
  const [convenio, setConvenio] = useState("Todos");
  const [tag, setTag] = useState("Todas");
  const [ultimaConsulta, setUltimaConsulta] = useState("Todas");
  const [pendencias, setPendencias] = useState("Todas");
  const [aba, setAba] = useState("Todos");
  const [selecionadoId, setSelecionadoId] = useState<StoreId | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const carregar = () => {
      setPacientes(getPacientes() as PacienteCompleto[]);
      setDocumentos(getDocumentos());
      setTratamentos(getTratamentos());
    };

    carregar();
    const buscaDaUrl = new URLSearchParams(window.location.search).get("busca");
    if (buscaDaUrl) {
      setBusca(buscaDaUrl);
    }

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

  const hoje = hojeIso();
  const insightsPorPaciente = useMemo(() => {
    return pacientes.reduce<Record<string, PacienteInsights>>((acc, paciente) => {
      acc[String(paciente.id)] = montarInsights(paciente, hoje);
      return acc;
    }, {});
  }, [hoje, pacientes]);

  const opcoesProfissionais = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(insightsPorPaciente)
            .map((item) => item.profissional)
            .filter((item) => item && item !== "Nao definido")
        )
      ).sort(),
    [insightsPorPaciente]
  );
  const opcoesConvenio = useMemo(
    () => Array.from(new Set(pacientes.map((item) => item.convenio).filter(Boolean))).sort(),
    [pacientes]
  );
  const opcoesTags = useMemo(
    () =>
      Array.from(
        new Set(Object.values(insightsPorPaciente).flatMap((item) => item.tags))
      ).sort(),
    [insightsPorPaciente]
  );

  const pacientesFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca.trim());

    return pacientes.filter((paciente) => {
      const insights = insightsPorPaciente[String(paciente.id)];
      const textoBusca = normalizarTexto(
        [
          paciente.nome,
          paciente.telefone,
          paciente.email,
          paciente.cpf,
          paciente.convenio,
          getCodigoPaciente(paciente.id),
          ...(insights?.tags || []),
        ].join(" ")
      );

      if (termo && !textoBusca.includes(termo)) return false;
      if (status !== "Todos" && paciente.status !== status) return false;
      if (profissional !== "Todos" && insights?.profissional !== profissional) return false;
      if (convenio !== "Todos" && paciente.convenio !== convenio) return false;
      if (tag !== "Todas" && !insights?.tags.includes(tag)) return false;
      if (ultimaConsulta === "Com consulta" && !insights?.ultimaConsulta) return false;
      if (ultimaConsulta === "Sem consulta" && insights?.ultimaConsulta) return false;
      if (pendencias === "Com pendencias" && !insights?.pendente) return false;
      if (pendencias === "Sem pendencias" && insights?.pendente) return false;

      if (aba === "Ativos" && paciente.status !== "Ativo") return false;
      if (aba === "Novos" && insights?.agendamentos.length > 0) return false;
      if (aba === "Pendentes" && !insights?.pendente) return false;
      if (aba === "Alto risco" && !insights?.altoRisco) return false;

      return true;
    });
  }, [
    aba,
    busca,
    convenio,
    insightsPorPaciente,
    pacientes,
    pendencias,
    profissional,
    status,
    tag,
    ultimaConsulta,
  ]);

  useEffect(() => {
    setPagina(1);
  }, [aba, busca, convenio, pendencias, profissional, status, tag, ultimaConsulta]);

  useEffect(() => {
    if (!pacientesFiltrados.length) {
      setSelecionadoId(null);
      return;
    }

    if (!selecionadoId || !pacientesFiltrados.some((item) => sameId(item.id, selecionadoId))) {
      setSelecionadoId(pacientesFiltrados[0].id);
    }
  }, [pacientesFiltrados, selecionadoId]);

  const selecionado =
    pacientes.find((paciente) => sameId(paciente.id, selecionadoId)) ||
    pacientesFiltrados[0] ||
    null;
  const insightsSelecionado = selecionado
    ? insightsPorPaciente[String(selecionado.id)]
    : null;

  const porPagina = 10;
  const totalPaginas = Math.max(1, Math.ceil(pacientesFiltrados.length / porPagina));
  const pacientesPagina = pacientesFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  const pacientesAtivos = pacientes.filter((item) => item.status === "Ativo").length;
  const novosEsteMes = pacientes.filter(
    (item) => !insightsPorPaciente[String(item.id)]?.agendamentos.length
  ).length;
  const retornoPendente = pacientes.filter((item) => {
    const insights = insightsPorPaciente[String(item.id)];
    return normalizarTexto(item.status).includes("retorno") || insights?.pendente;
  }).length;
  const documentosPendentes = documentos.filter((item) =>
    normalizarTexto(item.status).includes("pendente")
  ).length;
  const emAcompanhamento = tratamentos.filter((item) =>
    ["em andamento", "planejado", "urgente"].includes(normalizarTexto(item.status))
  ).length;

  function exportarCsv() {
    const linhas = [
      ["Nome", "Telefone", "Email", "Convenio", "Status"].join(";"),
      ...pacientesFiltrados.map((paciente) =>
        [
          paciente.nome,
          paciente.telefone,
          paciente.email,
          paciente.convenio,
          paciente.status,
        ].join(";")
      ),
    ];
    const blob = new Blob([linhas.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pacientes-cliniplus.csv";
    link.click();
    URL.revokeObjectURL(url);
    setMensagem("CSV de pacientes exportado.");
  }

  return (
    <main className="min-h-screen bg-[#f6f8ff] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

        <section className="min-w-0 flex-1 px-5 py-5 lg:px-7">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Pacientes</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Centralize cadastros, historico, relacionamento e acompanhamento clinico em um so lugar
              </p>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500 shadow-sm lg:w-[440px]">
                <Search size={19} />
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar paciente, prontuario ou contato..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                />
              </label>

              <Link
                href="/comunicacao"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-700 shadow-sm"
                aria-label="Comunicação"
              >
                <MessageSquare size={19} />
              </Link>
              <Link
                href="/pacientes/novo"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Novo paciente
                <ChevronDown size={16} />
              </Link>
            </div>
          </header>

          {mensagem && (
            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
              {mensagem}
            </div>
          )}

          <section className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm xl:grid-cols-[1fr_auto]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
              <SelectFiltro label="Status" value={status} onChange={setStatus} options={statusFiltros} />
              <SelectFiltro label="Profissional" value={profissional} onChange={setProfissional} options={["Todos", ...opcoesProfissionais]} />
              <SelectFiltro label="Convenio" value={convenio} onChange={setConvenio} options={["Todos", ...opcoesConvenio]} />
              <SelectFiltro label="Tags" value={tag} onChange={setTag} options={["Todas", ...opcoesTags]} />
              <SelectFiltro label="Ultima consulta" value={ultimaConsulta} onChange={setUltimaConsulta} options={ultimaConsultaFiltros} />
              <SelectFiltro label="Pendencias" value={pendencias} onChange={setPendencias} options={pendenciasFiltros} />
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button
                type="button"
                onClick={exportarCsv}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-extrabold text-indigo-700"
              >
                <Download size={17} />
                Exportar
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatus("Todos");
                  setProfissional("Todos");
                  setConvenio("Todos");
                  setTag("Todas");
                  setUltimaConsulta("Todas");
                  setPendencias("Todas");
                  setMensagem("Filtros limpos.");
                }}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-extrabold text-indigo-700"
              >
                <Filter size={17} />
                Limpar filtros
              </button>
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <ResumoCard titulo="Pacientes ativos" valor={pacientesAtivos} detalhe="Base em acompanhamento" icon={Users} classe="bg-indigo-600" />
            <ResumoCard titulo="Novos este mes" valor={novosEsteMes} detalhe="Sem historico ainda" icon={UserRound} classe="bg-emerald-500" />
            <ResumoCard titulo="Retorno pendente" valor={retornoPendente} detalhe="Acoes em aberto" icon={CalendarDays} classe="bg-orange-400" />
            <ResumoCard titulo="Documentos pendentes" valor={documentosPendentes} detalhe="Aguardando envio ou assinatura" icon={FileText} classe="bg-rose-500" />
            <ResumoCard titulo="Em acompanhamento" valor={emAcompanhamento} detalhe="Tratamentos ativos" icon={Activity} classe="bg-blue-600" />
          </section>

          <section className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {abas.map((nomeAba) => {
                    const contador =
                      nomeAba === "Todos"
                        ? pacientes.length
                        : nomeAba === "Ativos"
                          ? pacientes.filter((item) => item.status === "Ativo").length
                          : nomeAba === "Novos"
                            ? novosEsteMes
                            : nomeAba === "Pendentes"
                              ? retornoPendente
                              : pacientes.filter((item) => insightsPorPaciente[String(item.id)]?.altoRisco).length;

                    return (
                      <button
                        key={nomeAba}
                        type="button"
                        onClick={() => setAba(nomeAba)}
                        className={`rounded-lg px-4 py-2 text-sm font-black ${
                          aba === nomeAba
                            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {nomeAba}
                        {contador > 0 && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                            {contador}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs font-black text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Paciente / Prontuario</th>
                      <th className="px-3 py-3">Idade / Tags</th>
                      <th className="px-3 py-3">Contato</th>
                      <th className="px-3 py-3">Profissional / Especialidade</th>
                      <th className="px-3 py-3">Ultima consulta</th>
                      <th className="px-3 py-3">Proxima consulta</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Convenio</th>
                      <th className="px-3 py-3">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pacientesPagina.map((paciente) => {
                      const insights = insightsPorPaciente[String(paciente.id)];
                      const ativo = selecionado && sameId(paciente.id, selecionado.id);

                      return (
                        <tr
                          key={String(paciente.id)}
                          onClick={() => setSelecionadoId(paciente.id)}
                          onDoubleClick={() => router.push(`/pacientes/${paciente.id}`)}
                          title="Clique para ver o resumo. Clique duas vezes para abrir o cadastro."
                          className={`cursor-pointer transition hover:bg-indigo-50/50 ${
                            ativo ? "bg-indigo-50 ring-1 ring-inset ring-indigo-200" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">
                                {getIniciais(paciente.nome)}
                              </span>
                              <span className="min-w-0">
                                <Link
                                  href={`/pacientes/${paciente.id}`}
                                  onClick={(event) => event.stopPropagation()}
                                  className="block truncate font-black text-slate-950 hover:text-indigo-700"
                                >
                                  {paciente.nome}
                                </Link>
                                <span className="text-xs font-bold text-slate-500">
                                  {getCodigoPaciente(paciente.id)}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-700">{getIdade(paciente)}</p>
                            <div className="mt-1 flex max-w-36 flex-wrap gap-1">
                              {(insights?.tags || []).slice(0, 2).map((item) => (
                                <span
                                  key={item}
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${tagClasse(item)}`}
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-700">{paciente.telefone}</p>
                            <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                              {paciente.email}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-800">{insights?.profissional}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {insights?.especialidade}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-700">
                              {formatarData(insights?.ultimaConsulta?.data)}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {insights?.ultimaConsulta ? getTipoAgendamento(insights.ultimaConsulta) : "-"}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-700">
                              {formatarData(insights?.proximaConsulta?.data)}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {insights?.proximaConsulta?.hora || insights?.proximaConsulta?.horario || "-"}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`rounded-lg px-3 py-1 text-xs font-black ${statusClasse(paciente.status)}`}>
                              {paciente.status}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-800">{paciente.convenio}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">Plano</p>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                              <Link
                                href={`/pacientes/${paciente.id}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-indigo-700"
                                title="Ver cadastro"
                              >
                                <UserRound size={15} />
                              </Link>
                              <Link
                                href={`/pacientes/${paciente.id}?aba=prontuario&secao=resumo`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-indigo-700"
                                title="Abrir prontuario"
                              >
                                <Folder size={15} />
                              </Link>
                              <Link
                                href={`/agenda/novo?pacienteId=${paciente.id}&paciente=${encodeURIComponent(paciente.nome)}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-indigo-700"
                                title="Agendar"
                              >
                                <CalendarDays size={15} />
                              </Link>
                              <Link
                                href={`/comunicacao?pacienteId=${paciente.id}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-indigo-700"
                                title="Enviar mensagem"
                              >
                                <MessageSquare size={15} />
                              </Link>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelecionadoId(paciente.id);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-700"
                                title="Ver mais"
                              >
                                <MoreHorizontal size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pacientesPagina.length === 0 && (
                <div className="border-t border-slate-100 p-8 text-center">
                  <p className="font-black text-slate-700">Nenhum paciente encontrado</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Ajuste a busca, filtros ou aba para ver outros cadastros.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 lg:flex-row lg:items-center lg:justify-between">
                <span>
                  Mostrando {pacientesPagina.length} de {pacientesFiltrados.length} pacientes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPagina((valor) => Math.max(1, valor - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-indigo-700"
                    disabled={pagina === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="rounded-lg bg-indigo-100 px-3 py-2 text-indigo-700">
                    {pagina}
                  </span>
                  <span>de {totalPaginas}</span>
                  <button
                    type="button"
                    onClick={() => setPagina((valor) => Math.min(totalPaginas, valor + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-indigo-700"
                    disabled={pagina === totalPaginas}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <PainelPaciente paciente={selecionado} insights={insightsSelecionado} />
          </section>

          {retornoPendente > 0 && (
          <section className="mt-5 flex flex-col gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-700">
                <Sparkles size={18} />
              </span>
              <p className="min-w-0 text-sm font-bold text-indigo-900">
                <strong>{retornoPendente} paciente(s) pendente(s):</strong> retorno em aberto ou pendencias no cadastro.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAba("Pendentes")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-indigo-700"
            >
              Ver pendentes
              <ChevronRight size={16} />
            </button>
          </section>
          )}
        </section>
      </div>
    </main>
  );
}

function getTipoAgendamento(agendamento: CliniplusAgendamento) {
  return agendamento.tipoAtendimento || agendamento.procedimento || agendamento.tipo || "Consulta";
}

function SelectFiltro({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span className="block text-[10px] font-black text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent text-xs font-black text-slate-700 outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ResumoCard({
  titulo,
  valor,
  detalhe,
  icon: Icon,
  classe,
}: {
  titulo: string;
  valor: number;
  detalhe: string;
  icon: LucideIcon;
  classe: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${classe}`}>
          <Icon size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500">{titulo}</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{valor}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{detalhe}</p>
        </div>
      </div>
    </div>
  );
}

function PainelPaciente({
  paciente,
  insights,
}: {
  paciente: PacienteCompleto | null;
  insights: PacienteInsights | null;
}) {
  if (!paciente || !insights) {
    return (
      <aside className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm">
        Nenhum paciente selecionado.
      </aside>
    );
  }

  const resumo = getResumoProntuario(insights.prontuario);
  const proximosPassos = [
    ...insights.agendamentos
      .filter((item) => item.data >= hojeIso())
      .slice(0, 2)
      .map((item) => ({
        titulo: getTipoAgendamento(item),
        detalhe: `${formatarData(item.data)} - ${item.hora || item.horario}`,
        tipo: "agenda",
      })),
    ...insights.tratamentos
      .filter((item) => ["em andamento", "planejado", "urgente"].includes(normalizarTexto(item.status)))
      .slice(0, 2)
      .map((item) => ({
        titulo: item.descricao,
        detalhe: item.status,
        tipo: "tratamento",
      })),
    ...insights.documentos
      .filter((item) => normalizarTexto(item.status).includes("pendente"))
      .slice(0, 2)
      .map((item) => ({
        titulo: item.nome,
        detalhe: "Documento pendente",
        tipo: "documento",
      })),
  ].slice(0, 4);
  const historico = getHistoricoPaciente(paciente.id).slice(0, 4);

  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-black text-indigo-700">
            {getIniciais(paciente.nome)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black">{paciente.nome}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {getIdade(paciente)} - {paciente.sexo || "Sexo nao informado"} - {getCodigoPaciente(paciente.id)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClasse(paciente.status)}`}>
                {paciente.status}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-indigo-600" />
                {paciente.telefone}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-indigo-600" />
                {paciente.email}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm">
          <span className="font-bold text-slate-500">Convenio</span>
          <strong>{paciente.convenio}</strong>
          <span className="font-bold text-slate-500">Tipo sanguineo</span>
          <strong>{paciente.tipoSanguineo || "-"}</strong>
          <span className="font-bold text-slate-500">Alergias</span>
          <strong>{paciente.alergias || "-"}</strong>
          <span className="font-bold text-slate-500">Responsavel</span>
          <strong>{paciente.responsavel || insights.profissional || "-"}</strong>
          <span className="font-bold text-slate-500">Observacoes</span>
          <strong>{paciente.observacoes || "Sem observacoes rapidas"}</strong>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/pacientes/${paciente.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-black text-indigo-700">
            <UserRound size={15} />
            Ver cadastro
          </Link>
          <Link href={`/agenda/novo?pacienteId=${paciente.id}&paciente=${encodeURIComponent(paciente.nome)}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-black text-white">
            <CalendarDays size={15} />
            Agendar
          </Link>
          <Link href={`/pacientes/${paciente.id}?aba=prontuario&secao=resumo`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-black text-indigo-700">
            <Folder size={15} />
            Abrir prontuario
          </Link>
          <Link href={`/comunicacao?pacienteId=${paciente.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-black text-indigo-700">
            <MessageSquare size={15} />
            Enviar mensagem
          </Link>
          <Link href={`/agenda/novo?pacienteId=${paciente.id}&paciente=${encodeURIComponent(paciente.nome)}&tipo=Teleconsulta`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-700">
            <Video size={15} />
            Teleconsulta
          </Link>
        </div>
      </section>

      <PainelSecao titulo="Proximos passos" link={`/pacientes/${paciente.id}?aba=prontuario&secao=linha-tempo`}>
        {proximosPassos.length > 0 ? (
          proximosPassos.map((item) => (
            <div key={`${item.tipo}-${item.titulo}-${item.detalhe}`} className="flex gap-3 rounded-lg bg-slate-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                {item.tipo === "agenda" ? <CalendarDays size={16} /> : item.tipo === "documento" ? <FileText size={16} /> : <HeartPulse size={16} />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{item.titulo}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{item.detalhe}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">
            Nenhum proximo passo pendente.
          </p>
        )}
      </PainelSecao>

      <PainelSecao titulo="Resumo clinico" link={`/pacientes/${paciente.id}?aba=prontuario&secao=resumo`}>
        {insights.prontuario ? (
          <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm">
            <span className="font-bold text-slate-500">Diagnosticos</span>
            <strong>{resumo.diagnosticos}</strong>
            <span className="font-bold text-slate-500">Queixas</span>
            <strong>{resumo.queixas}</strong>
            <span className="font-bold text-slate-500">Medicamentos</span>
            <strong>{resumo.medicamentos}</strong>
            <span className="font-bold text-slate-500">Ultima anotacao</span>
            <strong>{resumo.ultimaAnotacao}</strong>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">
            Nenhum resumo clinico registrado.
          </p>
        )}
      </PainelSecao>

      <PainelSecao titulo="Linha do tempo" link={`/pacientes/${paciente.id}?aba=prontuario&secao=linha-tempo`}>
        {historico.length > 0 ? (
          historico.map((item) => (
            <div key={String(item.id)} className="grid grid-cols-[86px_1fr] gap-3 text-sm">
              <span className="font-bold text-indigo-700">{formatarData(item.data)}</span>
              <span>
                <strong className="block text-slate-800">{item.titulo}</strong>
                <span className="text-xs font-semibold text-slate-500">{item.descricao}</span>
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">
            Nenhum evento registrado.
          </p>
        )}
      </PainelSecao>
    </aside>
  );
}

function PainelSecao({
  titulo,
  link,
  children,
}: {
  titulo: string;
  link: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-black">{titulo}</h2>
        <Link href={link} className="text-xs font-black text-indigo-700">
          Ver mais
        </Link>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
