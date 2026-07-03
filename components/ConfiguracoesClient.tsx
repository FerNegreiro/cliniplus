"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

type ConfigCliniplus = {
  nomeClinica: string;
  documento: string;
  telefone: string;
  email: string;
  endereco: string;
  areaAtuacao: string;
  horarioFuncionamento: string;
  duracaoConsulta: string;
  confirmacaoWhatsApp: boolean;
  temaVisual: string;
};

const storageKey = "configuracoes-cliniplus";

const configInicial: ConfigCliniplus = {
  nomeClinica: "Clini+ Odontologia",
  documento: "00.000.000/0000-00",
  telefone: "(11) 99999-0000",
  email: "contato@cliniplus.demo",
  endereco: "Rua das Flores, 123",
  areaAtuacao: "Odontologia",
  horarioFuncionamento: "Segunda a sexta, 08:00 as 18:00",
  duracaoConsulta: "30 minutos",
  confirmacaoWhatsApp: true,
  temaVisual: "Claro",
};

const modulosConfiguracoes = [
  { nome: "Clinica", detalhe: "Dados cadastrais", href: "/configuracoes" },
  { nome: "Usuarios", detalhe: "Equipe e acessos", href: "/equipe" },
  {
    nome: "Integracoes",
    detalhe: "Conexoes externas",
    href: "/relatorios?modulo=integracoes",
  },
  {
    nome: "Assinatura eletronica",
    detalhe: "Termos e contratos",
    href: "/relatorios?modulo=assinatura-eletronica",
  },
  {
    nome: "IA no prontuario",
    detalhe: "Apoio inteligente",
    href: "/relatorios?modulo=ia-prontuario",
  },
  {
    nome: "Laboratorio",
    detalhe: "Pedidos e prazos",
    href: "/relatorios?modulo=laboratorio",
  },
];

function lerConfiguracoes() {
  if (typeof window === "undefined") {
    return configInicial;
  }

  const salvo = window.localStorage.getItem(storageKey);

  if (!salvo) {
    return configInicial;
  }

  try {
    return { ...configInicial, ...(JSON.parse(salvo) as ConfigCliniplus) };
  } catch {
    return configInicial;
  }
}

export default function ConfiguracoesClient() {
  const [config, setConfig] = useState<ConfigCliniplus>(configInicial);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    setConfig(lerConfiguracoes());
  }, []);

  function updateField<K extends keyof ConfigCliniplus>(
    key: K,
    value: ConfigCliniplus[K]
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
    setMensagem("");
  }

  function salvar() {
    window.localStorage.setItem(storageKey, JSON.stringify(config));
    setMensagem("Configuracoes salvas.");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Configuracoes" />

        <section className="min-w-0 flex-1 px-6 py-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
                Gestao
              </p>
              <h1 className="mt-2 text-3xl font-bold">Configuracoes</h1>
              <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-slate-500">
                Ajustes basicos da clinica e preferencias de atendimento.
              </p>
            </div>

            <button
              type="button"
              onClick={salvar}
              className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
            >
              Salvar configuracoes
            </button>
          </div>

          {mensagem && (
            <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {mensagem}
            </p>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {modulosConfiguracoes.map((modulo) => (
              <Link
                key={modulo.nome}
                href={modulo.href}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50"
              >
                <p className="text-sm font-bold text-slate-900">{modulo.nome}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {modulo.detalhe}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Dados da clinica</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Informacoes principais usadas no sistema.
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label>
                    <span className="text-sm font-semibold">
                      Nome da clinica
                    </span>
                    <input
                      value={config.nomeClinica}
                      onChange={(event) =>
                        updateField("nomeClinica", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label>
                    <span className="text-sm font-semibold">CNPJ/CPF</span>
                    <input
                      value={config.documento}
                      onChange={(event) =>
                        updateField("documento", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label>
                    <span className="text-sm font-semibold">Telefone</span>
                    <input
                      value={config.telefone}
                      onChange={(event) =>
                        updateField("telefone", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label>
                    <span className="text-sm font-semibold">E-mail</span>
                    <input
                      value={config.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label className="md:col-span-2">
                    <span className="text-sm font-semibold">Endereco</span>
                    <input
                      value={config.endereco}
                      onChange={(event) =>
                        updateField("endereco", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label>
                    <span className="text-sm font-semibold">
                      Area de atuacao
                    </span>
                    <input
                      value={config.areaAtuacao}
                      onChange={(event) =>
                        updateField("areaAtuacao", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Preferencias</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Rotina operacional e visual do Clini+.
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label>
                    <span className="text-sm font-semibold">
                      Horario de funcionamento
                    </span>
                    <input
                      value={config.horarioFuncionamento}
                      onChange={(event) =>
                        updateField("horarioFuncionamento", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    />
                  </label>
                  <label>
                    <span className="text-sm font-semibold">
                      Duracao padrao da consulta
                    </span>
                    <select
                      value={config.duracaoConsulta}
                      onChange={(event) =>
                        updateField("duracaoConsulta", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    >
                      <option>15 minutos</option>
                      <option>30 minutos</option>
                      <option>45 minutos</option>
                      <option>60 minutos</option>
                    </select>
                  </label>
                  <label>
                    <span className="text-sm font-semibold">Tema visual</span>
                    <select
                      value={config.temaVisual}
                      onChange={(event) =>
                        updateField("temaVisual", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                    >
                      <option>Claro</option>
                      <option>Contraste suave</option>
                      <option>Compacto</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <span>
                      <span className="block text-sm font-bold">
                        Confirmacao manual por WhatsApp
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-slate-500">
                        Usa WhatsApp Web sem automacao.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={config.confirmacaoWhatsApp}
                      onChange={(event) =>
                        updateField("confirmacaoWhatsApp", event.target.checked)
                      }
                      className="h-5 w-5 accent-cyan-600"
                    />
                  </label>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">Resumo</h2>
                <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
                  <p>{config.nomeClinica}</p>
                  <p>{config.areaAtuacao}</p>
                  <p>{config.telefone}</p>
                  <p>{config.horarioFuncionamento}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
                <h2 className="text-xl font-bold text-cyan-900">
                  Configuracao local
                </h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-cyan-800">
                  Enquanto nao ha backend real, estas preferencias ficam salvas
                  no navegador em {storageKey}.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
