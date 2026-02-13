"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Propietario } from "@/types/database";

export function PropietarioForm({ propietario }: { propietario?: Propietario }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState(propietario?.nombre ?? "");
  const [dniCuit, setDniCuit] = useState(propietario?.dni_cuit ?? "");
  const [contacto, setContacto] = useState(propietario?.contacto ?? "");
  const [datosBancarios, setDatosBancarios] = useState(
    typeof propietario?.datos_bancarios_json === "object" && propietario?.datos_bancarios_json
      ? JSON.stringify(propietario.datos_bancarios_json, null, 2)
      : "{}"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(datosBancarios);
    } catch {
      setError("Datos bancarios: JSON inválido");
      setLoading(false);
      return;
    }
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
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Datos bancarios (JSON)</label>
        <textarea
          value={datosBancarios}
          onChange={(e) => setDatosBancarios(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
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
