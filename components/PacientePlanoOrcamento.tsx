"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  FileText,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import {
  addLancamentoFinanceiro,
  addOrcamento,
  getFinanceiroByPacienteId,
  getOrcamentosByPacienteId,
  updateOrcamento,
  type CliniplusOrcamento,
  type CliniplusPaciente,
  type CliniplusPlanoTratamento,
  type OrcamentoItem,
  type StoreId,
} from "@/utils/cliniplusStore";

type PacientePlanoOrcamentoProps = {
  paciente: CliniplusPaciente;
  planoTratamento: CliniplusPlanoTratamento;
  voltarHref: string;
};

const formasPagamentoPadrao = [
  "Pix",
  "Cartao credito",
  "Cartao debito",
  "Boleto",
  "Dinheiro",
  "Link de pagamento",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) {
    return "Nao informado";
  }

  const data = new Date(value);

  if (Number.isNaN(data.getTime())) {
    return value;
  }

  return data.toLocaleDateString("pt-BR");
}

function addDays(value: string, days: number) {
  const data = new Date(value);
  data.setDate(data.getDate() + days);
  return data.toISOString();
}

function parseMoney(value: string) {
  const parsed = Number(
    value
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

function getInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAge(value?: string) {
  if (!value) {
    return "";
  }

  const parts = value.includes("/")
    ? value.split("/").reverse()
    : value.slice(0, 10).split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hadBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  if (!hadBirthday) {
    age -= 1;
  }

  return age > 0 ? `${age} anos` : "";
}

function createItemFromPlano(
  item: CliniplusPlanoTratamento["itens"][number]
): OrcamentoItem {
  const valorUnitario = Number(item.valor) || 0;

  return {
    id: item.id || String(Date.now()),
    procedimento: item.procedimento || "Procedimento",
    dente: item.dente,
    quantidade: 1,
    valorUnitario,
    desconto: 0,
    valorFinal: valorUnitario,
  };
}

function createEmptyItem(): OrcamentoItem {
  return {
    id: String(Date.now()),
    procedimento: "Novo procedimento",
    dente: "",
    quantidade: 1,
    valorUnitario: 0,
    desconto: 0,
    valorFinal: 0,
  };
}

function getCondicaoTipo(condicao?: string) {
  if (condicao?.startsWith("Parcelado")) {
    return "parcelado";
  }

  if (condicao?.startsWith("Personalizado")) {
    return "personalizado";
  }

  return "avista";
}

function getCondicaoPagamento(
  tipo: string,
  descontoVista: number,
  parcelas: string,
  condicaoManual: string
) {
  if (tipo === "parcelado") {
    return `Parcelado no cartao em ${parcelas}`;
  }

  if (tipo === "personalizado") {
    return `Personalizado: ${condicaoManual || "condicao a definir"}`;
  }

  return `A vista com desconto de ${descontoVista}%`;
}

export default function PacientePlanoOrcamento({
  paciente,
  planoTratamento,
  voltarHref,
}: PacientePlanoOrcamentoProps) {
  const orcamentoSalvo = useMemo(
    () =>
      getOrcamentosByPacienteId(paciente.id).find(
        (orcamento) => orcamento.planoId === planoTratamento.id
      ) ?? null,
    [paciente.id, planoTratamento.id]
  );
  const [orcamentoAtual, setOrcamentoAtual] =
    useState<CliniplusOrcamento | null>(orcamentoSalvo);
  const [itens, setItens] = useState<OrcamentoItem[]>(
    orcamentoSalvo?.itens?.length
      ? orcamentoSalvo.itens
      : planoTratamento.itens.map(createItemFromPlano)
  );
  const [condicaoTipo, setCondicaoTipo] = useState(
    getCondicaoTipo(orcamentoSalvo?.condicaoPagamento)
  );
  const [descontoVista, setDescontoVista] = useState(5);
  const [parcelas, setParcelas] = useState("6x");
  const [condicaoManual, setCondicaoManual] = useState("");
  const [formasPagamento, setFormasPagamento] = useState<string[]>(
    orcamentoSalvo?.formasPagamento?.length
      ? orcamentoSalvo.formasPagamento
      : ["Pix", "Cartao credito", "Cartao debito"]
  );
  const [mensagemPaciente, setMensagemPaciente] = useState(
    orcamentoSalvo?.mensagemPaciente ||
      `Ola, ${paciente.nome}.\n\nConforme conversamos, segue o orcamento detalhado do seu tratamento.\n\nEstou a disposicao para qualquer duvida.\n\nObrigado,\nClinica Sorriso+`
  );
  const [mensagem, setMensagem] = useState("");
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [status, setStatus] = useState<
    CliniplusOrcamento["status"]
  >(orcamentoSalvo?.status || "rascunho");

  useEffect(() => {
    const salvo =
      getOrcamentosByPacienteId(paciente.id).find(
        (orcamento) => orcamento.planoId === planoTratamento.id
      ) ?? null;

    if (salvo) {
      setOrcamentoAtual(salvo);
      setItens(salvo.itens);
      setFormasPagamento(salvo.formasPagamento);
      setMensagemPaciente(salvo.mensagemPaciente);
      setStatus(salvo.status);
      setCondicaoTipo(getCondicaoTipo(salvo.condicaoPagamento));
    }
  }, [paciente.id, planoTratamento.id]);

  const criadoEm = orcamentoAtual?.criadoEm || new Date().toISOString();
  const validade = addDays(criadoEm, 30);
  const numero = orcamentoAtual?.numero || "ORC-000123";
  const nascimento = paciente.dataNascimento || paciente.nascimento;
  const idade = getAge(nascimento);
  const genero = paciente.genero || paciente.sexo;

  const resumo = useMemo(() => {
    const subtotal = itens.reduce(
      (total, item) => total + item.quantidade * item.valorUnitario,
      0
    );
    const descontosItens = itens.reduce((total, item) => total + item.desconto, 0);
    const base = Math.max(0, subtotal - descontosItens);
    const descontoCondicao =
      condicaoTipo === "avista" ? base * (descontoVista / 100) : 0;
    const descontos = descontosItens + descontoCondicao;
    const total = Math.max(0, subtotal - descontos);
    const entrada = total * 0.2;

    return {
      subtotal,
      descontos,
      total,
      entrada,
      valorRestante: Math.max(0, total - entrada),
    };
  }, [condicaoTipo, descontoVista, itens]);

  function updateItem(id: string, dados: Partial<OrcamentoItem>) {
    setItens((atuais) =>
      atuais.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const proximo = { ...item, ...dados };
        return {
          ...proximo,
          valorFinal: Math.max(
            0,
            proximo.quantidade * proximo.valorUnitario - proximo.desconto
          ),
        };
      })
    );
  }

  function toggleFormaPagamento(forma: string) {
    setFormasPagamento((atuais) =>
      atuais.includes(forma)
        ? atuais.filter((item) => item !== forma)
        : [...atuais, forma]
    );
  }

  function getPayload(statusProximo: CliniplusOrcamento["status"]) {
    return {
      pacienteId: paciente.id,
      origem: "plano" as const,
      planoId: planoTratamento.id,
      status: statusProximo,
      itens,
      subtotal: resumo.subtotal,
      descontos: resumo.descontos,
      total: resumo.total,
      entrada: resumo.entrada,
      valorRestante: resumo.valorRestante,
      condicaoPagamento: getCondicaoPagamento(
        condicaoTipo,
        descontoVista,
        parcelas,
        condicaoManual
      ),
      formasPagamento,
      mensagemPaciente,
    };
  }

  function salvarOrcamento(statusProximo: CliniplusOrcamento["status"]) {
    const payload = getPayload(statusProximo);

    if (orcamentoAtual) {
      updateOrcamento(orcamentoAtual.id, payload);
      const atualizado = {
        ...orcamentoAtual,
        ...payload,
        atualizadoEm: new Date().toISOString(),
      };
      setOrcamentoAtual(atualizado);
      setStatus(statusProximo);
      return atualizado;
    }

    const criado = addOrcamento(payload);
    setOrcamentoAtual(criado);
    setStatus(statusProximo);
    return criado;
  }

  function salvarRascunho() {
    salvarOrcamento("rascunho");
    setMensagem("Orcamento salvo como rascunho.");
  }

  function enviarPaciente() {
    salvarOrcamento("enviado");
    setMensagem("Orcamento enviado para o paciente.");
  }

  function aprovarECriarCobranca() {
    const orcamento = salvarOrcamento("aprovado");
    const descricao = `Orcamento aprovado ${orcamento.numero}`;
    const jaExiste = getFinanceiroByPacienteId(paciente.id).some(
      (lancamento) => lancamento.descricao === descricao
    );

    if (!jaExiste) {
      addLancamentoFinanceiro({
        pacienteId: paciente.id,
        paciente: paciente.nome,
        descricao,
        tipo: "Receita",
        valor: formatMoney(resumo.total),
        status: "Pendente",
        data: new Date().toISOString().slice(0, 10),
        origem: "Orcamento/plano de tratamento",
      });
    }

    setMensagem("Orcamento aprovado e cobranca criada/preparada no Financeiro.");
  }

  function previewPdf() {
    setMostrarPreview(true);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-black text-indigo-700">
            <Link href="/prontuario">Prontuarios</Link>
            <span>&gt;</span>
            <span>{paciente.nome}</span>
            <span>&gt;</span>
            <Link href={voltarHref}>Plano de tratamento</Link>
            <span>&gt;</span>
            <span className="text-slate-700">Orcamento</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-950">Orcamento</h1>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
              {status === "rascunho" ? "Rascunho" : status}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Revise os valores e condicoes antes de enviar para o paciente.
          </p>
        </div>
        <Link
          href={voltarHref}
          className="inline-flex h-10 items-center justify-center rounded-lg text-sm font-black text-indigo-700 hover:text-indigo-900"
        >
          Voltar para o plano de tratamento
        </Link>
      </div>

      {mensagem && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
          {mensagem}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-2xl font-black text-indigo-700">
                {getInitials(paciente.nome)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black text-slate-950">
                  {paciente.nome}
                </h2>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  {[idade, genero, formatDate(nascimento)].filter(Boolean).join(" - ") ||
                    "Dados pessoais nao informados"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {[paciente.telefone, paciente.email].filter(Boolean).join(" - ")}
                </p>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[360px]">
                <div>
                  <p className="text-xs font-black text-slate-400">Codigo</p>
                  <p className="mt-1 font-black text-slate-900">#{paciente.id}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400">Convenio</p>
                  <p className="mt-1 font-black text-slate-900">
                    {paciente.convenio || "Particular"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400">Plano</p>
                  <p className="mt-1 font-black text-slate-900">
                    {paciente.planoConvenio || "Nao informado"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-black text-slate-950">Itens do orcamento</h2>
              <button
                type="button"
                onClick={() => setItens((atuais) => [...atuais, createEmptyItem()])}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-black text-indigo-700"
              >
                <Pencil size={14} />
                Adicionar item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Procedimento</th>
                    <th className="px-4 py-3">Dente / Regiao</th>
                    <th className="px-4 py-3">Qtd.</th>
                    <th className="px-4 py-3">Valor unitario</th>
                    <th className="px-4 py-3">Desconto</th>
                    <th className="px-4 py-3">Valor final</th>
                    <th className="px-4 py-3">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itens.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-3">
                        <input
                          value={item.procedimento}
                          onChange={(event) =>
                            updateItem(item.id, { procedimento: event.target.value })
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={item.dente || ""}
                          onChange={(event) =>
                            updateItem(item.id, { dente: event.target.value })
                          }
                          className="h-10 w-28 rounded-lg border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          value={item.quantidade}
                          onChange={(event) =>
                            updateItem(item.id, {
                              quantidade: Math.max(1, Number(event.target.value) || 1),
                            })
                          }
                          className="h-10 w-20 rounded-lg border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={String(item.valorUnitario)}
                          onChange={(event) =>
                            updateItem(item.id, {
                              valorUnitario: parseMoney(event.target.value),
                            })
                          }
                          className="h-10 w-32 rounded-lg border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={String(item.desconto)}
                          onChange={(event) =>
                            updateItem(item.id, {
                              desconto: parseMoney(event.target.value),
                            })
                          }
                          className="h-10 w-28 rounded-lg border border-slate-200 px-3 font-semibold text-emerald-700 outline-none focus:border-indigo-300"
                        />
                      </td>
                      <td className="px-4 py-3 font-black text-slate-900">
                        {formatMoney(item.valorFinal)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setItens((atuais) =>
                              atuais.filter((atual) => atual.id !== item.id)
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                          title="Excluir item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setItens((atuais) => [...atuais, createEmptyItem()])}
                className="text-sm font-black text-indigo-700"
              >
                + Adicionar procedimento
              </button>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-black text-slate-950">
                Mensagem para o paciente (opcional)
              </h2>
              <textarea
                value={mensagemPaciente}
                rows={9}
                onChange={(event) => setMensagemPaciente(event.target.value)}
                className="mt-4 w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold leading-relaxed outline-none focus:border-indigo-300"
              />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-black text-slate-950">
                  Pre-visualizacao do orcamento
                </h2>
                <button
                  type="button"
                  onClick={previewPdf}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-black text-indigo-700"
                >
                  <FileText size={14} />
                  Visualizar PDF
                </button>
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <strong className="text-lg text-indigo-700">Clini+</strong>
                  <span className="font-black text-slate-700">{numero}</span>
                </div>
                <p className="mt-3 font-black text-slate-900">{paciente.nome}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Data: {formatDate(criadoEm)} - Validade: {formatDate(validade)}
                </p>
                <div className="mt-4 space-y-2">
                  {itens.slice(0, 4).map((item) => (
                    <div
                      key={`preview-${item.id}`}
                      className="flex justify-between gap-3 text-xs font-semibold text-slate-600"
                    >
                      <span className="truncate">{item.procedimento}</span>
                      <strong>{formatMoney(item.valorFinal)}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 font-black text-slate-950">
                  <span>Total</span>
                  <span>{formatMoney(resumo.total)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-slate-400">Orcamento</p>
            <h2 className="mt-1 text-lg font-black text-indigo-700">{numero}</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
              <p>Data de criacao: {formatDate(criadoEm)}</p>
              <p>Validade: {formatDate(validade)}</p>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">Resumo financeiro</h2>
            <div className="mt-4 space-y-3 text-sm">
              <FinanceLine label="Subtotal" value={formatMoney(resumo.subtotal)} />
              <FinanceLine
                label="Descontos"
                value={`- ${formatMoney(resumo.descontos)}`}
                tone="green"
              />
              <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-black text-indigo-700">
                <span>Total</span>
                <span>{formatMoney(resumo.total)}</span>
              </div>
              <FinanceLine label="Entrada (20%)" value={formatMoney(resumo.entrada)} />
              <FinanceLine
                label="Valor restante"
                value={formatMoney(resumo.valorRestante)}
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">Condicoes de pagamento</h2>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block rounded-lg border border-slate-200 p-3">
                <span className="flex items-center gap-2 font-black text-slate-800">
                  <input
                    type="radio"
                    checked={condicaoTipo === "avista"}
                    onChange={() => setCondicaoTipo("avista")}
                  />
                  A vista com desconto
                </span>
                {condicaoTipo === "avista" && (
                  <div className="mt-3 grid grid-cols-[90px_1fr] items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={descontoVista}
                      onChange={(event) =>
                        setDescontoVista(Number(event.target.value) || 0)
                      }
                      className="h-9 rounded-lg border border-slate-200 px-3 font-semibold outline-none"
                    />
                    <span className="font-bold text-emerald-700">
                      Total: {formatMoney(resumo.total)}
                    </span>
                  </div>
                )}
              </label>

              <label className="block rounded-lg border border-slate-200 p-3">
                <span className="flex items-center gap-2 font-black text-slate-800">
                  <input
                    type="radio"
                    checked={condicaoTipo === "parcelado"}
                    onChange={() => setCondicaoTipo("parcelado")}
                  />
                  Parcelado no cartao
                </span>
                {condicaoTipo === "parcelado" && (
                  <div className="mt-3 grid grid-cols-[90px_1fr] items-center gap-3">
                    <select
                      value={parcelas}
                      onChange={(event) => setParcelas(event.target.value)}
                      className="h-9 rounded-lg border border-slate-200 px-3 font-semibold outline-none"
                    >
                      {["2x", "3x", "6x", "10x", "12x"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                    <span className="font-bold text-slate-700">
                      {formatMoney(resumo.total / Number.parseInt(parcelas, 10))}
                    </span>
                  </div>
                )}
              </label>

              <label className="block rounded-lg border border-slate-200 p-3">
                <span className="flex items-center gap-2 font-black text-slate-800">
                  <input
                    type="radio"
                    checked={condicaoTipo === "personalizado"}
                    onChange={() => setCondicaoTipo("personalizado")}
                  />
                  Personalizado
                </span>
                {condicaoTipo === "personalizado" && (
                  <input
                    value={condicaoManual}
                    onChange={(event) => setCondicaoManual(event.target.value)}
                    placeholder="Definir condicoes"
                    className="mt-3 h-9 w-full rounded-lg border border-slate-200 px-3 font-semibold outline-none"
                  />
                )}
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">
              Formas de pagamento aceitas
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black">
              {formasPagamentoPadrao.map((forma) => {
                const active = formasPagamento.includes(forma);

                return (
                  <button
                    key={forma}
                    type="button"
                    onClick={() => toggleFormaPagamento(forma)}
                    className={
                      active
                        ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-2 text-indigo-700"
                        : "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-2 text-slate-600"
                    }
                  >
                    <CreditCard size={14} />
                    {forma}
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      <div className="sticky bottom-0 z-10 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={voltarHref}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700"
          >
            Cancelar
          </Link>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={salvarRascunho}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-indigo-200 px-4 text-sm font-black text-indigo-700"
            >
              Salvar rascunho
            </button>
            <button
              type="button"
              onClick={previewPdf}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 text-sm font-black text-indigo-700"
            >
              <FileText size={16} />
              Pre-visualizar PDF
            </button>
            <button
              type="button"
              onClick={enviarPaciente}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 text-sm font-black text-indigo-700"
            >
              <Send size={16} />
              Enviar para o paciente
            </button>
            <button
              type="button"
              onClick={aprovarECriarCobranca}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white hover:bg-indigo-700"
            >
              <CheckCircle2 size={16} />
              Aprovar orcamento e criar cobranca
            </button>
          </div>
        </div>
      </div>

      {mostrarPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Pre-visualizacao do orcamento
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {numero} - {paciente.nome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarPreview(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-700"
              >
                Fechar
              </button>
            </div>
            <div className="mt-6 rounded-lg border border-slate-200 p-5">
              <div className="flex justify-between border-b border-slate-100 pb-4">
                <strong className="text-xl text-indigo-700">Clini+</strong>
                <span className="font-black">{numero}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
                <span>Paciente: {paciente.nome}</span>
                <span>Data: {formatDate(criadoEm)}</span>
                <span>Validade: {formatDate(validade)}</span>
              </div>
              <div className="mt-5 space-y-2">
                {itens.map((item) => (
                  <div
                    key={`modal-${item.id}`}
                    className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm"
                  >
                    <span>{item.procedimento}</span>
                    <strong>{formatMoney(item.valorFinal)}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-between text-xl font-black text-indigo-700">
                <span>Total</span>
                <span>{formatMoney(resumo.total)}</span>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-black text-white"
              >
                Imprimir / salvar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FinanceLine({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green";
}) {
  return (
    <div className="flex justify-between gap-3 font-bold text-slate-700">
      <span>{label}</span>
      <span className={tone === "green" ? "text-emerald-700" : "text-slate-950"}>
        {value}
      </span>
    </div>
  );
}
