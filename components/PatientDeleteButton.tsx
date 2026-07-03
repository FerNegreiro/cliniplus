"use client";

import { useRouter } from "next/navigation";
import { excluirPaciente } from "@/utils/localCadastro";

type PatientDeleteButtonProps = {
  pacienteId: number;
  nome: string;
  compact?: boolean;
};

export default function PatientDeleteButton({
  pacienteId,
  nome,
  compact = false,
}: PatientDeleteButtonProps) {
  const router = useRouter();

  function handleDelete() {
    const confirmed = window.confirm(
      `Excluir o paciente ${nome}? Esta ação remove a ficha da lista deste navegador.`
    );

    if (!confirmed) {
      return;
    }

    excluirPaciente({ id: pacienteId, nome });
    router.push("/pacientes");
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className={
        compact
          ? "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          : "rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
      }
    >
      Excluir paciente
    </button>
  );
}
