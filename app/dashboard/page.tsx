"use client";

import Sidebar from "@/components/Sidebar";
import {
  type CliniplusAgendamento,
  type CliniplusLancamentoFinanceiro,
  type CliniplusPaciente,
  type SessaoPlano,
  type CliniplusTratamento,
  getAgendamentos,
  getLancamentosFinanceiros,
  getPacientes,
  getSessaoPlano,
  getTratamentos,
  setSessaoPlano,
} from "@/utils/cliniplusStore";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  Folder,
  HeartPulse,
  MessageCircle,
  Plus,
  Search,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PlanoSlug = "starter" | "pro" | "premium";
type ProfissaoSlug =
  | "odontologia"
  | "medicina"
  | "psicologia"
  | "fisioterapia"
  | "nutricao"
  | "outros";

type DashboardData = {
  pacientes: CliniplusPaciente[];
  agendamentos: CliniplusAgendamento[];
  tratamentos: CliniplusTratamento[];
  financeiro: CliniplusLancamentoFinanceiro[];
};

const nomesPlanos: Record<PlanoSlug, string> = {
  starter: "Plano Starter",
  pro: "Plano Pro",
  premium: "Plano Premium",
};

const nomeArea: Record<ProfissaoSlug, string> = {
  odontologia: "Odontologia",
  medicina: "Medicina",
  psicologia: "Psicologia",
  fisioterapia: "Fisioterapia",
  nutricao: "Nutricao",
  outros: "Saude",
};

const emptyDashboardData: DashboardData = {
  pacientes: [],
  agendamentos: [],
  tratamentos: [],
  financeiro: [],
};

function normalizarPlano(valor: string | null | undefined): PlanoSlug | "" {
  if (valor === "pro" || valor === "premium" || valor === "starter") {
    return valor;
  }

  return "";
}

function normalizarProfissao(valor: string | null | undefined): ProfissaoSlug {
  if (
    valor === "odontologia" ||
    valor === "medicina" ||
    valor === "psicologia" ||
    valor === "fisioterapia" ||
    valor === "nutricao" ||
    valor === "outros"
  ) {
    return valor;
  }

  return "outros";
}

function dinheiroParaNumero(valor: string | undefined) {
  if (!valor) {
    return 0;
  }

  const limpo = valor
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(limpo) || 0;
}

