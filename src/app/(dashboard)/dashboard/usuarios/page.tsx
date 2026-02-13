import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { UsuarioRow } from "@/components/UsuarioRow";

const ROL_LABEL: Record<string, string> = {
  admin: "Admin",
  operador: "Operador",
  owner: "Propietario",
  viewer: "Solo lectura",
};

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, rol, nombre, propietario_id, propietarios(nombre)")
    .order("rol");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Usuarios y roles</h1>
      <p className="text-slate-600 text-sm mb-4">
        Los usuarios se crean desde Supabase Auth (Dashboard o signup). Aquí se listan los perfiles y se puede editar el rol.
      </p>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Nombre / ID</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Rol</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600">Propietario vinculado</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-600 w-24" />
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <UsuarioRow
                key={p.id}
                id={p.id}
                nombre={p.nombre}
                rol={p.rol}
                propietarioNombre={Array.isArray(p.propietarios) ? (p.propietarios[0] as { nombre: string })?.nombre : (p.propietarios as { nombre: string } | null)?.nombre ?? null}
              />
            ))}
          </tbody>
        </table>
        {(!profiles || profiles.length === 0) && (
          <p className="px-4 py-8 text-slate-500 text-center">No hay perfiles.</p>
        )}
      </div>
    </div>
  );
}
