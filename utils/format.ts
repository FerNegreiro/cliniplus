export function normalizarTexto(valor?: string | null) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function dinheiroParaNumero(valor?: string | number | null) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  if (!valor) return 0;
  const limpo = valor.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  return Number(limpo) || 0;
}

export function formatarMoeda(valor: number) {
  return (Number.isFinite(valor) ? valor : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
