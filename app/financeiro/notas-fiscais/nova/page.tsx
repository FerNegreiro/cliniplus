import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";

type NovaNotaFiscalProps = {
  searchParams: Promise<{
    paciente?: string;
    servico?: string;
    valor?: string;
  }>;
};

export default async function NovaNotaFiscal({
  searchParams,
}: NovaNotaFiscalProps) {
  const { paciente = "", servico = "", valor = "" } = await searchParams;

  const veioDeLancamento = paciente || servico || valor;

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
                <Link
                  href="/financeiro/notas-fiscais"
                  className="hover:text-cyan-700"
                >
                  Notas fiscais
                </Link>
                <span>›</span>
                <span>Emitir NFS-e</span>
              </div>

              <h2 className="text-3xl font-bold">
                {veioDeLancamento
                  ? "Emitir NFS-e deste lançamento"
                  : "Emitir nova NFS-e"}
              </h2>

              <p className="mt-1 text-slate-500">
                {veioDeLancamento
                  ? "Confira os dados do lançamento financeiro antes de emitir a nota fiscal."
                  : "Preencha os dados do paciente, serviço, valor e emissão da NFS-e."}
              </p>
            </div>

            <Link
              href="/financeiro/notas-fiscais"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
            >
              Voltar para notas fiscais
            </Link>
          </div>

          {veioDeLancamento && (
            <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-cyan-700">
                Lançamento financeiro selecionado
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-slate-500">Paciente</p>
                  <h3 className="mt-1 font-bold">{paciente || "Não informado"}</h3>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-slate-500">Serviço</p>
                  <h3 className="mt-1 font-bold">{servico || "Não informado"}</h3>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-slate-500">Valor</p>
                  <h3 className="mt-1 font-bold text-emerald-600">
                    {valor || "R$ 0,00"}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <form className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
              <h3 className="text-xl font-bold">Dados para emissão</h3>
              <p className="mt-1 text-sm text-slate-500">
                Revise as informações antes de emitir a nota fiscal
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Paciente</label>
                  <select
                    defaultValue={paciente}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  >
                    <option value="">Selecione o paciente</option>
                    {pacientes.map((item) => (
                      <option key={item.id} value={item.nome}>
                        {item.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">CPF/CNPJ</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Serviço</label>
                  <input
                    type="text"
                    defaultValue={servico}
                    placeholder="Ex: consulta particular, restauração, canal..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Valor</label>
                  <input
                    type="text"
                    defaultValue={valor}
                    placeholder="R$ 0,00"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Data de emissão
                  </label>
                  <input
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Status</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Emitir agora</option>
                    <option>Salvar como pendente</option>
                    <option>Rascunho</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Descrição do serviço na nota
                  </label>
                  <textarea
                    defaultValue={
                      servico
                        ? `Prestação de serviço odontológico referente a ${servico}.`
                        : ""
                    }
                    placeholder="Ex: Prestação de serviço odontológico referente a consulta particular."
                    className="mt-2 h-28 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Observações internas
                  </label>
                  <textarea
                    placeholder="Observações internas sobre a emissão da nota fiscal..."
                    className="mt-2 h-24 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/financeiro"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-center font-semibold text-slate-700"
                >
                  Cancelar
                </Link>

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                >
                  Salvar pendente
                </button>

                <Link
                  href="/financeiro/notas-fiscais"
                  className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
                >
                  Emitir NFS-e
                </Link>
              </div>
            </form>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Resumo da emissão</h3>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-cyan-700">
                      Origem da nota
                    </p>
                    <p className="mt-1 text-sm text-cyan-700">
                      {veioDeLancamento
                        ? "Esta NFS-e está sendo gerada a partir de um lançamento financeiro."
                        : "Esta NFS-e será criada manualmente."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-700">
                      Paciente vinculado
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      A nota ficará registrada no histórico financeiro do
                      paciente.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">
                      Conferência necessária
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Confira CPF/CNPJ, serviço e valor antes de emitir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800">
                  Integração ativa
                </h3>

                <p className="mt-2 text-sm text-emerald-700">
                  A emissão de notas fiscais está conectada ao módulo financeiro
                  da clínica.
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