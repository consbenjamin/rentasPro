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
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-3">
        <span className="text-slate-800 font-medium">{nombre || id.slice(0, 8)}</span>
      </td>
      <td className="px-4 py-3">
        <select
          value={currentRol}
          onChange={(e) => handleChangeRol(e.target.value as RolUsuario)}
          disabled={loading}
          className="text-sm border border-slate-300 rounded px-2 py-1"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROL_LABEL[r]}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-slate-600 text-sm">{propietarioNombre ?? "—"}</td>
      <td className="px-4 py-3" />
    </tr>
  );
}
