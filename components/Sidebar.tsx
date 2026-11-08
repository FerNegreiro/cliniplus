"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Folder,
  HeartPulse,
  House,
  type LucideIcon,
  MessageCircle,
  Receipt,
  ScanFace,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { normalizarTexto } from "@/utils/format";

type PlanoSlug = "starter" | "pro" | "premium";

type SidebarProps = {
  active: string;
  plano?: PlanoSlug;
};

type MenuItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  { name: "Início", href: "/dashboard", icon: House },
  { name: "Agenda", href: "/agenda", icon: CalendarDays },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Prontuários", href: "/prontuario", icon: ClipboardList },
  { name: "Tratamentos", href: "/tratamentos", icon: HeartPulse },
  { name: "HOF", href: "/estetica-odontologica", icon: ScanFace },
  { name: "Orçamentos", href: "/orcamentos", icon: Receipt },
  { name: "Financeiro", href: "/financeiro", icon: Wallet },
  { name: "Comunicação", href: "/comunicacao", icon: MessageCircle },
  { name: "Documentos", href: "/documentos", icon: Folder },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

const activeAliases: Record<string, string[]> = {
  Início: ["Dashboard", "Inicio"],
  Prontuários: ["Prontuario", "Prontuarios"],
  Financeiro: ["Visao geral financeira"],
  Relatórios: ["Relatorios"],
  Comunicação: ["Comunicacao"],
  Orçamentos: ["Orcamentos"],
  HOF: ["Estetica", "Estetica odontologica"],
  Configurações: ["Configuracoes"],
};

function isItemActive(
  pathname: string,
  search: string,
  item: MenuItem,
  active: string
) {
  const itemName = normalizarTexto(item.name);
  const activeName = normalizarTexto(active);
  const aliases = activeAliases[item.name]?.map(normalizarTexto) || [];
  const activeIsProntuario = ["prontuario", "prontuarios"].includes(activeName);
  const hasProntuarioQuery =
    pathname.startsWith("/pacientes/") &&
    new URLSearchParams(search).get("aba") === "prontuario";
  const routeMatches = (menuItem: MenuItem) => {
    if (menuItem.href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname === menuItem.href || pathname.startsWith(`${menuItem.href}/`);
  };

  if (
    pathname.startsWith("/pacientes/") &&
    (activeIsProntuario || hasProntuarioQuery)
  ) {
    return item.name === "Prontuários";
  }

  if (menuItems.some(routeMatches)) {
    return routeMatches(item);
  }

  if (activeName === itemName || aliases.includes(activeName)) {
    return true;
  }

  return false;
}

function NavLink({
  item,
  active,
}: {
  item: MenuItem;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={
        active
          ? "flex h-12 shrink-0 items-center gap-2 rounded-lg bg-indigo-50 px-4 text-sm font-black text-indigo-700 shadow-sm ring-1 ring-indigo-100"
          : "flex h-12 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold text-indigo-950 transition hover:bg-indigo-50 hover:text-indigo-700"
      }
    >
      <Icon size={19} strokeWidth={2.2} />
      <span className="whitespace-nowrap">{item.name}</span>
    </Link>
  );
}

function TopNavigation({
  active,
  pathname,
  search,
}: SidebarProps & {
  pathname: string;
  search: string;
}) {
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
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              item={item}
              active={isItemActive(pathname, search, item, active)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

function SidebarContent({ active }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <TopNavigation
      active={active}
      pathname={pathname}
      search={searchParams.toString()}
    />
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<TopNavigation {...props} pathname="" search="" />}>
      <SidebarContent {...props} />
    </Suspense>
  );
}
