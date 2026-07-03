"use client";

import Sidebar from "@/components/Sidebar";
import PremiumCard from "@/components/PremiumCard";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDocumentos, getPacienteById } from "@/utils/cliniplusStore";

const documentosDemo = [
  {
    id: 1,
    pacienteId: 1,
    nome: "Radiografia panorâmica",
    paciente: "Maria Silva",
    tipo: "Radiografia",
    formato: "PDF",
    tamanho: "2.4 MB",
    data: "12/06/2026",
    origem: "Odontologia",
    status: "Anexado",
  },
  {
    id: 2,
    pacienteId: 1,
    nome: "Foto intraoral inicial",
    paciente: "Maria Silva",
    tipo: "Foto clínica",
    formato: "JPG",
    tamanho: "1.8 MB",
    data: "12/06/2026",
    origem: "Odontologia",
    status: "Anexado",
  },
  {
    id: 3,
    pacienteId: 3,
    nome: "Termo de consentimento HOF",
    paciente: "Ana Costa",
    tipo: "Termo",
    formato: "PDF",
    tamanho: "0.9 MB",
    data: "08/06/2026",
    origem: "Estética / HOF",
    status: "Assinado",
  },
  {
    id: 4,
    pacienteId: 4,
    nome: "Antes e depois - preenchimento",
    paciente: "Pedro Lima",
    tipo: "Antes e depois",
    formato: "JPG",
    tamanho: "3.1 MB",
    data: "05/06/2026",
    origem: "Estética / HOF",
    status: "Anexado",
  },
  {
    id: 5,
    pacienteId: 1,
    nome: "Orçamento odontológico",
    paciente: "Maria Silva",
    tipo: "Orçamento",
    formato: "PDF",
    tamanho: "0.9 MB",
    data: "10/06/2026",
    origem: "Financeiro",
    status: "Enviado",
  },
  {
    id: 6,
    pacienteId: 2,
    nome: "Ficha de anamnese",
    paciente: "João Almeida",
    tipo: "Anamnese",
    formato: "PDF",
    tamanho: "1.2 MB",
    data: "10/06/2026",
    origem: "Prontuário",
    status: "Anexado",
  },
];

function getTipoClasse(tipo: string) {
  if (tipo === "Radiografia") {
    return "bg-cyan-100 text-cyan-700";
  }

  if (tipo === "Foto clínica" || tipo === "Antes e depois") {
    return "bg-purple-100 text-purple-700";
  }

  if (tipo === "Termo") {
    return "bg-amber-100 text-amber-700";
  }

  if (tipo === "Orçamento") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (tipo === "Anamnese") {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getStatusClasse(status: string) {
  if (status === "Assinado") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Enviado") {
    return "bg-cyan-100 text-cyan-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function Documentos() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-600">
          Carregando documentos...
        </main>
      }
    >
      <DocumentosContent />
    </Suspense>
  );
}

