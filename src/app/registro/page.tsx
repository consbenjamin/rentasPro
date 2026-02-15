"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { AuthCard } from "@/components/AuthCard";

export default function RegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: nombre ? { nombre } : undefined },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    router.push("/login?mensaje=Revisa tu correo para confirmar la cuenta");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <AuthCard
        title="Crear cuenta"
        subtitle="Regístrate para acceder a Rentas Pro"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="auth-label">
              Nombre (opcional)
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              className="auth-input"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="auth-input"
              placeholder="tu@email.com"
            />
          </div>
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
            {loading ? "Creando cuenta…" : "Registrarme"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
