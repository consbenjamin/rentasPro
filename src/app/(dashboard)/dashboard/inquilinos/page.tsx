import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function InquilinosPage() {
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("inquilinos")
    .select("*")
    .order("nombre");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="page-title">Inquilinos</h1>
          <p className="page-subtitle">Lista de inquilinos registrados</p>
        </div>
        <Link href="/dashboard/inquilinos/nuevo" className="btn-primary w-fit shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo inquilino
        </Link>
      </div>
      <div className="table-container">
        <table className="w-full text-left min-w-[560px]">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Nombre</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">DNI/CUIT</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Email</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Teléfono</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 w-24" />
              </tr>
            </thead>
            <tbody>
              {(list ?? []).map((i) => (
                <tr key={i.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{i.nombre}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{i.dni_cuit ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{i.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{i.telefono ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/inquilinos/${i.id}`}
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
            No hay inquilinos. Creá uno desde &quot;Nuevo inquilino&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
