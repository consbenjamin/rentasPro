import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { PropiedadForm } from "@/components/PropiedadForm";

export default async function EditarPropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("propiedades").select("*").eq("id", id).single();
  if (!data) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar propiedad</h1>
      <PropiedadForm propiedad={data} />
    </div>
  );
}
