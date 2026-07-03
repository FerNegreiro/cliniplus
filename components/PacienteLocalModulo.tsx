"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PacienteTabs from "@/components/PacienteTabs";
import {
  PatientDocumentsEditor,
  PatientFinanceEditor,
  PatientHistoryEditor,
  PatientProntuarioEditor,
  PatientTreatmentsEditor,
} from "@/components/PatientLiveEditors";
import type { PacienteLocal } from "@/utils/localCadastro";

type PacienteLocalModuloProps = {
  id: string;
  active:
    | "Prontuario"
    | "Tratamentos"
    | "Financeiro"
    | "Documentos"
    | "Historico";
  title: string;
  description: string;
};

export default function PacienteLocalModulo({
  id,
  active,
  title,
  description,
}: PacienteLocalModuloProps) {
  const router = useRouter();
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

  const paciente = useMemo(() => {
    const pacientes = JSON.parse(pacientesSnapshot) as PacienteLocal[];
    return pacientes.find((item) => item.id === Number(id)) ?? null;
  }, [id, pacientesSnapshot]);

  useEffect(() => {
    if (paciente?.tipoAtendimento === "estetica") {
      const abaPorModulo = {
        Prontuario: "prontuario",
        Tratamentos: "tratamentos",
        Financeiro: "financeiro",
        Documentos: "documentos",
        Historico: "historico",
      } as const;

      router.replace(
        `/estetica-odontologica?paciente=${encodeURIComponent(
          paciente.nome
        )}&pacienteId=${paciente.id}&aba=${abaPorModulo[active]}`
      );
    }
  }, [active, paciente, router]);

  if (!paciente) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar active="Pacientes" />
          <section className="flex-1 p-8">
            <h2 className="text-3xl font-bold">Paciente não encontrado</h2>
            <Link
              href="/pacientes"
              className="mt-6 inline-block rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white"
            >
              Voltar para pacientes
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (paciente.tipoAtendimento === "estetica") {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar active="Pacientes" />
          <section className="flex-1 p-8">
            <h2 className="text-3xl font-bold">Abrindo ficha HOF</h2>
            <p className="mt-2 text-slate-500">
              Este paciente usa a ficha de Estética / HOF.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

        <section className="flex-1 p-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <Link
              href={`/pacientes/${paciente.id}`}
              className="text-sm font-semibold text-slate-500 hover:text-cyan-700"
            >
              ← Voltar para resumo
            </Link>
            <h1 className="mt-3 text-3xl font-bold">
              {title} de {paciente.nome}
            </h1>
            <p className="mt-1 text-slate-500">{description}</p>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <PacienteTabs pacienteId={paciente.id} active={active} />
            </div>
          </div>

          {active === "Prontuario" && (
            <div className="mt-6">
              <PatientProntuarioEditor
                pacienteId={paciente.id}
                pacienteNome={paciente.nome}
              />
            </div>
          )}

          {active === "Tratamentos" && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Tratamentos</p>
                  <h3 className="mt-3 text-3xl font-bold">1</h3>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Status</p>
                  <h3 className="mt-3 text-3xl font-bold">{paciente.status}</h3>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Próximo retorno</p>
                  <h3 className="mt-3 text-3xl font-bold">
                    {paciente.retorno || "Não agendado"}
                  </h3>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Tratamentos do paciente</h3>
                <PatientTreatmentsEditor pacienteId={paciente.id} />
              </div>
            </div>
          )}

          {active === "Financeiro" && (
            <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <PatientFinanceEditor
                pacienteId={paciente.id}
                convenioPadrao={paciente.convenio}
              />
            </div>
          )}

          {active === "Documentos" && (
            <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold">Documentos do paciente</h3>
              <PatientDocumentsEditor pacienteId={paciente.id} />
            </div>
          )}

          {active === "Historico" && (
            <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold">Linha do tempo</h3>
              <PatientHistoryEditor pacienteId={paciente.id} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
