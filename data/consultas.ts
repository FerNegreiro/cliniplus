import type { Consulta } from "@/types";

export const consultas: Consulta[] = [
  {
    id: 1,
    hora: "09:00",
    paciente: "Maria Silva",
    tipo: "Consulta inicial",
    status: "Confirmado",
  },
  {
    id: 2,
    hora: "10:30",
    paciente: "João Almeida",
    tipo: "Retorno",
    status: "Aguardando",
  },
  {
    id: 3,
    hora: "14:00",
    paciente: "Ana Costa",
    tipo: "Avaliação",
    status: "Confirmado",
  },
  {
    id: 4,
    hora: "16:00",
    paciente: "Pedro Lima",
    tipo: "Procedimento",
    status: "Pendente",
  },
];