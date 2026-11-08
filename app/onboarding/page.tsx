"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Copy,
  FileText,
  HeartPulse,
  type LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ReceiptText,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
  WalletCards,
} from "lucide-react";
import {
  configClinicaPadrao,
  getConfigClinica,
  saveConfigClinica,
  type ConfigClinica,
} from "@/utils/cliniplusStore";

type PlanoSlug = "starter" | "pro" | "premium";
type ModoSlug = "teste" | "assinatura";

type IconComponent = LucideIcon | typeof SparkleIcon;
type Servico = { nome: string; descricao: string; icon: IconComponent };

const etapas = [
  { numero: 1, titulo: "Boas-vindas", subtitulo: "Plano selecionado" },
  { numero: 2, titulo: "Seu(s) servico(s)", subtitulo: "Odontologia e HOF" },
  {
    numero: 3,
    titulo: "Sua clinica ou consultorio",
    subtitulo: "Informacoes basicas",
  },
  { numero: 4, titulo: "Equipe", subtitulo: "Convide sua equipe" },
  { numero: 5, titulo: "Configuracoes", subtitulo: "Preferencias iniciais" },
  { numero: 6, titulo: "Pagamento", subtitulo: "Finalize sua assinatura" },
  { numero: 7, titulo: "Tudo pronto!", subtitulo: "Vamos comecar" },
];

const servicosTesteGratis: Servico[] = [
  { nome: "Agendamento online", descricao: "Organize horarios, retornos e disponibilidade.", icon: CalendarDays },
  { nome: "Cadastro de pacientes", descricao: "Centralize cadastros e historico de atendimento.", icon: Users },
  { nome: "Prontuario eletronico basico", descricao: "Registre informacoes clinicas essenciais.", icon: ClipboardList },
  { nome: "Controle de retornos", descricao: "Acompanhe proximos atendimentos e continuidade.", icon: CalendarDays },
  { nome: "Orcamentos parciais e totais", descricao: "Crie propostas e acompanhe aprovacoes.", icon: WalletCards },
  { nome: "Galeria de fotos e arquivos", descricao: "Organize imagens e documentos do paciente.", icon: FileText },
  { nome: "Financeiro basico", descricao: "Controle lancamentos essenciais.", icon: WalletCards },
  { nome: "Relatorios basicos", descricao: "Veja indicadores iniciais da operacao.", icon: HeartPulse },
  { nome: "Confirmacoes manuais pelo WhatsApp Web", descricao: "Confirme atendimentos manualmente pelo WhatsApp Web.", icon: MessageCircle },
  { nome: "Suporte por WhatsApp", descricao: "Receba suporte pelo canal principal.", icon: MessageCircle },
];

const odontologiaStarter: Servico[] = [
  { nome: "Agendamento online", descricao: "Organize horarios, retornos e disponibilidade.", icon: CalendarDays },
  { nome: "Cadastro de pacientes", descricao: "Centralize cadastros e historico de atendimento.", icon: Users },
  { nome: "Prontuario eletronico basico", descricao: "Registre informacoes clinicas essenciais.", icon: ClipboardList },
  { nome: "Controle de retornos", descricao: "Acompanhe proximos atendimentos e continuidade.", icon: CalendarDays },
  { nome: "Orcamentos parciais e totais", descricao: "Crie propostas e acompanhe aprovacoes.", icon: WalletCards },
  { nome: "Galeria de fotos e arquivos", descricao: "Organize imagens e documentos do paciente.", icon: FileText },
  { nome: "Financeiro basico", descricao: "Controle recebimentos essenciais.", icon: WalletCards },
  { nome: "Relatorios basicos", descricao: "Veja uma leitura inicial da clinica.", icon: HeartPulse },
  { nome: "Confirmacoes manuais pelo WhatsApp Web", descricao: "Confirme atendimentos manualmente pelo WhatsApp Web.", icon: MessageCircle },
  { nome: "Suporte por WhatsApp", descricao: "Receba suporte pelo canal principal.", icon: MessageCircle },
];

