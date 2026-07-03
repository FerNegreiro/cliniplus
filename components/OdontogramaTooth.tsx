"use client";

type ToothType = "molar" | "premolar" | "canino" | "incisivo";

type OdontogramaToothProps = {
  numero: string;
  selecionado: boolean;
  condicao?: string;
  arcada: "superior" | "inferior";
  onClick: () => void;
};

function getToothType(numero: string): ToothType {
  const n = Number(numero.slice(1));

  if ([6, 7, 8].includes(n)) return "molar";
  if ([4, 5].includes(n)) return "premolar";
  if (n === 3) return "canino";
  return "incisivo";
}

function normalizeCondicao(condicao?: string) {
  return (condicao || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function MolarSvg({
  className,
  muted,
}: {
  className?: string;
  muted?: boolean;
}) {
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden="true">
      <path
        d="M7 15 C7 7 13 4 18 7 C21 9 23 11 24 15 C25 11 27 9 30 7 C35 4 41 7 41 15 C41 24 36 30 34 37 C32 44 32 57 28 59 C25 60 25 47 24 47 C23 47 23 60 20 59 C16 57 16 44 14 37 C12 30 7 24 7 15Z"
        fill={muted ? "#F1F5F9" : "#FFFFFF"}
        stroke="#8A94A6"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 14 C15 10 19 11 22 16 C23 13 25 13 26 16 C29 11 33 10 36 14"
        fill="none"
        stroke="#B7C0CE"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M12 34 C16 31 21 32 24 34 C27 32 32 31 36 34"
        fill="none"
        stroke="#B7C0CE"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      <path
        d="M17 19 C18 24 18 29 16 34"
        fill="none"
        stroke="#D1D7E2"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M31 19 C30 24 30 29 32 34"
        fill="none"
        stroke="#D1D7E2"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M24 17 V49"
        stroke="#D1D7E2"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PremolarSvg({
  className,
  muted,
}: {
  className?: string;
  muted?: boolean;
}) {
  return (
    <svg viewBox="0 0 42 64" className={className} aria-hidden="true">
      <path
        d="M7 15 C7 7 13 4 19 8 C20 9 22 9 23 8 C29 4 35 7 35 15 C35 24 30 31 28 38 C26 46 25 58 21 59 C17 58 16 46 14 38 C12 31 7 24 7 15Z"
        fill={muted ? "#F1F5F9" : "#FFFFFF"}
        stroke="#8A94A6"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15 C15 10 19 11 21 16 C23 11 27 10 30 15"
        fill="none"
        stroke="#B7C0CE"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M12 34 C16 31 26 31 30 34"
        fill="none"
        stroke="#B7C0CE"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M21 17 V48"
        stroke="#D1D7E2"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CaninoSvg({
  className,
  muted,
}: {
  className?: string;
  muted?: boolean;
}) {
  return (
    <svg viewBox="0 0 38 64" className={className} aria-hidden="true">
      <path
        d="M6 15 C6 7 12 4 19 8 C26 4 32 7 32 15 C32 25 27 32 24 41 C22 49 21 58 19 61 C17 58 16 49 14 41 C11 32 6 25 6 15Z"
        fill={muted ? "#F1F5F9" : "#FFFFFF"}
        stroke="#8A94A6"
        strokeWidth="2.05"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 16 C14 10 17 11 19 17 C21 11 24 10 27 16"
        fill="none"
        stroke="#B7C0CE"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M11 34 C15 31 23 31 27 34"
        fill="none"
        stroke="#B7C0CE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M19 17 V48"
        stroke="#D1D7E2"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IncisivoSvg({
  className,
  muted,
}: {
  className?: string;
  muted?: boolean;
}) {
  return (
    <svg viewBox="0 0 34 64" className={className} aria-hidden="true">
      <path
        d="M6 14 C6 7 11 5 17 7 C23 5 28 7 28 14 C28 24 24 33 23 42 C22 50 20 58 17 59 C14 58 12 50 11 42 C10 33 6 24 6 14Z"
        fill={muted ? "#F1F5F9" : "#FFFFFF"}
        stroke="#8A94A6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16 C13 13 21 13 24 16"
        fill="none"
        stroke="#B7C0CE"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M10 34 C14 31 20 31 24 34"
        fill="none"
        stroke="#B7C0CE"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M17 16 V46"
        stroke="#D1D7E2"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClinicalMark({ condicao }: { condicao?: string }) {
  const normalizada = normalizeCondicao(condicao);

  if (normalizada.includes("carie")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M15 10 L33 34 M33 10 L15 34"
          stroke="#EF4444"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalizada.includes("restauracao")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M16 31 C20 27 28 27 32 31 C31 37 17 37 16 31Z"
          fill="#DBEAFE"
          stroke="#2563EB"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (normalizada.includes("canal")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M18 26 C21 23 27 23 30 26"
          stroke="#F59E0B"
          strokeWidth="2.7"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M24 16 V45"
          stroke="#F59E0B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalizada.includes("extracao")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M14 9 L34 39 M34 9 L14 39"
          stroke="#6D28D9"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalizada.includes("extraido")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M13 12 L35 43 M35 12 L13 43"
          stroke="#475569"
          strokeWidth="2.8"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    );
  }

  if (normalizada.includes("implante")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M18 12 C21 18 27 18 30 12"
          stroke="#10B981"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M24 18 V44"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M19 27 H29 M19 35 H29"
          stroke="#10B981"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalizada.includes("protese")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M13 22 C17 15 31 15 35 22"
          stroke="#06B6D4"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M15 22 C18 27 30 27 33 22"
          stroke="#06B6D4"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalizada.includes("ausente")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M13 42 C18 46 30 46 35 42"
          stroke="#64748B"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (normalizada.includes("observacao")) {
    return (
      <svg
        viewBox="0 0 48 64"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <circle cx="24" cy="25" r="5" fill="#FACC15" opacity="0.95" />
      </svg>
    );
  }

  return null;
}

export function OdontogramaTooth({
  numero,
  selecionado,
  condicao,
  arcada,
  onClick,
}: OdontogramaToothProps) {
  const type = getToothType(numero);
  const normalizada = normalizeCondicao(condicao);
  const muted =
    normalizada.includes("ausente") || normalizada.includes("extraido");

  const svgClass = {
    molar: "h-[42px] w-[35px]",
    premolar: "h-[41px] w-[29px]",
    canino: "h-[41px] w-[25px]",
    incisivo: "h-[39px] w-[22px]",
  }[type];

  function renderToothSvg() {
    if (type === "molar") {
      return <MolarSvg className={svgClass} muted={muted} />;
    }

    if (type === "premolar") {
      return <PremolarSvg className={svgClass} muted={muted} />;
    }

    if (type === "canino") {
      return <CaninoSvg className={svgClass} muted={muted} />;
    }

    return <IncisivoSvg className={svgClass} muted={muted} />;
  }

  const number = (
    <span
      className={[
        "text-[11px] font-bold leading-none",
        selecionado ? "text-violet-700" : "text-slate-700",
      ].join(" ")}
    >
      {numero}
    </span>
  );

  return (
    <button
      type="button"
      aria-label={`${numero} ${condicao || "Sem anotacao"}`}
      title={`${numero} ${condicao || "Sem anotacao"}`}
      onClick={onClick}
      className={[
        "group flex shrink-0 flex-col items-center gap-1 rounded-lg px-0 py-0.5 text-center transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
        selecionado
          ? "bg-white shadow-sm ring-2 ring-violet-500"
          : "hover:bg-white/70",
      ].join(" ")}
    >
      {arcada === "superior" && number}

      <span
        className={[
          "relative flex items-center justify-center",
          arcada === "superior" ? "rotate-180" : "",
        ].join(" ")}
      >
        {renderToothSvg()}
        <ClinicalMark condicao={condicao} />
      </span>

      {arcada === "inferior" && number}
    </button>
  );
}
