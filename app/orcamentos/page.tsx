import Sidebar from "@/components/Sidebar";
import PremiumCard from "@/components/PremiumCard";
import Link from "next/link";

const orcamentos = [
  {
    id: 1,
    paciente: "Maria Silva",
    descricao: "Restauração + clareamento",
    procedimentos: "2 procedimentos",
    valor: "R$ 730",
    status: "Aguardando aprovação",
    validade: "30/06/2026",
  },
  {
    id: 2,
    paciente: "Pedro Lima",
    descricao: "Limpeza + avaliação",
    procedimentos: "2 procedimentos",
    valor: "R$ 280",
    status: "Aprovado",
    validade: "25/06/2026",
  },
  {
    id: 3,
    paciente: "João Almeida",
    descricao: "Tratamento de canal",
    procedimentos: "1 procedimento",
    valor: "R$ 750",
    status: "Pendente",
    validade: "28/06/2026",
  },
  {
    id: 4,
    paciente: "Ana Costa",
    descricao: "Plano ortodôntico",
    procedimentos: "Mensalidade",
    valor: "R$ 180/mês",
    status: "Recusado",
    validade: "20/06/2026",
  },
  {
    id: 5,
    paciente: "Ana Costa",
    descricao: "Harmonização orofacial",
    procedimentos: "3 procedimentos estéticos",
    valor: "R$ 2.500",
    status: "Aguardando aprovação",
    validade: "05/07/2026",
  },
];

const procedimentosEsteticos = [
  "Harmonização orofacial",
  "Preenchimento labial",
  "Toxina botulínica",
  "Bioestimulador de colágeno",
  "Fios de sustentação",
  "Skinbooster",
  "Clareamento dental",
  "Lentes de contato dental",
];

function getStatusClasse(status: string) {
  if (status === "Aprovado") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Aguardando aprovação") {
    return "bg-cyan-100 text-cyan-700";
  }

  if (status === "Pendente") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Recusado") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function isOrcamentoHOF(descricao: string) {
  return (
    descricao.toLowerCase().includes("harmonização") ||
    descricao.toLowerCase().includes("preenchimento") ||
    descricao.toLowerCase().includes("toxina") ||
    descricao.toLowerCase().includes("bioestimulador") ||
    descricao.toLowerCase().includes("hof")
  );
}

function getLinkOrcamento(orcamento: { paciente: string; descricao: string }) {
  if (isOrcamentoHOF(orcamento.descricao)) {
    return `/estetica-odontologica?paciente=${encodeURIComponent(
      orcamento.paciente
    )}`;
  }

  return "/tratamentos";
}

