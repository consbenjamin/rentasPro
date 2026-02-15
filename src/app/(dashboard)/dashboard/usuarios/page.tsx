import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { UsuarioRow } from "@/components/UsuarioRow";
import { InvitarUsuarioForm } from "@/components/InvitarUsuarioForm";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", session.user.id)
    .single();
  if (myProfile?.rol !== "admin") redirect("/dashboard");

  const [{ data: profiles }, { data: propietarios }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, rol, nombre, propietario_id, propietarios(nombre)")
      .order("rol"),
    supabase.from("propietarios").select("id, nombre").order("nombre"),
  ]);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="page-title">Usuarios y roles</h1>
        <p className="page-subtitle">
          Invitá usuarios, asigná roles y permisos, y gestioná el acceso al sistema.
        </p>
      </div>

      <InvitarUsuarioForm propietarios={propietarios ?? []} className="mb-6" />

      <div className="table-container">
        {profiles && profiles.length > 0 ? (
          <table className="w-full text-left min-w-[520px]">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Nombre / ID</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Rol</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300">Propietario vinculado</th>
                <th className="px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <UsuarioRow
                  key={p.id}
                  id={p.id}
                  nombre={p.nombre}
                  rol={p.rol}
                  propietarioId={p.propietario_id}
                  propietarioNombre={Array.isArray(p.propietarios) ? (p.propietarios[0] as { nombre: string })?.nombre : (p.propietarios as { nombre: string } | null)?.nombre ?? null}
                  propietarios={propietarios ?? []}
                  isAdmin={true}
                  currentUserId={session.user.id}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-12 text-slate-500 dark:text-slate-400 text-center">
            No hay perfiles de usuario.
          </div>
        )}
      </div>
    </div>
  );
}
