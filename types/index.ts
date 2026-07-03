export type Paciente = {
  id: number;
  nome: string;
  area: string;
  tipoAtendimento: "odontologia" | "estetica";
  status: string;
  ultimo: string;
  telefone: string;
  email: string;
  convenio: string;
};

export type Consulta = {
  id: number;
  hora: string;
  paciente: string;
  tipo: string;
  status: string;
};

export type Lancamento = {
  id: number;
  paciente?: string;
  descricao: string;
  tipo: string;
  valor: string;
  status: string;
  origem?: string;
  convenio?: string;
  guia?: string;
  autorizacao?: string;
  previsaoRecebimento?: string;
};

export type Plano = {
  nome: string;
  preco: string;
  descricao: string;
  destaque: boolean;
  recursos: string[];
  bloqueados: string[];
};

export type MembroEquipe = {
  id: number;
  nome: string;
  cargo: string;
  profissao: string;
  status: string;
};