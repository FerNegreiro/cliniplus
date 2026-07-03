"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Heart,
  IdCard,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  addDocumento,
  addPaciente,
  getPacientes,
  type CliniplusPaciente,
} from "@/utils/cliniplusStore";

type AcaoSalvar = "lista" | "prontuario" | "agenda" | "rascunho";

type FormState = {
  nome: string;
  nomeSocial: string;
  cpf: string;
  dataNascimento: string;
  genero: string;
  estadoCivil: string;
  profissao: string;
  tags: string[];
  origem: string;
  celular: string;
  telefoneFixo: string;
  email: string;
  whatsapp: boolean;
  contatoPreferencial: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  alergias: string;
  condicoesCronicas: string;
  medicamentosUso: string;
  tipoSanguineo: string;
  altoRisco: boolean;
  observacoesImportantes: string;
  convenio: string;
  planoConvenio: string;
  numeroCarteirinha: string;
  validadeCarteirinha: string;
  responsavel: string;
  parentesco: string;
  telefoneEmergencia: string;
  contatoAlternativo: string;
  consentimentoLGPD: boolean;
  consentimentoInformado: boolean;
  autorizaLembretes: boolean;
  autorizaTeleconsulta: boolean;
  portalPaciente: boolean;
  documentosChecklist: string[];
  observacoesInternas: string;
};

const estadoInicial: FormState = {
  nome: "",
  nomeSocial: "",
  cpf: "",
  dataNascimento: "",
  genero: "",
  estadoCivil: "",
  profissao: "",
  tags: [],
  origem: "",
  celular: "",
  telefoneFixo: "",
  email: "",
  whatsapp: true,
  contatoPreferencial: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  alergias: "",
  condicoesCronicas: "",
  medicamentosUso: "",
  tipoSanguineo: "",
  altoRisco: false,
  observacoesImportantes: "",
  convenio: "",
  planoConvenio: "",
  numeroCarteirinha: "",
  validadeCarteirinha: "",
  responsavel: "",
  parentesco: "",
  telefoneEmergencia: "",
  contatoAlternativo: "",
  consentimentoLGPD: false,
  consentimentoInformado: false,
  autorizaLembretes: true,
  autorizaTeleconsulta: true,
  portalPaciente: true,
  documentosChecklist: [],
  observacoesInternas: "",
};

const etapas = [
  ["identificacao", "Identificacao"],
  ["contato", "Contato"],
  ["saude", "Saude"],
  ["convenio", "Convenio"],
  ["responsavel", "Responsavel"],
  ["documentos", "Documentos"],
] as const;

const tagsDisponiveis = [
  "VIP",
  "Alergia",
  "Alto risco",
  "Gestante",
  "Teleconsulta",
  "Retorno pendente",
  "Particular",
  "Convenio",
];

const documentos = [
  "Documento pessoal",
  "Carteirinha do convenio",
  "Termo assinado",
  "Selfie / foto do paciente",
  "Formulario de anamnese",
];

function hojeIso() {
  return new Date().toISOString();
}

function normalizar(valor: string) {
  return valor.replace(/\D/g, "");
}

