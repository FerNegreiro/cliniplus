import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Folder,
  HeartPulse,
  House,
  MessageCircle,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type TopMenuItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const menuItems: TopMenuItem[] = [
  { name: "Início", href: "/dashboard", icon: House },
  { name: "Agenda", href: "/agenda", icon: CalendarDays },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Prontuários", href: "/prontuario", icon: ClipboardList },
  { name: "Tratamentos", href: "/tratamentos", icon: HeartPulse },
  { name: "Financeiro", href: "/financeiro", icon: Wallet },
  { name: "Comunicação", href: "/comunicacao", icon: MessageCircle },
  { name: "Documentos", href: "/documentos", icon: Folder },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function TopMenu({ active }: { active: string }) {
  const activeKey = normalize(active);

  return (
    <header className="cliniplus-top-nav fixed inset-x-0 top-0 z-50 border-b border-indigo-100 bg-white/95 text-indigo-950 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur print:hidden">
      <div className="flex min-h-16 items-center gap-4 px-5 lg:px-8">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center text-3xl font-black tracking-tight"
        >
          Clini<span className="text-emerald-500">+</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const activeItem =
              normalize(item.name) === activeKey ||
              (item.name === "Início" && activeKey === "dashboard") ||
              (item.name === "Prontuários" && activeKey === "prontuarios");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={
                  activeItem
                    ? "flex h-12 shrink-0 items-center gap-2 rounded-lg bg-indigo-50 px-4 text-sm font-black text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                    : "flex h-12 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-indigo-950 transition hover:bg-indigo-50 hover:text-indigo-700"
                }
              >
                <Icon size={19} strokeWidth={2.2} />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
