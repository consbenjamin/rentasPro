import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { InquilinoForm } from "@/components/InquilinoForm";

export default async function EditarInquilinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("inquilinos").select("*").eq("id", id).single();
  if (!data) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar inquilino</h1>
      <InquilinoForm inquilino={data} />
    </div>
  );
}
