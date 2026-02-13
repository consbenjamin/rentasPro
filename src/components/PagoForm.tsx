"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { MetodoPago } from "@/types/database";

const METODO_OPTIONS: { value: MetodoPago; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
];

interface ContratoOption {
  id: string;
  monto_mensual: number;
  propiedades?: { direccion: string } | { direccion: string }[] | null;
  inquilinos?: { nombre: string } | { nombre: string }[] | null;
}

export function PagoForm({
  contratoId,
  mesPrecargado,
  contratoPrecargado,
}: {
  contratoId?: string;
  mesPrecargado?: string;
  contratoPrecargado?: { id: string; monto_mensual?: number; propiedades?: unknown; inquilinos?: unknown } | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contratos, setContratos] = useState<ContratoOption[]>([]);

  const cId = contratoId ?? searchParams.get("contrato") ?? "";
  const mesParam = mesPrecargado ?? searchParams.get("mes") ?? "";
  const [contratoSel, setContratoSel] = useState(cId);
  const [mesAdeudado, setMesAdeudado] = useState(mesParam ? `${mesParam}-01` : "");
  const [monto, setMonto] = useState(
    contratoPrecargado?.monto_mensual?.toString() ?? ""
  );
  const [fechaPago, setFechaPago] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [metodo, setMetodo] = useState<MetodoPago>("transferencia");
  const [recargoMora, setRecargoMora] = useState("0");

  useEffect(() => {
    const client = createClient();
    client
      .from("contratos")
      .select("id, monto_mensual, propiedades(direccion), inquilinos(nombre)")
      .eq("estado", "activo")
      .order("fecha_fin", { ascending: false })
      .then(({ data }) => setContratos((data ?? []) as ContratoOption[]));
  }, []);

  useEffect(() => {
    if (contratoPrecargado) {
      setContratoSel(contratoPrecargado.id);
      setMonto(contratoPrecargado.monto_mensual?.toString() ?? "");
    }
  }, [contratoPrecargado]);

  useEffect(() => {
    const c = contratos.find((x) => x.id === contratoSel);
    if (c && !contratoPrecargado) setMonto(c.monto_mensual?.toString() ?? "");
  }, [contratoSel, contratos, contratoPrecargado]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const mes = mesAdeudado.slice(0, 7) + "-01";
    const { error: err } = await supabase.from("pagos").insert({
      contrato_id: contratoSel,
      mes_adeudado: mes,
      monto: Number(monto),
      fecha_pago: fechaPago,
      metodo,
      recargo_mora: recargoMora ? Number(recargoMora) : 0,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push("/dashboard/pagos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contrato *</label>
        <select
          value={contratoSel}
          onChange={(e) => setContratoSel(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="">Seleccionar</option>
          {contratos.map((c) => {
            const prop = c.propiedades;
            const inqu = c.inquilinos;
            const dir = Array.isArray(prop) ? prop[0]?.direccion : (prop as { direccion: string } | null)?.direccion;
            const nom = Array.isArray(inqu) ? inqu[0]?.nombre : (inqu as { nombre: string } | null)?.nombre;
            return (
              <option key={c.id} value={c.id}>
                {dir ?? c.id} – {nom ?? ""}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Mes adeudado *</label>
        <input
          type="month"
          value={mesAdeudado ? mesAdeudado.slice(0, 7) : ""}
          onChange={(e) => setMesAdeudado(e.target.value ? `${e.target.value}-01` : "")}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Monto *</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de pago *</label>
          <input
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Método</label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as MetodoPago)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            {METODO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Recargo por mora</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={recargoMora}
          onChange={(e) => setRecargoMora(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Registrar pago"}
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
