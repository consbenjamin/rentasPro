"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { AuthCard } from "@/components/AuthCard";

export default function CompletarRegistroPage() {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setChecking(false);
      if (!session) router.replace("/login");
    });
  }, [supabase.auth, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <AuthCard
        title="Elige tu contraseña"
        subtitle="Completa tu registro para acceder a Rentas Pro. Usa una contraseña segura."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="auth-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="auth-input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label htmlFor="confirmar" className="auth-label">
              Confirmar contraseña
            </label>
            <input
              id="confirmar"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="auth-input"
              placeholder="Repite la contraseña"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="auth-button primary w-full">
            {loading ? "Guardando…" : "Crear contraseña y entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
