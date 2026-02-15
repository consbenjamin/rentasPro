import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

/**
 * POST: Usuario recién registrado (ya autenticado). Si su email está en usuarios_pendientes,
 * actualiza su profile (rol, nombre, propietario_id) y elimina el registro pendiente.
 * Idempotente: si ya no está pendiente, responde 200 sin cambios.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const email = user.email.trim().toLowerCase();
  const { data: pendiente, error: fetchError } = await admin
    .from("usuarios_pendientes")
    .select("rol, nombre, propietario_id")
    .eq("email", email)
    .single();

  if (fetchError || !pendiente) {
    return NextResponse.json({ ok: true, updated: false }); // ya completado o no estaba pendiente
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      rol: pendiente.rol,
      nombre: pendiente.nombre ?? undefined,
      propietario_id: pendiente.propietario_id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("[completar-registro] update profile:", updateError);
    return NextResponse.json(
      { error: updateError.message || "Error al completar el registro" },
      { status: 500 }
    );
  }

  await admin.from("usuarios_pendientes").delete().eq("email", email);

  return NextResponse.json({ ok: true, updated: true });
}
