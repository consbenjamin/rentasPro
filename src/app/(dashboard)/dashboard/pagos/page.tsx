import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { format, startOfMonth, addMonths } from "date-fns";
import { es } from "date-fns/locale";

export default async function PagosPage() {
  const supabase = await createClient();
  const { data: contratos } = await supabase
    .from("contratos")
    .select("id, monto_mensual, dia_vencimiento, propiedades(direccion), inquilinos(nombre)")
    .eq("estado", "activo");

  const { data: pagos } = await supabase.from("pagos").select("id, contrato_id, mes_adeudado, monto, fecha_pago");

  const now = new Date();
  const mesActual = startOfMonth(now);
  const mesAnterior = addMonths(mesActual, -1);

  type DeudaRow = {
    contrato_id: string;
    direccion: string;
    inquilino: string;
    monto_mensual: number;
    dia_vencimiento: number;
    mes_adeudado: string;
    pagado: boolean;
    pago_id?: string;
    monto_pagado?: number;
    fecha_pago?: string | null;
  };

  const filas: DeudaRow[] = [];
  for (const c of contratos ?? []) {
    const propRaw = c.propiedades;
    const inquRaw = c.inquilinos;
    const prop = Array.isArray(propRaw) ? (propRaw[0] as { direccion: string } | undefined) : (propRaw as { direccion: string } | null);
    const inqu = Array.isArray(inquRaw) ? (inquRaw[0] as { nombre: string } | undefined) : (inquRaw as { nombre: string } | null);
    for (const mes of [mesAnterior, mesActual]) {
      const mesStr = format(mes, "yyyy-MM-dd");
      const p = (pagos ?? []).find(
        (x) => x.contrato_id === c.id && String(x.mes_adeudado).slice(0, 7) === mesStr.slice(0, 7)
      );
      filas.push({
        contrato_id: c.id,
    direccion: (prop as { direccion?: string } | null)?.direccion ?? "—",
    inquilino: (inqu as { nombre?: string } | null)?.nombre ?? "—",
        monto_mensual: Number(c.monto_mensual),
        dia_vencimiento: c.dia_vencimiento,
        mes_adeudado: mesStr,
        pagado: !!p,
        pago_id: p?.id,
        monto_pagado: p?.monto,
        fecha_pago: p?.fecha_pago,
      });
    }
  }
  const alDia = filas.filter((f) => f.pagado).length;
  const debe = filas.filter((f) => !f.pagado).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pagos y deuda</h1>
        <Link
          href="/dashboard/pagos/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-fit"
        >
          Registrar pago
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Al día (este y pasado mes)</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{alDia}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Deben (este o pasado mes)</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{debe}</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="bg-white dark:bg-slate-800 min-w-[640px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Propiedad / Inquilino</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Mes</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Monto</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Estado</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-24" />
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={`${f.contrato_id}-${f.mes_adeudado}`} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{f.direccion}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{f.inquilino}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {format(new Date(f.mes_adeudado), "MMMM yyyy", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    ${f.monto_mensual.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    {f.pagado ? (
                      <span className="text-green-600 dark:text-green-400 text-sm">
                        Pagado{f.fecha_pago ? ` ${format(new Date(f.fecha_pago), "dd/MM/yyyy")}` : ""}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 text-sm">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {f.pagado && f.pago_id ? (
                      <a
                        href={`/api/pdf/recibo?pago_id=${f.pago_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                      >
                        Recibo
                      </a>
                    ) : !f.pagado ? (
                      <Link
                        href={`/dashboard/pagos/nuevo?contrato=${f.contrato_id}&mes=${f.mes_adeudado.slice(0, 7)}`}
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                      >
                        Registrar
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filas.length === 0 && (
            <p className="px-4 py-8 text-slate-500 dark:text-slate-400 text-center">
              No hay contratos activos para mostrar pagos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
