import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rentas Pro - Gestión de Alquileres",
  description: "Sistema de gestión de alquileres para inmobiliarias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
