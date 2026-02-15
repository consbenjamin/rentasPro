import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import type { RolUsuario } from "@/types/database";

const ROLES: RolUsuario[] = ["admin", "operador", "owner", "viewer"];

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
    return NextResponse.json({ error: "Solo un admin puede invitar usuarios" }, { status: 403 });
  }

  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const rol = ROLES.includes(body?.rol) ? body.rol : "viewer";
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : null;
  const propietario_id = typeof body?.propietario_id === "string" && body.propietario_id ? body.propietario_id : null;

  if (!email) {
    return NextResponse.json({ error: "El email es obligatorio" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";
  const redirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback`;

  const admin = createAdminClient();
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: nombre ? { nombre } : undefined,
    redirectTo,
  });

  if (inviteError) {
    console.error("[invite] Supabase inviteUserByEmail:", inviteError.message, inviteError);
    return NextResponse.json(
      { error: inviteError.message || "Error al enviar la invitación" },
      { status: 400 }
    );
  }

  const userId = inviteData?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No se pudo obtener el usuario creado" }, { status: 500 });
  }

  const update: { rol: RolUsuario; nombre?: string; propietario_id?: string | null; updated_at: string } = {
    rol,
    updated_at: new Date().toISOString(),
  };
  if (nombre) update.nombre = nombre;
  if (rol === "owner" && propietario_id) update.propietario_id = propietario_id;
  else if (rol !== "owner") update.propietario_id = null;

  const { error: updateError } = await admin
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json(
      { error: "Usuario invitado pero falló asignar rol: " + updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, user_id: userId });
}
