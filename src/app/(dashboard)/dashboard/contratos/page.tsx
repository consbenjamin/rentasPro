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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Contratos</h1>
        <Link
          href="/dashboard/contratos/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Nuevo contrato
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Propiedad</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Inquilino</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Inicio / Fin</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Monto</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Estado</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-20" />
            </tr>
          </thead>
          <tbody>
            {(list ?? []).map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-800">
                  {Array.isArray(c.propiedades) ? (c.propiedades[0] as { direccion: string })?.direccion : (c.propiedades as { direccion: string } | null)?.direccion ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {Array.isArray(c.inquilinos) ? (c.inquilinos[0] as { nombre: string })?.nombre : (c.inquilinos as { nombre: string } | null)?.nombre ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600 text-sm">
                  {format(new Date(c.fecha_inicio), "dd/MM/yyyy", { locale: es })} –{" "}
                  {format(new Date(c.fecha_fin), "dd/MM/yyyy", { locale: es })}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  ${Number(c.monto_mensual).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      c.estado === "activo"
                        ? "bg-green-100 text-green-800"
                        : c.estado === "finalizado"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ESTADO[c.estado as EstadoContrato]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/contratos/${c.id}`}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!list || list.length === 0) && (
          <p className="px-4 py-8 text-slate-500 text-center">
            No hay contratos. Creá uno desde &quot;Nuevo contrato&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
