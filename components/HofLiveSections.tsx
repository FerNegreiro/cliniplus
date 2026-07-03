"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";

type HofProcedure = {
  paciente: string;
  procedimento: string;
  area: string;
  status: string;
  valor: string;
  retorno: string;
};

type HofProduct = {
  nome: string;
  lote: string;
  validade: string;
  uso: string;
};

type HofDocument = {
  nome: string;
  detalhe: string;
};

type HofHistory = {
  titulo: string;
  descricao: string;
  status: string;
  data: string;
};

type HofData = {
  prontuario: {
    avaliacao: string;
    plano: string;
    anamnese: string;
  };
  info: {
    nascimento: string;
    telefone: string;
    email: string;
    convenio: string;
    tipo: string;
  };
  procedures: HofProcedure[];
  products: HofProduct[];
  finance: {
    valor: string;
    status: string;
  };
  documents: HofDocument[];
  history: HofHistory[];
};

const hofProcedureStatusOptions = [
  "Planejado",
  "Em acompanhamento",
  "Concluído",
  "Retorno pendente",
];

const hofHistoryStatusOptions = [
  "Registrado",
  "Concluído",
  "Anexado",
  "Em acompanhamento",
  "Pendente",
];

function getKey(nomePaciente: string) {
  return `cliniplus:hof-live:${nomePaciente}`;
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileDetail(file: File) {
  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toUpperCase()
    : "";

  return `${extension || file.type || "Arquivo"} • ${formatFileSize(
    file.size
  )}`;
}

function getDefaultData({
  nomePaciente,
  telefone,
  email,
  convenio,
  initialProcedures,
  totalFaturamento,
}: {
  nomePaciente: string;
  telefone: string;
  email: string;
  convenio: string;
  initialProcedures: HofProcedure[];
  totalFaturamento: string;
}): HofData {
  const procedures = initialProcedures.length
    ? initialProcedures
    : [
        {
          paciente: nomePaciente,
          procedimento: "Harmonização orofacial",
          area: "Face completa",
          status: "Planejado",
          valor: totalFaturamento,
          retorno: "Não agendado",
        },
      ];

  return {
    prontuario: {
      avaliacao: "Assimetria, queixas, objetivo e áreas de interesse.",
      plano: "Procedimentos, sessões, valores e retornos.",
      anamnese: "Histórico, alergias, medicamentos e observações.",
    },
    info: {
      nascimento: "15/03/1990",
      telefone,
      email,
      convenio,
      tipo: "Estética / HOF",
    },
    procedures,
    products: [
      {
        nome: "Ácido hialurônico",
        lote: "AH-2026-8891",
        validade: "12/2027",
        uso: "Preenchimento",
      },
      {
        nome: "Toxina botulínica",
        lote: "TB-2026-4430",
        validade: "08/2027",
        uso: "Relaxamento muscular",
      },
      {
        nome: "Bioestimulador",
        lote: "BIO-2026-2210",
        validade: "10/2027",
        uso: "Estímulo de colágeno",
      },
    ],
    finance: {
      valor: procedures[0]?.valor || totalFaturamento,
      status: "Orçamento estético",
    },
    documents: [
      { nome: "Foto antes", detalhe: "Adicionar ou editar arquivo" },
      { nome: "Foto depois", detalhe: "Adicionar ou editar arquivo" },
      { nome: "Comparativo visual", detalhe: "Adicionar ou editar arquivo" },
    ],
    history: [
      {
        titulo: "Avaliação estética inicial",
        descricao: "Queixa principal, fotos iniciais e plano sugerido.",
        status: "Concluído",
        data: "08/06/2026",
      },
      {
        titulo: "Registro fotográfico antes",
        descricao: "Fotos anexadas ao prontuário estético.",
        status: "Anexado",
        data: "08/06/2026",
      },
    ],
  };
}

function useHofLiveData(props: {
  nomePaciente: string;
  telefone: string;
  email: string;
  convenio: string;
  initialProcedures: HofProcedure[];
  totalFaturamento: string;
}) {
  const {
    nomePaciente,
    telefone,
    email,
    convenio,
    initialProcedures,
    totalFaturamento,
  } = props;
  const fallback = useMemo(
    () =>
      getDefaultData({
        nomePaciente,
        telefone,
        email,
        convenio,
        initialProcedures,
        totalFaturamento,
      }),
    [
      nomePaciente,
      telefone,
      email,
      convenio,
      initialProcedures,
      totalFaturamento,
    ]
  );
  const fallbackJson = JSON.stringify(fallback);
  const snapshot = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("cliniplus:hof-live", onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener("cliniplus:hof-live", onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => window.localStorage.getItem(getKey(nomePaciente)) ?? fallbackJson,
    () => fallbackJson
  );

  let data = fallback;

  try {
    data = { ...fallback, ...(JSON.parse(snapshot) as Partial<HofData>) };
  } catch {
    data = fallback;
  }

  function save(nextData: HofData) {
    window.localStorage.setItem(getKey(nomePaciente), JSON.stringify(nextData));
    window.dispatchEvent(new Event("cliniplus:hof-live"));
  }

  return { data, save };
}

function HofShell(props: {
  nomePaciente: string;
  telefone: string;
  email: string;
  convenio: string;
  initialProcedures: HofProcedure[];
  totalFaturamento: string;
  children: (data: HofData, save: (nextData: HofData) => void) => ReactNode;
}) {
  const { data, save } = useHofLiveData(props);
  return <>{props.children(data, save)}</>;
}

export function HofResumoCards(props: {
  nomePaciente: string;
  telefone: string;
  email: string;
  convenio: string;
  initialProcedures: HofProcedure[];
  totalFaturamento: string;
}) {
  return (
    <HofShell {...props}>
      {(data) => (
        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Procedimentos</p>
            <h3 className="mt-3 text-3xl font-bold">{data.procedures.length}</h3>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Em acompanhamento</p>
            <h3 className="mt-3 text-3xl font-bold">
              {
                data.procedures.filter(
                  (item) => item.status === "Em acompanhamento"
                ).length
              }
            </h3>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Faturamento</p>
            <h3 className="mt-3 text-3xl font-bold">{data.finance.valor}</h3>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Termos</p>
            <h3 className="mt-3 text-3xl font-bold">{data.documents.length}</h3>
          </div>
        </div>
      )}
    </HofShell>
  );
}

export function HofProntuarioResumo(props: Parameters<typeof HofResumoCards>[0]) {
  return (
    <HofShell {...props}>
      {(data, save) => (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ["avaliacao", "border-cyan-100 bg-cyan-50 text-cyan-700"],
            ["plano", "border-emerald-100 bg-emerald-50 text-emerald-700"],
            ["anamnese", "border-amber-100 bg-amber-50 text-amber-700"],
          ].map(([field, className]) => (
            <textarea
              key={field}
              value={data.prontuario[field as keyof HofData["prontuario"]]}
              onChange={(event) =>
                save({
                  ...data,
                  prontuario: {
                    ...data.prontuario,
                    [field]: event.target.value,
                  },
                })
              }
              className={`min-h-28 rounded-2xl border p-4 text-sm outline-none ${className}`}
            />
          ))}
        </div>
      )}
    </HofShell>
  );
}

