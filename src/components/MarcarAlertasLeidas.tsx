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
      className="btn-secondary disabled:opacity-50"
    >
      {loading ? "…" : "Marcar todas como leídas"}
    </button>
  );
}
