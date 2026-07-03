"use client";

import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getLancamentosFinanceiros,
  getPacienteById,
} from "@/utils/cliniplusStore";

function parseMoney(value: string) {
  const parsed = Number.parseFloat(
    value
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getStatusClass(status: string) {
  if (status === "Pago" || status === "Recebido do convÃªnio") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Pendente" || status === "Aguardando convÃªnio") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Glosado") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

const modulosFinanceiros = [
  { nome: "Visao geral", href: "/financeiro", detalhe: "Resumo financeiro" },
  {
    nome: "Contas a receber",
    href: "/relatorios?modulo=contas-receber",
    detalhe: "Valores previstos",
  },
  {
    nome: "Contas a pagar",
    href: "/relatorios?modulo=contas-pagar",
    detalhe: "Despesas e vencimentos",
  },
  { nome: "Caixa", href: "/relatorios?modulo=caixa", detalhe: "Entradas e saidas" },
  {
    nome: "Formas de pagamento",
    href: "/relatorios?modulo=formas-pagamento",
    detalhe: "Pix, boleto e cartao",
  },
  {
    nome: "Notas fiscais",
    href: "/financeiro/notas-fiscais",
    detalhe: "NFS-e e emissao",
  },
];

export default function Financeiro() {
  const [atualizacao, setAtualizacao] = useState(0);
  const lancamentos = useMemo(() => {
    return getLancamentosFinanceiros().map((lancamento) => {
      const paciente = lancamento.pacienteId
        ? getPacienteById(lancamento.pacienteId)
        : null;

      return {
        ...lancamento,
        paciente: lancamento.paciente || paciente?.nome,
        origem: lancamento.origem || paciente?.convenio || "Clinica",
      };
    });
  }, [atualizacao]);

  useEffect(() => {
    const atualizar = () => setAtualizacao((valor) => valor + 1);

    window.addEventListener("cliniplus:store", atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener("cliniplus:store", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  const receitas = lancamentos.filter((item) => item.tipo === "Receita");
  const despesas = lancamentos.filter((item) => item.tipo === "Despesa");
  const recebidos = receitas.filter(
    (item) => item.status === "Pago" || item.status === "Recebido do convÃªnio"
  );
  const pendentes = lancamentos.filter(
    (item) => item.status === "Pendente" || item.status === "Aguardando convÃªnio"
  );
  const contasPagar = despesas.filter((item) => item.status !== "Pago");

  const totalRecebido = recebidos.reduce(
    (total, item) => total + parseMoney(item.valor),
    0
  );
  const totalPendente = pendentes.reduce(
    (total, item) => total + parseMoney(item.valor),
    0
  );
  const totalReceber = receitas
    .filter((item) => item.status !== "Glosado")
    .reduce((total, item) => total + parseMoney(item.valor), 0);
  const totalPagar = despesas.reduce(
    (total, item) => total + parseMoney(item.valor),
    0
  );
  const saldoPrevisto = totalReceber - totalPagar;

  const cards = [
    {
      label: "Total recebido",
      value: formatMoney(totalRecebido),
      detail: "Entradas confirmadas",
      className: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Total pendente",
      value: formatMoney(totalPendente),
      detail: "Receitas e despesas em aberto",
      className: "text-amber-700 bg-amber-50",
    },
    {
      label: "Contas a receber",
      value: formatMoney(totalReceber),
      detail: `${receitas.length} receita(s) cadastrada(s)`,
      className: "text-cyan-700 bg-cyan-50",
    },
    {
      label: "Contas a pagar",
      value: formatMoney(totalPagar),
      detail: `${contasPagar.length} conta(s) pendente(s)`,
      className: "text-red-700 bg-red-50",
    },
    {
      label: "Saldo previsto",
      value: formatMoney(saldoPrevisto),
      detail: "Receitas menos despesas",
      className: "text-slate-700 bg-slate-100",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Visao geral financeira" />

        <section className="min-w-0 flex-1 px-6 py-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
                Financeiro global
              </p>
              <h1 className="mt-2 text-3xl font-bold">
                Visao geral financeira da clinica
              </h1>
              <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                Esta area mostra a saude financeira geral do consultorio. O
                financeiro individual continua dentro da ficha de cada paciente.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/financeiro/novo"
                className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
              >
                Novo lancamento
              </Link>
              <Link
                href="/financeiro/novo?tipo=receita"
                className="rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                Nova receita
              </Link>
              <Link
                href="/financeiro/novo?tipo=despesa"
                className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
              >
                Nova despesa
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-5 md:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-500">
                  {card.label}
                </p>
                <h2 className="mt-3 text-2xl font-bold">{card.value}</h2>
                <p
                  className={`mt-3 w-fit rounded-full px-3 py-1 text-xs font-bold ${card.className}`}
                >
                  {card.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {modulosFinanceiros.map((modulo) => (
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

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Ultimos lancamentos financeiros
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Entradas e saidas gerais da clinica.
                  </p>
                </div>

                <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none">
                  <option>Todos</option>
                  <option>Receitas</option>
                  <option>Despesas</option>
                  <option>Pendentes</option>
                  <option>Pagos</option>
                </select>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100">
                <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.2fr_120px_140px_140px_150px] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                  <span>Descricao</span>
                  <span>Tipo</span>
                  <span>Status</span>
                  <span>Valor</span>
                  <span>Origem</span>
                </div>

                {lancamentos.map((lancamento) => (
                  <div
                    key={lancamento.id}
                    className="grid grid-cols-[1.2fr_120px_140px_140px_150px] items-center border-t border-slate-100 px-4 py-4 text-sm"
                  >
                    <span>
                      <span className="block font-bold text-slate-900">
                        {lancamento.descricao}
                      </span>
                      {lancamento.paciente && (
                        <span className="mt-1 block text-xs font-semibold text-slate-500">
                          {lancamento.paciente}
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        lancamento.tipo === "Receita"
                          ? "font-bold text-emerald-700"
                          : "font-bold text-red-700"
                      }
                    >
                      {lancamento.tipo}
                    </span>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        lancamento.status
                      )}`}
                    >
                      {lancamento.status === "Glosado"
                        ? "Recusado"
                        : lancamento.status}
                    </span>
                    <span className="font-bold">{lancamento.valor}</span>
                    <span className="text-sm font-semibold text-slate-500">
                      {lancamento.origem || "Clinica"}
                    </span>
                  </div>
                ))}
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">Separacao importante</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                  Use esta pagina para a visao geral da clinica. Para ver ou
                  adicionar lancamentos de um paciente especifico, abra a ficha
                  dele e use a aba Financeiro.
                </p>
                <Link
                  href="/pacientes"
                  className="mt-5 inline-flex rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700"
                >
                  Abrir pacientes
                </Link>
              </div>

              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
                <h2 className="text-xl font-bold text-cyan-900">
                  Proximos controles
                </h2>
                <div className="mt-4 space-y-3 text-sm font-semibold text-cyan-800">
                  <p>Contas a receber organizadas por vencimento</p>
                  <p>Contas a pagar por centro de custo</p>
                  <p>Caixa diario e conciliacao</p>
                  <p>Formas de pagamento por canal</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
