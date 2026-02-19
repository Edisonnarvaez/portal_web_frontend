import type { EstadoHabilitacion, ClasePrestador } from '../types';

export interface DatosPrestador {
  id: number;
  codigo_reps: string;
  clase_prestador: ClasePrestador;
  estado_habilitacion: EstadoHabilitacion;
  fecha_inscripcion?: string;
  fecha_renovacion?: string;
  fecha_vencimiento_habilitacion?: string;
  aseguradora_pep?: string;
  numero_poliza?: string;
  vigencia_poliza?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  company?: {
    id: number;
    nombre: string;
  };
  user?: {
    id: number;
    username: string;
  };
  sede?: {
    id: number;
    nombre: string;
  };
}

export interface DatosPrestadorCreate {
  codigo_reps: string;
  clase_prestador: ClasePrestador;
  estado_habilitacion: EstadoHabilitacion;
  fecha_inscripcion?: string;
  fecha_renovacion?: string;
  fecha_vencimiento_habilitacion?: string;
  aseguradora_pep?: string;
  numero_poliza?: string;
  vigencia_poliza?: string;
  company_id: number;
  sede_id: number;
}

export interface DatosPrestadorUpdate extends Partial<DatosPrestadorCreate> {
  id: number;
}
