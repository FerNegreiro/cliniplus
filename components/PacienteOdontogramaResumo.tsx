"use client";

import { useEffect, useMemo, useState } from "react";
import {
  dentesInferiores,
  dentesSuperiores,
  type OdontogramaRegistro,
  type OdontogramaStatus,
} from "@/data/odontograma";

const statusClasses: Record<OdontogramaStatus, string> = {
  Sadio: "text-slate-300",
  Cariado: "text-red-400",
  Restaurado: "text-cyan-500",
  "Tratamento de canal": "text-amber-500",
  Prótese: "text-emerald-500",
};

function getStorageKey(pacienteId: number) {
  return `cliniplus:odontograma:${pacienteId}`;
}

function getDenteCor(
  dente: string,
  registros: OdontogramaRegistro[]
) {
  const registro = registros.find((item) => item.dente === dente);

  return registro ? statusClasses[registro.status] : statusClasses.Sadio;
}

function DenteMini({
  numero,
  registros,
  inferior = false,
}: {
  numero: string;
  registros: OdontogramaRegistro[];
  inferior?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold text-slate-500">
        {numero}
      </span>

      <svg
        viewBox="0 0 80 100"
        className={
          inferior
            ? `h-8 w-7 rotate-180 ${getDenteCor(numero, registros)}`
            : `h-8 w-7 ${getDenteCor(numero, registros)}`
        }
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40 8C27 8 17 16 15 30C13 42 17 54 20 65C23 77 25 91 34 91C39 91 38 75 40 75C42 75 41 91 46 91C55 91 57 77 60 65C63 54 67 42 65 30C63 16 53 8 40 8Z"
          fill="white"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function PacienteOdontogramaResumo({
  pacienteId,
  registrosIniciais,
}: {
  pacienteId: number;
  registrosIniciais: OdontogramaRegistro[];
}) {
  const [registros, setRegistros] = useState(registrosIniciais);

  useEffect(() => {
    const carregarRegistros = () => {
      const salvos = window.localStorage.getItem(getStorageKey(pacienteId));

      if (salvos) {
        setRegistros(JSON.parse(salvos) as OdontogramaRegistro[]);
      }
    };

    carregarRegistros();
    window.addEventListener("storage", carregarRegistros);
    window.addEventListener("cliniplus:odontograma", carregarRegistros);

    return () => {
      window.removeEventListener("storage", carregarRegistros);
      window.removeEventListener("cliniplus:odontograma", carregarRegistros);
    };
  }, [pacienteId]);

  const registrosAtivos = useMemo(
    () => registros.filter((registro) => registro.status !== "Sadio"),
    [registros]
  );

  return (
    <>
      <div className="mt-5 rounded-3xl bg-slate-50 p-5">
        <div className="grid grid-cols-8 gap-2 md:grid-cols-16">
          {dentesSuperiores.map((dente) => (
            <DenteMini key={dente} numero={dente} registros={registros} />
          ))}
        </div>

        <div className="my-5 border-t border-dashed border-slate-300" />

        <div className="grid grid-cols-8 gap-2 md:grid-cols-16">
          {dentesInferiores.map((dente) => (
            <DenteMini
              key={dente}
              numero={dente}
              registros={registros}
              inferior
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>Sadio</span>
          <span className="text-red-500">Cariado</span>
          <span className="text-cyan-500">Restaurado</span>
          <span className="text-amber-500">Tratamento de canal</span>
          <span className="text-emerald-500">Prótese</span>
        </div>
      </div>

      {registrosAtivos.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          {registrosAtivos.slice(0, 4).map((registro) => (
            <span
              key={registro.dente}
              className="rounded-full bg-white px-3 py-1 font-semibold"
            >
              Dente {registro.dente}: {registro.status}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
