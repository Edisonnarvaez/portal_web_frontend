import type { EstadoCumplimiento } from '../types';

/**
 * Simplified reference to Estandar (used in relationships)
 * Use the full Estandar type from Estandar.ts for complete data
 */
export interface EstandarReference {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado?: boolean;
}

export interface Criterio {
  id: number;
  codigo: string;                               // Primary field from backend
  numero_criterio?: string;                     // Legacy alias for compatibility
  nombre: string;                               // From backend 'nombre'
  descripcion: string;
  estandar_id?: number;                         // FK to Estandar
  estandar?: EstandarReference;                 // Simplified Estandar reference object
  estandar_display?: string;                    // Display: "INF - Infraestructura Física"
  complejidad?: 'BAJA' | 'MEDIA' | 'ALTA';     // Engineering complexity
  complejidad_display?: string;                 // Display version
  aplica_todos?: boolean;                       // Applies to all IPS
  es_mandatorio?: boolean;                      // Mandatory requirement
  requiere_evidencia_documental?: boolean;      // Requires document evidence
  notas_interpretacion?: string;                // Interpretation notes
  estado?: boolean;                             // Active/inactive
  categoria?: string;                           // LEGACY: can be derived from estandar
  documento_referencia?: string;                // LEGACY
  requisito_normativo?: string;                 // LEGACY
  fecha_creacion?: string;
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
