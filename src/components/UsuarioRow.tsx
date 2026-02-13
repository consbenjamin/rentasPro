"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { RolUsuario } from "@/types/database";

const ROL_LABEL: Record<RolUsuario, string> = {
  admin: "Admin",
  operador: "Operador",
  owner: "Propietario",
  viewer: "Solo lectura",
};

const ROLES: RolUsuario[] = ["admin", "operador", "owner", "viewer"];

export function UsuarioRow({
  id,
  nombre,
  rol,
  propietarioNombre,
}: {
  id: string;
  nombre: string | null;
  rol: RolUsuario;
  propietarioNombre: string | null;
}) {
  const [currentRol, setCurrentRol] = useState(rol);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleChangeRol(newRol: RolUsuario) {
    setLoading(true);
    await supabase.from("profiles").update({ rol: newRol, updated_at: new Date().toISOString() }).eq("id", id);
    setCurrentRol(newRol);
    setLoading(false);
  }

  return (
    <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
      <td className="px-4 py-3">
        <span className="text-slate-800 dark:text-slate-200 font-medium">{nombre || id.slice(0, 8)}</span>
      </td>
      <td className="px-4 py-3">
        <select
          value={currentRol}
          onChange={(e) => handleChangeRol(e.target.value as RolUsuario)}
          disabled={loading}
          className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROL_LABEL[r]}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">{propietarioNombre ?? "—"}</td>
      <td className="px-4 py-3" />
    </tr>
  );
}
