"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { membrosEquipe } from "@/data/equipe";

type MembroCliniplus = {
  id: number;
  nome: string;
  cargo: string;
  especialidade: string;
  email: string;
  telefone: string;
  status: "Ativo" | "Inativo";
};

const equipeKey = "equipe-cliniplus";

const equipeInicial: MembroCliniplus[] = membrosEquipe.map((membro) => ({
  id: membro.id,
  nome: membro.nome,
  cargo: membro.cargo,
  especialidade: membro.profissao,
  email: `${membro.nome.toLowerCase().replace(/\s+/g, ".")}@cliniplus.demo`,
  telefone: "(11) 99999-0000",
  status: membro.status === "Ativo" ? "Ativo" : "Inativo",
}));

function lerEquipe() {
  if (typeof window === "undefined") {
    return equipeInicial;
  }

  const salvo = window.localStorage.getItem(equipeKey);

  if (!salvo) {
    return equipeInicial;
  }

  try {
    return JSON.parse(salvo) as MembroCliniplus[];
  } catch {
    return equipeInicial;
  }
}

export default function EquipeClient() {
  const [equipe, setEquipe] = useState<MembroCliniplus[]>(equipeInicial);
  const [mensagem, setMensagem] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novo, setNovo] = useState({
    nome: "",
    cargo: "",
    especialidade: "",
    email: "",
    telefone: "",
    status: "Ativo" as "Ativo" | "Inativo",
  });

  useEffect(() => {
    setEquipe(lerEquipe());
  }, []);

  const ativos = useMemo(
    () => equipe.filter((membro) => membro.status === "Ativo").length,
    [equipe]
  );
  const inativos = equipe.length - ativos;

  function salvarEquipe(next: MembroCliniplus[]) {
    setEquipe(next);
    window.localStorage.setItem(equipeKey, JSON.stringify(next));
  }

  function adicionarProfissional() {
    if (!novo.nome.trim()) {
      return;
    }

    salvarEquipe([
      ...equipe,
      {
        id: Date.now(),
        ...novo,
      },
    ]);
    setNovo({
      nome: "",
      cargo: "",
      especialidade: "",
      email: "",
      telefone: "",
      status: "Ativo",
    });
    setMensagem("Profissional adicionado a equipe.");
  }

  function atualizarMembro<K extends keyof Omit<MembroCliniplus, "id">>(
    id: number,
    key: K,
    value: MembroCliniplus[K]
  ) {
    salvarEquipe(
      equipe.map((membro) =>
        membro.id === id ? { ...membro, [key]: value } : membro
      )
    );
    setMensagem("Profissional atualizado.");
  }

  function removerMembro(id: number) {
    salvarEquipe(equipe.filter((membro) => membro.id !== id));
    setEditandoId(null);
    setMensagem("Profissional removido.");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <Sidebar active="Equipe" />

        <section className="min-w-0 flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
                  Gestao
                </p>
                <h1 className="mt-2 text-3xl font-bold">Equipe</h1>
                <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                  Cadastre profissionais, funcoes e status de acesso da clinica.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Profissionais</p>
                <h2 className="mt-3 text-3xl font-bold">{equipe.length}</h2>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Ativos</p>
                <h2 className="mt-3 text-3xl font-bold text-emerald-700">
                  {ativos}
                </h2>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Inativos</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-600">
                  {inativos}
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Adicionar profissional</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Os dados ficam salvos em {equipeKey}.
                </p>

                {mensagem && (
                  <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {mensagem}
                  </p>
                )}

                <div className="mt-6 space-y-4">
                  {[
                    ["Nome", "nome"],
                    ["Cargo / funcao", "cargo"],
                    ["Especialidade", "especialidade"],
                    ["E-mail", "email"],
                    ["Telefone", "telefone"],
                  ].map(([label, key]) => (
                    <label key={key} className="block">
                      <span className="text-sm font-semibold text-slate-800">
                        {label}
                      </span>
                      <input
                        value={novo[key as keyof typeof novo]}
                        onChange={(event) =>
                          setNovo((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                      />
                    </label>
                  ))}

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">
                      Status
                    </span>
                    <select
                      value={novo.status}
                      onChange={(event) =>
                        setNovo((current) => ({
                          ...current,
                          status: event.target.value as "Ativo" | "Inativo",
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    >
                      <option>Ativo</option>
                      <option>Inativo</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={adicionarProfissional}
                    className="w-full rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
                  >
                    Adicionar profissional
                  </button>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Lista da equipe</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Profissionais cadastrados no espaco de trabalho.
                </p>

                <div className="mt-6 space-y-3">
                  {equipe.map((membro) => (
                    <div
                      key={membro.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="flex min-w-0 items-center gap-4">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-700">
                            {membro.nome
                              .split(" ")
                              .map((parte) => parte[0])
                              .slice(0, 2)
                              .join("")}
                          </span>

                          {editandoId === membro.id ? (
                            <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-2">
                              <input
                                value={membro.nome}
                                onChange={(event) =>
                                  atualizarMembro(
                                    membro.id,
                                    "nome",
                                    event.target.value
                                  )
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                              />
                              <input
                                value={membro.cargo}
                                onChange={(event) =>
                                  atualizarMembro(
                                    membro.id,
                                    "cargo",
                                    event.target.value
                                  )
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                              />
                              <input
                                value={membro.especialidade}
                                onChange={(event) =>
                                  atualizarMembro(
                                    membro.id,
                                    "especialidade",
                                    event.target.value
                                  )
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                              />
                              <input
                                value={membro.email}
                                onChange={(event) =>
                                  atualizarMembro(
                                    membro.id,
                                    "email",
                                    event.target.value
                                  )
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                              />
                              <input
                                value={membro.telefone}
                                onChange={(event) =>
                                  atualizarMembro(
                                    membro.id,
                                    "telefone",
                                    event.target.value
                                  )
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                              />
                              <select
                                value={membro.status}
                                onChange={(event) =>
                                  atualizarMembro(
                                    membro.id,
                                    "status",
                                    event.target.value as "Ativo" | "Inativo"
                                  )
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                              >
                                <option>Ativo</option>
                                <option>Inativo</option>
                              </select>
                            </div>
                          ) : (
                            <div className="min-w-0">
                              <p className="truncate font-bold">{membro.nome}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                {membro.cargo} • {membro.especialidade}
                              </p>
                              <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                                {membro.email} • {membro.telefone}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <span
                            className={
                              membro.status === "Ativo"
                                ? "w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
                                : "w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600"
                            }
                          >
                            {membro.status}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditandoId((current) =>
                                current === membro.id ? null : membro.id
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                          >
                            {editandoId === membro.id ? "Concluir" : "Editar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removerMembro(membro.id)}
                            className="rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-600"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
