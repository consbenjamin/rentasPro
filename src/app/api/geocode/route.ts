import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "RentasPro/1.0 (contacto@rentaspro.local)";

const cache = new Map<string, { lat: number; lng: number }>();

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || typeof address !== "string" || !address.trim()) {
    return NextResponse.json(
      { error: "Parámetro 'address' requerido" },
      { status: 400 }
    );
  }

  const key = address.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", address.trim());
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error al geocodificar" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron coordenadas para la dirección" },
        { status: 404 }
      );
    }

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { error: "Respuesta de geocoding inválida" },
        { status: 502 }
      );
    }

    const result = { lat, lng };
    cache.set(key, result);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Error al conectar con el servicio de geocoding" },
      { status: 502 }
    );
  }
}
