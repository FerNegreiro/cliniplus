import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";

export default function NovoLancamentoFinanceiro() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Financeiro" />

        <section className="flex-1 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <Link
                href="/financeiro"
                className="text-sm font-semibold text-slate-500 hover:text-cyan-700"
              >
                ← Voltar para financeiro
              </Link>

              <h2 className="mt-4 text-3xl font-bold">Novo lançamento</h2>
              <p className="mt-1 text-slate-500">
                Cadastre recebimentos, despesas, convênios, guias e pagamentos
                vinculados ao paciente
              </p>
            </div>

            <span className="w-fit rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
              Financeiro odontológico
            </span>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <form className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">
                    Tipo de lançamento
                  </label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Receita</option>
                    <option>Despesa</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Paciente</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Selecione um paciente</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.id}>{paciente.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Procedimento</label>
                  <input
                    type="text"
                    placeholder="Ex: restauração, canal, profilaxia..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Valor</label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 280,00"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Origem</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Particular</option>
                    <option>Plano de saúde</option>
                    <option>Despesa fixa</option>
                    <option>Despesa variável</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Forma de pagamento
                  </label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Pix</option>
                    <option>Dinheiro</option>
                    <option>Cartão de crédito</option>
                    <option>Cartão de débito</option>
                    <option>Boleto</option>
                    <option>Convênio</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Status</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Pago</option>
                    <option>Pendente</option>
                    <option>Aguardando convênio</option>
                    <option>Recebido do convênio</option>
                    <option>Glosado</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Data do lançamento
                  </label>
                  <input
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Convênio</label>
                  <input
                    type="text"
                    placeholder="Ex: Unimed, Hapvida, Bradesco..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Número da guia
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: GUIA-10245"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Autorização</label>
                  <input
                    type="text"
                    placeholder="Ex: AUT-8891"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Previsão de recebimento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 30 dias, 15/07/2026..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">Descrição</label>
                  <textarea
                    placeholder="Descreva o lançamento, procedimento, observações do pagamento ou detalhes da despesa..."
                    className="mt-2 h-28 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Observações internas
                  </label>
                  <textarea
                    placeholder="Anotações internas sobre cobrança, convênio, documentação ou negociação..."
                    className="mt-2 h-24 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/financeiro"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-center font-semibold"
                >
                  Cancelar
                </Link>

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                >
                  Salvar rascunho
                </button>

                <Link
                  href="/financeiro"
                  className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
                >
                  Salvar lançamento
                </Link>
              </div>
            </form>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Resumo</h3>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-700">
                      Receita particular
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      Use para pagamentos diretos do paciente.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">
                      Convênio
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Preencha guia, autorização e previsão de repasse.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-red-50 p-4">
                    <p className="font-semibold text-red-700">Despesa</p>
                    <p className="mt-1 text-sm text-red-600">
                      Use para aluguel, material odontológico, laboratório e
                      custos internos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Categorias rápidas</h3>

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Consulta particular
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Procedimento odontológico
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Repasse de convênio
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Material odontológico
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Laboratório protético
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800">
                  Dica Clini+
                </h3>

                <p className="mt-2 text-sm text-emerald-700">
                  Sempre vincule o lançamento ao paciente e ao procedimento.
                  Isso ajuda no controle de lucro, inadimplência, convênios e
                  relatórios financeiros.
                </p>

                <Link
                  href="/financeiro"
                  className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700"
                >
                  Ver financeiro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}