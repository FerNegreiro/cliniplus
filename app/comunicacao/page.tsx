"use client";

import { useEffect, useMemo, useState } from "react";
import { Cake, CalendarCheck, MessageCircle, Receipt, RotateCcw, Wallet } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  getAgendamentos,
  getLancamentosFinanceiros,
  getOrcamentos,
  getPacientes,
  type CliniplusAgendamento,
  type CliniplusLancamentoFinanceiro,
  type CliniplusOrcamento,
  type CliniplusPaciente,
} from "@/utils/cliniplusStore";
import { abrirWhatsApp } from "@/utils/whatsapp";
import { hojeIso } from "@/utils/datas";

type Modelo = {
  id: string;
  titulo: string;
  texto: string;
};

const modelos: Modelo[] = [
  {
    id: "confirmacao",
    titulo: "Confirmação de consulta",
    texto: "Olá, {nome}! Passando para confirmar seu atendimento no dia {data} às {hora}. Podemos confirmar sua presença?",
  },
  {
    id: "retorno",
    titulo: "Retorno odontológico",
    texto: "Olá, {nome}! Está na hora do seu retorno para acompanharmos o tratamento. Qual o melhor dia e horário para você?",
  },
  {
    id: "orcamento",
    titulo: "Orçamento pendente",
    texto: "Olá, {nome}! Ficou alguma dúvida sobre o orçamento que enviamos? Podemos ajustar a forma de pagamento se precisar.",
  },
  {
    id: "pos",
    titulo: "Pós-procedimento",
    texto: "Olá, {nome}! Como você está se sentindo após o procedimento? Qualquer desconforto, é só nos chamar por aqui.",
  },
  {
    id: "cobranca",
    titulo: "Cobrança amigável",
    texto: "Olá, {nome}! Identificamos um valor em aberto no seu atendimento. Podemos combinar a melhor forma de pagamento?",
  },
  {
    id: "aniversario",
    titulo: "Aniversário",
    texto: "Feliz aniversário, {nome}! Toda a equipe deseja um ano cheio de saúde e sorrisos.",
  },
];

type Dados = {
  pacientes: CliniplusPaciente[];
  agendamentos: CliniplusAgendamento[];
  orcamentos: CliniplusOrcamento[];
  financeiro: CliniplusLancamentoFinanceiro[];
};

function primeiroNome(nome?: string) {
  return (nome || "").trim().split(" ")[0] || "tudo bem";
}

function formatarData(valor?: string) {
  if (!valor) return "";
  const [ano, mes, dia] = valor.slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}` : valor;
}

function preencher(texto: string, valores: { nome?: string; data?: string; hora?: string }) {
  return texto
    .replace(/\{nome\}/g, primeiroNome(valores.nome))
    .replace(/\{data\}/g, valores.data || "(data)")
    .replace(/\{hora\}/g, valores.hora || "(horário)");
}

function isoDeAmanha() {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, "0")}-${String(amanha.getDate()).padStart(2, "0")}`;
}

function mesDeNascimento(paciente: CliniplusPaciente) {
  const data = paciente.dataNascimento || paciente.nascimento || "";
  const iso = data.match(/^\d{4}-(\d{2})-\d{2}/);
  if (iso) return Number(iso[1]);
  const br = data.match(/^\d{2}\/(\d{2})\/\d{4}/);
  return br ? Number(br[1]) : 0;
}

function Lista({
  titulo,
  icone: Icone,
  vazio,
  itens,
}: {
  titulo: string;
  icone: typeof MessageCircle;
  vazio: string;
  itens: Array<{ chave: string; nome: string; detalhe: string; acao: () => void }>;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icone size={20} />
        </span>
        <div>
          <h3 className="font-bold">{titulo}</h3>
          <p className="text-xs text-slate-500">{itens.length} paciente(s)</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {itens.slice(0, 6).map((item) => (
          <div key={item.chave} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{item.nome}</p>
              <p className="truncate text-xs text-slate-500">{item.detalhe}</p>
            </div>
            <button
              type="button"
              onClick={item.acao}
              className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              WhatsApp
            </button>
          </div>
        ))}
        {itens.length === 0 && <p className="text-sm text-slate-500">{vazio}</p>}
      </div>
    </div>
  );
}