export function HofInfoResumo(props: Parameters<typeof HofResumoCards>[0]) {
  return (
    <HofShell {...props}>
      {(data, save) => {
        const rows = [
          ["Nome completo", props.nomePaciente, "nome"],
          ["Data de nascimento", data.info.nascimento, "nascimento"],
          ["Telefone", data.info.telefone, "telefone"],
          ["E-mail", data.info.email, "email"],
          ["Convênio", data.info.convenio, "convenio"],
          ["Tipo", data.info.tipo, "tipo"],
        ];

        return (
          <div className="mt-5 space-y-4 text-sm">
            {rows.map(([label, value, field]) => (
              <label key={label} className="grid gap-2 rounded-2xl bg-slate-50 p-3">
                <span className="text-xs text-slate-500">{label}</span>
                <input
                  value={value}
                  readOnly={field === "nome"}
                  onChange={(event) =>
                    save({
                      ...data,
                      info: { ...data.info, [field]: event.target.value },
                    })
                  }
                  className="bg-transparent text-sm font-semibold outline-none"
                />
              </label>
            ))}
          </div>
        );
      }}
    </HofShell>
  );
}

export function HofProntuarioEditor(props: Parameters<typeof HofResumoCards>[0]) {
  return (
    <HofShell {...props}>
      {(data, save) => (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label>
            <span className="text-sm font-semibold">Avaliação facial</span>
            <textarea
              value={data.prontuario.avaliacao}
              onChange={(event) =>
                save({
                  ...data,
                  prontuario: { ...data.prontuario, avaliacao: event.target.value },
                })
              }
              className="mt-2 h-36 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </label>
          <label>
            <span className="text-sm font-semibold">Anamnese estética</span>
            <textarea
              value={data.prontuario.anamnese}
              onChange={(event) =>
                save({
                  ...data,
                  prontuario: { ...data.prontuario, anamnese: event.target.value },
                })
              }
              className="mt-2 h-36 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
            />
          </label>
        </div>
      )}
    </HofShell>
  );
}

