"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Sidebar from "@/components/Sidebar";
import {
  configClinicaPadrao,
  getConfigClinica,
  saveConfigClinica,
  type ConfigClinica,
} from "@/utils/cliniplusStore";

const horas = Array.from({ length: 17 }, (_, indice) => `${String(indice + 6).padStart(2, "0")}:00`);
const duracoes = ["15 min", "30 min", "45 min", "60 min", "90 min"];

const atalhos = [
  { nome: "Equipe", detalhe: "Profissionais e funções", href: "/equipe" },
  { nome: "Perfil", detalhe: "Seus dados e CRO", href: "/perfil" },
  { nome: "Plano", detalhe: "Assinatura do Clini+", href: "/planos" },
];

const campo = "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400";

export default function ConfiguracoesClient() {
  const [config, setConfig] = useState<ConfigClinica>(configClinicaPadrao);
  const [mensagem, setMensagem] = useState({ texto: "", erro: false });

  useEffect(() => {
    setConfig(getConfigClinica());
  }, []);

  function atualizar(campoConfig: keyof ConfigClinica, valor: string) {
    setConfig((atual) => ({ ...atual, [campoConfig]: valor }));
    setMensagem({ texto: "", erro: false });
  }

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config.nomeClinica.trim()) {
      setMensagem({ texto: "Informe o nome da clínica.", erro: true });
      return;
    }
    if (config.horaFechamento <= config.horaAbertura) {
      setMensagem({ texto: "O horário de fechamento precisa ser depois da abertura.", erro: true });
      return;
    }
    saveConfigClinica({ ...config, nomeClinica: config.nomeClinica.trim() });
    setMensagem({ texto: "Configurações salvas.", erro: false });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Configuracoes" />

        <section className="min-w-0 flex-1 px-6 py-6">
          <form onSubmit={salvar}>
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-bold">Configurações da clínica</h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Esses dados aparecem nos planos de tratamento impressos e definem a agenda.
                </p>
              </div>
              <button type="submit" className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700">
                Salvar alterações
              </button>
            </div>

            {mensagem.texto && (
              <p className={`mt-5 rounded-xl px-4 py-3 text-sm font-bold ${mensagem.erro ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                {mensagem.texto}
              </p>
            )}

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {atalhos.map((atalho) => (
                <Link
                  key={atalho.nome}
                  href={atalho.href}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50"
                >
                  <p className="text-sm font-bold">{atalho.nome}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{atalho.detalhe}</p>
                </Link>
              ))}
            </div>

            <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Dados da clínica</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold">Nome da clínica</span>
                  <input value={config.nomeClinica} onChange={(event) => atualizar("nomeClinica", event.target.value)} className={campo} />
                </label>
                <label>
                  <span className="text-sm font-semibold">CNPJ ou CPF</span>
                  <input value={config.documento} onChange={(event) => atualizar("documento", event.target.value)} className={campo} />
                </label>
                <label>
                  <span className="text-sm font-semibold">Telefone</span>
                  <input value={config.telefone} onChange={(event) => atualizar("telefone", event.target.value)} className={campo} />
                </label>
                <label>
                  <span className="text-sm font-semibold">E-mail</span>
                  <input type="email" value={config.email} onChange={(event) => atualizar("email", event.target.value)} className={campo} />
                </label>
                <label className="md:col-span-2">
                  <span className="text-sm font-semibold">Endereço</span>
                  <input value={config.endereco} onChange={(event) => atualizar("endereco", event.target.value)} className={campo} />
                </label>
                <label className="md:col-span-2">
                  <span className="text-sm font-semibold">Especialidades atendidas</span>
                  <input value={config.areaAtuacao} onChange={(event) => atualizar("areaAtuacao", event.target.value)} className={campo} />
                </label>
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Agenda</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <label>
                  <span className="text-sm font-semibold">Abertura</span>
                  <select value={config.horaAbertura} onChange={(event) => atualizar("horaAbertura", event.target.value)} className={campo}>
                    {horas.map((hora) => (
                      <option key={hora}>{hora}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold">Fechamento</span>
                  <select value={config.horaFechamento} onChange={(event) => atualizar("horaFechamento", event.target.value)} className={campo}>
                    {horas.map((hora) => (
                      <option key={hora}>{hora}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold">Duração padrão do atendimento</span>
                  <select value={config.duracaoConsulta} onChange={(event) => atualizar("duracaoConsulta", event.target.value)} className={campo}>
                    {duracoes.map((duracao) => (
                      <option key={duracao}>{duracao}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-500">
                A grade da agenda mostra os horários entre a abertura e o fechamento, e novos agendamentos começam com a duração padrão.
              </p>
            </section>
          </form>
        </section>
      </div>
    </main>
  );
}
