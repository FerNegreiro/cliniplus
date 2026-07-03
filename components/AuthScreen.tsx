"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
  Plus,
  ShieldCheck,
  Stethoscope,
  Users,
  WalletCards,
} from "lucide-react";

const recursos = [
  {
    titulo: "Pacientes",
    descricao: "Cadastro completo e histórico centralizado em um só lugar.",
    icon: Users,
    classe: "from-blue-500 to-blue-700",
  },
  {
    titulo: "Agenda Inteligente",
    descricao: "Agendamentos, lembretes automáticos e otimização de tempo.",
    icon: CalendarDays,
    classe: "from-emerald-400 to-teal-600",
  },
  {
    titulo: "Prontuário Eletrônico",
    descricao: "Registros clínicos seguros e acessíveis de qualquer lugar.",
    icon: ClipboardList,
    classe: "from-violet-400 to-indigo-700",
  },
  {
    titulo: "Financeiro",
    descricao: "Fluxo de caixa, repasses, convênios e relatórios em tempo real.",
    icon: WalletCards,
    classe: "from-amber-400 to-orange-600",
  },
  {
    titulo: "Relatórios e Dashboard",
    descricao: "Indicadores estratégicos para melhores decisões.",
    icon: BarChart3,
    classe: "from-sky-400 to-blue-700",
  },
  {
    titulo: "Seguro e Confiável",
    descricao: "Seus dados protegidos com criptografia de ponta a ponta.",
    icon: ShieldCheck,
    classe: "from-emerald-400 to-cyan-700",
  },
];

const areas = [
  { nome: "Medicina", icon: Stethoscope, cor: "text-blue-300" },
  { nome: "Odontologia", icon: HeartPulse, cor: "text-slate-100" },
  { nome: "Psicologia", icon: ClipboardList, cor: "text-violet-300" },
  { nome: "Fisioterapia", icon: Users, cor: "text-emerald-300" },
  { nome: "Nutrição", icon: ShieldCheck, cor: "text-teal-300" },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  const cGradientId = compact ? "brand-c-gradient-compact" : "brand-c-gradient";
  const plusGradientId = compact
    ? "brand-plus-gradient-compact"
    : "brand-plus-gradient";

  return (
    <div
      className={
        compact
          ? "flex h-20 w-20 items-center justify-center rounded-full bg-cyan-50 shadow-xl shadow-cyan-900/10"
          : "flex h-16 w-16 items-center justify-center"
      }
    >
      <svg
        viewBox="0 0 128 128"
        aria-label="Clini+"
        className={compact ? "h-16 w-16" : "h-16 w-16"}
      >
        <defs>
          <linearGradient
            id={cGradientId}
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
            id={plusGradientId}
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
          stroke={`url(#${cGradientId})`}
          strokeLinecap="round"
          strokeWidth="28"
        />
        <path
          d="M80 48v32M64 64h32"
          fill="none"
          stroke={`url(#${plusGradientId})`}
          strokeLinecap="round"
          strokeWidth="20"
        />
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <span className="text-2xl font-bold leading-none">
      <span className="text-blue-600">G</span>
    </span>
  );
}

function MicrosoftIcon() {
  return (
    <span className="grid h-6 w-6 grid-cols-2 gap-0.5">
      <span className="bg-red-500" />
      <span className="bg-green-500" />
      <span className="bg-blue-500" />
      <span className="bg-yellow-400" />
    </span>
  );
}

