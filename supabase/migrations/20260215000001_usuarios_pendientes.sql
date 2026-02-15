-- Usuarios pendientes de registro: el admin los da de alta (email, nombre, rol)
-- y luego cada uno se registra con su contraseña; esa será la de inicio de sesión.
CREATE TABLE public.usuarios_pendientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  nombre text,
  rol rol_usuario NOT NULL DEFAULT 'viewer',
  propietario_id uuid REFERENCES propietarios(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usuarios_pendientes ENABLE ROW LEVEL SECURITY;

-- Solo admin puede ver e insertar usuarios pendientes
CREATE POLICY "Admin can manage usuarios_pendientes" ON public.usuarios_pendientes
  FOR ALL USING (
    (SELECT role FROM public.current_user_profile() LIMIT 1) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.current_user_profile() LIMIT 1) = 'admin'
  );

-- Verificación de email para registro: endpoint público solo necesita saber si el email está pendiente (sin auth)
-- La API del servidor usará service role para leer por email cuando no haya sesión.
-- No añadimos política de SELECT para anon; la verificación se hace desde API route con service role.
