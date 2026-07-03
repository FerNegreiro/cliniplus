import Sidebar from "@/components/Sidebar";
import ModuloEmPreparacao from "@/components/ModuloEmPreparacao";
import PremiumCard from "@/components/PremiumCard";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";
import { consultas } from "@/data/consultas";
import { lancamentos } from "@/data/financeiro";

export const dynamic = "force-dynamic";

const procedimentos = [
  {
    nome: "Restaurações",
    quantidade: 12,
    porcentagem: "80%",
    cor: "bg-cyan-500",
  },
  {
    nome: "Profilaxias",
    quantidade: 9,
    porcentagem: "60%",
    cor: "bg-emerald-500",
  },
  {
    nome: "Tratamento de canal",
    quantidade: 4,
    porcentagem: "35%",
    cor: "bg-red-500",
  },
  {
    nome: "Clareamentos",
    quantidade: 6,
    porcentagem: "45%",
    cor: "bg-amber-500",
  },
];

const desempenhoMes = [
  {
    mes: "Jan",
    receita: "R$ 8.400",
    atendimentos: 28,
  },
  {
    mes: "Fev",
    receita: "R$ 9.800",
    atendimentos: 34,
  },
  {
    mes: "Mar",
    receita: "R$ 11.200",
    atendimentos: 39,
  },
  {
    mes: "Abr",
    receita: "R$ 13.600",
    atendimentos: 46,
  },
  {
    mes: "Mai",
    receita: "R$ 15.900",
    atendimentos: 52,
  },
  {
    mes: "Jun",
    receita: "R$ 18.450",
    atendimentos: 61,
  },
];

const tratamentos = [
  {
    paciente: "Maria Silva",
    tratamento: "Restauração dente 16",
    status: "Em andamento",
    valor: "R$ 280",
  },
  {
    paciente: "João Almeida",
    tratamento: "Tratamento de canal",
    status: "Urgente",
    valor: "R$ 750",
  },
  {
    paciente: "Ana Costa",
    tratamento: "Clareamento caseiro",
    status: "Planejado",
    valor: "R$ 450",
  },
];

type RelatoriosProps = {
  searchParams?: Promise<{
    modulo?: string;
  }>;
};

const modulosEmPreparacao: Record<string, string> = {
  "contas-receber":
    "Acompanhe recebimentos previstos, pagamentos em atraso e valores confirmados da clinica.",
  "contas-pagar":
    "Organize despesas fixas, custos variaveis e compromissos financeiros futuros.",
  caixa:
    "Veja entradas, saidas e saldo operacional em uma leitura simples para a rotina da clinica.",
  "formas-pagamento":
    "Configure cartao, Pix, boleto e outras formas de recebimento quando a integracao financeira estiver ativa.",
  "relatorio-agenda":
    "Analise ocupacao da agenda, faltas, encaixes, retornos e produtividade por periodo.",
  "relatorio-pacientes":
    "Acompanhe crescimento da base, pacientes ativos, retornos pendentes e origem dos atendimentos.",
  "relatorio-financeiro":
    "Veja receitas, despesas, pendencias, saldo previsto e indicadores financeiros da clinica.",
  "relatorio-tratamentos":
    "Acompanhe tratamentos em andamento, concluidos, urgentes e planejados.",
  "relatorio-orcamentos":
    "Entenda orcamentos enviados, aprovados, pendentes e oportunidades de conversao.",
  campanhas:
    "Crie campanhas para retornos, prevencao, orcamentos pendentes e relacionamento com pacientes.",
  crm: "Organize oportunidades, interessados, pacientes sem agendamento e reativacoes.",
  retornos:
    "Acompanhe pacientes que precisam retornar e transforme pendencias em agenda preenchida.",
  aniversariantes:
    "Veja aniversariantes do periodo e prepare mensagens de relacionamento.",
  "assinatura-eletronica":
    "Prepare termos, contratos e documentos para assinatura digital em uma etapa futura.",
  laboratorio:
    "Controle pedidos de laboratorio, prazos, status e documentos associados aos tratamentos.",
  integracoes:
    "Conecte o Clini+ com ferramentas externas quando as integracoes forem liberadas.",
  "ia-prontuario":
    "Use recursos inteligentes para apoiar resumos, organizacao e revisao de prontuarios.",
};

