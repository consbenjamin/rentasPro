"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { AuthCard } from "@/components/AuthCard";

type Step = "email" | "password" | "not_allowed";

export default function RegistroPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [nombrePendiente, setNombrePendiente] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleVerificarEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const mail = email.trim().toLowerCase();
    if (!mail) {
      setError("El email es obligatorio.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch(`/api/usuarios/verificar-email?email=${encodeURIComponent(mail)}`);
      const data = await res.json().catch(() => ({}));
      if (data.pendiente) {
        setNombrePendiente(data.nombre ?? null);
        setStep("password");
      } else {
        setStep("not_allowed");
      }
    } finally {
      setVerifying(false);
    }
  }

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
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: nombrePendiente ? { nombre: nombrePendiente } : undefined },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // Si hay sesión (confirmación de email desactivada), completar perfil y entrar al dashboard
      if (signUpData?.session) {
        const res = await fetch("/api/usuarios/completar-registro", { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error || "Error al completar el registro.");
          return;
        }
        router.push("/dashboard");
        router.refresh();
        return;
      }
      // Si no hay sesión (confirmación de email activada), ir a login con mensaje
      router.push("/login?mensaje=Revisá tu correo para confirmar la cuenta. Luego iniciá sesión con tu contraseña.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function volverAEmail() {
    setStep("email");
    setError(null);
    setNombrePendiente(null);
    setPassword("");
    setConfirmar("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <AuthCard
        title="Crear cuenta"
        subtitle={
          step === "email"
            ? "Ingresá el correo con el que te dio de alta el administrador"
            : step === "password"
              ? "Elegí tu contraseña. Será la que uses para iniciar sesión."
              : "Registro"
        }
      >
        {step === "email" && (
          <form onSubmit={handleVerificarEmail} className="space-y-4">
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
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button type="submit" disabled={verifying} className="auth-button primary w-full">
              {verifying ? "Verificando…" : "Continuar"}
            </button>
          </form>
        )}

        {step === "not_allowed" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Este correo no está en la lista de usuarios autorizados. Pedile al administrador que te agregue desde
              Usuarios y roles.
            </p>
            <button
              type="button"
              onClick={volverAEmail}
              className="auth-button primary w-full"
            >
              Usar otro correo
            </button>
          </div>
        )}

        {step === "password" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="auth-label">Email</label>
              <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                {email}
              </p>
            </div>
            {nombrePendiente && (
              <div>
                <label className="auth-label">Nombre</label>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                  {nombrePendiente}
                </p>
              </div>
            )}
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
                placeholder="Repetí la contraseña"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={volverAEmail}
                className="auth-button secondary flex-1"
              >
                Atrás
              </button>
              <button type="submit" disabled={loading} className="auth-button primary flex-1">
                {loading ? "Creando cuenta…" : "Crear cuenta"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
