import Link from "next/link";

type PremiumCardProps = {
  title: string;
  description: string;
};

export default function PremiumCard({ title, description }: PremiumCardProps) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <div className="mb-4 w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
        Recurso premium
      </div>

      <h3 className="text-xl font-bold text-slate-900">{title}</h3>

      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <Link
        href="/planos"
        className="mt-6 block rounded-xl bg-slate-950 px-5 py-3 text-center font-semibold text-white"
      >
        Ver planos
      </Link>
    </div>
  );
}