const odontologiaPro: Servico[] = [
  { nome: "Agendamento online", descricao: "Organize horarios, retornos e disponibilidade.", icon: CalendarDays },
  { nome: "Profissionais e usuarios ilimitados", descricao: "Cresca a equipe sem limite de usuarios.", icon: Users },
  { nome: "Gestao financeira completa", descricao: "Controle financeiro completo da clinica.", icon: WalletCards },
  { nome: "Prontuario com odontograma", descricao: "Use prontuario odontologico com odontograma.", icon: HeartPulse },
  { nome: "Controle de retornos", descricao: "Acompanhe proximos atendimentos e continuidade.", icon: CalendarDays },
  { nome: "Modulo de HOF", descricao: "Organize procedimentos de harmonizacao orofacial.", icon: SparkleIcon },
  { nome: "Boletos, Pix e link de pagamento", descricao: "Amplie as formas de recebimento.", icon: WalletCards },
  { nome: "Orcamentos parciais e totais", descricao: "Crie propostas completas ou por etapa.", icon: FileText },
  { nome: "App de agenda para o profissional", descricao: "Facilite o acesso da equipe aos horarios.", icon: CalendarDays },
  { nome: "Galeria de fotos, videos e arquivos", descricao: "Centralize midias e anexos do paciente.", icon: FileText },
  { nome: "Prescricoes digitais", descricao: "Emita prescricoes de forma digital.", icon: ClipboardList },
  { nome: "iDoc - Radio Memory", descricao: "Prepare integracao com documentos radiologicos.", icon: FileText },
  { nome: "Confirmacoes manuais pelo WhatsApp Web", descricao: "Confirme atendimentos manualmente pelo WhatsApp Web.", icon: MessageCircle },
  { nome: "Treinamentos e suporte por WhatsApp", descricao: "Tenha suporte e orientacoes pelo WhatsApp.", icon: MessageCircle },
];

const odontologiaPremium: Servico[] = [
  { nome: "Tudo do Plano Pro", descricao: "Inclui os recursos completos do Plano Pro.", icon: Check },
  { nome: "Agendas ilimitadas", descricao: "Configure agendas sem limite para a operacao.", icon: CalendarDays },
  { nome: "Campanhas de marketing pelo WhatsApp", descricao: "Comunique campanhas para pacientes.", icon: MessageCircle },
  { nome: "Integracao com Sante Conversas", descricao: "Conecte comunicacao ao fluxo comercial.", icon: MessageCircle },
  { nome: "Confirmacao automatica pelo WhatsApp", descricao: "Automatize confirmacoes de consulta.", icon: MessageCircle },
  { nome: "Lembretes de agendamentos automaticos", descricao: "Reduza faltas com lembretes automaticos.", icon: CalendarDays },
  { nome: "Mensagens de aniversario automaticas", descricao: "Envie mensagens comemorativas automaticamente.", icon: MessageCircle },
  { nome: "Personalizacao do sistema", descricao: "Ajuste a experiencia da clinica.", icon: Settings },
  { nome: "Notas fiscais NFS-e", descricao: "Prepare emissao de notas fiscais.", icon: FileText },
  { nome: "Modulo de comissoes", descricao: "Controle repasses e comissoes.", icon: WalletCards },
  { nome: "Assinatura eletronica ilimitada", descricao: "Assine documentos sem limite.", icon: FileText },
  { nome: "Transcricao de audios com IA no prontuario", descricao: "Transforme audios em registros clinicos.", icon: SparkleIcon },
  { nome: "CRM de vendas", descricao: "Acompanhe oportunidades e conversoes.", icon: WalletCards },
];

const servicosOdontologiaPorPlano: Record<PlanoSlug, Servico[]> = {
  starter: odontologiaStarter,
  pro: odontologiaPro,
  premium: odontologiaPremium,
};

const planos: Array<{ slug: PlanoSlug; nome: string; resumo: string }> = [
  { slug: "starter", nome: "Plano Starter", resumo: "Para comecar" },
  { slug: "pro", nome: "Plano Pro", resumo: "Automacoes e produtividade" },
  { slug: "premium", nome: "Plano Premium", resumo: "Operacao completa" },
];

const precosPlanos: Record<PlanoSlug, string> = {
  starter: "R$ 90/mês",
  pro: "R$ 145/mês",
  premium: "R$ 380/mês",
};

const preferencias = [
  "Agenda inteligente",
  "Prontuario eletronico",
  "Gestao financeira",
  "Relatorios e dashboards",
];

const funcoesEquipe = ["Cirurgiao-dentista", "ASB / TSB", "Recepcao", "Gestor"];
const equipeStorageKey = "equipe-cliniplus";

type MembroEquipeOnboarding = {
  id: string | number;
  nome: string;
  cargo: string;
  funcao: string;
  especialidade: string;
  email: string;
  telefone: string;
  status: "Ativo" | "Inativo";
};

