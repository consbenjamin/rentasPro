# Plantillas de email (Supabase Auth)

Para mejorar el aspecto del correo que reciben los usuarios al ser invitados (y otros correos de auth), puedes personalizar las plantillas en el **Dashboard de Supabase**:

**Authentication → Email Templates**

Añade la URL de tu app en **Redirect URLs** (Authentication → URL Configuration) si aún no está, por ejemplo:
`https://tu-dominio.com/auth/callback`

---

## Invite user (Invitación)

Cuando un admin invita a un usuario, Supabase envía este correo. Puedes usar la plantilla siguiente para un diseño más claro y profesional.

### Asunto (Subject)
```
Te han invitado a Rentas Pro
```

### Cuerpo (Body) – HTML

Copia y pega en el campo del template. Las variables `{{ .ConfirmationURL }}` y `{{ .Email }}` las sustituye Supabase.

```html
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1e293b;">
  <h1 style="color: #059669; font-size: 24px; margin-bottom: 8px;">Rentas Pro</h1>
  <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Gestión de alquileres para inmobiliarias</p>
  
  <p style="font-size: 16px; line-height: 1.5;">Hola,</p>
  <p style="font-size: 16px; line-height: 1.5;">Te han invitado a unirte a <strong>Rentas Pro</strong>. Haz clic en el botón para aceptar la invitación y elegir tu contraseña.</p>
  
  <p style="margin: 28px 0;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Aceptar invitación y crear contraseña</a>
  </p>
  
  <p style="font-size: 14px; color: #64748b;">Si no esperabas este correo, puedes ignorarlo. El enlace caduca en 24 horas.</p>
  
  <p style="font-size: 12px; color: #94a3b8; margin-top: 32px;">Rentas Pro – Sistema de gestión de alquileres</p>
</div>
```

### Versión solo texto (por si tu proyecto usa plantillas de texto)

```
Rentas Pro - Gestión de alquileres

Hola,

Te han invitado a unirte a Rentas Pro. Abre el siguiente enlace para aceptar la invitación y elegir tu contraseña:

{{ .ConfirmationURL }}

Si no esperabas este correo, puedes ignorarlo. El enlace caduca en 24 horas.

Rentas Pro
```

---

## Confirm signup (Confirmación de registro)

Para usuarios que se registran por su cuenta (página “Registrarse”).

### Asunto
```
Confirma tu cuenta en Rentas Pro
```

### Cuerpo HTML (opcional)

```html
<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1e293b;">
  <h1 style="color: #059669; font-size: 24px;">Rentas Pro</h1>
  <p style="font-size: 16px; line-height: 1.5;">Confirma tu correo haciendo clic en el enlace:</p>
  <p style="margin: 24px 0;"><a href="{{ .ConfirmationURL }}" style="color: #059669; font-weight: 600;">Confirmar mi cuenta</a></p>
  <p style="font-size: 14px; color: #64748b;">Si no creaste una cuenta, ignora este correo.</p>
</div>
```

---

## Magic Link (opcional)

Si en el futuro usas “Iniciar sesión con enlace por email”, puedes personalizar también la plantilla **Magic Link** con el mismo estilo (colores #059669, tipografía y mensaje breve).
