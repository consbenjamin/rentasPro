"use client";

import { useState } from "react";
import type { RolUsuario } from "@/types/database";

const ROL_LABEL: Record<RolUsuario, string> = {
  admin: "Admin",
  operador: "Operador",
  owner: "Propietario",
  viewer: "Solo lectura",
};

const ROLES: RolUsuario[] = ["admin", "operador", "owner", "viewer"];

type Propietario = { id: string; nombre: string };

export function InvitarUsuarioForm({
  propietarios,
  className = "",
}: {
  propietarios: Propietario[];
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolUsuario>("viewer");
  const [nombre, setNombre] = useState("");
  const [propietarioId, setPropietarioId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email.trim()) {
      setMessage({ type: "error", text: "El email es obligatorio." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          rol,
          nombre: nombre.trim() || undefined,
          propietario_id: rol === "owner" && propietarioId ? propietarioId : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data?.error || "Error al invitar." });
        return;
      }
      setMessage({ type: "ok", text: "Invitación enviada. El usuario recibirá un correo para activar su cuenta." });
      setEmail("");
      setNombre("");
      setPropietarioId("");
      setRol("viewer");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 ${className}`}
    >
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Invitar usuario</h2>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
        <label className="flex flex-col gap-1 min-w-0 flex-1 sm:flex-initial sm:min-w-[200px]">
          <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            className="text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full min-w-0"
          />
        </label>
        <label className="flex flex-col gap-1 min-w-0 flex-1 sm:flex-initial sm:min-w-[140px]">
          <span className="text-sm text-slate-600 dark:text-slate-400">Nombre (opcional)</span>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full min-w-0"
          />
        </label>
        <label className="flex flex-col gap-1 min-w-0 sm:min-w-[120px]">
          <span className="text-sm text-slate-600 dark:text-slate-400">Rol</span>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as RolUsuario)}
            className="text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full min-w-0"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROL_LABEL[r]}</option>
            ))}
          </select>
        </label>
        {rol === "owner" && (
          <label className="flex flex-col gap-1 min-w-0 flex-1 sm:flex-initial sm:min-w-[180px]">
            <span className="text-sm text-slate-600 dark:text-slate-400">Propietario</span>
            <select
              value={propietarioId}
              onChange={(e) => setPropietarioId(e.target.value)}
              className="text-sm border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full min-w-0"
            >
              <option value="">Seleccionar propietario</option>
              {propietarios.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Enviando…" : "Invitar"}
        </button>
      </div>
      {message && (
        <p className={`mt-3 text-sm ${message.type === "ok" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
