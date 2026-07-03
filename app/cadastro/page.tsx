"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  WalletCards,
} from "lucide-react";

const recursos = [
  {
    titulo: "Agenda inteligente",
    descricao: "Agendamentos, lembretes automáticos e otimização de tempo.",
    icon: CalendarDays,
    classe: "from-emerald-400 to-teal-700",
  },
  {
    titulo: "Prontuário digital",
    descricao: "Registros clínicos seguros, acessíveis de qualquer lugar.",
    icon: ClipboardList,
    classe: "from-violet-400 to-indigo-700",
  },
  {
    titulo: "Gestão financeira",
    descricao: "Fluxo de caixa, repasses, convênios e relatórios em tempo real.",
    icon: WalletCards,
    classe: "from-amber-400 to-orange-600",
  },
  {
    titulo: "Comunicação com pacientes",
    descricao: "Mensagens, lembretes e materiais de forma prática e segura.",
    icon: MessageCircle,
    classe: "from-cyan-400 to-blue-700",
  },
  {
    titulo: "Relatórios e indicadores",
    descricao: "Visualize dados estratégicos para tomar melhores decisões.",
    icon: BarChart3,
    classe: "from-sky-400 to-blue-700",
  },
  {
    titulo: "Equipe e acessos",
    descricao: "Convide sua equipe e defina permissões com segurança.",
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
  { nome: "Fonoaudiologia", icon: MessageCircle, cor: "text-violet-300" },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  const cGradientId = compact ? "signup-c-gradient-compact" : "signup-c-gradient";
  const plusGradientId = compact
    ? "signup-plus-gradient-compact"
    : "signup-plus-gradient";

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
    <span className="text-2xl font-bold leading-none text-blue-600">G</span>
  );
}

function MicrosoftIcon() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-0.5">
      <span className="bg-red-500" />
      <span className="bg-green-500" />
      <span className="bg-blue-500" />
      <span className="bg-yellow-400" />
    </span>
  );
}