function DocumentosContent() {
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
  const documentos = useMemo(
    () =>
      getDocumentos().map((documento) => {
        const paciente = getPacienteById(documento.pacienteId);

        return {
          ...documento,
          paciente: documento.paciente || paciente?.nome || "Paciente",
          formato: documento.formato || "Registro",
          tamanho: documento.tamanho || "-",
          origem: documento.origem || "Paciente",
          status: documento.status || "Anexado",
        };
      }),
    [atualizacao]
  );

  const documentosFiltrados = pacienteIdNumber
    ? documentos.filter(
        (documento) => String(documento.pacienteId) === String(pacienteIdNumber)
      )
    : documentos;

  const paciente = pacienteSelecionado?.nome || "";
  const pacienteIdQuery = pacienteSelecionado
    ? String(pacienteSelecionado.id)
    : "";

  const radiografias = documentosFiltrados.filter(
    (documento) => documento.tipo === "Radiografia"
  ).length;

  const fotos = documentosFiltrados.filter(
    (documento) =>
      documento.tipo === "Foto clínica" || documento.tipo === "Antes e depois"
  ).length;

  const assinados = documentosFiltrados.filter(
    (documento) => documento.status === "Assinado"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

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

                {paciente && (
                  <>
                    <span>›</span>
                    <span>{paciente}</span>
                  </>
                )}

                <span>›</span>
                <span>Documentos</span>
              </div>

              <h2 className="text-3xl font-bold">
                {paciente ? `Documentos de ${paciente}` : "Documentos"}
              </h2>

              <p className="mt-1 text-slate-500">
                {paciente
                  ? "Visualize radiografias, fotos, termos, anamnese e arquivos vinculados a este paciente."
                  : "Organize radiografias, fotos, termos, contratos, anamnese e arquivos dos pacientes."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {paciente && (
                <Link
                  href="/documentos"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                >
                  Ver todos
                </Link>
              )}

              <Link
                href="/pacientes"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
              >
                Ver pacientes
              </Link>

              <button
                type="button"
                className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white"
              >
                Novo documento
              </button>
            </div>
          </div>

          {paciente && (
            <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-semibold text-cyan-700">
                    Paciente selecionado
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {paciente}
                  </h3>

                  <p className="mt-2 text-sm text-cyan-700">
                    Esta página está mostrando apenas os documentos vinculados a
                    este paciente.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/pacientes/${pacienteIdQuery}?aba=prontuario`}
                    className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-cyan-700"
                  >
                    Ver prontuÃ¡rio
                  </Link>

                  <Link
                    href={`/pacientes/${pacienteIdQuery}?aba=tratamentos`}
                    className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-cyan-700"
                  >
                    Ver tratamentos
                  </Link>

                  <Link
                    href="/pacientes"
                    className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-cyan-700"
                  >
                    Voltar para pacientes
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total de documentos</p>
              <h3 className="mt-3 text-3xl font-bold">
                {documentosFiltrados.length}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {paciente ? "Deste paciente" : "Arquivos cadastrados"}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Radiografias</p>
              <h3 className="mt-3 text-3xl font-bold">{radiografias}</h3>
              <p className="mt-1 text-xs text-cyan-600">
                Exames odontológicos
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Fotos clínicas</p>
              <h3 className="mt-3 text-3xl font-bold">{fotos}</h3>
              <p className="mt-1 text-xs text-purple-600">
                Intraoral e antes/depois
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Termos assinados</p>
              <h3 className="mt-3 text-3xl font-bold">{assinados}</h3>
              <p className="mt-1 text-xs text-emerald-600">
                Consentimentos válidos
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-xl font-bold">
                    {paciente
                      ? `Arquivos de ${paciente}`
                      : "Arquivos recentes"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {paciente
                      ? "Documentos vinculados diretamente ao paciente selecionado"
                      : "Documentos vinculados aos pacientes e aos atendimentos"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Buscar documento..."
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  />

                  <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none">
                    <option>Todos</option>
                    <option>Radiografias</option>
                    <option>Fotos</option>
                    <option>Termos</option>
                    <option>Orçamentos</option>
                    <option>Anamnese</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {documentosFiltrados.map((documento) => (
                  <div
                    key={documento.id}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:border-cyan-200 hover:bg-white"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-lg font-bold">
                            {documento.nome}
                          </h4>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getTipoClasse(
                              documento.tipo
                            )}`}
                          >
                            {documento.tipo}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasse(
                              documento.status
                            )}`}
                          >
                            {documento.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Paciente:{" "}
                          <span className="font-semibold text-slate-700">
                            {documento.paciente}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {documento.formato} • {documento.tamanho} •{" "}
                          {documento.data} • {documento.origem}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Visualizar
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700"
                        >
                          Baixar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {documentosFiltrados.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <h4 className="text-lg font-bold">
                      Nenhum documento encontrado
                    </h4>
                    <p className="mt-2 text-sm text-slate-500">
                      Este paciente ainda não possui documentos anexados.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Categorias</h3>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-cyan-700">Radiografias</p>
                    <p className="mt-1 text-sm text-cyan-700">
                      Panorâmica, periapical e exames odontológicos.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-purple-50 p-4">
                    <p className="font-semibold text-purple-700">
                      Fotos clínicas
                    </p>
                    <p className="mt-1 text-sm text-purple-700">
                      Fotos intraorais, extraorais e antes/depois.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">
                      Termos e contratos
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Consentimentos, contratos e documentos assinados.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-700">
                      Orçamentos
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      PDFs enviados e aprovados pelos pacientes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-cyan-800">
                  Documentos HOF
                </h3>

                <p className="mt-2 text-sm text-cyan-700">
                  Para estética e harmonização, organize termo de
                  consentimento, fotos antes/depois, ficha estética, produtos
                  utilizados e registros do procedimento.
                </p>

                <Link
                  href={
                    paciente
                      ? `/estetica-odontologica?paciente=${encodeURIComponent(
                          paciente
                        )}&pacienteId=${pacienteIdQuery}`
                      : "/estetica-odontologica"
                  }
                  className="mt-5 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-cyan-700"
                >
                  Abrir HOF
                </Link>
              </div>

              <PremiumCard
                title="Assinatura digital"
                description="No futuro, o paciente poderá assinar termos e contratos pelo celular antes do atendimento."
              />
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <PremiumCard
              title="Armazenamento seguro"
              description="Guarde documentos, imagens, termos e exames de forma organizada por paciente."
            />

            <PremiumCard
              title="Modelos de termos"
              description="Crie termos de consentimento para odontologia, HOF, clareamento, canal e outros procedimentos."
            />

            <PremiumCard
              title="Exportação em PDF"
              description="Gere e exporte documentos do paciente para impressão, envio ou assinatura."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
