import type { EstadoHabilitacion, ClasePrestador } from '../types';

export interface DatosPrestador {
  id: number;
  codigo_reps: string;
  clase_prestador: ClasePrestador;
  clase_prestador_display?: string;
  estado_habilitacion: EstadoHabilitacion;
  estado_display?: string;
  fecha_inscripcion?: string;
  fecha_renovacion?: string;
  fecha_vencimiento_habilitacion?: string;
  proxima_vencer?: boolean;
  dias_vencimiento?: number;
  vencida?: boolean;
  aseguradora_pep?: string;
  numero_poliza?: string;
  vigencia_poliza?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  headquarters_id?: number;
  company_name?: string;
  usuario_responsable?: number;
  autoevaluaciones_count?: number;

  // Detail endpoint nested objects (field names match API: company_detail, headquarters_detail)
  company_detail?: {
    id: number;
    name: string;
    nit?: string;
  };
  headquarters_detail?: {
    id: number;
    name: string;
    habilitationCode?: string;
  };

  user?: {
    id: number;
    username: string;
  };
}

export interface DatosPrestadorCreate {
  headquarters_id: number;
  codigo_reps: string;
  clase_prestador: ClasePrestador;
  estado_habilitacion?: EstadoHabilitacion;
  fecha_inscripcion?: string;
  fecha_renovacion?: string;
  fecha_vencimiento_habilitacion?: string;
  aseguradora_pep?: string;
  numero_poliza?: string;
  vigencia_poliza?: string;
}

export interface DatosPrestadorUpdate extends Partial<DatosPrestadorCreate> {
  id: number;
}
