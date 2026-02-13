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
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Reportes PDF</h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 max-w-md">
        <h2 className="font-medium text-slate-800 dark:text-slate-200 mb-4">Liquidación al propietario</h2>
        <LiquidacionForm propietarios={propietarios ?? []} />
      </div>
    </div>
  );
}
