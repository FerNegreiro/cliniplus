"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getProcedimentosEsteticosLocais,
  type ProcedimentoEsteticoLocal,
} from "@/utils/localCadastro";

function getStatusClasse(status: string) {
  if (status === "Em acompanhamento") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Planejado") {
    return "bg-cyan-100 text-cyan-700";
  }

  if (status === "Concluído") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function ProcedimentosEsteticosLocais() {
  const searchParams = useSearchParams();
  const paciente = searchParams.get("paciente") || "";
  const [procedimentos, setProcedimentos] = useState<
    ProcedimentoEsteticoLocal[]
  >([]);

  useEffect(() => {
    const carregarProcedimentos = () => {
      setProcedimentos(getProcedimentosEsteticosLocais());
    };

    carregarProcedimentos();
    window.addEventListener(
      "cliniplus:procedimentos-esteticos",
      carregarProcedimentos
    );
    window.addEventListener("storage", carregarProcedimentos);

    return () => {
      window.removeEventListener(
        "cliniplus:procedimentos-esteticos",
        carregarProcedimentos
      );
      window.removeEventListener("storage", carregarProcedimentos);
    };
  }, []);

  const procedimentosFiltrados = useMemo(() => {
    return paciente
      ? procedimentos.filter((item) => item.paciente === paciente)
      : procedimentos;
  }, [paciente, procedimentos]);

  if (procedimentosFiltrados.length === 0) {
    return null;
  }

  return (
    <>
      {procedimentosFiltrados.map((item) => (
        <div
          key={`${item.paciente}-${item.procedimento}`}
          className="rounded-3xl bg-slate-50 p-5"
        >
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-lg font-bold">{item.procedimento}</h4>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasse(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>

                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  Criado no cadastro
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Paciente:{" "}
                <span className="font-semibold text-slate-700">
                  {item.paciente}
                </span>
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Área: {item.area} • Retorno: {item.retorno}
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <p className="text-xl font-bold text-emerald-600">
                {item.valor}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Ver fotos
                </button>

                <button
                  type="button"
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Evolução
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
