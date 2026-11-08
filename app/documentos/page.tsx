"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Download, Eye, FileText, Trash2, Upload } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  addDocumento,
  deleteDocumento,
  getDocumentos,
  getPacientes,
  type CliniplusDocumento,
  type CliniplusPaciente,
} from "@/utils/cliniplusStore";
import {
  TIPOS_ACEITOS,
  abrirArquivo,
  baixarArquivo,
  extensaoDoArquivo,
  formatarTamanho,
  salvarArquivo,
  validarArquivo,
} from "@/utils/arquivos";
import { formatarDataBr } from "@/utils/datas";
import { normalizarTexto } from "@/utils/format";

const tiposDocumento = [
  "Radiografia",
  "Foto clínica",
  "Termo",
  "Exame",
  "Receita / Atestado",
  "Documento pessoal",
  "Carteirinha",
  "Outros",
];

const coresTipo: Record<string, string> = {
  Radiografia: "bg-cyan-100 text-cyan-700",
  "Foto clínica": "bg-purple-100 text-purple-700",
  Termo: "bg-amber-100 text-amber-700",
  Exame: "bg-sky-100 text-sky-700",
};

function categoriaDoDocumento(documento: CliniplusDocumento) {
  const texto = normalizarTexto(`${documento.tipo} ${documento.categoria} ${documento.nome}`);
  if (texto.includes("radiograf") || texto.includes("raio")) return "Radiografia";
  if (texto.includes("foto") || texto.includes("selfie")) return "Foto clínica";
  if (texto.includes("termo") || texto.includes("consentimento") || texto.includes("contrato")) return "Termo";
  if (texto.includes("exame")) return "Exame";
  if (texto.includes("receita") || texto.includes("atestado")) return "Receita / Atestado";
  if (texto.includes("carteirinha")) return "Carteirinha";
  if (texto.includes("documento pessoal") || texto.includes("rg") || texto.includes("cnh")) return "Documento pessoal";
  return "Outros";
}

const formularioVazio = { pacienteId: "", tipo: tiposDocumento[0], nome: "", observacao: "" };