export default function Comunicacao() {
  const [dados, setDados] = useState<Dados>({ pacientes: [], agendamentos: [], orcamentos: [], financeiro: [] });
  const [pacienteId, setPacienteId] = useState("");
  const [modeloId, setModeloId] = useState(modelos[0].id);
  const [mensagem, setMensagem] = useState(modelos[0].texto);

  useEffect(() => {
    function carregar() {
      setDados({
        pacientes: getPacientes(),
        agendamentos: getAgendamentos(),
        orcamentos: getOrcamentos(),
        financeiro: getLancamentosFinanceiros(),
      });
    }

    carregar();
    const pacienteDaUrl = new URLSearchParams(window.location.search).get("pacienteId");
    if (pacienteDaUrl) {
      setPacienteId(pacienteDaUrl);
    }

    window.addEventListener("cliniplus:store", carregar);
    return () => window.removeEventListener("cliniplus:store", carregar);
  }, []);

  const pacientePorId = useMemo(
    () => new Map(dados.pacientes.map((paciente) => [String(paciente.id), paciente])),
    [dados.pacientes]
  );

  const pacienteSelecionado = pacientePorId.get(pacienteId);
  const proximoAgendamento = useMemo(() => {
    const hoje = hojeIso();
    return dados.agendamentos
      .filter((item) => String(item.pacienteId) === pacienteId && (item.data || "") >= hoje)
      .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))[0];
  }, [dados.agendamentos, pacienteId]);

  const textoFinal = preencher(mensagem, {
    nome: pacienteSelecionado?.nome,
    data: formatarData(proximoAgendamento?.data),
    hora: proximoAgendamento?.hora || proximoAgendamento?.horario,
  });

  function escolherModelo(id: string) {
    setModeloId(id);
    setMensagem(modelos.find((modelo) => modelo.id === id)?.texto || "");
  }

  function enviar(paciente: CliniplusPaciente | undefined, modelo: string, extras: { data?: string; hora?: string } = {}) {
    const texto = modelos.find((item) => item.id === modelo)?.texto || "";
    abrirWhatsApp(paciente?.telefone, preencher(texto, { nome: paciente?.nome, ...extras }));
  }

  const listas = useMemo(() => {
    const amanha = isoDeAmanha();
    const mesAtual = new Date().getMonth() + 1;

    const confirmacoes = dados.agendamentos
      .filter((item) => item.data === amanha && !(item.status || "").toLowerCase().includes("cancel"))
      .map((item) => {
        const paciente = pacientePorId.get(String(item.pacienteId));
        const hora = item.hora || item.horario;
        return {
          chave: `conf-${item.id}`,
          nome: paciente?.nome || item.paciente || "Paciente",
          detalhe: `Amanhã às ${hora || "-"}`,
          acao: () => enviar(paciente, "confirmacao", { data: formatarData(item.data), hora }),
        };
      });

    const retornos = dados.pacientes
      .filter((paciente) => (paciente.status || "").toLowerCase().includes("retorno"))
      .map((paciente) => ({
        chave: `ret-${paciente.id}`,
        nome: paciente.nome,
        detalhe: "Retorno pendente",
        acao: () => enviar(paciente, "retorno"),
      }));

    const orcamentos = dados.orcamentos
      .filter((item) => item.status === "enviado")
      .map((item) => {
        const paciente = pacientePorId.get(String(item.pacienteId));
        return {
          chave: `orc-${item.id}`,
          nome: paciente?.nome || "Paciente",
          detalhe: `Orçamento ${item.numero} aguardando aprovação`,
          acao: () => enviar(paciente, "orcamento"),
        };
      });

    const cobrancas = dados.financeiro
      .filter((item) => item.tipo === "Receita" && (item.status || "").toLowerCase() === "pendente" && item.pacienteId)
      .map((item) => {
        const paciente = pacientePorId.get(String(item.pacienteId));
        return {
          chave: `fin-${item.id}`,
          nome: paciente?.nome || item.paciente || "Paciente",
          detalhe: `${item.descricao} - ${item.valor}`,
          acao: () => enviar(paciente, "cobranca"),
        };
      });

    const aniversariantes = dados.pacientes
      .filter((paciente) => mesDeNascimento(paciente) === mesAtual)
      .map((paciente) => ({
        chave: `aniv-${paciente.id}`,
        nome: paciente.nome,
        detalhe: "Aniversariante do mês",
        acao: () => enviar(paciente, "aniversario"),
      }));

    return { confirmacoes, retornos, orcamentos, cobrancas, aniversariantes };
  }, [dados, pacientePorId]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Comunicação" />

        <section className="flex-1 p-8">
          <h2 className="text-3xl font-bold">Comunicação</h2>
          <p className="mt-1 text-slate-500">
            Mensagens prontas para enviar pelo WhatsApp Web, usando os dados dos seus pacientes.
          </p>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
              <h3 className="text-xl font-bold">Nova mensagem</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Paciente</span>
                  <select
                    value={pacienteId}
                    onChange={(event) => setPacienteId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  >
                    <option value="">Selecione um paciente</option>
                    {dados.pacientes.map((paciente) => (
                      <option key={String(paciente.id)} value={String(paciente.id)}>
                        {paciente.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Modelo</span>
                  <select
                    value={modeloId}
                    onChange={(event) => escolherModelo(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  >
                    {modelos.map((modelo) => (
                      <option key={modelo.id} value={modelo.id}>
                        {modelo.titulo}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Mensagem</span>
                <textarea
                  rows={4}
                  value={mensagem}
                  onChange={(event) => setMensagem(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Use {"{nome}"}, {"{data}"} e {"{hora}"} para preencher com os dados do paciente e do próximo agendamento.
                </span>
              </label>

              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Prévia</p>
                <p className="mt-2 whitespace-pre-wrap">{textoFinal}</p>
              </div>

              {pacienteSelecionado && !pacienteSelecionado.telefone && (
                <p className="mt-3 text-sm font-semibold text-amber-700">
                  Este paciente não tem telefone cadastrado. O WhatsApp vai abrir para você escolher o contato.
                </p>
              )}

              <button
                type="button"
                disabled={!pacienteSelecionado}
                onClick={() => abrirWhatsApp(pacienteSelecionado?.telefone, textoFinal)}
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MessageCircle size={18} />
                Abrir no WhatsApp
              </button>
            </div>

            <Lista
              titulo="Confirmar consultas de amanhã"
              icone={CalendarCheck}
              vazio="Nenhum agendamento para amanhã."
              itens={listas.confirmacoes}
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Lista titulo="Retornos pendentes" icone={RotateCcw} vazio="Nenhum retorno pendente." itens={listas.retornos} />
            <Lista titulo="Orçamentos sem resposta" icone={Receipt} vazio="Nenhum orçamento aguardando." itens={listas.orcamentos} />
            <Lista titulo="Pagamentos pendentes" icone={Wallet} vazio="Nenhuma cobrança pendente." itens={listas.cobrancas} />
            <Lista titulo="Aniversariantes do mês" icone={Cake} vazio="Nenhum aniversariante este mês." itens={listas.aniversariantes} />
          </div>
        </section>
      </div>
    </main>
  );
}
