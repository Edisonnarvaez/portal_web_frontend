/**
 * Estados posibles de una Autoevaluación
 * Alineado con backend: habilitacion/models/autoevaluacion.py
 */

export type EstadoAutoevaluacion = 
  | 'BORRADOR'     // Autoevaluación en creación
  | 'EN_CURSO'     // En proceso de diligenciamiento
  | 'COMPLETADA'   // Completada por el usuario
  | 'REVISADA'     // Revisada por auditor
  | 'VALIDADA';    // Validada y aprobada

export const ESTADO_AUTOEVALUACION_LABELS: Record<EstadoAutoevaluacion, string> = {
  BORRADOR: 'Borrador',
  EN_CURSO: 'En Curso',
  COMPLETADA: 'Completada',
  REVISADA: 'Revisada por Auditor',
  VALIDADA: 'Validada',
};

export const ESTADO_AUTOEVALUACION_COLORS: Record<EstadoAutoevaluacion, string> = {
  BORRADOR: '#9CA3AF',      // Gray
  EN_CURSO: '#3B82F6',      // Blue
  COMPLETADA: '#8B5CF6',    // Purple
  REVISADA: '#F59E0B',      // Amber
  VALIDADA: '#10B981',      // Green
};

export const ESTADO_AUTOEVALUACION_ICONS: Record<EstadoAutoevaluacion, string> = {
  BORRADOR: 'draft',
  EN_CURSO: 'hourglass_top',
  COMPLETADA: 'task_alt',
  REVISADA: 'assignment_ind',
  VALIDADA: 'verified_user',
};

/**
 * Obtiene información de visualización para un estado
 */
export function getEstadoAutoevaluacionInfo(estado: EstadoAutoevaluacion) {
  return {
    label: ESTADO_AUTOEVALUACION_LABELS[estado],
    color: ESTADO_AUTOEVALUACION_COLORS[estado],
    icon: ESTADO_AUTOEVALUACION_ICONS[estado],
  };
}
