"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RolUsuario } from "@/types/database";

const ROL_LABEL: Record<RolUsuario, string> = {
  admin: "Admin",
  operador: "Operador",
  owner: "Propietario",
  viewer: "Solo lectura",
};

type NavLink = {
  href: string;
  label: string;
  icon: string;
  roles?: RolUsuario[];
};

const NAV_SECTIONS: { title: string; links: NavLink[] }[] = [
  {
    title: "Vista general",
    links: [{ href: "/dashboard", label: "Inicio", icon: "Inicio" }],
  },
  {
    title: "Operación",
    links: [
      { href: "/dashboard/propiedades", label: "Propiedades", icon: "Casas", roles: ["admin", "operador", "owner", "viewer"] },
      { href: "/dashboard/inquilinos", label: "Inquilinos", icon: "Personas", roles: ["admin", "operador", "viewer"] },
      { href: "/dashboard/propietarios", label: "Propietarios", icon: "Dueños", roles: ["admin", "operador", "viewer"] },
      { href: "/dashboard/contratos", label: "Contratos", icon: "Firmas" },
      { href: "/dashboard/pagos", label: "Pagos", icon: "Dinero" },
    ],
  },
  {
    title: "Análisis y control",
    links: [
      { href: "/dashboard/alertas", label: "Alertas", icon: "Avisos" },
      { href: "/dashboard/reportes", label: "Reportes", icon: "PDF", roles: ["admin", "operador", "owner", "viewer"] },
      { href: "/dashboard/mapa", label: "Mapa", icon: "Mapa", roles: ["admin", "operador", "owner", "viewer"] },
      { href: "/dashboard/usuarios", label: "Usuarios", icon: "Equipo", roles: ["admin"] },
    ],
  },
];

export function DashboardSidebar({
  rol,
  open,
  onClose,
}: {
  rol: RolUsuario;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    links: section.links.filter((link) => !link.roles || link.roles.includes(rol)),
  })).filter((section) => section.links.length > 0);

  return (
    <>
      {/* Overlay móvil */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className={`fixed inset-0 z-[9998] bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[9999] h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between md:justify-center">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-sm">
              R
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">
              Rentas Pro
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="px-3 py-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {section.title}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {section.links.map(({ href, label, icon }) => {
                    const isActive =
                      href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(href);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={onClose}
                          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          <span>{label}</span>
                          <span className="text-[10px] uppercase tracking-wide opacity-70">{icon}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <p className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
            {ROL_LABEL[rol]}
          </p>
        </div>
      </aside>
    </>
  );
}
