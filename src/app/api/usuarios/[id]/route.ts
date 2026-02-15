import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.id === id) {
    return NextResponse.json(
      { error: "No puedes eliminar tu propio usuario" },
      { status: 400 }
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", session.user.id)
    .single();
  if (profile?.rol !== "admin") {
    return NextResponse.json({ error: "Solo un admin puede eliminar usuarios" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json(
      { error: error.message || "Error al eliminar el usuario" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
