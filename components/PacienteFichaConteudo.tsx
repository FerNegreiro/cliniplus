"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PacienteProntuarioBase from "@/components/PacienteProntuarioBase";
import PacienteOdontogramaEditor from "@/components/PacienteOdontogramaEditor";
import PacienteOdontogramaResumo from "@/components/PacienteOdontogramaResumo";
import {
  PatientDocsSummary,
  PatientEditShortcut,
  PatientHistorySummary,
  PatientInfoSummary,
  PatientLastAppointmentCard,
  PatientNextReturnCard,
  PatientNotesSummary,
  PatientStatusFinanceiroCard,
  PatientTotalGastoCard,
  PatientTreatmentsSummary,
} from "@/components/PatientSummaryLiveSections";
import type { OdontogramaRegistro } from "@/data/odontograma";
import type { AbaPaciente } from "@/utils/pacienteAbas";
import {
  addDocumento,
  addLancamentoFinanceiro,
  addTratamento,
  getDocumentosByPacienteId,
  getFinanceiroByPacienteId,
  getHistoricoPaciente,
  getProntuarioByPacienteId,
  getTratamentosByPacienteId,
  saveProntuario,
} from "@/utils/cliniplusStore";

type ProntuarioPaciente = {
  queixaPrincipal: string;
  historiaClinica: string;
  observacoes: string;
  conduta: string;
  prescricaoOrientacao: string;
  atualizadoEm: string;
};

type TratamentoPaciente = {
  id: number;
  descricao: string;
  status: string;
  valor: string;
  data: string;
};

type FinanceiroPaciente = {
  id: number;
  descricao: string;
  tipo: "Receita" | "Despesa";
  valor: string;
  status: "Pago" | "Pendente";
  data: string;
};

type DocumentoPaciente = {
  id: number;
  nome: string;
  tipo: string;
  observacao: string;
};

type PacienteFichaConteudoProps = {
  abaAtual: AbaPaciente;
  pacienteId: number;
  pacienteNome: string;
  telefone: string;
  email: string;
  convenio: string;
  ultimo: string;
  plano?: string;
  modo?: string;
  registrosOdontograma: OdontogramaRegistro[];
};

const prontuarioVazio: ProntuarioPaciente = {
  queixaPrincipal: "",
  historiaClinica: "",
  observacoes: "",
  conduta: "",
  prescricaoOrientacao: "",
  atualizadoEm: "",
};

function getStorageKey(tipo: string, pacienteId: number) {
  return `${tipo}-paciente-${pacienteId}`;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const saved = window.localStorage.getItem(key);

  if (!saved) {
    return fallback;
  }

  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("cliniplus:paciente-ficha"));
}

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

function hasProntuarioContent(prontuario: ProntuarioPaciente) {
  return Boolean(
    prontuario.queixaPrincipal.trim() ||
      prontuario.historiaClinica.trim() ||
      prontuario.observacoes.trim() ||
      prontuario.conduta.trim() ||
      prontuario.prescricaoOrientacao.trim()
  );
}

function OdontogramaBloqueadoCard() {
  return (
    <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6 shadow-sm">
      <h3 className="text-xl font-bold text-cyan-950">
        Odontograma disponível no Plano Pro
      </h3>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-cyan-800">
        O Plano Starter inclui prontuário eletrônico básico. Para usar o
        odontograma completo, escolha o Plano Pro ou Premium.
      </p>
      <Link
        href="/planos"
        className="mt-5 inline-flex rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
      >
        Ver planos
      </Link>
    </div>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-cyan-400"
      />
    </label>
  );
}

