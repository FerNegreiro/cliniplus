"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  deleteLancamentoFinanceiro,
  getLancamentosFinanceiros,
  getPacientes,
  updateLancamentoFinanceiro,
  type CliniplusLancamentoFinanceiro,
  type CliniplusPaciente,
} from "@/utils/cliniplusStore";
import { dataIsoLocal, formatarDataBr, hojeIso } from "@/utils/datas";
import { dinheiroParaNumero, formatarMoeda, normalizarTexto } from "@/utils/format";

type Periodo = "mes" | "mes-passado" | "ano" | "tudo";

const periodos: Array<{ valor: Periodo; rotulo: string }> = [
  { valor: "mes", rotulo: "Este mês" },
  { valor: "mes-passado", rotulo: "Mês passado" },
  { valor: "ano", rotulo: "Este ano" },
  { valor: "tudo", rotulo: "Todo o período" },
];

const filtros = ["Todos", "Receitas", "Despesas", "Pendentes", "Pagos"] as const;

function pago(item: CliniplusLancamentoFinanceiro) {
  return ["pago", "recebido do convenio"].includes(normalizarTexto(item.status));
}

function glosado(item: CliniplusLancamentoFinanceiro) {
  return normalizarTexto(item.status) === "glosado";
}

function intervalo(periodo: Periodo) {
  const hoje = new Date();
  if (periodo === "tudo") return { inicio: "0000-00-00", fim: "9999-12-31" };
  if (periodo === "ano") return { inicio: `${hoje.getFullYear()}-01-01`, fim: `${hoje.getFullYear()}-12-31` };
  const deslocamento = periodo === "mes-passado" ? -1 : 0;
  return {
    inicio: dataIsoLocal(new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento, 1)),
    fim: dataIsoLocal(new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento + 1, 0)),
  };
}

