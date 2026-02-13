"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Inquilino } from "@/types/database";

export function InquilinoForm({ inquilino }: { inquilino?: Inquilino }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState(inquilino?.nombre ?? "");
  const [dniCuit, setDniCuit] = useState(inquilino?.dni_cuit ?? "");
  const [email, setEmail] = useState(inquilino?.email ?? "");
  const [telefono, setTelefono] = useState(inquilino?.telefono ?? "");
  const [garantes, setGarantes] = useState(
    Array.isArray(inquilino?.garantes_json)
      ? JSON.stringify(inquilino.garantes_json, null, 2)
      : "[]"
  );
  const [documentos, setDocumentos] = useState(
    Array.isArray(inquilino?.documentos_json)
      ? JSON.stringify(inquilino.documentos_json, null, 2)
      : "[]"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let garantesParsed: unknown[] = [];
    let documentosParsed: unknown[] = [];
    try {
      garantesParsed = JSON.parse(garantes);
      documentosParsed = JSON.parse(documentos);
    } catch {
      setError("Garantes o documentos: JSON inválido");
      setLoading(false);
      return;
    }
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
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Garantes (JSON)</label>
        <textarea
          value={garantes}
          onChange={(e) => setGarantes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Documentos (JSON)</label>
        <textarea
          value={documentos}
          onChange={(e) => setDocumentos(e.target.value)}
          rows={3}
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
