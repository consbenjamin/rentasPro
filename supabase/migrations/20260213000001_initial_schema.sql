-- Enums
CREATE TYPE tipo_propiedad AS ENUM ('depto', 'casa', 'local');
CREATE TYPE estado_propiedad AS ENUM ('disponible', 'alquilada', 'en_mantenimiento');
CREATE TYPE estado_contrato AS ENUM ('activo', 'finalizado', 'rescindido');
CREATE TYPE incremento_tipo AS ENUM ('porcentaje', 'monto_fijo');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'transferencia', 'otro');
CREATE TYPE tipo_alerta AS ENUM (
  'vencimiento_contrato',
  'vencimiento_alquiler',
  'pago_vencido',
  'aumento',
  'renovacion'
);
CREATE TYPE rol_usuario AS ENUM ('admin', 'operador', 'owner', 'viewer');

-- Propietarios (dueños)
CREATE TABLE propietarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  dni_cuit text,
  contacto text,
  datos_bancarios_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inquilinos
CREATE TABLE inquilinos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  dni_cuit text,
  email text,
  telefono text,
  garantes_json jsonb DEFAULT '[]',
  documentos_json jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Propiedades
CREATE TABLE propiedades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direccion text NOT NULL,
  tipo tipo_propiedad NOT NULL DEFAULT 'depto',
  m2 numeric(10,2),
  ambientes int,
  propietario_id uuid NOT NULL REFERENCES propietarios(id) ON DELETE RESTRICT,
  estado estado_propiedad NOT NULL DEFAULT 'disponible',
  precio_actual numeric(12,2),
  fotos_notas_json jsonb DEFAULT '{}',
  notas text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contratos
CREATE TABLE contratos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id uuid NOT NULL REFERENCES propiedades(id) ON DELETE RESTRICT,
  inquilino_id uuid NOT NULL REFERENCES inquilinos(id) ON DELETE RESTRICT,
  propietario_id uuid NOT NULL REFERENCES propietarios(id) ON DELETE RESTRICT,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  monto_mensual numeric(12,2) NOT NULL,
  dia_vencimiento int NOT NULL CHECK (dia_vencimiento >= 1 AND dia_vencimiento <= 28),
  deposito numeric(12,2) DEFAULT 0,
  incremento_tipo incremento_tipo,
  incremento_valor numeric(12,2),
  incremento_cada_meses int,
  estado estado_contrato NOT NULL DEFAULT 'activo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pagos
CREATE TABLE pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  mes_adeudado date NOT NULL,
  monto numeric(12,2) NOT NULL,
  fecha_pago date,
  metodo metodo_pago,
  recargo_mora numeric(12,2) DEFAULT 0,
  comprobante_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(contrato_id, mes_adeudado)
);

-- Alertas
CREATE TABLE alertas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  tipo tipo_alerta NOT NULL,
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  fecha_generada timestamptz DEFAULT now(),
  enviada_email boolean DEFAULT false
);

-- Índices
CREATE INDEX idx_propiedades_propietario ON propiedades(propietario_id);
CREATE INDEX idx_propiedades_estado ON propiedades(estado);
CREATE INDEX idx_contratos_propiedad ON contratos(propiedad_id);
CREATE INDEX idx_contratos_inquilino ON contratos(inquilino_id);
CREATE INDEX idx_contratos_propietario ON contratos(propietario_id);
CREATE INDEX idx_contratos_estado ON contratos(estado);
CREATE INDEX idx_contratos_fecha_fin ON contratos(fecha_fin);
CREATE INDEX idx_pagos_contrato ON pagos(contrato_id);
CREATE INDEX idx_pagos_mes ON pagos(mes_adeudado);
CREATE INDEX idx_alertas_contrato ON alertas(contrato_id);
CREATE INDEX idx_alertas_leida ON alertas(leida);
