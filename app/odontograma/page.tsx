import Sidebar from "@/components/Sidebar";
import PremiumCard from "@/components/PremiumCard";
import Link from "next/link";

const dentesSuperiores = [
  "18",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
];

const dentesInferiores = [
  "48",
  "47",
  "46",
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
];

const tratamentos = [
  {
    dente: "16",
    procedimento: "Restauração",
    status: "Em andamento",
    valor: "R$ 280",
  },
  {
    dente: "21",
    procedimento: "Clareamento",
    status: "Planejado",
    valor: "R$ 450",
  },
  {
    dente: "36",
    procedimento: "Canal",
    status: "Urgente",
    valor: "R$ 750",
  },
];

function getDenteStatus(dente: string) {
  if (dente === "16") {
    return {
      classe:
        "border-amber-400 bg-amber-50 text-amber-600 shadow-amber-100",
      status: "Em andamento",
    };
  }

  if (dente === "21") {
    return {
      classe: "border-cyan-400 bg-cyan-50 text-cyan-600 shadow-cyan-100",
      status: "Planejado",
    };
  }

  if (dente === "36") {
    return {
      classe: "border-red-400 bg-red-50 text-red-600 shadow-red-100",
      status: "Urgente",
    };
  }

  return {
    classe:
      "border-slate-200 bg-white text-slate-700 shadow-slate-100 hover:border-cyan-300 hover:text-cyan-600",
    status: "Saudável",
  };
}

function DenteIcon({ inferior = false }: { inferior?: boolean }) {
  return (
    <svg
      viewBox="0 0 80 100"
      className={inferior ? "h-12 w-10 rotate-180" : "h-12 w-10"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 8C27 8 17 16 15 30C13 42 17 54 20 65C23 77 25 91 34 91C39 91 38 75 40 75C42 75 41 91 46 91C55 91 57 77 60 65C63 54 67 42 65 30C63 16 53 8 40 8Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      <path
        d="M25 25C30 18 36 20 40 24C44 20 50 18 55 25"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M30 47C36 51 44 51 50 47"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

function DenteButton({
  numero,
  inferior = false,
}: {
  numero: string;
  inferior?: boolean;
}) {
  const status = getDenteStatus(numero);

  return (
    <button
      type="button"
      title={`Dente ${numero} - ${status.status}`}
      className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 p-2 font-bold shadow-sm transition ${status.classe}`}
    >
      <DenteIcon inferior={inferior} />
      <span className="mt-1 text-sm">{numero}</span>
    </button>
  );
}

export default function Odontograma() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Odontograma" />

        <section className="flex-1 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Odontograma</h2>
              <p className="mt-1 text-slate-500">
                Visualize dentes, tratamentos, procedimentos e orçamento do
                paciente
              </p>
            </div>

            <Link
              href="/pacientes"
              className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
            >
              Ver pacientes
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Paciente selecionado</p>
              <h3 className="mt-3 text-2xl font-bold">Maria Silva</h3>
              <p className="mt-2 text-xs text-slate-500">
                Último atendimento: 12/06/2026
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Tratamentos ativos</p>
              <h3 className="mt-3 text-3xl font-bold">3</h3>
              <p className="mt-2 text-xs text-amber-600">
                1 procedimento urgente
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Orçamento aberto</p>
              <h3 className="mt-3 text-3xl font-bold">R$ 1.480</h3>
              <p className="mt-2 text-xs text-slate-500">
                Aguardando aprovação
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Radiografias</p>
              <h3 className="mt-3 text-3xl font-bold">4</h3>
              <p className="mt-2 text-xs text-cyan-700">Arquivos anexados</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Mapa odontológico</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Clique em um dente para registrar condição, tratamento ou
                    procedimento
                  </p>
                </div>

                <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
                  Dentição permanente
                </span>
              </div>

              <div className="mt-8 rounded-3xl bg-slate-50 p-6">
                <p className="mb-5 text-center text-sm font-semibold text-slate-500">
                  Arcada superior
                </p>

                <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 xl:grid-cols-16">
                  {dentesSuperiores.map((dente) => (
                    <DenteButton key={dente} numero={dente} />
                  ))}
                </div>

                <div className="my-8 border-t border-dashed border-slate-300" />

                <p className="mb-5 text-center text-sm font-semibold text-slate-500">
                  Arcada inferior
                </p>

                <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 xl:grid-cols-16">
                  {dentesInferiores.map((dente) => (
                    <DenteButton key={dente} numero={dente} inferior />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
                  Planejado
                </span>
                <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                  Em andamento
                </span>
                <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                  Urgente
                </span>
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                  Concluído
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Resumo odontológico</h3>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">Dente 16</p>
                    <p className="mt-1 text-sm text-amber-700">
                      Restauração em andamento.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-cyan-700">Dente 21</p>
                    <p className="mt-1 text-sm text-cyan-700">
                      Clareamento planejado.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-red-50 p-4">
                    <p className="font-semibold text-red-700">Dente 36</p>
                    <p className="mt-1 text-sm text-red-600">
                      Canal marcado como urgente.
                    </p>
                  </div>
                </div>
              </div>

              <PremiumCard
                title="Radiografias digitais"
                description="Anexe radiografias, imagens clínicas e documentos diretamente no prontuário odontológico."
              />
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Tratamentos em andamento</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Procedimentos vinculados aos dentes do paciente
                </p>
              </div>

              <Link
                href="/tratamentos"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Ver tratamentos
              </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-4 bg-slate-100 p-4 text-sm font-semibold">
                <p>Dente</p>
                <p>Procedimento</p>
                <p>Status</p>
                <p>Valor</p>
              </div>

              {tratamentos.map((tratamento) => (
                <div
                  key={tratamento.dente}
                  className="grid grid-cols-4 border-t border-slate-100 p-4 text-sm"
                >
                  <p className="font-semibold">{tratamento.dente}</p>
                  <p>{tratamento.procedimento}</p>
                  <p>{tratamento.status}</p>
                  <p>{tratamento.valor}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <PremiumCard
              title="Orçamento odontológico"
              description="Monte orçamentos por procedimento, por dente e por plano de tratamento."
            />

            <PremiumCard
              title="Assinatura do paciente"
              description="Permita que o paciente aprove orçamentos, termos e documentos digitalmente."
            />

            <PremiumCard
              title="Histórico visual"
              description="Acompanhe antes e depois, radiografias e evolução do tratamento odontológico."
            />
          </div>
        </section>
      </div>
    </main>
  );
}