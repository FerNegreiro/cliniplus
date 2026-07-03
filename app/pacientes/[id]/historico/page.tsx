import Sidebar from "@/components/Sidebar";
import PacienteLocalModulo from "@/components/PacienteLocalModulo";
import PacienteTabs from "@/components/PacienteTabs";
import { PatientHistoryEditor } from "@/components/PatientLiveEditors";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const historicos = [
  {
    paciente: "Maria Silva",
    titulo: "Avaliação inicial",
    data: "15/03/2026",
    descricao: "Registro inicial, avaliação odontológica e plano de cuidado.",
  },
  {
    paciente: "Maria Silva",
    titulo: "Restauração dente 16",
    data: "12/06/2026",
    descricao: "Procedimento em acompanhamento com retorno programado.",
  },
  {
    paciente: "Ana Costa",
    titulo: "Avaliação estética inicial",
    data: "08/06/2026",
    descricao: "Fotos iniciais, queixa principal e plano de HOF.",
  },
];

export default async function PacienteHistorico({ params }: PageProps) {
  const { id } = await params;
  const paciente = pacientes.find((item) => item.id === Number(id));

  if (!paciente) {
    return (
      <PacienteLocalModulo
        id={id}
        active="Historico"
        title="Histórico"
        description="Linha do tempo clínica, retornos, registros e eventos do paciente."
      />
    );
  }

  const historicoDoPaciente = historicos.filter(
    (item) => item.paciente === paciente.nome
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

        <section className="flex-1 p-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div>
              <Link
                href={`/pacientes/${paciente.id}`}
                className="text-sm font-semibold text-slate-500 hover:text-cyan-700"
              >
                ← Voltar para resumo
              </Link>
              <h1 className="mt-3 text-3xl font-bold">
                Histórico de {paciente.nome}
              </h1>
              <p className="mt-1 text-slate-500">
                Linha do tempo clínica, retornos, registros e eventos do
                paciente.
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <PacienteTabs pacienteId={paciente.id} active="Historico" />
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-bold">Linha do tempo</h3>
            <PatientHistoryEditor pacienteId={paciente.id} />

            <div className="hidden">
              {(historicoDoPaciente.length
                ? historicoDoPaciente
                : [
                    {
                      paciente: paciente.nome,
                      titulo: "Cadastro do paciente",
                      data: paciente.ultimo,
                      descricao:
                        "Paciente cadastrado e pronto para receber novos registros.",
                    },
                  ]
              ).map((item) => (
                <div key={item.titulo} className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-cyan-700">
                    {item.data}
                  </p>
                  <h4 className="mt-2 text-lg font-bold">{item.titulo}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
