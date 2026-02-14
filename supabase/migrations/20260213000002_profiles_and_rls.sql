-- Profiles: extensión de auth.users para RBAC
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol rol_usuario NOT NULL DEFAULT 'viewer',
  propietario_id uuid REFERENCES propietarios(id) ON DELETE SET NULL,
  nombre text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger: crear profile al insertar usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, rol, nombre)
  VALUES (
    NEW.id,
    'viewer',
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS: habilitar en todas las tablas
ALTER TABLE propietarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquilinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper: obtener rol y propietario_id del usuario actual
CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS TABLE(role rol_usuario, prop_id uuid) AS $$
  SELECT p.rol, p.propietario_id FROM public.profiles p WHERE p.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Políticas PROFILES: solo el propio usuario puede leer/actualizar su profile (admin puede ver todos)
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin puede ver y actualizar cualquier profile (incl. rol)
-- Usar current_user_profile() (SECURITY DEFINER) para evitar recursión: no leer profiles desde una policy ON profiles
CREATE POLICY "Admin can manage all profiles" ON public.profiles
  FOR ALL USING (
    (SELECT role FROM public.current_user_profile() LIMIT 1) = 'admin'
  );

-- Políticas PROPIETARIOS
CREATE POLICY "Authenticated read propietarios" ON public.propietarios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/Operador insert propietarios" ON public.propietarios
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin/Operador update propietarios" ON public.propietarios
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin delete propietarios" ON public.propietarios
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas INQUILINOS
CREATE POLICY "Authenticated read inquilinos" ON public.inquilinos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/Operador insert inquilinos" ON public.inquilinos
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin/Operador update inquilinos" ON public.inquilinos
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin delete inquilinos" ON public.inquilinos
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas PROPIEDADES: owner solo ve las suyas
CREATE POLICY "Read propiedades" ON public.propiedades
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.rol IN ('admin', 'operador', 'viewer') OR (p.rol = 'owner' AND p.propietario_id = propiedades.propietario_id)))
  );

CREATE POLICY "Admin/Operador insert propiedades" ON public.propiedades
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin/Operador update propiedades" ON public.propiedades
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin delete propiedades" ON public.propiedades
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas CONTRATOS
CREATE POLICY "Read contratos" ON public.contratos
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.rol IN ('admin', 'operador', 'viewer') OR (p.rol = 'owner' AND p.propietario_id = contratos.propietario_id)))
  );

CREATE POLICY "Admin/Operador insert contratos" ON public.contratos
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin/Operador update contratos" ON public.contratos
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin delete contratos" ON public.contratos
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas PAGOS
CREATE POLICY "Read pagos" ON public.pagos
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p JOIN public.contratos c ON c.id = pagos.contrato_id
      WHERE p.id = auth.uid() AND (p.rol IN ('admin', 'operador', 'viewer') OR (p.rol = 'owner' AND p.propietario_id = c.propietario_id)))
  );

CREATE POLICY "Admin/Operador insert pagos" ON public.pagos
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin/Operador update pagos" ON public.pagos
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Admin delete pagos" ON public.pagos
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas ALERTAS
CREATE POLICY "Read alertas" ON public.alertas
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p JOIN public.contratos c ON c.id = alertas.contrato_id
      WHERE p.id = auth.uid() AND (p.rol IN ('admin', 'operador', 'viewer') OR (p.rol = 'owner' AND p.propietario_id = c.propietario_id)))
  );

CREATE POLICY "Admin/Operador insert alertas" ON public.alertas
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('admin', 'operador'))
  );

CREATE POLICY "Authenticated update alertas leida" ON public.alertas
  FOR UPDATE TO authenticated USING (true)
  WITH CHECK (true);

-- Service role puede hacer todo (para Edge Functions / cron)
-- Las políticas anteriores aplican al anon/authenticated key; service_role bypasea RLS por defecto.
