"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export function MarcarAlertasLeidas() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleClick() {
    setLoading(true);
    await supabase.from("alertas").update({ leida: true }).eq("leida", false);
    setLoading(false);
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      {loading ? "…" : "Marcar todas como leídas"}
    </button>
  );
}
