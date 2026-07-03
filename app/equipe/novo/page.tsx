import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default function NovoMembro() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Equipe e Acessos" />

        <section className="flex-1 p-8">
          <div>
            <h2 className="text-3xl font-bold">Convidar Membro</h2>
            <p className="mt-1 text-slate-500">
              Adicione profissionais, recepcionistas ou pessoas administrativas
              ao seu espaço de trabalho
            </p>
          </div>

          <form className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold">Nome completo</label>
                <input
                  type="text"
                  placeholder="Nome da pessoa"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">E-mail</label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Tipo de membro</label>
                <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                  <option>Profissional da saúde</option>
                  <option>Recepcionista</option>
                  <option>Secretária</option>
                  <option>Financeiro</option>
                  <option>Administrador</option>
                  <option>Outro</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Profissão</label>
                <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                  <option>Não se aplica</option>
                  <option>Médicos</option>
                  <option>Dentistas</option>
                  <option>Psicólogos</option>
                  <option>Nutricionistas</option>
                  <option>Fisioterapeutas</option>
                  <option>Biomédicos</option>
                  <option>Fonoaudiólogos</option>
                  <option>Podólogos</option>
                  <option>Esteticistas</option>
                  <option>Terapeutas</option>
                  <option>Outros</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Função no sistema</label>
                <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                  <option>Profissional</option>
                  <option>Recepção</option>
                  <option>Financeiro</option>
                  <option>Administrador</option>
                  <option>Acesso limitado</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Status do convite</label>
                <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none">
                  <option>Enviar convite por e-mail</option>
                  <option>Cadastrar manualmente</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold">Permissões iniciais</label>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                    <input type="checkbox" />
                    Agenda
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                    <input type="checkbox" />
                    Pacientes
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                    <input type="checkbox" />
                    Prontuário
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                    <input type="checkbox" />
                    Financeiro
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                    <input type="checkbox" />
                    Relatórios
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                    <input type="checkbox" />
                    Configurações
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold">Observações</label>
                <textarea
                  placeholder="Observações sobre esse membro da equipe..."
                  className="mt-2 h-28 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Link
                href="/equipe"
                className="rounded-xl border border-slate-200 px-5 py-3 font-semibold"
              >
                Cancelar
              </Link>

              <Link
                href="/equipe"
                className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
              >
                Enviar convite
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}