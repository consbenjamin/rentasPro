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
  row: { flexDirection: "row", marginBottom: 6 },
  label: { width: 180, fontSize: 10, color: "#666" },
  value: { fontSize: 10, flex: 1 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingVertical: 6, marginTop: 16 },
  tableRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  col1: { width: "40%", fontSize: 10 },
  col2: { width: "20%", fontSize: 10 },
  col3: { width: "20%", fontSize: 10 },
  col4: { width: "20%", fontSize: 10 },
  total: { marginTop: 16, fontSize: 12, fontWeight: "bold" },
  footer: { marginTop: 30, fontSize: 8, color: "#999" },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propietarioId = searchParams.get("propietario_id");
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  if (!propietarioId || !desde || !hasta) {
    return NextResponse.json(
      { error: "Faltan propietario_id, desde o hasta (yyyy-MM-dd)" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: propietario } = await supabase
    .from("propietarios")
    .select("nombre")
    .eq("id", propietarioId)
    .single();

  if (!propietario) {
    return NextResponse.json({ error: "Propietario no encontrado" }, { status: 404 });
  }

  const { data: contratosDelProp } = await supabase
    .from("contratos")
    .select("id")
    .eq("propietario_id", propietarioId);
  const idsContratos = (contratosDelProp ?? []).map((c) => c.id);

  if (idsContratos.length === 0) {
    const LiquidacionVacia = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>LIQUIDACIÓN AL PROPIETARIO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Propietario:</Text>
            <Text style={styles.value}>{(propietario as { nombre: string }).nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Período:</Text>
            <Text style={styles.value}>{desde} – {hasta}</Text>
          </View>
          <Text style={styles.total}>Sin movimientos en el período.</Text>
        </Page>
      </Document>
    );
    const blob = await pdf(<LiquidacionVacia />).toBlob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="liquidacion-${propietarioId.slice(0, 8)}.pdf"`,
      },
    });
  }

  const { data: todosPagos } = await supabase
    .from("pagos")
    .select("contrato_id, monto, fecha_pago, mes_adeudado")
    .in("contrato_id", idsContratos)
    .gte("fecha_pago", desde)
    .lte("fecha_pago", hasta)
    .not("fecha_pago", "is", null);

  const totalCobrado = (todosPagos ?? []).reduce((sum, p) => sum + Number(p.monto), 0);
  const comision = 0;
  const gastos = 0;
  const neto = totalCobrado - comision - gastos;

  const Liquidacion = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>LIQUIDACIÓN AL PROPIETARIO</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Propietario:</Text>
          <Text style={styles.value}>{(propietario as { nombre: string }).nombre}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Período:</Text>
          <Text style={styles.value}>
            {format(new Date(desde), "dd/MM/yyyy", { locale: es })} –{" "}
            {format(new Date(hasta), "dd/MM/yyyy", { locale: es })}
          </Text>
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Propiedad / Inquilino</Text>
          <Text style={styles.col2}>Mes</Text>
          <Text style={styles.col3}>Monto</Text>
          <Text style={styles.col4}>Fecha pago</Text>
        </View>
        {(todosPagos ?? []).map((p: { contrato_id: string; monto: number; mes_adeudado: string; fecha_pago: string | null }) => (
          <View key={p.contrato_id + p.mes_adeudado} style={styles.tableRow}>
            <Text style={styles.col1}>—</Text>
            <Text style={styles.col2}>
              {format(new Date(p.mes_adeudado), "MM/yyyy", { locale: es })}
            </Text>
            <Text style={styles.col3}>${Number(p.monto).toLocaleString("es-AR")}</Text>
            <Text style={styles.col4}>
              {p.fecha_pago ? format(new Date(p.fecha_pago), "dd/MM/yyyy", { locale: es }) : "—"}
            </Text>
          </View>
        ))}
        <View style={styles.row}>
          <Text style={styles.label}>Total cobrado:</Text>
          <Text style={styles.value}>${totalCobrado.toLocaleString("es-AR")}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Comisión:</Text>
          <Text style={styles.value}>${comision.toLocaleString("es-AR")}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gastos:</Text>
          <Text style={styles.value}>${gastos.toLocaleString("es-AR")}</Text>
        </View>
        <Text style={styles.total}>Neto a transferir: ${neto.toLocaleString("es-AR")}</Text>
        <Text style={styles.footer}>
          Documento generado el {format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}. Rentas Pro.
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(<Liquidacion />).toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="liquidacion-${propietarioId.slice(0, 8)}.pdf"`,
    },
  });
}
