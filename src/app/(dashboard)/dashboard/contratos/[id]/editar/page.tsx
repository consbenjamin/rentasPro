import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { ContratoForm } from "@/components/ContratoForm";

export default async function EditarContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("contratos").select("*").eq("id", id).single();
  if (!data) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar contrato</h1>
      <ContratoForm contrato={data} />
    </div>
  );
}
