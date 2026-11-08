"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Sidebar from "@/components/Sidebar";
import {
  getPerfil,
  getSessaoPlano,
  perfilPadrao,
  savePerfil,
  type PerfilUsuario,
} from "@/utils/cliniplusStore";

const tratamentos = ["Dr.", "Dra.", ""];
const especialidades = [
  "Clinica geral",
  "Ortodontia",
  "Endodontia",
  "Implantodontia",
  "Periodontia",
  "Protese",
  "Odontopediatria",
  "Cirurgia",
  "Harmonizacao orofacial",
];
const nomesPlanos: Record<string, string> = { starter: "Starter", pro: "Pro", premium: "Premium" };
const campo = "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400";

export default function Perfil() {
  const [perfil, setPerfil] = useState<PerfilUsuario>(perfilPadrao);
  const [plano, setPlano] = useState("starter");
  const [mensagem, setMensagem] = useState({ texto: "", erro: false });

  useEffect(() => {
    setPerfil(getPerfil());
    setPlano(getSessaoPlano()?.plano || "starter");
  }, []);

  function atualizar(campoPerfil: keyof PerfilUsuario, valor: string) {
    setPerfil((atual) => ({ ...atual, [campoPerfil]: valor }));
    setMensagem({ texto: "", erro: false });
  }

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!perfil.nome.trim()) {
      setMensagem({ texto: "Informe seu nome.", erro: true });
      return;
    }
    savePerfil({ ...perfil, nome: perfil.nome.trim() });
    setMensagem({ texto: "Perfil atualizado. O novo nome já aparece no sistema.", erro: false });
  }

  const iniciais = perfil.nome
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Perfil" />

        <section className="min-w-0 flex-1 px-6 py-6">
          <h1 className="text-3xl font-bold">Meu perfil</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Seu nome aparece na saudação, nos agendamentos, nas evoluções e nos planos impressos.
          </p>

          <div className="mt-8 grid gap-6 xl:grid-cols-[360px_1fr]">
            <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cyan-100 text-3xl font-bold text-cyan-700">
                {iniciais || "?"}
              </div>
              <h2 className="mt-5 text-2xl font-bold">{[perfil.tratamento, perfil.nome].filter(Boolean).join(" ")}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {[perfil.especialidade, perfil.cro].filter(Boolean).join(" · ")}
              </p>
              <Link
                href="/planos"
                className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
              >
                Plano {nomesPlanos[plano] || "Starter"}
              </Link>
            </aside>

            <form onSubmit={salvar} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="grid gap-5 md:grid-cols-[140px_1fr]">
                <label>
                  <span className="text-sm font-semibold">Tratamento</span>
                  <select value={perfil.tratamento} onChange={(event) => atualizar("tratamento", event.target.value)} className={campo}>
                    {tratamentos.map((item) => (
                      <option key={item} value={item}>
                        {item || "Nenhum"}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold">Nome completo</span>
                  <input value={perfil.nome} onChange={(event) => atualizar("nome", event.target.value)} className={campo} />
                </label>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold">CRO</span>
                  <input value={perfil.cro} onChange={(event) => atualizar("cro", event.target.value)} placeholder="Ex.: CRO-CE 12345" className={campo} />
                </label>
                <label>
                  <span className="text-sm font-semibold">Especialidade</span>
                  <select value={perfil.especialidade} onChange={(event) => atualizar("especialidade", event.target.value)} className={campo}>
                    {especialidades.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold">E-mail</span>
                  <input type="email" value={perfil.email} onChange={(event) => atualizar("email", event.target.value)} className={campo} />
                </label>
                <label>
                  <span className="text-sm font-semibold">Telefone</span>
                  <input value={perfil.telefone} onChange={(event) => atualizar("telefone", event.target.value)} className={campo} />
                </label>
              </div>

              {mensagem.texto && (
                <p className={`mt-5 rounded-xl px-4 py-3 text-sm font-bold ${mensagem.erro ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {mensagem.texto}
                </p>
              )}

              <button type="submit" className="mt-6 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700">
                Salvar perfil
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
