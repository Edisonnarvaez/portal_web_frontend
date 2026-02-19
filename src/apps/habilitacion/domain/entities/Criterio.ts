import type { EstadoCumplimiento } from '../types';

export interface Criterio {
  id: number;
  numero_criterio: string;
  descripcion: string;
  categoria?: string; // INFRAESTRUCTURA, RECURSO_HUMANO, PROCESOS, TECNOLOGIA, CALIDAD
  documento_referencia?: string;
  requisito_normativo: string;
  fecha_actualizacion: string;
}

export interface CriterioCreate {
  numero_criterio: string;
  descripcion: string;
  categoria?: string;
  documento_referencia?: string;
  requisito_normativo: string;
}

export interface CriterioUpdate extends Partial<CriterioCreate> {
  id: number;
}

export interface CriterioEvaluacion {
  id: number;
  criterio_id: number;
  autoevaluacion_id: number;
  estado_cumplimiento: EstadoCumplimiento;
  observaciones?: string;
  evidencia?: string;
  porcentaje_cumplimiento?: number;
  fecha_evaluacion: string;
}
