"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  getAgendamentos,
  getLancamentosFinanceiros,
  getOrcamentos,
  getPacientes,
  getTratamentos,
  type CliniplusAgendamento,
  type CliniplusLancamentoFinanceiro,
  type CliniplusOrcamento,
  type CliniplusPaciente,
  type CliniplusTratamento,
} from "@/utils/cliniplusStore";
import { dinheiroParaNumero, formatarMoeda, normalizarTexto } from "@/utils/format";

type Periodo = "30" | "90" | "365" | "tudo";

type Dados = {
  pacientes: CliniplusPaciente[];
  agendamentos: CliniplusAgendamento[];
  financeiro: CliniplusLancamentoFinanceiro[];
  tratamentos: CliniplusTratamento[];
  orcamentos: CliniplusOrcamento[];
};

const periodos: Array<{ valor: Periodo; rotulo: string }> = [
  { valor: "30", rotulo: "Últimos 30 dias" },
  { valor: "90", rotulo: "Últimos 90 dias" },
  { valor: "365", rotulo: "Últimos 12 meses" },
  { valor: "tudo", rotulo: "Todo o período" },
];

const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function dentroDoPeriodo(data: string | undefined, periodo: Periodo) {
  if (periodo === "tudo") return true;
  if (!data) return false;
  const momento = new Date(`${data.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(momento.getTime())) return false;
  const limite = new Date();
  limite.setDate(limite.getDate() - Number(periodo));
  return momento >= limite;
}

function porcentagem(parte: number, total: number) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

function exportarCsv(lancamentos: CliniplusLancamentoFinanceiro[]) {
  const cabecalho = ["Data", "Tipo", "Descrição", "Paciente", "Valor", "Status", "Origem"];
  const linhas = lancamentos.map((item) =>
    [item.data, item.tipo, item.descricao, item.paciente || "", item.valor, item.status, item.origem || ""]
      .map((campo) => `"${String(campo).replace(/"/g, '""')}"`)
      .join(";")
  );
  const blob = new Blob([`\ufeff${[cabecalho.join(";"), ...linhas].join("\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lancamentos-cliniplus.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function Indicador({ titulo, valor, detalhe, cor = "text-slate-950" }: { titulo: string; valor: string | number; detalhe: string; cor?: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{titulo}</p>
      <h3 className={`mt-3 text-3xl font-bold ${cor}`}>{valor}</h3>
      <p className="mt-2 text-xs text-slate-500">{detalhe}</p>
    </div>
  );
}

function Barra({ rotulo, valor, maximo, texto, cor }: { rotulo: string; valor: number; maximo: number; texto: string; cor: string }) {
  const largura = maximo > 0 ? Math.max((valor / maximo) * 100, valor > 0 ? 4 : 0) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700">{rotulo}</span>
        <span className="text-slate-500">{texto}</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-slate-100">
        <div className={`h-3 rounded-full ${cor}`} style={{ width: `${largura}%` }} />
      </div>
    </div>
  );
}

export default function Relatorios() {
  const [periodo, setPeriodo] = useState<Periodo>("90");
  const [dados, setDados] = useState<Dados>({
    pacientes: [],
    agendamentos: [],
    financeiro: [],
    tratamentos: [],
    orcamentos: [],
  });

  useEffect(() => {
    function carregar() {
      setDados({
        pacientes: getPacientes(),
        agendamentos: getAgendamentos(),
        financeiro: getLancamentosFinanceiros(),
        tratamentos: getTratamentos(),
        orcamentos: getOrcamentos(),
      });
    }

    carregar();
    window.addEventListener("cliniplus:store", carregar);
    return () => window.removeEventListener("cliniplus:store", carregar);
  }, []);

  const relatorio = useMemo(() => {
    const agendamentos = dados.agendamentos.filter((item) => dentroDoPeriodo(item.data, periodo));
    const financeiro = dados.financeiro.filter((item) => dentroDoPeriodo(item.data, periodo));
    const orcamentos = dados.orcamentos.filter((item) => dentroDoPeriodo(item.criadoEm, periodo));

    const pago = (item: CliniplusLancamentoFinanceiro) => ["pago", "recebido do convenio"].includes(normalizarTexto(item.status));
    const receitas = financeiro.filter((item) => item.tipo === "Receita");
    const despesas = financeiro.filter((item) => item.tipo === "Despesa");
    const somar = (lista: CliniplusLancamentoFinanceiro[]) => lista.reduce((total, item) => total + dinheiroParaNumero(item.valor), 0);

    const statusAgenda = (status: string) => agendamentos.filter((item) => normalizarTexto(item.status).includes(status)).length;
    const cancelados = statusAgenda("cancel");

    const tratamentosPorStatus = new Map<string, number>();
    dados.tratamentos.forEach((item) => {
      const chave = item.status || "Sem status";
      tratamentosPorStatus.set(chave, (tratamentosPorStatus.get(chave) || 0) + 1);
    });

    const procedimentos = new Map<string, number>();
    [...dados.tratamentos.map((item) => item.descricao), ...agendamentos.map((item) => item.procedimento)]
      .filter((nome): nome is string => Boolean(nome && nome.trim()))
      .forEach((nome) => procedimentos.set(nome.trim(), (procedimentos.get(nome.trim()) || 0) + 1));

    const hoje = new Date();
    const meses = Array.from({ length: 6 }, (_, indice) => {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - indice), 1);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      const doMes = dados.financeiro.filter((item) => item.tipo === "Receita" && pago(item) && (item.data || "").startsWith(chave));
      return { rotulo: `${nomesMeses[data.getMonth()]}/${String(data.getFullYear()).slice(2)}`, valor: somar(doMes) };
    });

    const aprovados = orcamentos.filter((item) => item.status === "aprovado");
    const enviados = orcamentos.filter((item) => item.status === "enviado");

    return {
      lancamentos: financeiro,
      pacientesAtivos: dados.pacientes.filter((item) => ["ativo", "em tratamento", "retorno pendente"].includes(normalizarTexto(item.status))).length,
      retornosPendentes: dados.pacientes.filter((item) => normalizarTexto(item.status).includes("retorno")).length,
      pacientesHof: dados.pacientes.filter((item) => item.tipoAtendimento === "estetica").length,
      totalAgendamentos: agendamentos.length,
      confirmados: statusAgenda("confirm"),
      cancelados,
      taxaCancelamento: porcentagem(cancelados, agendamentos.length),
      receitaRecebida: somar(receitas.filter(pago)),
      receitaPendente: somar(receitas.filter((item) => !pago(item) && normalizarTexto(item.status) !== "glosado")),
      despesasPagas: somar(despesas.filter(pago)),
      glosado: somar(receitas.filter((item) => normalizarTexto(item.status) === "glosado")),
      meses,
      tratamentosPorStatus: [...tratamentosPorStatus.entries()].sort((a, b) => b[1] - a[1]),
      procedimentos: [...procedimentos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
      orcamentosAprovados: aprovados.length,
      orcamentosEnviados: enviados.length,
      valorAprovado: aprovados.reduce((total, item) => total + (item.total || 0), 0),
      conversao: porcentagem(aprovados.length, aprovados.length + enviados.length),
    };
  }, [dados, periodo]);

  const saldo = relatorio.receitaRecebida - relatorio.despesasPagas;
  const maiorMes = Math.max(...relatorio.meses.map((mes) => mes.valor), 0);
  const maiorProcedimento = relatorio.procedimentos[0]?.[1] || 0;
  const maiorStatus = relatorio.tratamentosPorStatus[0]?.[1] || 0;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Relatórios" />

        <section className="flex-1 p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-3xl font-bold">Relatórios</h2>
              <p className="mt-1 text-slate-500">Indicadores calculados com os dados cadastrados na clínica.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={periodo}
                onChange={(event) => setPeriodo(event.target.value as Periodo)}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none"
              >
                {periodos.map((item) => (
                  <option key={item.valor} value={item.valor}>
                    {item.rotulo}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => exportarCsv(relatorio.lancamentos)}
                disabled={relatorio.lancamentos.length === 0}
                className="h-12 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Exportar financeiro (CSV)
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Indicador titulo="Receita recebida" valor={formatarMoeda(relatorio.receitaRecebida)} detalhe="Pagos e repasses de convênio" cor="text-emerald-600" />
            <Indicador titulo="A receber" valor={formatarMoeda(relatorio.receitaPendente)} detalhe="Pendentes e aguardando convênio" cor="text-amber-600" />
            <Indicador titulo="Despesas pagas" valor={formatarMoeda(relatorio.despesasPagas)} detalhe={relatorio.glosado > 0 ? `${formatarMoeda(relatorio.glosado)} glosados` : "Sem glosas no período"} cor="text-red-600" />
            <Indicador titulo="Saldo" valor={formatarMoeda(saldo)} detalhe="Receita recebida menos despesas" cor={saldo >= 0 ? "text-slate-950" : "text-red-600"} />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Indicador titulo="Pacientes ativos" valor={relatorio.pacientesAtivos} detalhe={`${relatorio.pacientesHof} em acompanhamento de HOF`} />
            <Indicador titulo="Retornos pendentes" valor={relatorio.retornosPendentes} detalhe="Pacientes para chamar de volta" />
            <Indicador titulo="Agendamentos" valor={relatorio.totalAgendamentos} detalhe={`${relatorio.confirmados} confirmados no período`} />
            <Indicador titulo="Cancelamentos" valor={`${relatorio.taxaCancelamento}%`} detalhe={`${relatorio.cancelados} agendamentos cancelados`} />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
              <h3 className="text-xl font-bold">Receita recebida por mês</h3>
              <p className="mt-1 text-sm text-slate-500">Últimos 6 meses, considerando lançamentos pagos.</p>
              <div className="mt-6 flex h-56 items-end gap-3">
                {relatorio.meses.map((mes) => (
                  <div key={mes.rotulo} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {mes.valor > 0 ? formatarMoeda(mes.valor).replace(",00", "") : ""}
                    </span>
                    <div
                      className="w-full rounded-t-xl bg-cyan-500"
                      style={{ height: `${maiorMes > 0 ? Math.max((mes.valor / maiorMes) * 160, mes.valor > 0 ? 6 : 2) : 2}px` }}
                    />
                    <span className="text-xs font-semibold text-slate-600">{mes.rotulo}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">Orçamentos</h3>
              <p className="mt-1 text-sm text-slate-500">Criados no período selecionado.</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Aprovados</span><strong>{relatorio.orcamentosAprovados}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Aguardando aprovação</span><strong>{relatorio.orcamentosEnviados}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Valor aprovado</span><strong>{formatarMoeda(relatorio.valorAprovado)}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Taxa de conversão</span><strong>{relatorio.conversao}%</strong></div>
              </div>
              <Link href="/orcamentos" className="mt-6 block rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                Ver orçamentos
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">Procedimentos mais frequentes</h3>
              <div className="mt-6 space-y-5">
                {relatorio.procedimentos.map(([nome, quantidade]) => (
                  <Barra key={nome} rotulo={nome} valor={quantidade} maximo={maiorProcedimento} texto={`${quantidade}x`} cor="bg-emerald-500" />
                ))}
                {relatorio.procedimentos.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhum procedimento registrado ainda.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">Tratamentos por status</h3>
              <div className="mt-6 space-y-5">
                {relatorio.tratamentosPorStatus.map(([status, quantidade]) => (
                  <Barra key={status} rotulo={status} valor={quantidade} maximo={maiorStatus} texto={String(quantidade)} cor="bg-indigo-500" />
                ))}
                {relatorio.tratamentosPorStatus.length === 0 && (
                  <p className="text-sm text-slate-500">Nenhum tratamento registrado ainda.</p>
                )}
              </div>
              <Link href="/tratamentos" className="mt-6 block rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700">
                Ver tratamentos
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