function lerEquipeOnboarding() {
  if (typeof window === "undefined") {
    return [];
  }

  const salvo = window.localStorage.getItem(equipeStorageKey);

  if (!salvo) {
    return [];
  }

  try {
    return JSON.parse(salvo) as MembroEquipeOnboarding[];
  } catch {
    return [];
  }
}

function salvarEquipeOnboarding(equipe: MembroEquipeOnboarding[]) {
  window.localStorage.setItem(equipeStorageKey, JSON.stringify(equipe));
}

function criarIdEquipe() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return String(Date.now());
}

function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 shadow-sm">
        <svg viewBox="0 0 128 128" aria-label="Clini+" className="h-10 w-10">
          <defs>
            <linearGradient
              id="onboarding-c-gradient"
              x1="31"
              y1="20"
              x2="93"
              y2="105"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1B7CFF" />
              <stop offset="1" stopColor="#11D5B0" />
            </linearGradient>
            <linearGradient
              id="onboarding-plus-gradient"
              x1="68"
              y1="35"
              x2="95"
              y2="89"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#36E8A7" />
              <stop offset="1" stopColor="#1378FF" />
            </linearGradient>
          </defs>
          <path
            d="M88 25A46 46 0 1 0 88 103"
            fill="none"
            stroke="url(#onboarding-c-gradient)"
            strokeLinecap="round"
            strokeWidth="28"
          />
          <path
            d="M80 48v32M64 64h32"
            fill="none"
            stroke="url(#onboarding-plus-gradient)"
            strokeLinecap="round"
            strokeWidth="20"
          />
        </svg>
      </span>
      <span className="text-3xl font-extrabold tracking-normal text-slate-950">
        Clini<span className="text-cyan-600">+</span>
      </span>
    </Link>
  );
}

