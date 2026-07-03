import Sidebar from "@/components/Sidebar";
import NovoAgendamentoClient from "@/components/NovoAgendamentoClient";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";

type NovoAgendamentoProps = {
  searchParams: Promise<{
    paciente?: string;
    data?: string;
    hora?: string;
    tipo?: string;
    agendamentoId?: string;
  }>;
};

export default async function NovoAgendamento({
  searchParams,
}: NovoAgendamentoProps) {
  const { paciente, data, hora, tipo, agendamentoId } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f6f8ff] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar active="Agenda" />

        <section className="min-w-0 flex-1 px-5 py-5 lg:px-7">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight">
                Novo agendamento
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Crie consultas, retornos, exames e teleconsultas de forma rapida e inteligente.
              </p>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500 shadow-sm lg:w-[460px]">
                <Search size={19} />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                  placeholder="Buscar paciente, profissional, sala ou agendamento..."
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-700 shadow-sm"
                  aria-label="Notificacoes"
                >
                  <Bell size={19} />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-700 shadow-sm"
                  aria-label="Mensagens"
                >
                  <MessageSquare size={19} />
                </button>
                <Link
                  href="/agenda/novo"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Plus size={18} />
                  Novo agendamento
                  <ChevronDown size={16} />
                </Link>
              </div>
            </div>
          </header>

          <nav className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
            <Link href="/agenda" className="text-indigo-700 hover:text-indigo-900">
              Voltar para agenda
            </Link>
            <span>/</span>
            <Link href="/agenda" className="hover:text-indigo-700">
              Agenda
            </Link>
            <ChevronRight size={16} />
            <span className="text-slate-700">Novo agendamento</span>
          </nav>

          <NovoAgendamentoClient
            pacienteInicial={paciente}
            dataInicial={data}
            horaInicial={hora}
            tipoInicial={tipo}
            agendamentoId={agendamentoId}
          />
        </section>
      </div>
    </main>
  );
}
