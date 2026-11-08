"use client";

import { useRouter } from "next/navigation";
import { deletePaciente } from "@/utils/cliniplusStore";

type PatientDeleteButtonProps = {
  pacienteId: number | string;
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
      `Excluir o paciente ${nome}? Agenda, prontuário, odontograma, orçamentos, financeiro e documentos dele também serão apagados. Essa ação não pode ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    deletePaciente(pacienteId);
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
