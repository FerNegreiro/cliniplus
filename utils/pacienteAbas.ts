export type AbaPaciente =
  | "resumo"
  | "prontuario"
  | "odontograma"
  | "tratamentos"
  | "financeiro"
  | "documentos"
  | "historico";

export type PacienteTabActive =
  | "Resumo"
  | "Prontuario"
  | "Odontograma"
  | "Tratamentos"
  | "Financeiro"
  | "Documentos"
  | "Historico";

const abasPaciente: AbaPaciente[] = [
  "resumo",
  "prontuario",
  "odontograma",
  "tratamentos",
  "financeiro",
  "documentos",
  "historico",
];

export function normalizarAbaPaciente(valor: unknown): AbaPaciente {
  const aba = Array.isArray(valor) ? valor[0] : valor;

  if (typeof aba === "string" && abasPaciente.includes(aba as AbaPaciente)) {
    return aba as AbaPaciente;
  }

  return "resumo";
}

export function getPacienteTabActive(aba: AbaPaciente): PacienteTabActive {
  const activePorAba: Record<AbaPaciente, PacienteTabActive> = {
    resumo: "Resumo",
    prontuario: "Prontuario",
    odontograma: "Odontograma",
    tratamentos: "Tratamentos",
    financeiro: "Financeiro",
    documentos: "Documentos",
    historico: "Historico",
  };

  return activePorAba[aba];
}
