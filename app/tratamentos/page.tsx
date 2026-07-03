"use client";

import Sidebar from "@/components/Sidebar";
import PremiumCard from "@/components/PremiumCard";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getPacienteById,
  getTratamentos,
  type StoreId,
} from "@/utils/cliniplusStore";

const tratamentosDemo = [
  {
    id: 1,
    pacienteId: 1,
    paciente: "Maria Silva",
    dente: "16",
    procedimento: "Restauração",
    status: "Em andamento",
    progresso: "60%",
    valor: "R$ 280",
    proximaSessao: "24/06/2026",
  },
  {
    id: 2,
    pacienteId: 1,
    paciente: "Maria Silva",
    dente: "21",
    procedimento: "Clareamento",
    status: "Planejado",
    progresso: "10%",
    valor: "R$ 450",
    proximaSessao: "28/06/2026",
  },
  {
    id: 3,
    pacienteId: 1,
    paciente: "Maria Silva",
    dente: "36",
    procedimento: "Canal",
    status: "Urgente",
    progresso: "25%",
    valor: "R$ 750",
    proximaSessao: "22/06/2026",
  },
  {
    id: 4,
    pacienteId: 4,
    paciente: "Pedro Lima",
    dente: "24",
    procedimento: "Limpeza + Profilaxia",
    status: "Concluído",
    progresso: "100%",
    valor: "R$ 180",
    proximaSessao: "Concluído",
  },
];

function getStatusClasse(status: string) {
  if (status === "Urgente") {
    return "bg-red-100 text-red-700";
  }

  if (status === "Em andamento") {
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

function getBarraClasse(status: string) {
  if (status === "Urgente") {
    return "bg-red-500";
  }

  if (status === "Em andamento") {
    return "bg-amber-500";
  }

  if (status === "Planejado") {
    return "bg-cyan-500";
  }

  if (status === "Concluído") {
    return "bg-emerald-500";
  }

  return "bg-slate-500";
}

function getLinkPaciente(pacienteId: StoreId) {
  return `/pacientes/${pacienteId}`;
}

export default function Tratamentos() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-bold text-slate-600">
          Carregando tratamentos...
        </main>
      }
    >
      <TratamentosContent />
    </Suspense>
  );
}

