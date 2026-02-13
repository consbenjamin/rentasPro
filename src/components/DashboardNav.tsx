"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { RolUsuario } from "@/types/database";

const ROL_LABEL: Record<RolUsuario, string> = {
  admin: "Admin",
  operador: "Operador",
  owner: "Propietario",
  viewer: "Solo lectura",
};

const NAV_LINKS: { href: string; label: string; roles?: RolUsuario[] }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/propiedades", label: "Propiedades", roles: ["admin", "operador", "owner", "viewer"] },
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

  const links = NAV_LINKS.filter(
    (l) => !l.roles || l.roles.includes(rol)
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  pathname === href
                    ? "bg-blue-100 text-blue-800"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              {ROL_LABEL[rol]}
            </span>
            <span className="text-sm text-slate-700 truncate max-w-[140px]">
              {userName || userEmail}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