export default function Cadastro() {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [profissao, setProfissao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [termosAceitos, setTermosAceitos] = useState(true);
  const cadastroCompleto = Boolean(
    nome.trim() &&
      email.trim() &&
      profissao &&
      telefone.trim() &&
      senha &&
      confirmacaoSenha &&
      termosAceitos
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white text-slate-950">
      <section className="grid min-h-screen w-full lg:grid-cols-[62fr_38fr]">
        <div className="relative min-h-screen overflow-hidden bg-[#042b74] px-6 py-6 text-white sm:px-10 lg:px-12 xl:px-14">
          <Image
            src="/signup-healthcare-team.png"
            alt="Equipe de profissionais de saúde usando o Clini+"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 62vw"
            className="object-cover object-[58%_50%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,22,80,0.98)_0%,rgba(5,43,113,0.9)_34%,rgba(7,73,145,0.55)_62%,rgba(5,50,116,0.2)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,53,150,0.38),transparent_45%),linear-gradient(315deg,rgba(0,195,184,0.18),transparent_42%)]" />

          <div className="relative z-10 flex min-h-[calc(100vh-48px)] flex-col">
            <div className="flex items-center gap-4">
              <BrandMark />
              <h1 className="text-4xl font-bold leading-none tracking-normal sm:text-5xl">
                clini<span className="text-emerald-300">+</span>
              </h1>
            </div>

            <div className="mt-7 max-w-[560px]">
              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                A plataforma completa para{" "}
                <span className="text-emerald-300">
                  profissionais da saúde
                </span>
              </h2>
              <p className="mt-4 max-w-[470px] text-base font-medium leading-relaxed text-blue-50">
                Mais organização, eficiência e conexão para você cuidar do que
                realmente importa: seus pacientes.
              </p>
            </div>

            <div className="mt-6 grid max-w-[420px] gap-4">
              {recursos.map((recurso) => {
                const Icon = recurso.icon;

                return (
                  <div key={recurso.titulo} className="flex items-center gap-4">
                    <span
                      className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${recurso.classe} shadow-lg shadow-slate-950/20`}
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
              <div className="ml-auto w-full max-w-[660px] rounded-3xl border border-white/15 bg-blue-950/40 px-7 py-4 text-center shadow-2xl shadow-slate-950/20 backdrop-blur">
                <p className="text-base font-bold">
                  Para todas as áreas da saúde
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
                  {areas.map((area) => {
                    const Icon = area.icon;

                    return (
                      <div key={area.nome} className="min-w-0 text-center">
                        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
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
                  <span className="mt-2">E muitas outras</span>
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

        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-8 sm:px-10 xl:px-14">
          <div className="w-full max-w-[580px] rounded-3xl bg-white px-4 py-5 shadow-none lg:px-7 xl:shadow-2xl xl:shadow-slate-200/70">
            <div className="flex justify-center">
              <BrandMark compact />
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-3xl font-extrabold text-[#071b4d]">
                Crie sua conta
              </h2>
              <p className="mx-auto mt-2 max-w-[430px] text-base font-medium leading-relaxed text-slate-500">
                Comece a usar o Clini+ para organizar seus atendimentos.
              </p>
            </div>

            <form className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-[#071b4d]">
                  Nome completo
                </span>
                <span className="mt-2 flex h-12 items-center gap-4 rounded-xl border border-slate-300 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/50 focus-within:border-blue-500">
                  <User size={19} />
                  <input
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Digite seu nome completo"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#071b4d]">
                  E-mail
                </span>
                <span className="mt-2 flex h-12 items-center gap-4 rounded-xl border border-slate-300 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/50 focus-within:border-blue-500">
                  <Mail size={19} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#071b4d]">
                  Profissão / especialidade
                </span>
                <span className="mt-2 flex h-12 items-center gap-4 rounded-xl border border-slate-300 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/50 focus-within:border-blue-500">
                  <Stethoscope size={19} />
                  <select
                    value={profissao}
                    onChange={(event) => setProfissao(event.target.value)}
                    className="min-w-0 flex-1 appearance-none bg-transparent text-sm font-semibold text-slate-400 outline-none"
                  >
                    <option value="">Selecione sua profissão ou especialidade</option>
                    <option value="medicina">Medicina</option>
                    <option value="odontologia">Odontologia</option>
                    <option value="psicologia">Psicologia</option>
                    <option value="fisioterapia">Fisioterapia</option>
                    <option value="nutricao">Nutrição</option>
                    <option value="fonoaudiologia">Fonoaudiologia</option>
                    <option value="outra">Outra área da saúde</option>
                  </select>
                  <ChevronDown size={19} />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#071b4d]">
                  Telefone
                </span>
                <span className="mt-2 flex h-12 items-center gap-4 rounded-xl border border-slate-300 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/50 focus-within:border-blue-500">
                  <Phone size={19} />
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(event) => setTelefone(event.target.value)}
                    placeholder="(11) 99999-9999"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-[#071b4d]">
                    Senha
                  </span>
                  <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/50 focus-within:border-blue-500">
                    <Lock size={19} />
                    <input
                      type={senhaVisivel ? "text" : "password"}
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      placeholder="Digite sua senha"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      title={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setSenhaVisivel((visivel) => !visivel)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-blue-700"
                    >
                      {senhaVisivel ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#071b4d]">
                    Confirmar senha
                  </span>
                  <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-slate-400 shadow-sm shadow-slate-200/50 focus-within:border-blue-500">
                    <Lock size={19} />
                    <input
                      type={confirmacaoVisivel ? "text" : "password"}
                      value={confirmacaoSenha}
                      onChange={(event) => setConfirmacaoSenha(event.target.value)}
                      placeholder="Confirme sua senha"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      title={
                        confirmacaoVisivel
                          ? "Ocultar confirmação"
                          : "Mostrar confirmação"
                      }
                      onClick={() =>
                        setConfirmacaoVisivel((visivel) => !visivel)
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-blue-700"
                    >
                      {confirmacaoVisivel ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </span>
                </label>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <input
                  type="checkbox"
                  checked={termosAceitos}
                  onChange={(event) => setTermosAceitos(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span>
                  Aceito os{" "}
                  <Link href="/configuracoes" className="text-blue-700">
                    termos
                  </Link>{" "}
                  e a{" "}
                  <Link href="/configuracoes" className="text-blue-700">
                    política de privacidade
                  </Link>
                </span>
              </label>

            </form>

            <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <h3 className="text-sm font-extrabold text-[#071b4d]">
                Como voce quer comecar?
              </h3>

              <div className="mt-2 grid gap-2">
                <div className="rounded-lg border border-cyan-200 bg-white p-2.5 shadow-sm shadow-slate-200/50">
                  <p className="text-xs font-extrabold text-[#071b4d]">
                    Teste grátis por 7 dias
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-500">
                    Use o Clini+ Odontologia no Plano Starter por 7 dias, sem
                    compromisso.
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-extrabold text-cyan-700">
                    Starter • 7 dias
                  </span>
                  {cadastroCompleto ? (
                    <Link
                      href="/dashboard?modo=teste&plano=starter&profissao=odontologia&dias=7"
                      className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-teal-500 px-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
                    >
                      Começar teste grátis
                      <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mt-2 flex h-9 w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-200 px-3 text-xs font-extrabold text-slate-500"
                    >
                      Preencha o cadastro
                    </button>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm shadow-slate-200/50">
                  <p className="text-xs font-extrabold text-[#071b4d]">
                    Escolher um plano
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-500">
                    Escolha Starter, Pro ou Premium e libere os recursos
                    conforme sua necessidade.
                  </p>
                  <Link
                    href="/planos"
                    className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50"
                  >
                    Ver planos
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </section>

            <div className="my-5 flex items-center gap-4 text-sm font-semibold text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              ou continue com
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-[#071b4d] shadow-sm transition hover:bg-slate-50"
              >
                <GoogleIcon />
                Continuar com Google
              </button>
              <button
                type="button"
                className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-[#071b4d] shadow-sm transition hover:bg-slate-50"
              >
                <MicrosoftIcon />
                Continuar com Microsoft
              </button>
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-slate-500">
              Já tem uma conta?
              <Link href="/" className="ml-2 text-blue-700">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
