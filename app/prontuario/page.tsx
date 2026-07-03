"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { pacientes as pacientesBase } from "@/data/pacientes";
import { getPacientes, type CliniplusPaciente } from "@/utils/cliniplusStore";

function getInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function subscribeStore(onStoreChange: () => void) {
  window.addEventListener("cliniplus:store", onStoreChange);
  window.addEventListener("cliniplus:pacientes", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("cliniplus:store", onStoreChange);
    window.removeEventListener("cliniplus:pacientes", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export default function Prontuario() {
  const [busca, setBusca] = useState("");
  const pacientesSnapshot = useSyncExternalStore(
    subscribeStore,
    () => JSON.stringify(getPacientes()),
    () => "[]"
  );

  const pacientes = useMemo(() => {
    try {
      const pacientesStore = JSON.parse(pacientesSnapshot) as CliniplusPaciente[];

      if (pacientesStore.length > 0) {
        return pacientesStore;
      }

      return pacientesBase.map((paciente) => ({ ...paciente }));
    } catch {
      return pacientesBase.map((paciente) => ({ ...paciente }));
    }
  }, [pacientesSnapshot]);

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return pacientes;
    }

    return pacientes.filter((paciente) => {
      return [
        paciente.nome,
        paciente.email,
        paciente.telefone,
        paciente.convenio,
        paciente.area,
      ]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termo));
    });
  }, [busca, pacientes]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Prontuarios" />

        <section className="flex-1 min-w-0 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-indigo-700">
                Prontuarios
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">
                Prontuarios
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
                Busque um paciente e abra a estrutura de prontuario vinculada a
                ficha dele.
              </p>
            </div>

            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar paciente..."
                className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_180px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-black uppercase text-slate-500 max-lg:hidden">
              <span>Paciente</span>
              <span>Contato</span>
              <span>Convênio</span>
              <span className="text-right">Ação</span>
            </div>

            <div className="divide-y divide-slate-100">
              {pacientesFiltrados.map((paciente) => (
                <article
                  key={String(paciente.id)}
                  className="grid gap-4 px-5 py-4 transition hover:bg-indigo-50/40 lg:grid-cols-[1.4fr_1fr_1fr_180px] lg:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-black text-indigo-700">
                      {getInitials(paciente.nome)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-black text-slate-950">
                        {paciente.nome}
                      </h2>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {paciente.area || "Sem area informada"}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 text-sm font-semibold text-slate-600">
                    <p className="truncate">{paciente.telefone}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {paciente.email}
                    </p>
                  </div>

                  <div className="text-sm font-semibold text-slate-600">
                    <p>{paciente.convenio || "Particular"}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Último atendimento: {paciente.ultimo || "Sem registro"}
                    </p>
                  </div>

                  <Link
                    href={`/pacientes/${paciente.id}?aba=prontuario&secao=resumo`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white transition hover:bg-indigo-700"
                  >
                    <UserRound size={16} />
                    Abrir prontuario
                  </Link>
                </article>
              ))}

              {pacientesFiltrados.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <h2 className="text-lg font-black text-slate-900">
                    Nenhum paciente encontrado
                  </h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Ajuste a busca para localizar um prontuario existente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
