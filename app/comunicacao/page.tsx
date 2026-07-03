import Sidebar from "@/components/Sidebar";
import PremiumCard from "@/components/PremiumCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

const mensagens = [
  {
    paciente: "Maria Silva",
    tipo: "Lembrete de consulta",
    canal: "WhatsApp",
    status: "Agendada",
    horario: "Hoje às 18:00",
    categoria: "Consulta",
    mensagem:
      "Olá, Maria! Passando para lembrar sua consulta odontológica amanhã às 09:00.",
  },
  {
    paciente: "Pedro Lima",
    tipo: "Orçamento aprovado",
    canal: "WhatsApp",
    status: "Enviada",
    horario: "Ontem às 14:20",
    categoria: "Orçamento",
    mensagem:
      "Olá, Pedro! Seu orçamento foi aprovado. Podemos seguir com o agendamento do procedimento.",
  },
  {
    paciente: "João Almeida",
    tipo: "Retorno pendente",
    canal: "WhatsApp",
    status: "Pendente",
    horario: "Aguardando envio",
    categoria: "Retorno",
    mensagem:
      "Olá, João! Precisamos agendar seu retorno para continuar o acompanhamento odontológico.",
  },
  {
    paciente: "Ana Costa",
    tipo: "Cobrança amigável",
    canal: "WhatsApp",
    status: "Rascunho",
    horario: "Não enviada",
    categoria: "Financeiro",
    mensagem:
      "Olá, Ana! Identificamos uma pendência no seu atendimento. Podemos combinar a melhor forma de pagamento?",
  },
];

const modelosRapidos = [
  {
    titulo: "Confirmação de consulta",
    descricao: "Mensagem para confirmar presença antes do atendimento.",
    cor: "bg-cyan-50 text-cyan-700",
  },
  {
    titulo: "Retorno odontológico",
    descricao: "Chamar paciente para retorno ou acompanhamento.",
    cor: "bg-emerald-50 text-emerald-700",
  },
  {
    titulo: "Orçamento pendente",
    descricao: "Lembrar paciente sobre orçamento ainda não aprovado.",
    cor: "bg-amber-50 text-amber-700",
  },
  {
    titulo: "Pós-procedimento",
    descricao: "Orientações após procedimento odontológico.",
    cor: "bg-purple-50 text-purple-700",
  },
  {
    titulo: "Cobrança amigável",
    descricao: "Aviso educado sobre pagamento em aberto.",
    cor: "bg-red-50 text-red-700",
  },
];

const campanhas = [
  {
    nome: "Pacientes sem retorno",
    quantidade: 8,
    descricao: "Pacientes que não voltam há mais de 60 dias.",
  },
  {
    nome: "Limpeza preventiva",
    quantidade: 14,
    descricao: "Campanha para profilaxia e revisão odontológica.",
  },
  {
    nome: "Orçamentos não respondidos",
    quantidade: 5,
    descricao: "Pacientes que ainda não aprovaram orçamento.",
  },
];

const modulosComunicacao = [
  { nome: "Mensagens", detalhe: "Caixa e envios manuais", href: "/comunicacao" },
  {
    nome: "Campanhas",
    detalhe: "Acoes por publico",
    href: "/relatorios?modulo=campanhas",
  },
  { nome: "CRM", detalhe: "Oportunidades", href: "/relatorios?modulo=crm" },
  {
    nome: "Retornos",
    detalhe: "Pacientes para reativar",
    href: "/relatorios?modulo=retornos",
  },
  {
    nome: "Aniversariantes",
    detalhe: "Relacionamento",
    href: "/relatorios?modulo=aniversariantes",
  },
];

function getStatusClasse(status: string) {
  if (status === "Enviada") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Agendada") {
    return "bg-cyan-100 text-cyan-700";
  }

  if (status === "Pendente") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Rascunho") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getCategoriaClasse(categoria: string) {
  if (categoria === "Consulta") {
    return "bg-cyan-50 text-cyan-700";
  }

  if (categoria === "Orçamento") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (categoria === "Retorno") {
    return "bg-amber-50 text-amber-700";
  }

  if (categoria === "Financeiro") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-50 text-slate-700";
}

