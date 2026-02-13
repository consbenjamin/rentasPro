import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 20, fontWeight: "bold" },
  row: { flexDirection: "row", marginBottom: 8 },
  label: { width: 140, fontSize: 10, color: "#666" },
  value: { fontSize: 10, flex: 1 },
  footer: { marginTop: 30, fontSize: 8, color: "#999" },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagoId = searchParams.get("pago_id");
  const contratoId = searchParams.get("contrato_id");
  const mes = searchParams.get("mes");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let pago: { id: string; monto: number; fecha_pago: string | null; mes_adeudado: string } | null = null;
  let contrato: {
    propiedades: { direccion: string } | null;
    inquilinos: { nombre: string; email: string | null } | null;
    propietarios: { nombre: string } | null;
    monto_mensual: number;
  } | null = null;

  if (pagoId) {
    const { data: p } = await supabase
      .from("pagos")
      .select("id, monto, fecha_pago, mes_adeudado, contrato_id")
      .eq("id", pagoId)
      .single();
    if (p) {
      pago = p;
      const { data: c } = await supabase
        .from("contratos")
        .select("monto_mensual, propiedades(direccion), inquilinos(nombre, email), propietarios(nombre)")
        .eq("id", p.contrato_id)
        .single();
      contrato = (c ?? null) as typeof contrato;
    }
  } else if (contratoId && mes) {
    const mesStr = `${mes}-01`;
    const { data: p } = await supabase
      .from("pagos")
      .select("id, monto, fecha_pago, mes_adeudado")
      .eq("contrato_id", contratoId)
      .eq("mes_adeudado", mesStr)
      .maybeSingle();
    pago = p ?? null;
    const { data: c } = await supabase
      .from("contratos")
      .select("monto_mensual, propiedades(direccion), inquilinos(nombre, email), propietarios(nombre)")
      .eq("id", contratoId)
      .single();
    contrato = (c ?? null) as typeof contrato;
  }

  if (!pago || !contrato) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  const c = contrato as { propiedades?: { direccion: string } | { direccion: string }[] | null; inquilinos?: { nombre: string } | { nombre: string }[] | null };
  const prop = c.propiedades;
  const inqu = c.inquilinos;
  const direccion = Array.isArray(prop) ? prop[0]?.direccion : prop?.direccion;
  const nombreInq = Array.isArray(inqu) ? inqu[0]?.nombre : inqu?.nombre;
  const Recibo = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>RECIBO DE PAGO DE ALQUILER</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Inquilino:</Text>
          <Text style={styles.value}>{nombreInq ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Propiedad:</Text>
          <Text style={styles.value}>{direccion ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Período:</Text>
          <Text style={styles.value}>
            {format(new Date(pago.mes_adeudado), "MMMM yyyy", { locale: es })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Monto:</Text>
          <Text style={styles.value}>${Number(pago.monto).toLocaleString("es-AR")}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha de pago:</Text>
          <Text style={styles.value}>
            {pago.fecha_pago
              ? format(new Date(pago.fecha_pago), "dd/MM/yyyy", { locale: es })
              : "—"}
          </Text>
        </View>
        <Text style={styles.footer}>
          Documento generado el {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}. Rentas Pro.
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(<Recibo />).toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-${pago.id.slice(0, 8)}.pdf"`,
    },
  });
}
