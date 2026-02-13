import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { startOfMonth, addMonths, addDays, isWithinInterval } from "date-fns";

/**
 * Cron job: crear alertas en la tabla alertas.
 * Llamar con GET o POST (ej. Vercel Cron: GET cada día).
 * Opcional: header Authorization: Bearer CRON_SECRET para proteger.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date();
  const todayDay = today.getDate();

  const { data: contratos } = await supabase
    .from("contratos")
    .select("id, fecha_fin, dia_vencimiento, fecha_inicio, incremento_cada_meses, incremento_valor, incremento_tipo")
    .eq("estado", "activo");

  const insertadas: string[] = [];

  for (const c of contratos ?? []) {
    const fechaFin = new Date(c.fecha_fin);
    const diasRestantes = Math.ceil((fechaFin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes > 0 && diasRestantes <= 30) {
      const mensaje =
        diasRestantes <= 7
          ? `Faltan ${diasRestantes} días para el vencimiento del contrato.`
          : `El contrato vence en ${diasRestantes} días. Renovación sugerida.`;
      const tipo = diasRestantes <= 7 ? "vencimiento_contrato" : "renovacion";
      const { data: existente } = await supabase
        .from("alertas")
        .select("id")
        .eq("contrato_id", c.id)
        .eq("tipo", tipo)
        .gte("fecha_generada", new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
        .maybeSingle();
      if (!existente) {
        await supabase.from("alertas").insert({
          contrato_id: c.id,
          tipo,
          mensaje,
        });
        insertadas.push(c.id);
      }
    }

    if (c.dia_vencimiento === todayDay || c.dia_vencimiento === todayDay - 1) {
      const mensaje =
        c.dia_vencimiento === todayDay
          ? "Vence el alquiler hoy."
          : "Vence el alquiler mañana.";
      const { data: existente } = await supabase
        .from("alertas")
        .select("id")
        .eq("contrato_id", c.id)
        .eq("tipo", "vencimiento_alquiler")
        .gte("fecha_generada", new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
        .maybeSingle();
      if (!existente) {
        await supabase.from("alertas").insert({
          contrato_id: c.id,
          tipo: "vencimiento_alquiler",
          mensaje,
        });
        insertadas.push(c.id);
      }
    }

    const mesActual = startOfMonth(today);
    const mesAnterior = addMonths(mesActual, -1);
    const { data: pagos } = await supabase
      .from("pagos")
      .select("mes_adeudado")
      .eq("contrato_id", c.id)
      .in("mes_adeudado", [
        mesActual.toISOString().slice(0, 10),
        mesAnterior.toISOString().slice(0, 10),
      ]);
    const pagados = (pagos ?? []).map((p) => String(p.mes_adeudado).slice(0, 7));
    if (todayDay > c.dia_vencimiento) {
      for (const mes of [mesAnterior, mesActual]) {
        const mesStr = mes.toISOString().slice(0, 7);
        if (pagados.includes(mesStr)) continue;
        const { data: existente } = await supabase
          .from("alertas")
          .select("id")
          .eq("contrato_id", c.id)
          .eq("tipo", "pago_vencido")
          .gte("fecha_generada", addMonths(mes, 1).toISOString().slice(0, 10))
          .limit(1)
          .maybeSingle();
        if (!existente) {
          await supabase.from("alertas").insert({
            contrato_id: c.id,
            tipo: "pago_vencido",
            mensaje: `Pago vencido: mes ${mesStr}.`,
          });
          insertadas.push(c.id);
        }
      }
    }

    if (c.incremento_cada_meses && c.fecha_inicio) {
      const inicio = new Date(c.fecha_inicio);
      let next = addMonths(inicio, c.incremento_cada_meses);
      while (next <= today) {
        next = addMonths(next, c.incremento_cada_meses);
      }
      const prev = addMonths(next, -c.incremento_cada_meses);
      if (isWithinInterval(today, { start: prev, end: addDays(prev, 31) })) {
        const { data: existente } = await supabase
          .from("alertas")
          .select("id")
          .eq("contrato_id", c.id)
          .eq("tipo", "aumento")
          .gte("fecha_generada", today.toISOString().slice(0, 10))
          .limit(1)
          .maybeSingle();
        if (!existente) {
          await supabase.from("alertas").insert({
            contrato_id: c.id,
            tipo: "aumento",
            mensaje: "Este mes corresponde aumento según contrato.",
          });
          insertadas.push(c.id);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, insertadas: insertadas.length });
}