function Field({
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  icon: LucideIcon;
  value?: string;
  onChange?: (valor: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/60 focus-within:border-cyan-500">
        <Icon size={19} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}

function normalizarEtapa(valor: string | null) {
  const etapa = Number(valor ?? "1");
  if (Number.isInteger(etapa) && etapa >= 1 && etapa <= 7) return etapa;
  return 1;
}

function normalizarPlano(valor: string | null): PlanoSlug | "" {
  const encontrado = planos.find((plano) => plano.slug === valor);
  return encontrado?.slug ?? "";
}

function normalizarModo(valor: string | null): ModoSlug | "" {
  if (valor === "teste" || valor === "assinatura") return valor;
  return "";
}

function getRotuloModo(modo: ModoSlug | "", plano: PlanoSlug | "") {
  if (modo === "teste") return "Teste gratis por 7 dias";

  const planoSelecionado = planos.find((item) => item.slug === plano);
  if (planoSelecionado) return planoSelecionado.nome;

  return "Sem plano selecionado";
}

function getServicosOnboarding(plano: PlanoSlug | "", modo: ModoSlug | "") {
  if (modo === "teste") return servicosTesteGratis;
  return servicosOdontologiaPorPlano[plano || "starter"];
}

function criarLinkEtapa(
  etapa: number,
  params: {
    plano?: string;
    modo?: string;
  }
) {
  const searchParams = new URLSearchParams();

  searchParams.set("etapa", String(etapa));

  if (params.plano) {
    searchParams.set("plano", params.plano);
  }

  if (params.modo) {
    searchParams.set("modo", params.modo);
  }

  return `/onboarding?${searchParams.toString()}`;
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const etapaAtiva = normalizarEtapa(searchParams.get("etapa"));
  const modo = normalizarModo(searchParams.get("modo"));
  const planoParam = normalizarPlano(searchParams.get("plano"));
  const plano: PlanoSlug | "" = modo === "teste" ? "starter" : planoParam;
  const nomeProfissao = "Odontologia";
  const planoSelecionado = planos.find((item) => item.slug === plano);
  const rotuloModo = getRotuloModo(modo, plano);
  const servicos = getServicosOnboarding(plano, modo);
  const planoPagamento: PlanoSlug = plano || "starter";
  const hrefDashboardAssinatura = `/dashboard?modo=assinatura&plano=${planoPagamento}`;

  function criarHref(etapa: number, novoPlano = plano, novoModo = modo) {
    return criarLinkEtapa(etapa, {
      plano: novoPlano,
      modo: novoModo,
    });
  }

  const proximaEtapa = Math.min(etapaAtiva + 1, 7);
  const etapaAnterior = Math.max(etapaAtiva - 1, 1);
  const hrefAnterior =
    etapaAtiva === 1
      ? plano && modo === "assinatura"
        ? "/planos"
        : "/cadastro"
      : criarHref(etapaAnterior);
  const hrefProximo = criarHref(proximaEtapa);
  const hrefDashboard =
    modo === "assinatura" ? hrefDashboardAssinatura : "/dashboard";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 rounded-3xl border border-slate-100 bg-white px-5 py-5 shadow-sm sm:px-6 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Logo />
            <div className="border-slate-200 sm:border-l sm:pl-5">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
                Configuracao inicial
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">
                Prepare sua conta para comecar a usar o Clini+
              </h1>
            </div>
          </div>

          <Link
            href={hrefDashboard}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            Pular por agora
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)_330px]">
          <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-4 shadow-sm lg:sticky lg:top-6">
            <p className="px-2 text-sm font-bold text-slate-500">Etapas</p>
            <div className="mt-4 space-y-2">
              {etapas.map((etapa) => {
                const ativa = etapa.numero === etapaAtiva;
                const concluida = etapa.numero < etapaAtiva;
                const subtitulo = etapa.subtitulo;

                return (
                  <Link
                    key={etapa.numero}
                    href={criarHref(etapa.numero)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      ativa
                        ? "bg-cyan-50 text-cyan-800"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold ${
                        ativa
                          ? "bg-cyan-600 text-white"
                          : concluida
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {concluida ? <Check size={16} /> : etapa.numero}
                    </span>
                    <span>
                      <span className="block font-bold">{etapa.titulo}</span>
                      <span className="mt-0.5 block text-xs font-semibold">
                        {subtitulo}
                      </span>
                    </span>
                    {ativa && <ChevronRight className="ml-auto" size={18} />}
                  </Link>
                );
              })}
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              {etapaAtiva === 1 && (
                <EtapaBoasVindas
                  plano={planoSelecionado}
                  valor={modo === "teste" ? "7 dias grátis" : precosPlanos[planoPagamento]}
                  nomeProfissao={nomeProfissao}
                />
              )}
              {etapaAtiva === 2 && (
                <EtapaServicos
                  nomeProfissao={nomeProfissao}
                  servicos={servicos}
                  rotuloModo={rotuloModo}
                />
              )}
              {etapaAtiva === 3 && <EtapaClinica nomeProfissao={nomeProfissao} />}
              {etapaAtiva === 4 && <EtapaEquipe nomeProfissao={nomeProfissao} />}
              {etapaAtiva === 5 && (
                <EtapaConfiguracoes
                  criarHref={criarHref}
                  plano={plano}
                  modo={modo}
                  nomeProfissao={nomeProfissao}
                />
              )}
              {etapaAtiva === 6 && (
                <EtapaPagamento
                  plano={planoSelecionado}
                  planoSlug={planoPagamento}
                  valor={precosPlanos[planoPagamento]}
                  nomeProfissao={nomeProfissao}
                  hrefDashboard={hrefDashboardAssinatura}
                />
              )}
              {etapaAtiva === 7 && (
                <EtapaFinal
                  nomeProfissao={nomeProfissao}
                  rotuloModo={rotuloModo}
                  hrefDashboard={hrefDashboard}
                />
              )}
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <Link
                href={hrefAnterior}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
              >
                <ArrowLeft size={18} />
                Voltar
              </Link>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {etapaAtiva > 1 && etapaAtiva < 6 && (
                  <Link
                    href={hrefProximo}
                    className="inline-flex h-12 items-center justify-center px-5 text-sm font-extrabold text-cyan-700 transition hover:text-cyan-900"
                  >
                    Pular etapa
                  </Link>
                )}

                {etapaAtiva < 6 && (
                  <Link
                    href={hrefProximo}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
                  >
                    Continuar
                    <ArrowRight size={19} />
                  </Link>
                )}

                {etapaAtiva === 7 && (
                  <Link
                    href={hrefDashboard}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
                  >
                    Acessar dashboard
                    <ArrowRight size={19} />
                  </Link>
                )}
              </div>
            </div>
          </section>

          <ResumoLateral
            nomeProfissao={nomeProfissao}
            plano={planoSelecionado}
            modo={modo}
            rotuloModo={rotuloModo}
            servicos={servicos}
            etapaAtiva={etapaAtiva}
            hrefDashboard={hrefDashboard}
          />
        </div>
      </section>
    </main>
  );
}

function EtapaBoasVindas({
  plano,
  valor,
  nomeProfissao,
}: {
  plano: { nome: string; resumo: string } | undefined;
  valor: string;
  nomeProfissao: string;
}) {
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
        Etapa 1
      </p>
      <h2 className="mt-1 text-3xl font-extrabold">
        Bem-vindo ao onboarding do Clini+
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        Vamos configurar o Clini+ para a sua clinica odontologica, com
        prontuario, odontograma, orcamentos e modulo de HOF.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
          <p className="text-sm font-bold text-cyan-800">Plano escolhido</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-950">
            {plano?.nome ?? "Plano Starter"}
          </h3>
          <p className="mt-1 text-sm font-bold text-cyan-700">{valor}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-600">Especialidade</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-950">
            {nomeProfissao} e HOF
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Prontuario, odontograma e harmonizacao orofacial.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-600">Proximos passos</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-950">
            Configuracao e pagamento
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Finalize a assinatura na etapa 6.
          </p>
        </div>
      </div>
    </>
  );
}

