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
      <div className="mb-6 sm:mb-8">
        <h1 className="page-title">Reportes PDF</h1>
        <p className="page-subtitle">Genera liquidaciones y reportes para propietarios</p>
      </div>
      <div className="card card-body max-w-md">
        <h2 className="font-medium text-slate-800 dark:text-slate-200 mb-4">Liquidación al propietario</h2>
        <LiquidacionForm propietarios={propietarios ?? []} />
      </div>
    </div>
  );
}
