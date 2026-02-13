"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Contrato } from "@/types/database";
import type { EstadoContrato, IncrementoTipo } from "@/types/database";

const ESTADO_OPTIONS: { value: EstadoContrato; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "finalizado", label: "Finalizado" },
  { value: "rescindido", label: "Rescindido" },
];
const INCREMENTO_OPTIONS: { value: IncrementoTipo; label: string }[] = [
  { value: "porcentaje", label: "Porcentaje" },
  { value: "monto_fijo", label: "Monto fijo" },
];

interface PropiedadOption {
  id: string;
  direccion: string;
  propietario_id: string;
}
interface PersonOption {
  id: string;
  nombre: string;
}

export function ContratoForm({ contrato }: { contrato?: Contrato }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propiedades, setPropiedades] = useState<PropiedadOption[]>([]);
  const [inquilinos, setInquilinos] = useState<PersonOption[]>([]);
  const [propietarios, setPropietarios] = useState<PersonOption[]>([]);

  const [propiedadId, setPropiedadId] = useState(contrato?.propiedad_id ?? "");
  const [inquilinoId, setInquilinoId] = useState(contrato?.inquilino_id ?? "");
  const [propietarioId, setPropietarioId] = useState(contrato?.propietario_id ?? "");
  const [fechaInicio, setFechaInicio] = useState(
    contrato?.fecha_inicio ? contrato.fecha_inicio.slice(0, 10) : ""
  );
  const [fechaFin, setFechaFin] = useState(
    contrato?.fecha_fin ? contrato.fecha_fin.slice(0, 10) : ""
  );
  const [montoMensual, setMontoMensual] = useState(contrato?.monto_mensual?.toString() ?? "");
  const [diaVencimiento, setDiaVencimiento] = useState(contrato?.dia_vencimiento?.toString() ?? "10");
  const [deposito, setDeposito] = useState(contrato?.deposito?.toString() ?? "0");
  const [incrementoTipo, setIncrementoTipo] = useState<IncrementoTipo | "">(
    contrato?.incremento_tipo ?? ""
  );
  const [incrementoValor, setIncrementoValor] = useState(contrato?.incremento_valor?.toString() ?? "");
  const [incrementoCadaMeses, setIncrementoCadaMeses] = useState(
    contrato?.incremento_cada_meses?.toString() ?? ""
  );
  const [estado, setEstado] = useState<EstadoContrato>(contrato?.estado ?? "activo");

  useEffect(() => {
    const client = createClient();
    Promise.all([
      client.from("propiedades").select("id, direccion, propietario_id").order("direccion"),
      client.from("inquilinos").select("id, nombre").order("nombre"),
      client.from("propietarios").select("id, nombre").order("nombre"),
    ]).then(([p, i, o]) => {
      setPropiedades((p.data ?? []) as PropiedadOption[]);
      setInquilinos((i.data ?? []) as PersonOption[]);
      setPropietarios((o.data ?? []) as PersonOption[]);
    });
  }, []);

  useEffect(() => {
    if (propiedadId && propiedades.length) {
      const prop = propiedades.find((x) => x.id === propiedadId);
      if (prop) setPropietarioId(prop.propietario_id);
    }
  }, [propiedadId, propiedades]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      propiedad_id: propiedadId,
      inquilino_id: inquilinoId,
      propietario_id: propietarioId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      monto_mensual: Number(montoMensual),
      dia_vencimiento: Number(diaVencimiento),
      deposito: deposito ? Number(deposito) : null,
      incremento_tipo: incrementoTipo || null,
      incremento_valor: incrementoValor ? Number(incrementoValor) : null,
      incremento_cada_meses: incrementoCadaMeses ? Number(incrementoCadaMeses) : null,
      estado,
      updated_at: new Date().toISOString(),
    };
    if (contrato) {
      const { error: err } = await supabase
        .from("contratos")
        .update(payload)
        .eq("id", contrato.id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("contratos").insert(payload);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    router.push("/dashboard/contratos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Propiedad *</label>
        <select
          value={propiedadId}
          onChange={(e) => setPropiedadId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="">Seleccionar</option>
          {propiedades.map((p) => (
            <option key={p.id} value={p.id}>{p.direccion}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Inquilino *</label>
        <select
          value={inquilinoId}
          onChange={(e) => setInquilinoId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="">Seleccionar</option>
          {inquilinos.map((i) => (
            <option key={i.id} value={i.id}>{i.nombre}</option>
          ))}
        </select>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha inicio *</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha fin *</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Monto mensual *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={montoMensual}
            onChange={(e) => setMontoMensual(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Día vencimiento (1-28)</label>
          <input
            type="number"
            min={1}
            max={28}
            value={diaVencimiento}
            onChange={(e) => setDiaVencimiento(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Depósito</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={deposito}
            onChange={(e) => setDeposito(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoContrato)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-4">
        <p className="text-sm font-medium text-slate-700 mb-2">Incremento (opcional)</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Cada (meses)</label>
            <input
              type="number"
              min="0"
              value={incrementoCadaMeses}
              onChange={(e) => setIncrementoCadaMeses(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Tipo</label>
            <select
              value={incrementoTipo}
              onChange={(e) => setIncrementoTipo(e.target.value as IncrementoTipo | "")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">—</option>
              {INCREMENTO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Valor</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={incrementoValor}
              onChange={(e) => setIncrementoValor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Guardando…" : contrato ? "Guardar" : "Crear"}
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
