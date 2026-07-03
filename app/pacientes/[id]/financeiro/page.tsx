import Sidebar from "@/components/Sidebar";
import PacienteLocalModulo from "@/components/PacienteLocalModulo";
import PacienteTabs from "@/components/PacienteTabs";
import { PatientFinanceEditor } from "@/components/PatientLiveEditors";
import Link from "next/link";
import { lancamentos } from "@/data/financeiro";
import { pacientes } from "@/data/pacientes";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PacienteFinanceiro({ params }: PageProps) {
  const { id } = await params;
  const paciente = pacientes.find((item) => item.id === Number(id));

  if (!paciente) {
    return (
      <PacienteLocalModulo
        id={id}
        active="Financeiro"
        title="Financeiro"
        description="Receitas, convênio, guias, pendências e histórico financeiro."
      />
    );
  }

  const lancamentosDoPaciente = lancamentos.filter(
    (lancamento) => lancamento.paciente === paciente.nome
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
                  Financeiro de {paciente.nome}
                </h1>
                <p className="mt-1 text-slate-500">
                  Receitas, convênio, guias, pendências e histórico financeiro.
                </p>
              </div>

              <Link
                href={`/financeiro/novo?paciente=${encodeURIComponent(
                  paciente.nome
                )}`}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
              >
                Novo lançamento
              </Link>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <PacienteTabs pacienteId={paciente.id} active="Financeiro" />
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <PatientFinanceEditor
              pacienteId={paciente.id}
              lancamentosIniciais={lancamentosDoPaciente}
              convenioPadrao={paciente.convenio}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
