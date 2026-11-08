"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  addTratamento,
  deleteTratamento,
  getPacientes,
  getTratamentos,
  updateTratamento,
  type CliniplusPaciente,
  type CliniplusTratamento,
} from "@/utils/cliniplusStore";
import { formatarDataBr, hojeIso } from "@/utils/datas";
import { dinheiroParaNumero, formatarMoeda, normalizarTexto } from "@/utils/format";

const statusTratamento = ["Planejado", "Em andamento", "Urgente", "Concluído"] as const;

const classesStatus: Record<string, string> = {
  planejado: "bg-cyan-100 text-cyan-700",
  "em andamento": "bg-amber-100 text-amber-700",
  urgente: "bg-red-100 text-red-700",
  concluido: "bg-emerald-100 text-emerald-700",
};

function statusCanonico(status?: string) {
  const texto = normalizarTexto(status);
  if (texto.includes("conclu") || texto.includes("finaliz")) return "Concluído";
  if (texto.includes("urgent")) return "Urgente";
  if (texto.includes("andamento") || texto.includes("em tratamento")) return "Em andamento";
  return "Planejado";
}

const formularioVazio = { pacienteId: "", descricao: "", status: "Planejado", valor: "", data: "" };

export default function Tratamentos() {
  const [tratamentos, setTratamentos] = useState<CliniplusTratamento[]>([]);
  const [pacientes, setPacientes] = useState<CliniplusPaciente[]>([]);
  const [pacienteFiltro, setPacienteFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({ ...formularioVazio, data: hojeIso() });
  const [mensagem, setMensagem] = useState({ texto: "", erro: false });

  useEffect(() => {
    function carregar() {
      setTratamentos(getTratamentos());
      setPacientes(getPacientes());
    }

    carregar();
    const daUrl = new URLSearchParams(window.location.search).get("pacienteId");
    if (daUrl) {
      setPacienteFiltro(daUrl);
      setForm((atual) => ({ ...atual, pacienteId: daUrl }));
    }

    window.addEventListener("cliniplus:store", carregar);
    return () => window.removeEventListener("cliniplus:store", carregar);
  }, []);

  const nomePorPaciente = useMemo(
    () => new Map(pacientes.map((paciente) => [String(paciente.id), paciente.nome])),
    [pacientes]
  );

  const doPaciente = useMemo(
    () => tratamentos.filter((item) => !pacienteFiltro || String(item.pacienteId) === pacienteFiltro),
    [pacienteFiltro, tratamentos]
  );

  const lista = useMemo(() => {
    const termo = normalizarTexto(busca);
    return doPaciente
      .filter((item) => statusFiltro === "Todos" || statusCanonico(item.status) === statusFiltro)
      .filter((item) => {
        if (!termo) return true;
        const nome = nomePorPaciente.get(String(item.pacienteId)) || item.paciente || "";
        return normalizarTexto(`${item.descricao} ${nome}`).includes(termo);
      })
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [busca, doPaciente, nomePorPaciente, statusFiltro]);

  const contar = (status: string) => doPaciente.filter((item) => statusCanonico(item.status) === status).length;
  const valorEmAberto = doPaciente
    .filter((item) => statusCanonico(item.status) !== "Concluído")
    .reduce((total, item) => total + dinheiroParaNumero(item.valor), 0);

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.pacienteId) return setMensagem({ texto: "Escolha o paciente.", erro: true });
    if (!form.descricao.trim()) return setMensagem({ texto: "Informe o procedimento.", erro: true });

    const valor = dinheiroParaNumero(form.valor);
    addTratamento({
      pacienteId: form.pacienteId,
      paciente: nomePorPaciente.get(form.pacienteId),
      descricao: form.descricao.trim(),
      status: form.status,
      valor: valor > 0 ? formatarMoeda(valor) : "",
      data: form.data || hojeIso(),
    });
    setForm({ ...formularioVazio, pacienteId: form.pacienteId, data: hojeIso() });
    setMensagem({ texto: "Tratamento cadastrado.", erro: false });
  }

  function excluir(tratamento: CliniplusTratamento) {
    if (!window.confirm(`Excluir o tratamento "${tratamento.descricao}"?`)) return;
    deleteTratamento(tratamento.id);
    setMensagem({ texto: "Tratamento excluído.", erro: false });
  }

  const campo = "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Tratamentos" />

        <section className="min-w-0 flex-1 p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-3xl font-bold">Tratamentos</h2>
              <p className="mt-1 text-slate-500">
                Procedimentos odontológicos e de HOF por paciente, do planejamento à conclusão.
              </p>
            </div>
            <select
              value={pacienteFiltro}
              onChange={(event) => setPacienteFiltro(event.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none"
            >
              <option value="">Todos os pacientes</option>
              {pacientes.map((paciente) => (
                <option key={String(paciente.id)} value={String(paciente.id)}>
                  {paciente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-5">
            {[
              ["Em andamento", contar("Em andamento"), "text-amber-600"],
              ["Urgentes", contar("Urgente"), "text-red-600"],
              ["Planejados", contar("Planejado"), "text-cyan-700"],
              ["Concluídos", contar("Concluído"), "text-emerald-600"],
            ].map(([titulo, valor, cor]) => (
              <div key={String(titulo)} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">{titulo}</p>
                <h3 className={`mt-3 text-3xl font-bold ${cor}`}>{valor}</h3>
              </div>
            ))}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Valor em aberto</p>
              <h3 className="mt-3 text-2xl font-bold">{formatarMoeda(valorEmAberto)}</h3>
              <p className="mt-2 text-xs text-slate-500">Tratamentos não concluídos</p>
            </div>
          </div>

          {mensagem.texto && (
            <p className={`mt-6 rounded-xl px-4 py-3 text-sm font-semibold ${mensagem.erro ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
              {mensagem.texto}
            </p>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h3 className="text-xl font-bold">Lista de tratamentos</h3>
                <div className="flex flex-wrap gap-3">
                  <input
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar procedimento ou paciente"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  />
                  <select
                    value={statusFiltro}
                    onChange={(event) => setStatusFiltro(event.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  >
                    <option>Todos</option>
                    {statusTratamento.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-slate-100 text-slate-500">
                    <tr>
                      <th className="pb-3">Paciente</th>
                      <th className="pb-3">Procedimento</th>
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Valor</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((tratamento) => {
                      const status = statusCanonico(tratamento.status);
                      return (
                        <tr key={String(tratamento.id)} className="border-b border-slate-50">
                          <td className="py-4 font-semibold">
                            <Link href={`/pacientes/${tratamento.pacienteId}?aba=prontuario`} className="hover:text-cyan-700">
                              {nomePorPaciente.get(String(tratamento.pacienteId)) || tratamento.paciente || "Paciente removido"}
                            </Link>
                          </td>
                          <td className="py-4">{tratamento.descricao}</td>
                          <td className="py-4">{formatarDataBr(tratamento.data)}</td>
                          <td className="py-4">{tratamento.valor || "-"}</td>
                          <td className="py-4">
                            <select
                              value={status}
                              onChange={(event) => updateTratamento(tratamento.id, { status: event.target.value })}
                              className={`rounded-full px-3 py-1 text-xs font-semibold outline-none ${classesStatus[normalizarTexto(status)]}`}
                            >
                              {statusTratamento.map((opcao) => (
                                <option key={opcao}>{opcao}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/financeiro/novo?pacienteId=${tratamento.pacienteId}&descricao=${encodeURIComponent(tratamento.descricao)}&valor=${encodeURIComponent(String(dinheiroParaNumero(tratamento.valor) || ""))}`}
                                className="text-xs font-semibold text-cyan-700"
                              >
                                Lançar pagamento
                              </Link>
                              <button type="button" onClick={() => excluir(tratamento)} aria-label="Excluir tratamento" className="text-rose-600">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {lista.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    Nenhum tratamento encontrado.
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={salvar} className="h-fit rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">Novo tratamento</h3>
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold">Paciente</span>
                  <select value={form.pacienteId} onChange={(event) => setForm({ ...form, pacienteId: event.target.value })} className={campo}>
                    <option value="">Selecione</option>
                    {pacientes.map((paciente) => (
                      <option key={String(paciente.id)} value={String(paciente.id)}>
                        {paciente.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Procedimento</span>
                  <input
                    value={form.descricao}
                    onChange={(event) => setForm({ ...form, descricao: event.target.value })}
                    placeholder="Ex.: Canal no dente 36"
                    className={campo}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-semibold">Status</span>
                    <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={campo}>
                      {statusTratamento.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Valor (R$)</span>
                    <input
                      inputMode="decimal"
                      value={form.valor}
                      onChange={(event) => setForm({ ...form, valor: event.target.value.replace(/[^\d.,]/g, "") })}
                      placeholder="0,00"
                      className={campo}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-semibold">Data</span>
                  <input type="date" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} className={campo} />
                </label>
                <button type="submit" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                  Cadastrar tratamento
                </button>
                <p className="text-xs text-slate-500">
                  Para planos completos com várias etapas e orçamento, use o plano de tratamento no prontuário do paciente.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
