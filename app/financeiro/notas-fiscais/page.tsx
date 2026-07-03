import Sidebar from "@/components/Sidebar";
import Link from "next/link";

const notasFiscais = [
  {
    numero: "NF-2026-000128",
    data: "24/06/2026",
    paciente: "Maria Silva",
    servico: "Restauração dental",
    valor: "R$ 900,00",
    status: "Emitida",
  },
  {
    numero: "NF-2026-000127",
    data: "24/06/2026",
    paciente: "João Almeida",
    servico: "Tratamento de canal",
    valor: "R$ 750,00",
    status: "Pendente",
  },
  {
    numero: "NF-2026-000126",
    data: "23/06/2026",
    paciente: "Ana Costa",
    servico: "Clareamento caseiro",
    valor: "R$ 450,00",
    status: "Emitida",
  },
  {
    numero: "NF-2026-000125",
    data: "23/06/2026",
    paciente: "Pedro Lima",
    servico: "Profilaxia + avaliação",
    valor: "R$ 280,00",
    status: "Emitida",
  },
  {
    numero: "NF-2026-000124",
    data: "22/06/2026",
    paciente: "Carlos Eduardo",
    servico: "Aparelho ortodôntico",
    valor: "R$ 1.200,00",
    status: "Cancelada",
  },
];

function getStatusClasse(status: string) {
  if (status === "Emitida") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Pendente") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Cancelada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default function NotasFiscais() {
  const pendentes = notasFiscais.filter((nota) => nota.status === "Pendente");
  const canceladas = notasFiscais.filter((nota) => nota.status === "Cancelada");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Financeiro" />

        <section className="flex-1 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                <Link href="/financeiro" className="hover:text-cyan-700">
                  Financeiro
                </Link>
                <span>›</span>
                <span>Notas fiscais</span>
              </div>

              <h2 className="text-3xl font-bold">Notas fiscais</h2>
              <p className="mt-1 text-slate-500">
                Emita, gerencie e acompanhe notas fiscais da clínica
                odontológica
              </p>
            </div>

            <Link
              href="/financeiro/notas-fiscais/nova"
              className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white"
            >
              + Emitir nova nota fiscal
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-b border-slate-200">
            <button className="border-b-2 border-cyan-600 px-4 py-3 text-sm font-semibold text-cyan-700">
              Todas
            </button>

            <button className="px-4 py-3 text-sm font-semibold text-slate-500 hover:text-cyan-700">
              Emitidas
            </button>

            <button className="px-4 py-3 text-sm font-semibold text-slate-500 hover:text-cyan-700">
              Pendentes
            </button>

            <button className="px-4 py-3 text-sm font-semibold text-slate-500 hover:text-cyan-700">
              Canceladas
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total emitidas</p>
              <h3 className="mt-3 text-3xl font-bold">128</h3>
              <p className="mt-1 text-xs text-emerald-600">
                +18% vs mês anterior
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Valor faturado</p>
              <h3 className="mt-3 text-3xl font-bold">R$ 58.750,00</h3>
              <p className="mt-1 text-xs text-emerald-600">
                +23% vs mês anterior
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Pendentes</p>
              <h3 className="mt-3 text-3xl font-bold">{pendentes.length}</h3>
              <p className="mt-1 text-xs text-amber-600">
                Aguardando emissão
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Canceladas</p>
              <h3 className="mt-3 text-3xl font-bold">{canceladas.length}</h3>
              <p className="mt-1 text-xs text-red-600">Este mês</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-3">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-xl font-bold">Lista de notas fiscais</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Controle notas emitidas, pendentes e canceladas
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Buscar nota fiscal..."
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                  />

                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Filtros
                  </button>

                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Exportar
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
                <div className="grid grid-cols-6 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                  <span>Número</span>
                  <span>Data</span>
                  <span>Paciente</span>
                  <span>Serviço</span>
                  <span>Valor</span>
                  <span>Status</span>
                </div>

                {notasFiscais.map((nota) => (
                  <div
                    key={nota.numero}
                    className="grid grid-cols-6 border-t border-slate-100 px-4 py-4 text-sm"
                  >
                    <span className="font-semibold">{nota.numero}</span>
                    <span className="text-slate-500">{nota.data}</span>
                    <span>{nota.paciente}</span>
                    <span className="text-slate-500">{nota.servico}</span>
                    <span className="font-semibold">{nota.valor}</span>
                    <span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasse(
                          nota.status
                        )}`}
                      >
                        {nota.status}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                <p>Mostrando 1 a 5 de 128 resultados</p>

                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2">
                    1
                  </button>
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2">
                    2
                  </button>
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2">
                    3
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Resumo do mês</h3>

                  <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none">
                    <option>Junho/2026</option>
                    <option>Maio/2026</option>
                    <option>Abril/2026</option>
                  </select>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-700">Valor faturado</p>
                    <h4 className="mt-1 text-xl font-bold text-emerald-800">
                      R$ 58.750,00
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="text-sm text-cyan-700">Quantidade de notas</p>
                    <h4 className="mt-1 text-xl font-bold text-cyan-800">
                      128
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-purple-50 p-4">
                    <p className="text-sm text-purple-700">Ticket médio</p>
                    <h4 className="mt-1 text-xl font-bold text-purple-800">
                      R$ 458,20
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-sm text-amber-700">Pendentes</p>
                    <h4 className="mt-1 text-xl font-bold text-amber-800">
                      R$ 2.850,00
                    </h4>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Ações rápidas</h3>

                <div className="mt-5 space-y-3">
                  <Link
                    href="/financeiro/notas-fiscais/nova"
                    className="block w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Emitir nova nota fiscal
                  </Link>

                  <button className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50">
                    Importar RPS
                  </button>

                  <button className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50">
                    Configurar NFS-e
                  </button>

                  <button className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50">
                    Enviar em lote
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800">
                  Integração ativa
                </h3>

                <p className="mt-2 text-sm text-emerald-700">
                  Suas notas fiscais estão sendo emitidas através da integração
                  com a prefeitura.
                </p>

                <span className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
                  Conectado
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}