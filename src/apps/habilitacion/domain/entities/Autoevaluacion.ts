import type { EstadoAutoevaluacion } from '../types';
import type { Cumplimiento } from './Cumplimiento';

/** Resumen de planes de mejora y hallazgos vinculados a una autoevaluación */
export interface MejorasResumen {
  total_planes: number;
  planes_pendientes: number;
  planes_en_curso: number;
  planes_completados: number;
  total_hallazgos: number;
  hallazgos_abiertos: number;
  hallazgos_cerrados: number;
}

export interface Autoevaluacion {
  id: number;
  numero_autoevaluacion: string;
  prestador_codigo?: string;
  periodo: number;
  version: number;
  estado: EstadoAutoevaluacion;
  estado_display?: string;
  fecha_inicio: string;
  fecha_completacion?: string;
  fecha_vencimiento: string;
  porcentaje_cumplimiento?: number;
  vigente?: boolean;
  total_cumplimientos?: number;
  planes_mejora_count?: number;
  hallazgos_count?: number;
  mejoras_resumen?: MejorasResumen;
  cumplimientos_data?: Cumplimiento[];
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  datos_prestador?: {
    id: number;
    codigo_reps: string;
  };
  datos_prestador_detail?: {
    id: number;
    codigo_reps: string;
    company_name: string;
  };
  user?: {
    id: number;
    username: string;
  };
}

export interface AutoevaluacionCreate {
  datos_prestador_id: number;
  periodo: number;
  version?: number;
  estado?: EstadoAutoevaluacion;
  fecha_vencimiento: string;
  fecha_completacion?: string;
  observaciones?: string;
}

export interface AutoevaluacionUpdate extends Partial<AutoevaluacionCreate> {
  id: number;
}

export interface AutoevaluacionResumen {
  numero_autoevaluacion: string;
  periodo: number;
  estado: EstadoAutoevaluacion;
  porcentaje_cumplimiento: number;
  total_criterios: number;
  cumplidos: number;
  no_cumplidos: number;
  parcialmente_cumplidos: number;
  no_aplica: number;
  planes_mejora_pendientes: number;
  mejoras_vencidas: number;
}