export default function AuthScreen() {
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white text-slate-950">
      <section className="grid min-h-screen w-full lg:grid-cols-[59fr_41fr]">
        <div className="relative min-h-screen overflow-hidden bg-[#042b74] px-6 py-6 text-white sm:px-10 lg:px-12 xl:px-14">
          <Image
            src="/healthcare-hero.png"
            alt="Profissionais de saúde usando o Clini+"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 59vw"
            className="object-cover object-[58%_50%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,22,80,0.99)_0%,rgba(5,45,119,0.92)_35%,rgba(6,65,137,0.52)_61%,rgba(6,52,115,0.2)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(12,53,151,0.38),transparent_43%),linear-gradient(315deg,rgba(0,196,185,0.2),transparent_42%)]" />

          <div className="relative z-10 flex min-h-[calc(100vh-48px)] flex-col">
            <div className="flex items-center gap-4">
              <BrandMark />
              <h1 className="text-4xl font-bold leading-none tracking-normal sm:text-5xl">
                clini<span className="text-emerald-300">+</span>
              </h1>
            </div>

            <div className="mt-7 max-w-[430px]">
              <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                A plataforma completa para{" "}
                <span className="text-emerald-300">
                  profissionais de saúde
                </span>{" "}
                e suas equipes
              </h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-blue-50">
                Gestão inteligente, mais tempo para cuidar do que realmente
                importa.
              </p>
            </div>

            <div className="mt-6 grid max-w-[430px] gap-4">
              {recursos.map((recurso) => {
                const Icon = recurso.icon;

                return (
                  <div key={recurso.titulo} className="flex items-center gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${recurso.classe} shadow-lg shadow-slate-950/20`}
                    >
                      <Icon size={25} strokeWidth={2.2} />
                    </span>
                    <span>
                      <strong className="block text-base leading-tight">
                        {recurso.titulo}
                      </strong>
                      <span className="mt-1 block text-sm leading-snug text-blue-50">
                        {recurso.descricao}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-6">
              <div className="ml-auto w-full max-w-[500px] rounded-3xl border border-white/15 bg-blue-950/40 px-6 py-4 text-center shadow-2xl shadow-slate-950/20 backdrop-blur">
                <p className="text-sm font-bold">Para todas as áreas da saúde</p>
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {areas.map((area) => {
                    const Icon = area.icon;

                    return (
                      <div key={area.nome} className="min-w-0 text-center">
                        <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                          <Icon className={area.cor} size={22} />
                        </span>
                        <span className="mt-2 block truncate text-xs font-semibold">
                          {area.nome}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-col items-center text-xs font-semibold">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-950/30">
                    <Plus size={16} />
                  </span>
                  <span className="mt-2">E muito mais</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-white/20 pt-5 text-sm font-semibold text-blue-50 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Users className="shrink-0 text-blue-300" size={30} />
                  <span>
                    <strong className="block text-white">+10.000</strong>
                    profissionais confiam
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:border-l sm:border-white/20 sm:pl-6">
                  <HeartPulse className="shrink-0 text-blue-300" size={30} />
                  <span>
                    <strong className="block text-white">+1 milhão</strong>
                    de atendimentos gerenciados
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:border-l sm:border-white/20 sm:pl-6">
                  <ShieldCheck className="shrink-0 text-blue-300" size={30} />
                  <span>
                    <strong className="block text-white">Sistema 100%</strong>
                    em nuvem, sempre com você
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[450px]">
            <div className="flex justify-center">
              <BrandMark compact />
            </div>

            <div className="mt-6 text-center">
              <h2 className="text-3xl font-extrabold text-[#071b4d]">
                Bem-vindo(a)! 👋
              </h2>
              <p className="mx-auto mt-2 max-w-[310px] text-base font-medium leading-relaxed text-slate-500">
                Faça login para acessar sua conta e continuar.
              </p>
            </div>

            <form className="mt-7 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-[#071b4d]">
                  E-mail
                </span>
                <span className="mt-2 flex h-14 items-center gap-4 rounded-xl border border-slate-300 bg-white px-5 text-slate-400 shadow-sm shadow-slate-200/60 focus-within:border-blue-500">
                  <Mail size={22} />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#071b4d]">Senha</span>
                <span className="mt-2 flex h-14 items-center gap-4 rounded-xl border border-slate-300 bg-white px-5 text-slate-400 shadow-sm shadow-slate-200/60 focus-within:border-blue-500">
                  <Lock size={22} />
                  <input
                    type={senhaVisivel ? "text" : "password"}
                    placeholder="Digite sua senha"
                    className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    title={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setSenhaVisivel((visivel) => !visivel)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-blue-700"
                  >
                    {senhaVisivel ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                <label className="flex items-center gap-3 text-slate-500">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 rounded border-slate-300 accent-blue-600"
                  />
                  Lembrar-me
                </label>
                <Link href="/cadastro" className="text-blue-700">
                  Esqueci minha senha
                </Link>
              </div>

              <Link
                href="/dashboard?modo=assinatura&plano=starter&profissao=odontologia&demo=1"
                className="flex h-14 w-full items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-blue-700 to-teal-500 px-6 text-xl font-extrabold text-white shadow-xl shadow-blue-500/25 transition hover:brightness-110"
              >
                Entrar
                <ArrowRight size={28} />
              </Link>
            </form>

            <div className="my-6 flex items-center gap-4 text-sm font-semibold text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              ou continue com
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="flex h-[52px] w-full items-center justify-center gap-4 rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-bold text-[#071b4d] shadow-sm transition hover:bg-slate-50"
              >
                <GoogleIcon />
                Entrar com Google
              </button>
              <button
                type="button"
                className="flex h-[52px] w-full items-center justify-center gap-4 rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-bold text-[#071b4d] shadow-sm transition hover:bg-slate-50"
              >
                <MicrosoftIcon />
                Entrar com Microsoft
              </button>
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-slate-500">
              Ainda não tem uma conta?
              <Link href="/cadastro" className="ml-2 text-blue-700">
                Criar conta
              </Link>
            </p>

            <div className="mt-6 flex items-center gap-4 rounded-xl bg-blue-50/70 px-6 py-4 text-left shadow-sm shadow-slate-200/80">
              <ShieldCheck className="shrink-0 text-[#071b4d]" size={38} />
              <div>
                <p className="font-extrabold text-[#071b4d]">
                  Seus dados estão protegidos
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                  Segurança e privacidade em primeiro lugar. Criptografia de
                  ponta a ponta e conformidade com a LGPD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
