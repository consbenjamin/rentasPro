# Flujo de alta de usuarios (sin invitación por email)

En Rentas Pro los usuarios **no** reciben un correo de invitación. El administrador los da de alta con email, nombre y rol; luego cada uno se registra con su contraseña y esa será la que use para iniciar sesión.

## Configuración en Supabase: sin envío de correos

Para que el registro funcione **sin enviar ningún mail**, hay que desactivar la confirmación de email en Supabase:

1. Entrá al **Dashboard de Supabase** → tu proyecto.
2. **Authentication** → **Providers** → **Email**.
3. Desactivá **"Confirm email"** (o "Enable email confirmations").

Así, al registrarse no se envía correo y el usuario queda con sesión activa de inmediato.

## Resumen del flujo

```
Admin agrega usuario (email, nombre, rol)
        ↓
Usuario va a /registro e ingresa su email
        ↓
Sistema verifica que el email esté en la lista de pendientes
        ↓
Usuario elige su contraseña (y la confirma)
        ↓
Se crea la cuenta; el perfil recibe el rol y nombre definidos por el admin
        ↓
Usuario inicia sesión con ese email y contraseña
```

## Paso a paso

### 1. El admin agrega al usuario

- En **Dashboard → Usuarios y roles**, el admin completa:
  - **Email** (obligatorio)
  - **Nombre** (opcional)
  - **Rol** (Admin, Operador, Propietario, Solo lectura)
  - Si el rol es Propietario: **Propietario vinculado**
- Pulsa **Agregar**.
- El usuario queda en la lista de **Pendientes de registro**. No se envía ningún correo.

### 2. El usuario se registra

- El usuario va a **Registro** (enlace desde la pantalla de login).
- Ingresa **su email** (el mismo que el admin dio de alta) y pulsa **Continuar**.
- Si el email está en la lista de pendientes:
  - Se muestran el email y el nombre (solo lectura).
  - Debe elegir **contraseña** y **confirmar contraseña**.
  - Pulsa **Crear cuenta**.
- Si el email **no** está en la lista: se muestra un mensaje indicando que debe pedir al administrador que lo agregue.

### 3. Contraseña e inicio de sesión

- La contraseña que el usuario elige al registrarse **es la que usará siempre** para iniciar sesión.
- No hay enlace mágico ni correo de invitación: solo email + contraseña en **Iniciar sesión**.

### 4. Rol y nombre

- Al completar el registro, el sistema asigna automáticamente el **rol** y el **nombre** que el admin definió.
- Si en Supabase está activada la confirmación de email, el usuario confirma por correo y luego inicia sesión; en el primer acceso al dashboard se aplican igual el rol y el nombre desde la lista de pendientes.

## Tabla `usuarios_pendientes`

- El admin solo puede **agregar** y **ver** usuarios pendientes (RLS).
- Cuando el usuario se registra y se completa su perfil, ese registro se **elimina** de `usuarios_pendientes`.
- En la página de Usuarios, el admin ve la sección **Pendientes de registro** con los correos que aún no se registraron.

## APIs relacionadas

| Ruta | Uso |
|------|-----|
| `POST /api/usuarios/agregar` | Admin: agrega un usuario pendiente (email, nombre, rol, propietario_id). |
| `GET /api/usuarios/verificar-email?email=...` | Público: indica si el email está pendiente y devuelve el nombre. |
| `POST /api/usuarios/completar-registro` | Autenticado: aplica rol/nombre desde pendientes al perfil y borra el pendiente. |

La antigua invitación por email (`/api/usuarios/invite` con `inviteUserByEmail`) ya no se usa en este flujo.
