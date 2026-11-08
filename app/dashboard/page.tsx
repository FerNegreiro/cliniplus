"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileText,
  Folder,
  HeartPulse,
  MessageCircle,
  Plus,
  Search,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  getAgendamentos,
  getLancamentosFinanceiros,
  getOrcamentos,
  getPacientes,
  getPerfil,
  getSessaoPlano,
  getTratamentos,
  perfilPadrao,
  setSessaoPlano,
  type CliniplusAgendamento,
  type CliniplusLancamentoFinanceiro,
  type CliniplusOrcamento,
  type CliniplusPaciente,
  type CliniplusTratamento,
  type PerfilUsuario,
  type SessaoPlano,
} from "@/utils/cliniplusStore";
import { classeStatus, labelStatus, normalizarStatus } from "@/utils/agendaStatus";
import { dataIsoLocal, formatarDataBr, hojeIso, somarDias } from "@/utils/datas";
import { dinheiroParaNumero, formatarMoeda, normalizarTexto } from "@/utils/format";

type PlanoSlug = "starter" | "pro" | "premium";
type PeriodoFinanceiro = "mes" | "mes-passado" | "ano";

type DashboardData = {
  pacientes: CliniplusPaciente[];
  agendamentos: CliniplusAgendamento[];
  tratamentos: CliniplusTratamento[];
  financeiro: CliniplusLancamentoFinanceiro[];
  orcamentos: CliniplusOrcamento[];
};

type Alerta = { id: string; titulo: string; detalhe: string; href: string };

const nomesPlanos: Record<PlanoSlug, string> = {
  starter: "Plano Starter",
  pro: "Plano Pro",
  premium: "Plano Premium",
};

const periodosFinanceiros: Array<{ valor: PeriodoFinanceiro; rotulo: string }> = [
  { valor: "mes", rotulo: "Este mes" },
  { valor: "mes-passado", rotulo: "Mes passado" },
  { valor: "ano", rotulo: "Este ano" },
];

const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const coresTipos = ["#6366f1", "#10b981", "#f43f5e", "#fb923c", "#0ea5e9"];

const dadosVazios: DashboardData = {
  pacientes: [],
  agendamentos: [],
  tratamentos: [],
  financeiro: [],
  orcamentos: [],
};

function normalizarPlano(valor: string | null | undefined): PlanoSlug {
  return valor === "pro" || valor === "premium" ? valor : "starter";
}

function lancamentoPago(item: CliniplusLancamentoFinanceiro) {
  return ["pago", "recebido do convenio"].includes(normalizarTexto(item.status));
}

function intervaloFinanceiro(periodo: PeriodoFinanceiro) {
  const hoje = new Date();
  if (periodo === "mes-passado") {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    return { inicio: dataIsoLocal(inicio), fim: dataIsoLocal(fim) };
  }
  if (periodo === "ano") {
    return { inicio: `${hoje.getFullYear()}-01-01`, fim: `${hoje.getFullYear()}-12-31` };
  }
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  return { inicio: dataIsoLocal(inicio), fim: dataIsoLocal(fim) };
}

function getHorario(item: CliniplusAgendamento) {
  return item.horario || item.hora || "";
}

