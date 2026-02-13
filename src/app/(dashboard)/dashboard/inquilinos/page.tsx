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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inquilinos</h1>
        <Link
          href="/dashboard/inquilinos/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Nuevo inquilino
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Nombre</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">DNI/CUIT</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Teléfono</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-20" />
            </tr>
          </thead>
          <tbody>
            {(list ?? []).map((i) => (
              <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">{i.nombre}</td>
                <td className="px-4 py-3 text-slate-600">{i.dni_cuit ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{i.email ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{i.telefono ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/inquilinos/${i.id}`}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!list || list.length === 0) && (
          <p className="px-4 py-8 text-slate-500 text-center">
            No hay inquilinos. Creá uno desde &quot;Nuevo inquilino&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
