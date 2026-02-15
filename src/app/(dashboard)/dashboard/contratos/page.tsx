import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { EstadoContrato } from "@/types/database";

const ESTADO: Record<EstadoContrato, string> = {
  activo: "Activo",
  finalizado: "Finalizado",
  rescindido: "Rescindido",
};

export default async function ContratosPage() {
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("contratos")
    .select(`
      id,
      fecha_inicio,
      fecha_fin,
      monto_mensual,
      estado,
      propiedades(direccion),
      inquilinos(nombre),
      propietarios(nombre)
    `)
    .order("fecha_fin", { ascending: false });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="page-title">Contratos</h1>
          <p className="page-subtitle">Contratos de alquiler activos y finalizados</p>
        </div>
        <Link href="/dashboard/contratos/nuevo" className="btn-primary w-fit shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo contrato
        </Link>
      </div>
      <div className="table-container">
        <table className="w-full text-left min-w-[640px]">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Propiedad</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Inquilino</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Inicio / Fin</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Monto</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 w-24" />
              </tr>
            </thead>
            <tbody>
              {(list ?? []).map((c) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                    {Array.isArray(c.propiedades) ? (c.propiedades[0] as { direccion: string })?.direccion : (c.propiedades as { direccion: string } | null)?.direccion ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {Array.isArray(c.inquilinos) ? (c.inquilinos[0] as { nombre: string })?.nombre : (c.inquilinos as { nombre: string } | null)?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                    {format(new Date(c.fecha_inicio), "dd/MM/yyyy", { locale: es })} –{" "}
                    {format(new Date(c.fecha_fin), "dd/MM/yyyy", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    ${Number(c.monto_mensual).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        c.estado === "activo"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                          : c.estado === "finalizado"
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {ESTADO[c.estado as EstadoContrato]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/contratos/${c.id}`}
                      className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        {(!list || list.length === 0) && (
          <div className="px-4 py-12 text-slate-500 dark:text-slate-400 text-center">
            No hay contratos. Creá uno desde &quot;Nuevo contrato&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
