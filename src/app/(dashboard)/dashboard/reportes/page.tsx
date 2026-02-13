import { createClient } from "@/lib/supabase-server";
import { LiquidacionForm } from "@/components/LiquidacionForm";

export default async function ReportesPage() {
  const supabase = await createClient();
  const { data: propietarios } = await supabase
    .from("propietarios")
    .select("id, nombre")
    .order("nombre");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reportes PDF</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md">
        <h2 className="font-medium text-slate-800 mb-4">Liquidación al propietario</h2>
        <LiquidacionForm propietarios={propietarios ?? []} />
      </div>
    </div>
  );
}
