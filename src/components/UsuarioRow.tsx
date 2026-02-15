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

type Propietario = { id: string; nombre: string };

export function UsuarioRow({
  id,
  nombre,
  rol,
  propietarioId,
  propietarioNombre,
  propietarios,
  isAdmin,
  currentUserId,
}: {
  id: string;
  nombre: string | null;
  rol: RolUsuario;
  propietarioId?: string | null;
  propietarioNombre: string | null;
  propietarios: Propietario[];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const [currentRol, setCurrentRol] = useState(rol);
  const [currentPropietarioId, setCurrentPropietarioId] = useState<string>(propietarioId ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const canEdit = isAdmin;
  const isSelf = id === currentUserId;

  async function handleChangeRol(newRol: RolUsuario) {
    if (!canEdit) return;
    setLoading(true);
    setError(null);
    const payload: { rol: RolUsuario; propietario_id?: string | null; updated_at: string } = {
      rol: newRol,
      updated_at: new Date().toISOString(),
    };
    if (newRol === "owner") payload.propietario_id = currentPropietarioId || null;
    else payload.propietario_id = null;
    const { error: e } = await supabase.from("profiles").update(payload).eq("id", id);
    if (e) setError(e.message);
    else setCurrentRol(newRol);
    setLoading(false);
  }

  async function handleChangePropietario(propId: string) {
    if (!canEdit || currentRol !== "owner") return;
    setCurrentPropietarioId(propId);
    setLoading(true);
    setError(null);
    const { error: e } = await supabase
      .from("profiles")
      .update({ propietario_id: propId || null, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (e) setError(e.message);
    setLoading(false);
  }

  async function handleDelete() {
    if (!canEdit || isSelf) return;
    if (!confirm("¿Eliminar este usuario? No podrá volver a acceder a la aplicación.")) return;
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data?.error || "Error al eliminar");
    else window.location.reload();
    setDeleting(false);
  }

  return (
    <tr className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
      <td className="px-4 py-3">
        <span className="text-slate-800 dark:text-slate-200 font-medium">{nombre || id.slice(0, 8)}</span>
      </td>
      <td className="px-4 py-3">
        <select
          value={currentRol}
          onChange={(e) => handleChangeRol(e.target.value as RolUsuario)}
          disabled={!canEdit || loading}
          className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROL_LABEL[r]}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
        {currentRol === "owner" && canEdit ? (
          <select
            value={currentPropietarioId}
            onChange={(e) => handleChangePropietario(e.target.value)}
            disabled={loading}
            className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 max-w-[200px]"
          >
            <option value="">—</option>
            {propietarios.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        ) : (
          propietarioNombre ?? "—"
        )}
      </td>
      <td className="px-4 py-3">
        {error && <span className="text-red-600 dark:text-red-400 text-xs mr-2">{error}</span>}
        {canEdit && !isSelf && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        )}
      </td>
    </tr>
  );
}
