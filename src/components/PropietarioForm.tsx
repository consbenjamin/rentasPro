"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Propietario } from "@/types/database";

type DatosBancarios = { banco?: string; cbu?: string; alias?: string; titular?: string };

function parseDatosBancarios(json: unknown): DatosBancarios {
  if (typeof json !== "object" || json === null) return {};
  const o = json as Record<string, unknown>;
  return {
    banco: typeof o.banco === "string" ? o.banco : "",
    cbu: typeof o.cbu === "string" ? o.cbu : "",
    alias: typeof o.alias === "string" ? o.alias : "",
    titular: typeof o.titular === "string" ? o.titular : "",
  };
}

export function PropietarioForm({ propietario }: { propietario?: Propietario }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState(propietario?.nombre ?? "");
  const [dniCuit, setDniCuit] = useState(propietario?.dni_cuit ?? "");
  const [contacto, setContacto] = useState(propietario?.contacto ?? "");
  const [datos, setDatos] = useState<DatosBancarios>(() =>
    parseDatosBancarios(propietario?.datos_bancarios_json)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const parsed: Record<string, string> = {};
    if (datos.banco?.trim()) parsed.banco = datos.banco.trim();
    if (datos.cbu?.trim()) parsed.cbu = datos.cbu.trim();
    if (datos.alias?.trim()) parsed.alias = datos.alias.trim();
    if (datos.titular?.trim()) parsed.titular = datos.titular.trim();
    if (propietario) {
      const { error: err } = await supabase
        .from("propietarios")
        .update({
          nombre,
          dni_cuit: dniCuit || null,
          contacto: contacto || null,
          datos_bancarios_json: parsed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", propietario.id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("propietarios").insert({
        nombre,
        dni_cuit: dniCuit || null,
        contacto: contacto || null,
        datos_bancarios_json: parsed,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    router.push("/dashboard/propietarios");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">DNI/CUIT</label>
        <input
          type="text"
          value={dniCuit}
          onChange={(e) => setDniCuit(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contacto</label>
        <input
          type="text"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-600 p-3 space-y-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Datos bancarios (opcional)</p>
        <div className="grid gap-2">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">Banco</label>
            <input
              type="text"
              value={datos.banco}
              onChange={(e) => setDatos((d) => ({ ...d, banco: e.target.value }))}
              placeholder="Ej: Banco Nación"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">CBU</label>
            <input
              type="text"
              value={datos.cbu}
              onChange={(e) => setDatos((d) => ({ ...d, cbu: e.target.value }))}
              placeholder="22 dígitos"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">Alias CBU</label>
            <input
              type="text"
              value={datos.alias}
              onChange={(e) => setDatos((d) => ({ ...d, alias: e.target.value }))}
              placeholder="Ej: ALIAS.PROP.001"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">Titular de la cuenta</label>
            <input
              type="text"
              value={datos.titular}
              onChange={(e) => setDatos((d) => ({ ...d, titular: e.target.value }))}
              placeholder="Nombre del titular"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Guardando…" : propietario ? "Guardar" : "Crear"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
