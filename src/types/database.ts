export type TipoPropiedad = "depto" | "casa" | "local";
export type EstadoPropiedad = "disponible" | "alquilada" | "en_mantenimiento";
export type EstadoContrato = "activo" | "finalizado" | "rescindido";
export type IncrementoTipo = "porcentaje" | "monto_fijo";
export type MetodoPago = "efectivo" | "transferencia" | "otro";
export type TipoAlerta =
  | "vencimiento_contrato"
  | "vencimiento_alquiler"
  | "pago_vencido"
  | "aumento"
  | "renovacion";
export type RolUsuario = "admin" | "operador" | "owner" | "viewer";

export interface Propietario {
  id: string;
  nombre: string;
  dni_cuit: string | null;
  contacto: string | null;
  datos_bancarios_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Inquilino {
  id: string;
  nombre: string;
  dni_cuit: string | null;
  email: string | null;
  telefono: string | null;
  garantes_json: unknown[];
  documentos_json: unknown[];
  created_at: string;
  updated_at: string;
}

export interface Propiedad {
  id: string;
  direccion: string;
  tipo: TipoPropiedad;
  m2: number | null;
  ambientes: number | null;
  propietario_id: string;
  estado: EstadoPropiedad;
  precio_actual: number | null;
  fotos_notas_json: Record<string, unknown>;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contrato {
  id: string;
  propiedad_id: string;
  inquilino_id: string;
  propietario_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  monto_mensual: number;
  dia_vencimiento: number;
  deposito: number | null;
  incremento_tipo: IncrementoTipo | null;
  incremento_valor: number | null;
  incremento_cada_meses: number | null;
  estado: EstadoContrato;
  created_at: string;
  updated_at: string;
}

export interface Pago {
  id: string;
  contrato_id: string;
  mes_adeudado: string;
  monto: number;
  fecha_pago: string | null;
  metodo: MetodoPago | null;
  recargo_mora: number | null;
  comprobante_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alerta {
  id: string;
  contrato_id: string;
  tipo: TipoAlerta;
  mensaje: string;
  leida: boolean;
  fecha_generada: string;
  enviada_email: boolean;
}

export interface Profile {
  id: string;
  rol: RolUsuario;
  propietario_id: string | null;
  nombre: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropiedadConRelaciones extends Propiedad {
  propietario?: Propietario | null;
}

export interface ContratoConRelaciones extends Contrato {
  propiedad?: Propiedad | null;
  inquilino?: Inquilino | null;
  propietario?: Propietario | null;
}

export interface PagoConContrato extends Pago {
  contrato?: ContratoConRelaciones | null;
}

export interface AlertaConContrato extends Alerta {
  contrato?: ContratoConRelaciones | null;
}
