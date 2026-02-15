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

## Qué hace la app

Rentas Pro sirve para llevar la gestión de alquileres: propiedades, dueños, inquilinos, contratos y pagos. Cada usuario entra con su cuenta y, según su rol, ve y hace distintas cosas.

### Quién puede usarla (roles)

- **Admin**: Ve todo y puede dar de alta y editar propiedades, inquilinos, propietarios, contratos y pagos. Es el único que gestiona usuarios y roles.
- **Operador**: Igual que el admin en el día a día (altas, ediciones), pero no administra usuarios.
- **Propietario**: Solo ve y trabaja con sus propias propiedades, contratos, pagos y alertas.
- **Solo lectura**: Puede ver la información pero no crear ni modificar nada.

### Funcionalidades

- **Inicio de sesión**: Entrada con email y contraseña. Si no estás logueado, la app te lleva al login; si ya estás logueado, al panel principal.

- **Panel principal (Dashboard)**: Resumen con ingresos del mes, ingresos acumulados, morosidad (contratos con pagos atrasados), contratos que vencen en 7, 30 o 60 días, porcentaje de ocupación y cantidad de alertas sin leer. Cada número lleva a la sección correspondiente.

- **Propiedades**: Listado de propiedades (dirección, tipo, propietario, estado, precio). Se pueden dar de alta nuevas y editar las existentes. Los estados son: disponible, alquilada, en mantenimiento.

- **Inquilinos**: Listado de inquilinos con datos de contacto. Alta y edición de inquilinos (nombre, DNI/CUIT, email, teléfono, garantes, documentos).

- **Propietarios**: Listado de dueños con datos de contacto y datos bancarios. Alta y edición de propietarios.

- **Contratos**: Contratos que vinculan una propiedad, un inquilino y un propietario, con fechas de inicio y fin, monto mensual, día de vencimiento del alquiler, depósito y reglas de aumento (porcentaje o monto fijo cada X meses). Estados: activo, finalizado, rescindido.

- **Pagos**: Registro de pagos por contrato y mes. Se indica monto, fecha de pago, método (efectivo, transferencia, etc.) y opcionalmente recargo por mora. Permite llevar el control de lo cobrado y lo pendiente.

- **Alertas**: Avisos automáticos para no perder de vista vencimientos: contrato por vencer, alquiler que vence hoy o mañana, pago vencido, aumento según contrato. Las alertas se pueden marcar como leídas. Se generan en forma automática (por ejemplo una vez al día) si se configura el cron de alertas.

- **Reportes PDF**: Generación de recibos de pago y liquidaciones para el propietario en PDF, para descargar o imprimir.

- **Usuarios** (solo admin): Alta de usuarios con email, nombre y rol (admin, operador, propietario, solo lectura). No se envía correo: cada usuario debe ir a **Registro**, ingresar su email y elegir su contraseña; esa será la que use para iniciar sesión. Ver `docs/FLUJO_USUARIOS.md` para el flujo completo.

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
