import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { startOfMonth, endOfMonth, addDays } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const inicioMes = startOfMonth(now);
  const finMes = endOfMonth(now);

  const [
    { data: pagosMes },
    { data: pagosTodos },
    { data: propiedades },
    { data: contratosActivos },
    { count: countAlertas },
  ] = await Promise.all([
    supabase
      .from("pagos")
      .select("monto")
      .gte("fecha_pago", inicioMes.toISOString().slice(0, 10))
      .lte("fecha_pago", finMes.toISOString().slice(0, 10))
      .not("fecha_pago", "is", null),
    supabase.from("pagos").select("monto").not("fecha_pago", "is", null),
    supabase.from("propiedades").select("estado"),
    supabase
      .from("contratos")
      .select("id, monto_mensual, dia_vencimiento, fecha_fin")
      .eq("estado", "activo"),
    supabase.from("alertas").select("id", { count: "exact", head: true }).eq("leida", false),
  ]);

  const ingresosMes = (pagosMes ?? []).reduce((s, p) => s + Number(p.monto), 0);
  const ingresosAcumulado = (pagosTodos ?? []).reduce((s, p) => s + Number(p.monto), 0);

  const totalProp = (propiedades ?? []).length;
  const alquiladas = (propiedades ?? []).filter((p) => p.estado === "alquilada").length;
  const ocupacion = totalProp > 0 ? Math.round((alquiladas / totalProp) * 100) : 0;

  const hoy = now.getTime();
  const unDia = 24 * 60 * 60 * 1000;
  let vencen7 = 0;
  let vencen30 = 0;
  let vencen60 = 0;
  for (const c of contratosActivos ?? []) {
    const fin = new Date(c.fecha_fin).getTime();
    const dias = (fin - hoy) / unDia;
    if (dias <= 7 && dias > 0) vencen7++;
    if (dias <= 30 && dias > 0) vencen30++;
    if (dias <= 60 && dias > 0) vencen60++;
  }

  const { data: pagosContratosActivos } = await supabase
    .from("pagos")
    .select("contrato_id, monto, mes_adeudado")
    .in(
      "contrato_id",
      (contratosActivos ?? []).map((x) => x.id)
    );

  const mesActualStr = now.toISOString().slice(0, 7);
  const mesAnteriorStr = startOfMonth(addDays(now, -30)).toISOString().slice(0, 7);
  let morosidadCount = 0;
  let morosidadMonto = 0;
  for (const c of contratosActivos ?? []) {
    const pagados = (pagosContratosActivos ?? [])
      .filter((p) => p.contrato_id === c.id)
      .map((p) => String(p.mes_adeudado).slice(0, 7));
    const debeActual = !pagados.includes(mesActualStr);
    const debeAnterior = !pagados.includes(mesAnteriorStr);
    if (now.getDate() > c.dia_vencimiento && (debeActual || debeAnterior)) {
      morosidadCount++;
      morosidadMonto += Number(c.monto_mensual) * (debeActual ? 1 : 0) + (debeAnterior ? 1 : 0) * Number(c.monto_mensual);
    }
  }

  const cards = [
    { title: "Ingresos cobrados este mes", value: `$${ingresosMes.toLocaleString("es-AR")}`, helper: "Pagos con fecha dentro del mes actual", href: "/dashboard/pagos" },
    { title: "Ingresos históricos cobrados", value: `$${ingresosAcumulado.toLocaleString("es-AR")}`, helper: "Total acumulado de pagos registrados", href: "/dashboard/pagos" },
    { title: "Ocupación actual", value: `${ocupacion}%`, helper: `${alquiladas} alquiladas de ${totalProp} propiedades`, href: "/dashboard/propiedades" },
    { title: "Alertas sin leer", value: String(countAlertas ?? 0), helper: "Recordatorios pendientes por revisar", href: "/dashboard/alertas" },
  ];

  const quickActions = [
    { href: "/dashboard/propiedades/nueva", label: "Nueva propiedad", detail: "Registrar una unidad nueva" },
    { href: "/dashboard/contratos/nuevo", label: "Nuevo contrato", detail: "Vincular inquilino y propiedad" },
    { href: "/dashboard/pagos/nuevo", label: "Registrar pago", detail: "Cargar pago recibido" },
    { href: "/dashboard/alertas", label: "Ver alertas", detail: "Priorizar pendientes críticos" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="page-title">Resumen operativo</h1>
        <p className="page-subtitle">Estado actual de cobros, contratos y seguimiento</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
          Indicadores clave
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {cards.map(({ title, value, helper, href }) => (
            <Link key={title} href={href} className="card group block overflow-hidden">
              <div className="card-body">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1.5 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {value}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{helper}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card lg:col-span-2">
          <div className="card-body">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Atención prioritaria
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/dashboard/pagos" className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Morosidad</p>
                <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {morosidadCount} contrato(s)
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">${morosidadMonto.toLocaleString("es-AR")}</p>
              </Link>
              <Link href="/dashboard/contratos" className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Vencen en 7 días</p>
                <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{vencen7}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Contratos próximos a finalizar</p>
              </Link>
              <Link href="/dashboard/contratos" className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Vencen en 30 días</p>
                <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{vencen30}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Para planificar renovaciones</p>
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              También hay {vencen60} contrato(s) que vencen en 60 días.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Acciones rápidas
            </h2>
            <div className="mt-3 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="block rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{action.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{action.detail}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