function TratamentosContent() {
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get("pacienteId") || "";
  const [atualizacao, setAtualizacao] = useState(0);

  useEffect(() => {
    const atualizar = () => setAtualizacao((valor) => valor + 1);

    window.addEventListener("cliniplus:store", atualizar);
    window.addEventListener("storage", atualizar);

    return () => {
      window.removeEventListener("cliniplus:store", atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);

  const pacienteIdNumber = pacienteId ? Number(pacienteId) : null;

  const pacienteSelecionado = pacienteIdNumber
    ? getPacienteById(pacienteIdNumber)
    : null;
  const tratamentos = useMemo(
    () =>
      getTratamentos().map((tratamento) => {
        const paciente = getPacienteById(tratamento.pacienteId);

        return {
          id: tratamento.id,
          pacienteId: tratamento.pacienteId,
          paciente: tratamento.paciente || paciente?.nome || "Paciente",
          dente: "-",
          procedimento: tratamento.descricao,
          status: tratamento.status,
          progresso:
            tratamento.status === "Concluido" || tratamento.status === "ConcluÃ­do"
              ? "100%"
              : tratamento.status === "Em tratamento" ||
                  tratamento.status === "Em andamento"
                ? "60%"
                : "25%",
          valor: tratamento.valor || "Sem valor",
          proximaSessao: tratamento.data || "Sem data",
        };
      }),
    [atualizacao]
  );

  const tratamentosFiltrados = pacienteIdNumber
    ? tratamentos.filter(
        (tratamento) => String(tratamento.pacienteId) === String(pacienteIdNumber)
      )
    : tratamentos;

  const emAndamento = tratamentosFiltrados.filter(
    (tratamento) => tratamento.status === "Em andamento"
  ).length;

  const urgentes = tratamentosFiltrados.filter(
    (tratamento) => tratamento.status === "Urgente"
  ).length;

  const concluidos = tratamentosFiltrados.filter(
    (tratamento) => tratamento.status === "Concluído"
  ).length;

  const planejados = tratamentosFiltrados.filter(
    (tratamento) => tratamento.status === "Planejado"
  ).length;

  const nomePaciente = pacienteSelecionado?.nome || "";
  const pacienteIdQuery = pacienteSelecionado
    ? String(pacienteSelecionado.id)
    : "";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Tratamentos" />

        <section className="min-w-0 flex-1 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Link
                  href="/pacientes"
                  className="font-semibold hover:text-cyan-700"
                >
                  Pacientes
                </Link>

                {pacienteSelecionado && (
                  <>
                    <span>›</span>
                    <Link
                      href={getLinkPaciente(pacienteSelecionado.id)}
                      className="font-semibold hover:text-cyan-700"
                    >
                      {pacienteSelecionado.nome}
                    </Link>
                  </>
                )}

                <span>›</span>
                <span>Tratamentos</span>
              </div>

              <h2 className="text-3xl font-bold">
                {pacienteSelecionado
                  ? `Tratamentos de ${pacienteSelecionado.nome}`
                  : "Tratamentos"}
              </h2>

              <p className="mt-1 text-slate-500">
                {pacienteSelecionado
                  ? "Acompanhe os tratamentos odontológicos vinculados a este paciente."
                  : "Acompanhe tratamentos odontológicos, estética, harmonização, progresso e próximas sessões."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {pacienteSelecionado && (
                <Link
                  href="/tratamentos"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                >
                  Ver todos
                </Link>
              )}

              <Link
                href="/pacientes"
                className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
              >
                Ver pacientes
              </Link>
            </div>
          </div>

          {pacienteSelecionado && (
            <div className="mt-8 rounded-3xl border border-cyan-100 bg-cyan-50 p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-semibold text-cyan-700">
                    Paciente selecionado
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {pacienteSelecionado.nome}
                  </h3>

                  <p className="mt-2 text-sm text-cyan-700">
                    Esta página está mostrando apenas os tratamentos deste
                    paciente usando o ID {pacienteSelecionado.id}.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/pacientes/${pacienteIdQuery}?aba=prontuario`}
                    className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-cyan-700"
                  >
                    Ver prontuário
                  </Link>

                  <Link
                    href={`/pacientes/${pacienteIdQuery}?aba=documentos`}
                    className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-cyan-700"
                  >
                    Ver documentos
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Tratamentos ativos</p>
              <h3 className="mt-3 text-3xl font-bold">{emAndamento}</h3>
              <p className="mt-2 text-xs text-amber-600">
                Em acompanhamento
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Urgentes</p>
              <h3 className="mt-3 text-3xl font-bold">{urgentes}</h3>
              <p className="mt-2 text-xs text-red-600">
                Precisam de atenção rápida
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Planejados</p>
              <h3 className="mt-3 text-3xl font-bold">{planejados}</h3>
              <p className="mt-2 text-xs text-cyan-700">Aguardando início</p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Concluídos</p>
              <h3 className="mt-3 text-3xl font-bold">{concluidos}</h3>
              <p className="mt-2 text-xs text-emerald-600">Finalizados</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Link
              href={
                pacienteSelecionado
                  ? `/estetica-odontologica?paciente=${encodeURIComponent(
                      pacienteSelecionado.nome
                    )}`
                  : "/estetica-odontologica"
              }
              className="block rounded-3xl border border-cyan-100 bg-cyan-50 p-6 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-100"
            >
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-cyan-700">
                      Odontologia Estética / HOF
                    </p>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                      Abrir
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Harmonização e procedimentos estéticos
                  </h3>

                  <p className="mt-2 text-sm text-cyan-700">
                    Controle avaliação estética, fotos antes/depois, produtos
                    utilizados, termos, retornos e evolução visual.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-500">Procedimentos</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      18
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-500">Em retorno</p>
                    <p className="mt-1 text-2xl font-bold text-amber-600">
                      6
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-emerald-700">
                Plano de tratamento
              </p>

              <h3 className="mt-3 text-xl font-bold text-slate-900">
                Tratamentos odontológicos completos
              </h3>

              <p className="mt-2 text-sm text-emerald-700">
                Organize etapas, sessões, valores, documentos e evolução do
                paciente em um só lugar.
              </p>

              <Link
                href="/orcamentos"
                className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                Criar orçamento
              </Link>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-amber-700">
                Documentos e termos
              </p>

              <h3 className="mt-3 text-xl font-bold text-slate-900">
                Consentimentos e anexos
              </h3>

              <p className="mt-2 text-sm text-amber-700">
                Vincule termos de consentimento, contrato, fotos e documentos
                ao tratamento do paciente.
              </p>

              <Link
                href={
                  pacienteSelecionado
                    ? `/documentos?pacienteId=${pacienteIdQuery}`
                    : "/documentos"
                }
                className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-amber-700"
              >
                Ver documentos
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {pacienteSelecionado
                      ? `Tratamentos de ${nomePaciente}`
                      : "Tratamentos em andamento"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {pacienteSelecionado
                      ? "Procedimentos vinculados a este paciente."
                      : "Procedimentos vinculados ao paciente e à ficha clínica."}
                  </p>
                </div>

                <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                  <option>Todos</option>
                  <option>Urgentes</option>
                  <option>Em andamento</option>
                  <option>Planejados</option>
                  <option>Concluídos</option>
                </select>
              </div>

              <div className="mt-6 space-y-4">
                {tratamentosFiltrados.map((tratamento) => (
                  <div
                    key={tratamento.id}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-lg font-bold">
                            {tratamento.procedimento}
                          </h4>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasse(
                              tratamento.status
                            )}`}
                          >
                            {tratamento.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Paciente:{" "}
                          <span className="font-semibold text-slate-700">
                            {tratamento.paciente}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Dente relacionado:{" "}
                          <span className="font-semibold text-slate-700">
                            {tratamento.dente}
                          </span>
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm text-slate-500">Valor</p>
                        <p className="text-xl font-bold">
                          {tratamento.valor}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Progresso</span>
                        <span className="font-semibold">
                          {tratamento.progresso}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${getBarraClasse(
                            tratamento.status
                          )}`}
                          style={{ width: tratamento.progresso }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <p className="text-sm text-slate-500">
                        Próxima sessão:{" "}
                        <span className="font-semibold text-slate-700">
                          {tratamento.proximaSessao}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={getLinkPaciente(tratamento.pacienteId)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Abrir paciente
                        </Link>

                        <Link
                          href="/financeiro/novo"
                          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Lançar pagamento
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {tratamentosFiltrados.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <h4 className="text-lg font-bold">
                      Nenhum tratamento encontrado
                    </h4>
                    <p className="mt-2 text-sm text-slate-500">
                      Este paciente ainda não possui tratamentos cadastrados.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Resumo clínico</h3>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-red-50 p-4">
                    <p className="font-semibold text-red-700">
                      Atenção urgente
                    </p>
                    <p className="mt-1 text-sm text-red-600">
                      {urgentes > 0
                        ? "Existe tratamento marcado como urgente."
                        : "Nenhum tratamento urgente no momento."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">
                      Em andamento
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      {emAndamento > 0
                        ? "Existe tratamento em acompanhamento."
                        : "Nenhum tratamento em andamento no momento."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-cyan-700">Planejado</p>
                    <p className="mt-1 text-sm text-cyan-700">
                      {planejados > 0
                        ? "Existe tratamento aguardando início."
                        : "Nenhum tratamento planejado no momento."}
                    </p>
                  </div>
                </div>
              </div>

              <PremiumCard
                title="Plano de tratamento completo"
                description="Monte várias etapas de tratamento, com valores, sessões, documentos e aceite do paciente."
              />
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Linha do tempo</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {pacienteSelecionado
                    ? `Histórico recente dos procedimentos de ${pacienteSelecionado.nome}`
                    : "Histórico recente dos procedimentos odontológicos"}
                </p>
              </div>

              <Link
                href={
                  pacienteSelecionado
                    ? `/pacientes/${pacienteIdQuery}?aba=prontuario`
                    : "/prontuario"
                }
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Ver prontuário
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {tratamentosFiltrados.map((tratamento) => (
                <div
                  key={`linha-${tratamento.id}`}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="font-semibold">
                    {tratamento.proximaSessao} - {tratamento.procedimento}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Paciente {tratamento.paciente} com procedimento{" "}
                    {tratamento.procedimento.toLowerCase()} relacionado ao
                    dente {tratamento.dente}. Status atual:{" "}
                    {tratamento.status}.
                  </p>
                </div>
              ))}

              {tratamentosFiltrados.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <p className="font-semibold">
                    Sem registros na linha do tempo
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Nenhum tratamento foi encontrado para exibir aqui.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <PremiumCard
              title="Orçamentos por tratamento"
              description="Transforme tratamentos em orçamentos completos para aprovação do paciente."
            />

            <PremiumCard
              title="Contrato e termo"
              description="Gere termos de consentimento, contratos e documentos vinculados ao tratamento."
            />

            <PremiumCard
              title="Antes e depois"
              description="Acompanhe imagens de evolução, comparativos e resultados dos procedimentos."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
