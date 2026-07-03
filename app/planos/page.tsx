import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const planos = [
  {
    slug: "starter",
    nome: "Starter",
    preco: "R$ 90/mês",
    descricao: "Organizacao essencial para comecar com agenda, pacientes e financeiro basico.",
    recursos: [
      "Agendamento online",
      "Cadastro de pacientes",
      "Prontuario eletronico basico",
      "Controle de retornos",
      "Orcamentos parciais e totais",
      "Galeria de fotos e arquivos",
      "Financeiro basico",
      "Relatorios basicos",
      "Confirmacoes manuais pelo WhatsApp Web",
      "Suporte por WhatsApp",
    ],
  },
  {
    slug: "pro",
    nome: "Pro",
    preco: "R$ 145/mês",
    descricao: "Automacoes, comunicacao e recursos avancados para clinicas em crescimento.",
    destaque: true,
    recursos: [
      "Agendamento online",
      "Profissionais e usuarios ilimitados",
      "Gestao financeira completa",
      "Prontuario com odontograma",
      "Controle de retornos",
      "Modulo de HOF",
      "Boletos, Pix e link de pagamento",
      "Orcamentos parciais e totais",
      "App de agenda para o profissional",
      "Galeria de fotos, videos e arquivos",
      "Prescricoes digitais",
      "iDoc - Radio Memory",
      "Confirmacoes manuais pelo WhatsApp Web",
      "Treinamentos e suporte por WhatsApp",
    ],
  },
  {
    slug: "premium",
    nome: "Premium",
    preco: "R$ 380/mês",
    descricao: "IA, CRM, pagamentos e automacoes para operacoes mais completas.",
    recursos: [
      "Tudo do Plano Pro",
      "Agendas ilimitadas",
      "Campanhas de marketing pelo WhatsApp",
      "Integracao com Sante Conversas",
      "Confirmacao automatica pelo WhatsApp",
      "Lembretes de agendamentos automaticos",
      "Mensagens de aniversario automaticas",
      "Personalizacao do sistema",
      "Notas fiscais NFS-e",
      "Modulo de comissoes",
      "Assinatura eletronica ilimitada",
      "Transcricao de audios com IA no prontuario",
      "CRM de vendas",
    ],
  },
];

function getRecursosVisiveis(recursos: string[]) {
  return {
    principais: recursos.slice(0, 6),
    extras: recursos.slice(6),
  };
}

function getLinkOnboardingPlano(slug: string) {
  return `/onboarding?etapa=1&plano=${slug}&modo=assinatura`;
}

export default function Planos() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link href="/" className="text-3xl font-extrabold tracking-normal">
            Clini<span className="text-cyan-600">+</span>
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            Criar conta sem plano
          </Link>
        </header>

        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
            Planos Clini+
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-normal sm:text-5xl">
            Escolha o plano ideal para comecar
          </h1>
          <p className="mt-4 text-base font-semibold leading-relaxed text-slate-500">
            Depois da escolha, voce cria sua conta e configura sua assinatura
            no onboarding.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {planos.map((plano) => (
            <article
              key={plano.slug}
              className={`flex min-h-[520px] flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                plano.destaque
                  ? "border-cyan-300 shadow-cyan-100"
                  : "border-slate-200 shadow-slate-200/60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold">{plano.nome}</h2>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                    {plano.descricao}
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Sparkles size={22} />
                </span>
              </div>

              <p className="mt-6 text-3xl font-extrabold">{plano.preco}</p>

              <div className="mt-6 space-y-3">
                {getRecursosVisiveis(plano.recursos).principais.map((recurso) => (
                  <div key={recurso} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={15} />
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {recurso}
                    </span>
                  </div>
                ))}

                {getRecursosVisiveis(plano.recursos).extras.length > 0 && (
                  <details className="rounded-2xl bg-slate-50 p-3">
                    <summary className="cursor-pointer text-sm font-extrabold text-cyan-700">
                      Ver mais recursos
                    </summary>
                    <div className="mt-3 space-y-3">
                      {getRecursosVisiveis(plano.recursos).extras.map((recurso) => (
                        <div key={recurso} className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check size={15} />
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {recurso}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              <Link
                href={getLinkOnboardingPlano(plano.slug)}
                className={`mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold transition ${
                  plano.destaque
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-700"
                    : "border border-cyan-200 bg-white text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                Escolher {plano.nome}
                <ArrowRight size={18} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
