"use client";

import { useMemo, useState } from "react";
import {
  dentesInferiores,
  dentesSuperiores,
  statusOdontograma,
  type OdontogramaRegistro,
  type OdontogramaStatus,
} from "@/data/odontograma";

const statusClasses: Record<OdontogramaStatus, string> = {
  Sadio: "text-slate-300",
  Cariado: "text-red-400",
  Restaurado: "text-cyan-500",
  "Tratamento de canal": "text-amber-500",
  Prótese: "text-emerald-500",
};

function getStorageKey(pacienteId: number) {
  return `cliniplus:odontograma:${pacienteId}`;
}

function hojeFormatado() {
  return new Intl.DateTimeFormat("pt-BR").format(new Date());
}

function DenteIcon({
  classe,
  inferior = false,
}: {
  classe: string;
  inferior?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 80 100"
      className={inferior ? `h-8 w-7 rotate-180 ${classe}` : `h-8 w-7 ${classe}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 8C27 8 17 16 15 30C13 42 17 54 20 65C23 77 25 91 34 91C39 91 38 75 40 75C42 75 41 91 46 91C55 91 57 77 60 65C63 54 67 42 65 30C63 16 53 8 40 8Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function criarRegistroSadio(dente: string): OdontogramaRegistro {
  return {
    dente,
    status: "Sadio",
    procedimento: "",
    observacao: "",
    atualizadoEm: hojeFormatado(),
  };
}

function carregarRegistros(
  pacienteId: number,
  registrosIniciais: OdontogramaRegistro[]
) {
  if (typeof window === "undefined") {
    return registrosIniciais;
  }

  const salvos = window.localStorage.getItem(getStorageKey(pacienteId));

  return salvos ? (JSON.parse(salvos) as OdontogramaRegistro[]) : registrosIniciais;
}

export default function PacienteOdontogramaEditor({
  pacienteId,
  registrosIniciais,
}: {
  pacienteId: number;
  registrosIniciais: OdontogramaRegistro[];
}) {
  const primeiroDente = dentesSuperiores[0];
  const [registros, setRegistros] = useState(() =>
    carregarRegistros(pacienteId, registrosIniciais)
  );
  const [denteSelecionado, setDenteSelecionado] = useState(primeiroDente);
  const [draft, setDraft] = useState<OdontogramaRegistro>(
    registros.find((registro) => registro.dente === primeiroDente) ??
      criarRegistroSadio(primeiroDente)
  );

  const registrosPorDente = useMemo(() => {
    return new Map(registros.map((registro) => [registro.dente, registro]));
  }, [registros]);

  const registrosVisiveis = useMemo(() => {
    const registroSelecionado = {
      ...draft,
      dente: denteSelecionado,
    };

    return [
      ...registros.filter((registro) => registro.dente !== denteSelecionado),
      registroSelecionado,
    ].filter(
      (registro) =>
        registro.status !== "Sadio" ||
        registro.procedimento.trim() ||
        registro.observacao.trim()
    );
  }, [denteSelecionado, draft, registros]);

  const registrosVisiveisPorDente = useMemo(() => {
    return new Map(
      registrosVisiveis.map((registro) => [registro.dente, registro])
    );
  }, [registrosVisiveis]);

  const ativos = registrosVisiveis.filter(
    (registro) => registro.status !== "Sadio"
  );

  function selecionarDente(dente: string) {
    setDenteSelecionado(dente);
    setDraft(registrosPorDente.get(dente) ?? criarRegistroSadio(dente));
  }

  function salvarRegistro() {
    const atualizado = {
      ...draft,
      dente: denteSelecionado,
      atualizadoEm: hojeFormatado(),
    };

    const proximosRegistros = [
      ...registros.filter((registro) => registro.dente !== denteSelecionado),
      atualizado,
    ].filter(
      (registro) =>
        registro.status !== "Sadio" ||
        registro.procedimento.trim() ||
        registro.observacao.trim()
    );

    setRegistros(proximosRegistros);
    window.localStorage.setItem(
      getStorageKey(pacienteId),
      JSON.stringify(proximosRegistros)
    );
    window.dispatchEvent(new Event("cliniplus:odontograma"));
  }

  function limparDente() {
    const proximosRegistros = registros.filter(
      (registro) => registro.dente !== denteSelecionado
    );

    setRegistros(proximosRegistros);
    setDraft(criarRegistroSadio(denteSelecionado));
    window.localStorage.setItem(
      getStorageKey(pacienteId),
      JSON.stringify(proximosRegistros)
    );
    window.dispatchEvent(new Event("cliniplus:odontograma"));
  }

  function renderDente(dente: string, inferior = false) {
    const registro = registrosVisiveisPorDente.get(dente);
    const status = registro?.status ?? "Sadio";
    const selecionado = dente === denteSelecionado;

    return (
      <button
        key={dente}
        type="button"
        title={`Dente ${dente} - ${status}`}
        onClick={() => selecionarDente(dente)}
        className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 transition ${
          selecionado ? "bg-white ring-2 ring-cyan-500 ring-offset-2" : ""
        }`}
      >
        <span className="text-[10px] font-semibold text-slate-500">
          {dente}
        </span>
        <DenteIcon classe={statusClasses[status]} inferior={inferior} />
      </button>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-bold">Mapa odontológico</h3>
            <p className="mt-1 text-sm text-slate-500">
              Clique em um dente, edite a condição e salve para atualizar o
              resumo da ficha do paciente.
            </p>
          </div>

          <span className="w-fit rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
            {ativos.length} dente(s) com registro
          </span>
        </div>

        <div className="mt-5 rounded-3xl bg-slate-50 p-5">
          <div className="grid grid-cols-8 gap-2 md:grid-cols-16">
            {dentesSuperiores.map((dente) => renderDente(dente))}
          </div>

          <div className="my-5 border-t border-dashed border-slate-300" />

          <div className="grid grid-cols-8 gap-2 md:grid-cols-16">
            {dentesInferiores.map((dente) => renderDente(dente, true))}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Sadio</span>
            <span className="text-red-500">Cariado</span>
            <span className="text-cyan-500">Restaurado</span>
            <span className="text-amber-500">Tratamento de canal</span>
            <span className="text-emerald-500">Prótese</span>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Editar dente {denteSelecionado}</h3>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Condição
              </span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    status: event.target.value as OdontogramaStatus,
                  })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              >
                {statusOdontograma.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Procedimento
              </span>
              <input
                value={draft.procedimento}
                onChange={(event) =>
                  setDraft({ ...draft, procedimento: event.target.value })
                }
                placeholder="Ex: restauração, canal, prótese..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Observações
              </span>
              <textarea
                value={draft.observacao}
                onChange={(event) =>
                  setDraft({ ...draft, observacao: event.target.value })
                }
                placeholder="Informe detalhes do dente ou tratamento..."
                rows={5}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400"
              />
            </label>

            <button
              type="button"
              onClick={salvarRegistro}
              className="w-full rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white"
            >
              Salvar alteração
            </button>

            <button
              type="button"
              onClick={limparDente}
              className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
            >
              Limpar dente
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Resumo</h3>

          <div className="mt-5 space-y-3">
            {ativos.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhum dente alterado ainda.
              </p>
            )}

            {ativos.map((registro) => (
              <div
                key={registro.dente}
                className="rounded-2xl bg-slate-50 p-4 text-sm"
              >
                <p className="font-semibold">
                  Dente {registro.dente} - {registro.status}
                </p>
                {registro.procedimento && (
                  <p className="mt-1 text-slate-500">
                    {registro.procedimento}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