function EtapaServicos({
  nomeProfissao,
  servicos,
  rotuloModo,
}: {
  nomeProfissao: string;
  servicos: Servico[];
  rotuloModo: string;
}) {
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
        Etapa 2
      </p>
      <h2 className="mt-1 text-3xl font-extrabold">
        Escolha os servicos para {nomeProfissao}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        A lista abaixo muda de acordo com o plano e o modo atual:
        <span className="font-extrabold text-cyan-700"> {rotuloModo}</span>.
      </p>

      {(
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {servicos.map((servico, index) => {
            const Icon = servico.icon;

            return (
              <label
                key={servico.nome}
                className="flex min-h-[180px] cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <Icon size={24} />
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked={index < 2}
                    className="h-5 w-5 rounded border-slate-300 accent-cyan-600"
                  />
                </span>
                <span>
                  <span className="block text-base font-extrabold text-slate-950">
                    {servico.nome}
                  </span>
                  <span className="mt-2 block text-sm font-semibold leading-relaxed text-slate-500">
                    {servico.descricao}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </>
  );
}

function EtapaClinica({ nomeProfissao }: { nomeProfissao: string }) {
  const [clinica, setClinica] = useState<ConfigClinica>(configClinicaPadrao);

  useEffect(() => {
    setClinica(getConfigClinica());
  }, []);

  function atualizar(campo: keyof ConfigClinica, valor: string) {
    const proxima = { ...clinica, [campo]: valor };
    setClinica(proxima);
    saveConfigClinica(proxima);
  }

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
        Etapa 3
      </p>
      <h2 className="mt-1 text-3xl font-extrabold">
        Vamos conhecer seu espaco de atendimento
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        Esses dados aparecem nos planos de tratamento impressos de {nomeProfissao}.
        Voce pode alterar depois em Configuracoes.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field
            label="Nome da clinica ou consultorio"
            placeholder="Ex: Clinica Sorriso"
            icon={Building2}
            value={clinica.nomeClinica}
            onChange={(valor) => atualizar("nomeClinica", valor)}
          />
        </div>
        <Field
          label="Telefone / WhatsApp"
          placeholder="(85) 99999-9999"
          icon={Phone}
          value={clinica.telefone}
          onChange={(valor) => atualizar("telefone", valor)}
        />
        <Field
          label="E-mail da clinica"
          placeholder="contato@seudominio.com.br"
          icon={Mail}
          value={clinica.email}
          onChange={(valor) => atualizar("email", valor)}
        />
        <Field
          label="CNPJ ou CPF (opcional)"
          placeholder="00.000.000/0000-00"
          icon={Building2}
          value={clinica.documento}
          onChange={(valor) => atualizar("documento", valor)}
        />
        <Field
          label="Endereco (opcional)"
          placeholder="Rua, numero - bairro, cidade - UF"
          icon={MapPin}
          value={clinica.endereco}
          onChange={(valor) => atualizar("endereco", valor)}
        />
      </div>
    </>
  );
}

function EtapaEquipe({ nomeProfissao }: { nomeProfissao: string }) {
  const [equipe, setEquipe] = useState<MembroEquipeOnboarding[]>([]);
  const [novoProfissional, setNovoProfissional] = useState({
    nome: "",
    email: "",
    funcao: funcoesEquipe[0],
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    setEquipe(lerEquipeOnboarding());
  }, []);

  function atualizarEquipe(proximaEquipe: MembroEquipeOnboarding[]) {
    setEquipe(proximaEquipe);
    salvarEquipeOnboarding(proximaEquipe);
  }

  function adicionarProfissional() {
    const nome = novoProfissional.nome.trim();
    const email = novoProfissional.email.trim();
    const funcao = novoProfissional.funcao;

    if (!nome || !email) {
      setErro("Preencha nome e e-mail para adicionar o profissional.");
      return;
    }

    atualizarEquipe([
      ...equipe,
      {
        id: criarIdEquipe(),
        nome,
        email,
        funcao,
        cargo: funcao,
        especialidade: "",
        telefone: "",
        status: "Ativo",
      },
    ]);
    setNovoProfissional({
      nome: "",
      email: "",
      funcao: funcoesEquipe[0],
    });
    setErro("");
  }

  function removerProfissional(id: string | number) {
    atualizarEquipe(equipe.filter((membro) => membro.id !== id));
  }

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
        Etapa 4
      </p>
      <h2 className="mt-1 text-3xl font-extrabold">
        Convide sua equipe para fazer parte do Clini+
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        Voce podera convidar agora ou pular esta etapa. Todos terao acesso com
        permissoes personalizadas para {nomeProfissao}.
      </p>

      <form
        className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]"
        onSubmit={(event) => {
          event.preventDefault();
          adicionarProfissional();
        }}
      >
        <label className="block">
          <span className="text-sm font-bold text-slate-800">
            Nome do profissional
          </span>
          <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/60 focus-within:border-cyan-500">
            <Users size={19} />
            <input
              type="text"
              value={novoProfissional.nome}
              onChange={(event) =>
                setNovoProfissional((atual) => ({
                  ...atual,
                  nome: event.target.value,
                }))
              }
              placeholder="Nome completo"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-800">E-mail</span>
          <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/60 focus-within:border-cyan-500">
            <Mail size={19} />
            <input
              type="email"
              value={novoProfissional.email}
              onChange={(event) =>
                setNovoProfissional((atual) => ({
                  ...atual,
                  email: event.target.value,
                }))
              }
              placeholder="profissional@email.com"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Funcao</span>
          <select
            value={novoProfissional.funcao}
            onChange={(event) =>
              setNovoProfissional((atual) => ({
                ...atual,
                funcao: event.target.value,
              }))
            }
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm shadow-slate-200/60 outline-none focus:border-cyan-500"
          >
            {funcoesEquipe.map((funcao) => (
              <option key={funcao}>{funcao}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-12 rounded-xl bg-cyan-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700 sm:w-fit md:col-span-3 md:justify-self-end"
        >
          Adicionar profissional
        </button>
      </form>

      {erro && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {erro}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {equipe.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <h3 className="text-lg font-extrabold text-slate-900">
              Nenhum profissional convidado ainda
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-slate-500">
              Adicione profissionais da sua equipe ou pule esta etapa para
              configurar depois.
            </p>
          </div>
        ) : (
          equipe.map((membro) => (
            <div
              key={membro.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-sm font-extrabold text-cyan-700">
                {membro.nome
                  .split(" ")
                  .map((parte) => parte[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-slate-900">
                  {membro.nome}
                </span>
                <span className="block truncate text-sm font-semibold text-slate-500">
                  {membro.email}
                </span>
              </span>
              <span className="w-fit rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600">
                {membro.funcao || membro.cargo}
              </span>
              <button
                type="button"
                onClick={() => removerProfissional(membro.id)}
                className="w-fit rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                Remover
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function EtapaConfiguracoes({
  criarHref,
  plano,
  modo,
  nomeProfissao,
}: {
  criarHref: (
    etapa: number,
    novoPlano?: PlanoSlug | "",
    novoModo?: ModoSlug | ""
  ) => string;
  plano: PlanoSlug | "";
  modo: ModoSlug | "";
  nomeProfissao: string;
}) {
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
        Etapa 5
      </p>
      <h2 className="mt-1 text-3xl font-extrabold">
        Ajuste suas preferencias iniciais
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        Defina o ponto de partida para sua rotina em {nomeProfissao}. O plano
        tambem pode ser alterado sem prender o onboarding a uma opcao fixa.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-extrabold text-slate-950">
            Plano escolhido
          </h3>
          <div className="mt-4 grid gap-3">
            {planos.map((item) => (
              <Link
                key={item.slug}
                href={criarHref(5, item.slug, modo || "assinatura")}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  plano === item.slug
                    ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50"
                }`}
              >
                <span>
                  <span className="block">{item.nome}</span>
                  <span className="mt-1 block text-xs font-semibold">
                    {item.resumo}
                  </span>
                </span>
                {plano === item.slug && <Check size={18} />}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-extrabold text-slate-950">
            Recursos iniciais
          </h3>
          <div className="mt-4 space-y-3">
            {preferencias.map((preferencia) => (
              <label
                key={preferencia}
                className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-slate-300 accent-cyan-600"
                />
                {preferencia}
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function EtapaPagamento({
  plano,
  planoSlug,
  valor,
  nomeProfissao,
  hrefDashboard,
}: {
  plano: { nome: string; resumo: string } | undefined;
  planoSlug: PlanoSlug;
  valor: string;
  nomeProfissao: string;
  hrefDashboard: string;
}) {
  const [formaPagamento, setFormaPagamento] = useState<
    "cartao" | "pix" | "boleto"
  >("cartao");
  const [copiado, setCopiado] = useState("");
  const codigoPix =
    "00020126580014br.gov.bcb.pix0136clini-plus-pagamento-demo520400005303986540590.005802BR5920CLINI PLUS6009SAO PAULO62070503***6304ABCD";
  const linhaBoleto =
    "34191.79001 01043.510047 91020.150008 8 98760000009000";

  function copiar(valor: string, tipo: string) {
    void navigator.clipboard?.writeText(valor);
    setCopiado(tipo);
  }

  return (
    <>
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
        Etapa 6
      </p>
      <h2 className="mt-1 text-3xl font-extrabold">
        Tudo pronto! Finalize sua assinatura
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
        Escolha a forma de pagamento para liberar seu plano.
      </p>
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        Ambiente de demonstracao: nenhuma cobranca e feita e os codigos abaixo sao exemplos.
        O pagamento real entra com a integracao de um gateway (como Mercado Pago ou Stripe).
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { id: "cartao", nome: "Cartao de credito", icon: WalletCards },
          { id: "pix", nome: "Pix", icon: QrCode },
          { id: "boleto", nome: "Boleto bancario", icon: ReceiptText },
        ].map((forma) => {
          const Icon = forma.icon;
          const ativa = formaPagamento === forma.id;

          return (
            <button
              key={forma.id}
              type="button"
              onClick={() =>
                setFormaPagamento(forma.id as "cartao" | "pix" | "boleto")
              }
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                ativa
                  ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-cyan-700">
                <Icon size={22} />
              </span>
              <span className="font-extrabold">{forma.nome}</span>
              {ativa && <Check className="ml-auto" size={18} />}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          {formaPagamento === "cartao" && (
            <div>
              <h3 className="text-xl font-extrabold">Cartao de credito</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field
                  label="Nome impresso no cartao"
                  placeholder="Nome do titular"
                  icon={Users}
                />
                <Field
                  label="Numero do cartao"
                  placeholder="0000 0000 0000 0000"
                  icon={WalletCards}
                />
                <Field label="Validade" placeholder="MM/AA" icon={CalendarDays} />
                <Field label="CVV" placeholder="000" icon={ShieldCheck} />
                <Field
                  label="CPF/CNPJ do titular"
                  placeholder="000.000.000-00"
                  icon={FileText}
                />
                <label className="block">
                  <span className="text-sm font-bold text-slate-800">
                    Parcelamento
                  </span>
                  <select className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-sm shadow-slate-200/60 outline-none focus:border-cyan-500">
                    <option>1x mensal</option>
                    <option>recorrente mensal</option>
                  </select>
                </label>
              </div>

              <Link
                href={hrefDashboard}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
              >
                Pagar com cartao
                <ArrowRight size={18} />
              </Link>
            </div>
          )}

          {formaPagamento === "pix" && (
            <div>
              <h3 className="text-xl font-extrabold">Pix</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Use o codigo Pix abaixo para pagar sua assinatura.
              </p>
              <div className="mt-5 break-all rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                {codigoPix}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => copiar(codigoPix, "pix")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-5 text-sm font-extrabold text-cyan-700 transition hover:bg-cyan-50"
                >
                  <Copy size={18} />
                  {copiado === "pix" ? "Codigo copiado" : "Copiar codigo Pix"}
                </button>
                <Link
                  href={hrefDashboard}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
                >
                  Ja paguei, liberar acesso
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

          {formaPagamento === "boleto" && (
            <div>
              <h3 className="text-xl font-extrabold">Boleto bancario</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Geramos um boleto para pagamento da sua assinatura.
              </p>
              <p className="mt-4 w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-700">
                Vence em 3 dias
              </p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                {linhaBoleto}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => setCopiado("boleto-gerado")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
                >
                  Gerar boleto
                </button>
                <button
                  type="button"
                  onClick={() => copiar(linhaBoleto, "boleto")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-5 text-sm font-extrabold text-cyan-700 transition hover:bg-cyan-50"
                >
                  <Copy size={18} />
                  {copiado === "boleto"
                    ? "Linha copiada"
                    : "Copiar linha digitavel"}
                </button>
                <Link
                  href={hrefDashboard}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
                >
                  Ja paguei, liberar acesso
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-extrabold">Resumo</h3>
          <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
            <p>
              Plano escolhido:{" "}
              <span className="font-extrabold text-slate-950">
                {plano?.nome ?? "Plano Starter"} - {valor}
              </span>
            </p>
            <p>
              Especialidade:{" "}
              <span className="font-extrabold text-slate-950">
                {nomeProfissao}
              </span>
            </p>
            {[
              "Clinica configurada",
              "Equipe convidada",
              "Preferencias iniciais definidas",
            ].map((item) => (
              <p key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={13} />
                </span>
                {item}
              </p>
            ))}
          </div>
          <p className="mt-5 rounded-2xl bg-white p-3 text-xs font-bold text-slate-500">
            Pagamento simulado para demo. Plano tecnico: {planoSlug}.
          </p>
        </aside>
      </div>
    </>
  );
}

function EtapaFinal({
  nomeProfissao,
  rotuloModo,
  hrefDashboard,
}: {
  nomeProfissao: string;
  rotuloModo: string;
  hrefDashboard: string;
}) {
  return (
    <div className="py-6 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check size={32} />
      </span>
      <p className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
        Etapa 6
      </p>
      <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold">
        Tudo pronto para comecar em {nomeProfissao}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
        Sua conta esta preparada com {rotuloModo}. Agora e so acessar o
        dashboard e cadastrar seus primeiros pacientes.
      </p>
      <Link
        href={hrefDashboard}
        className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700"
      >
        Acessar dashboard
        <ArrowRight size={19} />
      </Link>
    </div>
  );
}

function ResumoLateral({
  nomeProfissao,
  plano,
  modo,
  rotuloModo,
  servicos,
  etapaAtiva,
  hrefDashboard,
}: {
  nomeProfissao: string;
  plano: { nome: string; resumo: string } | undefined;
  modo: ModoSlug | "";
  rotuloModo: string;
  servicos: Servico[];
  etapaAtiva: number;
  hrefDashboard: string;
}) {

  return (
    <aside className="space-y-6">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold">Resumo da sua configuracao</h2>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <p className="text-sm font-bold text-slate-700">Modo atual</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white">
              <SparkleIcon size={25} />
            </span>
            <span>
              <span className="block text-base font-extrabold text-slate-950">
                {rotuloModo}
              </span>
              <span className="block text-sm font-bold text-cyan-700">
                {modo === "teste"
                  ? "Sem compromisso"
                  : plano?.resumo ?? "Escolha um plano quando quiser"}
              </span>
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <p className="text-sm font-bold text-slate-700">Especialidade</p>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Stethoscope size={22} />
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {nomeProfissao}
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <p className="text-sm font-bold text-slate-700">Servicos liberados</p>
          <div className="mt-3 space-y-2">
            {servicos.slice(0, 6).map((servico) => (
              <div
                key={servico.nome}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={13} />
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {servico.nome}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <p className="text-sm font-bold text-slate-700">Etapa atual</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {etapaAtiva} de 6 etapas concluidas em poucos minutos.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-cyan-50 p-5 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-cyan-700">
          <Settings size={24} />
        </span>
        <h2 className="mt-4 text-xl font-extrabold">Proximos passos</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Ao concluir, voce sera levado para o dashboard da sua clinica.
        </p>
        <Link
          href={hrefDashboard}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 text-sm font-bold text-cyan-700 transition hover:bg-cyan-50"
        >
          Ver destino
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <MessageCircle size={24} />
        </span>
        <h2 className="mt-4 text-xl font-extrabold">Precisa de ajuda?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Fale com nosso time de suporte quando quiser.
        </p>
        <Link
          href="/configuracoes"
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-200 px-4 text-sm font-bold text-cyan-700 transition hover:bg-cyan-50"
        >
          Falar com suporte
          <ArrowRight size={17} />
        </Link>
      </div>
    </aside>
  );
}

export default function Onboarding() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-600">
          Carregando onboarding...
        </main>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
