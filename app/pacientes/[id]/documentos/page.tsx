import Sidebar from "@/components/Sidebar";
import PacienteLocalModulo from "@/components/PacienteLocalModulo";
import PacienteTabs from "@/components/PacienteTabs";
import { PatientDocumentsEditor } from "@/components/PatientLiveEditors";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const documentos = [
  {
    paciente: "Maria Silva",
    nome: "Radiografia panorâmica",
    tipo: "Radiografia",
    formato: "PDF",
    tamanho: "2.4 MB",
    data: "12/06/2026",
  },
  {
    paciente: "Maria Silva",
    nome: "Orçamento odontológico",
    tipo: "Orçamento",
    formato: "PDF",
    tamanho: "0.9 MB",
    data: "10/06/2026",
  },
  {
    paciente: "Ana Costa",
    nome: "Termo de consentimento HOF",
    tipo: "Termo",
    formato: "PDF",
    tamanho: "0.9 MB",
    data: "08/06/2026",
  },
];

export default async function PacienteDocumentos({ params }: PageProps) {
  const { id } = await params;
  const paciente = pacientes.find((item) => item.id === Number(id));

  if (!paciente) {
    return (
      <PacienteLocalModulo
        id={id}
        active="Documentos"
        title="Documentos"
        description="Arquivos, exames, fotos, termos e documentos deste paciente."
      />
    );
  }

  const documentosDoPaciente = documentos.filter(
    (documento) => documento.paciente === paciente.nome
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
                  Documentos de {paciente.nome}
                </h1>
                <p className="mt-1 text-slate-500">
                  Arquivos, exames, fotos, termos e documentos deste paciente.
                </p>
              </div>

              <a
                href="#documentos-paciente"
                className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
              >
                Novo documento
              </a>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <PacienteTabs pacienteId={paciente.id} active="Documentos" />
            </div>
          </div>

          <div
            id="documentos-paciente"
            className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <h3 className="text-xl font-bold">Documentos do paciente</h3>
            <PatientDocumentsEditor pacienteId={paciente.id} />

            <div className="hidden">
              {documentosDoPaciente.map((documento) => (
                <div
                  key={documento.nome}
                  className="rounded-3xl bg-slate-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                      <h4 className="text-lg font-bold">{documento.nome}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {documento.tipo} • {documento.formato} •{" "}
                        {documento.tamanho} • {documento.data}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        Visualizar
                      </button>
                      <button className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
                        Baixar
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {documentosDoPaciente.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <h4 className="text-lg font-bold">
                    Nenhum documento anexado
                  </h4>
                  <p className="mt-2 text-sm text-slate-500">
                    Este paciente ainda não possui documentos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
