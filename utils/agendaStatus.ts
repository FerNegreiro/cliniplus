import { normalizarTexto } from "@/utils/format";

export type StatusAgenda =
  | "confirmado"
  | "em_atendimento"
  | "concluido"
  | "aguardando"
  | "cancelado"
  | "bloqueio"
  | "outro";

export function normalizarStatus(status?: string): StatusAgenda {
  const texto = normalizarTexto(status);

  if (texto.includes("conclu") || texto.includes("realizad") || texto.includes("atendido") || texto.includes("finaliz")) {
    return "concluido";
  }
  if (texto.includes("confirm")) return "confirmado";
  if (texto.includes("atendimento")) return "em_atendimento";
  if (texto.includes("aguard") || texto.includes("pendente") || texto.includes("agendado")) return "aguardando";
  if (texto.includes("cancel") || texto.includes("falta")) return "cancelado";
  if (texto.includes("bloque")) return "bloqueio";
  return "outro";
}

const rotulos: Record<StatusAgenda, string> = {
  confirmado: "Confirmado",
  em_atendimento: "Em atendimento",
  concluido: "Atendido",
  aguardando: "Aguardando",
  cancelado: "Cancelado",
  bloqueio: "Bloqueio",
  outro: "Sem status",
};

const classes: Record<StatusAgenda, string> = {
  confirmado: "bg-emerald-50 text-emerald-700",
  em_atendimento: "bg-indigo-50 text-indigo-700",
  concluido: "bg-slate-100 text-slate-700",
  aguardando: "bg-amber-50 text-amber-700",
  cancelado: "bg-rose-50 text-rose-700",
  bloqueio: "bg-slate-200 text-slate-600",
  outro: "bg-slate-100 text-slate-600",
};

export function labelStatus(status?: string) {
  const normalizado = normalizarStatus(status);
  return normalizado === "outro" ? status || rotulos.outro : rotulos[normalizado];
}

export function classeStatus(status?: string) {
  return classes[normalizarStatus(status)];
}
