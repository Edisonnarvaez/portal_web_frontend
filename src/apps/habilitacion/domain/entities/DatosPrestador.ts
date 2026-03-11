import type { EstadoHabilitacionPrestador, ClasePrestador } from '../types';

export interface CompanyDetail {
  id: number;
  name: string;
  nit: string;
}

export interface HeadquartersDetail {
  id: number;
  name: string;
  habilitationCode: string;
}

/**
 * DatosPrestador - Información de habilitación de un prestador vinculado a una sede
 * Modela la respuesta del endpoint: /api/habilitacion/prestadores/{id}/
 * Representa un DatosPrestador del backend (relación OneToOne con Headquarters)
 */
export interface DatosPrestador {
  id: number;
  codigo_reps: string;
  company_detail: CompanyDetail;
  headquarters_detail: HeadquartersDetail;
  clase_prestador: ClasePrestador;
  clase_prestador_display: string;
  estado_habilitacion: EstadoHabilitacionPrestador;
  estado_display: string;
  fecha_inscripcion: string; // ISO date
  fecha_renovacion: string; // ISO date
  fecha_vencimiento_habilitacion: string; // ISO date
  dias_vencimiento: number; // Campo computado por el backend
  proxima_vencer: boolean; // Campo computado: próximo a vencer en 90 días
  vencida: boolean; // Campo computado
  aseguradora_pep?: string;
  numero_poliza?: string;
  vigencia_poliza?: string; // ISO date
  autoevaluaciones_count: number;
  fecha_creacion: string; // ISO datetime
  fecha_actualizacion: string; // ISO datetime
  usuario_responsable?: number;
}

export interface DatosPrestadorCreate {
  headquarters_id: number;
  codigo_reps: string;
  clase_prestador: ClasePrestador;
  estado_habilitacion?: EstadoHabilitacionPrestador;
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

export interface DatosPrestadorListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: DatosPrestador[];
}
