"use client";

import { useState } from "react";
import { usePatientLiveData } from "@/components/PatientLiveProvider";
import type { Lancamento } from "@/types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const treatmentStatusOptions = [
  "Planejado",
  "Em tratamento",
  "Urgente",
  "Concluído",
  "Retorno pendente",
];

const financeStatusOptions = [
  "Em dia",
  "Aguardando",
  "Pendente",
  "Pago",
  "Aguardando convênio",
  "Recebido do convênio",
  "Glosado",
  "Recusado",
  "Sem financeiro",
];

const financeEntryStatusOptions = [
  "Pendente",
  "Pago",
  "Aguardando convênio",
  "Recebido do convênio",
  "Glosado",
  "Cancelado",
];

const financeTypeOptions = ["Receita", "Despesa", "Ajuste"];

const historyStatusOptions = [
  "Registrado",
  "Concluído",
  "Anexado",
  "Em acompanhamento",
  "Pendente",
];

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileDetail(file: File) {
  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toUpperCase()
    : "";

  return `${extension || file.type || "Arquivo"} • ${formatFileSize(
    file.size
  )}`;
}

function parseMoney(value: string) {
  const numeric = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number.parseFloat(numeric);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getFinanceBadgeClass(status: string) {
  if (status === "Pago" || status === "Recebido do convênio" || status === "Em dia") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Pendente" || status === "Aguardando" || status === "Aguardando convênio") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Glosado" || status === "Recusado" || status === "Cancelado") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export function PatientTreatmentsEditor({ pacienteId }: { pacienteId: number }) {
  const { data, save } = usePatientLiveData(pacienteId);
  const [draft, setDraft] = useState(() => clone(data.treatments));
  const persist = (next: typeof draft) => {
    setDraft(next);
    save({ ...data, treatments: next });
  };

  return (
    <div className="mt-5 space-y-4">
      {draft.map((item, index) => (
        <div key={index} className="rounded-3xl bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <label className="md:col-span-2">
              <span className="text-sm font-semibold">Tratamento</span>
              <input
                value={item.nome}
                onChange={(event) => {
                  const next = [...draft];
                  next[index] = { ...item, nome: event.target.value };
                  persist(next);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              />
            </label>
            <label>
              <span className="text-sm font-semibold">Progresso</span>
              <input
                value={item.progresso}
                onChange={(event) => {
                  const next = [...draft];
                  next[index] = { ...item, progresso: event.target.value };
                  persist(next);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              />
            </label>
            <label>
              <span className="text-sm font-semibold">Status</span>
              <select
                value={item.status}
                onChange={(event) => {
                  const next = [...draft];
                  next[index] = { ...item, status: event.target.value };
                  persist(next);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              >
                {treatmentStatusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="md:col-span-4">
              <span className="text-sm font-semibold">Detalhe</span>
              <input
                value={item.detalhe}
                onChange={(event) => {
                  const next = [...draft];
                  next[index] = { ...item, detalhe: event.target.value };
                  persist(next);
                }}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              />
            </label>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            persist([
              ...draft,
              {
                nome: "Novo tratamento",
                progresso: "0%",
                status: "Planejado",
                detalhe: "Detalhe do tratamento",
              },
            ])
          }
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
        >
          Adicionar tratamento
        </button>
      </div>
    </div>
  );
}

export function PatientFinanceEditor({
  pacienteId,
  lancamentosIniciais = [],
  convenioPadrao = "Particular",
}: {
  pacienteId: number;
  lancamentosIniciais?: Lancamento[];
  convenioPadrao?: string;
}) {
  const { data, save } = usePatientLiveData(pacienteId);
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [draft, setDraft] = useState(() => {
    const lancamentosVivos = data.finance.lancamentos.length
      ? data.finance.lancamentos
      : lancamentosIniciais.map((item) => ({
          id: item.id,
          descricao: item.descricao,
          tipo: item.tipo,
          valor: item.valor,
          vencimento: item.previsaoRecebimento || "",
          status: item.status,
          origem: item.origem || "Não informado",
        }));

    return {
      ...data.finance,
      convenio: data.finance.convenio || convenioPadrao,
      lancamentos: lancamentosVivos,
    };
  });

  const totalLancado = draft.lancamentos.reduce(
    (total, item) => total + parseMoney(item.valor),
    0
  );
  const totalRecebido = draft.lancamentos
    .filter(
      (item) => item.status === "Pago" || item.status === "Recebido do convênio"
    )
    .reduce((total, item) => total + parseMoney(item.valor), 0);
  const totalPendente = Math.max(totalLancado - totalRecebido, 0);
  const lancamentosPendentes = draft.lancamentos.filter(
    (item) =>
      item.status === "Pendente" ||
      item.status === "Aguardando convênio" ||
      item.status === "Aguardando"
  ).length;

  function updateField(key: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateLancamento(
    index: number,
    key: keyof (typeof draft.lancamentos)[number],
    value: string
  ) {
    setDraft((current) => {
      const lancamentos = [...current.lancamentos];
      lancamentos[index] = { ...lancamentos[index], [key]: value };
      return { ...current, lancamentos };
    });
  }

  function adicionarLancamento() {
    setDraft((current) => ({
      ...current,
      lancamentos: [
        ...current.lancamentos,
        {
          id: Date.now(),
          descricao: "Novo lançamento",
          tipo: "Receita",
          valor: "R$ 0,00",
          vencimento: "",
          status: "Pendente",
          origem: current.formaPagamento || "Particular",
        },
      ],
    }));
    setIsEditing(true);
    setSavedMessage("");
  }

  function removerLancamento(index: number) {
    setDraft((current) => ({
      ...current,
      lancamentos: current.lancamentos.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
    setSavedMessage("");
  }

  function resetDraft() {
    setDraft({ ...data.finance });
    setIsEditing(false);
    setSavedMessage("");
  }

  function salvarFinanceiro() {
    const totalGasto =
      totalLancado > 0 ? formatMoney(totalLancado) : draft.totalGasto;
    const status =
      draft.status === "Sem financeiro" && draft.lancamentos.length > 0
        ? lancamentosPendentes > 0
          ? "Pendente"
          : "Em dia"
        : draft.status;
    const detalhe =
      lancamentosPendentes > 0
        ? `${lancamentosPendentes} lançamento(s) pendente(s)`
        : "Nenhuma pendência";
    const nextFinance = { ...draft, totalGasto, status, detalhe };

    setDraft(nextFinance);
    save({ ...data, finance: nextFinance });
    setIsEditing(false);
    setSavedMessage("Financeiro salvo.");
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-3xl bg-slate-50 p-5 lg:flex-row lg:items-center">
        <div>
          <h4 className="text-lg font-bold">Painel financeiro do paciente</h4>
          <p className="mt-1 text-sm text-slate-500">
            Lançamentos, pagamentos, convênio e pendências ficam salvos neste
            paciente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={adicionarLancamento}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            + Adicionar lançamento
          </button>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setSavedMessage("");
              }}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Editar financeiro
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarFinanceiro}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {savedMessage && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {savedMessage}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl bg-cyan-50 p-5">
          <p className="text-sm text-cyan-700">Total lançado</p>
          <h4 className="mt-2 text-2xl font-bold text-cyan-900">
            {formatMoney(totalLancado)}
          </h4>
        </div>
        <div className="rounded-3xl bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">Recebido</p>
          <h4 className="mt-2 text-2xl font-bold text-emerald-800">
            {formatMoney(totalRecebido)}
          </h4>
        </div>
        <div className="rounded-3xl bg-amber-50 p-5">
          <p className="text-sm text-amber-700">Em aberto</p>
          <h4 className="mt-2 text-2xl font-bold text-amber-800">
            {formatMoney(totalPendente)}
          </h4>
        </div>
        <div className="rounded-3xl bg-slate-100 p-5">
          <p className="text-sm text-slate-500">Status</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${getFinanceBadgeClass(
              draft.status
            )}`}
          >
            {draft.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl bg-slate-50 p-5 md:grid-cols-3">
        <label>
          <span className="text-sm font-semibold">Status financeiro</span>
          <select
            value={draft.status}
            disabled={!isEditing}
            onChange={(event) => updateField("status", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
          >
            {financeStatusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-semibold">Forma de pagamento</span>
          <input
            value={draft.formaPagamento}
            disabled={!isEditing}
            onChange={(event) => updateField("formaPagamento", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
          />
        </label>
        <label>
          <span className="text-sm font-semibold">Convênio / origem</span>
          <input
            value={draft.convenio}
            disabled={!isEditing}
            onChange={(event) => updateField("convenio", event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
          />
        </label>
        <label>
          <span className="text-sm font-semibold">Guia</span>
          <input
            value={draft.guia}
            disabled={!isEditing}
            onChange={(event) => updateField("guia", event.target.value)}
            placeholder="Ex: GUIA-10245"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
          />
        </label>
        <label>
          <span className="text-sm font-semibold">Autorização</span>
          <input
            value={draft.autorizacao}
            disabled={!isEditing}
            onChange={(event) => updateField("autorizacao", event.target.value)}
            placeholder="Ex: AUT-8891"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
          />
        </label>
        <label>
          <span className="text-sm font-semibold">Previsão de recebimento</span>
          <input
            value={draft.previsaoRecebimento}
            disabled={!isEditing}
            onChange={(event) =>
              updateField("previsaoRecebimento", event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
          />
        </label>
      </div>

      <div className="rounded-3xl bg-white">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold">Lançamentos</h4>
          <p className="text-sm text-slate-500">
            {draft.lancamentos.length} item(ns)
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {draft.lancamentos.map((lancamento, index) => (
            <div key={lancamento.id} className="rounded-3xl bg-slate-50 p-5">
              <div className="grid gap-4 lg:grid-cols-[1.4fr_120px_150px_180px_1fr_110px]">
                <label>
                  <span className="text-xs font-semibold text-slate-500">
                    Descrição
                  </span>
                  <input
                    value={lancamento.descricao}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateLancamento(index, "descricao", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none disabled:bg-slate-100"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-500">
                    Tipo
                  </span>
                  <select
                    value={lancamento.tipo}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateLancamento(index, "tipo", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none disabled:bg-slate-100"
                  >
                    {financeTypeOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-500">
                    Valor
                  </span>
                  <input
                    value={lancamento.valor}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateLancamento(index, "valor", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold outline-none disabled:bg-slate-100"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-500">
                    Status
                  </span>
                  <select
                    value={lancamento.status}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateLancamento(index, "status", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none disabled:bg-slate-100"
                  >
                    {financeEntryStatusOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-semibold text-slate-500">
                    Vencimento / previsão
                  </span>
                  <input
                    value={lancamento.vencimento}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateLancamento(index, "vencimento", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none disabled:bg-slate-100"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => removerLancamento(index)}
                    className="w-full rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getFinanceBadgeClass(
                    lancamento.status
                  )}`}
                >
                  {lancamento.status}
                </span>
                <label className="flex-1">
                  <input
                    value={lancamento.origem}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateLancamento(index, "origem", event.target.value)
                    }
                    className="w-full rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 outline-none disabled:bg-slate-100"
                  />
                </label>
              </div>
            </div>
          ))}

          {draft.lancamentos.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <h4 className="text-lg font-bold">Nenhum lançamento cadastrado</h4>
              <p className="mt-2 text-sm text-slate-500">
                Clique em adicionar lançamento para iniciar o financeiro deste
                paciente.
              </p>
            </div>
          )}
        </div>
      </div>

      <label className="block rounded-3xl bg-slate-50 p-5">
        <span className="text-sm font-semibold">Observações financeiras</span>
        <textarea
          value={draft.observacoes}
          disabled={!isEditing}
          onChange={(event) => updateField("observacoes", event.target.value)}
          className="mt-2 h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none disabled:bg-slate-100"
        />
      </label>

      {isEditing && (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={resetDraft}
            className="rounded-xl border border-slate-200 px-5 py-3 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvarFinanceiro}
            className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white"
          >
            Salvar alterações
          </button>
        </div>
      )}
    </div>
  );
}

export function PatientDocumentsEditor({ pacienteId }: { pacienteId: number }) {
  const { data, save } = usePatientLiveData(pacienteId);
  const [draft, setDraft] = useState(() => clone(data.documents));
  const persist = (next: typeof draft) => {
    setDraft(next);
    save({ ...data, documents: next });
  };

  return (
    <div className="mt-5 space-y-4">
      {draft.map((item, index) => (
        <div key={index} className="rounded-3xl bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={item.nome}
              readOnly
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none"
            />
            <label className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-cyan-700">
              Selecionar arquivo
              <input
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  const next = [...draft];
                  next[index] = {
                    nome: file.name,
                    detalhe: getFileDetail(file),
                  };
                  persist(next);
                }}
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-slate-500">{item.detalhe}</p>
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            persist([
              ...draft,
              {
                nome: "Aguardando arquivo",
                detalhe: "Selecione qualquer tipo de arquivo",
              },
            ])
          }
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
        >
          Adicionar documento
        </button>
      </div>
    </div>
  );
}

export function PatientHistoryEditor({ pacienteId }: { pacienteId: number }) {
  const { data, save } = usePatientLiveData(pacienteId);
  const [draft, setDraft] = useState(() => clone(data.history));
  const persist = (next: typeof draft) => {
    setDraft(next);
    save({ ...data, history: next });
  };

  return (
    <div className="mt-5 space-y-4">
      {draft.map((item, index) => (
        <div key={index} className="rounded-3xl bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <input
              value={item.titulo}
              onChange={(event) => {
                const next = [...draft];
                next[index] = { ...item, titulo: event.target.value };
                persist(next);
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 font-semibold outline-none md:col-span-2"
            />
            <input
              value={item.data}
              onChange={(event) => {
                const next = [...draft];
                next[index] = { ...item, data: event.target.value };
                persist(next);
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
            <select
              value={item.status}
              onChange={(event) => {
                const next = [...draft];
                next[index] = { ...item, status: event.target.value };
                persist(next);
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
            >
              {historyStatusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            persist([
              ...draft,
              {
                titulo: "Novo histórico",
                profissional: "Dr. Fernando Silva",
                data: "23/06/2026",
                status: "Registrado",
              },
            ])
          }
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
        >
          Adicionar histórico
        </button>
      </div>
    </div>
  );
}

const clinicalTemplates = [
  {
    key: "avaliacao",
    label: "Avaliação inicial",
    description: "Primeira consulta, anamnese, queixa e plano inicial.",
    data: {
      tipoRegistro: "Avaliação inicial",
      statusRegistro: "Em andamento",
      queixaPrincipal:
        "Paciente compareceu para avaliação inicial. Registrar queixa principal, histórico relevante e expectativas do atendimento.",
      evolucao:
        "Avaliação clínica realizada. Registrar achados, sinais observados, exames avaliados e pontos de atenção.",
      conduta:
        "Definir plano de cuidado, orientações iniciais, necessidade de exames, procedimento indicado e retorno.",
    },
  },
  {
    key: "evolucao",
    label: "Retorno / evolução",
    description: "Acompanhamento de caso, resposta clínica e próximos passos.",
    data: {
      tipoRegistro: "Retorno / evolução",
      statusRegistro: "Em andamento",
      queixaPrincipal:
        "Paciente em retorno para acompanhamento. Registrar evolução desde o último atendimento.",
      evolucao:
        "Evolução clínica registrada com resposta ao tratamento, intercorrências, adesão às orientações e achados atuais.",
      conduta:
        "Manter ou ajustar plano de cuidado, reforçar orientações e programar próximo acompanhamento.",
    },
  },
  {
    key: "procedimento",
    label: "Procedimento realizado",
    description: "Registro do procedimento, materiais, técnica e orientação.",
    data: {
      tipoRegistro: "Procedimento realizado",
      statusRegistro: "Em andamento",
      queixaPrincipal:
        "Paciente compareceu para realização de procedimento previamente indicado.",
      evolucao:
        "Procedimento realizado. Registrar técnica, região/dente envolvido, materiais/produtos utilizados e resposta imediata.",
      conduta:
        "Orientar cuidados pós-procedimento, sinais de alerta, medicações se aplicável e retorno de controle.",
    },
  },
  {
    key: "urgencia",
    label: "Intercorrência / urgência",
    description: "Dor, reação, complicação, trauma ou demanda imediata.",
    data: {
      tipoRegistro: "Intercorrência / urgência",
      statusRegistro: "Urgente",
      queixaPrincipal:
        "Paciente relata condição de urgência/intercorrência. Registrar início, intensidade, evolução e fatores associados.",
      evolucao:
        "Atendimento prioritário realizado. Registrar avaliação clínica, hipótese, conduta imediata e resposta do paciente.",
      conduta:
        "Registrar orientação, prescrição/encaminhamento se aplicável, sinais de alerta e retorno prioritário.",
    },
  },
  {
    key: "conclusao",
    label: "Alta / conclusão",
    description: "Fechamento do ciclo de cuidado ou procedimento.",
    data: {
      tipoRegistro: "Alta / conclusão",
      statusRegistro: "Concluído",
      queixaPrincipal:
        "Paciente em avaliação final do ciclo de cuidado ou procedimento.",
      evolucao:
        "Tratamento/procedimento concluído. Registrar resultado, resposta clínica e observações finais.",
      conduta:
        "Orientar manutenção, prevenção, acompanhamento periódico e critérios para novo contato.",
    },
  },
  {
    key: "administrativo",
    label: "Observação administrativa",
    description: "Registro interno sem evolução clínica principal.",
    data: {
      tipoRegistro: "Observação administrativa",
      statusRegistro: "Rascunho",
      queixaPrincipal:
        "Registro administrativo vinculado ao atendimento do paciente.",
      evolucao:
        "Anotação administrativa registrada para controle interno da clínica.",
      conduta:
        "Registrar pendências, documentos, contato, autorização, orçamento ou próxima ação necessária.",
    },
  },
] as const;

export function PatientProntuarioEditor({
  pacienteId,
  pacienteNome = "Paciente vinculado",
}: {
  pacienteId: number;
  pacienteNome?: string;
}) {
  const { data, save } = usePatientLiveData(pacienteId);
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [draft, setDraft] = useState(() => ({
    prontuario: { ...data.prontuario },
    notes: data.notes.join("\n"),
  }));

  const fieldClass = isEditing
    ? "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
    : "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none";

  const textAreaClass = isEditing
    ? "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
    : "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none";

  function updateProntuario(
    key: keyof typeof draft.prontuario,
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      prontuario: { ...current.prontuario, [key]: value },
    }));
  }

  function aplicarModelo(modelo: (typeof clinicalTemplates)[number]["key"]) {
    const template = clinicalTemplates.find((item) => item.key === modelo);

    if (!template) {
      return;
    }

    setDraft((current) => ({
      ...current,
      prontuario: { ...current.prontuario, ...template.data },
    }));
    setIsEditing(true);
    setSavedMessage(
      "Modelo aplicado. Revise as informações e salve o prontuário."
    );
  }

  function resetDraft() {
    setDraft({
      prontuario: { ...data.prontuario },
      notes: data.notes.join("\n"),
    });
    setIsEditing(false);
    setSavedMessage("");
  }

  function salvarProntuario() {
    save({
      ...data,
      prontuario: draft.prontuario,
      notes: draft.notes.split("\n").filter(Boolean),
    });
    setIsEditing(false);
    setSavedMessage("Prontuário salvo.");
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h3 className="text-xl font-bold">Prontuário do paciente</h3>
          <p className="mt-1 text-sm text-slate-500">
            Registro clínico completo vinculado a este paciente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setSavedMessage("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Editar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarProntuario}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {savedMessage && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {savedMessage}
        </p>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label>
          <span className="text-sm font-semibold">Paciente</span>
          <input
            value={pacienteNome}
            disabled
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
          />
        </label>

        <label>
          <span className="text-sm font-semibold">Tipo de registro</span>
          <input
            value={draft.prontuario.tipoRegistro}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("tipoRegistro", event.target.value)
            }
            placeholder="Digite o tipo de registro"
            className={fieldClass}
          />
        </label>

        <label>
          <span className="text-sm font-semibold">Data do atendimento</span>
          <input
            type="date"
            value={draft.prontuario.dataAtendimento}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("dataAtendimento", event.target.value)
            }
            className={fieldClass}
          />
        </label>

        <label>
          <span className="text-sm font-semibold">Status do registro</span>
          <select
            value={draft.prontuario.statusRegistro}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("statusRegistro", event.target.value)
            }
            className={fieldClass}
          >
            <option>Em andamento</option>
            <option>Rascunho</option>
            <option>Concluído</option>
            <option>Urgente</option>
          </select>
        </label>

        <label>
          <span className="text-sm font-semibold">Dente / região envolvida</span>
          <input
            value={draft.prontuario.denteEnvolvido}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("denteEnvolvido", event.target.value)
            }
            placeholder="Ex: 16, 21, lábios, face, região tratada..."
            className={fieldClass}
          />
        </label>

        <label>
          <span className="text-sm font-semibold">Procedimento</span>
          <input
            value={draft.prontuario.procedimento}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("procedimento", event.target.value)
            }
            placeholder="Ex: restauração, canal, profilaxia..."
            className={fieldClass}
          />
        </label>

        <label className="md:col-span-2">
          <span className="text-sm font-semibold">Queixa principal</span>
          <textarea
            value={draft.prontuario.queixaPrincipal}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("queixaPrincipal", event.target.value)
            }
            placeholder="Descreva o motivo principal do atendimento..."
            className={`${textAreaClass} h-24`}
          />
        </label>

        <label className="md:col-span-2">
          <span className="text-sm font-semibold">Evolução clínica</span>
          <textarea
            value={draft.prontuario.evolucao}
            disabled={!isEditing}
            onChange={(event) => updateProntuario("evolucao", event.target.value)}
            placeholder="Informe a evolução, procedimento realizado, região envolvida e observações clínicas..."
            className={`${textAreaClass} h-32`}
          />
        </label>

        <label className="md:col-span-2">
          <span className="text-sm font-semibold">
            Conduta / Plano de cuidado
          </span>
          <textarea
            value={draft.prontuario.conduta}
            disabled={!isEditing}
            onChange={(event) => updateProntuario("conduta", event.target.value)}
            placeholder="Descreva orientações, próximos passos, retorno, exames ou tratamento indicado..."
            className={`${textAreaClass} h-28`}
          />
        </label>

        <label>
          <span className="text-sm font-semibold">Próximo retorno</span>
          <input
            type="date"
            value={draft.prontuario.proximoRetorno}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("proximoRetorno", event.target.value)
            }
            className={fieldClass}
          />
        </label>

        <label>
          <span className="text-sm font-semibold">Valor relacionado</span>
          <input
            value={draft.prontuario.valorRelacionado}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("valorRelacionado", event.target.value)
            }
            placeholder="Ex: R$ 280,00"
            className={fieldClass}
          />
        </label>

        <label className="md:col-span-2">
          <span className="text-sm font-semibold">Observações privadas</span>
          <textarea
            value={draft.prontuario.observacoesPrivadas}
            disabled={!isEditing}
            onChange={(event) =>
              updateProntuario("observacoesPrivadas", event.target.value)
            }
            placeholder="Anotações internas do profissional..."
            className={`${textAreaClass} h-24`}
          />
        </label>
      </div>

      <div className="mt-6">
        <div className="rounded-2xl bg-cyan-50 p-4">
          <h4 className="font-bold text-cyan-900">Resumo do registro</h4>
          <div className="mt-4 space-y-3 text-sm text-cyan-800">
            <p>
              <strong>Tipo:</strong> {draft.prontuario.tipoRegistro}
            </p>
            <p>
              <strong>Status:</strong> {draft.prontuario.statusRegistro}
            </p>
            <p>
              <strong>Dente:</strong>{" "}
              {draft.prontuario.denteEnvolvido || "Não informado"}
            </p>
            <p>
              <strong>Retorno:</strong>{" "}
              {draft.prontuario.proximoRetorno || "Não agendado"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <h4 className="font-bold">Modelo clínico do atendimento</h4>
            <p className="mt-1 text-sm text-slate-500">
              Escolha um modelo para preencher a estrutura do registro. Ele é
              aplicado de verdade, entra em edição e só fica definitivo ao salvar.
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {isEditing ? "Editando" : "Clique em um modelo para editar"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clinicalTemplates.map((template) => (
            <button
              key={template.key}
              type="button"
              onClick={() => aplicarModelo(template.key)}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              <span className="font-semibold text-slate-900">
                {template.label}
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                {template.description}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">
            Como funciona na prática
          </p>
          <p className="mt-1">
            O modelo preenche queixa principal, evolução clínica e conduta. O
            profissional revisa, ajusta conforme o atendimento real e salva o
            prontuário do paciente.
          </p>
        </div>
      </div>

      <label className="mt-6 block">
        <span className="text-sm font-semibold">Notas importantes</span>
        <textarea
          value={draft.notes}
          disabled={!isEditing}
          onChange={(event) =>
            setDraft((current) => ({ ...current, notes: event.target.value }))
          }
          className={`${textAreaClass} h-28`}
        />
      </label>

      {isEditing && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={resetDraft}
            className="rounded-xl border border-slate-200 px-5 py-3 font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvarProntuario}
            className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white"
          >
            Salvar prontuário
          </button>
        </div>
      )}
    </div>
  );
}
