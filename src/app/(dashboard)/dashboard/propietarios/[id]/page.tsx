import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { PropietarioForm } from "@/components/PropietarioForm";

export default async function EditarPropietarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("propietarios").select("*").eq("id", id).single();
  if (!data) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar propietario</h1>
      <PropietarioForm propietario={data} />
    </div>
  );
}
