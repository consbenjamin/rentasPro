import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import type { EstadoPropiedad, TipoPropiedad } from "@/types/database";

const ESTADO: Record<EstadoPropiedad, string> = {
  disponible: "Disponible",
  alquilada: "Alquilada",
  en_mantenimiento: "En mantenimiento",
};
const TIPO: Record<TipoPropiedad, string> = {
  depto: "Depto",
  casa: "Casa",
  local: "Local",
};

export default async function PropiedadesPage() {
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("propiedades")
    .select("*, propietarios(nombre)")
    .order("direccion");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="page-title">Propiedades</h1>
          <p className="page-subtitle">Gestiona tu cartera de inmuebles</p>
        </div>
        <Link href="/dashboard/propiedades/nueva" className="btn-primary w-fit shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva propiedad
        </Link>
      </div>
      <div className="table-container">
        <table className="w-full text-left min-w-[640px]">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Dirección</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Tipo</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Propietario</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Precio</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 w-24" />
              </tr>
            </thead>
            <tbody>
              {(list ?? []).map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{p.direccion}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{TIPO[p.tipo as TipoPropiedad]}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {Array.isArray(p.propietarios) ? (p.propietarios[0] as { nombre: string })?.nombre : (p.propietarios as { nombre: string } | null)?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        p.estado === "disponible"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                          : p.estado === "alquilada"
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                            : "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                      }`}
                    >
                      {ESTADO[p.estado as EstadoPropiedad]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {p.precio_actual != null ? `$${Number(p.precio_actual).toLocaleString("es-AR")}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/propiedades/${p.id}`}
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
            No hay propiedades. Creá una desde &quot;Nueva propiedad&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