export default function Documentos() {
  const [documentos, setDocumentos] = useState<CliniplusDocumento[]>([]);
  const [pacientes, setPacientes] = useState<CliniplusPaciente[]>([]);
  const [pacienteFiltro, setPacienteFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(formularioVazio);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState({ texto: "", erro: false });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    function carregar() {
      setDocumentos(getDocumentos());
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
    () => documentos.filter((item) => !pacienteFiltro || String(item.pacienteId) === pacienteFiltro),
    [documentos, pacienteFiltro]
  );

  const lista = useMemo(() => {
    const termo = normalizarTexto(busca);
    return doPaciente
      .filter((item) => tipoFiltro === "Todos" || categoriaDoDocumento(item) === tipoFiltro)
      .filter((item) => {
        if (!termo) return true;
        const nome = nomePorPaciente.get(String(item.pacienteId)) || item.paciente || "";
        return normalizarTexto(`${item.nome} ${item.observacao} ${nome}`).includes(termo);
      })
      .sort((a, b) => (b.criadoEm || b.data || "").localeCompare(a.criadoEm || a.data || ""));
  }, [busca, doPaciente, nomePorPaciente, tipoFiltro]);

  const contar = (tipo: string) => doPaciente.filter((item) => categoriaDoDocumento(item) === tipo).length;
  const nomePaciente = pacienteFiltro ? nomePorPaciente.get(pacienteFiltro) : "";

  function avisar(texto: string, erro = false) {
    setMensagem({ texto, erro });
  }

  function escolherArquivo(selecionado: File | undefined) {
    if (!selecionado) return;
    const problema = validarArquivo(selecionado);
    if (problema) {
      avisar(problema, true);
      return;
    }
    setArquivo(selecionado);
    setForm((atual) => ({ ...atual, nome: atual.nome || selecionado.name.replace(/\.[^.]+$/, "") }));
    avisar("");
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.pacienteId) return avisar("Escolha o paciente.", true);
    if (!arquivo) return avisar("Escolha o arquivo.", true);

    setEnviando(true);
    try {
      const salvo = await salvarArquivo(arquivo, form.pacienteId);
      addDocumento({
        pacienteId: form.pacienteId,
        paciente: nomePorPaciente.get(form.pacienteId),
        nome: form.nome.trim() || arquivo.name,
        tipo: form.tipo,
        categoria: form.tipo,
        observacao: form.observacao.trim() || arquivo.name,
        origem: "Documentos",
        status: "Anexado",
        arquivoId: salvo.id,
        formato: extensaoDoArquivo(arquivo.name),
        extensao: extensaoDoArquivo(arquivo.name),
        tamanho: formatarTamanho(arquivo.size),
      });
      setArquivo(null);
      setForm({ ...formularioVazio, pacienteId: form.pacienteId, tipo: form.tipo });
      avisar("Documento enviado.");
    } catch {
      avisar("Não foi possível guardar o arquivo neste navegador.", true);
    } finally {
      setEnviando(false);
    }
  }

  async function abrir(documento: CliniplusDocumento, baixar = false) {
    if (!documento.arquivoId) return;
    const ok = baixar ? await baixarArquivo(documento.arquivoId) : await abrirArquivo(documento.arquivoId);
    if (!ok) avisar("O arquivo não está neste navegador. Ele pode ter sido enviado em outro computador.", true);
  }

  function excluir(documento: CliniplusDocumento) {
    if (!window.confirm(`Excluir "${documento.nome}"? O arquivo também será apagado.`)) return;
    deleteDocumento(documento.id);
    avisar("Documento excluído.");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Documentos" />

        <section className="min-w-0 flex-1 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h2 className="text-3xl font-bold">{nomePaciente ? `Documentos de ${nomePaciente}` : "Documentos"}</h2>
              <p className="mt-1 text-slate-500">
                Radiografias, fotos clínicas, termos, exames e arquivos dos pacientes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
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
              {pacienteFiltro && (
                <Link
                  href={`/pacientes/${pacienteFiltro}?aba=prontuario&secao=documentos`}
                  className="inline-flex h-12 items-center rounded-xl bg-white px-5 text-sm font-semibold text-cyan-700 ring-1 ring-slate-200"
                >
                  Ver prontuário
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            {[
              ["Total de documentos", String(doPaciente.length), nomePaciente ? "Deste paciente" : "Todos os pacientes"],
              ["Radiografias", String(contar("Radiografia")), "Exames de imagem"],
              ["Fotos clínicas", String(contar("Foto clínica")), "Intraoral e antes/depois"],
              ["Termos", String(contar("Termo")), "Consentimentos e contratos"],
            ].map(([titulo, valor, detalhe]) => (
              <div key={titulo} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{titulo}</p>
                <h3 className="mt-3 text-3xl font-bold">{valor}</h3>
                <p className="mt-1 text-xs text-slate-400">{detalhe}</p>
              </div>
            ))}
          </div>

          {mensagem.texto && (
            <p className={`mt-6 rounded-xl px-4 py-3 text-sm font-semibold ${mensagem.erro ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
              {mensagem.texto}
            </p>
          )}

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <h3 className="text-xl font-bold">Arquivos</h3>
                <div className="flex flex-wrap gap-3">
                  <input
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar documento ou paciente"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  />
                  <select
                    value={tipoFiltro}
                    onChange={(event) => setTipoFiltro(event.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  >
                    <option>Todos</option>
                    {tiposDocumento.map((tipo) => (
                      <option key={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {lista.map((documento) => {
                  const categoria = categoriaDoDocumento(documento);
                  return (
                    <div key={String(documento.id)} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:flex-row lg:items-center">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700">
                          <FileText size={20} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="truncate font-bold">{documento.nome}</h4>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${coresTipo[categoria] || "bg-slate-200 text-slate-700"}`}>
                              {categoria}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {nomePorPaciente.get(String(documento.pacienteId)) || documento.paciente || "Paciente removido"} ·{" "}
                            {formatarDataBr(documento.dataEnvio || documento.data)}
                            {documento.arquivoId ? ` · ${documento.formato} · ${documento.tamanho}` : " · registro sem arquivo"}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {documento.arquivoId && (
                          <>
                            <button type="button" onClick={() => abrir(documento)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                              <Eye size={16} />
                              Visualizar
                            </button>
                            <button type="button" onClick={() => abrir(documento, true)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700">
                              <Download size={16} />
                              Baixar
                            </button>
                          </>
                        )}
                        <button type="button" onClick={() => excluir(documento)} aria-label="Excluir documento" className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3 py-2 text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {lista.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="font-bold">Nenhum documento encontrado</p>
                    <p className="mt-1 text-sm text-slate-500">Envie o primeiro arquivo pelo formulário ao lado.</p>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={enviar} className="h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold">Enviar documento</h3>
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold">Paciente</span>
                  <select
                    value={form.pacienteId}
                    onChange={(event) => setForm({ ...form, pacienteId: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  >
                    <option value="">Selecione</option>
                    {pacientes.map((paciente) => (
                      <option key={String(paciente.id)} value={String(paciente.id)}>
                        {paciente.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Tipo</span>
                  <select
                    value={form.tipo}
                    onChange={(event) => setForm({ ...form, tipo: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  >
                    {tiposDocumento.map((tipo) => (
                      <option key={tipo}>{tipo}</option>
                    ))}
                  </select>
                </label>
                <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 p-5 text-center hover:border-cyan-400">
                  <input
                    type="file"
                    accept={TIPOS_ACEITOS}
                    className="sr-only"
                    onChange={(event) => {
                      escolherArquivo(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                  <Upload className="mx-auto text-cyan-700" size={22} />
                  <p className="mt-2 truncate text-sm font-semibold">{arquivo ? arquivo.name : "Escolher arquivo"}</p>
                  <p className="text-xs text-slate-500">
                    {arquivo ? formatarTamanho(arquivo.size) : "PDF, JPG, PNG ou WEBP até 15 MB"}
                  </p>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Nome do documento</span>
                  <input
                    value={form.nome}
                    onChange={(event) => setForm({ ...form, nome: event.target.value })}
                    placeholder="Ex.: Panorâmica inicial"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Observação</span>
                  <textarea
                    rows={2}
                    value={form.observacao}
                    onChange={(event) => setForm({ ...form, observacao: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {enviando ? "Enviando..." : "Enviar documento"}
                </button>
                <p className="text-xs text-slate-500">
                  Os arquivos ficam guardados neste navegador e são apagados junto com o paciente.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
