export const dentesSuperiores = [
  "18",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
];

export const dentesInferiores = [
  "48",
  "47",
  "46",
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
];

export type OdontogramaStatus =
  | "Sadio"
  | "Cariado"
  | "Restaurado"
  | "Tratamento de canal"
  | "Prótese";

export type OdontogramaRegistro = {
  dente: string;
  status: OdontogramaStatus;
  procedimento: string;
  observacao: string;
  atualizadoEm: string;
};

export const statusOdontograma: OdontogramaStatus[] = [
  "Sadio",
  "Cariado",
  "Restaurado",
  "Tratamento de canal",
  "Prótese",
];

export const odontogramaPadrao: Record<number, OdontogramaRegistro[]> = {
  1: [
    {
      dente: "16",
      status: "Cariado",
      procedimento: "Restauração",
      observacao: "Restauração do dente 16 em acompanhamento.",
      atualizadoEm: "12/06/2026",
    },
    {
      dente: "13",
      status: "Restaurado",
      procedimento: "Restauração concluída",
      observacao: "Restauração finalizada.",
      atualizadoEm: "12/06/2026",
    },
    {
      dente: "21",
      status: "Restaurado",
      procedimento: "Clareamento",
      observacao: "Clareamento planejado.",
      atualizadoEm: "12/06/2026",
    },
    {
      dente: "34",
      status: "Tratamento de canal",
      procedimento: "Canal",
      observacao: "Dente marcado para revisão.",
      atualizadoEm: "12/06/2026",
    },
    {
      dente: "36",
      status: "Prótese",
      procedimento: "Prótese",
      observacao: "Prótese em acompanhamento.",
      atualizadoEm: "12/06/2026",
    },
  ],
  2: [
    {
      dente: "36",
      status: "Tratamento de canal",
      procedimento: "Canal",
      observacao: "Tratamento de canal iniciado.",
      atualizadoEm: "10/06/2026",
    },
  ],
};

export function getOdontogramaPadrao(pacienteId: number) {
  return odontogramaPadrao[pacienteId] ?? [];
}
