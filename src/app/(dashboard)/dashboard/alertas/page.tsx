import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MarcarAlertasLeidas } from "@/components/MarcarAlertasLeidas";

const TIPO_LABEL: Record<string, string> = {
  vencimiento_contrato: "Vencimiento de contrato",
  vencimiento_alquiler: "Vence alquiler",
  pago_vencido: "Pago vencido",
  aumento: "Aumento",
  renovacion: "Renovación",
};

export default async function AlertasPage() {
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("alertas")
    .select(`
      id,
      tipo,
      mensaje,
      leida,
      fecha_generada,
      contratos(
        id,
        propiedades(direccion),
        inquilinos(nombre)
      )
    `)
    .order("fecha_generada", { ascending: false })
    .limit(100);

  const sinLeer = (list ?? []).filter((a) => !a.leida).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Alertas</h1>
        {sinLeer > 0 && (
          <MarcarAlertasLeidas />
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Fecha</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Tipo</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Contrato</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Mensaje</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-20">Leída</th>
            </tr>
          </thead>
          <tbody>
            {(list ?? []).map((a) => {
              const c = a.contratos as unknown as {
                propiedades?: { direccion: string } | { direccion: string }[] | null;
                inquilinos?: { nombre: string } | { nombre: string }[] | null;
              } | null;
              const prop = c?.propiedades;
              const inqu = c?.inquilinos;
              const direccion = Array.isArray(prop) ? prop[0]?.direccion : (prop as { direccion: string } | null)?.direccion;
              const nombreInq = Array.isArray(inqu) ? inqu[0]?.nombre : (inqu as { nombre: string } | null)?.nombre;
              return (
                <tr
                  key={a.id}
                  className={`border-b border-slate-100 ${!a.leida ? "bg-amber-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {format(new Date(a.fecha_generada), "dd/MM/yyyy HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {TIPO_LABEL[a.tipo] ?? a.tipo}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm">
                    {direccion ?? "—"}
                    {nombreInq && (
                      <span className="text-slate-400"> / {nombreInq}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{a.mensaje}</td>
                  <td className="px-4 py-3">
                    {a.leida ? (
                      <span className="text-slate-400 text-sm">Sí</span>
                    ) : (
                      <span className="text-amber-600 text-sm font-medium">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!list || list.length === 0) && (
          <p className="px-4 py-8 text-slate-500 text-center">
            No hay alertas. Las alertas se generan automáticamente (cron) o al registrar vencimientos.
          </p>
        )}
      </div>
    </div>
  );
}
