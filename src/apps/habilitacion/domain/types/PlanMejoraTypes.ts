/**
 * Estados posibles de un Plan de Mejora
 * Alineado con backend: mejoras/models/planMejora.py
 */

export type EstadoPlanMejora = 
  | 'PENDIENTE'    // Planificado pero no iniciado
  | 'EN_CURSO'     // Implementación en progreso
  | 'COMPLETADO'   // Completado exitosamente
  | 'VENCIDO';     // Fecha límite pasada sin completar

export type OrigenTipo = 
  | 'HABILITACION'  // Originado en Autoevaluación de Habilitación
  | 'AUDITORIA'     // Originado en Auditoría
  | 'INDICADOR';    // Originado en Indicador

export const ESTADO_PLAN_MEJORA_LABELS: Record<EstadoPlanMejora, string> = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En Curso',
  COMPLETADO: 'Completado',
  VENCIDO: 'Vencido',
};

export const ESTADO_PLAN_MEJORA_COLORS: Record<EstadoPlanMejora, string> = {
  PENDIENTE: '#9CA3AF',      // Gray
  EN_CURSO: '#3B82F6',       // Blue
  COMPLETADO: '#10B981',     // Green
  VENCIDO: '#EF4444',        // Red
};

export const ESTADO_PLAN_MEJORA_ICONS: Record<EstadoPlanMejora, string> = {
  PENDIENTE: 'scheduled',
  EN_CURSO: 'autorenew',
  COMPLETADO: 'task_alt',
  VENCIDO: 'schedule_X',
};

export const ORIGEN_TIPO_LABELS: Record<OrigenTipo, string> = {
  HABILITACION: 'Autoevaluación de Habilitación',
  AUDITORIA: 'Auditoría',
  INDICADOR: 'Indicador',
};

export const ORIGEN_TIPO_COLORS: Record<OrigenTipo, string> = {
  HABILITACION: '#7C3AED',  // Purple
  AUDITORIA: '#0891B2',     // Cyan
  INDICADOR: '#DC2626',     // Red
};

export const ORIGEN_TIPO_ICONS: Record<OrigenTipo, string> = {
  HABILITACION: 'assignment',
  AUDITORIA: 'fact_check',
  INDICADOR: 'trending_up',
};

/**
 * Obtiene información de visualización para un estado de plan
 */
export function getEstadoPlanMejoraInfo(estado: EstadoPlanMejora) {
  return {
    label: ESTADO_PLAN_MEJORA_LABELS[estado],
    color: ESTADO_PLAN_MEJORA_COLORS[estado],
    icon: ESTADO_PLAN_MEJORA_ICONS[estado],
  };
}

/**
 * Obtiene información de visualización para un origen
 */
export function getOrigenTipoInfo(origen: OrigenTipo) {
  return {
    label: ORIGEN_TIPO_LABELS[origen],
    color: ORIGEN_TIPO_COLORS[origen],
    icon: ORIGEN_TIPO_ICONS[origen],
  };
}

/**
 * Determina si un plan se considera próximo a vencer (30 días)
 */
export function esProximoAVencer(diasRestantes: number | null): boolean {
  if (diasRestantes === null) return false;
  return diasRestantes > 0 && diasRestantes <= 30;
}

/**
 * Determina si un plan está vencido
 */
export function estaVencido(diasRestantes: number | null, estado: EstadoPlanMejora): boolean {
  if (estado === 'COMPLETADO' || estado === 'VENCIDO') return false;
  if (diasRestantes === null) return false;
  return diasRestantes < 0;
}
