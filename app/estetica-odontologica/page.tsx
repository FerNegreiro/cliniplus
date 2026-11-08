"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, CalendarPlus, FileText, MessageCircle, ScanFace, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  addProcedimentoHof,
  deleteProcedimentoHof,
  getPacientes,
  getProcedimentosHof,
  updateProcedimentoHof,
  type CliniplusPaciente,
  type CliniplusProcedimentoHof,
  type StatusProcedimentoHof,
} from "@/utils/cliniplusStore";
import { formatarDataBr, hojeIso, somarDias } from "@/utils/datas";
import { dinheiroParaNumero, formatarMoeda, normalizarTexto } from "@/utils/format";
import { linkWhatsApp } from "@/utils/whatsapp";

const procedimentosComuns = [
  "Toxina botulínica",
  "Preenchimento labial",
  "Preenchimento de olheiras",
  "Bioestimulador de colágeno",
  "Skinbooster",
  "Fios de PDO",
  "Rinomodelação",
  "Harmonização facial completa",
];

const statusHof: StatusProcedimentoHof[] = ["Planejado", "Realizado", "Retorno", "Cancelado"];

const classesStatus: Record<StatusProcedimentoHof, string> = {
  Planejado: "bg-cyan-100 text-cyan-700",
  Realizado: "bg-emerald-100 text-emerald-700",
  Retorno: "bg-amber-100 text-amber-700",
  Cancelado: "bg-slate-200 text-slate-600",
};

const formularioVazio = {
  procedimento: procedimentosComuns[0],
  regiao: "",
  produto: "",
  lote: "",
  validade: "",
  quantidade: "",
  valor: "",
  data: "",
  status: "Realizado" as StatusProcedimentoHof,
  retorno: "",
  observacoes: "",
};

