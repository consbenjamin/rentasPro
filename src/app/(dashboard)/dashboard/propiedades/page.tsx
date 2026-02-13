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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Propiedades</h1>
        <Link
          href="/dashboard/propiedades/nueva"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-fit"
        >
          Nueva propiedad
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="bg-white dark:bg-slate-800 min-w-[640px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Dirección</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Tipo</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Propietario</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Estado</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Precio</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-20" />
              </tr>
            </thead>
            <tbody>
              {(list ?? []).map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
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
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!list || list.length === 0) && (
            <p className="px-4 py-8 text-slate-500 dark:text-slate-400 text-center">
              No hay propiedades. Creá una desde &quot;Nueva propiedad&quot;.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
