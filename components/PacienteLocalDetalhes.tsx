"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PacienteCadastroFicha from "@/components/PacienteCadastroFicha";
import PacienteProntuarioBase from "@/components/PacienteProntuarioBase";
import Sidebar from "@/components/Sidebar";
import { getPacienteById } from "@/utils/cliniplusStore";
import type { CliniplusPaciente } from "@/utils/cliniplusStore";

export default function PacienteLocalDetalhes({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const isProntuario = searchParams.get("aba") === "prontuario";

  useEffect(() => {
    setMounted(true);
  }, []);

  const pacientesSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("cliniplus:store", onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener("cliniplus:store", onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () =>
      mounted
        ? window.localStorage.getItem("cliniplus-pacientes") ?? "[]"
        : "[]",
    () => "[]"
  );

  const paciente = useMemo(() => {
    if (!mounted) {
      return null;
    }

    return (getPacienteById(id) as CliniplusPaciente | null) ?? null;
  }, [id, mounted, pacientesSnapshot]);


  const activeMenu = isProntuario ? "Prontuários" : "Pacientes";

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <Sidebar active={activeMenu} />
        <section className="min-w-0 p-6 pt-20">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm">
            Carregando paciente...
          </div>
        </section>
      </main>
    );
  }

  if (!paciente) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <Sidebar active="Pacientes" />
        <section className="min-w-0 p-6 pt-20">
          <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-black">Paciente nao encontrado</h2>
            <p className="mt-2 text-slate-500">
              Nao encontramos esse cadastro na base local.
            </p>
            <Link
              href="/pacientes"
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-indigo-600 px-5 text-sm font-black text-white"
            >
              Voltar para pacientes
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!isProntuario) {
    return (
      <main className="min-h-screen bg-[#f6f8ff] text-slate-950">
        <Sidebar active="Pacientes" />
        <section className="min-w-0 p-6 pt-20">
          <PacienteCadastroFicha paciente={paciente} />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar active={activeMenu} />
      <section className="min-w-0 p-6 pt-20">
        <PacienteProntuarioBase
          pacienteId={Number(paciente.id)}
          pacienteNome={paciente.nome}
          telefone={paciente.telefone}
          email={paciente.email}
          convenio={paciente.convenio}
          ultimo={paciente.ultimo}
        />
      </section>
    </main>
  );
}
