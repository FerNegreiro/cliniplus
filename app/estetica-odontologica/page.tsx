import Sidebar from "@/components/Sidebar";
import ProcedimentosEsteticosLocais from "@/components/ProcedimentosEsteticosLocais";
import {
  HofDocumentosEditor,
  HofHistoricoEditor,
  HofProdutosEditor,
  HofTratamentosEditor,
} from "@/components/HofLiveSections";
import PatientDeleteButton from "@/components/PatientDeleteButton";
import {
  PatientFinanceEditor,
  PatientProntuarioEditor,
} from "@/components/PatientLiveEditors";
import {
  PatientDocsSummary,
  PatientHeaderLiveInfo,
  PatientHistorySummary,
  PatientInfoSummary,
  PatientLastAppointmentCard,
  PatientNextReturnCard,
  PatientNotesSummary,
  PatientStatusFinanceiroCard,
  PatientTotalGastoCard,
  PatientTreatmentsSummary,
} from "@/components/PatientSummaryLiveSections";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";

type EsteticaOdontologicaProps = {
  searchParams: Promise<{
    aba?: string;
    paciente?: string;
    pacienteId?: string;
  }>;
};

const procedimentos = [
  {
    paciente: "Ana Costa",
    procedimento: "Preenchimento labial",
    area: "Lábios",
    status: "Planejado",
    valor: "R$ 900",
    retorno: "28/06/2026",
  },
  {
    paciente: "Pedro Lima",
    procedimento: "Toxina botulínica",
    area: "Testa e glabela",
    status: "Concluído",
    valor: "R$ 1.200",
    retorno: "30/06/2026",
  },
  {
    paciente: "Teste HOF",
    procedimento: "Harmonização orofacial",
    area: "Face completa",
    status: "Em acompanhamento",
    valor: "R$ 2.500",
    retorno: "Não agendado",
  },
];

const produtos = [
  {
    nome: "Ácido hialurônico",
    lote: "AH-2026-8891",
    validade: "12/2027",
    uso: "Preenchimento",
  },
  {
    nome: "Toxina botulínica",
    lote: "TB-2026-4430",
    validade: "08/2027",
    uso: "Relaxamento muscular",
  },
  {
    nome: "Bioestimulador",
    lote: "BIO-2026-2210",
    validade: "10/2027",
    uso: "Estímulo de colágeno",
  },
];

const abas = [
  { id: "resumo", label: "Resumo" },
  { id: "prontuario", label: "Prontuário" },
  { id: "tratamentos", label: "Tratamentos" },
  { id: "financeiro", label: "Financeiro" },
  { id: "documentos", label: "Documentos" },
  { id: "historico", label: "Histórico" },
];

