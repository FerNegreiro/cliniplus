export function dataIsoLocal(data: Date = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function hojeIso() {
  return dataIsoLocal(new Date());
}

export function somarDias(iso: string, dias: number) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return dataIsoLocal(new Date(ano, mes - 1, dia + dias));
}

export function formatarDataBr(iso?: string) {
  if (!iso) return "-";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}
