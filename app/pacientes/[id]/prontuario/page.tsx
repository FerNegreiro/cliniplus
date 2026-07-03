import Sidebar from "@/components/Sidebar";
import PremiumCard from "@/components/PremiumCard";
import PacienteLocalModulo from "@/components/PacienteLocalModulo";
import PacienteTabs from "@/components/PacienteTabs";
import { PatientProntuarioEditor } from "@/components/PatientLiveEditors";
import Link from "next/link";
import { pacientes } from "@/data/pacientes";
import { lancamentos } from "@/data/financeiro";

type ProntuarioPacienteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProntuarioPaciente({
  params,
}: ProntuarioPacienteProps) {
  const { id } = await params;

  const paciente = pacientes.find((paciente) => paciente.id === Number(id));

  if (!paciente) {
    return (
      <PacienteLocalModulo
        id={id}
        active="Prontuario"
        title="Prontuário"
        description="Histórico clínico, financeiro, convênio e registros do paciente."
      />
    );
  }

  const lancamentosDoPaciente = lancamentos.filter(
    (lancamento) => lancamento.paciente === paciente.nome
  );

  const ultimoLancamento = lancamentosDoPaciente[0];

  const temRecusadoConvenio = lancamentosDoPaciente.some(
    (lancamento) => lancamento.status === "Glosado"
  );

  const temAguardandoConvenio = lancamentosDoPaciente.some(
    (lancamento) => lancamento.status === "Aguardando convênio"
  );

  const temPendente = lancamentosDoPaciente.some(
    (lancamento) => lancamento.status === "Pendente"
  );

  const temPago = lancamentosDoPaciente.some(
    (lancamento) =>
      lancamento.status === "Pago" ||
      lancamento.status === "Recebido do convênio"
  );

  let statusFinanceiro = "Sem lançamento financeiro";
  let classeStatusFinanceiro = "bg-slate-200 text-slate-700";

  if (temRecusadoConvenio) {
    statusFinanceiro = "Recusado pelo convênio";
    classeStatusFinanceiro = "bg-red-100 text-red-700";
  } else if (temAguardandoConvenio) {
    statusFinanceiro = "Aguardando convênio";
    classeStatusFinanceiro = "bg-blue-100 text-blue-700";
  } else if (temPendente) {
    statusFinanceiro = "Pagamento pendente";
    classeStatusFinanceiro = "bg-amber-100 text-amber-700";
  } else if (temPago) {
    statusFinanceiro = "Em dia";
    classeStatusFinanceiro = "bg-emerald-100 text-emerald-700";
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

        <section className="flex-1 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                Prontuário de {paciente.nome}
              </h2>

              <p className="mt-1 text-slate-500">
                Histórico clínico, financeiro, convênio e registros do paciente
              </p>
            </div>

            <Link
              href={`/pacientes/${paciente.id}`}
              className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
            >
              Voltar ao paciente
            </Link>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <PacienteTabs pacienteId={paciente.id} active="Prontuario" />
          </div>

          <div className="mt-6">
            <PatientProntuarioEditor
              pacienteId={paciente.id}
              pacienteNome={paciente.nome}
            />

            <div className="hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Resumo financeiro</h3>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${classeStatusFinanceiro}`}
                >
                  {statusFinanceiro}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm text-slate-500">Origem</p>
                  <p className="mt-1 font-bold">
                    {ultimoLancamento?.origem || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm text-slate-500">Convênio</p>
                  <p className="mt-1 font-bold">
                    {ultimoLancamento?.convenio || paciente.convenio}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm text-slate-500">Valor</p>
                  <p className="mt-1 font-bold">
                    {ultimoLancamento?.valor || "Sem valor"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm text-slate-500">Guia</p>
                  <p className="mt-1 font-bold">
                    {ultimoLancamento?.guia || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm text-slate-500">Autorização</p>
                  <p className="mt-1 font-bold">
                    {ultimoLancamento?.autorizacao || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-sm text-slate-500">
                    Previsão de recebimento
                  </p>
                  <p className="mt-1 font-bold">
                    {ultimoLancamento?.previsaoRecebimento || "Não informado"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href={`/financeiro/novo?paciente=${encodeURIComponent(
                    paciente.nome
                  )}`}
                  className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
                >
                  Lançar financeiro
                </Link>

                <Link
                  href={`/agenda/novo?paciente=${encodeURIComponent(
                    paciente.nome
                  )}`}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold"
                >
                  Agendar retorno
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden">
            <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Novo registro clínico</h3>

                <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700">
                  Em edição
                </span>
              </div>

              <form className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-semibold">
                    Queixa principal
                  </label>
                  <textarea
                    placeholder="Descreva o motivo principal do atendimento..."
                    className="mt-2 h-24 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Histórico e evolução
                  </label>
                  <textarea
                    placeholder="Informe histórico, evolução e observações importantes..."
                    className="mt-2 h-32 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Conduta / Plano de cuidado
                  </label>
                  <textarea
                    placeholder="Descreva orientações, condutas, solicitações ou próximos passos..."
                    className="mt-2 h-32 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-5 py-3 font-semibold"
                  >
                    Salvar rascunho
                  </button>

                  <button
                    type="button"
                    className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
                  >
                    Finalizar registro
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">Lançamentos financeiros</h3>

                <div className="mt-6 space-y-4">
                  {lancamentosDoPaciente.length > 0 ? (
                    lancamentosDoPaciente.map((lancamento) => (
                      <div
                        key={lancamento.id}
                        className="rounded-2xl bg-slate-100 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">
                            {lancamento.descricao}
                          </p>

                          <span className="text-sm font-bold text-slate-700">
                            {lancamento.valor}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {lancamento.origem || lancamento.tipo} •{" "}
                          {lancamento.status === "Glosado"
                            ? "Recusado pelo convênio"
                            : lancamento.status}
                        </p>

                        {lancamento.convenio && (
                          <p className="mt-1 text-xs text-slate-500">
                            Convênio: {lancamento.convenio}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="font-semibold">
                        Nenhum lançamento vinculado
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Ainda não existe pagamento ou repasse financeiro para
                        este paciente.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <PremiumCard
                title="IA no prontuário"
                description="Organize evoluções, resuma históricos e ajude na estruturação dos registros do paciente."
              />
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
              <h3 className="text-xl font-bold">Histórico do prontuário</h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Consulta inicial</p>
                    <span className="text-sm text-slate-500">
                      {paciente.ultimo}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Registro inicial do paciente, avaliação e plano de
                    acompanhamento.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Evolução registrada</p>
                    <span className="text-sm text-slate-500">
                      {paciente.ultimo}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Evolução adicionada ao histórico do paciente.
                  </p>
                </div>
              </div>
            </div>

            <PremiumCard
              title="Documentos e anexos"
              description="Anexe exames, receitas, laudos, termos, contratos e documentos importantes do paciente."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
