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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="page-title">Alertas</h1>
          <p className="page-subtitle">
            {sinLeer > 0
              ? `${sinLeer} alerta(s) sin leer`
              : "Avisos de vencimientos, pagos y renovaciones"}
          </p>
        </div>
        {sinLeer > 0 && <MarcarAlertasLeidas />}
      </div>
      <div className="table-container">
        <table className="w-full text-left min-w-[560px]">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Fecha</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Tipo</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Contrato</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Mensaje</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 w-24">Leída</th>
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
                    className={`border-b border-slate-100 dark:border-slate-700 ${!a.leida ? "bg-amber-50/50 dark:bg-amber-900/20" : ""}`}
                  >
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                      {format(new Date(a.fecha_generada), "dd/MM/yyyy HH:mm", { locale: es })}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {TIPO_LABEL[a.tipo] ?? a.tipo}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                      {direccion ?? "—"}
                      {nombreInq && (
                        <span className="text-slate-400 dark:text-slate-500"> / {nombreInq}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{a.mensaje}</td>
                    <td className="px-4 py-3">
                      {a.leida ? (
                        <span className="text-slate-400 dark:text-slate-500 text-sm">Sí</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        {(!list || list.length === 0) && (
          <div className="px-4 py-12 text-slate-500 dark:text-slate-400 text-center">
            No hay alertas. Las alertas se generan automáticamente (cron) o al registrar vencimientos.
          </div>
        )}
      </div>
    </div>
  );
}
