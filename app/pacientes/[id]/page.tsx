import PacienteLocalDetalhes from "@/components/PacienteLocalDetalhes";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type PacienteDetalhesProps = {
  params:
    | Promise<{
        id: string;
      }>
    | {
        id: string;
      };
};

export default async function PacienteDetalhes({ params }: PacienteDetalhesProps) {
  const { id } = await params;

  return <PacienteLocalDetalhes id={String(id)} />;
}