function getStatusClasse(status: string) {
  if (status === "Em acompanhamento") {
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

function getIniciais(nome: string) {
  return nome
    .split(" ")
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("");
}

function getAbaAtiva(aba?: string) {
  return abas.some((item) => item.id === aba) ? aba || "resumo" : "resumo";
}

function EditButton(props: { label?: string }) {
  void props.label;
  return null;
}

function getProntuarioPacienteId(nomePaciente: string, pacienteId?: number) {
  if (pacienteId) {
    return pacienteId;
  }

  const hash = nomePaciente.split("").reduce((total, letra) => {
    return total + letra.charCodeAt(0);
  }, 0);

  return 900000 + hash;
}

export default async function EsteticaOdontologica({
  searchParams,
}: EsteticaOdontologicaProps) {
  const { aba, paciente = "", pacienteId = "" } = await searchParams;
  const abaAtiva = getAbaAtiva(aba);
  const pacienteDados = pacientes.find((item) => item.nome === paciente);
  const nomePaciente = paciente || "Todos os pacientes";
  const pacienteIdNumerico = Number(pacienteId);
  const prontuarioPacienteId = getProntuarioPacienteId(
    nomePaciente,
    Number.isFinite(pacienteIdNumerico) && pacienteIdNumerico > 0
      ? pacienteIdNumerico
      : pacienteDados?.id
  );
  const procedimentosFiltrados = paciente
    ? procedimentos.filter((item) => item.paciente === paciente)
    : procedimentos;
  const totalFaturamento =
    procedimentosFiltrados[0]?.valor || (paciente ? "R$ 0" : "R$ 12.800");
  const lancamentosFinanceirosHof = procedimentosFiltrados.map((item, index) => ({
    id: index + 1,
    paciente: item.paciente,
    descricao: item.procedimento,
    tipo: "Receita",
    valor: item.valor,
    status: item.status === "Concluído" ? "Pago" : "Pendente",
    origem: "Estética / HOF",
    previsaoRecebimento: item.retorno,
  }));
  const hofLiveProps = {
    nomePaciente,
    telefone: pacienteDados?.telefone || "(85) 97777-0000",
    email: pacienteDados?.email || "paciente@email.com",
    convenio: pacienteDados?.convenio || "Particular",
    initialProcedures: procedimentosFiltrados,
    totalFaturamento,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

        <section className="flex-1 p-6">
          <div className="mb-5">
            <Link
              href="/pacientes"
              className="text-sm font-semibold text-slate-500 hover:text-cyan-700"
            >
              ← Voltar para pacientes
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-cyan-700">
                  {getIniciais(nomePaciente)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">{nomePaciente}</h1>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Paciente ativo
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      Estética / HOF
                    </span>
                  </div>

                  <div className="hidden">
                    <p>CPF: 123.456.789-00</p>
                    <p>35 anos</p>
                    <p>Feminino</p>
                    <p>{pacienteDados?.telefone || "(85) 97777-0000"}</p>
                    <p>{pacienteDados?.email || "paciente@email.com"}</p>
                    <p>{pacienteDados?.convenio || "Particular"}</p>
                  </div>
                  <PatientHeaderLiveInfo
                    pacienteId={prontuarioPacienteId}
                    telefone={pacienteDados?.telefone || "(85) 97777-0000"}
                    email={pacienteDados?.email || "paciente@email.com"}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <PatientDeleteButton
                  pacienteId={paciente ? prontuarioPacienteId : 0}
                  nome={nomePaciente}
                />
                <Link
                  href={`/estetica-odontologica?paciente=${encodeURIComponent(
                    nomePaciente
                  )}&pacienteId=${prontuarioPacienteId}&aba=tratamentos`}
                  className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
                >
                  + Novo procedimento
                </Link>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-8 text-sm font-semibold text-slate-500">
                {abas.map((item) => (
                  <Link
                    key={item.id}
                    href={`/estetica-odontologica?paciente=${encodeURIComponent(
                      nomePaciente
                    )}&pacienteId=${prontuarioPacienteId}&aba=${item.id}`}
                    className={
                      abaAtiva === item.id
                        ? "border-b-2 border-cyan-500 pb-3 text-cyan-700"
                        : "pb-3 hover:text-cyan-700"
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {abaAtiva === "resumo" && (
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <div className="space-y-5 xl:col-span-2">
                <div className="hidden">
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Procedimentos</p>
                    <h3 className="mt-3 text-3xl font-bold">
                      {procedimentosFiltrados.length}
                    </h3>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Em acompanhamento</p>
                    <h3 className="mt-3 text-3xl font-bold">
                      {
                        procedimentosFiltrados.filter(
                          (item) => item.status === "Em acompanhamento"
                        ).length
                      }
                    </h3>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Faturamento</p>
                    <h3 className="mt-3 text-3xl font-bold">
                      {totalFaturamento}
                    </h3>
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Termos</p>
                    <h3 className="mt-3 text-3xl font-bold">2</h3>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-4">
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <PatientLastAppointmentCard
                      pacienteId={prontuarioPacienteId}
                      fallbackDate={pacienteDados?.ultimo || "Não informado"}
                    />
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <PatientNextReturnCard pacienteId={prontuarioPacienteId} />
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <PatientTotalGastoCard pacienteId={prontuarioPacienteId} />
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <PatientStatusFinanceiroCard
                      pacienteId={prontuarioPacienteId}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        Prontuário do paciente
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Registro clínico do paciente, com o mesmo padrão para
                        odontologia e Estética / HOF.
                      </p>
                    </div>
                    <Link
                      href={`/estetica-odontologica?paciente=${encodeURIComponent(
                        nomePaciente
                      )}&pacienteId=${prontuarioPacienteId}&aba=prontuario`}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      Abrir prontuário
                    </Link>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    Use a aba Prontuário para editar o mesmo registro clínico
                    completo usado em todos os pacientes.
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">
                        Histórico de atendimentos
                      </h3>
                      <Link
                        href={`/estetica-odontologica?paciente=${encodeURIComponent(
                          nomePaciente
                        )}&pacienteId=${prontuarioPacienteId}&aba=historico`}
                        className="text-sm font-semibold text-cyan-700"
                      >
                        Ver todos
                      </Link>
                    </div>
                    <PatientHistorySummary pacienteId={prontuarioPacienteId} />
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Tratamentos</h3>
                      <Link
                        href={`/estetica-odontologica?paciente=${encodeURIComponent(
                          nomePaciente
                        )}&pacienteId=${prontuarioPacienteId}&aba=tratamentos`}
                        className="text-sm font-semibold text-cyan-700"
                      >
                        Ver todos
                      </Link>
                    </div>
                    <PatientTreatmentsSummary pacienteId={prontuarioPacienteId} />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold">Notas importantes</h3>
                  <PatientNotesSummary pacienteId={prontuarioPacienteId} />
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold">Informações pessoais</h3>
                  <PatientInfoSummary
                    pacienteId={prontuarioPacienteId}
                    nome={nomePaciente}
                    telefone={pacienteDados?.telefone || "(85) 97777-0000"}
                    email={pacienteDados?.email || "paciente@email.com"}
                    convenio={pacienteDados?.convenio || "Particular"}
                  />
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Anexos e documentos</h3>
                    <Link
                      href={`/estetica-odontologica?paciente=${encodeURIComponent(
                        nomePaciente
                      )}&pacienteId=${prontuarioPacienteId}&aba=documentos`}
                      className="text-sm font-semibold text-cyan-700"
                    >
                      Ver todos
                    </Link>
                  </div>
                  <PatientDocsSummary pacienteId={prontuarioPacienteId} />
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-emerald-800">
                    Dica Clini+
                  </h3>
                  <p className="mt-2 text-sm text-emerald-700">
                    Esta é a ficha de Estética / HOF. Ela mantém o mesmo padrão
                    do paciente odontológico, mas sem odontograma.
                  </p>
                  <Link
                    href="/pacientes"
                    className="mt-5 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-700"
                  >
                    Voltar para lista
                  </Link>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === "prontuario" && (
            <div className="mt-6">
              <PatientProntuarioEditor
                pacienteId={prontuarioPacienteId}
                pacienteNome={nomePaciente}
              />
            </div>
          )}

          {abaAtiva === "tratamentos" && (
            <div className="mt-6 space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <h3 className="text-xl font-bold">Tratamentos estéticos</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Procedimentos, área tratada, status e produtos utilizados.
                    </p>
                  </div>
                  <EditButton label="Novo / editar tratamento" />
                </div>

                <div className="hidden">
                  {procedimentosFiltrados.map((item) => (
                    <div
                      key={`${item.paciente}-${item.procedimento}`}
                      className="rounded-3xl bg-slate-50 p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-bold">
                              {item.procedimento}
                            </h4>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasse(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            Área: {item.area} • Retorno: {item.retorno}
                          </p>
                        </div>
                        <EditButton />
                      </div>
                    </div>
                  ))}
                  <ProcedimentosEsteticosLocais />
                </div>
                <HofTratamentosEditor {...hofLiveProps} />
                <ProcedimentosEsteticosLocais />
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Produtos utilizados</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Controle produto, lote, validade e finalidade do uso.
                    </p>
                  </div>
                  <EditButton label="Editar produtos" />
                </div>

                <div className="hidden">
                  <div className="grid grid-cols-4 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                    <span>Produto</span>
                    <span>Lote</span>
                    <span>Validade</span>
                    <span>Uso</span>
                  </div>
                  {produtos.map((produto) => (
                    <div
                      key={produto.lote}
                      className="grid grid-cols-4 border-t border-slate-100 px-4 py-4 text-sm"
                    >
                      <input
                        defaultValue={produto.nome}
                        className="bg-transparent font-semibold outline-none"
                      />
                      <input
                        defaultValue={produto.lote}
                        className="bg-transparent text-slate-500 outline-none"
                      />
                      <input
                        defaultValue={produto.validade}
                        className="bg-transparent text-slate-500 outline-none"
                      />
                      <input
                        defaultValue={produto.uso}
                        className="bg-transparent outline-none"
                      />
                    </div>
                  ))}
                </div>
                <HofProdutosEditor {...hofLiveProps} />
              </div>
            </div>
          )}

          {abaAtiva === "financeiro" && (
            <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <PatientFinanceEditor
                pacienteId={prontuarioPacienteId}
                lancamentosIniciais={lancamentosFinanceirosHof}
                convenioPadrao={pacienteDados?.convenio || "Particular"}
              />
            </div>
          )}

          {abaAtiva === "documentos" && (
            <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Antes e depois</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Documentos visuais do procedimento estético.
                  </p>
                </div>
                <EditButton label="Editar documentos" />
              </div>

              <div className="hidden">
                {["Foto antes", "Foto depois", "Comparativo visual"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-cyan-300 hover:bg-cyan-50"
                    >
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl">
                        +
                      </div>
                      <p className="mt-4 font-semibold">{item}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Adicionar ou editar arquivo
                      </p>
                    </button>
                  )
                )}
              </div>
              <HofDocumentosEditor {...hofLiveProps} />
            </div>
          )}

          {abaAtiva === "historico" && (
            <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Histórico</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Evolução e registros anteriores deste paciente.
                  </p>
                </div>
                <EditButton label="Adicionar histórico" />
              </div>

              <div className="hidden">
                {[
                  [
                    "Avaliação estética inicial",
                    "Queixa principal, fotos iniciais e plano sugerido.",
                    "Concluído",
                    "08/06/2026",
                  ],
                  [
                    "Registro fotográfico antes",
                    "Fotos anexadas ao prontuário estético.",
                    "Anexado",
                    "08/06/2026",
                  ],
                ].map(([titulo, descricao, status, data]) => (
                  <div key={titulo} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex justify-between gap-3">
                      <div>
                        <input
                          defaultValue={titulo}
                          className="w-full bg-transparent font-semibold outline-none"
                        />
                        <textarea
                          defaultValue={descricao}
                          className="mt-1 w-full bg-transparent text-sm text-slate-500 outline-none"
                        />
                      </div>
                      <span className="h-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{data}</p>
                  </div>
                ))}
              </div>
              <HofHistoricoEditor {...hofLiveProps} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
