"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FileText,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  addAgendamento,
  addPaciente,
  getAgendamentos,
  getPacientes,
  updateAgendamento,
  type CliniplusAgendamento,
  type CliniplusPaciente,
  type StoreId,
} from "@/utils/cliniplusStore";

type NovoAgendamentoClientProps = {
  pacienteInicial?: string;
  dataInicial?: string;
  horaInicial?: string;
  tipoInicial?: string;
  agendamentoId?: string;
};

type EquipeLocal = {
  nome?: string;
  cargo?: string;
  profissao?: string;
  status?: string;
};

type PacienteComExtras = CliniplusPaciente & {
  cpf?: string;
};

type LembretesState = {
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
  vinteQuatroHoras: boolean;
  duasHoras: boolean;
  formularioDigital: boolean;
};

const hoje = new Date().toISOString().slice(0, 10);
const horaPadrao = "14:00";

const tiposAtendimento = ["Consulta inicial", "Retorno", "Exame", "Teleconsulta"];
const especialidades = [
  "Clinica geral",
  "Odontologia",
  "Dermatologia",
  "Psicologia",
  "Nutricao",
  "Fisioterapia",
  "Cardiologia",
  "Outro",
];
const unidades = ["Clinica principal", "Consultorio 01", "Consultorio 02", "Online"];
const salas = ["Sala 01", "Sala 02", "Sala 03", "Teleconsulta"];
const pagamentos = ["Particular", "Convenio", "Pix", "Cartao", "Boleto", "Cortesia"];
const duracoes = ["15 min", "30 min", "45 min", "60 min", "90 min"];
const recorrencias = ["Nao repetir", "Semanal", "Quinzenal", "Mensal"];
const antecedencias = ["15 minutos", "30 minutos", "1 hora", "2 horas", "24 horas"];

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatarData(valor: string) {
  if (!valor) return "-";
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function adicionarMinutos(hora: string, minutos: number) {
  const [h, m] = (hora || horaPadrao).split(":").map(Number);
  const data = new Date(2026, 0, 1, h || 0, m || 0);
  data.setMinutes(data.getMinutes() + minutos);
  return `${String(data.getHours()).padStart(2, "0")}:${String(
    data.getMinutes()
  ).padStart(2, "0")}`;
}

function iniciais(nome: string) {
  return nome
    .split(" ")
    .map((parte) => parte[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function criarId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return String(Date.now());
}

function getEquipeLocal() {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem("equipe-cliniplus");
    if (!saved) return [];
    const parsed = JSON.parse(saved) as EquipeLocal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mesmoProfissional(a?: string, b?: string) {
  return normalizarTexto(a || "") === normalizarTexto(b || "");
}

function pacienteNome(agendamento: CliniplusAgendamento) {
  return agendamento.pacienteNome || agendamento.paciente || "Paciente";
}

export default function NovoAgendamentoClient({
  pacienteInicial = "",
  dataInicial = hoje,
  horaInicial = horaPadrao,
  tipoInicial = "Consulta inicial",
  agendamentoId,
}: NovoAgendamentoClientProps) {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<PacienteComExtras[]>([]);
  const [agendamentos, setAgendamentos] = useState<CliniplusAgendamento[]>([]);
  const [profissionais, setProfissionais] = useState<string[]>([
    "Dr(a). Responsavel",
    "Profissional de saude",
  ]);
  const [buscaPaciente, setBuscaPaciente] = useState(pacienteInicial);
  const [pacienteSelecionado, setPacienteSelecionado] =
    useState<PacienteComExtras | null>(null);
  const [mostrarNovoPaciente, setMostrarNovoPaciente] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({
    nome: pacienteInicial,
    telefone: "",
    email: "",
    cpf: "",
  });

  const [tipoAtendimento, setTipoAtendimento] = useState(tipoInicial);
  const [especialidade, setEspecialidade] = useState("Clinica geral");
  const [profissional, setProfissional] = useState("Dr(a). Responsavel");
  const [unidade, setUnidade] = useState("Clinica principal");
  const [sala, setSala] = useState("Sala 02");
  const [pagamento, setPagamento] = useState("Particular");
  const [data, setData] = useState(dataInicial);
  const [horario, setHorario] = useState(horaInicial);
  const [duracao, setDuracao] = useState("30 min");
  const [tipoConsulta, setTipoConsulta] = useState<"presencial" | "teleconsulta">(
    tipoInicial === "Teleconsulta" ? "teleconsulta" : "presencial"
  );
  const [recorrencia, setRecorrencia] = useState("Nao repetir");
  const [encaixe, setEncaixe] = useState(false);
  const [confirmacaoImediata, setConfirmacaoImediata] = useState(true);
  const [antecedencia, setAntecedencia] = useState("15 minutos");
  const [lembretes, setLembretes] = useState({
    whatsapp: true,
    sms: true,
    email: true,
    vinteQuatroHoras: true,
    duasHoras: true,
    formularioDigital: true,
  });
  const [observacaoPaciente, setObservacaoPaciente] = useState("");
  const [observacaoInterna, setObservacaoInterna] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    function carregarDados() {
      const pacientesStore = getPacientes() as PacienteComExtras[];
      const agendaStore = getAgendamentos();
      const equipe = getEquipeLocal()
        .filter((item) => item.status !== "Inativo")
        .map((item) => item.nome)
        .filter(Boolean) as string[];

      setPacientes(pacientesStore);
      setAgendamentos(agendaStore);
      setProfissionais(
        equipe.length > 0 ? equipe : ["Dr(a). Responsavel", "Profissional de saude"]
      );

      if (!agendamentoId && pacienteInicial) {
        const paciente = pacientesStore.find(
          (item) => normalizarTexto(item.nome) === normalizarTexto(pacienteInicial)
        );
        if (paciente) setPacienteSelecionado(paciente);
      }
    }

    carregarDados();
    window.addEventListener("cliniplus:store", carregarDados);
    return () => window.removeEventListener("cliniplus:store", carregarDados);
  }, [agendamentoId, pacienteInicial]);

  useEffect(() => {
    if (!agendamentoId || agendamentos.length === 0) return;

    const agendamento = agendamentos.find(
      (item) => String(item.id) === String(agendamentoId)
    );
    if (!agendamento) return;

    const paciente = pacientes.find(
      (item) => String(item.id) === String(agendamento.pacienteId)
    );

    setPacienteSelecionado(paciente || null);
    setBuscaPaciente(pacienteNome(agendamento));
    setNovoPaciente((atual) => ({ ...atual, nome: pacienteNome(agendamento) }));
    setTipoAtendimento(agendamento.tipoAtendimento || agendamento.procedimento || agendamento.tipo);
    setEspecialidade(agendamento.especialidade || "Clinica geral");
    setProfissional(agendamento.profissional || "Dr(a). Responsavel");
    setUnidade(agendamento.unidade || "Clinica principal");
    setSala(agendamento.sala || "Sala 02");
    setPagamento(agendamento.pagamento || "Particular");
    setData(agendamento.data || dataInicial);
    setHorario(agendamento.horario || agendamento.hora || horaInicial);
    setDuracao(agendamento.duracao || "30 min");
    setTipoConsulta(agendamento.tipo === "teleconsulta" ? "teleconsulta" : "presencial");
    setRecorrencia(agendamento.recorrencia || "Nao repetir");
    setEncaixe(Boolean(agendamento.encaixe));
    setConfirmacaoImediata(agendamento.confirmacaoImediata ?? true);
    setAntecedencia(agendamento.antecedencia || "15 minutos");
    setLembretes((atual) => ({ ...atual, ...(agendamento.lembretes || {}) }));
    setObservacaoPaciente(
      agendamento.observacaoPaciente || agendamento.observacoes || ""
    );
    setObservacaoInterna(agendamento.observacaoInterna || "");
  }, [agendamentoId, agendamentos, pacientes, dataInicial, horaInicial]);

  useEffect(() => {
    if (!profissionais.includes(profissional)) {
      setProfissional(profissionais[0] || "Dr(a). Responsavel");
    }
  }, [profissionais, profissional]);

  const resultadosPaciente = useMemo(() => {
    const termo = normalizarTexto(buscaPaciente.trim());
    if (!termo) return pacientes.slice(0, 4);

    return pacientes
      .filter((paciente) =>
        [
          paciente.nome,
          paciente.telefone,
          paciente.email,
          paciente.cpf || "",
        ]
          .join(" ")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(termo)
      )
      .slice(0, 5);
  }, [buscaPaciente, pacientes]);

  const sugestoes = useMemo(
    () => [
      adicionarMinutos(horario, 30),
      adicionarMinutos(horario, 60),
      adicionarMinutos(horario, 120),
    ],
    [horario]
  );

  const conflito = useMemo(
    () =>
      agendamentos.find(
        (item) =>
          String(item.id) !== String(agendamentoId || "") &&
          item.data === data &&
          (item.horario || item.hora) === horario &&
          mesmoProfissional(item.profissional, profissional) &&
          !["cancelado", "Cancelado"].includes(item.status)
      ),
    [agendamentoId, agendamentos, data, horario, profissional]
  );

  const agendamentosPaciente = useMemo(() => {
    if (!pacienteSelecionado) return [];
    return agendamentos
      .filter((item) => String(item.pacienteId) === String(pacienteSelecionado.id))
      .sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`));
  }, [agendamentos, pacienteSelecionado]);

  const ultimaConsulta = agendamentosPaciente.find(
    (item) => `${item.data} ${item.hora}` < `${data} ${horario}`
  );
  const proximaConsulta = agendamentosPaciente.find(
    (item) => `${item.data} ${item.hora}` > `${data} ${horario}`
  );

  const pacienteResumo =
    pacienteSelecionado ||
    ({
      id: "",
      nome: novoPaciente.nome || buscaPaciente || "Paciente nao selecionado",
      telefone: novoPaciente.telefone || "Telefone nao informado",
      email: novoPaciente.email || "E-mail nao informado",
      convenio: pagamento,
      area: especialidade,
      tipoAtendimento: "odontologia",
      status: "Ativo",
      ultimo: "",
      cpf: novoPaciente.cpf,
    } as PacienteComExtras);

  function toggleLembrete(chave: keyof typeof lembretes) {
    setLembretes((atual) => ({ ...atual, [chave]: !atual[chave] }));
  }

  function selecionarPaciente(paciente: PacienteComExtras) {
    setPacienteSelecionado(paciente);
    setBuscaPaciente(paciente.nome);
    setNovoPaciente({
      nome: paciente.nome,
      telefone: paciente.telefone || "",
      email: paciente.email || "",
      cpf: paciente.cpf || "",
    });
    setMostrarNovoPaciente(false);
    setErro("");
  }

  function criarPacienteRapido() {
    const nome = novoPaciente.nome.trim() || buscaPaciente.trim();
    if (!nome) {
      setErro("Informe o nome do paciente para criar o cadastro rapido.");
      return null;
    }

    const existente = pacientes.find(
      (item) => normalizarTexto(item.nome) === normalizarTexto(nome)
    );
    if (existente) {
      selecionarPaciente(existente);
      return existente;
    }

    const paciente = addPaciente({
      nome,
      telefone: novoPaciente.telefone || "Nao informado",
      email: novoPaciente.email || "Nao informado",
      cpf: novoPaciente.cpf || undefined,
      convenio: pagamento,
      area: especialidade,
      status: "Ativo",
      tipoAtendimento: "odontologia",
    }) as PacienteComExtras;

    setPacientes((atuais) => [...atuais, paciente]);
    selecionarPaciente(paciente);
    setAviso("Paciente criado e selecionado para este agendamento.");
    return paciente;
  }

  function obterPacienteParaSalvar() {
    if (pacienteSelecionado) return pacienteSelecionado;
    return criarPacienteRapido();
  }

  function salvar(statusFinal: "rascunho" | "confirmado") {
    setErro("");
    const paciente = obterPacienteParaSalvar();

    if (!paciente) return;
    if (!data || !horario) {
      setErro("Informe data e horario do agendamento.");
      return;
    }

    const id = (agendamentoId || criarId()) as StoreId;
    const dados = {
      id,
      pacienteId: paciente.id,
      paciente: paciente.nome,
      pacienteNome: paciente.nome,
      data,
      hora: horario,
      horario,
      duracao,
      tipoAtendimento,
      especialidade,
      profissional,
      unidade,
      sala: tipoConsulta === "teleconsulta" ? "Teleconsulta" : sala,
      pagamento,
      tipo: tipoConsulta,
      prioridade: encaixe ? "Encaixe" : "Normal",
      procedimento: tipoAtendimento,
      recorrencia,
      encaixe,
      confirmacaoImediata,
      antecedencia,
      lembretes,
      observacoes: observacaoPaciente,
      observacaoPaciente,
      observacaoInterna,
      status: statusFinal,
      criadoEm: new Date().toISOString(),
    };

    if (agendamentoId) {
      updateAgendamento(agendamentoId, dados);
    } else {
      addAgendamento(dados);
    }

    router.push(`/agenda?data=${data}`);
  }

  const checklist = [
    {
      label: "Consentimento informado",
      status: lembretes.formularioDigital ? "Pendente" : "Nao aplicavel",
    },
    {
      label: "Documentos do convenio",
      status: pagamento === "Convenio" ? "Pendente" : "Ok",
    },
    {
      label: "Pagamento / Coparticipacao",
      status: pagamento === "Cortesia" ? "Nao aplicavel" : "Pendente",
    },
    {
      label: "Link da teleconsulta",
      status: tipoConsulta === "teleconsulta" ? "Pendente" : "Nao aplicavel",
    },
  ];

  return (
    <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-4">
        {aviso && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {aviso}
          </div>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <UserRound size={20} className="text-indigo-600" />
              Paciente
            </h2>
            <button
              type="button"
              onClick={() => setMostrarNovoPaciente((valor) => !valor)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-extrabold text-indigo-700"
            >
              <Plus size={16} />
              Novo paciente
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500">
              <Search size={18} />
              <input
                value={buscaPaciente}
                onChange={(event) => {
                  setBuscaPaciente(event.target.value);
                  setNovoPaciente((atual) => ({ ...atual, nome: event.target.value }));
                  if (pacienteSelecionado) setPacienteSelecionado(null);
                }}
                placeholder="Busque por nome, CPF, telefone ou e-mail"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const primeiro = resultadosPaciente[0];
                if (primeiro) selecionarPaciente(primeiro);
                else setMostrarNovoPaciente(true);
              }}
              className="h-12 rounded-lg border border-slate-200 px-5 text-sm font-extrabold text-indigo-700"
            >
              Buscar
            </button>
          </div>

          {!pacienteSelecionado && buscaPaciente && (
            <div className="mt-3 grid gap-2">
              {resultadosPaciente.length > 0 ? (
                resultadosPaciente.map((paciente) => (
                  <button
                    key={String(paciente.id)}
                    type="button"
                    onClick={() => selecionarPaciente(paciente)}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">
                      {iniciais(paciente.nome)}
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate text-sm">{paciente.nome}</strong>
                      <span className="block truncate text-xs font-semibold text-slate-500">
                        {paciente.telefone} - {paciente.email}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  Nenhum paciente encontrado. Use "Novo paciente" para criar um cadastro rapido.
                </div>
              )}
            </div>
          )}

          {mostrarNovoPaciente && (
            <div className="mt-4 grid gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4 md:grid-cols-2">
              <input
                value={novoPaciente.nome}
                onChange={(event) =>
                  setNovoPaciente((atual) => ({ ...atual, nome: event.target.value }))
                }
                placeholder="Nome"
                className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
              />
              <input
                value={novoPaciente.telefone}
                onChange={(event) =>
                  setNovoPaciente((atual) => ({
                    ...atual,
                    telefone: event.target.value,
                  }))
                }
                placeholder="Telefone"
                className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
              />
              <input
                value={novoPaciente.email}
                onChange={(event) =>
                  setNovoPaciente((atual) => ({ ...atual, email: event.target.value }))
                }
                placeholder="E-mail"
                className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
              />
              <input
                value={novoPaciente.cpf}
                onChange={(event) =>
                  setNovoPaciente((atual) => ({ ...atual, cpf: event.target.value }))
                }
                placeholder="CPF opcional"
                className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none"
              />
              <button
                type="button"
                onClick={criarPacienteRapido}
                className="h-11 rounded-lg bg-indigo-600 px-4 text-sm font-extrabold text-white md:col-span-2"
              >
                Criar e selecionar paciente
              </button>
            </div>
          )}

          {pacienteSelecionado && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">
                {iniciais(pacienteSelecionado.nome)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-black">{pacienteSelecionado.nome}</p>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {pacienteSelecionado.telefone} - {pacienteSelecionado.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPacienteSelecionado(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-white"
                aria-label="Remover paciente selecionado"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <ClipboardCheck size={20} className="text-indigo-600" />
            Detalhes do atendimento
          </h2>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-3">
              <p className="mb-2 text-xs font-black text-slate-500">
                Tipo de atendimento
              </p>
              <div className="grid gap-2 sm:grid-cols-4">
                {tiposAtendimento.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      setTipoAtendimento(tipo);
                      if (tipo === "Teleconsulta") setTipoConsulta("teleconsulta");
                    }}
                    className={`h-10 rounded-lg border px-3 text-sm font-extrabold ${
                      tipoAtendimento === tipo
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            <SelectField
              label="Especialidade"
              value={especialidade}
              onChange={setEspecialidade}
              options={especialidades}
            />
            <SelectField
              label="Profissional"
              value={profissional}
              onChange={setProfissional}
              options={profissionais}
            />
            <SelectField
              label="Unidade"
              value={unidade}
              onChange={setUnidade}
              options={unidades}
            />
            <SelectField label="Sala / Canal" value={sala} onChange={setSala} options={salas} />
            <SelectField
              label="Convenio / Pagamento"
              value={pagamento}
              onChange={setPagamento}
              options={pagamentos}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <CalendarDays size={20} className="text-indigo-600" />
            Data e horario
          </h2>

          <div className="mt-4 grid gap-4 xl:grid-cols-4">
            <InputField label="Data" type="date" value={data} onChange={setData} />
            <InputField label="Hora inicial" type="time" value={horario} onChange={setHorario} />
            <SelectField label="Duracao" value={duracao} onChange={setDuracao} options={duracoes} />
            <div>
              <p className="mb-2 text-xs font-black text-slate-500">Tipo</p>
              <div className="grid h-11 grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                {[
                  ["presencial", "Presencial"],
                  ["teleconsulta", "Teleconsulta"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTipoConsulta(value as "presencial" | "teleconsulta")}
                    className={`rounded-md text-xs font-black ${
                      tipoConsulta === value
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {conflito && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
              <span className="flex items-center gap-2">
                <AlertTriangle size={18} />
                Conflito detectado: este profissional possui outro compromisso neste horario.
              </span>
              <button
                type="button"
                onClick={() => setHorario(sugestoes[0])}
                className="text-indigo-700"
              >
                Ver horarios sugeridos
              </button>
            </div>
          )}

          <div className="mt-4 grid gap-4 xl:grid-cols-4">
            <SelectField
              label="Recorrencia"
              value={recorrencia}
              onChange={setRecorrencia}
              options={recorrencias}
            />
            <SwitchField label="Encaixe" checked={encaixe} onChange={setEncaixe} />
            <SwitchField
              label="Confirmacao imediata"
              checked={confirmacaoImediata}
              onChange={setConfirmacaoImediata}
            />
            <SelectField
              label="Tempo de antecedencia"
              value={antecedencia}
              onChange={setAntecedencia}
              options={antecedencias}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <Bell size={20} className="text-indigo-600" />
            Comunicacao e lembretes
          </h2>

          <div className="mt-4 grid gap-5 xl:grid-cols-3">
            <CheckGroup
              title="Enviar confirmacao por"
              items={[
                ["whatsapp", "WhatsApp"],
                ["sms", "SMS"],
                ["email", "E-mail"],
              ]}
              values={lembretes}
              onToggle={toggleLembrete}
            />
            <CheckGroup
              title="Lembretes automaticos"
              items={[
                ["vinteQuatroHoras", "24 horas antes"],
                ["duasHoras", "2 horas antes"],
              ]}
              values={lembretes}
              onToggle={toggleLembrete}
            />
            <div className="rounded-lg border border-slate-200 p-4">
              <SwitchField
                label="Formulario / Check-in digital"
                checked={lembretes.formularioDigital}
                onChange={() => toggleLembrete("formularioDigital")}
              />
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Enviar formulario e permitir check-in antes do atendimento.
              </p>
              <button
                type="button"
                onClick={() => setAviso("Formulario digital configurado para este agendamento.")}
                className="mt-3 text-sm font-extrabold text-indigo-700"
              >
                Configurar formulario
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <FileText size={20} className="text-indigo-600" />
            Observacoes
          </h2>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <TextareaField
              label="Motivo da consulta (visivel para o paciente)"
              value={observacaoPaciente}
              onChange={setObservacaoPaciente}
              limit={200}
            />
            <TextareaField
              label="Observacoes internas (nao visivel para o paciente)"
              value={observacaoInterna}
              onChange={setObservacaoInterna}
              limit={500}
            />
          </div>
        </section>

        {erro && (
          <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {erro}
          </div>
        )}

        <footer className="sticky bottom-0 z-10 grid gap-3 border-t border-slate-200 bg-[#f6f8ff]/95 py-4 backdrop-blur sm:grid-cols-3">
          <Link
            href="/agenda"
            className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-extrabold text-slate-700"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={() => salvar("rascunho")}
            className="h-12 rounded-lg border border-slate-200 bg-white text-sm font-extrabold text-indigo-700"
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            onClick={() => salvar("confirmado")}
            className="h-12 rounded-lg bg-indigo-600 text-sm font-extrabold text-white shadow-sm hover:bg-indigo-700"
          >
            {agendamentoId ? "Salvar alteracoes" : "Salvar e confirmar"}
          </button>
        </footer>
      </div>

      <aside className="space-y-4">
        <SideCard title="Resumo do agendamento" icon={ClipboardCheck}>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">
              {iniciais(pacienteResumo.nome)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-black">{pacienteResumo.nome}</p>
              <p className="truncate text-xs font-semibold text-slate-500">
                {pacienteResumo.telefone} - {pacienteResumo.email}
              </p>
            </div>
          </div>
          <SummaryRow icon={Stethoscope} label="Profissional" value={profissional} />
          <SummaryRow
            icon={CalendarDays}
            label="Data e hora"
            value={`${formatarData(data)} as ${horario || "-"}`}
          />
          <SummaryRow icon={Clock3} label="Duracao" value={duracao} />
          <SummaryRow
            icon={Users}
            label="Local / Canal"
            value={`${unidade} - ${tipoConsulta === "teleconsulta" ? "Teleconsulta" : sala}`}
          />
          <SummaryRow icon={CreditCard} label="Convenio" value={pagamento} />
          <SummaryRow
            icon={CheckCircle2}
            label="Status"
            value={agendamentoId ? "Edicao" : confirmacaoImediata ? "Confirmado" : "Aguardando"}
          />
        </SideCard>

        <SideCard title="Disponibilidade sugerida pela IA" icon={Sparkles}>
          <div className="space-y-2">
            {sugestoes.map((sugestao, index) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => setHorario(sugestao)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left text-sm font-black ${
                  index === 0
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {formatarData(data)} - {sugestao}
                {index === 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] text-emerald-700">
                    Melhor opcao
                  </span>
                )}
              </button>
            ))}
          </div>
        </SideCard>

        <SideCard title="Informacoes do paciente" icon={UserRound}>
          {pacienteSelecionado ? (
            <>
              <InfoLine label="Ultima consulta" value={ultimaConsulta ? `${formatarData(ultimaConsulta.data)} com ${ultimaConsulta.profissional || "profissional"}` : "-"} />
              <InfoLine label="Proximo agendamento" value={proximaConsulta ? `${formatarData(proximaConsulta.data)} as ${proximaConsulta.hora}` : "-"} />
              <InfoLine label="Alertas" value={observacaoInterna ? "Observacao interna registrada" : "-"} badge="Pendente" />
              <InfoLine label="Pendencias" value={pagamento === "Convenio" ? "Documentos do convenio" : "-"} />
              <Link
                href={`/pacientes/${pacienteSelecionado.id}`}
                className="mt-3 inline-flex text-sm font-extrabold text-indigo-700"
              >
                Ver perfil completo
              </Link>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">
              Selecione ou crie um paciente para ver informacoes clinicas.
            </div>
          )}
        </SideCard>

        <SideCard title="Checklist pre-atendimento" icon={ClipboardCheck}>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-600">{item.label}</span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black ${
                    item.status === "Ok"
                      ? "bg-emerald-100 text-emerald-700"
                      : item.status === "Pendente"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </SideCard>

        <SideCard title="IA do Clini+" icon={Sparkles}>
          <p className="text-sm font-bold text-slate-700">
            Melhor horario sugerido: <span className="text-indigo-700">{sugestoes[0]}</span>
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Menor risco de no-show neste horario.
          </p>
          <button
            type="button"
            onClick={() => setHorario(sugestoes[0])}
            className="mt-3 h-10 w-full rounded-lg bg-indigo-600 text-sm font-extrabold text-white"
          >
            Usar sugestao
          </button>
        </SideCard>
      </aside>
    </div>
  );
}

function SelectField({
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
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-300"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function InputField({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-300"
      />
    </label>
  );
}

function SwitchField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
          checked ? "justify-end bg-indigo-600" : "justify-start bg-slate-200"
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
      </button>
    </label>
  );
}

function CheckGroup({
  title,
  items,
  values,
  onToggle,
}: {
  title: string;
  items: [keyof LembretesState, string][];
  values: LembretesState;
  onToggle: (key: keyof LembretesState) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-sm font-black text-slate-800">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={values[key]}
              onChange={() => onToggle(key)}
              className="h-4 w-4 accent-indigo-600"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  limit,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  limit: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <textarea
        value={value}
        maxLength={limit}
        onChange={(event) => onChange(event.target.value)}
        className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-300"
      />
      <span className="mt-1 block text-right text-[10px] font-bold text-slate-400">
        {value.length}/{limit}
      </span>
    </label>
  );
}

function SideCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-black">
        <Icon size={18} className="text-indigo-600" />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[22px_92px_1fr] items-center gap-2 text-sm">
      <Icon size={16} className="text-slate-500" />
      <span className="font-bold text-slate-500">{label}</span>
      <strong className="min-w-0 truncate text-slate-800">{value}</strong>
    </div>
  );
}

function InfoLine({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right font-extrabold text-slate-700">
        {value}
        {badge && (
          <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-[10px] text-orange-700">
            {badge}
          </span>
        )}
      </span>
    </div>
  );
}
