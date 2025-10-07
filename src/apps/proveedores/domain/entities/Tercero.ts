export interface Tercero {
  tercero_id?: number;
  tercero_tipo_documento: string;
  tercero_codigo: string;
  tercero_nombre_completo?: string;
  tercero_razon_social?: string;
  tercero_fecha_nacimiento?: string;
  tercero_direccion?: string;
  tercero_telefono?: string;
  tercero_email?: string;
  tercero_pais?: number;
  tercero_departamento?: number;
  tercero_municipio?: number;
  tercero_obligado_facturar?: boolean;
  tercero_proveedor?: boolean;
  tercero_tipo?: number;
  tercero_estado?: boolean;
}

export interface CreateTerceroRequest {
  tercero_tipo_documento: string;
  tercero_codigo: string;
  tercero_nombre_completo?: string;
  tercero_razon_social?: string;
  tercero_fecha_nacimiento?: string;
  tercero_direccion?: string;
  tercero_telefono?: string;
  tercero_email?: string;
  tercero_pais?: number;
  tercero_departamento?: number;
  tercero_municipio?: number;
  tercero_obligado_facturar?: boolean;
  tercero_proveedor?: boolean;
  tercero_tipo?: number;
  tercero_estado?: boolean;
}

export interface UpdateTerceroRequest extends CreateTerceroRequest {
  tercero_id: number;
}

// Entidades relacionadas
export interface Pais {
  id: number;
  nombre: string;
}

export interface Departamento {
  id: number;
  nombre: string;
  pais: number;
}

export interface Municipio {
  id: number;
  nombre: string;
  departamento: number;
}

export interface TipoTercero {
  id: number;
  nombre: string;
  descripcion?: string;
}

// Constantes para dropdowns
export const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'NIT', label: 'Número de Identificación Tributaria' },
  { value: 'OTRO', label: 'Otro' },
] as const;