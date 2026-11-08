"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  Send,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type {
  CliniplusPaciente,
  CliniplusPlanoTratamento,
  PlanoTratamentoItem,
} from "@/utils/cliniplusStore";
import { configClinicaPadrao, getConfigClinica, nomeExibicaoProfissional } from "@/utils/cliniplusStore";

type PacientePlanoImpressaoProps = {
  paciente: CliniplusPaciente;
  planoTratamento: CliniplusPlanoTratamento;
  voltarHref: string;
  observacoesClinicas: Array<string | undefined>;
};

type PaperSize = "A4" | "Carta";
type Orientation = "retrato" | "paisagem";
type MarginMode = "padrao" | "estreita" | "larga";

const orientacoesPaciente = [
  "Manter boa higiene oral.",
  "Utilizar fio dental diariamente.",
  "Comparecer as consultas conforme agendado.",
  "Em caso de dor ou desconforto, entrar em contato.",
];

function formatDate(value?: string) {
  if (!value) {
    return "Nao informado";
  }

  const data = new Date(value);

  if (Number.isNaN(data.getTime())) {
    return value;
  }

  return data.toLocaleDateString("pt-BR");
}

function getAge(value?: string) {
  if (!value) {
    return "";
  }

  const parts = value.includes("/")
    ? value.split("/").reverse()
    : value.slice(0, 10).split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hadBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  if (!hadBirthday) {
    age -= 1;
  }

  return age > 0 ? `${age} anos` : "";
}

function getInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function statusLabel(status: PlanoTratamentoItem["status"]) {
  const labels: Record<PlanoTratamentoItem["status"], string> = {
    planejado: "Planejado",
    aguardando: "Aguardando",
    em_andamento: "Em andamento",
    concluido: "Concluido",
    cancelado: "Cancelado",
  };

  return labels[status] || status;
}

function prioridadeLabel(prioridade: PlanoTratamentoItem["prioridade"]) {
  const labels: Record<PlanoTratamentoItem["prioridade"], string> = {
    baixa: "Baixa",
    media: "Media",
    alta: "Alta",
  };

  return labels[prioridade] || prioridade;
}

function priorityClass(prioridade: PlanoTratamentoItem["prioridade"]) {
  const classes: Record<PlanoTratamentoItem["prioridade"], string> = {
    baixa: "bg-emerald-500",
    media: "bg-amber-500",
    alta: "bg-red-500",
  };

  return classes[prioridade] || "bg-slate-400";
}

function statusClass(status: PlanoTratamentoItem["status"]) {
  const classes: Record<PlanoTratamentoItem["status"], string> = {
    planejado: "bg-indigo-50 text-indigo-700",
    aguardando: "bg-amber-50 text-amber-700",
    em_andamento: "bg-blue-50 text-blue-700",
    concluido: "bg-emerald-50 text-emerald-700",
    cancelado: "bg-slate-100 text-slate-600",
  };

  return classes[status] || "bg-slate-100 text-slate-600";
}

function paperClass(paperSize: PaperSize, orientation: Orientation) {
  if (paperSize === "Carta" && orientation === "paisagem") {
    return "w-[1056px] min-h-[816px]";
  }

  if (paperSize === "Carta") {
    return "w-[816px] min-h-[1056px]";
  }

  if (orientation === "paisagem") {
    return "w-[1123px] min-h-[794px]";
  }

  return "w-[794px] min-h-[1123px]";
}

function marginClass(marginMode: MarginMode) {
  const classes: Record<MarginMode, string> = {
    estreita: "p-8",
    padrao: "p-12",
    larga: "p-16",
  };

  return classes[marginMode];
}

