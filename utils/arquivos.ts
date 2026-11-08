export type ArquivoSalvo = {
  id: string;
  pacienteId: string;
  nome: string;
  tipoMime: string;
  tamanho: number;
  conteudo: Blob;
  criadoEm: string;
};

const BANCO = "cliniplus-arquivos";
const TABELA = "arquivos";
export const TAMANHO_MAXIMO = 15 * 1024 * 1024;
export const TIPOS_ACEITOS = ".pdf,.jpg,.jpeg,.png,.webp";
const MIMES_ACEITOS = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const requisicao = indexedDB.open(BANCO, 1);
    requisicao.onupgradeneeded = () => {
      const tabela = requisicao.result.createObjectStore(TABELA, { keyPath: "id" });
      tabela.createIndex("pacienteId", "pacienteId");
    };
    requisicao.onsuccess = () => resolve(requisicao.result);
    requisicao.onerror = () => reject(requisicao.error);
  });
}

async function executar<T>(modo: IDBTransactionMode, acao: (tabela: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const banco = await abrirBanco();
  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(TABELA, modo);
    const requisicao = acao(transacao.objectStore(TABELA));
    transacao.oncomplete = () => {
      banco.close();
      resolve(requisicao.result);
    };
    transacao.onerror = () => {
      banco.close();
      reject(transacao.error);
    };
  });
}

export function validarArquivo(arquivo: File) {
  if (!MIMES_ACEITOS.includes(arquivo.type)) {
    return "Formato não aceito. Envie PDF, JPG, PNG ou WEBP.";
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return "O arquivo passa de 15 MB.";
  }
  return "";
}

export function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function extensaoDoArquivo(nome: string) {
  return nome.includes(".") ? nome.split(".").pop()!.toUpperCase() : "";
}

export async function salvarArquivo(arquivo: File, pacienteId: string | number) {
  const registro: ArquivoSalvo = {
    id: crypto.randomUUID(),
    pacienteId: String(pacienteId),
    nome: arquivo.name,
    tipoMime: arquivo.type,
    tamanho: arquivo.size,
    conteudo: arquivo,
    criadoEm: new Date().toISOString(),
  };
  await executar("readwrite", (tabela) => tabela.put(registro));
  return registro;
}

export function obterArquivo(id: string) {
  return executar<ArquivoSalvo | undefined>("readonly", (tabela) => tabela.get(id));
}

export function removerArquivo(id: string) {
  return executar("readwrite", (tabela) => tabela.delete(id));
}

export async function removerArquivosDoPaciente(pacienteId: string | number) {
  const banco = await abrirBanco();
  await new Promise<void>((resolve, reject) => {
    const transacao = banco.transaction(TABELA, "readwrite");
    const indice = transacao.objectStore(TABELA).index("pacienteId");
    const cursor = indice.openCursor(IDBKeyRange.only(String(pacienteId)));
    cursor.onsuccess = () => {
      if (cursor.result) {
        cursor.result.delete();
        cursor.result.continue();
      }
    };
    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });
  banco.close();
}

export async function abrirArquivo(id: string) {
  const arquivo = await obterArquivo(id);
  if (!arquivo) return false;
  const url = URL.createObjectURL(arquivo.conteudo);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

export async function baixarArquivo(id: string) {
  const arquivo = await obterArquivo(id);
  if (!arquivo) return false;
  const url = URL.createObjectURL(arquivo.conteudo);
  const link = document.createElement("a");
  link.href = url;
  link.download = arquivo.nome;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}

const PREFIXO_REFERENCIA = "idb:";

export function referenciaArquivo(id: string) {
  return `${PREFIXO_REFERENCIA}${id}`;
}

export function idDaReferencia(url?: string) {
  return url?.startsWith(PREFIXO_REFERENCIA) ? url.slice(PREFIXO_REFERENCIA.length) : "";
}

export async function urlParaExibir(url?: string) {
  const id = idDaReferencia(url);
  if (!id) return url || "";
  const arquivo = await obterArquivo(id);
  return arquivo ? URL.createObjectURL(arquivo.conteudo) : "";
}

export async function baixarPorUrl(url: string | undefined, nome: string) {
  const id = idDaReferencia(url);
  if (id) return baixarArquivo(id);
  if (!url) return false;
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  return true;
}