function MetricCard({ title, value, detail, icon: Icon, tone }: { title: string; value: string; detail: string; icon: LucideIcon; tone: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-black text-slate-950">{value}</h3>
          <p className="mt-2 text-sm font-semibold text-slate-500">{detail}</p>
        </div>
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${tone}`}>
          <Icon size={26} />
        </span>
      </div>
    </div>
  );
}

function QuickAction({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
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

function ItemAgenda({ item, mostrarData }: { item: CliniplusAgendamento; mostrarData?: boolean }) {
  return (
    <Link
      href={`/agenda?data=${item.data}&visualizacao=dia`}
      className="grid gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-indigo-50 sm:grid-cols-[76px_1fr_auto] sm:items-center"
    >
      <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm">
        <p className="font-black text-slate-950">{getHorario(item) || "--:--"}</p>
        <p className="text-xs font-semibold text-slate-500">
          {mostrarData ? formatarDataBr(item.data).slice(0, 5) : item.duracao || "45 min"}
        </p>
      </div>
      <div className="min-w-0">
        <p className="truncate font-extrabold">{item.pacienteNome || item.paciente}</p>
        <p className="truncate text-sm font-medium text-slate-500">
          {item.procedimento || item.tipoAtendimento || item.tipo}
        </p>
      </div>
      <span className={`w-fit rounded-lg px-3 py-1 text-xs font-extrabold ${classeStatus(item.status)}`}>
        {labelStatus(item.status)}
      </span>
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryModo = searchParams.get("modo");
  const queryPlano = searchParams.get("plano");
  const [sessao, setSessao] = useState<SessaoPlano | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario>(perfilPadrao);
  const [dados, setDados] = useState<DashboardData>(dadosVazios);
  const [periodo, setPeriodo] = useState<PeriodoFinanceiro>("mes");
  const [busca, setBusca] = useState("");
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const painelAlertas = useRef<HTMLDivElement>(null);

  const modo = queryModo || sessao?.modo || "assinatura";
  const plano = normalizarPlano(queryPlano || sessao?.plano);
  const dias = searchParams.get("dias") || "7";
  const queryDemo = searchParams.get("demo");

  useEffect(() => {
    if (queryModo || queryPlano) {
      const sessaoAtual = {
        modo: queryModo || undefined,
        plano: queryPlano || undefined,
        demo: queryDemo || undefined,
      };
      setSessaoPlano(sessaoAtual);
      setSessao(sessaoAtual);
      return;
    }
    setSessao(getSessaoPlano() ?? null);
  }, [queryDemo, queryModo, queryPlano]);

  useEffect(() => {
    function carregar() {
      setPerfil(getPerfil());
      setDados({
        pacientes: getPacientes(),
        agendamentos: getAgendamentos(),
        tratamentos: getTratamentos(),
        financeiro: getLancamentosFinanceiros(),
        orcamentos: getOrcamentos(),
      });
    }

    carregar();
    window.addEventListener("cliniplus:store", carregar);
    return () => window.removeEventListener("cliniplus:store", carregar);
  }, []);

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
      if (painelAlertas.current && !painelAlertas.current.contains(event.target as Node)) {
        setAlertasAbertos(false);
      }
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  const hoje = hojeIso();
  const amanha = somarDias(hoje, 1);

  const agenda = useMemo(() => {
    const ordenar = (lista: CliniplusAgendamento[]) =>
      [...lista].sort((a, b) => `${a.data}${getHorario(a)}`.localeCompare(`${b.data}${getHorario(b)}`));
    const validos = dados.agendamentos.filter((item) => normalizarStatus(item.status) !== "bloqueio");
    const doDia = ordenar(validos.filter((item) => item.data === hoje));
    const ativosHoje = doDia.filter((item) => normalizarStatus(item.status) !== "cancelado");
    const atendidos = ativosHoje.filter((item) => normalizarStatus(item.status) === "concluido").length;
    const proximos = ordenar(
      validos.filter((item) => item.data > hoje && normalizarStatus(item.status) !== "cancelado")
    ).slice(0, 5);
    return { doDia, ativosHoje, atendidos, proximos };
  }, [dados.agendamentos, hoje]);

  const financeiro = useMemo(() => {
    const { inicio, fim } = intervaloFinanceiro(periodo);
    const noPeriodo = dados.financeiro.filter((item) => item.data >= inicio && item.data <= fim);
    const somar = (lista: CliniplusLancamentoFinanceiro[]) =>
      lista.reduce((total, item) => total + dinheiroParaNumero(item.valor), 0);
    const receitas = noPeriodo.filter((item) => item.tipo === "Receita");
    const despesas = noPeriodo.filter((item) => item.tipo === "Despesa");
    const recebido = somar(receitas.filter(lancamentoPago));
    const pago = somar(despesas.filter(lancamentoPago));

    const base = new Date();
    const meses = Array.from({ length: 6 }, (_, indice) => {
      const data = new Date(base.getFullYear(), base.getMonth() - (5 - indice), 1);
      const prefixo = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      const doMes = dados.financeiro.filter((item) => (item.data || "").startsWith(prefixo) && lancamentoPago(item));
      return {
        rotulo: nomesMeses[data.getMonth()],
        receitas: somar(doMes.filter((item) => item.tipo === "Receita")),
        despesas: somar(doMes.filter((item) => item.tipo === "Despesa")),
      };
    });

    return {
      recebido,
      pago,
      aReceber: somar(receitas.filter((item) => !lancamentoPago(item) && normalizarTexto(item.status) !== "glosado")),
      saldo: recebido - pago,
      quantidadeReceitas: receitas.length,
      meses,
      maiorMes: Math.max(...meses.map((mes) => Math.max(mes.receitas, mes.despesas)), 0),
    };
  }, [dados.financeiro, periodo]);

  const receitaDoMes = useMemo(() => {
    const { inicio, fim } = intervaloFinanceiro("mes");
    const receitas = dados.financeiro.filter(
      (item) => item.tipo === "Receita" && item.data >= inicio && item.data <= fim
    );
    return {
      valor: receitas.filter(lancamentoPago).reduce((total, item) => total + dinheiroParaNumero(item.valor), 0),
      quantidade: receitas.length,
    };
  }, [dados.financeiro]);

  const tratamentos = useMemo(() => {
    const status = (item: CliniplusTratamento) => normalizarTexto(item.status);
    return {
      emAndamento: dados.tratamentos.filter((item) => ["em andamento", "urgente"].includes(status(item))).length,
      planejados: dados.tratamentos.filter((item) => status(item) === "planejado").length,
    };
  }, [dados.tratamentos]);

  const pacientesAtivos = dados.pacientes.filter((paciente) =>
    ["ativo", "em tratamento", "retorno pendente", "em acompanhamento"].includes(normalizarTexto(paciente.status))
  ).length;

  const tiposAtendimento = useMemo(() => {
    const prefixo = hoje.slice(0, 7);
    const contagem = new Map<string, number>();
    dados.agendamentos
      .filter((item) => (item.data || "").startsWith(prefixo) && !["cancelado", "bloqueio"].includes(normalizarStatus(item.status)))
      .forEach((item) => {
        const tipo = item.tipo || item.tipoAtendimento || "Outros";
        contagem.set(tipo, (contagem.get(tipo) || 0) + 1);
      });
    const ordenados = [...contagem.entries()].sort((a, b) => b[1] - a[1]);
    const principais = ordenados.slice(0, 4);
    const outros = ordenados.slice(4).reduce((total, [, valor]) => total + valor, 0);
    if (outros > 0) principais.push(["Outros", outros]);
    const total = principais.reduce((soma, [, valor]) => soma + valor, 0);
    let acumulado = 0;
    const fatias = principais.map(([rotulo, valor], indice) => {
      const inicio = total ? (acumulado / total) * 100 : 0;
      acumulado += valor;
      const fim = total ? (acumulado / total) * 100 : 0;
      return { rotulo, valor, cor: coresTipos[indice % coresTipos.length], inicio, fim };
    });
    const gradiente = total
      ? `conic-gradient(${fatias.map((fatia) => `${fatia.cor} ${fatia.inicio}% ${fatia.fim}%`).join(", ")})`
      : "conic-gradient(#e2e8f0 0% 100%)";
    return { fatias, total, gradiente };
  }, [dados.agendamentos, hoje]);

  const alertas = useMemo<Alerta[]>(() => {
    const lista: Alerta[] = [];
    const paraConfirmar = dados.agendamentos.filter(
      (item) => [hoje, amanha].includes(item.data) && normalizarStatus(item.status) === "aguardando"
    );
    if (paraConfirmar.length) {
      lista.push({
        id: "confirmacoes",
        titulo: `${paraConfirmar.length} atendimento(s) sem confirmação`,
        detalhe: "Hoje e amanhã. Confirme pelo WhatsApp.",
        href: "/comunicacao",
      });
    }
    const atrasados = dados.financeiro.filter(
      (item) => item.tipo === "Receita" && normalizarTexto(item.status) === "pendente" && item.data && item.data < hoje
    );
    if (atrasados.length) {
      lista.push({
        id: "atrasados",
        titulo: `${atrasados.length} pagamento(s) em atraso`,
        detalhe: formatarMoeda(atrasados.reduce((total, item) => total + dinheiroParaNumero(item.valor), 0)),
        href: "/financeiro",
      });
    }
    const retornos = dados.pacientes.filter((item) => normalizarTexto(item.status).includes("retorno"));
    if (retornos.length) {
      lista.push({
        id: "retornos",
        titulo: `${retornos.length} paciente(s) com retorno pendente`,
        detalhe: "Chame de volta para não perder o tratamento.",
        href: "/comunicacao",
      });
    }
    const orcamentosParados = dados.orcamentos.filter(
      (item) => item.status === "enviado" && (item.criadoEm || "").slice(0, 10) <= somarDias(hoje, -7)
    );
    if (orcamentosParados.length) {
      lista.push({
        id: "orcamentos",
        titulo: `${orcamentosParados.length} orçamento(s) sem resposta há 7 dias`,
        detalhe: "Vale um lembrete para o paciente.",
        href: "/orcamentos",
      });
    }
    return lista;
  }, [amanha, dados, hoje]);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const termo = busca.trim();
    router.push(termo ? `/pacientes?busca=${encodeURIComponent(termo)}` : "/pacientes");
  }

  const badgePlano = modo === "teste" ? `${nomesPlanos.starter} - ${dias} dias de teste` : `${nomesPlanos[plano]} ativo`;
  const rotuloPeriodo = periodosFinanceiros.find((item) => item.valor === periodo)?.rotulo || "";

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar active="Dashboard" plano={plano} />

        <section className="min-w-0 flex-1 px-6 py-5 lg:px-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Olá, {perfil.tratamento} {perfil.nome.split(" ")[0]}
              </h1>
              <p className="mt-1 text-base font-medium text-slate-500">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form
                onSubmit={buscar}
                className="flex h-12 min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500 shadow-sm sm:w-[380px]"
              >
                <Search size={19} />
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  placeholder="Buscar paciente por nome, CPF ou telefone"
                />
              </form>

              <div className="flex items-center gap-2">
                <div ref={painelAlertas} className="relative">
                  <button
                    type="button"
                    onClick={() => setAlertasAbertos((aberto) => !aberto)}
                    className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-800 shadow-sm"
                    aria-label="Alertas"
                    aria-expanded={alertasAbertos}
                  >
                    <Bell size={20} />
                    {alertas.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white">
                        {alertas.length}
                      </span>
                    )}
                  </button>
                  {alertasAbertos && (
                    <div className="absolute right-0 z-40 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                      <p className="px-1 text-sm font-black">Alertas</p>
                      <div className="mt-2 space-y-2">
                        {alertas.map((alerta) => (
                          <Link
                            key={alerta.id}
                            href={alerta.href}
                            className="block rounded-lg bg-slate-50 px-3 py-2 hover:bg-indigo-50"
                          >
                            <p className="text-sm font-extrabold text-slate-900">{alerta.titulo}</p>
                            <p className="text-xs font-semibold text-slate-500">{alerta.detalhe}</p>
                          </Link>
                        ))}
                        {alertas.length === 0 && (
                          <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
                            Nenhum alerta no momento.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  href="/comunicacao"
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-800 shadow-sm"
                  aria-label="Comunicação"
                >
                  <MessageCircle size={20} />
                </Link>
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

          <div className="mt-5">
            <Link
              href="/planos"
              className="inline-flex rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-indigo-700 shadow-sm ring-1 ring-slate-200"
            >
              {badgePlano}
            </Link>
          </div>

          <section className="mt-6 grid gap-4 xl:grid-cols-4">
            <MetricCard
              title="Atendimentos hoje"
              value={String(agenda.ativosHoje.length)}
              detail={`${agenda.atendidos} atendidos - ${Math.max(agenda.ativosHoje.length - agenda.atendidos, 0)} restantes`}
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
              title="Recebido este mês"
              value={formatarMoeda(receitaDoMes.valor)}
              detail={`${receitaDoMes.quantidade} receita(s) lançada(s) no mês`}
              icon={DollarSign}
              tone="bg-emerald-500"
            />
            <MetricCard
              title="Tratamentos em andamento"
              value={String(tratamentos.emAndamento)}
              detail={`${tratamentos.planejados} planejado(s) aguardando início`}
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
                <Link href={`/agenda?data=${hoje}&visualizacao=dia`} className="text-sm font-extrabold text-indigo-700">
                  Ver agenda completa
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {agenda.doDia.map((item) => (
                  <ItemAgenda key={String(item.id)} item={item} />
                ))}
                {agenda.doDia.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                    <p className="font-extrabold">Nenhum atendimento hoje</p>
                    <Link href="/agenda/novo" className="mt-1 inline-block text-sm font-bold text-indigo-700">
                      Agendar atendimento
                    </Link>
                  </div>
                )}
              </div>

              {agenda.doDia.length === 0 && agenda.proximos.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-black text-slate-700">Próximos atendimentos</p>
                  <div className="mt-3 space-y-3">
                    {agenda.proximos.map((item) => (
                      <ItemAgenda key={String(item.id)} item={item} mostrarData />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-indigo-600" size={23} />
                  <h2 className="text-lg font-black">Resumo financeiro</h2>
                </div>
                <select
                  value={periodo}
                  onChange={(event) => setPeriodo(event.target.value as PeriodoFinanceiro)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 outline-none"
                >
                  {periodosFinanceiros.map((item) => (
                    <option key={item.valor} value={item.valor}>
                      {item.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Recebido</p>
                  <p className="mt-2 text-xl font-black text-slate-950">{formatarMoeda(financeiro.recebido)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatarMoeda(financeiro.aReceber)} a receber
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Despesas pagas</p>
                  <p className="mt-2 text-xl font-black text-slate-950">{formatarMoeda(financeiro.pago)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{rotuloPeriodo}</p>
                </div>
                <div className={`rounded-lg p-4 ${financeiro.saldo < 0 ? "bg-rose-50" : "bg-emerald-50"}`}>
                  <p className={`text-sm font-bold ${financeiro.saldo < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                    Saldo
                  </p>
                  <p className={`mt-2 text-xl font-black ${financeiro.saldo < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {formatarMoeda(financeiro.saldo)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Recebido menos despesas</p>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Últimos 6 meses (valores pagos)</span>
                  <span className="flex gap-3">
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Receitas</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-300" />Despesas</span>
                  </span>
                </div>
                <div className="mt-4 flex h-40 items-end gap-3">
                  {financeiro.meses.map((mes) => (
                    <div key={mes.rotulo} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-32 w-full items-end justify-center gap-1">
                        {[{ valor: mes.receitas, cor: "bg-emerald-400" }, { valor: mes.despesas, cor: "bg-rose-300" }].map((barra, indice) => (
                          <div
                            key={indice}
                            title={formatarMoeda(barra.valor)}
                            className={`w-1/3 rounded-t ${barra.cor}`}
                            style={{ height: `${financeiro.maiorMes ? Math.max((barra.valor / financeiro.maiorMes) * 100, barra.valor > 0 ? 3 : 0) : 0}%` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-500">{mes.rotulo}</span>
                    </div>
                  ))}
                </div>
                {financeiro.maiorMes === 0 && (
                  <p className="mt-2 text-center text-xs font-semibold text-slate-500">
                    Nenhum valor pago nos últimos 6 meses.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">Atendimentos do mês por tipo</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full" style={{ background: tiposAtendimento.gradiente }}>
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center">
                    <p className="text-xs font-bold text-slate-500">Total</p>
                    <p className="text-3xl font-black">{tiposAtendimento.total}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {tiposAtendimento.fatias.map((fatia) => (
                    <div key={fatia.rotulo} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <span className="h-3 w-3 rounded-full" style={{ background: fatia.cor }} />
                        {fatia.rotulo}
                      </span>
                      <strong className="text-sm">
                        {Math.round((fatia.valor / (tiposAtendimento.total || 1)) * 100)}% ({fatia.valor})
                      </strong>
                    </div>
                  ))}
                  {tiposAtendimento.total === 0 && (
                    <p className="text-sm font-medium text-slate-500">Nenhum atendimento agendado neste mês.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">Acessos rápidos</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <QuickAction href="/pacientes/novo" label="Novo paciente" icon={Users} />
                <QuickAction href="/agenda/novo" label="Novo agendamento" icon={CalendarDays} />
                <QuickAction href="/prontuario" label="Prontuários" icon={ClipboardList} />
                <QuickAction href="/orcamentos" label="Orçamentos" icon={Wallet} />
                <QuickAction href="/tratamentos" label="Tratamentos" icon={HeartPulse} />
                <QuickAction href="/financeiro/novo" label="Lançamento financeiro" icon={DollarSign} />
                <QuickAction href="/documentos" label="Documentos" icon={Folder} />
                <QuickAction href="/relatorios" label="Relatórios" icon={FileText} />
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