export default function PacienteFichaConteudo({
  abaAtual,
  pacienteId,
  pacienteNome,
  telefone,
  email,
  convenio,
  ultimo,
  plano,
  modo,
  registrosOdontograma,
}: PacienteFichaConteudoProps) {
  const prontuarioKey = getStorageKey("prontuario", pacienteId);
  const tratamentosKey = getStorageKey("tratamentos", pacienteId);
  const financeiroKey = getStorageKey("financeiro", pacienteId);
  const documentosKey = getStorageKey("documentos", pacienteId);
  const odontogramaLiberado =
    modo !== "teste" && (plano === "pro" || plano === "premium");

  const [prontuario, setProntuario] =
    useState<ProntuarioPaciente>(prontuarioVazio);
  const [tratamentos, setTratamentos] = useState<TratamentoPaciente[]>([]);
  const [financeiro, setFinanceiro] = useState<FinanceiroPaciente[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoPaciente[]>([]);
  const [mensagem, setMensagem] = useState("");

  const [novoTratamento, setNovoTratamento] = useState({
    descricao: "",
    status: "Planejado",
    valor: "",
    data: "",
  });
  const [novoFinanceiro, setNovoFinanceiro] = useState({
    descricao: "",
    tipo: "Receita" as "Receita" | "Despesa",
    valor: "",
    status: "Pendente" as "Pago" | "Pendente",
    data: "",
  });
  const [novoDocumento, setNovoDocumento] = useState({
    nome: "",
    tipo: "",
    observacao: "",
  });

  useEffect(() => {
    const prontuarioSalvo = getProntuarioByPacienteId(pacienteId);

    setProntuario(
      prontuarioSalvo
        ? {
            ...prontuarioVazio,
            ...(prontuarioSalvo.dados as Partial<ProntuarioPaciente>),
            atualizadoEm: prontuarioSalvo.atualizadoEm,
          }
        : readStorage(prontuarioKey, prontuarioVazio)
    );
    setTratamentos(getTratamentosByPacienteId(pacienteId) as TratamentoPaciente[]);
    setFinanceiro(getFinanceiroByPacienteId(pacienteId) as FinanceiroPaciente[]);
    setDocumentos(getDocumentosByPacienteId(pacienteId) as DocumentoPaciente[]);
    setMensagem("");
  }, [documentosKey, financeiroKey, pacienteId, prontuarioKey, tratamentosKey]);

  const totalPago = useMemo(
    () =>
      financeiro
        .filter((item) => item.status === "Pago")
        .reduce((total, item) => total + parseMoney(item.valor), 0),
    [financeiro]
  );
  const totalPendente = useMemo(
    () =>
      financeiro
        .filter((item) => item.status === "Pendente")
        .reduce((total, item) => total + parseMoney(item.valor), 0),
    [financeiro]
  );

  function salvarProntuario() {
    const next = {
      ...prontuario,
      atualizadoEm: new Date().toISOString(),
    };
    setProntuario(next);
    saveProntuario(pacienteId, next as unknown as Record<string, unknown>);
    writeStorage(prontuarioKey, next);
    setMensagem("Prontuario salvo neste paciente.");
  }

  function adicionarTratamento() {
    if (!novoTratamento.descricao.trim()) {
      return;
    }

    const tratamento = addTratamento({
      id: Date.now(),
      pacienteId,
      paciente: pacienteNome,
      descricao: novoTratamento.descricao,
      status: novoTratamento.status,
      valor: novoTratamento.valor,
      data: novoTratamento.data,
    }) as TratamentoPaciente;
    const next = [...tratamentos, tratamento];
    setTratamentos(next);
    writeStorage(tratamentosKey, next);
    setNovoTratamento({
      descricao: "",
      status: "Planejado",
      valor: "",
      data: "",
    });
    setMensagem("Tratamento adicionado neste paciente.");
  }

  function adicionarFinanceiro() {
    if (!novoFinanceiro.descricao.trim()) {
      return;
    }

    const lancamento = addLancamentoFinanceiro({
      id: Date.now(),
      pacienteId,
      paciente: pacienteNome,
      descricao: novoFinanceiro.descricao,
      tipo: novoFinanceiro.tipo,
      valor: novoFinanceiro.valor,
      status: novoFinanceiro.status,
      data: novoFinanceiro.data,
    }) as FinanceiroPaciente;
    const next = [...financeiro, lancamento];
    setFinanceiro(next);
    writeStorage(financeiroKey, next);
    setNovoFinanceiro({
      descricao: "",
      tipo: "Receita",
      valor: "",
      status: "Pendente",
      data: "",
    });
    setMensagem("Lancamento financeiro adicionado neste paciente.");
  }

  function adicionarDocumento() {
    if (!novoDocumento.nome.trim()) {
      return;
    }

    const documento = addDocumento({
      id: Date.now(),
      pacienteId,
      paciente: pacienteNome,
      nome: novoDocumento.nome,
      tipo: novoDocumento.tipo,
      observacao: novoDocumento.observacao,
    }) as DocumentoPaciente;
    const next = [...documentos, documento];
    setDocumentos(next);
    writeStorage(documentosKey, next);
    setNovoDocumento({
      nome: "",
      tipo: "",
      observacao: "",
    });
    setMensagem("Documento adicionado neste paciente.");
  }

  if (abaAtual === "resumo") {
    return (
      <>
        <div className="mt-5 grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <PatientLastAppointmentCard
              pacienteId={pacienteId}
              fallbackDate={ultimo}
            />
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <PatientNextReturnCard pacienteId={pacienteId} />
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <PatientTotalGastoCard pacienteId={pacienteId} />
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <PatientStatusFinanceiroCard pacienteId={pacienteId} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          <div className="space-y-5 xl:col-span-2">
            {odontogramaLiberado ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold">Odontograma</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Registro visual dos dentes, restauracoes, canais, ausencias e
                  tratamentos odontologicos.
                </p>
                <PacienteOdontogramaResumo
                  pacienteId={pacienteId}
                  registrosIniciais={registrosOdontograma}
                />
              </div>
            ) : (
              <OdontogramaBloqueadoCard />
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    Historico de atendimentos
                  </h3>
                  <Link
                    href={`/pacientes/${pacienteId}?aba=historico`}
                    className="text-sm font-semibold text-cyan-700"
                  >
                    Ver todos
                  </Link>
                </div>
                <PatientHistorySummary pacienteId={pacienteId} />
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    Tratamentos odontologicos
                  </h3>
                  <Link
                    href={`/pacientes/${pacienteId}?aba=tratamentos`}
                    className="text-sm font-semibold text-cyan-700"
                  >
                    Ver todos
                  </Link>
                </div>
                <PatientTreatmentsSummary pacienteId={pacienteId} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Notas importantes</h3>
                <PatientEditShortcut
                  href={`/pacientes/${pacienteId}?aba=prontuario`}
                />
              </div>
              <PatientNotesSummary pacienteId={pacienteId} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold">Informacoes pessoais</h3>
              <PatientInfoSummary
                pacienteId={pacienteId}
                nome={pacienteNome}
                telefone={telefone}
                email={email}
                convenio={convenio}
              />
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Anexos e documentos</h3>
                <Link
                  href={`/pacientes/${pacienteId}?aba=documentos`}
                  className="text-sm font-semibold text-cyan-700"
                >
                  Ver todos
                </Link>
              </div>
              <PatientDocsSummary pacienteId={pacienteId} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (abaAtual === "prontuario") {
    return (
      <PacienteProntuarioBase
        pacienteId={pacienteId}
        pacienteNome={pacienteNome}
        telefone={telefone}
        email={email}
        convenio={convenio}
        ultimo={ultimo}
      />
    );
  }

  if (abaAtual === "odontograma") {
    return (
      <section className="mt-5">
        {odontogramaLiberado ? (
          <PacienteOdontogramaEditor
            pacienteId={pacienteId}
            registrosIniciais={registrosOdontograma}
          />
        ) : (
          <OdontogramaBloqueadoCard />
        )}
      </section>
    );
  }

  if (abaAtual === "tratamentos") {
    return (
      <section className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Tratamentos do paciente</h2>
        <p className="mt-1 text-sm text-slate-500">
          Tratamentos salvos em {tratamentosKey}.
        </p>

        {mensagem && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {mensagem}
          </p>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_160px_140px_150px_auto]">
          <input
            value={novoTratamento.descricao}
            onChange={(event) =>
              setNovoTratamento((current) => ({
                ...current,
                descricao: event.target.value,
              }))
            }
            placeholder="Descricao"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <select
            value={novoTratamento.status}
            onChange={(event) =>
              setNovoTratamento((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option>Planejado</option>
            <option>Em tratamento</option>
            <option>Concluido</option>
            <option>Pendente</option>
          </select>
          <input
            value={novoTratamento.valor}
            onChange={(event) =>
              setNovoTratamento((current) => ({
                ...current,
                valor: event.target.value,
              }))
            }
            placeholder="Valor"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <input
            type="date"
            value={novoTratamento.data}
            onChange={(event) =>
              setNovoTratamento((current) => ({
                ...current,
                data: event.target.value,
              }))
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <button
            type="button"
            onClick={adicionarTratamento}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white"
          >
            Adicionar tratamento
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {tratamentos.map((tratamento) => (
            <div key={tratamento.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="font-bold">{tratamento.descricao}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {tratamento.data || "Sem data"} • {tratamento.valor || "Sem valor"}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                  {tratamento.status}
                </span>
              </div>
            </div>
          ))}

          {tratamentos.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              Nenhum tratamento registrado para este paciente ainda.
            </div>
          )}
        </div>
      </section>
    );
  }

  if (abaAtual === "financeiro") {
    return (
      <section className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Financeiro do paciente</h2>
        <p className="mt-1 text-sm text-slate-500">
          Lancamentos salvos em {financeiroKey}.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-700">Total pago</p>
            <h3 className="mt-2 text-2xl font-bold text-emerald-900">
              {formatMoney(totalPago)}
            </h3>
          </div>
          <div className="rounded-3xl bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-700">
              Total pendente
            </p>
            <h3 className="mt-2 text-2xl font-bold text-amber-900">
              {formatMoney(totalPendente)}
            </h3>
          </div>
        </div>

        {mensagem && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {mensagem}
          </p>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_120px_140px_140px_150px_auto]">
          <input
            value={novoFinanceiro.descricao}
            onChange={(event) =>
              setNovoFinanceiro((current) => ({
                ...current,
                descricao: event.target.value,
              }))
            }
            placeholder="Descricao"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <select
            value={novoFinanceiro.tipo}
            onChange={(event) =>
              setNovoFinanceiro((current) => ({
                ...current,
                tipo: event.target.value as "Receita" | "Despesa",
              }))
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option>Receita</option>
            <option>Despesa</option>
          </select>
          <input
            value={novoFinanceiro.valor}
            onChange={(event) =>
              setNovoFinanceiro((current) => ({
                ...current,
                valor: event.target.value,
              }))
            }
            placeholder="Valor"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <select
            value={novoFinanceiro.status}
            onChange={(event) =>
              setNovoFinanceiro((current) => ({
                ...current,
                status: event.target.value as "Pago" | "Pendente",
              }))
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option>Pago</option>
            <option>Pendente</option>
          </select>
          <input
            type="date"
            value={novoFinanceiro.data}
            onChange={(event) =>
              setNovoFinanceiro((current) => ({
                ...current,
                data: event.target.value,
              }))
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <button
            type="button"
            onClick={adicionarFinanceiro}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white"
          >
            Adicionar lancamento
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {financeiro.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="font-bold">{item.descricao}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.tipo} • {item.data || "Sem data"} • {item.valor}
                  </p>
                </div>
                <span
                  className={
                    item.status === "Pago"
                      ? "w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                      : "w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700"
                  }
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}

          {financeiro.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              Nenhum lancamento financeiro registrado para este paciente ainda.
            </div>
          )}
        </div>
      </section>
    );
  }

  if (abaAtual === "documentos") {
    return (
      <section className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Documentos do paciente</h2>
        <p className="mt-1 text-sm text-slate-500">
          Documentos salvos em {documentosKey}. Upload real fica para uma etapa
          futura.
        </p>

        {mensagem && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {mensagem}
          </p>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_180px_1.5fr_auto]">
          <input
            value={novoDocumento.nome}
            onChange={(event) =>
              setNovoDocumento((current) => ({
                ...current,
                nome: event.target.value,
              }))
            }
            placeholder="Nome do documento"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <input
            value={novoDocumento.tipo}
            onChange={(event) =>
              setNovoDocumento((current) => ({
                ...current,
                tipo: event.target.value,
              }))
            }
            placeholder="Tipo"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <input
            value={novoDocumento.observacao}
            onChange={(event) =>
              setNovoDocumento((current) => ({
                ...current,
                observacao: event.target.value,
              }))
            }
            placeholder="Observacao"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          <button
            type="button"
            onClick={adicionarDocumento}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white"
          >
            Adicionar documento
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {documentos.map((documento) => (
            <div key={documento.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-bold">{documento.nome}</p>
              <p className="mt-1 text-sm text-slate-500">
                {documento.tipo || "Sem tipo"}
              </p>
              {documento.observacao && (
                <p className="mt-2 text-sm text-slate-600">
                  {documento.observacao}
                </p>
              )}
            </div>
          ))}

          {documentos.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              Nenhum documento registrado para este paciente ainda.
            </div>
          )}
        </div>
      </section>
    );
  }

  const historico = getHistoricoPaciente(pacienteId);

  return (
    <section className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Historico do paciente</h2>
      <p className="mt-1 text-sm text-slate-500">
        Linha do tempo montada com os registros salvos nesta ficha.
      </p>

      <div className="mt-6 space-y-3">
        {historico.map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">
              {item.data || "Sem data"}
            </p>
            <h3 className="mt-2 font-bold">{item.titulo}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.descricao}</p>
          </div>
        ))}

        {historico.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Nenhum historico registrado para este paciente ainda.
          </div>
        )}
      </div>
    </section>
  );
}
