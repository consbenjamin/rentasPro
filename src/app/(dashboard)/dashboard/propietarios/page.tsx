import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function PropietariosPage() {
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("propietarios")
    .select("*")
    .order("nombre");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Propietarios</h1>
        <Link
          href="/dashboard/propietarios/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-fit"
        >
          Nuevo propietario
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="bg-white dark:bg-slate-800 min-w-[480px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Nombre</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">DNI/CUIT</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Contacto</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-20" />
              </tr>
            </thead>
            <tbody>
              {(list ?? []).map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{p.nombre}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.dni_cuit ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.contacto ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/propietarios/${p.id}`}
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
              No hay propietarios. Creá uno desde &quot;Nuevo propietario&quot;.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