export default function PacientePlanoImpressao({
  paciente,
  planoTratamento,
  voltarHref,
  observacoesClinicas,
}: PacientePlanoImpressaoProps) {
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("retrato");
  const [marginMode, setMarginMode] = useState<MarginMode>("padrao");
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includePatientSignature, setIncludePatientSignature] = useState(true);
  const [zoom, setZoom] = useState(0.86);
  const [mensagem, setMensagem] = useState("");
  const [clinica, setClinica] = useState(configClinicaPadrao);
  useEffect(() => {
    setClinica(getConfigClinica());
  }, []);
  const nascimento = paciente.dataNascimento || paciente.nascimento;
  const idade = getAge(nascimento);
  const genero = paciente.genero || paciente.sexo;
  const emissao = formatDate(new Date().toISOString());
  const numeroPlano = `PLN-${String(planoTratamento.id).replace(/\D/g, "").slice(-6).padStart(6, "0")}`;
  const observacoes = useMemo(
    () =>
      observacoesClinicas
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item)),
    [observacoesClinicas]
  );

  function imprimir() {
    window.print();
  }

  function baixarPdf() {
    setMensagem("Use a opcao Salvar em PDF na janela de impressao.");
    window.print();
  }

  function enviarPaciente() {
    setMensagem("Plano preparado para envio ao paciente.");
  }

  return (
    <section className="space-y-5">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #printable-treatment-plan,
          #printable-treatment-plan * {
            visibility: visible !important;
          }

          #printable-treatment-plan {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
            transform: none !important;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: ${paperSize} ${orientation === "paisagem" ? "landscape" : "portrait"};
            margin: ${marginMode === "estreita" ? "8mm" : marginMode === "larga" ? "20mm" : "12mm"};
          }
        }
      `}</style>

      <div className="no-print flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-black text-indigo-700">
            <Link href="/prontuario">Prontuarios</Link>
            <span>&gt;</span>
            <span>{paciente.nome}</span>
            <span>&gt;</span>
            <Link href={voltarHref}>Plano de tratamento</Link>
            <span>&gt;</span>
            <span className="text-slate-700">Impressao do plano</span>
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-950">
            Impressao do plano de tratamento
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Visualize o plano antes de imprimir ou salvar em PDF.
          </p>
        </div>
        <Link
          href={voltarHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 shadow-sm"
        >
          <ArrowLeft size={16} />
          Voltar para o plano de tratamento
        </Link>
      </div>

      {mensagem && (
        <div className="no-print rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
          {mensagem}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-50/70 p-6 shadow-inner">
          <div className="flex min-w-max justify-center">
            <article
              id="printable-treatment-plan"
              className={[
                "origin-top rounded-lg bg-white text-slate-950 shadow-2xl",
                paperClass(paperSize, orientation),
                marginClass(marginMode),
              ].join(" ")}
              style={{ transform: `scale(${zoom})` }}
            >
              <header className="grid grid-cols-[1fr_320px] gap-8">
                <div className="flex gap-5">
                  {includeLogo && (
                    <div className="text-4xl font-black tracking-tight text-slate-950">
                      Clini<span className="text-emerald-500">+</span>
                    </div>
                  )}
                  <div className="text-sm font-semibold leading-relaxed text-slate-700">
                    <p className="font-black text-slate-950">{clinica.nomeClinica}</p>
                    {clinica.endereco && <p>{clinica.endereco}</p>}
                    {(clinica.telefone || clinica.email) && (
                      <p>{[clinica.telefone, clinica.email].filter(Boolean).join(" | ")}</p>
                    )}
                    {clinica.documento && <p>{clinica.documento}</p>}
                  </div>
                </div>

                <div className="text-right">
                  <h2 className="text-2xl font-black uppercase leading-tight text-indigo-950">
                    Plano de tratamento odontologico
                  </h2>
                  <div className="mt-5 space-y-1 text-sm font-black text-indigo-950">
                    <p>Data de emissao: {emissao}</p>
                    <p>Plano no: {numeroPlano}</p>
                  </div>
                </div>
              </header>

              <div className="mt-8 h-1 rounded-full bg-indigo-600" />

              <section className="mt-6 grid grid-cols-[minmax(0,1fr)_280px] gap-8">
                <div className="flex gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-2xl font-black text-indigo-700">
                    {getInitials(paciente.nome)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-indigo-950">
                      {paciente.nome}
                    </h3>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {[idade, genero, formatDate(nascimento)].filter(Boolean).join(" | ") ||
                        "Dados pessoais nao informados"}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {paciente.telefone || "Telefone nao informado"} |{" "}
                      {paciente.email || "E-mail nao informado"}
                    </p>
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-8 text-sm">
                  <p className="font-black text-slate-500">
                    Profissional responsavel
                  </p>
                  <p className="mt-2 text-lg font-black text-indigo-950">
                    {planoTratamento.profissional || nomeExibicaoProfissional()}
                  </p>
                  <p className="mt-1 font-semibold text-slate-600">
                    CRO 123456/SP
                  </p>
                </div>
              </section>

              <p className="mt-6 text-sm font-semibold leading-relaxed text-slate-700">
                Este plano de tratamento foi elaborado apos avaliacao clinica e
                radiografica, considerando as necessidades de saude bucal do
                paciente e os objetivos definidos em conjunto.
              </p>

              <section className="mt-6">
                <h3 className="text-sm font-black uppercase text-indigo-800">
                  Fases do tratamento
                </h3>
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[11px] font-black uppercase text-indigo-950">
                      <tr>
                        <th className="px-4 py-3">Fase</th>
                        <th className="px-4 py-3">Procedimento</th>
                        <th className="px-4 py-3">Dente / Regiao</th>
                        <th className="px-4 py-3">Prioridade</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {planoTratamento.itens.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-black text-indigo-950">
                            {item.fase}
                          </td>
                          <td className="px-4 py-3 font-black text-indigo-950">
                            {item.procedimento}
                          </td>
                          <td className="px-4 py-3 font-bold text-indigo-950">
                            {item.dente || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-2 font-black">
                              <span
                                className={[
                                  "h-2 w-2 rounded-full",
                                  priorityClass(item.prioridade),
                                ].join(" ")}
                              />
                              {prioridadeLabel(item.prioridade)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                "rounded-full px-3 py-1 text-[11px] font-black",
                                statusClass(item.status),
                              ].join(" ")}
                            >
                              {statusLabel(item.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!planoTratamento.itens.length && (
                    <div className="px-4 py-5 text-sm font-semibold text-slate-500">
                      Nenhum item registrado no plano.
                    </div>
                  )}
                </div>
              </section>

              <section className="mt-8 grid gap-10 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-black uppercase text-indigo-800">
                    Observacoes clinicas
                  </h3>
                  <div className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-slate-700">
                    {observacoes.length ? (
                      observacoes.map((observacao) => (
                        <p key={observacao}>{observacao}</p>
                      ))
                    ) : (
                      <p className="text-slate-500">
                        Nenhuma observacao clinica registrada.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase text-indigo-800">
                    Orientacoes ao paciente
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-semibold leading-relaxed text-slate-700">
                    {orientacoesPaciente.map((orientacao) => (
                      <li key={orientacao}>{orientacao}</li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="mt-16 grid gap-10 md:grid-cols-2">
                <div className="text-center text-sm font-semibold text-indigo-950">
                  <div className="mx-auto h-px w-64 bg-indigo-950" />
                  <p className="mt-3 font-black">
                    {planoTratamento.profissional || nomeExibicaoProfissional()}
                  </p>
                  <p>CRO 123456/SP</p>
                </div>

                {includePatientSignature && (
                  <div className="text-center text-sm font-semibold text-indigo-950">
                    <div className="mx-auto h-px w-64 bg-indigo-950" />
                    <p className="mt-3 font-black">Ciente do paciente</p>
                    <p>Data: ____/____/______</p>
                  </div>
                )}
              </section>

              <footer className="mt-10 text-center text-xs font-semibold text-slate-500">
                Este plano e personalizado e intransferivel.
              </footer>
            </article>
          </div>
        </div>

        <aside className="no-print space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-indigo-950">
              Opcoes de impressao
            </h2>

            <label className="mt-5 block">
              <span className="text-sm font-black text-indigo-950">
                Formato do papel
              </span>
              <select
                value={paperSize}
                onChange={(event) => setPaperSize(event.target.value as PaperSize)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
              >
                <option>A4</option>
                <option>Carta</option>
              </select>
            </label>

            <div className="mt-5">
              <p className="text-sm font-black text-indigo-950">Orientacao</p>
              <div className="mt-3 flex gap-5 text-sm font-black text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={orientation === "retrato"}
                    onChange={() => setOrientation("retrato")}
                  />
                  Retrato
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={orientation === "paisagem"}
                    onChange={() => setOrientation("paisagem")}
                  />
                  Paisagem
                </label>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-black text-indigo-950">Margens</span>
              <select
                value={marginMode}
                onChange={(event) => setMarginMode(event.target.value as MarginMode)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none"
              >
                <option value="padrao">Padrao</option>
                <option value="estreita">Estreita</option>
                <option value="larga">Larga</option>
              </select>
            </label>

            <div className="mt-5 space-y-4">
              <ToggleLine
                label="Incluir logo da clinica"
                checked={includeLogo}
                onChange={setIncludeLogo}
              />
              <ToggleLine
                label="Incluir assinatura do paciente"
                checked={includePatientSignature}
                onChange={setIncludePatientSignature}
              />
            </div>

            <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold text-indigo-800">
              Dica: use Salvar em PDF para enviar o plano por e-mail ou WhatsApp.
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={imprimir}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white hover:bg-indigo-700"
              >
                <Printer size={17} />
                Imprimir
              </button>
              <button
                type="button"
                onClick={baixarPdf}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 text-sm font-black text-indigo-700"
              >
                <Download size={17} />
                Baixar PDF
              </button>
              <button
                type="button"
                onClick={enviarPaciente}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 text-sm font-black text-indigo-700"
              >
                <Send size={17} />
                Enviar para paciente
              </button>
            </div>
          </section>
        </aside>
      </div>

      <div className="no-print flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-indigo-950 shadow-sm">
          <button
            type="button"
            onClick={() => setZoom((current) => Math.max(0.65, current - 0.05))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-indigo-50"
          >
            <ZoomOut size={16} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((current) => Math.min(1.05, current + 0.05))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-indigo-50"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ToggleLine({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm font-black text-slate-700">
      {label}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-indigo-600" : "bg-slate-300",
        ].join(" ")}
        aria-pressed={checked}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </label>
  );
}