function classeStatus(item: CliniplusLancamentoFinanceiro) {
  if (pago(item)) return "bg-emerald-100 text-emerald-700";
  if (glosado(item)) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState<CliniplusLancamentoFinanceiro[]>([]);
  const [pacientes, setPacientes] = useState<CliniplusPaciente[]>([]);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    function carregar() {
      setLancamentos(getLancamentosFinanceiros());
      setPacientes(getPacientes());
    }

    carregar();
    window.addEventListener("cliniplus:store", carregar);
    return () => window.removeEventListener("cliniplus:store", carregar);
  }, []);

  const nomePorPaciente = useMemo(
    () => new Map(pacientes.map((paciente) => [String(paciente.id), paciente.nome])),
    [pacientes]
  );

  const doPeriodo = useMemo(() => {
    const { inicio, fim } = intervalo(periodo);
    return lancamentos.filter((item) => (item.data || "") >= inicio && (item.data || "") <= fim);
  }, [lancamentos, periodo]);

  const resumo = useMemo(() => {
    const somar = (lista: CliniplusLancamentoFinanceiro[]) =>
      lista.reduce((total, item) => total + dinheiroParaNumero(item.valor), 0);
    const receitas = doPeriodo.filter((item) => item.tipo === "Receita");
    const despesas = doPeriodo.filter((item) => item.tipo === "Despesa");
    const recebido = somar(receitas.filter(pago));
    const pagoDespesas = somar(despesas.filter(pago));
    return {
      recebido,
      aReceber: somar(receitas.filter((item) => !pago(item) && !glosado(item))),
      despesasPagas: pagoDespesas,
      aPagar: somar(despesas.filter((item) => !pago(item))),
      glosado: somar(receitas.filter(glosado)),
      saldo: recebido - pagoDespesas,
    };
  }, [doPeriodo]);

  const lista = useMemo(() => {
    const termo = normalizarTexto(busca);
    const hoje = hojeIso();
    return doPeriodo
      .filter((item) => {
        if (filtro === "Receitas") return item.tipo === "Receita";
        if (filtro === "Despesas") return item.tipo === "Despesa";
        if (filtro === "Pendentes") return !pago(item) && !glosado(item);
        if (filtro === "Pagos") return pago(item);
        return true;
      })
      .filter((item) => {
        if (!termo) return true;
        const nome = item.pacienteId ? nomePorPaciente.get(String(item.pacienteId)) || "" : "";
        return normalizarTexto(`${item.descricao} ${nome} ${item.origem}`).includes(termo);
      })
      .map((item) => ({ ...item, atrasado: !pago(item) && !glosado(item) && (item.data || "") < hoje }))
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [busca, doPeriodo, filtro, nomePorPaciente]);

  function marcarComoPago(item: CliniplusLancamentoFinanceiro) {
    const status = normalizarTexto(item.status).includes("convenio") ? "Recebido do convênio" : "Pago";
    updateLancamentoFinanceiro(item.id, { status });
  }

  function excluir(item: CliniplusLancamentoFinanceiro) {
    if (!window.confirm(`Excluir o lançamento "${item.descricao}"?`)) return;
    deleteLancamentoFinanceiro(item.id);
  }

  const cards = [
    { titulo: "Recebido", valor: resumo.recebido, cor: "text-emerald-600" },
    { titulo: "A receber", valor: resumo.aReceber, cor: "text-amber-600" },
    { titulo: "Despesas pagas", valor: resumo.despesasPagas, cor: "text-red-600" },
    { titulo: "A pagar", valor: resumo.aPagar, cor: "text-orange-600" },
    { titulo: "Saldo", valor: resumo.saldo, cor: resumo.saldo < 0 ? "text-red-600" : "text-slate-950" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Financeiro" />

        <section className="min-w-0 flex-1 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold">Financeiro</h1>
              <p className="mt-1 text-slate-500">Receitas, despesas e valores a receber da clínica.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={periodo}
                onChange={(event) => setPeriodo(event.target.value as Periodo)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"
              >
                {periodos.map((item) => (
                  <option key={item.valor} value={item.valor}>
                    {item.rotulo}
                  </option>
                ))}
              </select>
              <Link href="/financeiro/novo?tipo=receita" className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700">
                Nova receita
              </Link>
              <Link href="/financeiro/novo?tipo=despesa" className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-50">
                Nova despesa
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <div key={card.titulo} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500">{card.titulo}</p>
                <h2 className={`mt-3 text-2xl font-bold ${card.cor}`}>{formatarMoeda(card.valor)}</h2>
              </div>
            ))}
          </div>

          {resumo.glosado > 0 && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {formatarMoeda(resumo.glosado)} glosados pelo convênio neste período.
            </p>
          )}

          <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex flex-wrap gap-2">
                {filtros.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFiltro(item)}
                    className={filtro === item ? "rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" : "rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar descrição ou paciente"
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none md:w-72"
              />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                  <tr>
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Descrição</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Valor</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody>
                  {lista.map((item) => (
                    <tr key={String(item.id)} className="border-b border-slate-50">
                      <td className="py-4">{formatarDataBr(item.data)}</td>
                      <td className="py-4">
                        <span className="block font-bold text-slate-900">{item.descricao}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {[item.pacienteId ? nomePorPaciente.get(String(item.pacienteId)) : "", item.origem, item.formaPagamento]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </td>
                      <td className={`py-4 font-bold ${item.tipo === "Receita" ? "text-emerald-700" : "text-red-700"}`}>{item.tipo}</td>
                      <td className="py-4 font-bold">{formatarMoeda(dinheiroParaNumero(item.valor))}</td>
                      <td className="py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${classeStatus(item)}`}>
                          {item.atrasado ? `${item.status} (atrasado)` : item.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-3">
                          {!pago(item) && !glosado(item) && (
                            <button type="button" onClick={() => marcarComoPago(item)} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <CheckCircle2 size={15} />
                              Marcar como pago
                            </button>
                          )}
                          <button type="button" onClick={() => excluir(item)} aria-label="Excluir lançamento" className="text-rose-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lista.length === 0 && (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  Nenhum lançamento neste período.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
