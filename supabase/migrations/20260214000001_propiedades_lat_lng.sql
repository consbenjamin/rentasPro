-- Coordenadas opcionales para propiedades (geocoding / mapa)
ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;
