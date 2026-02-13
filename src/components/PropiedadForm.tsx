"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Propiedad } from "@/types/database";
import type { TipoPropiedad, EstadoPropiedad } from "@/types/database";

const TIPO_OPTIONS: { value: TipoPropiedad; label: string }[] = [
  { value: "depto", label: "Departamento" },
  { value: "casa", label: "Casa" },
  { value: "local", label: "Local" },
];
const ESTADO_OPTIONS: { value: EstadoPropiedad; label: string }[] = [
  { value: "disponible", label: "Disponible" },
  { value: "alquilada", label: "Alquilada" },
  { value: "en_mantenimiento", label: "En mantenimiento" },
];

export function PropiedadForm({ propiedad }: { propiedad?: Propiedad }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propietarios, setPropietarios] = useState<{ id: string; nombre: string }[]>([]);

  const [direccion, setDireccion] = useState(propiedad?.direccion ?? "");
  const [tipo, setTipo] = useState<TipoPropiedad>(propiedad?.tipo ?? "depto");
  const [m2, setM2] = useState(propiedad?.m2?.toString() ?? "");
  const [ambientes, setAmbientes] = useState(propiedad?.ambientes?.toString() ?? "");
  const [propietarioId, setPropietarioId] = useState(propiedad?.propietario_id ?? "");
  const [estado, setEstado] = useState<EstadoPropiedad>(propiedad?.estado ?? "disponible");
  const [precioActual, setPrecioActual] = useState(propiedad?.precio_actual?.toString() ?? "");
  const [notas, setNotas] = useState(propiedad?.notas ?? "");
  const [fotosNotas, setFotosNotas] = useState<{ etiqueta: string; descripcion: string }[]>(() => {
    const json = propiedad?.fotos_notas_json;
    if (typeof json !== "object" || json === null) return [{ etiqueta: "", descripcion: "" }];
    const entries = Object.entries(json as Record<string, unknown>);
    if (entries.length === 0) return [{ etiqueta: "", descripcion: "" }];
    return entries.map(([etiqueta, val]) => ({
      etiqueta,
      descripcion: typeof val === "string" ? val : "",
    }));
  });

  useEffect(() => {
    const client = createClient();
    client
      .from("propietarios")
      .select("id, nombre")
      .order("nombre")
      .then(({ data }) => setPropietarios(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const parsed: Record<string, string> = {};
    for (const item of fotosNotas) {
      if (item.etiqueta.trim()) parsed[item.etiqueta.trim()] = item.descripcion.trim();
    }
    const payload = {
      direccion,
      tipo,
      m2: m2 ? Number(m2) : null,
      ambientes: ambientes ? Number(ambientes) : null,
      propietario_id: propietarioId,
      estado,
      precio_actual: precioActual ? Number(precioActual) : null,
      notas: notas || null,
      fotos_notas_json: parsed,
      updated_at: new Date().toISOString(),
    };
    if (propiedad) {
      const { error: err } = await supabase
        .from("propiedades")
        .update(payload)
        .eq("id", propiedad.id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("propiedades").insert({
        ...payload,
        propietario_id: propietarioId,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    router.push("/dashboard/propiedades");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección *</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoPropiedad)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            {TIPO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPropiedad)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Propietario *</label>
        <select
          value={propietarioId}
          onChange={(e) => setPropietarioId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        >
          <option value="">Seleccionar</option>
          {propietarios.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">m²</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={m2}
            onChange={(e) => setM2(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ambientes</label>
          <input
            type="number"
            min="0"
            value={ambientes}
            onChange={(e) => setAmbientes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio actual</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={precioActual}
          onChange={(e) => setPrecioActual(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-600 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Fotos / referencias (opcional)
          </p>
          <button
            type="button"
            onClick={() => setFotosNotas((f) => [...f, { etiqueta: "", descripcion: "" }])}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Agregar
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ej: "Frente", "Living" con su descripción
        </p>
        {fotosNotas.map((item, i) => (
          <div key={i} className="flex gap-2 items-start p-2 rounded bg-slate-50 dark:bg-slate-700/50">
            <div className="flex-1 grid gap-2 sm:grid-cols-2">
              <input
                value={item.etiqueta}
                onChange={(e) => {
                  const n = [...fotosNotas];
                  n[i] = { ...n[i], etiqueta: e.target.value };
                  setFotosNotas(n);
                }}
                placeholder="Etiqueta (ej: Frente)"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input
                value={item.descripcion}
                onChange={(e) => {
                  const n = [...fotosNotas];
                  n[i] = { ...n[i], descripcion: e.target.value };
                  setFotosNotas(n);
                }}
                placeholder="Descripción"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              type="button"
              onClick={() => setFotosNotas((f) => f.filter((_, j) => j !== i))}
              className="text-red-600 dark:text-red-400 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              title="Quitar"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Guardando…" : propiedad ? "Guardar" : "Crear"}
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
