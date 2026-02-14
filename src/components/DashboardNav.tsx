"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useTheme } from "@/components/ThemeProvider";
import type { RolUsuario } from "@/types/database";
import { useState } from "react";

const ROL_LABEL: Record<RolUsuario, string> = {
  admin: "Admin",
  operador: "Operador",
  owner: "Propietario",
  viewer: "Solo lectura",
};

const NAV_LINKS: { href: string; label: string; roles?: RolUsuario[] }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/propiedades", label: "Propiedades", roles: ["admin", "operador", "owner", "viewer"] },
  { href: "/dashboard/mapa", label: "Mapa", roles: ["admin", "operador", "owner", "viewer"] },
  { href: "/dashboard/inquilinos", label: "Inquilinos", roles: ["admin", "operador", "viewer"] },
  { href: "/dashboard/propietarios", label: "Propietarios", roles: ["admin", "operador", "viewer"] },
  { href: "/dashboard/contratos", label: "Contratos" },
  { href: "/dashboard/pagos", label: "Pagos" },
  { href: "/dashboard/alertas", label: "Alertas" },
  { href: "/dashboard/reportes", label: "Reportes PDF" },
  { href: "/dashboard/usuarios", label: "Usuarios", roles: ["admin"] },
];

export function DashboardNav({
  userEmail,
  userName,
  rol,
}: {
  userEmail: string;
  userName?: string;
  rol: RolUsuario;
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = NAV_LINKS.filter(
    (l) => !l.roles || l.roles.includes(rol)
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Menú móvil */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav
            className={`absolute md:relative top-14 left-0 right-0 md:top-0 bg-white dark:bg-slate-900 md:bg-transparent border-b md:border-b-0 border-slate-200 dark:border-slate-700 md:flex items-center gap-1 overflow-x-auto max-h-[70vh] md:max-h-none ${
              menuOpen ? "flex flex-col py-2" : "hidden md:flex"
            }`}
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 md:py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  pathname === href
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {ROL_LABEL[rol]}
            </span>
            <span className="text-sm text-slate-700 dark:text-slate-200 truncate max-w-[100px] sm:max-w-[140px]">
              {userName || userEmail}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 whitespace-nowrap"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
