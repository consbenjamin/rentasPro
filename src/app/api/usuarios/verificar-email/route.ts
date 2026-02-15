import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

/**
 * GET ?email=... — Público: verifica si el email está en usuarios_pendientes.
 * Solo devuelve si está pendiente y el nombre (para mostrar en el formulario de registro).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = typeof searchParams.get("email") === "string" ? searchParams.get("email")!.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ pendiente: false });
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("usuarios_pendientes")
    .select("nombre")
    .eq("email", email)
    .single();

  if (!row) {
    return NextResponse.json({ pendiente: false });
  }
  return NextResponse.json({ pendiente: true, nombre: row.nombre ?? undefined });
}