function iniciais(nome: string) {
  return nome
    .split(" ")
    .map((parte) => parte[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function NovoPacienteForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(estadoInicial);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [etapaAtiva, setEtapaAtiva] = useState("identificacao");

  const cpfDuplicado = useMemo(() => {
    if (!form.cpf.trim()) return false;
    const cpfAtual = normalizar(form.cpf);
    return getPacientes().some((paciente) => normalizar(paciente.cpf || "") === cpfAtual);
  }, [form.cpf]);

  const checklist = useMemo(
    () => [
      {
        label: "Dados basicos",
        completo: Boolean(form.nome.trim() && form.dataNascimento),
        detalhe: "1 / 1",
      },
      {
        label: "Contato",
        completo: Boolean(form.celular.trim() && form.email.trim()),
        detalhe: "1 / 1",
      },
      {
        label: "Convenio e financeiro",
        completo: Boolean(form.convenio.trim()),
        detalhe: "1 / 1",
      },
      {
        label: "Consentimentos",
        completo: Boolean(form.consentimentoLGPD && form.consentimentoInformado),
        detalhe: `${Number(form.consentimentoLGPD) + Number(form.consentimentoInformado)} / 2`,
      },
      {
        label: "Documentos",
        completo: form.documentosChecklist.length > 0,
        detalhe: `${form.documentosChecklist.length} / ${documentos.length}`,
      },
    ],
    [form]
  );
  const progresso = Math.round(
    (checklist.filter((item) => item.completo).length / checklist.length) * 100
  );

  const sugestoes = [
    !form.cpf && "Informe o CPF para evitar duplicidade.",
    !form.alergias && "Informar alergias ajuda na seguranca do paciente.",
    !form.consentimentoInformado && "Solicite consentimento antes do primeiro atendimento.",
    !form.email && "E-mail ajuda no envio de documentos e lembretes.",
    cpfDuplicado && "Possivel cadastro semelhante encontrado.",
  ].filter(Boolean) as string[];

  function atualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function alternarTag(tag: string) {
    setForm((atual) => ({
      ...atual,
      tags: atual.tags.includes(tag)
        ? atual.tags.filter((item) => item !== tag)
        : [...atual.tags, tag],
      altoRisco: tag === "Alto risco" ? !atual.tags.includes(tag) : atual.altoRisco,
    }));
  }

  function alternarDocumento(nome: string) {
    setForm((atual) => ({
      ...atual,
      documentosChecklist: atual.documentosChecklist.includes(nome)
        ? atual.documentosChecklist.filter((item) => item !== nome)
        : [...atual.documentosChecklist, nome],
    }));
    setMensagem("Documento marcado como anexado.");
  }

  function rolarPara(id: string) {
    setEtapaAtiva(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validar(acao: AcaoSalvar) {
    if (acao === "rascunho") {
      return true;
    }

    if (!form.nome.trim()) return "Informe o nome completo.";
    if (!form.dataNascimento) return "Informe a data de nascimento.";
    if (!form.celular.trim()) return "Informe o celular.";
    if (!form.email.trim()) return "Informe o e-mail.";
    return true;
  }

  function salvar(acao: AcaoSalvar) {
    setErro("");
    const validacao = validar(acao);
    if (validacao !== true) {
      setErro(validacao);
      return;
    }

    const paciente = addPaciente({
      id: Date.now(),
      nome: form.nome.trim() || "Paciente sem nome",
      nomeSocial: form.nomeSocial,
      cpf: form.cpf,
      dataNascimento: form.dataNascimento,
      nascimento: form.dataNascimento,
      genero: form.genero,
      sexo: form.genero,
      estadoCivil: form.estadoCivil,
      profissao: form.profissao,
      tags: form.tags,
      origem: form.origem,
      telefone: form.celular || "Nao informado",
      telefoneFixo: form.telefoneFixo,
      email: form.email || "Nao informado",
      whatsapp: form.whatsapp,
      contatoPreferencial: form.contatoPreferencial,
      cep: form.cep,
      endereco: form.endereco,
      numero: form.numero,
      complemento: form.complemento,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      alergias: form.alergias,
      condicoesCronicas: form.condicoesCronicas,
      medicamentosUso: form.medicamentosUso,
      tipoSanguineo: form.tipoSanguineo,
      altoRisco: form.altoRisco,
      observacoesImportantes: form.observacoesImportantes,
      convenio: form.convenio || "Particular",
      planoConvenio: form.planoConvenio,
      numeroCarteirinha: form.numeroCarteirinha,
      validadeCarteirinha: form.validadeCarteirinha,
      responsavel: form.responsavel,
      parentesco: form.parentesco,
      telefoneEmergencia: form.telefoneEmergencia,
      contatoAlternativo: form.contatoAlternativo,
      consentimentoLGPD: form.consentimentoLGPD,
      consentimentoInformado: form.consentimentoInformado,
      autorizaLembretes: form.autorizaLembretes,
      autorizaTeleconsulta: form.autorizaTeleconsulta,
      portalPaciente: form.portalPaciente,
      documentosChecklist: form.documentosChecklist,
      observacoesInternas: form.observacoesInternas,
      observacoes: form.observacoesImportantes,
      area: form.profissao || "Cadastro inicial",
      tipoAtendimento: "odontologia",
      status: acao === "rascunho" ? "rascunho" : "Ativo",
      ultimo: new Date().toLocaleDateString("pt-BR"),
      criadoEm: hojeIso(),
    }) as CliniplusPaciente;

    form.documentosChecklist.forEach((documento) => {
      addDocumento({
        pacienteId: paciente.id,
        paciente: paciente.nome,
        nome: documento,
        tipo: "Cadastro",
        data: new Date().toLocaleDateString("pt-BR"),
        origem: "Novo paciente",
        status: "Anexado",
      });
    });

    if (acao === "prontuario") {
      router.push(`/pacientes/${paciente.id}?aba=prontuario`);
      return;
    }

    if (acao === "agenda") {
      router.push(`/agenda/novo?pacienteId=${paciente.id}&paciente=${encodeURIComponent(paciente.nome)}`);
      return;
    }

    router.push("/pacientes");
  }

  return (
    <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200 px-4 py-3">
          {etapas.map(([id, label], index) => (
            <button
              key={id}
              type="button"
              onClick={() => rolarPara(id)}
              className={`flex min-w-40 items-center gap-2 border-b-2 px-3 py-2 text-sm font-black ${
                etapaAtiva === id
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500"
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                etapaAtiva === id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {index + 1}
              </span>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-6 p-5">
          <Section id="identificacao" title="1. Dados principais" icon={IdCard}>
            <div className="grid gap-4 lg:grid-cols-4">
              <Input label="Nome completo *" value={form.nome} onChange={(v) => atualizar("nome", v)} placeholder="Ex.: Maria da Silva Santos" />
              <Input label="Nome social" value={form.nomeSocial} onChange={(v) => atualizar("nomeSocial", v)} placeholder="Ex.: Mari Silva" />
              <div>
                <Input label="CPF" value={form.cpf} onChange={(v) => atualizar("cpf", v)} placeholder="000.000.000-00" />
                {cpfDuplicado && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-700">
                    <AlertTriangle size={13} />
                    Possivel cadastro semelhante encontrado.
                  </p>
                )}
              </div>
              <Input label="Data de nascimento *" type="date" value={form.dataNascimento} onChange={(v) => atualizar("dataNascimento", v)} />
              <Select label="Sexo / genero *" value={form.genero} onChange={(v) => atualizar("genero", v)} options={["", "Feminino", "Masculino", "Outro", "Prefiro nao informar"]} />
              <Select label="Estado civil" value={form.estadoCivil} onChange={(v) => atualizar("estadoCivil", v)} options={["", "Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viuvo(a)"]} />
              <Input label="Profissao" value={form.profissao} onChange={(v) => atualizar("profissao", v)} placeholder="Ex.: Designer" />
              <Select label="Origem / Indicacao" value={form.origem} onChange={(v) => atualizar("origem", v)} options={["", "Google", "Instagram", "Indicação", "Convenio", "Retorno"]} />
              <div className="lg:col-span-4">
                <p className="mb-2 text-xs font-black text-slate-500">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tagsDisponiveis.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => alternarTag(tag)}
                      className={`rounded-lg border px-3 py-2 text-xs font-black ${
                        form.tags.includes(tag)
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section id="contato" title="2. Contato" icon={Phone}>
            <div className="grid gap-4 lg:grid-cols-5">
              <Input label="Celular *" value={form.celular} onChange={(v) => atualizar("celular", v)} placeholder="(11) 90000-0000" />
              <Input label="Telefone fixo" value={form.telefoneFixo} onChange={(v) => atualizar("telefoneFixo", v)} placeholder="(11) 3000-0000" />
              <Input label="E-mail *" type="email" value={form.email} onChange={(v) => atualizar("email", v)} placeholder="nome@email.com" />
              <Switch label="WhatsApp" checked={form.whatsapp} onChange={(v) => atualizar("whatsapp", v)} />
              <Select label="Contato preferencial *" value={form.contatoPreferencial} onChange={(v) => atualizar("contatoPreferencial", v)} options={["", "WhatsApp", "Telefone", "E-mail", "SMS"]} />
              <div>
                <label className="mb-2 block text-xs font-black text-slate-500">CEP</label>
                <div className="flex h-11 rounded-lg border border-slate-200 bg-white">
                  <input value={form.cep} onChange={(e) => atualizar("cep", e.target.value)} placeholder="00000-000" className="min-w-0 flex-1 rounded-l-lg px-3 text-sm font-semibold outline-none" />
                  <button type="button" onClick={() => setMensagem("Busca de CEP sera integrada em breve.")} className="flex w-11 items-center justify-center text-indigo-700">
                    <Search size={17} />
                  </button>
                </div>
              </div>
              <Input label="Endereco" value={form.endereco} onChange={(v) => atualizar("endereco", v)} placeholder="Digite o endereco" />
              <Input label="Numero" value={form.numero} onChange={(v) => atualizar("numero", v)} placeholder="123" />
              <Input label="Complemento" value={form.complemento} onChange={(v) => atualizar("complemento", v)} placeholder="Apto, sala, etc." />
              <Input label="Bairro" value={form.bairro} onChange={(v) => atualizar("bairro", v)} placeholder="Digite o bairro" />
              <Input label="Cidade" value={form.cidade} onChange={(v) => atualizar("cidade", v)} placeholder="Cidade" />
              <Select label="UF" value={form.uf} onChange={(v) => atualizar("uf", v)} options={["", "AC", "AL", "AM", "BA", "CE", "DF", "ES", "GO", "MG", "PE", "PR", "RJ", "RS", "SC", "SP"]} />
            </div>
          </Section>

          <Section id="saude" title="3. Informacoes clinicas iniciais" icon={Heart}>
            <div className="grid gap-4 lg:grid-cols-3">
              <Textarea label="Alergias" value={form.alergias} onChange={(v) => atualizar("alergias", v)} placeholder="Descreva alergias conhecidas" />
              <Textarea label="Condicoes cronicas" value={form.condicoesCronicas} onChange={(v) => atualizar("condicoesCronicas", v)} placeholder="Informe condicoes cronicas" />
              <Textarea label="Medicamentos em uso" value={form.medicamentosUso} onChange={(v) => atualizar("medicamentosUso", v)} placeholder="Liste medicamentos em uso" />
              <Select label="Tipo sanguineo" value={form.tipoSanguineo} onChange={(v) => atualizar("tipoSanguineo", v)} options={["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
              <Switch label="Paciente de alto risco" checked={form.altoRisco} onChange={(v) => atualizar("altoRisco", v)} />
              <Textarea label="Observacoes importantes" value={form.observacoesImportantes} onChange={(v) => atualizar("observacoesImportantes", v)} placeholder="Informacoes relevantes para o cuidado" />
            </div>
          </Section>

          <div className="grid gap-6 xl:grid-cols-2">
            <Section id="convenio" title="4. Convenio e financeiro" icon={ShieldCheck}>
              <div className="grid gap-4 md:grid-cols-4">
                <Select label="Convenio" value={form.convenio} onChange={(v) => atualizar("convenio", v)} options={["", "Particular", "Amil", "Unimed", "Bradesco Saude", "SulAmerica", "Hapvida", "Outro"]} />
                <Input label="Plano" value={form.planoConvenio} onChange={(v) => atualizar("planoConvenio", v)} placeholder="Selecione o plano" />
                <Input label="No da carteirinha" value={form.numeroCarteirinha} onChange={(v) => atualizar("numeroCarteirinha", v)} placeholder="000000000000" />
                <Input label="Validade" type="month" value={form.validadeCarteirinha} onChange={(v) => atualizar("validadeCarteirinha", v)} />
              </div>
            </Section>

            <Section id="responsavel" title="5. Responsavel / emergencia" icon={Users}>
              <div className="grid gap-4 md:grid-cols-4">
                <Input label="Responsavel" value={form.responsavel} onChange={(v) => atualizar("responsavel", v)} placeholder="Nome do responsavel" />
                <Select label="Parentesco" value={form.parentesco} onChange={(v) => atualizar("parentesco", v)} options={["", "Mae", "Pai", "Conjuge", "Filho(a)", "Outro"]} />
                <Input label="Telefone de emergencia" value={form.telefoneEmergencia} onChange={(v) => atualizar("telefoneEmergencia", v)} placeholder="(11) 90000-0000" />
                <Input label="Contato alternativo" value={form.contatoAlternativo} onChange={(v) => atualizar("contatoAlternativo", v)} placeholder="(11) 90000-0000" />
              </div>
            </Section>
          </div>

          <Section id="documentos" title="6. Consentimentos e comunicacao" icon={ShieldCheck}>
            <div className="grid gap-3 md:grid-cols-5">
              <Consent label="Li e aceito a Politica de Privacidade (LGPD)" checked={form.consentimentoLGPD} onChange={(v) => atualizar("consentimentoLGPD", v)} />
              <Consent label="Consentimento informado" checked={form.consentimentoInformado} onChange={(v) => atualizar("consentimentoInformado", v)} />
              <Consent label="Autoriza lembretes WhatsApp / SMS / E-mail" checked={form.autorizaLembretes} onChange={(v) => atualizar("autorizaLembretes", v)} />
              <Consent label="Autoriza teleconsulta" checked={form.autorizaTeleconsulta} onChange={(v) => atualizar("autorizaTeleconsulta", v)} />
              <Consent label="Convidar para o Portal do Paciente" checked={form.portalPaciente} onChange={(v) => atualizar("portalPaciente", v)} />
            </div>
          </Section>

          <Section id="documentos-cards" title="7. Documentos" icon={FileText}>
            <div className="grid gap-3 md:grid-cols-5">
              {documentos.map((documento) => {
                const anexado = form.documentosChecklist.includes(documento);
                return (
                  <button
                    key={documento}
                    type="button"
                    onClick={() => alternarDocumento(documento)}
                    className={`rounded-lg border border-dashed p-4 text-left transition ${
                      anexado
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-indigo-300"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                      {anexado ? <Check size={17} /> : <Upload size={17} />}
                    </span>
                    <strong className="mt-3 block text-sm">{documento}</strong>
                    <span className="mt-1 block text-xs font-semibold text-indigo-700">
                      {anexado ? "Anexado" : "Enviar arquivo"}
                    </span>
                    <span className="text-xs text-slate-500">PDF, JPG ou PNG</span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Textarea
            label="Observacoes internas, visivel apenas para a equipe"
            value={form.observacoesInternas}
            onChange={(v) => atualizar("observacoesInternas", v)}
            placeholder="Adicione notas internas sobre o paciente, particularidades ou informacoes relevantes."
            large
          />

          {erro && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {erro}
            </div>
          )}
          {mensagem && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700">
              {mensagem}
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 z-10 grid gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:grid-cols-[1fr_1fr_1.2fr]">
          <Link href="/pacientes" className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-extrabold text-slate-700">
            Cancelar
          </Link>
          <button type="button" onClick={() => salvar("rascunho")} className="h-12 rounded-lg border border-indigo-200 bg-white text-sm font-extrabold text-indigo-700">
            Salvar rascunho
          </button>
          <button type="button" onClick={() => salvar("lista")} className="h-12 rounded-lg bg-indigo-600 text-sm font-extrabold text-white shadow-sm">
            Salvar paciente
          </button>
        </footer>
      </div>

      <aside className="space-y-4">
        <SideCard title="Resumo do cadastro">
          <div className="flex gap-3">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-indigo-700">
              {form.nome ? iniciais(form.nome) : <UserRound size={26} />}
            </span>
            <div className="min-w-0">
              <p className="font-black">{form.nome || "Nome do paciente"}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">Status: Novo</p>
            </div>
          </div>
          <ResumoLinha label="Data de nascimento" value={form.dataNascimento} />
          <ResumoLinha label="CPF" value={form.cpf} />
          <ResumoLinha label="Convenio" value={form.convenio} />
          <ResumoLinha label="Plano" value={form.planoConvenio} />
          <ResumoLinha label="Contato" value={form.celular || form.email} />
          <ResumoLinha label="Endereco" value={[form.endereco, form.numero, form.cidade].filter(Boolean).join(", ")} />
          <button type="button" onClick={() => rolarPara("identificacao")} className="text-sm font-black text-indigo-700">
            Ver mais detalhes
          </button>
        </SideCard>

        <SideCard title="Checklist do onboarding">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">Progresso</span>
            <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-black text-indigo-700">
              {progresso}%
            </span>
          </div>
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-semibold text-slate-600">
                <span className={`flex h-4 w-4 items-center justify-center rounded border ${
                  item.completo ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                }`}>
                  {item.completo && <Check size={11} />}
                </span>
                {item.label}
              </span>
              <span className="text-xs font-bold text-slate-500">{item.detalhe}</span>
            </div>
          ))}
        </SideCard>

        <SideCard title="Sugestoes da IA">
          {sugestoes.map((sugestao) => (
            <div key={sugestao} className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-indigo-600" />
              {sugestao}
            </div>
          ))}
        </SideCard>

        <SideCard title="Proximos passos">
          <button type="button" onClick={() => salvar("rascunho")} className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left text-sm font-black text-slate-800">
            Salvar rascunho <ChevronRight size={16} />
          </button>
          <button type="button" onClick={() => salvar("prontuario")} className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left text-sm font-black text-slate-800">
            Salvar e abrir prontuario <ChevronRight size={16} />
          </button>
          <button type="button" onClick={() => salvar("agenda")} className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left text-sm font-black text-slate-800">
            Salvar e agendar consulta <ChevronRight size={16} />
          </button>
        </SideCard>
      </aside>
    </div>
  );
}

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-b border-slate-200 pb-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-black text-slate-950">
        <Icon size={18} className="text-indigo-600" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-indigo-300"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-indigo-300"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Selecione"}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  large,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  large?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={large ? 1000 : 400}
        className={`${large ? "h-24" : "h-20"} w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-indigo-300`}
      />
      {large && (
        <span className="mt-1 block text-right text-xs font-bold text-slate-400">
          {value.length} / 1000
        </span>
      )}
    </label>
  );
}

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
          checked ? "justify-end bg-indigo-600" : "justify-start bg-slate-200"
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
      </button>
    </label>
  );
}

function Consent({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs font-bold text-slate-700"
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
        checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
      }`}>
        {checked && <Check size={13} />}
      </span>
      {label}
    </button>
  );
}

function SideCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-base font-black text-slate-950">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ResumoLinha({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-bold text-slate-500">{label}</span>
      <strong className="min-w-0 truncate text-right text-slate-800">
        {value || "-"}
      </strong>
    </div>
  );
}
