import Sidebar from "@/components/Sidebar";
import NovoPacienteForm from "@/components/NovoPacienteForm";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";

export default function NovoPaciente() {
  return (
    <main className="min-h-screen bg-[#f6f8ff] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar active="Pacientes" />

        <section className="min-w-0 flex-1 px-5 py-5 lg:px-7">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <Link
                href="/pacientes"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-indigo-700"
              >
                <ChevronLeft size={17} />
                Voltar para pacientes
              </Link>
              <h1 className="mt-4 text-3xl font-black tracking-tight">
                Novo paciente
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Centralize o cadastro, acolhimento clinico, documentos e preferencias de comunicacao do paciente.
              </p>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500 shadow-sm lg:w-[420px]">
                <Search size={19} />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                  placeholder="Buscar paciente, prontuario ou contato..."
                />
              </label>
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
                href="/pacientes/novo"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Novo paciente
                <ChevronDown size={16} />
              </Link>
            </div>
          </header>

          <NovoPacienteForm />
        </section>
      </div>
    </main>
  );
}
