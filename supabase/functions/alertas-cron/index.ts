// Supabase Edge Function: genera alertas (vencimiento contrato, alquiler, pago vencido, aumento).
// Invocar por cron (Supabase Cron o externo) con POST y opcional Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const today = new Date();
  const todayDay = today.getDate();

  const { data: contratos } = await supabase
    .from("contratos")
    .select("id, fecha_fin, dia_vencimiento, fecha_inicio, incremento_cada_meses")
    .eq("estado", "activo");

  let insertadas = 0;

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
        .gte("fecha_generada", new Date(today.getTime() - 86400000).toISOString())
        .limit(1)
        .maybeSingle();
      if (!existente) {
        await supabase.from("alertas").insert({ contrato_id: c.id, tipo, mensaje });
        insertadas++;
      }
    }

    if (c.dia_vencimiento === todayDay || c.dia_vencimiento === todayDay - 1) {
      const mensaje = c.dia_vencimiento === todayDay ? "Vence el alquiler hoy." : "Vence el alquiler mañana.";
      const { data: existente } = await supabase
        .from("alertas")
        .select("id")
        .eq("contrato_id", c.id)
        .eq("tipo", "vencimiento_alquiler")
        .gte("fecha_generada", new Date(today.getTime() - 86400000).toISOString())
        .limit(1)
        .maybeSingle();
      if (!existente) {
        await supabase.from("alertas").insert({ contrato_id: c.id, tipo: "vencimiento_alquiler", mensaje });
        insertadas++;
      }
    }

    const mesActual = new Date(today.getFullYear(), today.getMonth(), 1);
    const mesAnterior = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const { data: pagos } = await supabase
      .from("pagos")
      .select("mes_adeudado")
      .eq("contrato_id", c.id);
    const pagados = (pagos ?? []).map((p: { mes_adeudado: string }) => String(p.mes_adeudado).slice(0, 7));
    if (todayDay > c.dia_vencimiento) {
      for (const mes of [mesAnterior, mesActual]) {
        const mesStr = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, "0")}`;
        if (pagados.includes(mesStr)) continue;
        const { data: existente } = await supabase
          .from("alertas")
          .select("id")
          .eq("contrato_id", c.id)
          .eq("tipo", "pago_vencido")
          .gte("fecha_generada", new Date(mes.getFullYear(), mes.getMonth() + 1, 1).toISOString().slice(0, 10))
          .limit(1)
          .maybeSingle();
        if (!existente) {
          await supabase.from("alertas").insert({
            contrato_id: c.id,
            tipo: "pago_vencido",
            mensaje: `Pago vencido: mes ${mesStr}.`,
          });
          insertadas++;
        }
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, insertadas }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
