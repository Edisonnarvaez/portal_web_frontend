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
  estandar?: EstandarReference | number;        // Can arrive nested object or numeric ID
  estandar_display?: string;                    // Display: "INF - Infraestructura Física"
  complejidad?: 'BAJA' | 'MEDIA' | 'ALTA';     // Engineering complexity
  complejidad_display?: string;                 // Display version
  aplica_todos?: boolean;                       // Applies to all IPS
  es_mandatorio?: boolean;                      // Mandatory requirement
  requiere_evidencia_documental?: boolean;      // Requires document evidence
  requiere_documento?: boolean;                 // Requires quality document attachment
  requiere_soporte?: boolean;                   // Requires normative support attachment
  notas_interpretacion?: string;                // Interpretation notes
  estado?: boolean;                             // Active/inactive
  categoria?: string;                           // LEGACY: can be derived from estandar
  documento_referencia?: string;                // LEGACY
  requisito_normativo?: string;                 // LEGACY
  fecha_creacion?: string;
  fecha_actualizacion: string;
}

export interface CriterioCreate {
  codigo: string;                               // Primary identifier code (e.g., INF-001)
  nombre: string;                               // Short title/name
  descripcion: string;                          // Full description
  complejidad?: 'BAJA' | 'MEDIA' | 'ALTA';     // Complexity level
  es_mandatorio?: boolean;                      // Mandatory requirement flag
  requiere_evidencia_documental?: boolean;      // Requires documentation
  requiere_documento?: boolean;                 // Requires quality document attachment
  requiere_soporte?: boolean;                   // Requires normative support attachment
  notas_interpretacion?: string;                // Interpretation notes
  estandar_id?: number;                         // Optional reference to Estandar
  aplica_todos?: boolean;                       // Whether it applies to all IPS
  // Legacy fields for backward compatibility
  numero_criterio?: string;                     // Deprecated, use codigo instead
  categoria?: string;                           // Deprecated
  documento_referencia?: string;                // Deprecated
  requisito_normativo?: string;                 // Deprecated
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

export interface CriterioEvaluacionCreate {
  criterio_id: number;
  autoevaluacion_id: number;
  estado_cumplimiento: EstadoCumplimiento;
  observaciones?: string;
  evidencia?: string;
  porcentaje_cumplimiento?: number;
}

export interface CriterioEvaluacionUpdate extends Partial<CriterioEvaluacionCreate> {
  id: number;
}
