import Link from "next/link";

type ModuloEmPreparacaoProps = {
  titulo: string;
  descricao: string;
  hrefBotao?: string;
  textoBotao?: string;
};

export default function ModuloEmPreparacao({
  titulo,
  descricao,
  hrefBotao = "/dashboard",
  textoBotao = "Voltar ao dashboard",
}: ModuloEmPreparacaoProps) {
  return (
    <div className="rounded-3xl border border-cyan-100 bg-white p-8 shadow-sm">
      <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">
        Modulo em preparacao
      </span>
      <h1 className="mt-4 max-w-2xl text-3xl font-bold text-slate-950">
        {titulo}
      </h1>
      <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
        {descricao}
      </p>
      <Link
        href={hrefBotao}
        className="mt-6 inline-flex rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
      >
        {textoBotao}
      </Link>
    </div>
  );
}
