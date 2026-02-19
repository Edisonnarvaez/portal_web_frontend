import type { EstadoAutoevaluacion } from '../types';

export interface Autoevaluacion {
  id: number;
  numero_autoevaluacion: string;
  periodo: number;
  version: number;
  estado: EstadoAutoevaluacion;
  fecha_inicio: string;
  fecha_completacion?: string;
  fecha_vencimiento: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  datos_prestador?: {
    id: number;
    codigo_reps: string;
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
  estado: EstadoAutoevaluacion;
  fecha_vencimiento: string;
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
