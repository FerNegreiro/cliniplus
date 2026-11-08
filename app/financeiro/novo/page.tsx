"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import Sidebar from "@/components/Sidebar";
import {
  addLancamentoFinanceiro,
  getPacientes,
  type CliniplusPaciente,
} from "@/utils/cliniplusStore";
import { hojeIso } from "@/utils/datas";

const statusReceita = ["Pago", "Pendente", "Aguardando convênio", "Recebido do convênio", "Glosado"];
const statusDespesa = ["Pago", "Pendente"];
const origensReceita = ["Particular", "Plano de saúde"];
const origensDespesa = ["Despesa fixa", "Despesa variável", "Laboratório", "Materiais"];
const formasPagamento = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Boleto", "Convênio"];

const campoClasse =
  "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400";

function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function NovoLancamentoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoInicial = searchParams.get("tipo") === "despesa" ? "Despesa" : "Receita";
  const [pacientes, setPacientes] = useState<CliniplusPaciente[]>([]);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    tipo: tipoInicial,
    pacienteId: tipoInicial === "Receita" ? searchParams.get("pacienteId") || "" : "",
    descricao: searchParams.get("descricao") || "",
    valor: (searchParams.get("valor") || "").replace(".", ","),
    origem: tipoInicial === "Receita" ? origensReceita[0] : origensDespesa[0],
    formaPagamento: formasPagamento[0],
    status: "Pago",
    data: hojeIso(),
    convenio: "",
    guia: "",
    autorizacao: "",
    observacoes: "",
  });

  useEffect(() => {
    setPacientes(getPacientes());
  }, []);

  const ehReceita = form.tipo === "Receita";
  const ehConvenio = ehReceita && form.origem === "Plano de saúde";

  function atualizar(campo: keyof typeof form, valor: string) {
    setErro("");
    setForm((atual) => {
      const proximo = { ...atual, [campo]: valor };

      if (campo === "tipo") {
        proximo.origem = valor === "Receita" ? origensReceita[0] : origensDespesa[0];
        proximo.status = "Pago";
        proximo.pacienteId = valor === "Receita" ? atual.pacienteId : "";
      }

      return proximo;
    });
  }

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valorNumerico = Number(form.valor.replace(/\./g, "").replace(",", "."));

    if (!form.descricao.trim()) {
      setErro("Informe a descrição do lançamento.");
      return;
    }

    if (!valorNumerico || valorNumerico <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }

    if (!form.data) {
      setErro("Informe a data do lançamento.");
      return;
    }

    addLancamentoFinanceiro({
      tipo: form.tipo,
      pacienteId: form.pacienteId || undefined,
      descricao: form.descricao.trim(),
      valor: formatarValor(valorNumerico),
      origem: form.origem,
      formaPagamento: form.formaPagamento,
      status: form.status,
      data: form.data,
      convenio: ehConvenio ? form.convenio.trim() : undefined,
      guia: ehConvenio ? form.guia.trim() : undefined,
      autorizacao: ehConvenio ? form.autorizacao.trim() : undefined,
      observacoes: form.observacoes.trim() || undefined,
    });

    router.push("/financeiro");
  }

  return (
    <form
      onSubmit={salvar}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Tipo de lançamento</span>
          <select className={campoClasse} value={form.tipo} onChange={(event) => atualizar("tipo", event.target.value)}>
            <option>Receita</option>
            <option>Despesa</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Paciente</span>
          <select
            className={campoClasse}
            value={form.pacienteId}
            disabled={!ehReceita}
            onChange={(event) => atualizar("pacienteId", event.target.value)}
          >
            <option value="">{ehReceita ? "Sem paciente vinculado" : "Não se aplica a despesas"}</option>
            {pacientes.map((paciente) => (
              <option key={String(paciente.id)} value={String(paciente.id)}>
                {paciente.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Descrição</span>
          <input
            type="text"
            value={form.descricao}
            onChange={(event) => atualizar("descricao", event.target.value)}
            placeholder={ehReceita ? "Ex.: restauração, canal, profilaxia..." : "Ex.: aluguel, laboratório, materiais..."}
            className={campoClasse}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Valor (R$)</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.valor}
            onChange={(event) => atualizar("valor", event.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="Ex.: 280,00"
            className={campoClasse}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Origem</span>
          <select className={campoClasse} value={form.origem} onChange={(event) => atualizar("origem", event.target.value)}>
            {(ehReceita ? origensReceita : origensDespesa).map((origem) => (
              <option key={origem}>{origem}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Forma de pagamento</span>
          <select
            className={campoClasse}
            value={form.formaPagamento}
            onChange={(event) => atualizar("formaPagamento", event.target.value)}
          >
            {formasPagamento.map((forma) => (
              <option key={forma}>{forma}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Status</span>
          <select className={campoClasse} value={form.status} onChange={(event) => atualizar("status", event.target.value)}>
            {(ehReceita ? statusReceita : statusDespesa).map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Data do lançamento</span>
          <input
            type="date"
            value={form.data}
            onChange={(event) => atualizar("data", event.target.value)}
            className={campoClasse}
          />
        </label>

        {ehConvenio && (
          <>
            <label className="block">
              <span className="text-sm font-semibold">Convênio</span>
              <input
                type="text"
                value={form.convenio}
                onChange={(event) => atualizar("convenio", event.target.value)}
                placeholder="Ex.: Amil Dental, OdontoPrev..."
                className={campoClasse}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Número da guia</span>
              <input
                type="text"
                value={form.guia}
                onChange={(event) => atualizar("guia", event.target.value)}
                className={campoClasse}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Autorização</span>
              <input
                type="text"
                value={form.autorizacao}
                onChange={(event) => atualizar("autorizacao", event.target.value)}
                className={campoClasse}
              />
            </label>
          </>
        )}

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold">Observações</span>
          <textarea
            rows={3}
            value={form.observacoes}
            onChange={(event) => atualizar("observacoes", event.target.value)}
            className={campoClasse}
          />
        </label>
      </div>

      {erro && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{erro}</p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/financeiro"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white hover:bg-cyan-700"
        >
          Salvar lançamento
        </button>
      </div>
    </form>
  );
}

export default function NovoLancamentoFinanceiro() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active="Financeiro" />

        <section className="flex-1 p-6">
          <Link href="/financeiro" className="text-sm font-semibold text-slate-500 hover:text-cyan-700">
            ← Voltar para financeiro
          </Link>
          <h2 className="mt-4 text-3xl font-bold">Novo lançamento</h2>
          <p className="mt-1 text-slate-500">
            Registre recebimentos de pacientes, convênios e despesas da clínica.
          </p>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <Suspense fallback={<div className="rounded-3xl bg-white p-6 xl:col-span-2">Carregando...</div>}>
              <NovoLancamentoForm />
            </Suspense>

            <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold">Dicas</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Vincule a receita ao paciente para ela entrar nas cobranças pendentes da Comunicação e nos alertas do Início.</li>
                <li>Em convênios, use o status &quot;Aguardando convênio&quot; até o repasse cair.</li>
                <li>Despesas de laboratório e materiais ajudam a calcular a margem real dos tratamentos.</li>
              </ul>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
