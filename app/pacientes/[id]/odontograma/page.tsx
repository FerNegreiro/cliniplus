import Sidebar from "@/components/Sidebar";
import PacienteLocalOdontograma from "@/components/PacienteLocalOdontograma";
import PacienteOdontogramaEditor from "@/components/PacienteOdontogramaEditor";
import PacienteTabs from "@/components/PacienteTabs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOdontogramaPadrao } from "@/data/odontograma";
import { pacientes } from "@/data/pacientes";

type OdontogramaPacienteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OdontogramaPaciente({
  params,
}: OdontogramaPacienteProps) {
  const { id } = await params;
  const paciente = pacientes.find((item) => item.id === Number(id));

  if (!paciente) {
    return <PacienteLocalOdontograma id={id} />;
  }

  if (paciente.tipoAtendimento === "estetica") {
    redirect(
      `/estetica-odontologica?paciente=${encodeURIComponent(
        paciente.nome
      )}&pacienteId=${paciente.id}`
    );
  }

  const pacienteQuery = encodeURIComponent(paciente.nome);
  const registrosOdontograma = getOdontogramaPadrao(paciente.id);
  const iniciais = paciente.nome
    .split(" ")
    .map((nome) => nome[0])
    .slice(0, 2)
    .join("");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

        <section className="flex-1 p-6">
          <div className="mb-5">
            <Link
              href={`/pacientes/${paciente.id}`}
              className="text-sm font-semibold text-slate-500 hover:text-cyan-700"
            >
              ← Voltar para ficha do paciente
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-cyan-700">
                  {iniciais}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">{paciente.nome}</h1>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                      Odontograma
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <p>{paciente.telefone}</p>
                    <p>{paciente.email}</p>
                    <p>{paciente.convenio}</p>
                  </div>
                </div>
              </div>

              <Link
                href={`/agenda/novo?paciente=${pacienteQuery}`}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
              >
                + Novo atendimento
              </Link>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <PacienteTabs pacienteId={paciente.id} active="Odontograma" />
            </div>
          </div>

          <PacienteOdontogramaEditor
            pacienteId={paciente.id}
            registrosIniciais={registrosOdontograma}
          />
        </section>
      </div>
    </main>
  );
}
