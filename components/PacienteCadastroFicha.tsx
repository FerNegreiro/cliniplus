"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import PatientDeleteButton from "@/components/PatientDeleteButton";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  IdCard,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import {
  getAgendamentosByPacienteId,
  addDocumento,
  deleteDocumento,
  getDocumentosByPacienteId,
  getTratamentosByPacienteId,
  updatePaciente,
  type CliniplusPaciente,
} from "@/utils/cliniplusStore";
import {
  TIPOS_ACEITOS,
  abrirArquivo,
  baixarArquivo,
  extensaoDoArquivo,
  formatarTamanho,
  salvarArquivo,
  validarArquivo,
} from "@/utils/arquivos";

type PacienteCadastroFichaProps = {
  paciente: CliniplusPaciente;
};

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

const documentosPadrao = [
  "Documento pessoal",
  "Carteirinha do convenio",
  "Termo assinado",
  "Selfie / foto do paciente",
  "Formulario de anamnese",
];

function getInitials(nome: string) {
  return nome
    .split(" ")
    .map((parte) => parte[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAge(value?: string) {
  if (!value) {
    return "";
  }

  const parts = value.includes("/")
    ? value.split("/").reverse()
    : value.slice(0, 10).split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hadBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  if (!hadBirthday) {
    age -= 1;
  }

  return age > 0 ? `${age} anos` : "";
}

function pacienteToForm(paciente: CliniplusPaciente): FormState {
  return {
    nome: paciente.nome || "",
    nomeSocial: paciente.nomeSocial || "",
    cpf: paciente.cpf || "",
    dataNascimento: paciente.dataNascimento || paciente.nascimento || "",
    genero: paciente.genero || paciente.sexo || "",
    estadoCivil: paciente.estadoCivil || "",
    profissao: paciente.profissao || "",
    tags: paciente.tags || [],
    origem: paciente.origem || "",
    celular: paciente.telefone || "",
    telefoneFixo: paciente.telefoneFixo || "",
    email: paciente.email || "",
    whatsapp: paciente.whatsapp ?? true,
    contatoPreferencial: paciente.contatoPreferencial || "",
    cep: paciente.cep || "",
    endereco: paciente.endereco || "",
    numero: paciente.numero || "",
    complemento: paciente.complemento || "",
    bairro: paciente.bairro || "",
    cidade: paciente.cidade || "",
    uf: paciente.uf || "",
    alergias: paciente.alergias || "",
    condicoesCronicas: paciente.condicoesCronicas || "",
    medicamentosUso: paciente.medicamentosUso || "",
    tipoSanguineo: paciente.tipoSanguineo || "",
    altoRisco: Boolean(paciente.altoRisco),
    observacoesImportantes:
      paciente.observacoesImportantes || paciente.observacoes || "",
    convenio: paciente.convenio || "",
    planoConvenio: paciente.planoConvenio || "",
    numeroCarteirinha: paciente.numeroCarteirinha || "",
    validadeCarteirinha: paciente.validadeCarteirinha || "",
    responsavel: paciente.responsavel || "",
    parentesco: paciente.parentesco || "",
    telefoneEmergencia: paciente.telefoneEmergencia || "",
    contatoAlternativo: paciente.contatoAlternativo || "",
    consentimentoLGPD: Boolean(paciente.consentimentoLGPD),
    consentimentoInformado: Boolean(paciente.consentimentoInformado),
    autorizaLembretes: paciente.autorizaLembretes ?? true,
    autorizaTeleconsulta: paciente.autorizaTeleconsulta ?? true,
    portalPaciente: paciente.portalPaciente ?? true,
    documentosChecklist: paciente.documentosChecklist || [],
    observacoesInternas: paciente.observacoesInternas || "",
  };
}

export default function PacienteCadastroFicha({
  paciente,
}: PacienteCadastroFichaProps) {
  const [form, setForm] = useState<FormState>(() => pacienteToForm(paciente));
  const [etapaAtiva, setEtapaAtiva] = useState("identificacao");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const documentosSalvos = getDocumentosByPacienteId(paciente.id);
  const agendamentos = getAgendamentosByPacienteId(paciente.id);
  const tratamentos = getTratamentosByPacienteId(paciente.id);
  const prontuarioHref = `/pacientes/${paciente.id}?aba=prontuario&secao=resumo`;
  const agendaHref = `/agenda/novo?pacienteId=${paciente.id}`;
  const documentosHref = `/pacientes/${paciente.id}?aba=prontuario&secao=documentos`;

  const checklist = useMemo(
    () => [
      {
        label: "Dados basicos",
        completo: Boolean(form.nome.trim() && form.dataNascimento),
      },
      {
        label: "Contato",
        completo: Boolean(form.celular.trim() || form.email.trim()),
      },
      {
        label: "Convenio e financeiro",
        completo: Boolean(form.convenio.trim()),
      },
      {
        label: "Consentimentos",
        completo: Boolean(form.consentimentoLGPD && form.consentimentoInformado),
      },
      {
        label: "Documentos",
        completo:
          form.documentosChecklist.length > 0 || documentosSalvos.length > 0,
      },
    ],
    [documentosSalvos.length, form]
  );
  const progresso = Math.round(
    (checklist.filter((item) => item.completo).length / checklist.length) * 100
  );
  const sugestoes = [
    form.cpf.replace(/\D/g, "").length < 11 && "CPF pode estar incompleto.",
    !form.celular && !form.email && "Falta um contato principal.",
    !form.convenio && "Informe convenio ou marque como Particular.",
    !form.documentosChecklist.length &&
      !documentosSalvos.length &&
      "Inclua documento pessoal ou formulario de anamnese.",
  ].filter(Boolean) as string[];
  const idade = getAge(form.dataNascimento);
  const enderecoResumo = [
    form.endereco,
    form.numero,
    form.bairro,
    form.cidade,
    form.uf,
  ]
    .filter(Boolean)
    .join(", ");

  function atualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setMensagem("");
  }

  function alternarTag(tag: string) {
    setForm((atual) => ({
      ...atual,
      tags: atual.tags.includes(tag)
        ? atual.tags.filter((item) => item !== tag)
        : [...atual.tags, tag],
      altoRisco:
        tag === "Alto risco" ? !atual.tags.includes(tag) : atual.altoRisco,
    }));
  }

  async function enviarDocumento(documento: string, arquivo: File | undefined) {
    if (!arquivo) return;
    const problema = validarArquivo(arquivo);
    if (problema) {
      setMensagem(`${documento}: ${problema}`);
      return;
    }

    try {
      const salvo = await salvarArquivo(arquivo, paciente.id);
      documentosSalvos
        .filter((item) => item.nome === documento)
        .forEach((item) => deleteDocumento(item.id));
      addDocumento({
        pacienteId: paciente.id,
        paciente: paciente.nome,
        nome: documento,
        categoria: "Cadastro",
        tipo: "Cadastro",
        origem: "Ficha do paciente",
        status: "Anexado",
        arquivoId: salvo.id,
        formato: extensaoDoArquivo(arquivo.name),
        extensao: extensaoDoArquivo(arquivo.name),
        tamanho: formatarTamanho(arquivo.size),
        observacao: arquivo.name,
      });
      setForm((atual) => ({
        ...atual,
        documentosChecklist: atual.documentosChecklist.includes(documento)
          ? atual.documentosChecklist
          : [...atual.documentosChecklist, documento],
      }));
      setMensagem(`${documento} enviado.`);
    } catch {
      setMensagem("Não foi possível guardar o arquivo neste navegador.");
    }
  }

  function rolarPara(id: string) {
    setEtapaAtiva(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function salvar() {
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe o nome completo do paciente.");
      return;
    }

    updatePaciente(paciente.id, {
      nome: form.nome.trim(),
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
      observacoes: form.observacoesImportantes,
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
      area: paciente.area,
    });
    setMensagem("Paciente atualizado com sucesso.");
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link
            href="/pacientes"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-indigo-700"
          >
            <ChevronLeft size={17} />
            Voltar para pacientes
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            Cadastro do paciente
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Visualize e atualize os dados cadastrais, clinicos e documentos do
            paciente.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={prontuarioHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 text-sm font-extrabold text-indigo-700 shadow-sm"
          >
            <FileText size={17} />
            Abrir prontuario
          </Link>
          <PatientDeleteButton pacienteId={paciente.id} nome={paciente.nome} compact />
          <button
            type="button"
            onClick={salvar}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Check size={17} />
            Salvar alteracoes
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-black text-indigo-700">
              {getInitials(form.nome) || <UserRound size={28} />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="truncate text-2xl font-black text-slate-950">
                  {form.nome || "Paciente sem nome"}
                </h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                  {paciente.status || "Ativo"}
                </span>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                  {paciente.tipoAtendimento === "estetica" ? "HOF" : "Odontologia"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Phone size={15} className="text-indigo-600" />
                  {form.celular || "Sem telefone"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Mail size={15} className="text-indigo-600" />
                  {form.email || "Sem e-mail"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={15} className="text-indigo-600" />
                  {form.convenio || "Particular"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={agendaHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-black text-white"
            >
              <CalendarDays size={17} />
              Novo atendimento
            </Link>
            <Link
              href={prontuarioHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 text-sm font-black text-indigo-700"
            >
              <FileText size={17} />
              Abrir prontuario
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
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
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    etapaAtiva === id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {index + 1}
                </span>
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-6 p-5">
            <Section id="identificacao" title="1. Identificacao" icon={IdCard}>
              <div className="grid gap-4 lg:grid-cols-4">
                <Input label="Nome completo" value={form.nome} onChange={(v) => atualizar("nome", v)} />
                <Input label="Nome social" value={form.nomeSocial} onChange={(v) => atualizar("nomeSocial", v)} />
                <Input label="CPF" value={form.cpf} onChange={(v) => atualizar("cpf", v)} />
                <Input label="Data de nascimento" type="date" value={form.dataNascimento} onChange={(v) => atualizar("dataNascimento", v)} />
                <Select label="Sexo / genero" value={form.genero} onChange={(v) => atualizar("genero", v)} options={["", "Feminino", "Masculino", "Outro", "Prefiro nao informar"]} />
                <Select label="Estado civil" value={form.estadoCivil} onChange={(v) => atualizar("estadoCivil", v)} options={["", "Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viuvo(a)"]} />
                <Input label="Profissao" value={form.profissao} onChange={(v) => atualizar("profissao", v)} />
                <Select label="Origem / indicacao" value={form.origem} onChange={(v) => atualizar("origem", v)} options={["", "Google", "Instagram", "Indicacao", "Convenio", "Retorno"]} />
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
                <Input label="Celular" value={form.celular} onChange={(v) => atualizar("celular", v)} />
                <Input label="Telefone fixo" value={form.telefoneFixo} onChange={(v) => atualizar("telefoneFixo", v)} />
                <Input label="E-mail" type="email" value={form.email} onChange={(v) => atualizar("email", v)} />
                <Switch label="WhatsApp" checked={form.whatsapp} onChange={(v) => atualizar("whatsapp", v)} />
                <Select label="Contato preferencial" value={form.contatoPreferencial} onChange={(v) => atualizar("contatoPreferencial", v)} options={["", "WhatsApp", "Telefone", "E-mail", "SMS"]} />
                <Input label="CEP" value={form.cep} onChange={(v) => atualizar("cep", v)} />
                <Input label="Endereco" value={form.endereco} onChange={(v) => atualizar("endereco", v)} />
                <Input label="Numero" value={form.numero} onChange={(v) => atualizar("numero", v)} />
                <Input label="Complemento" value={form.complemento} onChange={(v) => atualizar("complemento", v)} />
                <Input label="Bairro" value={form.bairro} onChange={(v) => atualizar("bairro", v)} />
                <Input label="Cidade" value={form.cidade} onChange={(v) => atualizar("cidade", v)} />
                <Select label="UF" value={form.uf} onChange={(v) => atualizar("uf", v)} options={["", "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"]} />
              </div>
            </Section>

            <Section id="saude" title="3. Saude" icon={Heart}>
              <div className="grid gap-4 lg:grid-cols-3">
                <Textarea label="Alergias" value={form.alergias} onChange={(v) => atualizar("alergias", v)} />
                <Textarea label="Condicoes clinicas" value={form.condicoesCronicas} onChange={(v) => atualizar("condicoesCronicas", v)} />
                <Textarea label="Medicamentos em uso" value={form.medicamentosUso} onChange={(v) => atualizar("medicamentosUso", v)} />
                <Select label="Tipo sanguineo" value={form.tipoSanguineo} onChange={(v) => atualizar("tipoSanguineo", v)} options={["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
                <Switch label="Paciente de alto risco" checked={form.altoRisco} onChange={(v) => atualizar("altoRisco", v)} />
                <Textarea label="Observacoes importantes" value={form.observacoesImportantes} onChange={(v) => atualizar("observacoesImportantes", v)} />
              </div>
            </Section>

            <div className="grid gap-6 xl:grid-cols-2">
              <Section id="convenio" title="4. Convenio" icon={ShieldCheck}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Select label="Convenio" value={form.convenio} onChange={(v) => atualizar("convenio", v)} options={["", "Particular", "Amil Dental", "Bradesco Dental", "OdontoPrev", "SulAmerica Odonto", "Hapvida Odonto", "Uniodonto", "Outro"]} />
                  <Input label="Plano" value={form.planoConvenio} onChange={(v) => atualizar("planoConvenio", v)} />
                  <Input label="Numero da carteirinha" value={form.numeroCarteirinha} onChange={(v) => atualizar("numeroCarteirinha", v)} />
                  <Input label="Validade" type="month" value={form.validadeCarteirinha} onChange={(v) => atualizar("validadeCarteirinha", v)} />
                </div>
              </Section>

              <Section id="responsavel" title="5. Responsavel / emergencia" icon={Users}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Responsavel" value={form.responsavel} onChange={(v) => atualizar("responsavel", v)} />
                  <Select label="Parentesco" value={form.parentesco} onChange={(v) => atualizar("parentesco", v)} options={["", "Mae", "Pai", "Conjuge", "Filho(a)", "Outro"]} />
                  <Input label="Telefone emergencia" value={form.telefoneEmergencia} onChange={(v) => atualizar("telefoneEmergencia", v)} />
                  <Input label="Contato alternativo" value={form.contatoAlternativo} onChange={(v) => atualizar("contatoAlternativo", v)} />
                </div>
              </Section>
            </div>

            <Section id="documentos" title="6. Consentimentos e documentos" icon={FileText}>
              <div className="grid gap-3 md:grid-cols-5">
                <Consent label="Aceitou politica LGPD" checked={form.consentimentoLGPD} onChange={(v) => atualizar("consentimentoLGPD", v)} />
                <Consent label="Consentimento informado" checked={form.consentimentoInformado} onChange={(v) => atualizar("consentimentoInformado", v)} />
                <Consent label="Autoriza lembretes WhatsApp / SMS / E-mail" checked={form.autorizaLembretes} onChange={(v) => atualizar("autorizaLembretes", v)} />
                <Consent label="Autoriza teleconsulta" checked={form.autorizaTeleconsulta} onChange={(v) => atualizar("autorizaTeleconsulta", v)} />
                <Consent label="Portal do paciente" checked={form.portalPaciente} onChange={(v) => atualizar("portalPaciente", v)} />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-5">
                {documentosPadrao.map((documento) => {
                  const salvo = documentosSalvos.find((item) => item.nome === documento && item.arquivoId);
                  return (
                    <div
                      key={documento}
                      className={`rounded-lg border border-dashed p-4 text-left transition ${
                        salvo
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept={TIPOS_ACEITOS}
                          className="sr-only"
                          onChange={(event) => {
                            enviarDocumento(documento, event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                          {salvo ? <Check size={17} /> : <Upload size={17} />}
                        </span>
                        <strong className="mt-3 block text-sm">{documento}</strong>
                        <span className="mt-1 block truncate text-xs font-semibold text-indigo-700">
                          {salvo ? salvo.observacao || "Arquivo anexado" : "Enviar arquivo"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {salvo ? `${salvo.tamanho} - clique para trocar` : "PDF, JPG ou PNG até 15 MB"}
                        </span>
                      </label>
                      {salvo?.arquivoId && (
                        <div className="mt-2 flex gap-3 text-xs font-bold">
                          <button type="button" onClick={() => abrirArquivo(salvo.arquivoId!)} className="text-indigo-700">
                            Abrir
                          </button>
                          <button type="button" onClick={() => baixarArquivo(salvo.arquivoId!)} className="text-indigo-700">
                            Baixar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>

            <Textarea
              label="Observacoes internas"
              value={form.observacoesInternas}
              onChange={(v) => atualizar("observacoesInternas", v)}
              large
            />

            {erro && (
              <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {erro}
              </div>
            )}
            {mensagem && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {mensagem}
              </div>
            )}
          </div>

          <footer className="sticky bottom-0 z-10 grid gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:grid-cols-[1fr_1.2fr_1.2fr]">
            <Link
              href="/pacientes"
              className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-extrabold text-slate-700"
            >
              Cancelar
            </Link>
            <Link
              href={prontuarioHref}
              className="flex h-12 items-center justify-center rounded-lg border border-indigo-200 bg-white text-sm font-extrabold text-indigo-700"
            >
              Abrir prontuario
            </Link>
            <button
              type="button"
              onClick={salvar}
              className="h-12 rounded-lg bg-indigo-600 text-sm font-extrabold text-white shadow-sm"
            >
              Salvar alteracoes
            </button>
          </footer>
        </div>

        <aside className="space-y-4">
          <SideCard title="Resumo do cadastro">
            <div className="flex gap-3">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-indigo-700">
                {getInitials(form.nome) || <UserRound size={26} />}
              </span>
              <div className="min-w-0">
                <p className="font-black">{form.nome || "Nome do paciente"}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {idade || "Idade nao informada"} - {form.genero || "Genero nao informado"}
                </p>
              </div>
            </div>
            <ResumoLinha label="Data de nascimento" value={form.dataNascimento} />
            <ResumoLinha label="CPF" value={form.cpf} />
            <ResumoLinha label="Convenio" value={form.convenio} />
            <ResumoLinha label="Plano" value={form.planoConvenio} />
            <ResumoLinha label="Contato" value={form.celular || form.email} />
            <ResumoLinha label="Endereco" value={enderecoResumo} />
            <div>
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span className="text-slate-500">Progresso do cadastro</span>
                <span className="text-indigo-700">{progresso}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-indigo-600"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>
          </SideCard>

          <SideCard title="Checklist">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-slate-600">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      item.completo
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {item.completo && <Check size={11} />}
                  </span>
                  {item.label}
                </span>
              </div>
            ))}
          </SideCard>

          <SideCard title="Sugestoes da IA">
            {sugestoes.length ? (
              sugestoes.map((sugestao) => (
                <div
                  key={sugestao}
                  className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600"
                >
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-indigo-600" />
                  {sugestao}
                </div>
              ))
            ) : (
              <div className="flex gap-3 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                <Check size={16} />
                Cadastro com informacoes principais preenchidas.
              </div>
            )}
          </SideCard>

          <SideCard title="Proximos passos">
            <NextStep href={prontuarioHref} label="Abrir prontuario" icon={<FileText size={16} />} />
            <NextStep href={agendaHref} label="Agendar consulta" icon={<CalendarDays size={16} />} />
            <NextStep href={`/comunicacao?pacienteId=${paciente.id}`} label="Enviar mensagem" icon={<MessageSquare size={16} />} />
            <NextStep href={documentosHref} label="Ver documentos" icon={<FileText size={16} />} />
            <div className="rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-500">
              {agendamentos.length} atendimento(s), {tratamentos.length} tratamento(s) e{" "}
              {documentosSalvos.length} documento(s) vinculados.
            </div>
          </SideCard>
        </aside>
      </div>
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
  icon: typeof IdCard;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-lg border border-slate-200 p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
          <Icon size={19} />
        </span>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
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
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
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
  large = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-500">{label}</span>
      <textarea
        value={value}
        rows={large ? 5 : 4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
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
    <label className="flex h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-700">
      {label}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
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
      className={`rounded-lg border p-4 text-left text-sm font-bold transition ${
        checked
          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <span
        className={`mb-3 flex h-6 w-6 items-center justify-center rounded border ${
          checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
        }`}
      >
        {checked && <Check size={14} />}
      </span>
      {label}
    </button>
  );
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-black text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function ResumoLinha({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="font-bold text-slate-500">{label}</span>
      <strong className="max-w-44 truncate text-right text-slate-800">
        {value || "-"}
      </strong>
    </div>
  );
}

function NextStep({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm font-black text-slate-800 hover:bg-indigo-50 hover:text-indigo-700"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ChevronRight size={16} />
    </Link>
  );
}
