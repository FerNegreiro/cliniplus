import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Perfil() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Perfil" />

        <section className="min-w-0 flex-1 px-6 py-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-cyan-700">
              Conta
            </p>
            <h1 className="mt-2 text-3xl font-bold">Perfil do usuario</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
              Dados demonstrativos ate a autenticacao real ser conectada.
            </p>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[420px_1fr]">
            <aside className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cyan-100 text-3xl font-bold text-cyan-700">
                DF
              </div>
              <h2 className="mt-5 text-2xl font-bold">Dr. Fernando Silva</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Odontologia • CRO 12345/SP
              </p>
              <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Plano Starter
              </span>

              <div className="mt-6 grid gap-3">
                <Link
                  href="/configuracoes"
                  className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
                >
                  Editar perfil
                </Link>
                <Link
                  href="/"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Sair
                </Link>
              </div>
            </aside>

            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Informacoes pessoais</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[
                    ["Nome", "Dr. Fernando Silva"],
                    ["E-mail", "fernando@cliniplus.demo"],
                    ["Telefone", "(11) 99999-0000"],
                    ["Plano atual", "Starter"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">
                        {label}
                      </p>
                      <p className="mt-2 font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-cyan-900">
                  Acesso e plano
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-cyan-800">
                  O perfil separa dados do usuario, assinatura e preferencias
                  da clinica. Quando a autenticacao real entrar, esses dados
                  passam a vir da conta conectada.
                </p>
                <Link
                  href="/planos"
                  className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-cyan-700"
                >
                  Ver planos
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
