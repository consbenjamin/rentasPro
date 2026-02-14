import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase-server";
import type { MapaPropiedades as MapaPropiedadesType, PropiedadMapa } from "@/components/MapaPropiedades";

const MapaPropiedades = dynamic(
  () => import("@/components/MapaPropiedades").then((m) => m.MapaPropiedades),
  { ssr: false }
) as typeof MapaPropiedadesType;

export default async function MapaPage() {
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("propiedades")
    .select("id, direccion, tipo, estado, lat, lng")
    .order("direccion");

  const propiedades: PropiedadMapa[] = (list ?? []).map((p) => ({
    id: p.id,
    direccion: p.direccion,
    tipo: p.tipo,
    estado: p.estado,
    lat: p.lat != null ? Number(p.lat) : null,
    lng: p.lng != null ? Number(p.lng) : null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
        Mapa de propiedades
      </h1>
      {propiedades.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          No hay propiedades. Agregá al menos una para verlas en el mapa.
        </p>
      ) : (
        <MapaPropiedades propiedades={propiedades} />
      )}
    </div>
  );
}
