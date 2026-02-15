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

  const [{ data: profiles }, { data: propietarios }, { data: pendientes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, rol, nombre, propietario_id, propietarios(nombre)")
      .order("rol"),
    supabase.from("propietarios").select("id, nombre").order("nombre"),
    supabase.from("usuarios_pendientes").select("email, nombre, rol, created_at").order("created_at", { ascending: false }),
  ]);

  const ROL_LABEL: Record<string, string> = {
    admin: "Admin",
    operador: "Operador",
    owner: "Propietario",
    viewer: "Solo lectura",
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="page-title">Usuarios y roles</h1>
        <p className="page-subtitle">
          Agregá usuarios (email, nombre y rol). Cada uno debe registrarse en la app con su correo y elegir su contraseña para iniciar sesión.
        </p>
      </div>

      <InvitarUsuarioForm propietarios={propietarios ?? []} className="mb-6" />

      {pendientes && pendientes.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-4">
          <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Pendientes de registro</h2>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
            Estos correos están dados de alta. Deben ir a <strong>Registro</strong> e ingresar su email y contraseña para poder entrar.
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            {pendientes.map((u) => (
              <li key={u.email}>
                <span className="font-medium text-slate-800 dark:text-slate-200">{u.email}</span>
                {u.nombre && <span className="text-slate-500 dark:text-slate-400"> — {u.nombre}</span>}
                <span className="text-slate-500 dark:text-slate-400"> ({ROL_LABEL[u.rol] ?? u.rol})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