export default function Hof() {
  const [pacientes, setPacientes] = useState<CliniplusPaciente[]>([]);
  const [procedimentos, setProcedimentos] = useState<CliniplusProcedimentoHof[]>([]);
  const [pacienteId, setPacienteId] = useState("");
  const [busca, setBusca] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [form, setForm] = useState({ ...formularioVazio, data: hojeIso() });
  const [mensagem, setMensagem] = useState({ texto: "", erro: false });

  useEffect(() => {
    function carregar() {
      setPacientes(getPacientes());
      setProcedimentos(getProcedimentosHof());
    }

    carregar();
    const parametros = new URLSearchParams(window.location.search);
    const daUrl = parametros.get("pacienteId");
    const nomeDaUrl = parametros.get("paciente");
    if (daUrl) {
      setPacienteId(daUrl);
    } else if (nomeDaUrl) {
      const encontrado = getPacientes().find((item) => item.nome === nomeDaUrl);
      if (encontrado) setPacienteId(String(encontrado.id));
    }

    window.addEventListener("cliniplus:store", carregar);
    return () => window.removeEventListener("cliniplus:store", carregar);
  }, []);

  const hoje = hojeIso();
  const pacientesHof = useMemo(
    () => pacientes.filter((item) => mostrarTodos || item.tipoAtendimento === "estetica" || String(item.id) === pacienteId),
    [mostrarTodos, pacienteId, pacientes]
  );
  const listaPacientes = useMemo(() => {
    const termo = normalizarTexto(busca);
    return pacientesHof.filter((item) => !termo || normalizarTexto(`${item.nome} ${item.telefone}`).includes(termo));
  }, [busca, pacientesHof]);

  const paciente = pacientes.find((item) => String(item.id) === pacienteId) || null;
  const doPaciente = useMemo(
    () =>
      procedimentos
        .filter((item) => String(item.pacienteId) === pacienteId)
        .sort((a, b) => (b.data || "").localeCompare(a.data || "")),
    [pacienteId, procedimentos]
  );

  const indicadores = useMemo(() => {
    const mes = hoje.slice(0, 7);
    const realizadosMes = procedimentos.filter((item) => item.status === "Realizado" && (item.data || "").startsWith(mes));
    return {
      pacientes: pacientes.filter((item) => item.tipoAtendimento === "estetica").length,
      realizadosMes: realizadosMes.length,
      faturamentoMes: realizadosMes.reduce((total, item) => total + dinheiroParaNumero(item.valor), 0),
      retornos: procedimentos.filter(
        (item) => item.retorno && item.retorno >= hoje && item.retorno <= somarDias(hoje, 30) && item.status !== "Cancelado"
      ).length,
    };
  }, [hoje, pacientes, procedimentos]);

  function atualizarCampo(campo: keyof typeof formularioVazio, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function registrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!paciente) return;
    if (!form.procedimento.trim()) return setMensagem({ texto: "Informe o procedimento.", erro: true });
    if (form.status === "Realizado" && form.validade && form.validade < form.data) {
      return setMensagem({ texto: "O produto estava vencido na data do procedimento. Confira a validade.", erro: true });
    }

    const valor = dinheiroParaNumero(form.valor);
    addProcedimentoHof({
      pacienteId: paciente.id,
      ...form,
      procedimento: form.procedimento.trim(),
      valor: valor > 0 ? formatarMoeda(valor) : "",
    });
    setForm({ ...formularioVazio, data: hojeIso() });
    setMensagem({ texto: "Procedimento registrado.", erro: false });
  }

  function excluir(item: CliniplusProcedimentoHof) {
    if (!window.confirm(`Excluir o registro de ${item.procedimento}?`)) return;
    deleteProcedimentoHof(item.id);
  }

  const campo = "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="HOF" />

        <section className="min-w-0 flex-1 p-6">
          <div>
            <h1 className="text-3xl font-bold">Harmonização orofacial</h1>
            <p className="mt-1 text-slate-500">
              Procedimentos, produtos, lotes e retornos dos pacientes de HOF.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            {[
              ["Pacientes de HOF", String(indicadores.pacientes)],
              ["Realizados no mês", String(indicadores.realizadosMes)],
              ["Faturamento HOF no mês", formatarMoeda(indicadores.faturamentoMes)],
              ["Retornos em 30 dias", String(indicadores.retornos)],
            ].map(([titulo, valor]) => (
              <div key={titulo} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{titulo}</p>
                <h3 className="mt-3 text-2xl font-bold">{valor}</h3>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[320px_1fr]">
            <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar paciente"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
              />
              <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <input type="checkbox" checked={mostrarTodos} onChange={(event) => setMostrarTodos(event.target.checked)} />
                Mostrar todos os pacientes
              </label>
              <div className="mt-4 space-y-2">
                {listaPacientes.map((item) => (
                  <button
                    key={String(item.id)}
                    type="button"
                    onClick={() => setPacienteId(String(item.id))}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      String(item.id) === pacienteId ? "bg-violet-100 font-bold text-violet-800" : "bg-slate-50 hover:bg-violet-50"
                    }`}
                  >
                    <span className="block truncate font-semibold">{item.nome}</span>
                    <span className="text-xs text-slate-500">
                      {procedimentos.filter((proc) => String(proc.pacienteId) === String(item.id)).length} procedimento(s)
                    </span>
                  </button>
                ))}
                {listaPacientes.length === 0 && (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Nenhum paciente de HOF. Cadastre com o tipo de atendimento &quot;HOF&quot; ou marque &quot;Mostrar todos&quot;.
                  </p>
                )}
              </div>
              <Link href="/pacientes/novo" className="mt-4 block rounded-xl bg-violet-600 px-4 py-2.5 text-center text-sm font-bold text-white">
                Novo paciente
              </Link>
            </aside>

            {!paciente ? (
              <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <div>
                  <ScanFace className="mx-auto text-violet-500" size={36} />
                  <p className="mt-3 font-bold">Selecione um paciente</p>
                  <p className="mt-1 text-sm text-slate-500">Os procedimentos de HOF dele aparecem aqui.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{paciente.nome}</h2>
                    <p className="text-sm text-slate-500">
                      {[paciente.telefone, paciente.convenio || "Particular"].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm font-semibold">
                    <Link href={`/pacientes/${paciente.id}?aba=prontuario`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2">
                      <FileText size={16} />
                      Prontuário
                    </Link>
                    <Link href={`/documentos?pacienteId=${paciente.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2">
                      Fotos e termos
                    </Link>
                    <Link href={`/agenda/novo?pacienteId=${paciente.id}&paciente=${encodeURIComponent(paciente.nome)}&tipo=Retorno`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2">
                      <CalendarPlus size={16} />
                      Agendar
                    </Link>
                    <a href={linkWhatsApp(paciente.telefone, `Olá, ${paciente.nome.split(" ")[0]}! `)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white">
                      <MessageCircle size={16} />
                      WhatsApp
                    </a>
                  </div>
                </div>

                {mensagem.texto && (
                  <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${mensagem.erro ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {mensagem.texto}
                  </p>
                )}

                <form onSubmit={registrar} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold">Registrar procedimento</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <label className="block md:col-span-2">
                      <span className="text-xs font-semibold text-slate-600">Procedimento</span>
                      <input list="procedimentos-hof" value={form.procedimento} onChange={(event) => atualizarCampo("procedimento", event.target.value)} className={campo} />
                      <datalist id="procedimentos-hof">
                        {procedimentosComuns.map((item) => (
                          <option key={item} value={item} />
                        ))}
                      </datalist>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Região</span>
                      <input value={form.regiao} onChange={(event) => atualizarCampo("regiao", event.target.value)} placeholder="Ex.: lábios, glabela" className={campo} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Data</span>
                      <input type="date" value={form.data} onChange={(event) => atualizarCampo("data", event.target.value)} className={campo} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Produto / marca</span>
                      <input value={form.produto} onChange={(event) => atualizarCampo("produto", event.target.value)} placeholder="Ex.: ácido hialurônico" className={campo} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Lote</span>
                      <input value={form.lote} onChange={(event) => atualizarCampo("lote", event.target.value)} className={campo} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Validade do produto</span>
                      <input type="date" value={form.validade} onChange={(event) => atualizarCampo("validade", event.target.value)} className={campo} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Quantidade (ml / U)</span>
                      <input value={form.quantidade} onChange={(event) => atualizarCampo("quantidade", event.target.value)} className={campo} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Valor (R$)</span>
                      <input inputMode="decimal" value={form.valor} onChange={(event) => atualizarCampo("valor", event.target.value.replace(/[^\d.,]/g, ""))} className={campo} />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Status</span>
                      <select value={form.status} onChange={(event) => atualizarCampo("status", event.target.value)} className={campo}>
                        {statusHof.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-600">Retorno previsto</span>
                      <input type="date" value={form.retorno} onChange={(event) => atualizarCampo("retorno", event.target.value)} className={campo} />
                    </label>
                    <label className="block md:col-span-4">
                      <span className="text-xs font-semibold text-slate-600">Observações</span>
                      <textarea rows={2} value={form.observacoes} onChange={(event) => atualizarCampo("observacoes", event.target.value)} className={campo} />
                    </label>
                  </div>
                  <button type="submit" className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white">
                    Registrar procedimento
                  </button>
                </form>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold">Histórico de HOF</h3>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                        <tr>
                          <th className="pb-3">Data</th>
                          <th className="pb-3">Procedimento</th>
                          <th className="pb-3">Produto e lote</th>
                          <th className="pb-3">Valor</th>
                          <th className="pb-3">Retorno</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {doPaciente.map((item) => {
                          const vencido = Boolean(item.validade && item.validade < item.data);
                          return (
                            <tr key={String(item.id)} className="border-b border-slate-50 align-top">
                              <td className="py-3">{formatarDataBr(item.data)}</td>
                              <td className="py-3">
                                <span className="block font-semibold">{item.procedimento}</span>
                                <span className="text-xs text-slate-500">{[item.regiao, item.quantidade].filter(Boolean).join(" · ")}</span>
                              </td>
                              <td className="py-3">
                                <span className="block">{item.produto || "-"}</span>
                                <span className={`text-xs ${vencido ? "font-bold text-rose-600" : "text-slate-500"}`}>
                                  {item.lote ? `Lote ${item.lote}` : "Sem lote"}
                                  {item.validade ? ` · val. ${formatarDataBr(item.validade)}` : ""}
                                  {vencido && (
                                    <span className="ml-1 inline-flex items-center gap-1">
                                      <AlertTriangle size={12} />
                                      vencido
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="py-3">{item.valor || "-"}</td>
                              <td className="py-3">{item.retorno ? formatarDataBr(item.retorno) : "-"}</td>
                              <td className="py-3">
                                <select
                                  value={item.status}
                                  onChange={(event) => updateProcedimentoHof(item.id, { status: event.target.value as StatusProcedimentoHof })}
                                  className={`rounded-full px-3 py-1 text-xs font-semibold outline-none ${classesStatus[item.status]}`}
                                >
                                  {statusHof.map((status) => (
                                    <option key={status}>{status}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center justify-end gap-3">
                                  {item.valor && (
                                    <Link
                                      href={`/financeiro/novo?pacienteId=${item.pacienteId}&descricao=${encodeURIComponent(item.procedimento)}&valor=${dinheiroParaNumero(item.valor)}`}
                                      className="text-xs font-semibold text-violet-700"
                                    >
                                      Lançar pagamento
                                    </Link>
                                  )}
                                  <button type="button" onClick={() => excluir(item)} aria-label="Excluir procedimento" className="text-rose-600">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {doPaciente.length === 0 && (
                      <p className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                        Nenhum procedimento de HOF registrado para este paciente.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
