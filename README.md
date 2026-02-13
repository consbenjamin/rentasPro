# Rentas Pro

Sistema de gestión de alquileres para inmobiliarias pequeñas. Backend con **Supabase** (PostgreSQL, Auth, Storage), front con **Next.js** (App Router).

## Requisitos

- Node.js 18+
- Cuenta Supabase

## Configuración

1. Clonar y instalar dependencias:

   ```bash
   npm install
   ```

2. Crear proyecto en [Supabase](https://supabase.com) y ejecutar migraciones:

   ```bash
   npx supabase link --project-ref TU_PROJECT_REF
   npx supabase db push
   ```

   O copiar el SQL de `supabase/migrations/` en el SQL Editor del Dashboard.

3. Copiar variables de entorno:

   ```bash
   cp .env.local.example .env.local
   ```

   Editar `.env.local` con la URL y las keys del proyecto (Dashboard > Settings > API). Incluir `SUPABASE_SERVICE_ROLE_KEY` para PDFs y cron.

4. (Opcional) Crear buckets en Storage: ver `docs/STORAGE.md`.

## Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Redirige a `/login` si no hay sesión.

## Primer usuario (admin)

1. En Supabase Dashboard > Authentication > Users, crear un usuario (email + contraseña).
2. En Table Editor > `profiles`, editar la fila del usuario y poner `rol` = `admin`.

## Cron de alertas

Para generar alertas (vencimiento contrato, alquiler, pago vencido, aumento):

- **Opción A**: Llamar a la API de Next.js (por ejemplo con Vercel Cron):

  ```
  GET (o POST) /api/cron/alertas
  ```

  Si definís `CRON_SECRET` en env, enviar header: `Authorization: Bearer <CRON_SECRET>`.

- **Opción B**: Desplegar la Edge Function `supabase/functions/alertas-cron` y programar su invocación desde el Dashboard de Supabase o un cron externo.

## Build

```bash
npm run build
npm run start
```

## Estructura

- `src/app/(dashboard)/` — Rutas del panel (propiedades, inquilinos, propietarios, contratos, pagos, alertas, reportes, usuarios).
- `src/app/api/` — API routes: PDF (recibo, liquidación) y cron de alertas.
- `src/components/` — Formularios y navegación.
- `src/lib/` — Cliente Supabase (browser y server).
- `supabase/migrations/` — Schema SQL y RLS.
- `supabase/functions/` — Edge Function opcional para alertas.
