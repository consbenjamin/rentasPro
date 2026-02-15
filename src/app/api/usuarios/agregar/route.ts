import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import type { RolUsuario } from "@/types/database";

const ROLES: RolUsuario[] = ["admin", "operador", "owner", "viewer"];

/**
 * POST: Admin agrega un usuario pendiente (email, nombre, rol).
 * El usuario deberá registrarse en /registro con ese email y elegir su contraseña.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (profile?.rol !== "admin") {
    return NextResponse.json({ error: "Solo un admin puede agregar usuarios" }, { status: 403 });
  }

  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const rol = ROLES.includes(body?.rol) ? body.rol : "viewer";
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() || null : null;
  const propietario_id =
    typeof body?.propietario_id === "string" && body.propietario_id ? body.propietario_id : null;

  if (!email) {
    return NextResponse.json({ error: "El email es obligatorio" }, { status: 400 });
  }

  const admin = createAdminClient();

  // No permitir duplicados ni emails ya registrados en auth
  const { data: existing } = await admin.from("usuarios_pendientes").select("id").eq("email", email).single();
  if (existing) {
    return NextResponse.json({ error: "Ese correo ya está en la lista de usuarios pendientes." }, { status: 400 });
  }

  const { error: insertError } = await admin.from("usuarios_pendientes").insert({
    email,
    nombre,
    rol,
    propietario_id: rol === "owner" && propietario_id ? propietario_id : null,
  });

  if (insertError) {
    console.error("[agregar] insert usuarios_pendientes:", insertError);
    return NextResponse.json(
      { error: insertError.message || "Error al agregar usuario" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