export default function Orcamentos() {
  const aprovados = orcamentos.filter(
    (orcamento) => orcamento.status === "Aprovado"
  ).length;

  const aguardando = orcamentos.filter(
    (orcamento) => orcamento.status === "Aguardando aprovação"
  ).length;

  const pendentes = orcamentos.filter(
    (orcamento) => orcamento.status === "Pendente"
  ).length;

  const recusados = orcamentos.filter(
    (orcamento) => orcamento.status === "Recusado"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Orçamentos" />

        <section className="flex-1 p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Orçamentos</h2>
              <p className="mt-1 text-slate-500">
                Crie, acompanhe e envie orçamentos odontológicos, estéticos e
                de harmonização para aprovação do paciente
              </p>
            </div>

            <Link
              href="/orcamentos/novo"
              className="rounded-xl bg-slate-950 px-5 py-3 text-center font-semibold text-white"
            >
              Novo orçamento
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Aprovados</p>
              <h3 className="mt-3 text-3xl font-bold">{aprovados}</h3>
              <p className="mt-2 text-xs text-emerald-600">
                Prontos para financeiro
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Aguardando aprovação</p>
              <h3 className="mt-3 text-3xl font-bold">{aguardando}</h3>
              <p className="mt-2 text-xs text-cyan-700">
                Enviados ao paciente
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Pendentes</p>
              <h3 className="mt-3 text-3xl font-bold">{pendentes}</h3>
              <p className="mt-2 text-xs text-amber-600">
                Precisam de revisão
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Recusados</p>
              <h3 className="mt-3 text-3xl font-bold">{recusados}</h3>
              <p className="mt-2 text-xs text-red-600">Não aprovados</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-cyan-100 bg-cyan-50 p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold text-cyan-700">
                  Odontologia Estética / HOF
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  Procedimentos estéticos no orçamento
                </h3>

                <p className="mt-1 text-sm text-cyan-700">
                  Adicione harmonização orofacial, preenchimentos, toxina,
                  bioestimuladores, clareamento e outros procedimentos estéticos
                  ao orçamento do paciente.
                </p>
              </div>

              <Link
                href="/estetica-odontologica"
                className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-cyan-700"
              >
                Abrir HOF
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {procedimentosEsteticos.map((procedimento) => (
                <Link
                  key={procedimento}
                  href="/orcamentos/novo"
                  className="rounded-2xl border border-cyan-100 bg-white p-4 text-left text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-100 hover:text-cyan-800"
                >
                  {procedimento}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Orçamentos recentes</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Acompanhe valores, pacientes, validade e status
                  </p>
                </div>

                <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                  <option>Todos</option>
                  <option>Aprovados</option>
                  <option>Aguardando aprovação</option>
                  <option>Pendentes</option>
                  <option>Recusados</option>
                </select>
              </div>

              <div className="mt-6 space-y-4">
                {orcamentos.map((orcamento) => (
                  <div
                    key={orcamento.id}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-lg font-bold">
                            {orcamento.descricao}
                          </h4>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasse(
                              orcamento.status
                            )}`}
                          >
                            {orcamento.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Paciente:{" "}
                          <span className="font-semibold text-slate-700">
                            {orcamento.paciente}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {orcamento.procedimentos} • validade até{" "}
                          {orcamento.validade}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm text-slate-500">Valor</p>
                        <p className="text-2xl font-bold">{orcamento.valor}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={getLinkOrcamento(orcamento)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        {isOrcamentoHOF(orcamento.descricao)
                          ? "Ver HOF"
                          : "Ver tratamento"}
                      </Link>

                      <Link
                        href="/financeiro/novo"
                        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Gerar financeiro
                      </Link>

                      <button
                        type="button"
                        className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700"
                      >
                        Enviar ao paciente
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Resumo</h3>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-700">
                      Orçamento aprovado
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Pedro Lima aprovou limpeza + avaliação.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-cyan-700">
                      Aguardando resposta
                    </p>
                    <p className="mt-1 text-sm text-cyan-700">
                      Maria Silva ainda não aprovou o orçamento.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">
                      Revisar orçamento
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      João Almeida possui orçamento pendente.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-purple-50 p-4">
                    <p className="font-semibold text-purple-700">
                      Estética / HOF
                    </p>
                    <p className="mt-1 text-sm text-purple-700">
                      Ana Costa possui orçamento de harmonização aguardando
                      aprovação.
                    </p>
                  </div>
                </div>
              </div>

              <PremiumCard
                title="Aprovação digital"
                description="Envie o orçamento para o paciente aprovar pelo celular, com assinatura digital e aceite automático."
              />
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Modelo de orçamento</h3>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-4 bg-slate-100 p-4 text-sm font-semibold">
                <p>Item</p>
                <p>Área/Dente</p>
                <p>Quantidade</p>
                <p>Valor</p>
              </div>

              <div className="grid grid-cols-4 border-t border-slate-100 p-4 text-sm">
                <p>Restauração</p>
                <p>Dente 16</p>
                <p>1</p>
                <p>R$ 280</p>
              </div>

              <div className="grid grid-cols-4 border-t border-slate-100 p-4 text-sm">
                <p>Clareamento</p>
                <p>Dente 21</p>
                <p>1</p>
                <p>R$ 450</p>
              </div>

              <div className="grid grid-cols-4 border-t border-slate-100 p-4 text-sm">
                <p>Harmonização orofacial</p>
                <p>Face</p>
                <p>1 plano</p>
                <p>R$ 2.500</p>
              </div>

              <div className="grid grid-cols-4 border-t border-slate-100 bg-slate-50 p-4 text-sm font-bold">
                <p>Total</p>
                <p>-</p>
                <p>3 itens</p>
                <p>R$ 3.230</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <PremiumCard
              title="Parcelamento"
              description="Crie condições de pagamento, entrada, parcelas e vencimentos automáticos."
            />

            <PremiumCard
              title="Contrato odontológico"
              description="Gere contratos e termos vinculados ao orçamento aprovado pelo paciente."
            />

            <PremiumCard
              title="WhatsApp automático"
              description="Envie lembretes de orçamento pendente e mensagens de aprovação pelo WhatsApp."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
