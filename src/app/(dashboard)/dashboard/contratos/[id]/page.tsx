import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { EstadoContrato } from "@/types/database";

const ESTADO: Record<EstadoContrato, string> = {
  activo: "Activo",
  finalizado: "Finalizado",
  rescindido: "Rescindido",
};

export default async function VerContratoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contrato } = await supabase
    .from("contratos")
    .select(`
      *,
      propiedades(direccion, tipo),
      inquilinos(nombre, email, telefono),
      propietarios(nombre)
    `)
    .eq("id", id)
    .single();
  if (!contrato) notFound();

  const p = contrato.propiedades as { direccion: string; tipo: string } | null;
  const i = contrato.inquilinos as { nombre: string; email: string | null; telefono: string | null } | null;
  const o = contrato.propietarios as { nombre: string } | null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Contrato</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/contratos/${id}/editar`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Editar
          </Link>
          <Link
            href="/dashboard/pagos"
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Ver pagos
          </Link>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Propiedad</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{p?.direccion ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Inquilino</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{i?.nombre ?? "—"}</p>
            {i?.email && <p className="text-sm text-slate-600 dark:text-slate-400">{i.email}</p>}
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Propietario</p>
            <p className="font-medium text-slate-900 dark:text-slate-100">{o?.nombre ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Estado</p>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                contrato.estado === "activo"
                  ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                  : contrato.estado === "finalizado"
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
              }`}
            >
              {ESTADO[contrato.estado as EstadoContrato]}
            </span>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-600 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Inicio / Fin</p>
            <p className="text-slate-700 dark:text-slate-300">
              {format(new Date(contrato.fecha_inicio), "dd/MM/yyyy", { locale: es })} –{" "}
              {format(new Date(contrato.fecha_fin), "dd/MM/yyyy", { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monto mensual</p>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              ${Number(contrato.monto_mensual).toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Día de vencimiento</p>
            <p className="text-slate-700 dark:text-slate-300">{contrato.dia_vencimiento}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Depósito</p>
            <p className="text-slate-700 dark:text-slate-300">
              {contrato.deposito != null ? `$${Number(contrato.deposito).toLocaleString("es-AR")}` : "—"}
            </p>
          </div>
          {(contrato.incremento_cada_meses != null || contrato.incremento_valor != null) && (
            <div className="sm:col-span-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Incremento</p>
              <p className="text-slate-700 dark:text-slate-300">
                Cada {contrato.incremento_cada_meses} meses:{" "}
                {contrato.incremento_tipo === "porcentaje"
                  ? `${contrato.incremento_valor}%`
                  : `$${Number(contrato.incremento_valor).toLocaleString("es-AR")}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
