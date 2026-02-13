"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Inquilino } from "@/types/database";

type Garante = { nombre: string; dni: string; telefono: string };
type Documento = { tipo: string; numero: string; nota: string };

function parseGarantes(arr: unknown): Garante[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    const o = typeof item === "object" && item ? (item as Record<string, unknown>) : {};
    return {
      nombre: typeof o.nombre === "string" ? o.nombre : "",
      dni: typeof o.dni === "string" ? o.dni : "",
      telefono: typeof o.telefono === "string" ? o.telefono : "",
    };
  });
}

function parseDocumentos(arr: unknown): Documento[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    const o = typeof item === "object" && item ? (item as Record<string, unknown>) : {};
    return {
      tipo: typeof o.tipo === "string" ? o.tipo : "",
      numero: typeof o.numero === "string" ? o.numero : "",
      nota: typeof o.nota === "string" ? o.nota : "",
    };
  });
}

const inputClass =
  "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100";

export function InquilinoForm({ inquilino }: { inquilino?: Inquilino }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState(inquilino?.nombre ?? "");
  const [dniCuit, setDniCuit] = useState(inquilino?.dni_cuit ?? "");
  const [email, setEmail] = useState(inquilino?.email ?? "");
  const [telefono, setTelefono] = useState(inquilino?.telefono ?? "");
  const [garantes, setGarantes] = useState<Garante[]>(() =>
    parseGarantes(inquilino?.garantes_json).length
      ? parseGarantes(inquilino?.garantes_json)
      : [{ nombre: "", dni: "", telefono: "" }]
  );
  const [documentos, setDocumentos] = useState<Documento[]>(() =>
    parseDocumentos(inquilino?.documentos_json).length
      ? parseDocumentos(inquilino?.documentos_json)
      : [{ tipo: "", numero: "", nota: "" }]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const garantesParsed = garantes
      .filter((g) => g.nombre.trim() || g.dni.trim() || g.telefono.trim())
      .map((g) => ({ nombre: g.nombre.trim(), dni: g.dni.trim(), telefono: g.telefono.trim() }));
    const documentosParsed = documentos
      .filter((d) => d.tipo.trim() || d.numero.trim() || d.nota.trim())
      .map((d) => ({ tipo: d.tipo.trim(), numero: d.numero.trim(), nota: d.nota.trim() }));
    if (inquilino) {
      const { error: err } = await supabase
        .from("inquilinos")
        .update({
          nombre,
          dni_cuit: dniCuit || null,
          email: email || null,
          telefono: telefono || null,
          garantes_json: garantesParsed,
          documentos_json: documentosParsed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inquilino.id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("inquilinos").insert({
        nombre,
        dni_cuit: dniCuit || null,
        email: email || null,
        telefono: telefono || null,
        garantes_json: garantesParsed,
        documentos_json: documentosParsed,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    router.push("/dashboard/inquilinos");
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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
        <input
          type="text"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-600 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Garantes (opcional)</p>
          <button
            type="button"
            onClick={() => setGarantes((g) => [...g, { nombre: "", dni: "", telefono: "" }])}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Agregar
          </button>
        </div>
        {garantes.map((g, i) => (
          <div key={i} className="flex gap-2 items-start p-2 rounded bg-slate-50 dark:bg-slate-700/50">
            <div className="flex-1 grid gap-2 sm:grid-cols-3">
              <input
                value={g.nombre}
                onChange={(e) => {
                  const n = [...garantes];
                  n[i] = { ...n[i], nombre: e.target.value };
                  setGarantes(n);
                }}
                placeholder="Nombre"
                className={inputClass}
              />
              <input
                value={g.dni}
                onChange={(e) => {
                  const n = [...garantes];
                  n[i] = { ...n[i], dni: e.target.value };
                  setGarantes(n);
                }}
                placeholder="DNI"
                className={inputClass}
              />
              <input
                value={g.telefono}
                onChange={(e) => {
                  const n = [...garantes];
                  n[i] = { ...n[i], telefono: e.target.value };
                  setGarantes(n);
                }}
                placeholder="Teléfono"
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => setGarantes((g) => g.filter((_, j) => j !== i))}
              className="text-red-600 dark:text-red-400 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              title="Quitar"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-600 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Documentos (opcional)</p>
          <button
            type="button"
            onClick={() => setDocumentos((d) => [...d, { tipo: "", numero: "", nota: "" }])}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Agregar
          </button>
        </div>
        {documentos.map((d, i) => (
          <div key={i} className="flex gap-2 items-start p-2 rounded bg-slate-50 dark:bg-slate-700/50">
            <div className="flex-1 grid gap-2 sm:grid-cols-3">
              <input
                value={d.tipo}
                onChange={(e) => {
                  const n = [...documentos];
                  n[i] = { ...n[i], tipo: e.target.value };
                  setDocumentos(n);
                }}
                placeholder="Tipo (DNI, contrato...)"
                className={inputClass}
              />
              <input
                value={d.numero}
                onChange={(e) => {
                  const n = [...documentos];
                  n[i] = { ...n[i], numero: e.target.value };
                  setDocumentos(n);
                }}
                placeholder="Número"
                className={inputClass}
              />
              <input
                value={d.nota}
                onChange={(e) => {
                  const n = [...documentos];
                  n[i] = { ...n[i], nota: e.target.value };
                  setDocumentos(n);
                }}
                placeholder="Nota"
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => setDocumentos((d) => d.filter((_, j) => j !== i))}
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
          {loading ? "Guardando…" : inquilino ? "Guardar" : "Crear"}
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
