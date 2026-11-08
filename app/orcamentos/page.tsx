"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  getOrcamentos,
  getPacientes,
  type CliniplusOrcamento,
  type CliniplusPaciente,
} from "@/utils/cliniplusStore";
import { formatarMoeda } from "@/utils/format";

const statusOrcamento: Record<CliniplusOrcamento["status"], { rotulo: string; classe: string }> = {
  rascunho: { rotulo: "Rascunho", classe: "bg-slate-100 text-slate-700" },
  enviado: { rotulo: "Aguardando aprovação", classe: "bg-cyan-100 text-cyan-700" },
  aprovado: { rotulo: "Aprovado", classe: "bg-emerald-100 text-emerald-700" },
  cancelado: { rotulo: "Cancelado", classe: "bg-red-100 text-red-700" },
};

const filtros = ["Todos", "rascunho", "enviado", "aprovado", "cancelado"] as const;

function formatarData(valor?: string) {
  if (!valor) return "-";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "-" : data.toLocaleDateString("pt-BR");
}

function linkOrcamento(pacienteId: CliniplusOrcamento["pacienteId"]) {
  return `/pacientes/${pacienteId}?aba=prontuario&secao=plano&modo=orcamento`;
}

export default function Orcamentos() {
  const router = useRouter();
  const [orcamentos, setOrcamentos] = useState<CliniplusOrcamento[]>([]);
  const [pacientes, setPacientes] = useState<CliniplusPaciente[]>([]);
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todos");
  const [busca, setBusca] = useState("");
  const [pacienteNovo, setPacienteNovo] = useState("");

  useEffect(() => {
    function carregar() {
      setOrcamentos(getOrcamentos());
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

  const resumo = useMemo(() => {
    const porStatus = (status: CliniplusOrcamento["status"]) =>
      orcamentos.filter((orcamento) => orcamento.status === status);
    const aprovados = porStatus("aprovado");
    const enviados = porStatus("enviado");

    return {
      aprovados: aprovados.length,
      enviados: enviados.length,
      rascunhos: porStatus("rascunho").length,
      valorAprovado: aprovados.reduce((total, item) => total + (item.total || 0), 0),
      valorEmAberto: enviados.reduce((total, item) => total + (item.total || 0), 0),
    };
  }, [orcamentos]);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...orcamentos]
      .filter((orcamento) => filtro === "Todos" || orcamento.status === filtro)
      .filter((orcamento) => {
        if (!termo) return true;
        const nome = nomePorPaciente.get(String(orcamento.pacienteId)) || "";
        return `${orcamento.numero} ${nome}`.toLowerCase().includes(termo);
      })
      .sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
  }, [busca, filtro, nomePorPaciente, orcamentos]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Orçamentos" />

        <section className="flex-1 p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-3xl font-bold">Orçamentos</h2>
              <p className="mt-1 text-slate-500">
                Orçamentos gerados a partir dos planos de tratamento dos pacientes.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={pacienteNovo}
                onChange={(event) => setPacienteNovo(event.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none"
              >
                <option value="">Escolha o paciente</option>
                {pacientes.map((paciente) => (
                  <option key={String(paciente.id)} value={String(paciente.id)}>
                    {paciente.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!pacienteNovo}
                onClick={() => router.push(linkOrcamento(pacienteNovo))}
                className="h-12 rounded-xl bg-slate-950 px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Novo orçamento
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Aprovados</p>
              <h3 className="mt-3 text-3xl font-bold">{resumo.aprovados}</h3>
              <p className="mt-2 text-xs text-emerald-600">{formatarMoeda(resumo.valorAprovado)}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Aguardando aprovação</p>
              <h3 className="mt-3 text-3xl font-bold">{resumo.enviados}</h3>
              <p className="mt-2 text-xs text-cyan-700">{formatarMoeda(resumo.valorEmAberto)} em aberto</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Rascunhos</p>
              <h3 className="mt-3 text-3xl font-bold">{resumo.rascunhos}</h3>
              <p className="mt-2 text-xs text-slate-500">Ainda não enviados</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Taxa de aprovação</p>
              <h3 className="mt-3 text-3xl font-bold">
                {resumo.aprovados + resumo.enviados > 0
                  ? `${Math.round((resumo.aprovados / (resumo.aprovados + resumo.enviados)) * 100)}%`
                  : "-"}
              </h3>
              <p className="mt-2 text-xs text-slate-500">Aprovados entre os enviados</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex flex-wrap gap-2">
                {filtros.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFiltro(item)}
                    className={
                      filtro === item
                        ? "rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
                    }
                  >
                    {item === "Todos" ? "Todos" : statusOrcamento[item].rotulo}
                  </button>
                ))}
              </div>
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por paciente ou número"
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none md:w-72"
              />
            </div>

            {lista.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                <p className="font-semibold text-slate-700">Nenhum orçamento encontrado.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Para criar um, abra o paciente, monte o plano de tratamento e clique em
                  &quot;Gerar orçamento&quot;, ou use o botão Novo orçamento acima.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-slate-100 text-slate-500">
                    <tr>
                      <th className="pb-3">Número</th>
                      <th className="pb-3">Paciente</th>
                      <th className="pb-3">Itens</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Criado em</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((orcamento) => {
                      const status = statusOrcamento[orcamento.status] ?? statusOrcamento.rascunho;
                      return (
                        <tr key={orcamento.id} className="border-b border-slate-50">
                          <td className="py-4 font-semibold">{orcamento.numero}</td>
                          <td className="py-4">
                            {nomePorPaciente.get(String(orcamento.pacienteId)) || "Paciente removido"}
                          </td>
                          <td className="py-4">{orcamento.itens.length}</td>
                          <td className="py-4 font-semibold">{formatarMoeda(orcamento.total)}</td>
                          <td className="py-4">{formatarData(orcamento.criadoEm)}</td>
                          <td className="py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classe}`}>
                              {status.rotulo}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {nomePorPaciente.has(String(orcamento.pacienteId)) && (
                              <Link
                                href={linkOrcamento(orcamento.pacienteId)}
                                className="font-semibold text-cyan-700 hover:text-cyan-900"
                              >
                                Abrir
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
