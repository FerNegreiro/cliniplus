"use client";

import Link from "next/link";
import { useState } from "react";
import { usePatientLiveData } from "@/components/PatientLiveProvider";

function getProgressColor(status: string) {
  if (status === "Urgente") {
    return "bg-red-500";
  }

  if (status === "Planejado") {
    return "bg-cyan-500";
  }

  return "bg-amber-500";
}

function getFinanceColor(status: string) {
  if (status === "Em dia") {
    return "text-emerald-600";
  }

  if (status === "Aguardando" || status === "Pendente") {
    return "text-amber-600";
  }

  return "text-slate-600";
}

export function PatientTotalGastoCard({ pacienteId }: { pacienteId: number }) {
  const { data } = usePatientLiveData(pacienteId);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">Total gasto</p>
        <Link
          href={`/pacientes/${pacienteId}?aba=financeiro`}
          className="text-xs font-semibold text-cyan-700"
        >
          Editar
        </Link>
      </div>
      <h3 className="mt-3 text-2xl font-bold">{data.finance.totalGasto}</h3>
      <p className="mt-1 text-xs text-slate-400">
        Vem dos lançamentos financeiros
      </p>
    </>
  );
}

export function PatientStatusFinanceiroCard({
  pacienteId,
}: {
  pacienteId: number;
}) {
  const { data } = usePatientLiveData(pacienteId);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">Status financeiro</p>
        <Link
          href={`/pacientes/${pacienteId}?aba=financeiro`}
          className="text-xs font-semibold text-cyan-700"
        >
          Editar
        </Link>
      </div>
      <h3
        className={`mt-3 text-2xl font-bold ${getFinanceColor(
          data.finance.status
        )}`}
      >
        {data.finance.status}
      </h3>
      <p className="mt-1 text-xs text-slate-400">{data.finance.detalhe}</p>
    </>
  );
}

function getNextReturn(data: ReturnType<typeof usePatientLiveData>["data"]) {
  if (data.prontuario.proximoRetorno) {
    return data.prontuario.proximoRetorno;
  }

  const withReturn = data.treatments.find((item) =>
    item.detalhe.toLowerCase().includes("retorno")
  );

  if (!withReturn) {
    return "Não agendado";
  }

  return withReturn.detalhe
    .replace("Próximo retorno:", "")
    .replace("Próxima sessão em", "")
    .trim();
}

export function PatientLastAppointmentCard({
  pacienteId,
  fallbackDate,
}: {
  pacienteId: number;
  fallbackDate: string;
}) {
  const { data } = usePatientLiveData(pacienteId);
  const lastAppointment =
    data.prontuario.dataAtendimento || data.history[0]?.data || fallbackDate;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">Último atendimento</p>
        <Link
          href={`/pacientes/${pacienteId}?aba=prontuario`}
          className="text-xs font-semibold text-cyan-700"
        >
          Editar
        </Link>
      </div>
      <h3 className="mt-3 text-2xl font-bold">{lastAppointment}</h3>
      <p className="mt-1 text-xs text-slate-400">
        Vem da data do atendimento no prontuário
      </p>
    </>
  );
}

export function PatientNextReturnCard({ pacienteId }: { pacienteId: number }) {
  const { data } = usePatientLiveData(pacienteId);
  const nextReturn = getNextReturn(data);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">Próximo retorno</p>
        <Link
          href={`/pacientes/${pacienteId}?aba=prontuario`}
          className="text-xs font-semibold text-cyan-700"
        >
          Editar
        </Link>
      </div>
      <h3 className="mt-3 text-2xl font-bold">{nextReturn}</h3>
      <p className="mt-1 text-xs text-slate-400">
        {nextReturn === "Não agendado"
          ? "Sem data marcada"
          : "Vem do próximo retorno no prontuário"}
      </p>
    </>
  );
}

export function PatientHeaderLiveInfo({
  pacienteId,
  telefone,
  email,
}: {
  pacienteId: number;
  telefone: string;
  email: string;
}) {
  const { data } = usePatientLiveData(pacienteId);

  return (
    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
      <p>CPF: {data.info.cpf}</p>
      <p>Nascimento: {data.info.nascimento}</p>
      <p>{data.info.telefone || telefone}</p>
      <p>{data.info.email || email}</p>
    </div>
  );
}

