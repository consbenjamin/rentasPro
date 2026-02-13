import { createClient } from "@/lib/supabase-server";
import { PagoForm } from "@/components/PagoForm";

export default async function NuevoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ contrato?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  let contratoPrecargado = null;
  if (params.contrato) {
    const { data } = await supabase
      .from("contratos")
      .select("id, monto_mensual, propiedades(direccion), inquilinos(nombre)")
      .eq("id", params.contrato)
      .single();
    contratoPrecargado = data;
  }
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Registrar pago</h1>
      <PagoForm
        contratoId={params.contrato}
        mesPrecargado={params.mes}
        contratoPrecargado={contratoPrecargado ?? undefined}
      />
    </div>
  );
}
