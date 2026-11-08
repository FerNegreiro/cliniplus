import type {
  CliniplusAgendamento,
  CliniplusDocumento,
  CliniplusLancamentoFinanceiro,
  CliniplusOrcamento,
  CliniplusPaciente,
  CliniplusProcedimentoHof,
  CliniplusTratamento,
} from "@/utils/cliniplusStore";
import { dataIsoLocal, formatarDataBr } from "@/utils/datas";

function base() {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
}

function dia(deslocamento: number) {
  const data = base();
  data.setDate(data.getDate() + deslocamento);
  return dataIsoLocal(data);
}

function diaDoMes(mesesAtras: number, diaMes: number) {
  const hoje = base();
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras + 1, 0).getDate();
  const diaSeguro = mesesAtras === 0 ? Math.min(diaMes, hoje.getDate()) : Math.min(diaMes, ultimoDia);
  return dataIsoLocal(new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, diaSeguro));
}

function noMes(diasAtras: number) {
  const hoje = base();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const data = new Date(hoje);
  data.setDate(data.getDate() - diasAtras);
  return dataIsoLocal(data < inicio ? inicio : data);
}

function nascimentoNoMesAtual(ano: number, diaMes: number) {
  const hoje = base();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}-${String(Math.min(diaMes, 28)).padStart(2, "0")}`;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const profissional = "Dr. Rafael Oliveira";
const hof = "Dra. Juliana Pires";

export function demoPacientes(): CliniplusPaciente[] {
  const lista: Array<Partial<CliniplusPaciente> & Pick<CliniplusPaciente, "id" | "nome" | "status" | "tipoAtendimento">> = [
    { id: 1, nome: "Maria Silva", tipoAtendimento: "odontologia", status: "Em tratamento", convenio: "Particular", telefone: "(85) 99999-0001", email: "maria.silva@email.com", dataNascimento: "1988-03-14", ultimo: dia(-14) },
    { id: 2, nome: "João Almeida", tipoAtendimento: "odontologia", status: "Retorno pendente", convenio: "OdontoPrev", telefone: "(85) 98888-0002", email: "joao.almeida@email.com", dataNascimento: "1975-09-02", ultimo: dia(-35) },
    { id: 3, nome: "Ana Costa", tipoAtendimento: "estetica", status: "Em tratamento", convenio: "Particular", telefone: "(85) 97777-0003", email: "ana.costa@email.com", dataNascimento: nascimentoNoMesAtual(1992, 21), ultimo: dia(-7) },
    { id: 4, nome: "Pedro Lima", tipoAtendimento: "odontologia", status: "Ativo", convenio: "Amil Dental", telefone: "(85) 96666-0004", email: "pedro.lima@email.com", dataNascimento: "2001-12-19", ultimo: dia(-20) },
    { id: 5, nome: "Carla Mendes", tipoAtendimento: "estetica", status: "Em tratamento", convenio: "Particular", telefone: "(85) 95555-0005", email: "carla.mendes@email.com", dataNascimento: "1985-07-30", ultimo: dia(-3) },
    { id: 6, nome: "Lucas Ferreira", tipoAtendimento: "odontologia", status: "Ativo", convenio: "Bradesco Dental", telefone: "(85) 94444-0006", email: "lucas.ferreira@email.com", dataNascimento: nascimentoNoMesAtual(1998, 9), ultimo: dia(-10) },
    { id: 7, nome: "Beatriz Rocha", tipoAtendimento: "odontologia", status: "Em tratamento", convenio: "Particular", telefone: "(85) 93333-0007", email: "beatriz.rocha@email.com", dataNascimento: "2015-04-11", ultimo: dia(-21) },
    { id: 8, nome: "Rafael Souza", tipoAtendimento: "odontologia", status: "Orçamento pendente", convenio: "Particular", telefone: "(85) 92222-0008", email: "rafael.souza@email.com", dataNascimento: "1979-01-25", ultimo: dia(-12) },
  ];

  return lista.map((paciente) => ({
    area: paciente.tipoAtendimento === "estetica" ? "HOF" : "Odontologia",
    telefone: "",
    email: "",
    convenio: "Particular",
    ...paciente,
    ultimo: formatarDataBr(paciente.ultimo),
    codigo: `P${String(paciente.id).padStart(6, "0")}`,
  })) as CliniplusPaciente[];
}

const nomes: Record<number, string> = Object.fromEntries(demoPacientes().map((paciente) => [paciente.id, paciente.nome]));

function agendamento(
  id: number,
  pacienteId: number,
  deslocamento: number,
  hora: string,
  tipo: string,
  procedimento: string,
  status: string,
  extras: Partial<CliniplusAgendamento> = {}
): CliniplusAgendamento {
  const ehHof = [3, 5].includes(pacienteId);
  return {
    id,
    pacienteId,
    paciente: nomes[pacienteId],
    tipo,
    data: dia(deslocamento),
    hora,
    duracao: "45 min",
    sala: ehHof ? "Sala 02" : "Consultório 01",
    prioridade: "Normal",
    status,
    procedimento,
    profissional: ehHof ? hof : profissional,
    especialidade: ehHof ? "HOF" : "Clinica geral",
    observacoes: "",
    ...extras,
  };
}

export function demoAgendamentos(): CliniplusAgendamento[] {
  return [
    agendamento(1, 1, 0, "08:30", "Retorno", "Restauração dente 16", "Atendido"),
    agendamento(2, 6, 0, "09:30", "Procedimento", "Profilaxia e polimento", "Em atendimento"),
    agendamento(3, 3, 0, "11:00", "Procedimento", "Toxina botulínica - retorno", "Confirmado"),
    agendamento(4, 2, 0, "14:00", "Retorno", "Revisão do canal", "Aguardando"),
    agendamento(5, 7, 0, "16:00", "Consulta inicial", "Avaliação ortodôntica", "Confirmado"),
    agendamento(6, 4, 1, "09:00", "Procedimento", "Extração do siso 38", "Aguardando"),
    agendamento(7, 5, 1, "15:00", "Procedimento", "Preenchimento labial", "Aguardando"),
    agendamento(8, 8, 2, "10:00", "Consulta inicial", "Avaliação para implante", "Confirmado"),
    agendamento(9, 1, 3, "08:30", "Procedimento", "Clareamento - sessão 1", "Confirmado"),
    agendamento(10, 6, 4, "14:30", "Retorno", "Controle periodontal", "Aguardando"),
    agendamento(11, 4, -1, "10:00", "Procedimento", "Restauração dente 26", "Atendido"),
    agendamento(12, 2, -2, "09:00", "Retorno", "Retorno pós-canal", "Cancelado"),
    agendamento(13, 3, -7, "11:00", "Procedimento", "Toxina botulínica", "Atendido"),
    agendamento(14, 7, -9, "15:30", "Consulta inicial", "Avaliação inicial", "Atendido"),
  ];
}

export function demoTratamentos(): CliniplusTratamento[] {
  return [
    { id: 1, pacienteId: 1, paciente: nomes[1], descricao: "Restauração dente 16", status: "Concluído", valor: moeda(280), data: dia(-14) },
    { id: 2, pacienteId: 1, paciente: nomes[1], descricao: "Clareamento a laser", status: "Planejado", valor: moeda(900), data: dia(3) },
    { id: 3, pacienteId: 2, paciente: nomes[2], descricao: "Tratamento de canal dente 36", status: "Em andamento", valor: moeda(850), data: dia(-35) },
    { id: 4, pacienteId: 7, paciente: nomes[7], descricao: "Aparelho ortodôntico autoligado", status: "Em andamento", valor: moeda(3200), data: dia(-21) },
    { id: 5, pacienteId: 4, paciente: nomes[4], descricao: "Extração do siso 38", status: "Urgente", valor: moeda(450), data: dia(1) },
    { id: 6, pacienteId: 8, paciente: nomes[8], descricao: "Implante dente 46", status: "Planejado", valor: moeda(3800), data: dia(10) },
  ];
}

export function demoFinanceiro(): CliniplusLancamentoFinanceiro[] {
  const lancamentos: CliniplusLancamentoFinanceiro[] = [];
  let id = 1;
  const receita = (data: string, descricao: string, valor: number, pacienteId?: number, status = "Pago", extras: Partial<CliniplusLancamentoFinanceiro> = {}) =>
    lancamentos.push({
      id: id++,
      tipo: "Receita",
      descricao,
      valor: moeda(valor),
      status,
      data,
      pacienteId,
      paciente: pacienteId ? nomes[pacienteId] : undefined,
      origem: extras.convenio ? "Plano de saúde" : "Particular",
      formaPagamento: extras.convenio ? "Convênio" : "Pix",
      ...extras,
    });
  const despesa = (data: string, descricao: string, valor: number, origem: string, status = "Pago") =>
    lancamentos.push({ id: id++, tipo: "Despesa", descricao, valor: moeda(valor), status, data, origem, formaPagamento: "Boleto" });

  const receitasPorMes = [
    [9200, 7800], [11400, 8100], [10300, 8600], [12800, 8900], [11900, 9100],
  ];
  receitasPorMes.forEach(([receitaMes, despesaMes], indice) => {
    const mesesAtras = 5 - indice;
    receita(diaDoMes(mesesAtras, 8), "Atendimentos particulares", receitaMes * 0.6);
    receita(diaDoMes(mesesAtras, 18), "Procedimentos de HOF", receitaMes * 0.4);
    despesa(diaDoMes(mesesAtras, 5), "Aluguel do consultório", despesaMes * 0.45, "Despesa fixa");
    despesa(diaDoMes(mesesAtras, 12), "Laboratório de prótese", despesaMes * 0.3, "Laboratório");
    despesa(diaDoMes(mesesAtras, 20), "Materiais odontológicos", despesaMes * 0.25, "Materiais");
  });

  receita(noMes(14), "Restauração dente 16", 280, 1);
  receita(noMes(7), "Toxina botulínica", 1200, 3);
  receita(noMes(1), "Restauração dente 26", 320, 4, "Pago", { convenio: "Amil Dental", guia: "AMD-55821" });
  receita(noMes(9), "Avaliação ortodôntica e documentação", 350, 7);
  receita(noMes(3), "Bioestimulador de colágeno - sessão 1", 1800, 5);
  receita(noMes(2), "Atendimentos particulares da semana", 3900);
  receita(noMes(5), "Aparelho ortodôntico - entrada", 1600, 7);
  receita(dia(-6), "Manutenção mensal do aparelho", 250, 7, "Pendente");
  receita(noMes(4), "Tratamento de canal - parcela 2", 425, 2, "Aguardando convênio", { convenio: "OdontoPrev", guia: "ODP-10293" });
  despesa(noMes(2), "Aluguel do consultório", 4100, "Despesa fixa");
  despesa(noMes(1), "Materiais odontológicos", 1350, "Materiais");
  despesa(dia(5), "Laboratório de prótese", 1600, "Laboratório", "Pendente");

  return lancamentos;
}

function itemOrcamento(id: string, procedimento: string, valor: number, dente?: string) {
  return { id, procedimento, dente, quantidade: 1, valorUnitario: valor, desconto: 0, valorFinal: valor };
}

function orcamento(
  id: string,
  numero: string,
  pacienteId: number,
  status: CliniplusOrcamento["status"],
  itens: ReturnType<typeof itemOrcamento>[],
  criadoEm: string
): CliniplusOrcamento {
  const total = itens.reduce((soma, item) => soma + item.valorFinal, 0);
  return {
    id,
    numero,
    pacienteId,
    origem: "manual",
    status,
    itens,
    subtotal: total,
    descontos: 0,
    total,
    entrada: 0,
    valorRestante: total,
    condicaoPagamento: "Em até 6x sem juros",
    formasPagamento: ["Pix", "Cartão de crédito"],
    mensagemPaciente: "",
    criadoEm: `${criadoEm}T10:00:00.000Z`,
  };
}

export function demoOrcamentos(): CliniplusOrcamento[] {
  return [
    orcamento("orc-1", "ORC-0001", 7, "aprovado", [itemOrcamento("o1", "Aparelho ortodôntico autoligado", 3200)], dia(-25)),
    orcamento("orc-2", "ORC-0002", 8, "enviado", [itemOrcamento("o2", "Implante", 3200, "46"), itemOrcamento("o3", "Coroa sobre implante", 1600, "46")], dia(-10)),
    orcamento("orc-3", "ORC-0003", 1, "enviado", [itemOrcamento("o4", "Clareamento a laser", 900)], dia(-2)),
    orcamento("orc-4", "ORC-0004", 5, "aprovado", [itemOrcamento("o5", "Bioestimulador de colágeno (3 sessões)", 5100)], dia(-6)),
    orcamento("orc-5", "ORC-0005", 4, "rascunho", [itemOrcamento("o6", "Extração do siso", 450, "38"), itemOrcamento("o7", "Extração do siso", 450, "48")], dia(-1)),
  ];
}

export function demoProcedimentosHof(): CliniplusProcedimentoHof[] {
  const criado = new Date().toISOString();
  return [
    { id: "hof-1", pacienteId: 3, data: dia(-7), procedimento: "Toxina botulínica", regiao: "Glabela e testa", produto: "Toxina botulínica tipo A", lote: "TX2391", validade: dia(240), quantidade: "40 U", valor: moeda(1200), status: "Realizado", retorno: dia(8), observacoes: "Retorno em 15 dias para avaliar simetria.", profissional: hof, criadoEm: criado },
    { id: "hof-2", pacienteId: 5, data: dia(-3), procedimento: "Bioestimulador de colágeno", regiao: "Terço médio e inferior", produto: "Ácido poli-L-láctico", lote: "BC5520", validade: dia(300), quantidade: "1 frasco", valor: moeda(1800), status: "Realizado", retorno: dia(27), observacoes: "Sessão 1 de 3.", profissional: hof, criadoEm: criado },
    { id: "hof-3", pacienteId: 5, data: dia(1), procedimento: "Preenchimento labial", regiao: "Lábios", produto: "Ácido hialurônico", lote: "AH8812", validade: dia(180), quantidade: "1 ml", valor: moeda(1500), status: "Planejado", retorno: "", observacoes: "", profissional: hof, criadoEm: criado },
  ];
}

export function demoDocumentos(): CliniplusDocumento[] {
  const doc = (id: number, pacienteId: number, nome: string, categoria: string, tipo: string, deslocamento: number, enviadoPor: string) => ({
    id,
    pacienteId,
    paciente: nomes[pacienteId],
    nome,
    categoria,
    tipo,
    data: dia(deslocamento),
    dataEnvio: dia(deslocamento),
    horaEnvio: "10:00",
    formato: tipo === "imagem" ? "JPG" : "PDF",
    extensao: tipo === "imagem" ? "JPG" : "PDF",
    tamanho: "",
    origem: "Demonstração",
    enviadoPor,
    status: "ativo",
    observacao: "Registro de exemplo, sem arquivo anexado",
    criadoEm: `${dia(deslocamento)}T10:00:00.000Z`,
  });
  return [
    doc(1, 1, "Radiografia panorâmica", "Radiografia", "pdf", -14, profissional),
    doc(2, 7, "Documentação ortodôntica", "Exame", "pdf", -9, profissional),
    doc(3, 3, "Termo de consentimento - toxina botulínica", "Termo", "pdf", -7, hof),
  ] as CliniplusDocumento[];
}
