"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PacienteCadastroFicha from "@/components/PacienteCadastroFicha";
import PacienteFichaConteudo from "@/components/PacienteFichaConteudo";
import PacienteTabs from "@/components/PacienteTabs";
import { PatientHeaderLiveInfo } from "@/components/PatientSummaryLiveSections";
import TopMenu from "@/components/TopMenu";
import { getOdontogramaPadrao } from "@/data/odontograma";
import { getPacienteById } from "@/utils/cliniplusStore";
import type { PacienteLocal } from "@/utils/localCadastro";
import {
  getPacienteTabActive,
  normalizarAbaPaciente,
} from "@/utils/pacienteAbas";

export default function PacienteLocalDetalhes({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const isProntuario = searchParams.get("aba") === "prontuario";
  const abaAtual = normalizarAbaPaciente(searchParams.get("aba"));
  const plano = searchParams.get("plano") ?? undefined;
  const modo = searchParams.get("modo") ?? undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  const pacientesSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("cliniplus:pacientes", onStoreChange);
      window.addEventListener("cliniplus:store", onStoreChange);
      window.addEventListener("storage", onStoreChange);

      return () => {
        window.removeEventListener("cliniplus:pacientes", onStoreChange);
        window.removeEventListener("cliniplus:store", onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () =>
      mounted
        ? [
            window.localStorage.getItem("cliniplus-pacientes") ?? "[]",
            window.localStorage.getItem("cliniplus:pacientes") ?? "[]",
          ].join("|")
        : "[]",
    () => "[]"
  );

  const paciente = useMemo(() => {
    if (!mounted) {
      return null;
    }

    return (getPacienteById(id) as PacienteLocal | null) ?? null;
  }, [id, mounted, pacientesSnapshot]);

  const iniciais = useMemo(() => {
    return paciente
      ? paciente.nome
          .split(" ")
          .map((nome) => nome[0])
          .slice(0, 2)
          .join("")
      : "";
  }, [paciente]);

  useEffect(() => {
    if (mounted && isProntuario && paciente?.tipoAtendimento === "estetica") {
      router.replace(
        `/estetica-odontologica?paciente=${encodeURIComponent(
          paciente.nome
        )}&pacienteId=${paciente.id}&aba=${abaAtual}`
      );
    }
  }, [abaAtual, isProntuario, mounted, paciente, router]);

  const activeMenu = isProntuario ? "Prontuários" : "Pacientes";

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <TopMenu active={activeMenu} />
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
        <TopMenu active="Pacientes" />
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
        <TopMenu active="Pacientes" />
        <section className="min-w-0 p-6 pt-20">
          <PacienteCadastroFicha paciente={paciente} />
        </section>
      </main>
    );
  }

  const pacienteQuery = encodeURIComponent(paciente.nome);

  if (paciente.tipoAtendimento === "estetica") {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <TopMenu active="Prontuários" />
        <section className="min-w-0 p-6 pt-20">
          <h2 className="text-3xl font-bold">Abrindo ficha HOF</h2>
          <p className="mt-2 text-slate-500">
            Este paciente usa a ficha de Estetica / HOF, sem odontograma.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <TopMenu active={activeMenu} />
      <section className="min-w-0 p-6 pt-20">
          {abaAtual !== "prontuario" && (
            <>
              <div className="mb-5">
                <Link
                  href="/pacientes"
                  className="text-sm font-semibold text-slate-500 hover:text-cyan-700"
                >
                  Voltar para pacientes
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-cyan-700">
                      {iniciais}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold">{paciente.nome}</h1>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Paciente ativo
                        </span>
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                          Odontologia
                        </span>
                      </div>

                      <PatientHeaderLiveInfo
                        pacienteId={paciente.id}
                        telefone={paciente.telefone}
                        email={paciente.email}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/agenda/novo?paciente=${pacienteQuery}`}
                    className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
                  >
                    + Novo atendimento
                  </Link>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <PacienteTabs
                    pacienteId={paciente.id}
                    active={getPacienteTabActive(abaAtual)}
                  />
                </div>
              </div>
            </>
          )}

          <PacienteFichaConteudo
            abaAtual={abaAtual}
            pacienteId={paciente.id}
            pacienteNome={paciente.nome}
            telefone={paciente.telefone}
            email={paciente.email}
            convenio={paciente.convenio}
            ultimo={paciente.ultimo}
            plano={plano}
            modo={modo}
            registrosOdontograma={getOdontogramaPadrao(paciente.id)}
          />
      </section>
    </main>
  );
}
