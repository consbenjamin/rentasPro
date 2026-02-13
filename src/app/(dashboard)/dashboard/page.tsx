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
  const disponibles = (propiedades ?? []).filter((p) => p.estado === "disponible").length;
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
    { title: "Ingresos del mes", value: `$${ingresosMes.toLocaleString("es-AR")}`, href: "/dashboard/pagos" },
    { title: "Ingresos acumulado", value: `$${ingresosAcumulado.toLocaleString("es-AR")}`, href: "/dashboard/pagos" },
    { title: "Morosidad", value: `${morosidadCount} contrato(s) · $${morosidadMonto.toLocaleString("es-AR")}`, href: "/dashboard/pagos" },
    { title: "Contratos por vencer (7 / 30 / 60 días)", value: `${vencen7} / ${vencen30} / ${vencen60}`, href: "/dashboard/contratos" },
    { title: "Ocupación", value: `${ocupacion}% (${alquiladas}/${totalProp})`, href: "/dashboard/propiedades" },
    { title: "Alertas sin leer", value: String(countAlertas ?? 0), href: "/dashboard/alertas" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map(({ title, value, href }) => (
          <Link
            key={title}
            href={href}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm hover:shadow transition"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm">{title}</p>
            <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 break-words">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
