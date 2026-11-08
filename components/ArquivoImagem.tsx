"use client";

import { useEffect, useState } from "react";
import { idDaReferencia, urlParaExibir } from "@/utils/arquivos";

export default function ArquivoImagem({ url, alt, className }: { url?: string; alt: string; className?: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let ativo = true;
    let criada = "";

    urlParaExibir(url).then((resolvida) => {
      if (!ativo) {
        if (idDaReferencia(url)) URL.revokeObjectURL(resolvida);
        return;
      }
      if (idDaReferencia(url)) criada = resolvida;
      setSrc(resolvida);
    });

    return () => {
      ativo = false;
      if (criada) URL.revokeObjectURL(criada);
    };
  }, [url]);

  if (!src) {
    return <div className="flex h-40 items-center justify-center text-xs font-semibold text-slate-400">Carregando imagem...</div>;
  }

  return <img src={src} alt={alt} className={className} />;
}
