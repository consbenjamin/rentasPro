"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface Prop { id: string; nombre: string }

export function LiquidacionForm({ propietarios }: { propietarios: Prop[] }) {
  const now = new Date();
  const [propietarioId, setPropietarioId] = useState("");
  const [desde, setDesde] = useState(format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd"));
  const [hasta, setHasta] = useState(format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd"));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propietarioId) return;
    const url = `/api/pdf/liquidacion?propietario_id=${encodeURIComponent(propietarioId)}&desde=${desde}&hasta=${hasta}`;
    window.open(url, "_blank");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        Generar PDF liquidación
      </button>
    </form>
  );
}
