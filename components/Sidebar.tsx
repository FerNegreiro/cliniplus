"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Folder,
  HeartPulse,
  House,
  LayoutGrid,
  type LucideIcon,
  MessageCircle,
  Receipt,
  ScanFace,
  Settings,
  UserCog,
  UserRound,
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
  detalhe?: string;
};

type MenuGroup = {
  nome: string;
  icon: LucideIcon;
  itens: MenuItem[];
};

const menuPrincipal: MenuItem[] = [
  { name: "Início", href: "/dashboard", icon: House },
  { name: "Agenda", href: "/agenda", icon: CalendarDays },
  { name: "Pacientes", href: "/pacientes", icon: Users },
  { name: "Prontuários", href: "/prontuario", icon: ClipboardList },
  { name: "Tratamentos", href: "/tratamentos", icon: HeartPulse },
  { name: "HOF", href: "/estetica-odontologica", icon: ScanFace },
];

const gruposMenu: MenuGroup[] = [
  {
    nome: "Gestão",
    icon: Wallet,
    itens: [
      { name: "Financeiro", href: "/financeiro", icon: Wallet, detalhe: "Receitas e despesas" },
      { name: "Orçamentos", href: "/orcamentos", icon: Receipt, detalhe: "Propostas e aprovações" },
      { name: "Relatórios", href: "/relatorios", icon: BarChart3, detalhe: "Indicadores da clínica" },
    ],
  },
  {
    nome: "Mais",
    icon: LayoutGrid,
    itens: [
      { name: "Comunicação", href: "/comunicacao", icon: MessageCircle, detalhe: "Mensagens pelo WhatsApp" },
      { name: "Documentos", href: "/documentos", icon: Folder, detalhe: "Arquivos dos pacientes" },
      { name: "Equipe", href: "/equipe", icon: UserCog, detalhe: "Profissionais" },
      { name: "Configurações", href: "/configuracoes", icon: Settings, detalhe: "Clínica e agenda" },
      { name: "Meu perfil", href: "/perfil", icon: UserRound, detalhe: "Nome e CRO" },
    ],
  },
];

const menuItems: MenuItem[] = [...menuPrincipal, ...gruposMenu.flatMap((grupo) => grupo.itens)];

const activeAliases: Record<string, string[]> = {
  Início: ["Dashboard", "Inicio"],
  Prontuários: ["Prontuario", "Prontuarios"],
  Financeiro: ["Visao geral financeira"],
  Relatórios: ["Relatorios"],
  Comunicação: ["Comunicacao"],
  Orçamentos: ["Orcamentos"],
  HOF: ["Estetica", "Estetica odontologica"],
  Configurações: ["Configuracoes"],
  "Meu perfil": ["Perfil"],
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

const classeAtivo =
  "flex h-11 shrink-0 items-center gap-2 rounded-lg bg-indigo-50 px-2.5 sm:px-3 text-sm font-black text-indigo-700 shadow-sm ring-1 ring-indigo-100";
const classeInativo =
  "flex h-11 shrink-0 items-center gap-2 rounded-lg px-2.5 sm:px-3 text-sm font-bold text-indigo-950 transition hover:bg-indigo-50 hover:text-indigo-700";

function NavLink({ item, active }: { item: MenuItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link href={item.href} title={item.name} aria-label={item.name} className={active ? classeAtivo : classeInativo}>
      <Icon size={19} strokeWidth={2.2} />
      <span className="hidden whitespace-nowrap xl:inline">{item.name}</span>
    </Link>
  );
}

function NavGroup({
  grupo,
  pathname,
  search,
  active,
}: {
  grupo: MenuGroup;
  pathname: string;
  search: string;
  active: string;
}) {
  const [aberto, setAberto] = useState(false);
  const referencia = useRef<HTMLDivElement>(null);
  const itemAtivo = grupo.itens.find((item) => isItemActive(pathname, search, item, active));
  const Icon = itemAtivo?.icon || grupo.icon;

  useEffect(() => {
    setAberto(false);
  }, [pathname, search]);

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
      if (referencia.current && !referencia.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    function fecharComEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEsc);
    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEsc);
    };
  }, []);

  return (
    <div ref={referencia} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        title={grupo.nome}
        className={itemAtivo ? classeAtivo : classeInativo}
      >
        <Icon size={19} strokeWidth={2.2} />
        <span className="hidden whitespace-nowrap xl:inline">{itemAtivo?.name || grupo.nome}</span>
        <ChevronDown size={15} className={`transition ${aberto ? "rotate-180" : ""}`} />
      </button>

      {aberto && (
        <div role="menu" className="fixed inset-x-3 top-[4.5rem] z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-60 xl:left-0 xl:right-auto">
          {grupo.itens.map((item) => {
            const ItemIcon = item.icon;
            const ativo = isItemActive(pathname, search, item, active);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                  ativo ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50 hover:text-indigo-700"
                }`}
              >
                <ItemIcon size={18} />
                <span>
                  {item.name}
                  {item.detalhe && <span className="block text-xs font-semibold text-slate-400">{item.detalhe}</span>}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
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
      <div className="flex min-h-16 items-center gap-3 px-4 lg:px-8">
        <Link href="/dashboard" className="flex shrink-0 items-center text-2xl font-black tracking-tight sm:text-3xl">
          Clini<span className="text-emerald-500">+</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 py-2 sm:overflow-visible">
          {menuPrincipal.map((item) => (
            <NavLink key={item.name} item={item} active={isItemActive(pathname, search, item, active)} />
          ))}
          {gruposMenu.map((grupo) => (
            <NavGroup key={grupo.nome} grupo={grupo} pathname={pathname} search={search} active={active} />
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