export default function Comunicacao() {
  const enviadas = mensagens.filter(
    (mensagem) => mensagem.status === "Enviada"
  ).length;

  const agendadas = mensagens.filter(
    (mensagem) => mensagem.status === "Agendada"
  ).length;

  const pendentes = mensagens.filter(
    (mensagem) => mensagem.status === "Pendente"
  ).length;

  const rascunhos = mensagens.filter(
    (mensagem) => mensagem.status === "Rascunho"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Comunicação" />

        <section className="min-w-0 flex-1 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Comunicação</h2>
              <p className="mt-1 text-slate-500">
                Central de mensagens para WhatsApp, lembretes, retornos,
                cobranças e relacionamento com pacientes
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white"
            >
              Nova mensagem
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Enviadas</p>
              <h3 className="mt-3 text-3xl font-bold">128</h3>
              <p className="mt-1 text-xs text-emerald-600">
                Nos últimos 30 dias
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Agendadas</p>
              <h3 className="mt-3 text-3xl font-bold">12</h3>
              <p className="mt-1 text-xs text-cyan-600">
                Lembretes programados
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pendentes</p>
              <h3 className="mt-3 text-3xl font-bold">4</h3>
              <p className="mt-1 text-xs text-amber-600">
                Precisam de revisão
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Taxa de resposta</p>
              <h3 className="mt-3 text-3xl font-bold">76%</h3>
              <p className="mt-1 text-xs text-slate-500">
                Estimativa geral
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {modulosComunicacao.map((modulo) => (
              <Link
                key={modulo.nome}
                href={modulo.href}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50"
              >
                <p className="text-sm font-bold text-slate-900">{modulo.nome}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {modulo.detalhe}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <div className="space-y-5 xl:col-span-2">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <h3 className="text-xl font-bold">Caixa de mensagens</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Acompanhe mensagens enviadas, agendadas, pendentes e
                      rascunhos
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                    />

                    <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                      <option>Todos</option>
                      <option>Enviadas</option>
                      <option>Agendadas</option>
                      <option>Pendentes</option>
                      <option>Rascunhos</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {mensagens.map((mensagem) => (
                    <div
                      key={`${mensagem.paciente}-${mensagem.tipo}`}
                      className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:border-cyan-200 hover:bg-white"
                    >
                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="flex gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-700">
                            {mensagem.paciente
                              .split(" ")
                              .map((nome) => nome[0])
                              .slice(0, 2)
                              .join("")}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold">{mensagem.tipo}</h4>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasse(
                                  mensagem.status
                                )}`}
                              >
                                {mensagem.status}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoriaClasse(
                                  mensagem.categoria
                                )}`}
                              >
                                {mensagem.categoria}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              Paciente:{" "}
                              <span className="font-semibold text-slate-700">
                                {mensagem.paciente}
                              </span>
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              Canal: {mensagem.canal} • {mensagem.horario}
                            </p>

                            <p className="mt-3 max-w-2xl text-sm text-slate-600">
                              {mensagem.mensagem}
                            </p>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-40">
                          <button
                            type="button"
                            className="rounded-xl bg-cyan-600 px-4 py-3 text-center text-sm font-semibold text-white"
                          >
                            Enviar
                          </button>

                          <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700"
                          >
                            Editar
                          </button>

                          <Link
                            href="/pacientes"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700"
                          >
                            Paciente
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Campanhas futuras</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Ideias de campanhas automáticas para manter pacientes ativos
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {campanhas.map((campanha) => (
                    <div
                      key={campanha.nome}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-bold">{campanha.nome}</h4>

                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                          {campanha.quantidade}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-500">
                        {campanha.descricao}
                      </p>

                      <button
                        type="button"
                        className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        Preparar campanha
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Resumo</h3>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-700">
                      {enviadas} enviada
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Mensagens já entregues ao paciente.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-cyan-700">
                      {agendadas} agendada
                    </p>
                    <p className="mt-1 text-sm text-cyan-700">
                      Programada para envio automático.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">
                      {pendentes} pendente
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Precisa de revisão ou envio manual.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-700">
                      {rascunhos} rascunho
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Mensagem preparada e ainda não enviada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Modelos rápidos</h3>

                <div className="mt-5 space-y-4">
                  {modelosRapidos.map((modelo) => (
                    <button
                      key={modelo.titulo}
                      type="button"
                      className="w-full rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-cyan-50"
                    >
                      <p
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${modelo.cor}`}
                      >
                        {modelo.titulo}
                      </p>

                      <p className="mt-3 text-sm text-slate-500">
                        {modelo.descricao}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800">
                  Dica Clini+
                </h3>

                <p className="mt-2 text-sm text-emerald-700">
                  A comunicação deve estar conectada com agenda, pacientes,
                  financeiro e retornos. Assim a clínica perde menos consultas e
                  melhora o relacionamento.
                </p>

                <Link
                  href="/agenda"
                  className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700"
                >
                  Ver agenda
                </Link>
              </div>

              <PremiumCard
                title="WhatsApp automático"
                description="Automatize lembretes, confirmações, retornos, cobranças e envio de orçamento pelo WhatsApp."
              />
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <PremiumCard
              title="Campanhas automáticas"
              description="Crie campanhas para pacientes sem retorno, manutenção preventiva e acompanhamento pós-procedimento."
            />

            <PremiumCard
              title="IA para mensagens"
              description="Gere mensagens profissionais com IA para lembretes, orientações e comunicação com pacientes."
            />

            <PremiumCard
              title="Histórico de conversas"
              description="Veja todas as mensagens enviadas e recebidas no histórico do paciente."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
