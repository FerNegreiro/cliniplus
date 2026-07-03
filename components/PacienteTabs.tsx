"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PatientDeleteButton from "@/components/PatientDeleteButton";
import { pacientes } from "@/data/pacientes";
import type { PacienteLocal } from "@/utils/localCadastro";
import type { AbaPaciente } from "@/utils/pacienteAbas";

type PacienteTabsProps = {
  pacienteId: number;
  active:
    | "Resumo"
    | "Prontuario"
    | "Odontograma"
    | "Tratamentos"
    | "Financeiro"
    | "Documentos"
    | "Historico";
};

const tabs: Array<{
  label: string;
  key: PacienteTabsProps["active"];
  aba: AbaPaciente;
}> = [
  { label: "Resumo", key: "Resumo", aba: "resumo" },
  { label: "Prontuario", key: "Prontuario", aba: "prontuario" },
  { label: "Odontograma", key: "Odontograma", aba: "odontograma" },
  { label: "Tratamentos", key: "Tratamentos", aba: "tratamentos" },
  { label: "Financeiro", key: "Financeiro", aba: "financeiro" },
  { label: "Documentos", key: "Documentos", aba: "documentos" },
  { label: "Historico", key: "Historico", aba: "historico" },
];

export default function PacienteTabs({ pacienteId, active }: PacienteTabsProps) {
  const searchParams = useSearchParams();
  const pacientesSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("cliniplus:pacientes", onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener("cliniplus:pacientes", onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => window.localStorage.getItem("cliniplus:pacientes") ?? "[]",
    () => "[]"
  );
  const pacienteNome = useMemo(() => {
    const pacienteBase = pacientes.find((item) => item.id === pacienteId);

    if (pacienteBase) {
      return pacienteBase.nome;
    }

    try {
      const pacientesLocais = JSON.parse(pacientesSnapshot) as PacienteLocal[];
      return (
        pacientesLocais.find((item) => item.id === pacienteId)?.nome ||
        "paciente"
      );
    } catch {
      return "paciente";
    }
  }, [pacienteId, pacientesSnapshot]);

  function getHref(aba: AbaPaciente) {
    const params = new URLSearchParams();
    params.set("aba", aba);

    const modo = searchParams.get("modo");
    const plano = searchParams.get("plano");

    if (modo) {
      params.set("modo", modo);
    }

    if (plano) {
      params.set("plano", plano);
    }

    return `/pacientes/${pacienteId}?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-8 text-sm font-semibold text-slate-500">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const href = getHref(tab.aba);

          if (isActive) {
            return (
              <span
                key={tab.key}
                className="border-b-2 border-cyan-500 pb-3 text-cyan-700"
              >
                {tab.label}
              </span>
            );
          }

          return (
            <Link
              key={tab.key}
              href={href}
              className="pb-3 hover:text-cyan-700"
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <PatientDeleteButton pacienteId={pacienteId} nome={pacienteNome} compact />
    </div>
  );
}
