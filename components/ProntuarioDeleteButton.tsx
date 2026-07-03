"use client";

import { useEffect } from "react";

const prontuariosExcluidosKey = "cliniplus:prontuarios-excluidos";

function getProntuariosExcluidos() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(prontuariosExcluidosKey) || "[]"
    ) as number[];
  } catch {
    return [];
  }
}

function ocultarProntuario(id: number) {
  const card = document.querySelector(`[data-prontuario-id="${id}"]`);
  card?.classList.add("hidden");
}

export default function ProntuarioDeleteButton({
  prontuarioId,
  paciente,
}: {
  prontuarioId: number;
  paciente: string;
}) {
  useEffect(() => {
    if (getProntuariosExcluidos().includes(prontuarioId)) {
      ocultarProntuario(prontuarioId);
    }
  }, [prontuarioId]);

  function handleDelete() {
    const confirmar = window.confirm(
      `Excluir o prontuario de ${paciente}? Esta acao remove o registro desta lista neste navegador.`
    );

    if (!confirmar) {
      return;
    }

    const excluidos = getProntuariosExcluidos();
    const proximosExcluidos = Array.from(
      new Set([...excluidos, prontuarioId])
    );

    window.localStorage.setItem(
      prontuariosExcluidosKey,
      JSON.stringify(proximosExcluidos)
    );
    ocultarProntuario(prontuarioId);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700 hover:bg-red-100"
    >
      Excluir
    </button>
  );
}
