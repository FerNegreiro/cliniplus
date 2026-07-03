import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";

export default function NovoRegistroProntuario() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Prontuários" />

        <section className="flex-1 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <Link
                href="/prontuario"
                className="text-sm font-semibold text-slate-500 hover:text-cyan-700"
              >
                ← Voltar para prontuários
              </Link>

              <h2 className="mt-4 text-3xl font-bold">Novo registro</h2>
              <p className="mt-1 text-slate-500">
                Registre uma nova evolução odontológica no prontuário do paciente
              </p>
            </div>

            <span className="w-fit rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
              Registro odontológico
            </span>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <form className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Paciente</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    {pacientes.map((paciente) => (
                      <option key={paciente.id}>{paciente.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Tipo de registro
                  </label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Avaliação odontológica</option>
                    <option>Evolução de tratamento</option>
                    <option>Procedimento realizado</option>
                    <option>Retorno</option>
                    <option>Urgência odontológica</option>
                    <option>Observação clínica</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Data do atendimento
                  </label>
                  <input
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Status do registro
                  </label>
                  <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                    <option>Em andamento</option>
                    <option>Planejado</option>
                    <option>Urgente</option>
                    <option>Concluído</option>
                    <option>Rascunho</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Dente envolvido</label>
                  <input
                    type="text"
                    placeholder="Ex: 16, 21, 36..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Procedimento</label>
                  <input
                    type="text"
                    placeholder="Ex: restauração, canal, profilaxia..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Queixa principal
                  </label>
                  <textarea
                    placeholder="Descreva o motivo principal do atendimento..."
                    className="mt-2 h-24 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Evolução odontológica
                  </label>
                  <textarea
                    placeholder="Informe a evolução, procedimento realizado, dentes envolvidos e observações clínicas..."
                    className="mt-2 h-36 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Conduta / Plano de cuidado
                  </label>
                  <textarea
                    placeholder="Descreva orientações, próximos passos, retorno, exames ou tratamento indicado..."
                    className="mt-2 h-32 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Próximo retorno
                  </label>
                  <input
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Valor relacionado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 280,00"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold">
                    Observações privadas
                  </label>
                  <textarea
                    placeholder="Anotações internas do profissional..."
                    className="mt-2 h-24 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/prontuario"
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
                  href="/prontuario"
                  className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-semibold text-white"
                >
                  Finalizar registro
                </Link>
              </div>
            </form>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Resumo do registro</h3>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold">Paciente</p>
                    <p className="mt-1 text-slate-500">
                      Selecione o paciente no formulário
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="font-semibold text-cyan-700">
                      Odontograma vinculado
                    </p>
                    <p className="mt-1 text-cyan-700">
                      Informe o dente envolvido para ligar ao mapa odontológico.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="font-semibold text-amber-700">
                      Próximo retorno
                    </p>
                    <p className="mt-1 text-amber-700">
                      Use o campo de retorno para acompanhar o tratamento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold">Modelos rápidos</h3>

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Avaliação inicial
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Evolução de tratamento
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Procedimento concluído
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 hover:bg-cyan-50"
                  >
                    Urgência odontológica
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-800">
                  Dica Clini+
                </h3>

                <p className="mt-2 text-sm text-emerald-700">
                  Registros completos ajudam a acompanhar o tratamento, gerar
                  histórico clínico e justificar procedimentos no financeiro.
                </p>

                <Link
                  href="/pacientes/1"
                  className="mt-5 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700"
                >
                  Ver paciente exemplo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}