export function PatientHistorySummary({ pacienteId }: { pacienteId: number }) {
  const { data } = usePatientLiveData(pacienteId);

  return (
    <div className="mt-5 space-y-4">
      {data.history.slice(0, 3).map((item) => (
        <div key={`${item.titulo}-${item.data}`} className="rounded-2xl bg-slate-50 p-4">
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-semibold">{item.titulo}</p>
              <p className="mt-1 text-sm text-slate-500">{item.profissional}</p>
            </div>

            <span className="h-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {item.status}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400">{item.data}</p>
        </div>
      ))}
    </div>
  );
}

export function PatientTreatmentsSummary({
  pacienteId,
}: {
  pacienteId: number;
}) {
  const { data } = usePatientLiveData(pacienteId);

  return (
    <div className="mt-5 space-y-5">
      {data.treatments.slice(0, 3).map((item) => (
        <div key={item.nome}>
          <div className="mb-2 flex justify-between text-sm">
            <p className="font-semibold">{item.nome}</p>
            <span className="text-slate-500">{item.progresso}</span>
          </div>

          <div className="h-2 rounded-full bg-slate-200">
            <div
              className={`h-2 rounded-full ${getProgressColor(item.status)}`}
              style={{ width: item.progresso }}
            />
          </div>

          <p className="mt-1 text-xs text-slate-500">{item.detalhe}</p>
        </div>
      ))}
    </div>
  );
}

export function PatientNotesSummary({ pacienteId }: { pacienteId: number }) {
  const { data } = usePatientLiveData(pacienteId);

  return (
    <div className="mt-4 text-sm text-slate-600">
      {data.notes.map((note) => (
        <p key={note} className="mt-2 first:mt-0">
          {note}
        </p>
      ))}
    </div>
  );
}

export function PatientInfoSummary({
  pacienteId,
  nome,
  telefone,
  email,
  convenio,
}: {
  pacienteId: number;
  nome: string;
  telefone: string;
  email: string;
  convenio: string;
}) {
  const { data, save } = usePatientLiveData(pacienteId);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => ({
    nome: data.info.nome || nome,
    nascimento: data.info.nascimento,
    cpf: data.info.cpf,
    telefone: data.info.telefone || telefone,
    email: data.info.email || email,
    endereco: data.info.endereco,
    convenio: data.info.convenio || convenio,
    observacoes: data.info.observacoes,
  }));

  const rows = [
    ["Nome completo", "nome"],
    ["Data de nascimento", "nascimento"],
    ["CPF", "cpf"],
    ["Telefone", "telefone"],
    ["E-mail", "email"],
    ["Endereço", "endereco"],
    ["Convênio", "convenio"],
    ["Observações", "observacoes"],
  ] as const;

  function updateField(key: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetDraft() {
    setDraft({
      nome: data.info.nome || nome,
      nascimento: data.info.nascimento,
      cpf: data.info.cpf,
      telefone: data.info.telefone || telefone,
      email: data.info.email || email,
      endereco: data.info.endereco,
      convenio: data.info.convenio || convenio,
      observacoes: data.info.observacoes,
    });
    setIsEditing(false);
  }

  function saveInfo() {
    save({
      ...data,
      info: {
        ...data.info,
        ...draft,
      },
    });
    setIsEditing(false);
  }

  return (
    <div className="mt-5 space-y-4 text-sm">
      <div className="flex justify-end gap-2">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm font-semibold text-cyan-700"
          >
            Editar
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={resetDraft}
              className="text-sm font-semibold text-slate-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveInfo}
              className="text-sm font-semibold text-cyan-700"
            >
              Salvar
            </button>
          </>
        )}
      </div>

      {rows.map(([label, key]) => (
        <label key={label} className="flex justify-between gap-4">
          <span className="text-slate-500">{label}</span>
          {isEditing ? (
            <input
              value={draft[key]}
              onChange={(event) => updateField(key, event.target.value)}
              className="w-2/3 rounded-lg border border-slate-200 px-3 py-2 text-right font-semibold outline-none"
            />
          ) : (
            <span className="text-right font-semibold">{draft[key]}</span>
          )}
        </label>
      ))}
    </div>
  );
}

export function PatientDocsSummary({ pacienteId }: { pacienteId: number }) {
  const { data } = usePatientLiveData(pacienteId);

  return (
    <div className="mt-5 space-y-4">
      {data.documents.slice(0, 3).map((doc) => (
        <div key={doc.nome} className="rounded-2xl bg-slate-50 p-4">
          <p className="font-semibold">{doc.nome}</p>
          <p className="mt-1 text-xs text-slate-500">{doc.detalhe}</p>
        </div>
      ))}
    </div>
  );
}

export function PatientEditShortcut({
  href,
  label = "Editar",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link href={href} className="text-sm font-semibold text-cyan-700">
      {label}
    </Link>
  );
}
