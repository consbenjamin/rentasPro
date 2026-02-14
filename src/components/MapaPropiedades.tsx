"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/lib/supabase";
import type { EstadoPropiedad, TipoPropiedad } from "@/types/database";

// Fix default icon in Next.js/SSR context
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

const TIPO: Record<TipoPropiedad, string> = {
  depto: "Depto",
  casa: "Casa",
  local: "Local",
};
const ESTADO: Record<EstadoPropiedad, string> = {
  disponible: "Disponible",
  alquilada: "Alquilada",
  en_mantenimiento: "En mantenimiento",
};

const CENTRO_ARGENTINA: [number, number] = [-34.6037, -58.3816];
const ZOOM_DEFAULT = 4;
const ZOOM_CON_MARCADORES = 12;

export interface PropiedadMapa {
  id: string;
  direccion: string;
  tipo: TipoPropiedad;
  estado: EstadoPropiedad;
  lat: number | null;
  lng: number | null;
}

function AjustarVista({ puntos }: { puntos: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (puntos.length === 0) return;
    if (puntos.length === 1) {
      map.setView(puntos[0], ZOOM_CON_MARCADORES);
    } else {
      map.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, puntos]);
  return null;
}

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.lat === "number" && typeof data.lng === "number" ? data : null;
}

export function MapaPropiedades({ propiedades }: { propiedades: PropiedadMapa[] }) {
  const [coords, setCoords] = useState<Map<string, { lat: number; lng: number }>>(() => {
    const m = new Map<string, { lat: number; lng: number }>();
    propiedades.forEach((p) => {
      if (p.lat != null && p.lng != null) m.set(p.id, { lat: p.lat, lng: p.lng });
    });
    return m;
  });
  const [loading, setLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const supabase = createClient();

    async function resolveCoords() {
      for (const p of propiedades) {
        if (cancelled) return;
        if (p.lat != null && p.lng != null) continue;
        setLoading((prev) => new Set(prev).add(p.id));
        const result = await geocode(p.direccion);
        await delay(1100);
        if (cancelled) return;
        setLoading((prev) => {
          const next = new Set(prev);
          next.delete(p.id);
          return next;
        });
        if (result) {
          setCoords((prev) => {
            const next = new Map(prev);
            next.set(p.id, result);
            return next;
          });
          await supabase
            .from("propiedades")
            .update({ lat: result.lat, lng: result.lng, updated_at: new Date().toISOString() })
            .eq("id", p.id);
        }
      }
    }

    resolveCoords();
    return () => {
      cancelled = true;
    };
  }, [propiedades]);

  const puntos: [number, number][] = [];
  propiedades.forEach((p) => {
    const c = coords.get(p.id) ?? (p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null);
    if (c) puntos.push([c.lat, c.lng]);
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
      <div className="h-[500px] w-full relative">
        <MapContainer
          center={CENTRO_ARGENTINA}
          zoom={ZOOM_DEFAULT}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AjustarVista puntos={puntos} />
          {propiedades.map((p) => {
            const c = coords.get(p.id) ?? (p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null);
            if (!c) return null;
            return (
              <Marker key={p.id} position={[c.lat, c.lng]}>
                <Popup>
                  <div className="min-w-[180px] text-slate-800 dark:text-slate-200">
                    <p className="font-medium">{p.direccion}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {TIPO[p.tipo]} · {ESTADO[p.estado]}
                    </p>
                    <Link
                      href={`/dashboard/propiedades/${p.id}`}
                      className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Editar
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        {loading.size > 0 && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800/90 text-white text-sm">
              Geocodificando {loading.size} dirección(es)…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