export function HofTratamentosEditor(props: Parameters<typeof HofResumoCards>[0]) {
  return (
    <HofShell {...props}>
      {(data, save) => (
        <div className="mt-6 space-y-4">
          {data.procedures.map((item, index) => (
            <div key={index} className="rounded-3xl bg-slate-50 p-5">
              <div className="grid gap-4 md:grid-cols-4">
                {(["procedimento", "area", "status", "retorno"] as const).map(
                  (field) =>
                    field === "status" ? (
                      <select
                        key={field}
                        value={item.status}
                        onChange={(event) => {
                          const procedures = [...data.procedures];
                          procedures[index] = {
                            ...item,
                            status: event.target.value,
                          };
                          save({ ...data, procedures });
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
                      >
                        {hofProcedureStatusOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                    <input
                      key={field}
                      value={item[field]}
                      onChange={(event) => {
                        const procedures = [...data.procedures];
                        procedures[index] = {
                          ...item,
                          [field]: event.target.value,
                        };
                        save({ ...data, procedures });
                      }}
                      className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
                    />
                  )
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              save({
                ...data,
                procedures: [
                  ...data.procedures,
                  {
                    paciente: props.nomePaciente,
                    procedimento: "Novo procedimento",
                    area: "Área tratada",
                    status: "Planejado",
                    valor: "R$ 0",
                    retorno: "Não agendado",
                  },
                ],
              })
            }
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
          >
            Adicionar tratamento
          </button>
        </div>
      )}
    </HofShell>
  );
}

export function HofProdutosEditor(props: Parameters<typeof HofResumoCards>[0]) {
  return (
    <HofShell {...props}>
      {(data, save) => (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
          <div className="grid grid-cols-4 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
            <span>Produto</span>
            <span>Lote</span>
            <span>Validade</span>
            <span>Uso</span>
          </div>
          {data.products.map((produto, index) => (
            <div
              key={index}
              className="grid grid-cols-4 border-t border-slate-100 px-4 py-4 text-sm"
            >
              {(["nome", "lote", "validade", "uso"] as const).map((field) => (
                <input
                  key={field}
                  value={produto[field]}
                  onChange={(event) => {
                    const products = [...data.products];
                    products[index] = { ...produto, [field]: event.target.value };
                    save({ ...data, products });
                  }}
                  className="bg-transparent outline-none first:font-semibold"
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </HofShell>
  );
}

export function HofFinanceiroEditor(props: Parameters<typeof HofResumoCards>[0]) {
  return (
    <HofShell {...props}>
      {(data, save) => (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {data.procedures.map((item, index) => (
            <div key={index} className="rounded-2xl bg-slate-50 p-5">
              <p className="font-semibold">{item.procedimento}</p>
              <label className="mt-4 block">
                <span className="text-sm text-slate-500">Valor previsto</span>
                <input
                  value={data.finance.valor}
                  onChange={(event) =>
                    save({
                      ...data,
                      finance: { ...data.finance, valor: event.target.value },
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-2xl font-bold text-emerald-600 outline-none"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-sm text-slate-500">Status financeiro</span>
                <select
                  value={data.finance.status}
                  onChange={(event) =>
                    save({
                      ...data,
                      finance: { ...data.finance, status: event.target.value },
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                >
                  <option>Orçamento estético</option>
                  <option>Aguardando pagamento</option>
                  <option>Pago</option>
                </select>
              </label>
            </div>
          ))}
        </div>
      )}
    </HofShell>
  );
}

export function HofDocumentosEditor(props: Parameters<typeof HofResumoCards>[0]) {
  return (
    <HofShell {...props}>
      {(data, save) => (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {data.documents.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl">
                +
              </div>
              <input
                value={item.nome}
                readOnly
                className="mt-4 w-full bg-transparent text-center font-semibold outline-none"
              />
              <p className="mt-1 text-sm text-slate-500">{item.detalhe}</p>
              <label className="mt-4 block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-cyan-700">
                Selecionar arquivo
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }

                    const documents = [...data.documents];
                    documents[index] = {
                      nome: file.name,
                      detalhe: getFileDetail(file),
                    };
                    save({ ...data, documents });
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </HofShell>
  );
}

export function HofHistoricoEditor(props: Parameters<typeof HofResumoCards>[0]) {
  return (
    <HofShell {...props}>
      {(data, save) => (
        <div className="mt-6 space-y-4">
          {data.history.map((item, index) => (
            <div key={index} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex justify-between gap-3">
                <div className="w-full">
                  <input
                    value={item.titulo}
                    onChange={(event) => {
                      const history = [...data.history];
                      history[index] = { ...item, titulo: event.target.value };
                      save({ ...data, history });
                    }}
                    className="w-full bg-transparent font-semibold outline-none"
                  />
                  <textarea
                    value={item.descricao}
                    onChange={(event) => {
                      const history = [...data.history];
                      history[index] = { ...item, descricao: event.target.value };
                      save({ ...data, history });
                    }}
                    className="mt-1 w-full bg-transparent text-sm text-slate-500 outline-none"
                  />
                </div>
                <select
                  value={item.status}
                  onChange={(event) => {
                    const history = [...data.history];
                    history[index] = { ...item, status: event.target.value };
                    save({ ...data, history });
                  }}
                  className="h-fit w-28 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 outline-none"
                >
                  {hofHistoryStatusOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <input
                value={item.data}
                onChange={(event) => {
                  const history = [...data.history];
                  history[index] = { ...item, data: event.target.value };
                  save({ ...data, history });
                }}
                className="mt-2 bg-transparent text-xs text-slate-400 outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </HofShell>
  );
}
