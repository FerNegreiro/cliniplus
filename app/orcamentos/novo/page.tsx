import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";

const procedimentosOdontologicos = [
  "Avaliação odontológica",
  "Profilaxia / Limpeza",
  "Restauração",
  "Tratamento de canal",
  "Extração",
  "Clareamento dental",
  "Prótese",
  "Aparelho ortodôntico",
];

const procedimentosEsteticos = [
  "Harmonização orofacial",
  "Preenchimento labial",
  "Toxina botulínica",
  "Bioestimulador de colágeno",
  "Fios de sustentação",
  "Skinbooster",
  "Lentes de contato dental",
  "Clareamento estético",
];

export default function NovoOrcamento() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Orçamentos" />

        <section className="flex-1 p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/orcamentos" className="font-semibold hover:text-cyan-700">
              Orçamentos
            </Link>
            <span>›</span>
            <span>Novo orçamento</span>
          </div>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Novo orçamento</h2>
              <p className="mt-1 text-slate-500">
                Monte orçamentos odontológicos ou estéticos para aprovação do paciente
              </p>
            </div>

            <Link
              href="/orcamentos"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
            >
              Voltar para orçamentos
            </Link>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <form className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
              <h3 className="text-xl font-bold">Dados do orçamento</h3>
              <p className="mt-1 text-sm text-slate-500">
                Preencha os dados principais antes de gerar o orçamento
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Paciente</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Selecione o paciente</option>
                    {pacientes.map((paciente) => (
                      <option key={paciente.id}>{paciente.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Tipo de orçamento
                  </label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Odontológico</option>
                    <option>Estético / HOF</option>
                    <option>Misto</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Validade</label>
                  <input
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Status</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Rascunho</option>
                    <option>Aguardando aprovação</option>
                    <option>Aprovado</option>
                    <option>Recusado</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Procedimento</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Selecione o procedimento</option>

                    <optgroup label="Odontologia">
                      {procedimentosOdontologicos.map((procedimento) => (
                        <option key={procedimento}>{procedimento}</option>
                      ))}
                    </optgroup>

                    <optgroup label="Estética / HOF">
                      {procedimentosEsteticos.map((procedimento) => (
                        <option key={procedimento}>{procedimento}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Dente ou área
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: dente 16, face completa, lábios..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Quantidade</label>
                  <input
                    type="number"
                    placeholder="1"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Valor</label>
                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Desconto</label>
                  <input
                    type="text"
                    placeholder="R$ 0,00"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Parcelamento</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>À vista</option>
                    <option>2x</option>
                    <option>3x</option>
                    <option>6x</option>
                    <option>12x</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Descrição do orçamento
                  </label>
                  <textarea
                    placeholder="Descreva os procedimentos, etapas, condições e observações para o paciente..."
                    className="mt-2 h-28 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Observações internas
                  </label>
                  <textarea
                    placeholder="Observações visíveis apenas para a clínica..."
                    className="mt-2 h-24 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/orcamentos"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-center font-semibold text-slate-700"
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
                  href="/orcamentos"
                  className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
                >
                  Gerar orçamento
                </Link>
              </div>
            </form>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Resumo</h3>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-cyan-700">
                      Odontologia
                    </p>
                    <p className="mt-1 text-sm text-cyan-700">
                      Use dente, procedimento, quantidade, valor e etapas do
                      tratamento.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-purple-50 p-4">
                    <p className="font-semibold text-purple-700">
                      Estética / HOF
                    </p>
                    <p className="mt-1 text-sm text-purple-700">
                      Use área do rosto, procedimento, produto, sessões e
                      retorno.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-700">
                      Após aprovação
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                      O orçamento aprovado pode virar lançamento financeiro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-amber-800">
                  Dica Clini+
                </h3>

                <p className="mt-2 text-sm text-amber-700">
                  Para HOF, inclua termo de consentimento, fotos antes/depois e
                  produtos utilizados. Para odontologia, vincule ao dente ou ao
                  odontograma.
                </p>

                <Link
                  href="/documentos"
                  className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-amber-700"
                >
                  Ver documentos
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Modelo visual do orçamento</h3>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-4 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                <p>Item</p>
                <p>Dente / Área</p>
                <p>Quantidade</p>
                <p>Valor</p>
              </div>

              <div className="grid grid-cols-4 border-t border-slate-100 p-4 text-sm">
                <p>Restauração</p>
                <p>Dente 16</p>
                <p>1</p>
                <p>R$ 280</p>
              </div>

              <div className="grid grid-cols-4 border-t border-slate-100 p-4 text-sm">
                <p>Harmonização orofacial</p>
                <p>Face completa</p>
                <p>1</p>
                <p>R$ 2.500</p>
              </div>

              <div className="grid grid-cols-4 border-t border-slate-100 bg-slate-50 p-4 text-sm font-bold">
                <p>Total</p>
                <p>-</p>
                <p>2 itens</p>
                <p>R$ 2.780</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}