const cardsRelatorios = [
  {
    nome: "Relatorio de agenda",
    href: "/relatorios?modulo=relatorio-agenda",
    detalhe: "Ocupacao, faltas e encaixes",
  },
  {
    nome: "Relatorio de pacientes",
    href: "/relatorios?modulo=relatorio-pacientes",
    detalhe: "Base ativa e retornos",
  },
  {
    nome: "Relatorio financeiro",
    href: "/relatorios?modulo=relatorio-financeiro",
    detalhe: "Receitas, despesas e saldo",
  },
  {
    nome: "Relatorio de tratamentos",
    href: "/relatorios?modulo=relatorio-tratamentos",
    detalhe: "Casos ativos e concluidos",
  },
  {
    nome: "Relatorio de orcamentos",
    href: "/relatorios?modulo=relatorio-orcamentos",
    detalhe: "Aprovacoes e pendencias",
  },
];

function getTituloModulo(slug: string) {
  return slug
    .split("-")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

function getStatusClasse(status: string) {
  if (status === "Urgente") {
    return "bg-red-100 text-red-700";
  }

  if (status === "Em andamento") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Planejado") {
    return "bg-cyan-100 text-cyan-700";
  }

  if (status === "Concluído") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default async function Relatorios({ searchParams }: RelatoriosProps) {
  const params = searchParams ? await searchParams : {};
  const modulo = params.modulo || "";

  if (modulo) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar active="Relatorios" />
          <section className="min-w-0 flex-1 p-6">
            <ModuloEmPreparacao
              titulo={getTituloModulo(modulo)}
              descricao={
                modulosEmPreparacao[modulo] ||
                "Este modulo esta reservado no mapa do Clini+ e sera evoluido sem quebrar a navegacao atual."
              }
              hrefBotao="/relatorios"
              textoBotao="Voltar aos relatorios"
            />
          </section>
        </div>
      </main>
    );
  }

  const pacientesAtivos = pacientes.filter(
    (paciente) =>
      paciente.status === "Ativo" ||
      paciente.status === "Em tratamento" ||
      paciente.status === "Retorno pendente"
  ).length;

  const retornosPendentes = pacientes.filter(
    (paciente) => paciente.status === "Retorno pendente"
  ).length;

  const consultasConfirmadas = consultas.filter(
    (consulta) => consulta.status === "Confirmado"
  ).length;

  const consultasPendentes = consultas.filter(
    (consulta) =>
      consulta.status === "Pendente" || consulta.status === "Aguardando"
  ).length;

  const receitas = lancamentos.filter(
    (lancamento) => lancamento.tipo === "Receita"
  );

  const despesas = lancamentos.filter(
    (lancamento) => lancamento.tipo === "Despesa"
  );

  const particulares = lancamentos.filter(
    (lancamento) => lancamento.origem === "Particular"
  );

  const pagamentosPendentes = lancamentos.filter(
    (lancamento) => lancamento.status === "Pendente"
  );

  const aguardandoConvenio = lancamentos.filter(
    (lancamento) => lancamento.status === "Aguardando convênio"
  );

  const recebidosConvenio = lancamentos.filter(
    (lancamento) => lancamento.status === "Recebido do convênio"
  );

  const recusadosConvenio = lancamentos.filter(
    (lancamento) => lancamento.status === "Glosado"
  );

  const pendenciasFinanceiras =
    pagamentosPendentes.length + aguardandoConvenio.length + recusadosConvenio.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Relatórios" />

        <section className="min-w-0 flex-1 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Relatórios</h2>
              <p className="mt-1 text-slate-500">
                Acompanhe resultados da clínica, pacientes, atendimentos,
                tratamentos, financeiro e convênios
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
              >
                Exportar PDF
              </button>

              <button
                type="button"
                className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white"
              >
                Gerar relatório
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Receita do mês</p>
              <h3 className="mt-3 text-3xl font-bold">R$ 18.450</h3>
              <p className="mt-1 text-xs text-emerald-600">
                +18% comparado ao mês anterior
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Atendimentos</p>
              <h3 className="mt-3 text-3xl font-bold">{consultas.length}</h3>
              <p className="mt-1 text-xs text-cyan-600">
                Consultas e procedimentos
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pacientes ativos</p>
              <h3 className="mt-3 text-3xl font-bold">{pacientesAtivos}</h3>
              <p className="mt-1 text-xs text-emerald-600">
                Em acompanhamento
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pendências</p>
              <h3 className="mt-3 text-3xl font-bold">{pendenciasFinanceiras}</h3>
              <p className="mt-1 text-xs text-red-600">
                Financeiro ou convênio
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {cardsRelatorios.map((card) => (
              <Link
                key={card.nome}
                href={card.href}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50"
              >
                <p className="text-sm font-bold text-slate-900">{card.nome}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {card.detalhe}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Receitas registradas</p>
              <h3 className="mt-3 text-3xl font-bold">{receitas.length}</h3>
              <p className="mt-1 text-xs text-emerald-600">
                Entradas financeiras
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Despesas</p>
              <h3 className="mt-3 text-3xl font-bold">{despesas.length}</h3>
              <p className="mt-1 text-xs text-red-600">Custos cadastrados</p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Particulares</p>
              <h3 className="mt-3 text-3xl font-bold">{particulares.length}</h3>
              <p className="mt-1 text-xs text-cyan-600">
                Pagamentos diretos
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Retornos pendentes</p>
              <h3 className="mt-3 text-3xl font-bold">{retornosPendentes}</h3>
              <p className="mt-1 text-xs text-amber-600">
                Pacientes para acompanhar
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-xl font-bold">Desempenho mensal</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Evolução de receita e volume de atendimentos
                  </p>
                </div>

                <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                  <option>Últimos 6 meses</option>
                  <option>Este mês</option>
                  <option>Este trimestre</option>
                  <option>Este ano</option>
                </select>
              </div>

              <div className="mt-6 space-y-4">
                {desempenhoMes.map((item) => (
                  <div key={item.mes}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold">{item.mes}/2026</p>
                        <p className="text-xs text-slate-500">
                          {item.atendimentos} atendimentos
                        </p>
                      </div>

                      <strong>{item.receita}</strong>
                    </div>

                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-cyan-500"
                        style={{
                          width:
                            item.mes === "Jan"
                              ? "45%"
                              : item.mes === "Fev"
                                ? "52%"
                                : item.mes === "Mar"
                                  ? "61%"
                                  : item.mes === "Abr"
                                    ? "72%"
                                    : item.mes === "Mai"
                                      ? "84%"
                                      : "96%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Convênios</h3>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">
                      {aguardandoConvenio.length} aguardando repasse
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Guias enviadas e ainda não recebidas.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-700">
                      {recebidosConvenio.length} recebidos
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Repasses já confirmados.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-red-50 p-4">
                    <p className="font-semibold text-red-700">
                      {recusadosConvenio.length} recusados
                    </p>
                    <p className="mt-1 text-sm text-red-600">
                      Guias glosadas pelo convênio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800">
                  Saúde da clínica
                </h3>

                <p className="mt-2 text-sm text-emerald-700">
                  A clínica está com boa movimentação, mas precisa acompanhar
                  convênios em aberto e retornos pendentes.
                </p>

                <Link
                  href="/financeiro"
                  className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700"
                >
                  Ver financeiro
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold">Procedimentos mais realizados</h3>
              <p className="mt-1 text-sm text-slate-500">
                Volume por tipo de procedimento odontológico
              </p>

              <div className="mt-6 space-y-5">
                {procedimentos.map((procedimento) => (
                  <div key={procedimento.nome}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <p className="font-semibold">{procedimento.nome}</p>
                      <span className="text-slate-500">
                        {procedimento.quantidade}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${procedimento.cor}`}
                        style={{ width: procedimento.porcentagem }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold">Tratamentos em andamento</h3>
              <p className="mt-1 text-sm text-slate-500">
                Casos clínicos que precisam de acompanhamento
              </p>

              <div className="mt-6 space-y-4">
                {tratamentos.map((tratamento) => (
                  <div
                    key={tratamento.paciente}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{tratamento.paciente}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {tratamento.tratamento}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasse(
                          tratamento.status
                        )}`}
                      >
                        {tratamento.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {tratamento.valor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold">Resumo operacional</h3>
              <p className="mt-1 text-sm text-slate-500">
                Indicadores rápidos da clínica
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">
                    Consultas confirmadas
                  </span>
                  <strong>{consultasConfirmadas}</strong>
                </div>

                <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">
                    Consultas pendentes
                  </span>
                  <strong>{consultasPendentes}</strong>
                </div>

                <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">
                    Pacientes cadastrados
                  </span>
                  <strong>{pacientes.length}</strong>
                </div>

                <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">
                    Pendências financeiras
                  </span>
                  <strong>{pendenciasFinanceiras}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <PremiumCard
              title="Exportar PDF"
              description="Gere relatórios profissionais para análise, prestação de contas e acompanhamento interno."
            />

            <PremiumCard
              title="Exportar Excel"
              description="Exporte dados em planilhas para contabilidade, conferência interna e gestão."
            />

            <PremiumCard
              title="Relatório por convênio"
              description="Veja guias, autorizações, repasses, recusas e produtividade por plano de saúde."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
