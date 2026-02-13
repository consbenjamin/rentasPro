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
  const [fotosNotas, setFotosNotas] = useState(
    typeof propiedad?.fotos_notas_json === "object" && propiedad?.fotos_notas_json
      ? JSON.stringify(propiedad.fotos_notas_json, null, 2)
      : "{}"
  );

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
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(fotosNotas);
    } catch {
      setError("Fotos/notas: JSON inválido");
      setLoading(false);
      return;
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoPropiedad)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            {TIPO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPropiedad)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Propietario *</label>
        <select
          value={propietarioId}
          onChange={(e) => setPropietarioId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="">Seleccionar</option>
          {propietarios.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">m²</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={m2}
            onChange={(e) => setM2(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ambientes</label>
          <input
            type="number"
            min="0"
            value={ambientes}
            onChange={(e) => setAmbientes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Precio actual</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={precioActual}
          onChange={(e) => setPrecioActual(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Fotos/notas (JSON)</label>
        <textarea
          value={fotosNotas}
          onChange={(e) => setFotosNotas(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
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
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