function formatMoney(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function getStatusClass(status: string) {
  const normalizado = status.toLowerCase();

  if (
    normalizado === "confirmado" ||
    normalizado === "pago" ||
    normalizado === "recebido"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalizado === "em andamento" || normalizado === "em_atendimento") {
    return "bg-orange-50 text-orange-700";
  }

  if (
    normalizado === "pendente" ||
    normalizado === "aguardando" ||
    normalizado === "rascunho"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-black text-slate-950">{value}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">{detail}</p>
        </div>
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${tone}`}
        >
          <Icon size={26} />
        </span>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg bg-slate-50 p-3 text-center text-sm font-bold text-indigo-800 transition hover:bg-indigo-50 hover:text-indigo-700"
    >
      <Icon size={25} />
      <span>{label}</span>
    </Link>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-bold text-slate-600">
          Carregando dashboard...
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const queryModo = searchParams.get("modo");
  const queryPlano = searchParams.get("plano");
  const queryProfissao = searchParams.get("profissao");
  const [sessaoSalva, setSessaoSalva] = useState<SessaoPlano | null>(null);
  const modo = queryModo || sessaoSalva?.modo || "demo";
  const planoParam = queryPlano || sessaoSalva?.plano || "starter";
  const plano = normalizarPlano(planoParam) || "starter";
  const profissao = normalizarProfissao(queryProfissao || sessaoSalva?.profissao);
  const dias = searchParams.get("dias") || "7";
  const emTeste = modo === "teste";
  const semSessaoOriginal = !queryModo && !queryPlano && !sessaoSalva?.modo;
  const [dados, setDados] = useState<DashboardData>(emptyDashboardData);

  useEffect(() => {
    if (queryModo || queryPlano || queryProfissao) {
      const sessaoAtual = {
        modo: queryModo || undefined,
        plano: queryPlano || undefined,
        profissao: queryProfissao || undefined,
        demo: searchParams.get("demo") || undefined,
      };

      setSessaoPlano(sessaoAtual);
      setSessaoSalva(sessaoAtual);
      return;
    }

    setSessaoSalva(getSessaoPlano() ?? null);
  }, [queryModo, queryPlano, queryProfissao, searchParams]);

  useEffect(() => {
    function carregarDados() {
      setDados({
        pacientes: getPacientes(),
        agendamentos: getAgendamentos(),
        tratamentos: getTratamentos(),
        financeiro: getLancamentosFinanceiros(),
      });
    }

    carregarDados();
    window.addEventListener("cliniplus:store", carregarDados);
    return () => window.removeEventListener("cliniplus:store", carregarDados);
  }, []);

  const areaAtual = nomeArea[profissao];
  const badgePlano = emTeste
    ? `${nomesPlanos.starter} - ${dias} dias restantes`
    : `${nomesPlanos[plano]} ativo`;

  const hojeIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const atendimentosHoje = dados.agendamentos.filter(
    (item) => !item.data || item.data === hojeIso
  );
  const listaAgenda = (atendimentosHoje.length > 0
    ? atendimentosHoje
    : dados.agendamentos
  ).slice(0, 5);
  const pacientesAtivos = dados.pacientes.filter((paciente) =>
    ["Ativo", "Em tratamento", "Retorno pendente"].includes(paciente.status)
  ).length;
  const receitas = dados.financeiro.filter((item) => item.tipo === "Receita");
  const despesas = dados.financeiro.filter((item) => item.tipo === "Despesa");
  const totalReceitas = receitas.reduce(
    (total, item) => total + dinheiroParaNumero(item.valor),
    0
  );
  const totalDespesas = despesas.reduce(
    (total, item) => total + dinheiroParaNumero(item.valor),
    0
  );
  const lucroLiquido = totalReceitas - totalDespesas;
  const tratamentosEmAndamento = dados.tratamentos.filter((tratamento) =>
    ["Em andamento", "Planejado", "Urgente"].includes(tratamento.status)
  ).length;
  const realizadosHoje = atendimentosHoje.filter(
    (item) => item.status === "Concluido" || item.status === "Realizado"
  ).length;
  const restantesHoje = Math.max(atendimentosHoje.length - realizadosHoje, 0);

  const tiposAtendimento = [
    { label: "Consultas", value: dados.agendamentos.length, color: "bg-indigo-500" },
    { label: "Retornos", value: dados.agendamentos.filter((item) => (item.tipoAtendimento || item.tipo) === "Retorno").length, color: "bg-emerald-500" },
    { label: "Procedimentos", value: dados.tratamentos.length, color: "bg-rose-500" },
    { label: areaAtual, value: dados.pacientes.filter((item) => item.tipoAtendimento === "odontologia").length, color: "bg-orange-400" },
  ].filter((item) => item.value > 0);
  const totalTipos =
    tiposAtendimento.reduce((total, item) => total + item.value, 0) || 1;

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar active="Dashboard" plano={plano} />

        <section className="min-w-0 flex-1 px-6 py-5 lg:px-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Ola, Dr(a). Rafael
              </h1>
              <p className="mt-1 text-base font-medium text-slate-500">
                Bem-vindo ao seu painel do Clini+
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500 shadow-sm sm:w-[380px]">
                <Search size={19} />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  placeholder="Buscar paciente, atendimento, tratamento..."
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-800 shadow-sm"
                  aria-label="Notificacoes"
                >
                  <Bell size={20} />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-800 shadow-sm"
                  aria-label="Mensagens"
                >
                  <MessageCircle size={20} />
                </button>
                <Link
                  href="/agenda/novo"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Plus size={18} />
                  Novo atendimento
                </Link>
              </div>
            </div>
          </header>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-indigo-700 shadow-sm ring-1 ring-slate-200">
              {badgePlano}
            </span>
            <span className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-slate-600 shadow-sm ring-1 ring-slate-200">
              Area atual: {areaAtual}
            </span>
            {semSessaoOriginal && (
              <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
                Sessao sem plano carregado; exibindo base Starter.
              </span>
            )}
          </div>

          <section className="mt-6 grid gap-4 xl:grid-cols-4">
            <MetricCard
              title="Atendimentos hoje"
              value={String(atendimentosHoje.length)}
              detail={`${realizadosHoje} realizados - ${restantesHoje} restantes`}
              icon={CalendarDays}
              tone="bg-indigo-500"
            />
            <MetricCard
              title="Pacientes ativos"
              value={String(pacientesAtivos)}
              detail={`${dados.pacientes.length} pacientes no total`}
              icon={Users}
              tone="bg-sky-500"
            />
            <MetricCard
              title="Receitas este mes"
              value={formatMoney(totalReceitas)}
              detail={`${receitas.length} lancamentos de receita`}
              icon={DollarSign}
              tone="bg-emerald-500"
            />
            <MetricCard
              title="Tratamentos em andamento"
              value={String(tratamentosEmAndamento)}
              detail={`${dados.tratamentos.length} tratamentos cadastrados`}
              icon={HeartPulse}
              tone="bg-orange-400"
            />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CalendarDays className="text-indigo-600" size={22} />
                  <h2 className="text-lg font-black">Agenda de hoje</h2>
                </div>
                <Link
                  href="/agenda"
                  className="text-sm font-extrabold text-indigo-700"
                >
                  Ver agenda completa
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {listaAgenda.length > 0 ? (
                  listaAgenda.map((item) => (
                    <div
                      key={String(item.id)}
                      className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[76px_1fr_auto] sm:items-center"
                    >
                      <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm">
                        <p className="font-black text-slate-950">
                          {item.horario || item.hora}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {item.duracao || "45 min"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-extrabold">
                          {item.pacienteNome || item.paciente}
                        </p>
                        <p className="truncate text-sm font-medium text-slate-500">
                          {item.tipoAtendimento || item.procedimento || item.tipo}
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-lg px-3 py-1 text-xs font-extrabold ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="font-extrabold">Nenhum atendimento hoje</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Use a agenda para cadastrar consultas, retornos e procedimentos.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-indigo-600" size={23} />
                  <h2 className="text-lg font-black">Resumo financeiro</h2>
                </div>
                <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600">
                  Este mes
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Receitas</p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {formatMoney(totalReceitas)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Despesas</p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {formatMoney(totalDespesas)}
                  </p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-4">
                  <p className="text-sm font-bold text-indigo-700">Lucro liquido</p>
                  <p className="mt-2 text-xl font-black text-emerald-600">
                    {formatMoney(lucroLiquido)}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-52 rounded-lg bg-slate-50 p-4">
                <div className="flex h-full items-end gap-2">
                  {[42, 55, 48, 68, 62, 74, 70, 82, 78, 88, 84, 94].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex flex-1 flex-col justify-end gap-1"
                      >
                        <div
                          className="rounded-t bg-emerald-400/75"
                          style={{ height: `${height}%` }}
                        />
                        <div
                          className="rounded-b bg-rose-300/75"
                          style={{ height: `${Math.max(height - 42, 12)}%` }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">Atendimentos por tipo</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-indigo-500 bg-white text-center shadow-inner">
                  <div>
                    <p className="text-xs font-bold text-slate-500">Total</p>
                    <p className="text-3xl font-black">{totalTipos}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {tiposAtendimento.length > 0 ? (
                    tiposAtendimento.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <span className={`h-3 w-3 rounded-full ${item.color}`} />
                          {item.label}
                        </span>
                        <strong className="text-sm">
                          {Math.round((item.value / totalTipos) * 100)}% ({item.value})
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-slate-500">
                      Sem atendimentos cadastrados ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">Acessos rapidos</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <QuickAction href="/pacientes/novo" label="Novo paciente" icon={Users} />
                <QuickAction href="/agenda/novo" label="Novo agendamento" icon={CalendarDays} />
                <QuickAction href="/tratamentos" label="Novo tratamento" icon={HeartPulse} />
                <QuickAction href="/prontuario/novo" label="Nova consulta" icon={Stethoscope} />
                <QuickAction href="/prontuario" label="Prontuario rapido" icon={ClipboardList} />
                <QuickAction href="/financeiro/novo" label="Lancamento financeiro" icon={DollarSign} />
                <QuickAction href="/documentos" label="Documentos" icon={Folder} />
                <QuickAction href="/relatorios" label="Relatorios" icon={FileText} />
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50 px-5 py-4 text-indigo-900">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Star size={21} />
                <p className="text-sm font-bold">
                  Dica do Clini+: mantenha prontuarios, documentos e atendimentos
                  sempre atualizados para uma gestao mais segura.
                </p>
              </div>
              <ChevronRight size={20} />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
