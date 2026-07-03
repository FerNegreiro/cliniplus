import Sidebar from "@/components/Sidebar";
import PacienteLocalModulo from "@/components/PacienteLocalModulo";
import PacienteTabs from "@/components/PacienteTabs";
import { PatientTreatmentsEditor } from "@/components/PatientLiveEditors";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const tratamentos = [
  {
    paciente: "Maria Silva",
    nome: "Restauração dente 16",
    status: "Em tratamento",
    progresso: "60%",
    retorno: "24/06/2026",
    observacao: "Restauração em acompanhamento.",
  },
  {
    paciente: "João Almeida",
    nome: "Tratamento de canal",
    status: "Urgente",
    progresso: "25%",
    retorno: "22/06/2026",
    observacao: "Dente marcado para revisão.",
  },
  {
    paciente: "Teste Odonto",
    nome: "Restauração dente 26",
    status: "Em tratamento",
    progresso: "25%",
    retorno: "Não agendado",
    observacao: "Criado no cadastro inicial.",
  },
];

function getStatusClasse(status: string) {
  if (status === "Urgente") {
    return "bg-red-100 text-red-700";
  }

  if (status === "Em tratamento") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Concluído") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default async function PacienteTratamentos({ params }: PageProps) {
  const { id } = await params;
  const paciente = pacientes.find((item) => item.id === Number(id));

  if (!paciente) {
    return (
      <PacienteLocalModulo
        id={id}
        active="Tratamentos"
        title="Tratamentos"
        description="Plano de tratamento, progresso, retornos e observações deste paciente."
      />
    );
  }

  const tratamentosDoPaciente = tratamentos.filter(
    (tratamento) => tratamento.paciente === paciente.nome
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

        <section className="flex-1 p-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <Link
                  href={`/pacientes/${paciente.id}`}
                  className="text-sm font-semibold text-slate-500 hover:text-cyan-700"
                >
                  ← Voltar para resumo
                </Link>
                <h1 className="mt-3 text-3xl font-bold">
                  Tratamentos de {paciente.nome}
                </h1>
                <p className="mt-1 text-slate-500">
                  Plano de tratamento, progresso, retornos e observações deste
                  paciente.
                </p>
              </div>

              <Link
                href={`/orcamentos/novo?paciente=${encodeURIComponent(
                  paciente.nome
                )}`}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
              >
                Novo tratamento
              </Link>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <PacienteTabs pacienteId={paciente.id} active="Tratamentos" />
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Tratamentos</p>
              <h3 className="mt-3 text-3xl font-bold">
                {tratamentosDoPaciente.length}
              </h3>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Status</p>
              <h3 className="mt-3 text-3xl font-bold">
                {tratamentosDoPaciente[0]?.status || paciente.status}
              </h3>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Próximo retorno</p>
              <h3 className="mt-3 text-3xl font-bold">
                {tratamentosDoPaciente[0]?.retorno || "Não agendado"}
              </h3>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold">Tratamentos do paciente</h3>
            <PatientTreatmentsEditor pacienteId={paciente.id} />

            <div className="hidden">
              {(tratamentosDoPaciente.length
                ? tratamentosDoPaciente
                : [
                    {
                      paciente: paciente.nome,
                      nome: paciente.area,
                      status: paciente.status,
                      progresso: "0%",
                      retorno: "Não agendado",
                      observacao: "Tratamento inicial do cadastro.",
                    },
                  ]
              ).map((tratamento) => (
                <div
                  key={tratamento.nome}
                  className="rounded-3xl bg-slate-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-bold">
                          {tratamento.nome}
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
                        {tratamento.observacao}
                      </p>
                    </div>

                    <div className="w-full lg:w-60">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Progresso</span>
                        <span className="font-semibold">
                          {tratamento.progresso}
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-cyan-500"
                          style={{ width: tratamento.progresso }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Retorno: {tratamento.retorno}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
